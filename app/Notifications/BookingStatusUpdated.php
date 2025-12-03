<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Models\Booking;
use App\Models\User;

class BookingStatusUpdated extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public Booking $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Menyusun data untuk disimpan ke Database (Tabel Notifications)
     */
    public function toDatabase(User $notifiable): array
    {
        $message = '';
        $link = '';
        $status = $this->booking->status_pesanan;
        $customerName = $this->booking->customer->name ?? 'Customer';
        $konselorName = $this->booking->konselor->name ?? 'Konselor';

        // --- A. LOGIKA JIKA PENERIMA ADALAH KONSELOR ---
        if ($notifiable->role === 'konselor') {
            $link = "/counselor/schedule/{$this->booking->id}"; // Link ke Detail Jadwal Konselor

            switch ($status) {
                case 'Dibatalkan':
                case 'DIBATALKAN':
                    $message = "Customer {$customerName} telah membatalkan pesanan #{$this->booking->id}.";
                    break;
                case 'Selesai':
                case 'SELESAI':
                    $message = "Sesi Booking #{$this->booking->id} telah diselesaikan.";
                    break;
                case 'Dijadwalkan':
                    $message = "Sesi baru dengan {$customerName} telah terkonfirmasi.";
                    break;
                default:
                    $message = "Status Booking #{$this->booking->id} diperbarui menjadi: $status";
            }
        }

        // --- B. LOGIKA JIKA PENERIMA ADALAH CUSTOMER ---
        else {
            $link = "/history/{$this->booking->id}"; // Default link ke detail history

            switch ($status) {
                case 'Dijadwalkan':
                    $message = "Pembayaran sukses! Sesi dengan {$konselorName} telah dijadwalkan.";
                    break;
                case 'Dibatalkan':
                case 'DIBATALKAN':
                    $message = "Pesanan #{$this->booking->id} telah dibatalkan.";
                    $link = "/history/cancel-detail/{$this->booking->id}";
                    break;
                case 'Pembayaran Ditolak':
                    $message = "Pembayaran ditolak. Mohon upload bukti yang valid.";
                    $link = "/booking/upload-proof/{$this->booking->id}";
                    break;
                case 'Selesai':
                case 'SELESAI':
                    $message = "Sesi selesai. Terima kasih telah menggunakan layanan kami.";
                    $link = "/history/rating/{$this->booking->id}";
                    break;
                case 'Menunggu Konfirmasi Customer':
                    $message = "{$konselorName} mengajukan perubahan jadwal. Mohon konfirmasi.";
                    // Arahkan ke halaman khusus notifikasi schedule jika ada, atau history biasa
                    $link = "/notification/schedule/{$this->booking->id}";
                    break;
                default:
                    $message = "Status pesanan #{$this->booking->id} berubah menjadi: $status";
            }
        }

        return [
            'booking_id' => $this->booking->id,
            'title' => 'Update Status', // Judul untuk UI notifikasi
            'message' => $message,
            'link' => $link,
            'status' => $status,
            'type' => 'status_update'
        ];
    }

    /**
     * Menyusun data untuk dikirim Real-time (Reverb/Pusher)
     */
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
