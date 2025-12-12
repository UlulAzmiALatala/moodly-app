<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue; // Pakai Queue biar admin ga nunggu loading
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Booking;

class PayoutActionRequired extends Notification implements ShouldQueue
{
    use Queueable;

    public $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    public function via($notifiable)
    {
        return ['database']; // Masuk ke lonceng Admin
    }

    public function toArray($notifiable)
    {
        return [
            'booking_id' => $this->booking->id,
            'title' => 'Payout Diperlukan',
            'message' => "Sesi #{$this->booking->id} selesai. Harap proses pembayaran ke Konselor.",
            // Link ini mengarah ke halaman Keuangan Admin (yang nanti kita buat/cek)
            'link' => "/super-admin/keuangan/" . $this->booking->id,
            'type' => 'payout_required',
            'icon' => 'Wallet', // Ikon Dompet
            'color' => 'text-orange-500', // Warna Orange (Warning/Action Needed)
            'bg_color' => 'bg-orange-100',
        ];
    }
}
