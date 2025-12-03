<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\Booking;
use App\Models\Refund;
use Illuminate\Support\Facades\Validator;

// --- IMPORT EVENTS ---
use App\Events\BookingCancelled;
use App\Events\RescheduleRequested as RescheduleRequestedEvent;

// --- [MODIFIKASI] IMPORT NOTIFICATIONS ---
use App\Notifications\BookingStatusUpdated;
use App\Notifications\RescheduleRequested;
use App\Notifications\NewRatingReceived;

class HistoryController extends Controller
{
    // Konstanta potongan admin 20%
    private const ADMIN_FEE_PERCENTAGE = 0.20;

    /**
     * Menampilkan daftar riwayat booking.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Ambil Parameter
        $statusFilter = $request->query('status', 'upcoming');
        $search = $request->query('search'); // <--- Tangkap parameter search

        // 2. Query Dasar
        $query = Booking::where('customer_id', $user->id);

        // 3. LOGIKA PENCARIAN
        if ($search) {
            // Filter berdasarkan ID Booking
            $query->where('id', 'like', "%{$search}%");
        }

        // 4. Filter Status
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

        // 5. Load Relasi & Urutkan
        $bookings = $query->with([
            'konselor:id,name,avatar',
            'jenisKonseling:id,jenis_konseling,image',
            'durasiKonseling:id,durasi_menit',
            'tempatKonseling:id,nama_tempat,image'
        ])
            ->orderBy('tanggal_konsultasi', 'desc')
            ->orderBy('jam_konsultasi', 'desc')
            ->paginate(10);

        return response()->json($bookings);
    }

    /**
     * Detail Booking.
     */
    public function show(Booking $booking): JsonResponse
    {
        if (Auth::id() !== $booking->customer_id) {
            return response()->json(['message' => 'Tidak diizinkan mengakses sumber daya ini.'], 403);
        }

        $booking->load([
            'konselor' => function ($query) {
                $query->select('id', 'name', 'email', 'phone', 'avatar', 'spesialisasi');
            },
            'customer',
            'jenisKonseling',
            'durasiKonseling',
            'tempatKonseling',
            'refund'
        ]);

        return response()->json($booking);
    }

    /**
     * Membatalkan booking & Hitung Refund.
     */
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

            // --- [MODIFIKASI] KIRIM NOTIFIKASI ---
            try {
                // 1. Notif ke Customer (Diri Sendiri) - Agar masuk history
                $booking->customer->notify(new BookingStatusUpdated($booking));

                // 2. Notif ke Konselor - Agar tahu customer membatalkan
                if ($booking->konselor) {
                    $booking->konselor->notify(new BookingStatusUpdated($booking));
                }

                // 3. Broadcast Event (Untuk update real-time dashboard)
                Log::info("Mengirim event pembatalan untuk booking ID: " . $booking->id);
                broadcast(new BookingCancelled($booking));
            } catch (\Exception $e) {
                Log::error("Gagal broadcast/notify cancel: " . $e->getMessage());
            }
            // -------------------------------------

            return response()->json([
                'message' => 'Booking telah berhasil dibatalkan.',
                'booking' => $booking->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal membatalkan booking:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan saat membatalkan booking.'], 500);
        }
    }

    /**
     * Menjadwal ulang booking (Inisiatif Customer).
     */
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
            // Update jadwal langsung dan ubah status
            $booking->tanggal_konsultasi = $validated['tanggal_konsultasi'];
            $booking->jam_konsultasi = $validated['jam_konsultasi'];
            $booking->status_pesanan = 'MENUNGGU_KONFIRMASI_JADWAL';
            $booking->save();

            // --- [MODIFIKASI] KIRIM NOTIFIKASI ---
            try {
                // 1. Notif ke Customer (Konfirmasi pengajuan terkirim)
                $booking->customer->notify(new BookingStatusUpdated($booking));

                // 2. Notif ke Konselor (Meminta Approval)
                if ($booking->konselor) {
                    // Gunakan RescheduleRequested agar konselor dapat pesan "Customer mengajukan..."
                    $booking->konselor->notify(new RescheduleRequested($booking));
                }

                Log::info("Mengirim notifikasi reschedule untuk booking ID: " . $booking->id);
                broadcast(new RescheduleRequestedEvent($booking));
            } catch (\Exception $e) {
                Log::error("Gagal broadcast reschedule: " . $e->getMessage());
            }
            // -------------------------------------

            return response()->json([
                'message' => 'Booking telah berhasil dijadwal ulang. Menunggu konfirmasi dari admin/konselor.',
                'booking' => $booking->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal reschedule:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menjadwal ulang.'], 500);
        }
    }

