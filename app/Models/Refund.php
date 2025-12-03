<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Refund extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'customer_id',
        'nama_pemilik_rekening',
        'nama_bank',
        'nomor_rekening',
        'total_bayar',
        'potongan_admin',
        'jumlah_refund',
        'bukti_refund_customer',
        'keterangan_customer',
        'status',
        'bukti_transfer_admin',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }
}
