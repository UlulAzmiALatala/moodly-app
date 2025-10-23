<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\JenisKonseling;
use App\Models\User;
use Illuminate\Http\Request;

class BerandaController extends Controller
{
    /**
     * Mengambil data yang diperlukan untuk Beranda Customer.
     * GET /api/beranda-data
     */
    public function getBerandaData(Request $request)
    {
        try {
            // 1. Ambil data layanan (Jenis Konseling)
            // PERBAIKAN: Mengganti 'image_url' menjadi 'image'
            // Model accessor di JenisKonseling.php akan otomatis mengubah 'image' (path)
            // menjadi URL lengkap.
            $services = JenisKonseling::where('status', 'Aktif')
                ->select('id', 'jenis_konseling', 'tipe_layanan', 'image') // <-- PERUBAHAN DI SINI
                ->take(6) // Ambil 6 layanan teratas
                ->get();

            // 2. Ambil data konselor (User dengan role 'konselor')
            // Pastikan admin sudah approve 'status' menjadi 'Active'
            $counselors = User::where('role', 'konselor')
                ->where('status', 'Active')
                ->select('id', 'name', 'avatar', 'universitas', 'spesialisasi', 'rating')
                ->take(4) // Ambil 4 konselor
                ->get();

            // 3. Kembalikan data sebagai JSON
            return response()->json([
                'services' => $services,
                'counselors' => $counselors,
            ]);
        } catch (\Exception $e) {
            // Tangkap error (misal: kolom tidak ditemukan) dan laporkan
            return response()->json([
                'message' => 'Gagal mengambil data beranda.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
