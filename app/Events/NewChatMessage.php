<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
// --- PERBAIKAN: Ganti ShouldBroadcast menjadi ShouldBroadcastNow ---
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
// --- AKHIR PERBAIKAN ---
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// --- PERBAIKAN: Implementasi ShouldBroadcastNow ---
class NewChatMessage implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Pesan yang akan disiarkan.
     *
     * @var \App\Models\ChatMessage
     */
    public ChatMessage $message;

    /**
     * Create a new event instance.
     *
     * @param \App\Models\ChatMessage $message
     */
    public function __construct(ChatMessage $message)
    {
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        // Siarkan ke channel privat berdasarkan ID booking.
        return new PrivateChannel('chat.' . $this->message->booking_id);
    }

    /**
     * Nama event yang akan disiarkan.
     */
    public function broadcastAs()
    {
        return 'new-message';
    }

    /**
     * Data yang akan disiarkan.
     */
    public function broadcastWith()
    {
        return ['message' => $this->message];
    }
}
