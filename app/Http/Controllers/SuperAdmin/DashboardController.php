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
        // 1. Statistik Utama (Cards)
        $totalCustomer = User::where('role', 'customer')->count();
        $totalKonselor = User::where('role', 'konselor')->count();

        // Total Pesanan (Semua status kecuali batal/ditolak jika mau spesifik, tapi biasanya total semua)
        $totalPesanan = Booking::count();

        // Total Pendapatan (Hanya yang statusnya Selesai atau Dijadwalkan/Lunas)
        // Asumsi: 'Selesai', 'Dijadwalkan' dianggap sudah bayar.
        $totalPendapatan = Booking::whereIn('status_pesanan', ['Selesai', 'SELESAI', 'Dijadwalkan'])
            ->sum('total_harga');

        // 2. Data Grafik (Booking per Minggu/Bulan & Metode)
        // Kita ambil data 4 minggu terakhir
        $chartData = $this->getChartData();

        // 3. Tabel Transaksi Terbaru (5 Terakhir)
        $recentTransactions = Booking::with(['customer:id,name,phone', 'konselor:id,name'])
            ->select('id', 'customer_id', 'konselor_id', 'tanggal_konsultasi', 'metode_konsultasi', 'status_pesanan', 'total_harga')
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'stats' => [
                'total_customer' => $totalCustomer,
                'total_pesanan' => $totalPesanan,
                'total_konselor' => $totalKonselor,
                'total_pendapatan' => $totalPendapatan,
            ],
            'chart_data' => $chartData,
            'recent_transactions' => $recentTransactions,
        ]);
    }

    /**
     * Helper untuk generate data grafik
     */
    private function getChartData()
    {
        // Ambil 3 periode (misal 3 minggu terakhir)
        $ranges = [
            'Minggu Ini' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
            'Minggu Lalu' => [Carbon::now()->subWeek()->startOfWeek(), Carbon::now()->subWeek()->endOfWeek()],
            '2 Minggu Lalu' => [Carbon::now()->subWeeks(2)->startOfWeek(), Carbon::now()->subWeeks(2)->endOfWeek()],
        ];

        $data = [];

        foreach ($ranges as $label => $dates) {
            // Hitung jumlah booking per metode di rentang tanggal ini
            $stats = Booking::whereBetween('created_at', $dates)
                ->select('metode_konsultasi', DB::raw('count(*) as total'))
                ->groupBy('metode_konsultasi')
                ->pluck('total', 'metode_konsultasi')
                ->toArray();

            $data[] = [
                'name' => $label,
                'Chat' => $stats['Chat'] ?? 0,
                'Video Call' => $stats['Video Call'] ?? 0,
                'Voice Call' => $stats['Voice Call'] ?? 0,
                'Tatap Muka' => $stats['Tatap Muka'] ?? 0,
            ];
        }

        // Balik urutan agar yang lama di kiri
        return array_reverse($data);
    }
}
