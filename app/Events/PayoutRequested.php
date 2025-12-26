<?php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PayoutRequested implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $booking;

    public function __construct(Booking $booking)
    {
        // Load data penting untuk notifikasi popup admin
        $this->booking = $booking->load(['konselor', 'jenisKonseling']);
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin-notifications'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'PayoutActionRequired'; // Nama event yang didengar Frontend
    }
}
