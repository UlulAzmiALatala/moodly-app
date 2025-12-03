<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\Booking;

class NewRatingReceived extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public $booking;
    public $message;
    public $link;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
        $customerName = $booking->customer->name ?? 'Customer';
        $rating = $booking->rating;

        // Pesan Menarik
        $this->message = "Selamat! Anda menerima rating {$rating} Bintang dari {$customerName}.";

        // Trik Routing: Kita tambahkan query param '?status=completed' 
        // agar Frontend nanti tahu harus membuka tab "Selesai"
        $this->link = "/counselor/history?status=completed";
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'booking_id' => $this->booking->id,
            'title' => 'Ulasan Baru',
            'message' => $this->message,
            'link' => $this->link,
            'type' => 'new_rating'
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
