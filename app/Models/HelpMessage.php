<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HelpMessage extends Model
{
    protected $fillable = ['user_id', 'sender_id', 'message', 'is_read'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
