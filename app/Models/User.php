<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\HasApiTokens;
// HAPUS: use Illuminate\Database\Eloquent\Casts\Attribute;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'avatar',
        'email',
        'gender',
        'tanggal_lahir',
        'role',
        'status',
        'phone',
        'province',
        'city',
        'district',
        'postal_code',
        'street_address',
        'balance',
        'password',
        'surat_izin_praktik',
        'spesialisasi',
        'metode_layanan', // <-- TAMBAHKAN INI
        'rating',
        'universitas',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['avatar_url'];


    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'avatar', // Sembunyikan path mentah 'avatar'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'spesialisasi' => 'array',
        'metode_layanan' => 'array',
        'tanggal_lahir' => 'date',
    ];

    /**
     * Get all of the bookings for the User (sebagai customer).
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'customer_id');
    }

    /**
     * PERBAIKAN: Accessor (gaya LAMA) untuk mendapatkan URL avatar.
     *
     * @return string|null
     */
    public function getAvatarUrlAttribute()
    {
        if (isset($this->attributes['avatar']) && $this->attributes['avatar']) {
            /** @phpstan-ignore-next-line */
            return Storage::disk('public')->url($this->attributes['avatar']);
        }

        // Fallback ke UI Avatars jika tidak ada avatar
        $name = urlencode($this->name);
        return "https://ui-avatars.com/api/?name={$name}&background=EBF4FF&color=3B82F6&bold=true";
    }
}
