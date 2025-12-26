<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Cache;
use App\Notifications\MissingGmeetLinkNotification;

class CheckMeetingLinks extends Command
{
    /**
     * Signature command (cara panggil di terminal).
     */
    protected $signature = 'booking:check-links';

    /**
     * Deskripsi command.
     */
    protected $description = 'Mengecek booking Video/Voice call yang akan mulai atau SUDAH mulai tapi belum ada link Gmeet';

    public function handle()
    {
        $this->info('Memulai pengecekan link meeting...');

        // 1. Ambil booking hari ini yang statusnya Dijadwalkan/Aktif
        $bookings = Booking::where('tanggal_konsultasi', Carbon::today())
            ->whereIn('status_pesanan', ['Dijadwalkan', 'Aktif'])
            ->whereIn('metode_konsultasi', ['Video Call', 'Voice Call'])
            ->where(function ($q) {
                $q->whereNull('gmeet_link')->orWhere('gmeet_link', '');
            })
            ->with('customer')
            ->get();

        $admins = User::whereIn('role', ['admin', 'super-admin'])->get();

        foreach ($bookings as $booking) {
            $startTime = Carbon::parse($booking->tanggal_konsultasi . ' ' . $booking->jam_konsultasi);

            // diffInMinutes(..., false) agar return minus jika sudah lewat waktu
            $minutesUntilStart = now()->diffInMinutes($startTime, false);

            // LOGIKA BARU:
            // Rentang: 30 menit sebelum mulai, SAMPAI 20 menit SETELAH mulai (telat)
            // Contoh: Start 10:00. Cek jam 09:30 (ok), 10:00 (ok), 10:15 (ok - telat).
            if ($minutesUntilStart <= 30 && $minutesUntilStart >= -20) {

                // Kunci Cache biar gak spam notif tiap menit (durasinya 10 menit saja biar sering diingetin kalau telat)
                $cacheKey = "notified_missing_link_{$booking->id}";

                if (!Cache::has($cacheKey)) {

                    // Modifikasi pesan biar Admin panik kalau telat
                    $isLate = $minutesUntilStart < 0;
                    $customMessage = $isLate
                        ? "DARURAT! Sesi #{$booking->id} SUDAH DIMULAI tapi link GMeet belum ada!"
                        : "Sesi #{$booking->id} segera mulai, tapi link meeting belum diisi!";

                    // Kita bisa inject pesan custom ini kalau mau modifikasi Notification class-nya,
                    // Tapi untuk sekarang pakai default dulu, yang penting trigger.

                    Notification::send($admins, new MissingGmeetLinkNotification($booking));

                    // Set Cache 15 menit
                    Cache::put($cacheKey, true, now()->addMinutes(15));

                    $status = $isLate ? 'TELAT' : 'COMING SOON';
                    $this->info("[{$status}] Notifikasi dikirim untuk Booking ID: {$booking->id}");
                }
            }
        }

        $this->info('Pengecekan selesai.');
    }
}
