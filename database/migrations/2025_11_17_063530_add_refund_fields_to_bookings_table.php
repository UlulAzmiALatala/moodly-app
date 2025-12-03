<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Biaya admin (potongan)
            $table->decimal('admin_fee', 10, 2)->nullable()->after('gmeet_link');
            // Jumlah final yang dikembalikan
            $table->decimal('refund_amount', 10, 2)->nullable()->after('admin_fee');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['admin_fee', 'refund_amount']);
        });
    }
};
