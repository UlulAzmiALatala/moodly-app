<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use App\Models\JenisKonseling; // Pastikan model ini ada

class CounselorRegisterController extends Controller
{
    /**
     * Handle an incoming counselor registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): Response
    {
        // Validasi khusus untuk Konselor
        $request->validate([
            // Data Diri
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
            'phone' => ['required', 'string', 'max:20'],
            'gender' => ['required', 'string', 'in:Laki-laki,Perempuan'],
            'tanggal_lahir' => ['required', 'date'],

            // Alamat (Sesuai permintaan Anda)
            'province' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'district' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:10'],
            'street_address' => ['required', 'string'],

            // Data Konselor
            'surat_izin_praktik' => ['required', 'string', 'max:255'],
            'universitas' => ['required', 'string', 'max:255'],
            'spesialisasi' => ['required', 'array', 'min:1'],
            'spesialisasi.*' => ['integer', 'exists:jenis_konselings,id'], // Validasi ID spesialisasi

            // Password
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => 'konselor', // <-- Peran sebagai Konselor
            'status' => 'Verifikasi', // Status awal, perlu diverifikasi admin
            'phone' => $request->phone,
            'gender' => $request->gender,
            'tanggal_lahir' => $request->tanggal_lahir,

            // Alamat
            'province' => $request->province,
            'city' => $request->city,
            'district' => $request->district,
            'postal_code' => $request->postal_code,
            'street_address' => $request->street_address,

            // Data Konselor
            'surat_izin_praktik' => $request->surat_izin_praktik,
            'universitas' => $request->universitas,
            'spesialisasi' => $request->spesialisasi, // Disimpan sebagai array JSON (pastikan Model User punya $casts)

            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return response()->noContent();
    }
}
