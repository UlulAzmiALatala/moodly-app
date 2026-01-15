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

class PaymentVerified implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking->load(['konselor', 'jenisKonseling', 'durasiKonseling']);
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('customer.' . $this->booking->customer_id),
        ];
    }

    // --- TAMBAHKAN METHOD BARU INI ---
    /**
     * Tentukan nama event yang akan disiarkan.
     */
    public function broadcastAs(): string
    {
        return 'PaymentVerified'; // Nama event kustom (TANPA TITIK)
    }
    // --- AKHIR TAMBAHAN ---
}
