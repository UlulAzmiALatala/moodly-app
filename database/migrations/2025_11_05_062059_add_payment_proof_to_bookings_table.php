<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
// Hapus DB Facade, kita tidak membutuhkannya lagi

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // 1. Tambah kolom untuk menyimpan path gambar bukti
            // Kita letakkan setelah 'total_harga' seperti di screenshot Anda
            $table->string('payment_proof_image')->nullable()->after('total_harga');

            // 2. Tambah kolom untuk catatan dari customer
            $table->text('payment_proof_notes')->nullable()->after('payment_proof_image');
        });

        // --- CATATAN PENTING (BACA INI) ---
        // Karena 'status_pesanan' Anda adalah string (VARCHAR) dan bukan ENUM,
        // kita TIDAK PERLU mengubah skema database untuk status baru.
        // Ini JAUH LEBIH AMAN.
        //
        // Alur status baru kita ('Menunggu Verifikasi') akan di-handle
        // murni di dalam logika Controller.
        //
        // Alur Status:
        // 1. 'Menunggu Pembayaran' (Status Awal)
        // 2. Customer upload bukti -> Controller update status ke 'Menunggu Verifikasi'
        // 3. 'Menunggu Verifikasi' (Status Baru untuk dilihat Admin)
        // 4. Admin approve -> Controller update status ke 'Dijadwalkan'
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Pastikan nama kolomnya benar
            $table->dropColumn('payment_proof_image');
            $table->dropColumn('payment_proof_notes');
        });
    }
};
