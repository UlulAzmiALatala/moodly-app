<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\Refund;

class RefundRequested extends Notification implements ShouldQueue
{
    use Queueable;

    public $refund;

    public function __construct(Refund $refund)
    {
        $this->refund = $refund;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'booking_id' => $this->refund->booking_id,
            'refund_id' => $this->refund->id,
            'title' => 'Pengajuan Refund',
            'message' => "Ada pengajuan refund baru. Harap tinjau segera.",
            'link' => '/super-admin/refund-management',
            'type' => 'refund_request', // Sesuai Frontend React
            'icon' => 'FileText',
            'color' => 'text-purple-600',
            'bg_color' => 'bg-purple-50',
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
