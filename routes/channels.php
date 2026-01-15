<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Booking;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Di sini Anda mendaftarkan semua saluran siaran acara yang didukung oleh
| aplikasi Anda. Callback otorisasi saluran yang diberikan digunakan
| untuk memeriksa apakah pengguna yang diautentikasi dapat mendengarkan saluran tersebut.
|
*/

// 1. Default Laravel Channel (Bawaan)
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// 2. Channel Pribadi User (PENTING: Untuk Update Status Real-time / Blur Layar)
// Digunakan di: MobileLayout.jsx (listen .UserStatusUpdated)
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// 3. Channel Chat Booking (Logika Booking Anda)
Broadcast::channel('chat.{bookingId}', function ($user, $bookingId) {
    $booking = Booking::find($bookingId);

    if (!$booking) {
        return false;
    }

    // Izinkan jika user adalah customer ATAU konselor dari booking tersebut
    return (int) $user->id === (int) $booking->customer_id ||
        (int) $user->id === (int) $booking->konselor_id;
});

// 4. Channel Notifikasi Customer
Broadcast::channel('customer.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id && $user->role === 'customer';
});

// 5. Channel Notifikasi Konselor (BARU: Untuk fitur notifikasi konselor)
Broadcast::channel('counselor.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id && ($user->role === 'konselor' || $user->role === 'counselor');
});

// 6. Channel Help Chat (Customer Support)
Broadcast::channel('help.user.{id}', function ($user, $id) {
    // User sendiri boleh akses, Admin/SuperAdmin juga boleh akses untuk membalas
    return (int) $user->id === (int) $id || in_array($user->role, ['admin', 'super-admin']);
});

// 7. Channel Admin Notifications (Global Admin Channel)
Broadcast::channel('admin-notifications', function ($user) {
    return in_array($user->role, ['admin', 'super-admin']);
});
