<?php

namespace App\Http\Controllers\Counselor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Booking;

class HistoryController extends Controller
{
    /**
     * Mengambil riwayat booking untuk konselor yang login,
     * difilter berdasarkan status.
     * GET /api/counselor/history
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $statusFilter = $request->query('status', 'upcoming');
        $validFilters = ['upcoming', 'canceled', 'completed'];
        if (!in_array($statusFilter, $validFilters)) {
            $statusFilter = 'upcoming';
        }

        $query = Booking::where('konselor_id', $user->id);

        if ($statusFilter == 'upcoming') {
            $upcomingStatuses = ['Dijadwalkan', 'Aktif', 'Proses', 'Menunggu Konfirmasi'];
            $query->whereIn('status_pesanan', $upcomingStatuses)
                ->where('tanggal_konsultasi', '>=', now()->toDateString());
        } elseif ($statusFilter == 'canceled') {
            $query->whereIn('status_pesanan', ['Dibatalkan', 'DITOLAK']);
        } elseif ($statusFilter == 'completed') {
            $query->where('status_pesanan', 'Selesai');
        }

        // Load relasi yang diperlukan & urutkan
        $bookings = $query->with([
            // --- PERBAIKAN: Minta 'avatar' agar 'avatar_url' berfungsi ---
            'customer:id,name,avatar',
            // --- AKHIR PERBAIKAN ---
            'durasiKonseling:id,durasi_menit',
            'jenisKonseling:id,jenis_konseling'
        ])
            ->orderBy('tanggal_konsultasi', 'desc')
            ->orderBy('jam_konsultasi', 'desc')
            ->paginate(10); // Kita gunakan paginasi

        return response()->json($bookings);
    }
}
