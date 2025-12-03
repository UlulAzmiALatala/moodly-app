<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\Booking;
use App\Models\User;

class RescheduleRequested extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public Booking $booking;

    public function __construct(Booking $booking)
    {
        // Load relasi nama agar pesan lebih personal
        $this->booking = $booking->load('konselor:id,name', 'customer:id,name');
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase(User $notifiable): array
    {
        $message = "";
        $link = "";

        $customerName = $this->booking->customer->name ?? 'Customer';
        $konselorName = $this->booking->konselor->name ?? 'Konselor';

        // --- A. JIKA PENERIMA ADALAH KONSELOR ---
        // Artinya: Customer yang meminta reschedule
        if ($notifiable->role === 'konselor') {
            $message = "Customer {$customerName} mengajukan perubahan jadwal untuk Booking #{$this->booking->id}. Mohon konfirmasi.";

            // Link ke halaman detail jadwal konselor (untuk Approve/Reject)
            $link = "/counselor/schedule/{$this->booking->id}";
        }

        // --- B. JIKA PENERIMA ADALAH CUSTOMER ---
        // Artinya: Konselor yang meminta reschedule
        else {
            $message = "{$konselorName} mengajukan perubahan jadwal baru. Mohon konfirmasi ketersediaan Anda.";

            // Link ke halaman khusus notifikasi schedule di Customer
            $link = "/notification/schedule/{$this->booking->id}";
        }

        return [
            'booking_id' => $this->booking->id,
            'title' => 'Permintaan Reschedule',
            'message' => $message,
            'link' => $link,
            'type' => 'reschedule_request'
        ];
    }

    public function toBroadcast(User $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
            'data' => $this->toDatabase($notifiable),
        ]);
    }
}
