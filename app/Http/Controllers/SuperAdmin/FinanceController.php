<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class FinanceController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $month = $request->query('month');
        $year = $request->query('year', date('Y'));

        $query = Booking::with(['customer', 'konselor', 'jenisKonseling', 'durasiKonseling'])
            ->where('status_pesanan', 'Selesai');

        if ($month) $query->whereMonth('created_at', $month);
        if ($year) $query->whereYear('created_at', $year);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('customer', function ($c) use ($search) {
                    $c->where('name', 'like', "%{$search}%");
                })->orWhereHas('konselor', function ($k) use ($search) {
                    $k->where('name', 'like', "%{$search}%");
                });
            });
        }

        $bookings = $query->latest()->paginate(10);

        // --- PERBAIKAN UTAMA ---
        // Ubah setiap item menjadi array agar properti tambahan 'financial_report' 
        // TIDAK hilang saat serialisasi JSON.
        $transformedCollection = $bookings->getCollection()->map(function ($item) {
            $hargaSesi = $item->durasiKonseling->harga ?? 0;
            $biayaAdminCustomer = 5000;

            $potonganAplikasi = 0;
            $jenis = $item->jenisKonseling;

            if ($jenis) {
                $nilai = (float) $jenis->nilai;
                if ($jenis->biaya_layanan === 'Nominal Tetap') {
                    $potonganAplikasi = $nilai;
                } else if ($jenis->biaya_layanan === 'Persentase') {
                    $potonganAplikasi = $hargaSesi * ($nilai / 100);
                }
            }

            $hakKonselor = $hargaSesi - $potonganAplikasi;
            $totalPemasukanAplikasi = $potonganAplikasi + $biayaAdminCustomer;

            // Konversi Model ke Array dulu
            $itemArray = $item->toArray();

            // Masukkan data tambahan ke array
            $itemArray['financial_report'] = [
                'harga_sesi' => $hargaSesi,
                'biaya_admin_customer' => $biayaAdminCustomer,
                'potongan_aplikasi' => $potonganAplikasi,
                'hak_konselor' => $hakKonselor,
                'total_pemasukan_aplikasi' => $totalPemasukanAplikasi,
                'total_transaksi' => $item->total_harga
            ];

            return $itemArray;
        });

        // Pasang kembali koleksi yang sudah diubah ke paginator
        $bookings->setCollection($transformedCollection);

        // --- HITUNG SUMMARY ---
        $allCompleted = Booking::where('status_pesanan', 'Selesai')
            ->with(['jenisKonseling', 'durasiKonseling'])
            ->get();

        $summary = [
            'total_omset' => 0,
            'total_bersih' => 0,
            'total_payout' => 0,
        ];

        foreach ($allCompleted as $b) {
            $harga = $b->durasiKonseling->harga ?? 0;
            $potongan = 0;
            $jenis = $b->jenisKonseling;

            if ($jenis) {
                $val = (float) $jenis->nilai;
                if ($jenis->biaya_layanan === 'Nominal Tetap') $potongan = $val;
                else if ($jenis->biaya_layanan === 'Persentase') $potongan = $harga * ($val / 100);
            }

            $summary['total_omset'] += $b->total_harga;
            $summary['total_bersih'] += ($potongan + 5000);
            $summary['total_payout'] += ($harga - $potongan);
        }

        return response()->json([
            'bookings' => $bookings,
            'summary' => $summary
        ]);
    }
}
