<?php

namespace App\Events;

use App\Models\ChatMessage; // <-- Import model ChatMessage
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel; // <-- Gunakan PrivateChannel
use Illuminate\Contracts\Broadcasting\ShouldBroadcast; // <-- Implement ini
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewChatMessage implements ShouldBroadcast // <-- Implement ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Pesan yang akan disiarkan.
     *
     * @var \App\Models\ChatMessage
     */
    public ChatMessage $message; // <-- Buat properti publik untuk data pesan

    /**
     * Create a new event instance.
     *
     * @param \App\Models\ChatMessage $message
     */
    public function __construct(ChatMessage $message)
    {
        $this->message = $message; // <-- Tetapkan pesan saat event dibuat
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        // Siarkan ke channel privat berdasarkan ID booking.
        // Contoh: 'chat.16', 'chat.17', dst.
        return new PrivateChannel('chat.' . $this->message->booking_id);
    }

    /**
     * Nama event yang akan disiarkan.
     * (Default-nya adalah 'NewChatMessage', tapi ini lebih bersih)
     */
    public function broadcastAs()
    {
        return 'new-message';
    }

    /**
     * Data yang akan disiarkan.
     * (Kita kirim seluruh data $message yang sudah di-load)
     */
    public function broadcastWith()
    {
        return ['message' => $this->message];
    }
}
