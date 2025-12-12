<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\User;
use App\Notifications\PayoutActionRequired;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class BookingFinanceService
{
    // Biaya Admin Tetap (Dibebankan ke Customer)
    const FIXED_CUSTOMER_FEE = 5000;

    /**
     * Mengubah status booking menjadi SELESAI dan menghitung bagi hasil
     * Berdasarkan Master Data Jenis Konseling.
     */
    public function completeBooking(Booking $booking)
    {
        if (in_array($booking->status_pesanan, ['Selesai', 'SELESAI', 'Dibatalkan', 'DIBATALKAN'])) {
            return $booking;
        }

        DB::beginTransaction();
        try {
            $booking->load(['jenisKonseling', 'konselor']);

            // [FIX] Pastikan total_harga ada nilainya, default 0 jika null
            $totalTransaksi = (float) ($booking->total_harga ?? 0);

            $hargaSesi = $totalTransaksi - self::FIXED_CUSTOMER_FEE;
            if ($hargaSesi < 0) $hargaSesi = 0; // Cegah nilai negatif

            $potonganAplikasi = 0;
            $jenis = $booking->jenisKonseling;

            if ($jenis) {
                $nilaiPotongan = (float) $jenis->nilai;
                if ($jenis->biaya_layanan === 'Nominal Tetap') {
                    $potonganAplikasi = $nilaiPotongan;
                } elseif ($jenis->biaya_layanan === 'Persentase') {
                    $potonganAplikasi = $hargaSesi * ($nilaiPotongan / 100);
                }
            }

            $totalAdminFee = $potonganAplikasi + self::FIXED_CUSTOMER_FEE;
            $counselorNet = $totalTransaksi - $totalAdminFee;
            if ($counselorNet < 0) $counselorNet = 0; // Cegah minus

            $booking->update([
                'status_pesanan' => 'Selesai',
                'admin_fee' => $totalAdminFee,
                'counselor_net' => $counselorNet,
                'counselor_payment_status' => 'UNPAID',
            ]);

            DB::commit();

            // Kirim Notif ke Admin
            try {
                $admins = User::whereIn('role', ['admin', 'super-admin'])->get();
                if ($admins->count() > 0) {
                    Notification::send($admins, new PayoutActionRequired($booking));
                }
            } catch (\Exception $e) {
                Log::error("Gagal kirim notif payout: " . $e->getMessage());
            }

            return $booking;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Gagal finance service: " . $e->getMessage());
            throw $e;
        }
    }
}