    /**
     * Simpan Rating dan Kirim Notifikasi ke Konselor.
     */
    public function storeRating(Request $request, Booking $booking): JsonResponse
    {
        // 1. Validasi Kepemilikan
        if (Auth::id() !== $booking->customer_id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        // 2. Validasi Status Selesai
        if (!in_array($booking->status_pesanan, ['Selesai', 'SELESAI'])) {
            return response()->json(['message' => 'Hanya sesi yang sudah selesai yang bisa diberi ulasan.'], 403);
        }

        // 3. Cek apakah sudah pernah rating
        if ($booking->rating !== null) {
            return response()->json(['message' => 'Sesi ini sudah pernah Anda beri ulasan.'], 409);
        }

        // 4. Validasi Input
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $validated = $validator->validated();

        try {
            // 5. Update Data Booking
            $booking->update([
                'rating' => $validated['rating'],
                'ulasan_customer' => $validated['review'],
            ]);

            // 6. [BARU] Kirim Notifikasi ke Konselor
            // Kita bungkus try-catch agar error notifikasi tidak menggagalkan penyimpanan rating
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
    /**
     * Approve Reschedule (Dari Konselor).
     */
    public function approveReschedule(Booking $booking): JsonResponse
    {
        if (Auth::id() !== $booking->customer_id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        if ($booking->status_pesanan !== 'Menunggu Konfirmasi Customer' || !$booking->proposed_date || !$booking->proposed_time) {
            return response()->json(['message' => 'Tidak ada pengajuan jadwal ulang yang valid.'], 422);
        }

        try {
            $newDate = $booking->proposed_date;
            $newTime = $booking->proposed_time;

            $booking->update([
                'tanggal_konsultasi' => $newDate,
                'jam_konsultasi' => $newTime,
                'status_pesanan' => 'Dijadwalkan',
                'proposed_date' => null,
                'proposed_time' => null,
            ]);

            // [OPSIONAL] Kirim notifikasi ke Konselor bahwa Customer setuju
            // $booking->konselor->notify(new BookingStatusUpdated($booking));

            return response()->json([
                'message' => 'Jadwal baru berhasil dikonfirmasi!',
                'booking' => $booking->fresh(),
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal approve reschedule:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan saat konfirmasi jadwal.'], 500);
        }
    }

    /**
     * Reject Reschedule (Dari Konselor).
     */
    public function rejectReschedule(Booking $booking): JsonResponse
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

            return response()->json([
                'message' => 'Pengajuan jadwal ulang telah ditolak. Jadwal kembali seperti semula.',
                'booking' => $booking->fresh(),
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal reject reschedule:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan saat menolak jadwal.'], 500);
        }
    }

    /**
     * Submit Pengajuan Refund.
     */
    public function storeRefundRequest(Request $request, Booking $booking): JsonResponse
    {
        $user = Auth::user();

        if ($user->id !== $booking->customer_id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        if ($booking->status_pesanan !== 'Dibatalkan' || $booking->refund_amount <= 0) {
            return response()->json(['message' => 'Booking ini tidak valid untuk pengajuan refund.'], 422);
        }

        $existingRefund = Refund::where('booking_id', $booking->id)->first();
        if ($existingRefund) {
            return response()->json(['message' => 'Anda sudah pernah mengajukan refund untuk booking ini.'], 409);
        }

        $validator = Validator::make($request->all(), [
            'nama_pemilik_rekening' => 'required|string|max:255',
            'nama_bank' => 'required|string|max:255',
            'nomor_rekening' => 'required|string|max:50',
            'keterangan_customer' => 'nullable|string|max:1000',
            'bukti_refund_customer' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $validated = $validator->validated();

        $imagePath = null;
        if ($request->hasFile('bukti_refund_customer')) {
            $imagePath = $request->file('bukti_refund_customer')->store('refund_proofs_customer', 'public');
        }

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

            // Opsional: Jika nanti mau ada notifikasi refund masuk ke admin juga
            // broadcast(new RefundRequested($refund)); 

            Log::info('Pengajuan refund berhasil dibuat:', ['refund_id' => $refund->id, 'booking_id' => $booking->id]);

            return response()->json([
                'message' => 'Pengajuan refund Anda telah berhasil dikirim dan akan segera diproses.',
                'refund' => $refund
            ], 201);
        } catch (\Exception $e) {
            Log::error('Gagal menyimpan pengajuan refund:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan internal saat menyimpan pengajuan.'], 500);
        }
    }
}
