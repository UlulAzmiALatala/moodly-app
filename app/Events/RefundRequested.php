<?php

namespace App\Events;

use App\Models\Refund;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RefundRequested implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $refund;

    public function __construct(Refund $refund)
    {
        $this->refund = $refund->load(['booking.customer', 'customer']);
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin-notifications'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'RefundRequested';
    }
}
