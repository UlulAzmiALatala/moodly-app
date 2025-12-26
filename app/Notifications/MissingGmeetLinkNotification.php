<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\Booking;

class MissingGmeetLinkNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'booking_id' => $this->booking->id,
            'title' => 'Link GMeet Belum Ada!',
            'message' => "Sesi #{$this->booking->id} dengan {$this->booking->customer->name} segera mulai, tapi link meeting belum diisi!",
            'link' => "/admin/booking-management/{$this->booking->id}",
            'type' => 'missing_link', // Tipe baru
            'icon' => 'AlertTriangle',
            'color' => 'text-red-600',
            'bg_color' => 'bg-red-100',
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
            'data' => $this->toDatabase($notifiable),
        ]);
    }
}
