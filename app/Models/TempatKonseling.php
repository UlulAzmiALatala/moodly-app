<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
// HAPUS: use Illuminate\Database\Eloquent\Casts\Attribute;

class TempatKonseling extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_tempat',
        'alamat',
        'image',
        'rating',
        'review_count',
        'status',
    ];

    /**
     * Tambahkan 'image_url' ke JSON
     */
    protected $appends = ['image_url'];

    /**
     * Sembunyikan 'image' (path mentah) dari JSON
     */
    protected $hidden = ['image'];


    protected $casts = [
        'rating' => 'float',
    ];

    /**
     * PERBAIKAN: Accessor (gaya LAMA) untuk mendapatkan URL gambar lengkap.
     *
     * @return string|null
     */
    public function getImageUrlAttribute()
    {
        if (isset($this->attributes['image']) && $this->attributes['image']) {
            /** @phpstan-ignore-next-line */
            return Storage::disk('public')->url($this->attributes['image']);
        }
        // Ganti dengan URL placeholder jika Anda mau
        return 'https://placehold.co/400x300/E0F2FE/0EA5E9?text=Tempat';
    }

    // ... (Relasi lain) ...
}
