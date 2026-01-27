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
        // Cek status agar tidak diproses ganda
        if (in_array(strtoupper($booking->status_pesanan), ['SELESAI', 'DIBATALKAN', 'DITOLAK'])) {
            return $booking;
        }

        DB::beginTransaction();
        try {
            $booking->load(['jenisKonseling', 'konselor']);

            // 1. Ambil Total Transaksi (Hapus "Rp" atau titik jika ada)
            $totalTransaksi = $this->parseNumber($booking->total_harga);

            // 2. Hitung Harga Dasar Sesi (Total - 5000)
            $hargaSesi = $totalTransaksi - self::FIXED_CUSTOMER_FEE;
            if ($hargaSesi < 0) $hargaSesi = 0;

            $potonganAplikasi = 0;
            $jenis = $booking->jenisKonseling;

            if ($jenis) {
                // [FIX UTAMA] Bersihkan 'nilai' dari database (misal "Rp 15.000" jadi 15000)
                $nilaiBersih = $this->parseNumber($jenis->nilai);

                // [FIX] Normalisasi tipe layanan (biar tidak sensitif huruf besar/kecil)
                $tipeBiaya = strtolower(trim($jenis->biaya_layanan));

                // Logika Deteksi yang Fleksibel
                if (str_contains($tipeBiaya, 'persen') || $tipeBiaya === 'percentage') {
                    // Rumus Persentase: Harga Sesi * (Nilai / 100)
                    $potonganAplikasi = $hargaSesi * ($nilaiBersih / 100);
                } elseif (str_contains($tipeBiaya, 'nominal') || str_contains($tipeBiaya, 'tetap') || str_contains($tipeBiaya, 'flat')) {
                    // Rumus Nominal: Langsung ambil nilainya
                    $potonganAplikasi = $nilaiBersih;
                }
                // Fallback: Jika tidak ada match string, tapi ada nilai, anggap nominal
                elseif ($nilaiBersih > 0) {
                    $potonganAplikasi = $nilaiBersih;
                }
            }

            // 3. Hitung Total Admin Fee (Potongan App + 5000)
            $totalAdminFee = $potonganAplikasi + self::FIXED_CUSTOMER_FEE;

            // 4. Hitung Hak Mitra (Total - Total Admin Fee)
            $counselorNet = $totalTransaksi - $totalAdminFee;

            // Safety Check
            if ($counselorNet < 0) $counselorNet = 0;

            // Debugging Log (Bisa dicek di storage/logs/laravel.log)
            Log::info("Finance Calculation Booking #{$booking->id}", [
                'total' => $totalTransaksi,
                'jenis_raw' => $jenis ? $jenis->biaya_layanan : 'null',
                'nilai_raw' => $jenis ? $jenis->nilai : 'null',
                'nilai_bersih' => $jenis ? $this->parseNumber($jenis->nilai) : 0,
                'app_fee' => $potonganAplikasi,
                'admin_fee_fixed' => self::FIXED_CUSTOMER_FEE,
                'mitra_net' => $counselorNet
            ]);

            $booking->update([
                'status_pesanan' => 'Selesai',
                'admin_fee' => $totalAdminFee,       // Ini App Fee + 5000
                'counselor_net' => $counselorNet,    // Ini Gaji Mitra
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

    /**
     * Fungsi sakti untuk membersihkan string angka
     * Contoh: "Rp 15.000" -> 15000
     * Contoh: "10%" -> 10
     */
    private function parseNumber($value)
    {
        if (is_numeric($value)) {
            return (float) $value;
        }
        // Hapus semua karakter KECUALI angka dan titik
        // Hati-hati: Jika format Indonesia pakai koma (10,5), ganti ',' jadi '.'
        $clean = preg_replace('/[^0-9.]/', '', str_replace(',', '.', (string)$value));
        return (float) $clean;
    }
}
