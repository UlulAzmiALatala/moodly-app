<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PayoutReceived extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        $amount = number_format($this->booking->counselor_net, 0, ',', '.');

        return [
            'booking_id' => $this->booking->id,
            'title' => 'Gaji Masuk: Rp ' . $amount,
            'message' => "Admin telah mentransfer pendapatan untuk sesi #{$this->booking->id}. Klik untuk lihat bukti transfer.",
            'type' => 'payout_received',
            // [UBAH DISINI] Arahkan ke halaman receipt spesifik
            'link' => "/counselor/history/receipt/{$this->booking->id}",
            'icon' => 'Wallet',
            'color' => 'text-green-600',
            'bg_color' => 'bg-green-100',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
