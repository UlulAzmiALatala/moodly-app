<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow; // Pakai 'Now' biar instan (bypass antrian)
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewCounselorRegistered implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;

    /**
     * Create a new event instance.
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        // Channel global khusus admin (sesuai PaymentProofUploaded)
        return [
            new PrivateChannel('admin-notifications'),
        ];
    }

    /**
     * The event's broadcast name.
     * PENTING: Frontend akan listen ke nama ini (".NewCounselorRegistered")
     */
    public function broadcastAs(): string
    {
        return 'NewCounselorRegistered';
    }

    /**
     * Get the data to broadcast.
     * TAMBAHAN: Kita format datanya biar Frontend tinggal tampilkan saja.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->user->id,
            'title' => 'Pendaftaran Konselor Baru',
            'message' => "{$this->user->name} baru saja mendaftar. Mohon verifikasi berkas.",
            'link' => '/admin/verifikasi-konselor', // Saat toast diklik, arahkan kesini
            'type' => 'info', // Bisa dipakai frontend untuk warna icon (biru/hijau)
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
