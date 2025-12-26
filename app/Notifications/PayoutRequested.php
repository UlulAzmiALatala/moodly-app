<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\Booking;

class PayoutRequested extends Notification implements ShouldQueue
{
    use Queueable;

    public $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking->load('konselor');
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'booking_id' => $this->booking->id,
            'title' => 'Pembayaran Gaji Diperlukan',
            'message' => "Sesi #{$this->booking->id} selesai. Harap proses gaji konselor {$this->booking->konselor->name}.",
            'link' => '/super-admin/keuangan',
            'type' => 'payout_request', // Sesuai Frontend React
            'icon' => 'CreditCard',
            'color' => 'text-emerald-600',
            'bg_color' => 'bg-emerald-50',
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

    // Nama channel broadcast (Opsional, Laravel otomatis handle biasanya, tapi biar aman)
    public function broadcastType()
    {
        return 'PayoutActionRequired';
    }
}
