<?php

namespace Database\Seeders;

use App\Models\JenisKonseling;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // --- PERBAIKAN: JALANKAN INI DULU ---
            // Ini harus ada sebelum UserSeeder agar ID-nya bisa dipakai
            JenisKonselingSeeder::class,
            DurasiKonselingSeeder::class,
            TempatKonselingSeeder::class,

            // --- BARU JALANKAN USER ---
            UserSeeder::class,

            // Sisa seeder
            BookingSeeder::class,
            CounselorAvailabilitySeeder::class,
        ]);
    }
}
