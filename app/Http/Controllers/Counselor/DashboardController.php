<?php

namespace App\Http\Controllers\Counselor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Booking;

class DashboardController extends Controller
{
    /**
     * Mengambil data dashboard untuk konselor yang sedang login.
     * GET /api/counselor/dashboard-data
     */
    public function getDashboardData(Request $request)
    {
        $user = Auth::user();

        // 1. Ambil info konselor (sudah ada di $user)
        // Kita bisa mengandalkan data 'user' dari AuthContext di frontend,
        // tapi kita kirim juga untuk memastikan.

        // 2. Ambil Saldo (Saat ini kita gunakan 'balance' dari tabel users)
        $balance = $user->balance ?? 0;

        // 3. Ambil Jadwal Terbaru (Akan Datang)
        $upcomingSchedules = Booking::where('konselor_id', $user->id)
            ->whereIn('status_pesanan', ['Dijadwalkan', 'Aktif']) // Status yang dianggap "akan datang"
            ->where('tanggal_konsultasi', '>=', now()->toDateString()) // Mulai hari ini
            ->with([
                // Kita hanya perlu info customer untuk kartu
                'customer:id,name,avatar',
                'durasiKonseling:id,durasi_menit'
            ])
            ->orderBy('tanggal_konsultasi', 'asc')
            ->orderBy('jam_konsultasi', 'asc')
            ->take(5) // Ambil 5 jadwal terdekat
            ->get();

        return response()->json([
            'user' => $user, // Mengirim data user (termasuk nama, avatar, dll)
            'balance' => $balance,
            'upcomingSchedules' => $upcomingSchedules,
        ]);
    }
}
