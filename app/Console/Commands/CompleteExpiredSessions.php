<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use App\Services\BookingFinanceService; // <--- WAJIB DI-IMPORT
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CompleteExpiredSessions extends Command
{
    // Nama command sesuai punya kamu
    protected $signature = 'app:complete-expired-sessions';
    protected $description = 'Mencari sesi yang sedang berlangsung dan menandainya sebagai "Selesai" jika waktunya telah habis.';

    protected $financeService;

    // Inject Service Calculator di sini
    public function __construct(BookingFinanceService $financeService)
    {
        parent::__construct();
        $this->financeService = $financeService;
    }

    public function handle()
    {
        $this->info('Mulai memeriksa sesi yang kedaluwarsa...');
        Log::info('Cronjob: Memeriksa sesi kedaluwarsa...');

        $timezone = 'Asia/Jakarta';
        $now = Carbon::now($timezone);

        $activeStatuses = ['Dijadwalkan', 'Berlangsung', 'Aktif', 'Proses', 'Menunggu Konfirmasi', 'DISETUJUI'];

        $bookings = Booking::whereIn('status_pesanan', $activeStatuses)
            ->with('durasiKonseling') // Eager load biar ringan
            ->get();

        if ($bookings->isEmpty()) {
            $this->info('Tidak ada sesi aktif yang ditemukan.');
            return;
        }

        $completedCount = 0;

        foreach ($bookings as $booking) {
            // Validasi data tidak lengkap
            if (!$booking->durasiKonseling || !$booking->tanggal_konsultasi || !$booking->jam_konsultasi) {
                continue;
            }

            try {
                // --- LOGIKA PARSING WAKTU (SAYA PERTAHANKAN KARENA SUDAH BAGUS) ---
                $timeStringFromDB = $booking->jam_konsultasi;
                $cleanedTimeString = str_replace('.', ':', $timeStringFromDB);
                $startTimeString = substr($cleanedTimeString, 0, 5);
                $fullStartTimeString = $booking->tanggal_konsultasi . ' ' . $startTimeString;

                $startTime = Carbon::createFromFormat('Y-m-d H:i', $fullStartTimeString, $timezone);

                $durationInMinutes = (int) $booking->durasiKonseling->durasi_menit;
                $endTime = $startTime->copy()->addMinutes($durationInMinutes);

                // --- CEK APAKAH SUDAH LEWAT WAKTU? ---
                if ($now->gte($endTime)) {

                    // [PERBAIKAN UTAMA ADA DI SINI]
                    // Jangan cuma update status manual.
                    // Panggil Service biar duitnya dihitung!

                    $this->financeService->completeBooking($booking);

                    $completedCount++;
                    $this->info("Sesi #{$booking->id} selesai. Keuangan telah dihitung.");
                    Log::info("Cronjob: Sesi #{$booking->id} selesai & hitung duit.");
                }
            } catch (\Exception $e) {
                Log::error("Cronjob: Gagal memproses booking #{$booking->id}", [
                    'error' => $e->getMessage()
                ]);
            }
        }

        $this->info("Selesai. {$completedCount} sesi telah ditandai Selesai.");
    }
}
