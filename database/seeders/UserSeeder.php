<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // --- SUPER ADMIN ---
        User::updateOrCreate(
            ['email' => 'ullulazmia.l@gmail.com'],
            [
                'name' => 'Super Admin Moodly',
                'role' => 'super-admin',
                'status' => 'Online',
                'phone' => '081234567890',
                'city' => 'Yogyakarta',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // --- ADMIN ---
        User::updateOrCreate(
            ['email' => 'admin@moodly.com'],
            [
                'name' => 'Admin Satu',
                'role' => 'admin',
                'status' => 'Offline',
                'phone' => '081234567891',
                'city' => 'Yogyakarta',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        User::updateOrCreate(
            ['email' => 'admin1@moodly.com'],
            [
                'name' => 'Admin Dua',
                'role' => 'admin',
                'status' => 'Offline',
                'phone' => '081234567892',
                'city' => 'Solo',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // --- KONSELOR ---

        // ID Offline: 1(Pernikahan), 2(Individu), 3(Keluarga), 4(Karir), 5(Depresi), 6(Anak)
        // ID Online: 7(Chat), 8(Video), 9(Voice Call) <-- UPDATE DI SINI

        // Buat beberapa kombinasi spesialisasi (Array berisi ID)
        $specLists = [
            [2, 5, 7], // Konselor 1: Individu, Depresi, Chat
            [3, 6, 7, 8], // Konselor 2: Keluarga, Anak, Chat, Video
            [1, 4],       // Konselor 3: Pernikahan, Karir (Hanya Offline)
            [2, 5, 8, 9], // Konselor 4: Individu, Depresi, Video, Voice Call <-- UPDATE DI SINI
            [1, 2, 3, 4, 5, 6, 7, 8, 9] // Konselor 5: Bisa Semua <-- UPDATE DI SINI
        ];

        // Definisikan metode layanan (Array berisi String)
        $metodeLists = [
            ['Chat'], // Konselor 1: Hanya bisa Chat
            ['Chat', 'Video Call'], // Konselor 2: Bisa Chat dan Video Call
            [], // Konselor 3: Tidak ada metode online
            ['Video Call', 'Voice Call'], // Konselor 4: Bisa Video dan Voice Call
            ['Chat', 'Video Call', 'Voice Call'] // Konselor 5: Bisa semua metode
        ];

        for ($i = 1; $i <= 5; $i++) {
            User::updateOrCreate(
                ['email' => 'konselor' . $i . '@moodly.com'],
                [
                    'name' => 'Konselor ' . $i,
                    'role' => 'konselor',
                    'status' => 'Terverifikasi',
                    'phone' => '082' . str_pad($i, 9, '0', STR_PAD_LEFT),
                    'city' => ['Yogyakarta', 'Jakarta', 'Bandung', 'Surabaya'][array_rand(['Yogyakarta', 'Jakarta', 'Bandung', 'Surabaya'])],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'surat_izin_praktik' => 'SIP-00' . $i,
                    'spesialisasi' => $specLists[$i - 1], // Data spesialisasi yang sudah di-update
                    'metode_layanan' => $metodeLists[$i - 1], // Data metode layanan
                    'rating' => rand(40, 50) / 10,
                ]
            );
        }

        // --- CUSTOMER ---
        $customerStatuses = ['Offline', 'Banned', 'Verifikasi', 'Verifikasi', 'Verifikasi'];
        for ($i = 1; $i <= 10; $i++) {
            User::updateOrCreate(
                ['email' => 'customer' . $i . '@moodly.com'],
                [
                    'name' => 'Customer ' . $i,
                    'role' => 'customer',
                    'status' => $customerStatuses[array_rand($customerStatuses)],
                    'phone' => '083' . str_pad($i, 9, '0', STR_PAD_LEFT),
                    'city' => ['Yogyakarta', 'Jakarta', 'Bandung', 'Surabaya', 'Tangerang'][array_rand(['Yogyakarta', 'Jakarta', 'Bandung', 'Surabaya', 'Tangerang'])],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
        }

        $this->command->info('UserSeeder berhasil dijalankan (termasuk spesialisasi Voice Call ID:9).');
    }
}
