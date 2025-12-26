<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // 1. Ambil Tahun dari Request (Default: Tahun Sekarang)
        $year = $request->query('year', Carbon::now()->year);

        // 2. Statistik Utama (Cards)
        // Customer & Konselor tetap Total Keseluruhan (Akumulasi)
        $totalCustomer = User::where('role', 'customer')->count();
        $totalKonselor = User::where('role', 'konselor')->count();

        // Pesanan & Pendapatan DI-FILTER berdasarkan Tahun yang dipilih
        // Agar angka di Card sinkron dengan grafik
        $totalPesanan = Booking::whereYear('created_at', $year)->count();

        $totalPendapatan = Booking::whereIn('status_pesanan', ['Selesai', 'SELESAI', 'Dijadwalkan'])
            ->whereYear('created_at', $year) // Filter Tahun
            ->sum('total_harga');

        // 3. Data Grafik (Bulanan dalam Tahun Terpilih)
        $chartData = $this->getChartData($year);

        // 4. Tabel Transaksi Terbaru (5 Terakhir, tidak perlu filter tahun biar tetap update)
        $recentTransactions = Booking::with(['customer:id,name,phone', 'konselor:id,name'])
            ->select('id', 'customer_id', 'konselor_id', 'tanggal_konsultasi', 'metode_konsultasi', 'status_pesanan', 'total_harga')
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'stats' => [
                'total_customer' => $totalCustomer,
                'total_pesanan' => $totalPesanan, // Pesanan tahun ini
                'total_konselor' => $totalKonselor,
                'total_pendapatan' => $totalPendapatan, // Pendapatan tahun ini
            ],
            'chart_data' => $chartData,
            'recent_transactions' => $recentTransactions,
            'year' => $year // Kirim balik tahunnya untuk konfirmasi
        ]);
    }

    /**
     * Helper untuk generate data grafik BULANAN berdasarkan TAHUN
     */
    private function getChartData($year)
    {
        // Definisi Bulan
        $months = [
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

        $data = [];

        // Loop 12 Bulan
        foreach ($months as $monthNum => $monthName) {
            // Hitung booking di bulan & tahun tersebut, dikelompokkan per metode
            $stats = Booking::whereYear('created_at', $year)
                ->whereMonth('created_at', $monthNum)
                ->select('metode_konsultasi', DB::raw('count(*) as total'))
                ->groupBy('metode_konsultasi')
                ->pluck('total', 'metode_konsultasi')
                ->toArray();

            // Susun data agar jika 0 tetap muncul angka 0 (penting buat grafik)
            $data[] = [
                'name' => $monthName,
                'Chat' => $stats['Chat'] ?? 0,
                'Video Call' => $stats['Video Call'] ?? 0,
                'Voice Call' => $stats['Voice Call'] ?? 0,
                'Tatap Muka' => $stats['Tatap Muka'] ?? 0,

                // Tambahan: Total Value untuk grafik Area (Pendapatan)
                // Ini estimasi kasar atau hitung real query lagi jika mau akurat per transaksi
                // Disini kita pakai logic sederhana: Total Pesanan bulan itu
                'value' => array_sum($stats)
            ];
        }

        return $data;
    }
}
