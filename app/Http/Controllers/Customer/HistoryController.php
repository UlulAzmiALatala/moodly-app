<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Notification;
use App\Models\Booking;
use App\Models\Refund;
use App\Models\User;

use App\Events\BookingCancelled;
use App\Events\RescheduleRequested as RescheduleRequestedEvent;

use App\Notifications\BookingStatusUpdated;
use App\Notifications\RescheduleRequested;
use App\Notifications\NewRatingReceived;
use App\Notifications\RescheduleResponse;
use App\Notifications\RefundRequested;

class HistoryController extends Controller
{
    private const ADMIN_FEE_PERCENTAGE = 0.20;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $statusFilter = $request->query('status', 'upcoming');
        $search = $request->query('search');

        $query = Booking::where('customer_id', $user->id);

        if ($search) {
            $query->where('id', 'like', "%{$search}%");
        }

        $query->when($statusFilter == 'upcoming', function ($q) {
            $q->whereIn('status_pesanan', ['Dijadwalkan', 'DISETUJUI', 'Menunggu Konfirmasi Customer', 'MENUNGGU_KONFIRMASI_JADWAL']);
        });

        $query->when($statusFilter == 'canceled', function ($q) {
            $q->whereIn('status_pesanan', ['DIBATALKAN', 'DITOLAK', 'Dibatalkan']);
        });

        $query->when($statusFilter == 'unpaid', function ($q) {
            $q->whereIn('status_pesanan', [
                'Menunggu Pembayaran',
                'Menunggu Verifikasi',
                'MENUNGGU_PEMBAYARAN',
                'MENUNGGU_VERIFIKASI_PEMBAYARAN',
                'Pembayaran Ditolak'
            ]);
        });

        $query->when($statusFilter == 'completed', function ($q) {
            $q->whereIn('status_pesanan', ['SELESAI', 'Selesai']);
        });

        $bookings = $query->with([
            'konselor',
            'jenisKonseling:id,jenis_konseling,image',
            'durasiKonseling:id,durasi_menit',
            'tempatKonseling:id,nama_tempat,image'
        ])
            ->orderBy('tanggal_konsultasi', 'desc')
            ->orderBy('jam_konsultasi', 'desc')
            ->paginate(10);

        $bookings->getCollection()->transform(function ($booking) {
            if ($booking->konselor) {
                $booking->konselor->setAttribute('spesialisasi_teks', $booking->konselor->spesialisasi_label);
                $booking->konselor->spesialisasi = $booking->konselor->spesialisasi_label;
            }
            return $booking;
        });

