<?php

namespace App\Http\Controllers\Counselor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Booking;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;

class ScheduleController extends Controller
{
    /**
     * Mengambil semua jadwal (Akan Datang) untuk konselor yang login.
     * GET /api/counselor/schedules
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $upcomingStatuses = [
            'Dijadwalkan',
            'Aktif',
            'Proses',
            'Menunggu Konfirmasi'
        ];

        $schedules = Booking::where('konselor_id', $user->id)
            ->whereIn('status_pesanan', $upcomingStatuses)
            ->where('tanggal_konsultasi', '>=', now()->toDateString())
            ->with([
                // --- PERBAIKAN: Minta 'avatar' agar 'avatar_url' berfungsi ---
                'customer:id,name,avatar',
                // --- AKHIR PERBAIKAN ---
                'durasiKonseling:id,durasi_menit'
            ])
            ->orderBy('tanggal_konsultasi', 'asc')
            ->orderBy('jam_konsultasi', 'asc')
            ->get();

        return response()->json($schedules);
    }

    /**
     * Menampilkan detail spesifik dari satu booking.
     * GET /api/counselor/booking/{booking}
     */
    public function show(Request $request, Booking $booking)
    {
        $user = Auth::user();

        if ($booking->konselor_id !== $user->id) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $booking->load([
            // --- PERBAIKAN: Minta 'avatar' agar 'avatar_url' berfungsi ---
            'customer:id,name,avatar,phone', // Ambil 'phone' dan 'avatar'
            // --- AKHIR PERBAIKAN ---
            'durasiKonseling:id,durasi_menit',
            'jenisKonseling:id,jenis_konseling'
        ]);

        return response()->json($booking);
    }

    /**
     * Menandai sesi booking sebagai 'Selesai'.
     * POST /api/counselor/booking/{booking}/complete
     */
    public function completeSession(Request $request, Booking $booking)
    {
        $user = Auth::user();

        if ($booking->konselor_id !== $user->id) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $validStatusToComplete = ['Dijadwalkan', 'Aktif', 'Proses', 'Menunggu Konfirmasi'];
        if (!in_array($booking->status_pesanan, $validStatusToComplete)) {
            return response()->json(['message' => 'Sesi ini tidak dapat diselesaikan (mungkin sudah selesai/dibatalkan).'], 409); // Conflict
        }

        try {
            $booking->status_pesanan = 'Selesai';
            $booking->save();

            Log::info('Sesi Selesai (oleh Konselor):', ['booking_id' => $booking->id]);

            return response()->json([
                'message' => 'Sesi berhasil ditandai sebagai Selesai.',
                'booking' => $booking->fresh()->load([
                    'customer:id,name,avatar,phone', // <-- Perbarui di sini juga
                    'durasiKonseling',
                    'jenisKonseling'
                ])
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal menyelesaikan sesi:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menyelesaikan sesi.'], 500);
        }
    }
}
