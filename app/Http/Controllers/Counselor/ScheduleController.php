<?php

namespace App\Http\Controllers\Counselor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Booking;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Notification;

// --- IMPORT NOTIFIKASI ---
use App\Notifications\RescheduleRequested;
use App\Notifications\BookingStatusUpdated; // <-- Tambahkan ini untuk notifikasi 'Selesai'

class ScheduleController extends Controller
{
    /**
     * Mengambil semua jadwal (Akan Datang) untuk konselor yang login.
     * [MODIFIKASI] Menambahkan fitur Pencarian
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $search = $request->query('search'); // Ambil parameter pencarian

        $upcomingStatuses = [
            'Dijadwalkan',
            'Aktif',
            'Proses',
            'Menunggu Konfirmasi',
            'Menunggu Konfirmasi Customer' // Tambahkan status ini agar jadwal reschedule muncul
        ];

        $query = Booking::where('konselor_id', $user->id)
            ->whereIn('status_pesanan', $upcomingStatuses)
            ->where('tanggal_konsultasi', '>=', now()->toDateString());

        // --- LOGIKA PENCARIAN ---
        if ($search) {
            $query->where(function ($q) use ($search) {
                // Cari berdasarkan Nama Customer
                $q->whereHas('customer', function ($subQ) use ($search) {
                    $subQ->where('name', 'like', "%{$search}%");
                })
                    // ATAU Cari berdasarkan ID Pesanan
                    ->orWhere('id', 'like', "%{$search}%");
            });
        }
        // ------------------------

        $schedules = $query->with([
            'customer:id,name,avatar',
            'durasiKonseling:id,durasi_menit'
        ])
            ->orderBy('tanggal_konsultasi', 'asc')
            ->orderBy('jam_konsultasi', 'asc')
            ->get();

        return response()->json($schedules);
    }

    /**
     * Menampilkan detail spesifik dari satu booking.
     */
    public function show(Request $request, Booking $booking)
    {
        $user = Auth::user();

        if ($booking->konselor_id !== $user->id) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $booking->load([
            'customer:id,name,avatar,phone',
            'durasiKonseling:id,durasi_menit',
            'jenisKonseling:id,jenis_konseling'
        ]);

        return response()->json($booking);
    }

    /**
     * Menandai sesi booking sebagai 'Selesai'.
     */
    public function completeSession(Request $request, Booking $booking)
    {
        $user = Auth::user();

        if ($booking->konselor_id !== $user->id) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $validStatusToComplete = ['Dijadwalkan', 'Aktif', 'Proses', 'Menunggu Konfirmasi'];
        if (!in_array($booking->status_pesanan, $validStatusToComplete)) {
            return response()->json(['message' => 'Sesi ini tidak dapat diselesaikan (mungkin sudah selesai/dibatalkan).'], 409);
        }

        try {
            $booking->status_pesanan = 'Selesai';
            $booking->save();

            // --- [MODIFIKASI] KIRIM NOTIFIKASI KE CUSTOMER ---
            try {
                $booking->customer->notify(new BookingStatusUpdated($booking));
            } catch (\Exception $e) {
                Log::error('Gagal kirim notif selesai: ' . $e->getMessage());
            }
            // ------------------------------------------------

            Log::info('Sesi Selesai (oleh Konselor):', ['booking_id' => $booking->id]);

            return response()->json([
                'message' => 'Sesi berhasil ditandai sebagai Selesai.',
                'booking' => $booking->fresh()->load([
                    'customer:id,name,avatar,phone',
                    'durasiKonseling',
                    'jenisKonseling'
                ])
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal menyelesaikan sesi:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menyelesaikan sesi.'], 500);
        }
    }

    /**
     * MENGAJUKAN jadwal ulang booking oleh Konselor.
     * POST /api/counselor/booking/{booking}/reschedule
     */
    public function reschedule(Request $request, Booking $booking)
    {
        $user = Auth::user();

        if ($booking->konselor_id !== $user->id) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $nonReschedulableStatus = ['Selesai', 'Batal', 'DIBATALKAN', 'DITOLAK', 'SELESAI'];
        if (in_array($booking->status_pesanan, $nonReschedulableStatus)) {
            return response()->json([
                'message' => 'Sesi dengan status ini tidak dapat dijadwal ulang.'
            ], 422);
        }

        // Cek apakah sudah ada pengajuan
        if ($booking->status_pesanan === 'Menunggu Konfirmasi Customer') {
            return response()->json([
                'message' => 'Sudah ada pengajuan jadwal ulang yang menunggu konfirmasi customer.'
            ], 409);
        }

        $validator = Validator::make($request->all(), [
            'tanggal_konsultasi' => 'required|date|after_or_equal:today',
            // Gunakan format H:i agar sesuai dengan frontend input type="time"
            'jam_konsultasi' => 'required|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Data tidak valid.', 'errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();

        try {
            // Update booking dengan JADWAL YANG DIAJUKAN (PROPOSED)
            $booking->update([
                'proposed_date' => $validated['tanggal_konsultasi'],
                'proposed_time' => $validated['jam_konsultasi'],
                'status_pesanan' => 'Menunggu Konfirmasi Customer',
            ]);

            // Kirim notifikasi ke CUSTOMER
            $booking->load('customer');

            // --- [MODIFIKASI] Gunakan notify() standar ---
            try {
                $booking->customer->notify(new RescheduleRequested($booking));
            } catch (\Exception $e) {
                Log::error('Gagal kirim notif reschedule ke customer: ' . $e->getMessage());
            }
            // ---------------------------------------------

            Log::info('Pengajuan reschedule oleh konselor:', ['booking_id' => $booking->id]);

            return response()->json([
                'message' => 'Pengajuan jadwal ulang telah dikirim ke customer.',
                'booking' => $booking->fresh()->load([
                    'customer:id,name,avatar,phone',
                    'durasiKonseling',
                    'jenisKonseling'
                ])
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal mengajukan reschedule oleh konselor:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan saat mengajukan jadwal ulang.'], 500);
        }
    }
}
