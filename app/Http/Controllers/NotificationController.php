<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User; // 1. Tambahkan Import Model User

class NotificationController extends Controller
{
    /**
     * Ambil daftar notifikasi user.
     * Digunakan untuk Dropdown Admin & Halaman Notifikasi.
     */
    public function index()
    {
        /** @var User $user */ // 2. Tambahkan Type Hint ini
        $user = Auth::user();

        // PERBAIKAN: Gunakan get() bukan paginate() agar format JSON-nya array langsung.
        // Frontend Anda menggunakan .map(), jadi butuh Array, bukan Paginator object.
        return $user->notifications()->latest()->limit(50)->get();
    }

    /**
     * Ambil jumlah notifikasi yang belum dibaca (Badge Counter).
     */
    public function status()
    {
        /** @var User $user */ // 3. Tambahkan Type Hint ini
        $user = Auth::user();

        return response()->json([
            'unreadCount' => $user->unreadNotifications()->count()
        ]);
    }

    /**
     * Tandai notifikasi sudah dibaca.
     * Bisa satu (by ID) atau semua.
     */
    public function markAsRead(Request $request)
    {
        /** @var User $user */ // 4. Tambahkan Type Hint ini
        $user = Auth::user();

        // 1. Jika ada ID spesifik dikirim dari frontend
        if ($request->has('id')) {
            $notification = $user->unreadNotifications()
                ->where('id', $request->id)
                ->first();

            if ($notification) {
                $notification->markAsRead();
            }
        }
        // 2. Jika tidak ada ID (Tombol "Tandai Semua Dibaca")
        else {
            $user->unreadNotifications->markAsRead();
        }

        return response()->json(['message' => 'Notifikasi diperbarui.']);
    }
}
