<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CompleteExpiredSessions extends Command
{
    protected $signature = 'app:complete-expired-sessions';
    protected $description = 'Mencari sesi yang sedang berlangsung dan menandainya sebagai "Selesai" jika waktunya telah habis.';

    public function handle()
    {
        $this->info('Mulai memeriksa sesi yang kedaluwarsa...');
        Log::info('Cronjob: Memeriksa sesi kedaluwarsa...');

        $timezone = 'Asia/Jakarta';
        $now = Carbon::now($timezone);

        $activeStatuses = ['Dijadwalkan', 'Berlangsung', 'Aktif', 'Proses', 'Menunggu Konfirmasi', 'DISETUJUI'];

        $bookings = Booking::whereIn('status_pesanan', $activeStatuses)
            ->with('durasiKonseling')
            ->get();

        if ($bookings->isEmpty()) {
            $this->info('Tidak ada sesi aktif yang ditemukan.');
            Log::info('Cronjob: Tidak ada sesi aktif.');
            return;
        }

        $completedCount = 0;

        foreach ($bookings as $booking) {
            if (!$booking->durasiKonseling || !$booking->tanggal_konsultasi || !$booking->jam_konsultasi) {
                Log::warning("Cronjob: Booking #{$booking->id} dilewati (data tidak lengkap).");
                continue;
            }

            try {
                // --- PERBAIKAN LOGIKA PARSING WAKTU ---

                // 1. Ambil string jam dari DB (contoh: "13.00 - 14.00" atau "13:00:00")
                $timeStringFromDB = $booking->jam_konsultasi;

                // 2. Bersihkan string itu untuk mendapatkan jam mulai saja
                // Ganti "." dengan ":" (misal "13.00" -> "13:00")
                $cleanedTimeString = str_replace('.', ':', $timeStringFromDB);

                // 3. Ambil 5 karakter pertama (misal "13:00 - 14:00" -> "13:00")
                $startTimeString = substr($cleanedTimeString, 0, 5); // Hasilnya "13:00"

                // 4. Gabungkan tanggal dan jam yang sudah bersih
                $fullStartTimeString = $booking->tanggal_konsultasi . ' ' . $startTimeString;

                // 5. Parse waktu mulai menggunakan format yang kita tahu
                $startTime = Carbon::createFromFormat('Y-m-d H:i', $fullStartTimeString, $timezone);

                // --- AKHIR PERBAIKAN ---

                $durationInMinutes = (int) $booking->durasiKonseling->durasi_menit;
                $endTime = $startTime->copy()->addMinutes($durationInMinutes);

                if ($now->gte($endTime)) {
                    $booking->status_pesanan = 'Selesai';
                    $booking->save();

                    $completedCount++;
                    Log::info("Cronjob: Sesi #{$booking->id} ditandai Selesai. (Waktu Selesai: {$endTime->toDateTimeString()})");
                }
            } catch (\Exception $e) {
                // Log error jika parsing GAGAL (mungkin formatnya beda lagi)
                Log::error("Cronjob: Gagal memproses booking #{$booking->id}", [
                    'string_asli' => $booking->jam_konsultasi,
                    'string_dibersihkan' => $startTimeString ?? 'Gagal',
                    'error' => $e->getMessage()
                ]);
            }
        }

        $this->info("Selesai. {$completedCount} sesi telah ditandai Selesai.");
    }
}
