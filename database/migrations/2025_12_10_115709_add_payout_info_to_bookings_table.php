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
            // 1. Jatah Bersih Konselor (Total - Admin Fee)
            // Kita pakai decimal(10,2) menyamakan dengan kolom 'admin_fee' & 'refund_amount' yang sudah ada
            $table->decimal('counselor_net', 10, 2)->default(0)->after('admin_fee')
                ->comment('Nominal bersih yang harus ditransfer Admin ke Konselor');

            // 2. Status Pembayaran (Hutang Platform ke Konselor)
            $table->enum('counselor_payment_status', ['UNPAID', 'PAID'])
                ->default('UNPAID')
                ->after('status_pesanan')
                ->comment('Status apakah Admin sudah transfer manual ke Konselor');

            // 3. Bukti Transfer & Tanggal
            $table->string('counselor_payment_proof')->nullable()->after('counselor_payment_status');
            $table->timestamp('counselor_paid_at')->nullable()->after('counselor_payment_proof');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'counselor_net',
                'counselor_payment_status',
                'counselor_payment_proof',
                'counselor_paid_at'
            ]);
        });
    }
};
