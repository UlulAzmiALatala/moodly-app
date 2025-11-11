<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\CounselorAvailability;
use Illuminate\Support\Facades\DB; // Import DB Facade

class CounselorAvailabilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Hapus data lama
        DB::table('counselor_availabilities')->delete();

        // --- Ambil Konselor (sesuai UserSeeder.php) ---
        $konselor1 = User::where('email', 'konselor1@moodly.com')->first();
        $konselor2 = User::where('email', 'konselor2@moodly.com')->first();
        $konselor3 = User::where('email', 'konselor3@moodly.com')->first(); // Yang offline
        $konselor4 = User::where('email', 'konselor4@moodly.com')->first();
        $konselor5 = User::where('email', 'konselor5@moodly.com')->first(); // Yang bisa semua

        // Definisikan jadwal panjang sesuai permintaan Anda
        $jadwalPanjang = ['start_time' => '08:00:00', 'end_time' => '22:00:00'];
        // Definisikan jadwal kantor (untuk konselor offline)
        $jadwalKantor = ['start_time' => '09:00:00', 'end_time' => '17:00:00'];

        // --- Konselor 1 (Senin - Jumat, Jadwal Panjang) ---
        if ($konselor1) {
            for ($day = 1; $day <= 5; $day++) { // 1 (Senin) s/d 5 (Jumat)
                CounselorAvailability::create([
                    'counselor_id' => $konselor1->id,
                    'day_of_week' => $day,
                    'start_time' => $jadwalPanjang['start_time'],
                    'end_time' => $jadwalPanjang['end_time'],
                ]);
            }
        }

        // --- Konselor 2 (Sen, Rab, Jum, Jadwal Panjang) ---
        if ($konselor2) {
            foreach ([1, 3, 5] as $day) { // Hanya Senin, Rabu, Jumat
                CounselorAvailability::create([
                    'counselor_id' => $konselor2->id,
                    'day_of_week' => $day,
                    'start_time' => $jadwalPanjang['start_time'],
                    'end_time' => $jadwalPanjang['end_time'],
                ]);
            }
        }

        // --- Konselor 3 (Senin - Jumat, Jam Kantor) ---
        // (Ini adalah konselor yang kita set hanya offline di UserSeeder)
        if ($konselor3) {
            for ($day = 1; $day <= 5; $day++) { // 1 (Senin) s/d 5 (Jumat)
                CounselorAvailability::create([
                    'counselor_id' => $konselor3->id,
                    'day_of_week' => $day,
                    'start_time' => $jadwalKantor['start_time'],
                    'end_time' => $jadwalKantor['end_time'],
                ]);
            }
        }

        // --- Konselor 4 (Sel, Kam, Sab, Jadwal Panjang) ---
        if ($konselor4) {
            foreach ([2, 4, 6] as $day) { // Hanya Selasa, Kamis, Sabtu
                CounselorAvailability::create([
                    'counselor_id' => $konselor4->id,
                    'day_of_week' => $day,
                    'start_time' => $jadwalPanjang['start_time'],
                    'end_time' => $jadwalPanjang['end_time'],
                ]);
            }
        }

        // --- Konselor 5 (SETIAP HARI, Jadwal Panjang) ---
        // (Bagus untuk testing)
        if ($konselor5) {
            for ($day = 0; $day <= 6; $day++) { // 0 (Minggu) s/d 6 (Sabtu)
                CounselorAvailability::create([
                    'counselor_id' => $konselor5->id,
                    'day_of_week' => $day,
                    'start_time' => $jadwalPanjang['start_time'],
                    'end_time' => $jadwalPanjang['end_time'],
                ]);
            }
        }

        $this->command->info('Counselor availability (long hours) seeded!');
    }
}
