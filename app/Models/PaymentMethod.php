<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
// HAPUS: use Illuminate\Database\Eloquent\Casts\Attribute;

class PaymentMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'account_details',
        'image',
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
     * @param  string|null  $value
     * @return string|null
     */
    public function getImageUrlAttribute()
    {
        if ($this->attributes['image']) {
            /** @phpstan-ignore-next-line */
            return Storage::disk('public')->url($this->attributes['image']);
        }
        return null;
    }
}
