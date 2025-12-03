<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\Booking;
use App\Models\User;

class NewBookingReceived extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public $booking;
    public $message;
    public $link;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
        $customerName = $booking->customer->name ?? 'Customer';

        // Pesan untuk Konselor
        $this->message = "Pesanan baru masuk dari {$customerName}. Segera cek jadwal Anda.";

        // Link mengarah ke Detail Jadwal Konselor
        $this->link = "/counselor/schedule/{$booking->id}";
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'booking_id' => $this->booking->id,
            'title' => 'Pesanan Baru', // Title tambahan agar UI lebih rapi
            'message' => $this->message,
            'link' => $this->link,
            'type' => 'new_booking'
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
            'data' => $this->toDatabase($notifiable),
        ]);
    }
}
