<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            // Relasi ke booking
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade');

            // Data Bank
            $table->string('nama_pemilik_rekening');
            $table->string('nama_bank');
            $table->string('nomor_rekening');

            // Data Nominal (disalin dari booking agar historis)
            $table->decimal('total_bayar', 10, 2);
            $table->decimal('potongan_admin', 10, 2);
            $table->decimal('jumlah_refund', 10, 2);

            // Bukti & Keterangan
            $table->string('bukti_refund_customer')->nullable(); // Foto buku tabungan dll (opsional)
            $table->text('keterangan_customer')->nullable();

            // Status Pengajuan
            $table->enum('status', ['Menunggu Proses', 'Diproses', 'Selesai', 'Ditolak'])
                ->default('Menunggu Proses');

            // Bukti Transfer dari Admin (nanti diisi admin)
            $table->string('bukti_transfer_admin')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};
