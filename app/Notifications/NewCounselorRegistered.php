<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\User;

class NewCounselorRegistered extends Notification implements ShouldQueue
{
    use Queueable;

    public $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    // PENTING: return database DAN broadcast
    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    // Data yang disimpan ke Database (History Lonceng)
    public function toDatabase($notifiable)
    {
        return [
            'user_id' => $this->user->id,
            'title' => 'Pendaftaran Konselor',
            'message' => "{$this->user->name} mendaftar sebagai konselor. Harap verifikasi.",
            'link' => "/admin/verifikasi-konselor",
            'type' => 'new_counselor', // Sesuai Frontend React
            'icon' => 'UserCheck',
            'color' => 'text-blue-600',
            'bg_color' => 'bg-blue-50',
        ];
    }

    // Data yang dikirim Real-time (Popup Cling!)
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
