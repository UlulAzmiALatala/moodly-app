<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\Refund;

class RefundStatusUpdated extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public $refund;
    public $message;
    public $link;

    public function __construct(Refund $refund)
    {
        $this->refund = $refund;
        $bookingId = $refund->booking_id;

        if ($refund->status === 'Selesai') {
            $this->message = "Refund Booking #{$bookingId} BERHASIL ditransfer.";
        } elseif ($refund->status === 'Ditolak') {
            $this->message = "Pengajuan Refund Booking #{$bookingId} DITOLAK.";
        } else {
            $this->message = "Status refund Booking #{$bookingId}: {$refund->status}";
        }

        // --- PERBAIKAN: SESUAIKAN DENGAN ROUTER ANDA ---
        $this->link = "/notification/refund/{$bookingId}";
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'booking_id' => $this->refund->booking_id,
            'refund_id' => $this->refund->id,
            'message' => $this->message,
            'link' => $this->link, // Link baru tersimpan di sini
            'status' => $this->refund->status
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
            'data' => $this->toDatabase($notifiable),
        ]);
    }
}
