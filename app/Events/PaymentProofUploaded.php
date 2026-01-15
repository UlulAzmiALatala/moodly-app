<?php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentProofUploaded implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $booking;

    public function __construct(Booking $booking)
    {
        // Load customer agar namanya bisa muncul di notifikasi Admin
        $this->booking = $booking->load('customer');
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin-notifications'),
        ];
    }

    /**
     * PENTING: Nama Event Kustom.
     * Tanpa ini, nama eventnya jadi "App\Events\PaymentProofUploaded"
     * dan frontend yang listen ".PaymentProofUploaded" tidak akan merespon.
     */
    public function broadcastAs(): string
    {
        return 'PaymentProofUploaded';
    }
}
