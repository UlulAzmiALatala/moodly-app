<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany; // <-- TAMBAHKAN Import HasMany

// --- TAMBAHAN BARU ---
use Illuminate\Database\Eloquent\Casts\Attribute; // Untuk Accessor
use Illuminate\Support\Facades\Storage; // Untuk URL Storage
// --- AKHIR TAMBAHAN BARU ---

class Booking extends Model
{
    // ... (kode $fillable, $appends, relasi tidak berubah) ...
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
        'alasan_pembatalan', // <-- Pastikan ada dari migrasi sebelumnya
        'catatan_pembatalan', // <-- Pastikan ada dari migrasi sebelumnya

        // --- TAMBAHAN DARI MIGRARI BARU ---
        'payment_proof_image',
        'payment_proof_notes',
        // --- AKHIR TAMBAHAN ---
    ];

    // --- TAMBAHAN BARU: Appends ---
    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'payment_proof_image_url' // <-- Kita ingin URL ini selalu ada di JSON
    ];
    // --- AKHIR TAMBAHAN BARU ---


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

    // --- RELASI BARU ---
    /**
     * Get all of the chat messages for the booking.
     */
    public function chatMessages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }
    // --- AKHIR RELASI BARU ---

    // Tambahkan relasi lain jika perlu (Durasi, Tempat)
    public function durasiKonseling(): BelongsTo
    {
        return $this->belongsTo(DurasiKonseling::class);
    }

    public function tempatKonseling(): BelongsTo
    {
        return $this->belongsTo(TempatKonseling::class);
    }

    // --- TAMBAHAN BARU: Accessor untuk Bukti Pembayaran ---
    /**
     * Dapatkan URL lengkap untuk gambar bukti pembayaran.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute
     */
    protected function paymentProofImageUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->payment_proof_image
                // --- PERBAIKAN: Gunakan Storage::url() ---
                // Method ini adalah shortcut untuk Storage::disk('public')->url()
                // dan akan dipahami oleh linter Intelephense.
                ? Storage::url($this->payment_proof_image)
                : null,
        );
    }
    // --- AKHIR TAMBAHAN BARU & PERBAIKAN ---
}
