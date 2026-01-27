<?php

namespace App\Events;

use App\Models\Refund;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RefundRequested implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $refund;

    public function __construct(Refund $refund)
    {
        // Pastikan load booking dan customer agar nama/nominal bisa diambil
        $this->refund = $refund->load(['booking.customer']);
    }

    public function broadcastOn(): array
    {
        // Tetap di channel 'admin-notifications' biar satu pintu
        return [
            new PrivateChannel('admin-notifications'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'RefundRequested';
    }

    /**
     * [BARU] Format data khusus untuk Toast Notifikasi Frontend
     */
    public function broadcastWith(): array
    {
        // Ambil nama customer (dari relasi booking)
        $customerName = $this->refund->booking->customer->name ?? 'Customer';
        $amount = number_format($this->refund->jumlah_refund ?? 0, 0, ',', '.');

        return [
            'id' => $this->refund->id,
            'title' => 'Pengajuan Refund Baru',
            'message' => "Order #{$this->refund->booking_id} ({$customerName}) mengajukan refund Rp {$amount}.",
            'link' => '/admin/refund-management', // Link sesuai Sidebar baru
            'type' => 'warning', // Warna kuning (Penting!)
            'timestamp' => now()->toIso8601String(),
            'data' => [
                'booking_id' => $this->refund->booking_id,
                'status' => 'Menunggu Persetujuan'
            ]
        ];
    }
}
