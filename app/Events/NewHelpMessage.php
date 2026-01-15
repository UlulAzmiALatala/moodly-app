<?php

namespace App\Events;

use App\Models\HelpMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewHelpMessage implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(HelpMessage $message)
    {
        $this->message = $message;
    }

    public function broadcastOn(): array
    {
        // Channel khusus per user untuk bantuan: help.user.{id}
        return [
            new PrivateChannel('help.user.' . $this->message->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'NewHelpMessage';
    }
}
