<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('counselor_availabilities', function (Blueprint $table) {
            $table->id();
            // Foreign key ke tabel users (untuk konselor)
            $table->foreignId('counselor_id')->constrained('users')->onDelete('cascade');

            // --- PERBAIKAN: Ganti 'day_of_week' menjadi 'tanggal_konsultasi' ---
            $table->date('tanggal_konsultasi');
            // --- AKHIR PERBAIKAN ---

            // Jam mulai tersedia (format HH:MM:SS)
            $table->time('start_time');
            // Jam selesai tersedia (format HH:MM:SS)
            $table->time('end_time');

            $table->timestamps(); // created_at and updated_at

            // Index untuk performa query
            $table->index(['counselor_id', 'tanggal_konsultasi']);

            // Pastikan tidak ada duplikat jadwal pada TANGGAL yang sama untuk konselor yang sama
            $table->unique(['counselor_id', 'tanggal_konsultasi', 'start_time'], 'counselor_availability_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('counselor_availabilities');
    }
};
