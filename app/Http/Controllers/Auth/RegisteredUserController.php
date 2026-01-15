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

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): Response
    {
        // --- PERBAIKAN: Tambahkan validasi untuk field baru Anda ---
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => ['required', 'string', 'max:20'], // <-- Dibuat 'required'

            // --- DATA BARU (SESUAI PERMINTAAN ANDA) ---
            'gender' => ['required', 'string', 'in:Laki-laki,Perempuan'],
            'tanggal_lahir' => ['required', 'date'],
            // --- AKHIR DATA BARU ---

            // Data Alamat (dari AddressPage.jsx)
            'province' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'district' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:10'],
            'street_address' => ['required', 'string'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => 'customer', // Ini HANYA untuk customer
            'status' => 'Verifikasi', // Status awal
            'phone' => $request->phone,

            // --- DATA BARU ---
            'gender' => $request->gender,
            'tanggal_lahir' => $request->tanggal_lahir,
            // --- AKHIR DATA BARU ---

            // Alamat
            'province' => $request->province,
            'city' => $request->city,
            'district' => $request->district,
            'postal_code' => $request->postal_code,
            'street_address' => $request->street_address,

            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return response()->noContent();
    }
}
