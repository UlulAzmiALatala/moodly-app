<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'konselor_id',
        'jenis_konseling_id',
        'durasi_konseling_id',
        'tempat_konseling_id',
        'tanggal_konsultasi',
        'jam_konsultasi',
        'metode_konsultasi', // Anda mungkin punya 'metode_layanan' di sini?
        'status_pesanan',
        'total_harga',
        'alasan_pembatalan',
        'catatan_pembatalan',
        'payment_proof_image',
        'payment_proof_notes',
        'gmeet_link', // <-- Saya tambahkan dari rencana Gmeet kita
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'payment_proof_image_url'
    ];


    /**
     * Get the customer that owns the booking.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * Get the konselor associated with the booking.
     */
    public function konselor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'konselor_id');
    }

    /**
     * Get the jenis konseling associated with the booking.
     */
    public function jenisKonseling(): BelongsTo
    {
        return $this->belongsTo(JenisKonseling::class);
    }

    /**
     * Get all of the chat messages for the booking.
     */
    public function chatMessages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    /**
     * Get the durasi konseling associated with the booking.
     */
    public function durasiKonseling(): BelongsTo
    {
        return $this->belongsTo(DurasiKonseling::class);
    }

    /**
     * Get the tempat konseling associated with the booking.
     */
    public function tempatKonseling(): BelongsTo
    {
        return $this->belongsTo(TempatKonseling::class);
    }

    /**
     * Dapatkan URL lengkap untuk gambar bukti pembayaran.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute
     */
    protected function paymentProofImageUrl(): Attribute
    {
        return Attribute::make(
            // Panggil Rute API Proxy
            get: fn() => $this->payment_proof_image
                ? url('/api/super-admin/booking-management/' . $this->id . '/payment-proof-image')
                : null,
        );
    }
}
