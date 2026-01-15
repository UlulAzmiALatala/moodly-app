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
        Schema::create('tempat_konseling_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // --- PERBAIKAN: Arahkan ke nama tabel yang benar 'tempat_konselings' (plural) ---
            $table->foreignId('tempat_konseling_id')->constrained('tempat_konselings')->onDelete('cascade');
            // --- AKHIR PERBAIKAN ---

            $table->timestamps();

            $table->unique(['user_id', 'tempat_konseling_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tempat_konseling_user');
    }
};
