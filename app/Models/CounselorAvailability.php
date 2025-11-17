<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CounselorAvailability extends Model
{
    use HasFactory;

    // Tentukan nama tabel jika tidak standar
    protected $table = 'counselor_availabilities';

    /**
     * The attributes that are mass assignable.
     * (Ini adalah perbaikan untuk error 500)
     */
    protected $fillable = [
        'counselor_id',
        'tanggal_konsultasi', // <-- Kita ganti dari day_of_week
        'start_time',
        'end_time',
    ];

    /**
     * Relasi ke konselor (User model).
     */
    public function counselor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'counselor_id');
    }
}
