<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Booking; // <-- TAMBAHKAN IMPORT BOOKING

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// --- TAMBAHKAN BLOK INI UNTUK OTORISASI CHAT KITA ---
Broadcast::channel('chat.{bookingId}', function ($user, $bookingId) {

    // 1. Ambil booking dari database
    $booking = Booking::find($bookingId);

    // 2. Jika booking tidak ditemukan, tolak
    if (!$booking) {
        return false;
    }

    // 3. Izinkan jika user yang login adalah customer ATAU konselor
    return (int) $user->id === (int) $booking->customer_id ||
        (int) $user->id === (int) $booking->konselor_id;
});
