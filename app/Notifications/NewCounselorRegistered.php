<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue; // <--- Buat Database (biar gak lemot)
use Illuminate\Contracts\Broadcasting\ShouldBroadcast; // <--- WAJIB TAMBAH INI BUAT REVERB
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\User;

class NewCounselorRegistered extends Notification implements ShouldQueue, ShouldBroadcast // <--- Tambahkan ShouldBroadcast di sini
{
    use Queueable;

    public $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase($notifiable)
    {
        return [
            'user_id' => $this->user->id,
            'title' => 'Pendaftaran Konselor',
            'message' => "{$this->user->name} mendaftar sebagai konselor. Harap verifikasi.",
            'link' => "/admin/verifikasi-konselor",
            'type' => 'new_counselor',
            'icon' => 'UserCheck',
            'color' => 'text-blue-600',
            'bg_color' => 'bg-blue-50',
        ];
    }

    public function toBroadcast($notifiable)
    {
        // Tips: Kirim data yang sama dengan database biar frontend gak bingung parsingnya
        return new BroadcastMessage([
            'id' => $this->id,
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
            'data' => $this->toDatabase($notifiable), // Reuse data database biar konsisten
        ]);
    }
}
