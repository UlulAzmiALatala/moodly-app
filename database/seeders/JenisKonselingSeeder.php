<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\JenisKonseling;

class JenisKonselingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jenisKonselings = [
            // --- Layanan Offline (Tatap Muka) ---
            // ID: 1
            ['jenis_konseling' => 'Konseling Pernikahan', 'biaya_layanan' => 'Nominal Tetap', 'nilai' => '50000', 'status' => 'Aktif', 'tipe_layanan' => 'Offline', 'image' => 'images/services/pernikahan.png'],
            // ID: 2
            ['jenis_konseling' => 'Konseling Individu', 'biaya_layanan' => 'Nominal Tetap', 'nilai' => '50000', 'status' => 'Aktif', 'tipe_layanan' => 'Offline', 'image' => 'images/services/individu.png'],
            // ID: 3
            ['jenis_konseling' => 'Konseling Keluarga', 'biaya_layanan' => 'Persentase', 'nilai' => '10%', 'status' => 'Aktif', 'tipe_layanan' => 'Offline', 'image' => 'images/services/keluarga.png'],
            // ID: 4
            ['jenis_konseling' => 'Konseling Karir', 'biaya_layanan' => 'Persentase', 'nilai' => '10%', 'status' => 'Aktif', 'tipe_layanan' => 'Offline', 'image' => 'images/services/karir.png'],
            // ID: 5
            ['jenis_konseling' => 'Konseling Depresi', 'biaya_layanan' => 'Nominal Tetap', 'nilai' => '50000', 'status' => 'Aktif', 'tipe_layanan' => 'Offline', 'image' => 'images/services/depresi.png'],
            // ID: 6
            ['jenis_konseling' => 'Konseling Anak', 'biaya_layanan' => 'Persentase', 'nilai' => '10%', 'status' => 'Aktif', 'tipe_layanan' => 'Offline', 'image' => 'images/services/anak.png'],

            // --- Layanan Online (PENTING UNTUK FITUR KITA) ---
            // ID: 7
            ['jenis_konseling' => 'Chat Singkat', 'biaya_layanan' => 'Nominal Tetap', 'nilai' => '25000', 'status' => 'Aktif', 'tipe_layanan' => 'Online', 'image' => 'images/services/chat.png'],
            // ID: 8
            ['jenis_konseling' => 'Video Konsultasi', 'biaya_layanan' => 'Nominal Tetap', 'nilai' => '75000', 'status' => 'Aktif', 'tipe_layanan' => 'Online', 'image' => 'images/services/video.png'],

            // --- TAMBAHAN BARU (AGAR KONSISTEN) ---
            // ID: 9
            ['jenis_konseling' => 'Voice Call Konsultasi', 'biaya_layanan' => 'Nominal Tetap', 'nilai' => '60000', 'status' => 'Aktif', 'tipe_layanan' => 'Online', 'image' => 'images/services/voice.png'],
        ];

        foreach ($jenisKonselings as $jenis) {
            // Gunakan create agar ID di-generate secara otomatis (1, 2, 3, ...)
            JenisKonseling::create($jenis);
        }
        $this->command->info('JenisKonselingSeeder berhasil dijalankan (termasuk Voice Call ID:9).');
    }
}
