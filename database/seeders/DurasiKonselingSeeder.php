<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\DurasiKonseling;

class DurasiKonselingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update: durasi_menit sekarang menggunakan integer (angka), bukan string.
        $durasiKonselings = [
            ['durasi_menit' => 60, 'harga' => 100000],
            ['durasi_menit' => 120, 'harga' => 200000],
            ['durasi_menit' => 180, 'harga' => 230000],
            ['durasi_menit' => 240, 'harga' => 300000],
        ];

        foreach ($durasiKonselings as $durasi) {
            DurasiKonseling::create($durasi);
        }
        $this->command->info('DurasiKonselingSeeder berhasil dijalankan.');
    }
}
