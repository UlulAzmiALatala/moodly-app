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
        // --- PERBAIKAN: Kita pisahkan logikanya ---

        // Langkah 1: Tambahkan kolom TANGGAL (jika belum ada)
        if (!Schema::hasColumn('counselor_availabilities', 'tanggal_konsultasi')) {
            Schema::table('counselor_availabilities', function (Blueprint $table) {
                $table->date('tanggal_konsultasi')->nullable()->after('counselor_id');
            });
        }

        // Langkah 2: Hapus kolom HARI (HANYA JIKA ADA)
        if (Schema::hasColumn('counselor_availabilities', 'day_of_week')) {
            Schema::table('counselor_availabilities', function (Blueprint $table) {
                $table->dropColumn('day_of_week');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // --- PERBAIKAN: Buat rollback juga 'pintar' ---

        // Langkah 1: Tambahkan kembali kolom HARI (jika belum ada)
        if (!Schema::hasColumn('counselor_availabilities', 'day_of_week')) {
            Schema::table('counselor_availabilities', function (Blueprint $table) {
                $table->tinyInteger('day_of_week')->nullable()->after('counselor_id');
            });
        }

        // Langkah 2: Hapus kolom TANGGAL (jika ada)
        if (Schema::hasColumn('counselor_availabilities', 'tanggal_konsultasi')) {
            Schema::table('counselor_availabilities', function (Blueprint $table) {
                $table->dropColumn('tanggal_konsultasi');
            });
        }
    }
};
