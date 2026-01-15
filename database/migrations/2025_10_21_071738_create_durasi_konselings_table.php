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
        Schema::create('durasi_konselings', function (Blueprint $table) {
            $table->id();
            // UBAH DI SINI: Dari string menjadi integer
            $table->integer('durasi_menit'); // Simpan angka saja: 60, 90, 120
            $table->unsignedInteger('harga');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('durasi_konselings');
    }
};
