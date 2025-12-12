<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CounselorAvailability extends Model
{
    use HasFactory;

    // Nama tabel
    protected $table = 'counselor_availabilities';

    protected $fillable = [
        'counselor_id',
        'tanggal_konsultasi',
        'start_time',
        'end_time',
    ];

    // [TAMBAHAN PENTING] Casting agar tanggal otomatis jadi object Carbon
    protected $casts = [
        'tanggal_konsultasi' => 'date:Y-m-d',
    ];

    /**
     * Relasi ke konselor (User model).
     */
    public function counselor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'counselor_id');
    }
}
