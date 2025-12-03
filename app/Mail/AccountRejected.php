<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AccountRejected extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $reason;

    public function __construct(User $user, $reason)
    {
        $this->user = $user;
        $this->reason = $reason;
    }

    public function build()
    {
        return $this->subject('Pembaruan Status Verifikasi Akun Moodly')
            ->view('emails.account_rejected');
    }
}
