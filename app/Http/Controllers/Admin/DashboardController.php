<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->query('year', date('Y'));

        // 1. Statistik Cards (Angka Total)
        $stats = [
            'total_customer' => User::where('role', 'customer')->count(),
            'active_customer' => User::where('role', 'customer')->where('status', '!=', 'Banned')->count(),
            'total_konselor' => User::where('role', 'konselor')->count(),
            'verified_konselor' => User::where('role', 'konselor')->where('status', 'Terverifikasi')->count(),
            'total_revenue' => Booking::where('status_pesanan', 'Selesai')->sum('total_harga'),
        ];

        // 2. Data Grafik Multi-Kategori
        // Kita siapkan array data untuk masing-masing kartu
        $charts = [
            'total_customer' => $this->getMonthlyData($year, 'customer'),
            'active_customer' => $this->getMonthlyData($year, 'customer', [['status', '!=', 'Banned']]),
            'total_konselor' => $this->getMonthlyData($year, 'konselor'),
            'verified_konselor' => $this->getMonthlyData($year, 'konselor', [['status', '=', 'Terverifikasi']]),
        ];

        // 3. Data Tabel (Jadwal Terbaru)
        $upcomingSchedules = Booking::with(['customer:id,name', 'konselor:id,name'])
            ->whereIn('status_pesanan', ['Dijadwalkan', 'Menunggu Verifikasi', 'Selesai'])
            ->orderBy('tanggal_konsultasi', 'desc')
            ->take(5)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'tanggal' => $booking->tanggal_konsultasi,
                    'jam' => $booking->jam_konsultasi,
                    'jenis' => $booking->metode_konsultasi,
                    'klien' => $booking->customer->name ?? 'Unknown',
                    'status' => $booking->status_pesanan,
                ];
            });

        return response()->json([
            'stats' => $stats,
            'charts' => $charts, // Kirim semua data grafik
            'upcoming' => $upcomingSchedules
        ]);
    }

    // Helper Function untuk Grafik Bulanan
    private function getMonthlyData($year, $role, $conditions = [])
    {
        $query = User::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('COUNT(*) as total')
        )
            ->where('role', $role)
            ->whereYear('created_at', $year);

        // Tambahkan kondisi opsional (misal: status != Banned)
        foreach ($conditions as $condition) {
            $query->where($condition[0], $condition[1], $condition[2]);
        }

        $data = $query->groupBy('month')->pluck('total', 'month')->toArray();

        // Format ke array 1-12 bulan dengan nama bulan
        $formatted = [];
        $monthNames = [
            1 => 'Jan',
            2 => 'Feb',
            3 => 'Mar',
            4 => 'Apr',
            5 => 'Mei',
            6 => 'Jun',
            7 => 'Jul',
            8 => 'Agu',
            9 => 'Sep',
            10 => 'Okt',
            11 => 'Nov',
            12 => 'Des'
        ];

        for ($i = 1; $i <= 12; $i++) {
            $formatted[] = [
                'name' => $monthNames[$i],
                'value' => $data[$i] ?? 0 // Gunakan key 'value' yang konsisten
            ];
        }

        return $formatted;
    }
}
