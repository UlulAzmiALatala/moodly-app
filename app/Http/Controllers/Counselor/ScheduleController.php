<?php

namespace App\Http\Controllers\Counselor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Booking;

class ScheduleController extends Controller
{
    /**
     * Mengambil semua jadwal (Akan Datang) untuk konselor yang login.
     * GET /api/counselor/schedules
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // --- PERBAIKAN: Sesuaikan status dengan data di database Anda ---
        $upcomingStatuses = [
            'Dijadwalkan',
            'Aktif',
            'Proses',
            'Menunggu Konfirmasi'
        ];
        // --- AKHIR PERBAIKAN ---

        // Ambil semua jadwal yang Akan Datang
        $schedules = Booking::where('konselor_id', $user->id)
            ->whereIn('status_pesanan', $upcomingStatuses) // <-- Gunakan array baru
            ->where('tanggal_konsultasi', '>=', now()->toDateString()) // Mulai hari ini
            ->with([
                'customer:id,name,avatar',
                'durasiKonseling:id,durasi_menit'
            ])
            ->orderBy('tanggal_konsultasi', 'asc')
            ->orderBy('jam_konsultasi', 'asc')
            ->get(); // Ambil semua

        return response()->json($schedules);
    }
}
