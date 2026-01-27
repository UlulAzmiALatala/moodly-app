<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PayoutProcessed extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;

    public function __construct(Booking $booking)
    {
        // Kita butuh data booking untuk info nominal & sesi
        $this->booking = $booking;
    }

    public function build()
    {
        return $this->subject('Dana Konseling Telah Dicairkan 💸')
            ->view('emails.payout_processed');
    }
}
