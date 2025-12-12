<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\Booking;

class RescheduleResponse extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public $booking;
    public $responseType; // 'approved' atau 'rejected'

    public function __construct(Booking $booking, string $responseType)
    {
        $this->booking = $booking;
        $this->responseType = $responseType;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase(object $notifiable): array
    {
        $customerName = $this->booking->customer->name ?? 'Customer';
        $link = "/counselor/schedule/{$this->booking->id}"; // Arahkan ke detail jadwal

        if ($this->responseType === 'approved') {
            $message = "{$customerName} MENYETUJUI pengajuan jadwal ulang Anda.";
            $icon = 'CheckCircle';
            $color = 'text-green-600';
            $bgColor = 'bg-green-100';
        } else {
            $message = "{$customerName} MENOLAK pengajuan jadwal ulang. Jadwal kembali ke semula.";
            $icon = 'XCircle';
            $color = 'text-red-600';
            $bgColor = 'bg-red-100';
        }

        return [
            'booking_id' => $this->booking->id,
            'title' => 'Respon Reschedule',
            'message' => $message,
            'link' => $link,
            'icon' => $icon,
            'color' => $color,
            'bg_color' => $bgColor,
            'type' => 'reschedule_response'
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
