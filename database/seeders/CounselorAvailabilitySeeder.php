<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\CounselorAvailability;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon; // <-- TAMBAHKAN IMPORT CARBON

class CounselorAvailabilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Hapus data lama
        DB::table('counselor_availabilities')->delete();

        // Ambil Konselor (sesuai UserSeeder.php)
        $konselor1 = User::where('email', 'konselor1@moodly.com')->first();
        $konselor2 = User::where('email', 'konselor2@moodly.com')->first();
        $konselor3 = User::where('email', 'konselor3@moodly.com')->first();
        $konselor4 = User::where('email', 'konselor4@moodly.com')->first();
        $konselor5 = User::where('email', 'konselor5@moodly.com')->first();


        $jadwalPanjang = ['start_time' => '08:00:00', 'end_time' => '22:00:00'];
        $today = Carbon::today();

        // --- [PERBAIKAN] Isi data ketersediaan berdasarkan TANGGAL ---

        // Konselor 1: Tersedia untuk 7 hari ke depan (jadwal panjang)
        if ($konselor1) {
            for ($i = 0; $i < 7; $i++) {
                CounselorAvailability::create([
                    'counselor_id' => $konselor1->id,
                    'tanggal_konsultasi' => $today->copy()->addDays($i)->toDateString(),
                    'start_time' => $jadwalPanjang['start_time'],
                    'end_time' => $jadwalPanjang['end_time'],
                ]);
            }
        }

        // Konselor 2: Tersedia hari ini, 2 hari lagi, 4 hari lagi
        if ($konselor2) {
            foreach ([0, 2, 4] as $dayToAdd) {
                CounselorAvailability::create([
                    'counselor_id' => $konselor2->id,
                    'tanggal_konsultasi' => $today->copy()->addDays($dayToAdd)->toDateString(),
                    'start_time' => $jadwalPanjang['start_time'],
                    'end_time' => $jadwalPanjang['end_time'],
                ]);
            }
        }

        // Konselor 3: Tersedia juga (untuk testing)
        if ($konselor3) {
            foreach ([1, 3, 5] as $dayToAdd) {
                CounselorAvailability::create([
                    'counselor_id' => $konselor3->id,
                    'tanggal_konsultasi' => $today->copy()->addDays($dayToAdd)->toDateString(),
                    'start_time' => '10:00:00',
                    'end_time' => '16:00:00',
                ]);
            }
        }

        // Konselor 4: Tersedia juga (untuk testing)
        if ($konselor4) {
            foreach ([1, 3, 5] as $dayToAdd) {
                CounselorAvailability::create([
                    'counselor_id' => $konselor4->id,
                    'tanggal_konsultasi' => $today->copy()->addDays($dayToAdd)->toDateString(),
                    'start_time' => '10:00:00',
                    'end_time' => '16:00:00',
                ]);
            }
        }

        // Konselor 5: Tersedia juga (untuk testing)
        if ($konselor5) {
            foreach ([1, 3, 5] as $dayToAdd) {
                CounselorAvailability::create([
                    'counselor_id' => $konselor5->id,
                    'tanggal_konsultasi' => $today->copy()->addDays($dayToAdd)->toDateString(),
                    'start_time' => '10:00:00',
                    'end_time' => '16:00:00',
                ]);
            }
        }

        $this->command->info('Counselor availability (by TANGGAL) seeded!');
    }
}
