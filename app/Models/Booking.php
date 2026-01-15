<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Casts\Attribute;

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
        'metode_konsultasi',
        'status_pesanan',
        'total_harga',
        'admin_fee',
        'counselor_net',
        'counselor_payment_status',
        'counselor_payment_proof',
        'counselor_paid_at',
        'alasan_pembatalan',
        'catatan_pembatalan',
        'payment_proof_image',
        'payment_proof_notes',
        'gmeet_link',
        'refund_amount',
        'rating',
        'ulasan_customer',
        'proposed_date',
        'proposed_time',
    ];

    protected $appends = [
        'payment_proof_image_url',
        'counselor_payment_proof_url'
    ];

    protected $visible = [
        'id',
        'customer_id',
        'konselor_id',
        'jenis_konseling_id',
        'durasi_konseling_id',
        'tempat_konseling_id',
        'tanggal_konsultasi',
        'jam_konsultasi',
        'metode_konsultasi',
        'status_pesanan',
        'total_harga',
        'alasan_pembatalan',
        'catatan_pembatalan',
        'payment_proof_image',
        'payment_proof_notes',
        'admin_fee',
        'counselor_net',
        'counselor_payment_status',
        'counselor_payment_proof',
        'counselor_paid_at',
        'refund_amount',
        'gmeet_link',
        'rating',
        'ulasan_customer',
        'proposed_date',
        'proposed_time',
        'created_at',
        'updated_at',

        // Relasi
        'customer',
        'konselor',
        'jenisKonseling',
        'durasiKonseling',
        'tempatKonseling',
        'chatMessages',
        'refund',

        // Accessor
        'payment_proof_image_url',
        'counselor_payment_proof_url'
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function konselor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'konselor_id');
    }

    public function jenisKonseling(): BelongsTo
    {
        return $this->belongsTo(JenisKonseling::class);
    }

    public function chatMessages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function durasiKonseling(): BelongsTo
    {
        return $this->belongsTo(DurasiKonseling::class);
    }

    public function tempatKonseling(): BelongsTo
    {
        return $this->belongsTo(TempatKonseling::class);
    }

    public function refund(): HasOne
    {
        return $this->hasOne(Refund::class);
    }

    // Accessor Bukti Bayar Customer
    protected function paymentProofImageUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->payment_proof_image
                ? url('storage/' . $this->payment_proof_image)
                : null,
        );
    }

    // [BARU] Accessor Bukti Bayar Admin ke Konselor
    protected function counselorPaymentProofUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->counselor_payment_proof
                ? url('storage/' . $this->counselor_payment_proof)
                : null,
        );
    }
}
