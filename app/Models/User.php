<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use App\Models\CounselorAvailability;
use App\Models\JenisKonseling; // [BARU] Import ini

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

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
        'metode_layanan',
        'rating',
        'universitas',
        'bank_name',
        'account_holder_name',
        'account_number',
    ];

    // [MODIFIKASI] Tambahkan 'spesialisasi_label' ke appends agar muncul di JSON
    protected $appends = ['avatar_url', 'spesialisasi_label'];

    protected $hidden = [
        'password',
        'remember_token',
        'avatar',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'spesialisasi' => 'array', // Array of IDs: [1, 2]
        'metode_layanan' => 'array',
        'tanggal_lahir' => 'date',
    ];

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'customer_id');
    }

    protected function avatarUrl(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (empty($this->avatar)) {
                    $name = urlencode($this->name);
                    return "https://ui-avatars.com/api/?name={$name}&background=EBF4FF&color=3B82F6&bold=true";
                }
                if (str_starts_with($this->avatar, 'http')) {
                    return $this->avatar;
                }
                return url('storage/' . $this->avatar);
            },
        );
    }

    /**
     * [BARU] Accessor untuk mengubah ID Spesialisasi menjadi Teks Label
     * Contoh: [1, 2] -> ["Stress", "Karir"]
     */
    protected function spesialisasiLabel(): Attribute
    {
        return Attribute::make(
            get: function () {
                // Jika kosong atau bukan array, return array kosong
                if (empty($this->spesialisasi) || !is_array($this->spesialisasi)) {
                    return [];
                }

                // Ambil nama dari tabel jenis_konselings berdasarkan ID yang disimpan
                // Menggunakan whereIn untuk efisiensi
                return JenisKonseling::whereIn('id', $this->spesialisasi)
                    ->pluck('jenis_konseling') // Ambil kolom nama saja
                    ->toArray();
            },
        );
    }

    public function practiceLocations(): BelongsToMany
    {
        return $this->belongsToMany(TempatKonseling::class, 'tempat_konseling_user', 'user_id', 'tempat_konseling_id');
    }

    public function availabilities(): HasMany
    {
        return $this->hasMany(CounselorAvailability::class, 'counselor_id');
    }

    public function helpMessages()
    {
        return $this->hasMany(HelpMessage::class, 'user_id');
    }
    public function receivesBroadcastNotificationsOn()
    {
        return 'App.Models.User.' . $this->id;
    }
}