        return response()->json($bookings);
    }

    public function show(Booking $booking): JsonResponse
    {
        if (Auth::id() !== $booking->customer_id) {
            return response()->json(['message' => 'Tidak diizinkan mengakses sumber daya ini.'], 403);
        }

        $booking->load([
            'konselor',
            'customer',
            'jenisKonseling',
            'durasiKonseling',
            'tempatKonseling',
            'refund'
        ]);

        if ($booking->konselor) {
            $booking->konselor->spesialisasi = $booking->konselor->spesialisasi_label;
        }

        return response()->json($booking);
    }

    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        if (Auth::id() !== $booking->customer_id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        $nonCancelableStatuses = ['Selesai', 'SELESAI', 'Dibatalkan', 'DIBATALKAN', 'DITOLAK'];
        if (in_array($booking->status_pesanan, $nonCancelableStatuses)) {
            return response()->json(['message' => 'Booking dengan status ini tidak dapat dibatalkan.'], 422);
        }

        $nonRefundableStatuses = ['Menunggu Pembayaran', 'Menunggu Verifikasi', 'MENUNGGU_PEMBAYARAN', 'MENUNGGU_VERIFIKASI_PEMBAYARAN', 'Pembayaran Ditolak'];
        $isRefundable = !in_array($booking->status_pesanan, $nonRefundableStatuses);

        $validator = Validator::make($request->all(), [
            'alasan' => 'required|string|max:255',
            'catatan' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Alasan pembatalan wajib diisi.', 'errors' => $validator->errors()], 422);
        }
        $validated = $validator->validated();

        $admin_fee = 0;
        $refund_amount = 0;

        if ($isRefundable) {
            $admin_fee = $booking->total_harga * self::ADMIN_FEE_PERCENTAGE;
            $refund_amount = $booking->total_harga - $admin_fee;
        }

        try {
            $booking->update([
                'status_pesanan' => 'Dibatalkan',
                'alasan_pembatalan' => $validated['alasan'],
                'catatan_pembatalan' => $validated['catatan'] ?? null,
                'admin_fee' => $admin_fee,
                'refund_amount' => $refund_amount,
            ]);

            try {
                $booking->customer->notify(new BookingStatusUpdated($booking));

                if ($booking->konselor) {
                    $booking->konselor->notify(new BookingStatusUpdated($booking));
                }

                Log::info("Mengirim event pembatalan untuk booking ID: " . $booking->id);
                broadcast(new BookingCancelled($booking));
            } catch (\Exception $e) {
                Log::error("Gagal broadcast/notify cancel: " . $e->getMessage());
            }

            return response()->json([
                'message' => 'Booking telah berhasil dibatalkan.',
                'booking' => $booking->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal membatalkan booking:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan saat membatalkan booking.'], 500);
        }
    }

    public function reschedule(Request $request, Booking $booking): JsonResponse
    {
        if (Auth::id() !== $booking->customer_id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        if (in_array($booking->status_pesanan, ['SELESAI', 'DIBATALKAN', 'Selesai', 'Dibatalkan'])) {
            return response()->json(['message' => 'Booking dengan status ini tidak dapat dijadwal ulang.'], 422);
        }

        $validated = $request->validate([
            'tanggal_konsultasi' => 'required|date|after_or_equal:today',
            'jam_konsultasi' => 'required|date_format:H:i',
        ]);

        try {
            $booking->tanggal_konsultasi = $validated['tanggal_konsultasi'];
            $booking->jam_konsultasi = $validated['jam_konsultasi'];
            $booking->status_pesanan = 'MENUNGGU_KONFIRMASI_JADWAL';
            $booking->save();

            try {
                $booking->customer->notify(new BookingStatusUpdated($booking));

                if ($booking->konselor) {
                    $booking->konselor->notify(new RescheduleRequested($booking));
                }

                Log::info("Mengirim notifikasi reschedule untuk booking ID: " . $booking->id);
                broadcast(new RescheduleRequestedEvent($booking));
            } catch (\Exception $e) {
                Log::error("Gagal broadcast reschedule: " . $e->getMessage());
            }

            return response()->json([
                'message' => 'Booking telah berhasil dijadwal ulang. Menunggu konfirmasi dari admin/konselor.',
                'booking' => $booking->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal reschedule:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menjadwal ulang.'], 500);
        }
    }

    public function storeRating(Request $request, Booking $booking): JsonResponse
    {
        if (Auth::id() !== $booking->customer_id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        if (!in_array($booking->status_pesanan, ['Selesai', 'SELESAI'])) {
            return response()->json(['message' => 'Hanya sesi yang sudah selesai yang bisa diberi ulasan.'], 403);
        }

        if ($booking->rating !== null) {
            return response()->json(['message' => 'Sesi ini sudah pernah Anda beri ulasan.'], 409);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $validated = $validator->validated();

        try {
            $booking->update([
                'rating' => $validated['rating'],
                'ulasan_customer' => $validated['review'],
            ]);

            try {
                if ($booking->konselor) {
                    $booking->konselor->notify(new NewRatingReceived($booking));
                    Log::info("Notifikasi rating terkirim ke Konselor ID: " . $booking->konselor_id);
                }
            } catch (\Exception $notifError) {
                Log::error("Gagal kirim notif rating: " . $notifError->getMessage());
            }

            return response()->json([
                'message' => 'Ulasan Anda berhasil disimpan. Terima kasih!',
                'booking' => $booking->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal menyimpan rating:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menyimpan ulasan.'], 500);
        }
    }

    public function approveReschedule(Request $request, Booking $booking): JsonResponse
    {
        if (Auth::id() !== $booking->customer_id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        if ($booking->status_pesanan !== 'Menunggu Konfirmasi Customer') {
            return response()->json(['message' => 'Tidak ada pengajuan jadwal ulang yang valid.'], 422);
        }

        try {
            $booking->update([
                'tanggal_konsultasi' => $booking->proposed_date,
                'jam_konsultasi' => $booking->proposed_time,
                'status_pesanan' => 'Dijadwalkan',
                'proposed_date' => null,
                'proposed_time' => null,
            ]);

            if ($booking->konselor) {
                $booking->konselor->notify(new RescheduleResponse($booking, 'approved'));
                Log::info("Notifikasi Reschedule Approved dikirim ke Konselor ID: " . $booking->konselor_id);
            }

            return response()->json([
                'message' => 'Jadwal baru berhasil dikonfirmasi!',
                'booking' => $booking->fresh(),
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal approve reschedule:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan saat konfirmasi jadwal.'], 500);
        }
    }

    public function rejectReschedule(Request $request, Booking $booking): JsonResponse
    {
        if (Auth::id() !== $booking->customer_id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        if ($booking->status_pesanan !== 'Menunggu Konfirmasi Customer') {
            return response()->json(['message' => 'Tidak ada pengajuan jadwal ulang.'], 422);
        }

        try {
            $booking->update([
                'status_pesanan' => 'Dijadwalkan',
                'proposed_date' => null,
                'proposed_time' => null,
            ]);

            if ($booking->konselor) {
                $booking->konselor->notify(new RescheduleResponse($booking, 'rejected'));
                Log::info("Notifikasi Reschedule Rejected dikirim ke Konselor ID: " . $booking->konselor_id);
            }

            return response()->json([
                'message' => 'Pengajuan jadwal ulang telah ditolak. Jadwal kembali seperti semula.',
                'booking' => $booking->fresh(),
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal reject reschedule:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan saat menolak jadwal.'], 500);
        }
    }

    public function storeRefundRequest(Request $request, Booking $booking): JsonResponse
    {
        $user = Auth::user();
        if ($user->id !== $booking->customer_id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }
        if ($booking->status_pesanan !== 'Dibatalkan' || $booking->refund_amount <= 0) {
            return response()->json(['message' => 'Invalid refund request'], 422);
        }

        if (Refund::where('booking_id', $booking->id)->exists()) {
            return response()->json(['message' => 'Refund sudah diajukan'], 409);
        }

        $validator = Validator::make($request->all(), [
            'nama_pemilik_rekening' => 'required|string|max:255',
            'nama_bank' => 'required|string|max:255',
            'nomor_rekening' => 'required|string|max:50',
            'keterangan_customer' => 'nullable|string|max:1000',
            'bukti_refund_customer' => 'nullable|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $validated = $validator->validated();

        $imagePath = $request->hasFile('bukti_refund_customer') ? $request->file('bukti_refund_customer')->store('refund_proofs_customer', 'public') : null;

        try {
            $refund = Refund::create([
                'booking_id' => $booking->id,
                'customer_id' => $user->id,
                'nama_pemilik_rekening' => $validated['nama_pemilik_rekening'],
                'nama_bank' => $validated['nama_bank'],
                'nomor_rekening' => $validated['nomor_rekening'],
                'keterangan_customer' => $validated['keterangan_customer'] ?? null,
                'bukti_refund_customer' => $imagePath,
                'total_bayar' => $booking->total_harga,
                'potongan_admin' => $booking->admin_fee,
                'jumlah_refund' => $booking->refund_amount,
                'status' => 'Menunggu Proses',
            ]);

            // Kirim Notifikasi ke Admin (Database & Broadcast)
            $admins = User::whereIn('role', ['admin', 'super-admin'])->get();
            Notification::send($admins, new RefundRequested($refund));

            return response()->json(['message' => 'Refund diajukan.', 'refund' => $refund], 201);
        } catch (\Exception $e) {
            Log::error('Gagal submit refund:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal mengajukan refund.'], 500);
        }
    }
}
