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
        Schema::table('bookings', function (Blueprint $table) {
            // Kolom untuk jadwal baru yang diajukan oleh konselor
            // Kita letakkan setelah kolom 'gmeet_link' (atau sesuaikan jika perlu)
            $table->date('proposed_date')->nullable()->after('gmeet_link');
            $table->time('proposed_time')->nullable()->after('proposed_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['proposed_date', 'proposed_time']);
        });
    }
};
