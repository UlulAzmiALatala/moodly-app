<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage; // <-- TAMBAHKAN
// HAPUS: use Illuminate\Database\Eloquent\Casts\Attribute;

class JenisKonseling extends Model
{
    use HasFactory;

    /**
     * Atribut yang bisa diisi secara massal (mass assignable).
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'jenis_konseling',
        'tipe_layanan',
        'image',
        'biaya_layanan',
        'nilai',
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

    /**
     * PERBAIKAN: Accessor (gaya LAMA) untuk mendapatkan URL lengkap gambar.
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
        return 'https://placehold.co/400x300/E0F2FE/0EA5E9?text=Layanan';
    }
}
