<?php

namespace App\Http\Controllers\Counselor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Booking;

class HistoryController extends Controller
{
    /**
     * Mengambil riwayat booking untuk konselor yang login...
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // 1. Ambil Parameter
        $statusFilter = $request->query('status', 'upcoming');
        $search = $request->query('search'); // <--- Ambil query search

        $validFilters = ['upcoming', 'canceled', 'completed'];
        if (!in_array($statusFilter, $validFilters)) {
            $statusFilter = 'upcoming';
        }

        // 2. Query Dasar
        $query = Booking::where('konselor_id', $user->id);

        // 3. LOGIKA PENCARIAN BERDASARKAN ID PESANAN
        if ($search) {
            // Kita gunakan 'like' agar user bisa mengetik sebagian ID saja (misal: "15" ketemu ID 150)
            // Jika ingin exact match, gunakan $query->where('id', $search);
            $query->where('id', 'like', "%{$search}%");
        }

        // 4. Filter Status
        if ($statusFilter == 'upcoming') {
            $upcomingStatuses = ['Dijadwalkan', 'Aktif', 'Proses', 'Menunggu Konfirmasi'];
            $query->whereIn('status_pesanan', $upcomingStatuses)
                ->where('tanggal_konsultasi', '>=', now()->toDateString());
        } elseif ($statusFilter == 'canceled') {
            $query->whereIn('status_pesanan', ['Dibatalkan', 'DITOLAK']);
        } elseif ($statusFilter == 'completed') {
            $query->whereIn('status_pesanan', ['Selesai', 'SELESAI']);
        }

        // 5. Load Relasi & Order
        $bookings = $query->with([
            'customer:id,name,avatar',
            'durasiKonseling:id,durasi_menit',
            'jenisKonseling:id,jenis_konseling'
        ])
            ->orderBy('tanggal_konsultasi', 'desc')
            ->orderBy('jam_konsultasi', 'desc')
            ->paginate(10);

        return response()->json($bookings);
    }
}
