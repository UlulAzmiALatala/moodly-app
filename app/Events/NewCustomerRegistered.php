<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewCustomerRegistered implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin-notifications'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'NewCustomerRegistered';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->user->id,
            'title' => 'Customer Baru Mendaftar',
            'message' => "{$this->user->name} mendaftar sebagai customer. Menunggu verifikasi.",
            'link' => '/admin/verifikasi-customer', // Sesuai sidebar baru
            'type' => 'info',
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
