<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use App\Notifications\NewCounselorRegistered;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class CounselorRegisterController extends Controller
{
    /**
     * Handle an incoming counselor registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): Response
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
            'phone' => ['required', 'string', 'max:20'],
            'gender' => ['required', 'string', 'in:Laki-laki,Perempuan'],
            'tanggal_lahir' => ['required', 'date'],
            'province' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'district' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:10'],
            'street_address' => ['required', 'string'],
            'surat_izin_praktik' => ['required', 'string', 'max:255'],
            'universitas' => ['required', 'string', 'max:255'],
            'spesialisasi' => ['required', 'array', 'min:1'],
            'spesialisasi.*' => ['integer', 'exists:jenis_konselings,id'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'role' => 'konselor',
            'status' => 'Verifikasi',
            'phone' => $request->phone,
            'gender' => $request->gender,
            'tanggal_lahir' => $request->tanggal_lahir,
            'province' => $request->province,
            'city' => $request->city,
            'district' => $request->district,
            'postal_code' => $request->postal_code,
            'street_address' => $request->street_address,
            'surat_izin_praktik' => $request->surat_izin_praktik,
            'universitas' => $request->universitas,
            'spesialisasi' => $request->spesialisasi, // Pastikan Model User memiliki cast 'array'
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        // Trigger Event Realtime ke Admin (Toast Notifikasi)
        $admins = User::whereIn('role', ['admin', 'super-admin'])->get();
        Notification::send($admins, new NewCounselorRegistered($user));

        Auth::login($user);

        return response()->noContent();
    }
}
