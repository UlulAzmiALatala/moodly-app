<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\HelpMessage;
use App\Events\NewHelpMessage;

class HelpChatController extends Controller
{
    // Ambil riwayat chat bantuan
    public function index()
    {
        $user = Auth::user();
        return HelpMessage::where('user_id', $user->id)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    // Kirim pesan
    public function store(Request $request)
    {
        $request->validate(['message' => 'required|string']);
        $user = Auth::user();

        $message = HelpMessage::create([
            'user_id' => $user->id,
            'sender_id' => $user->id,
            'message' => $request->message,
        ]);

        // Broadcast ke user (untuk update realtime jika admin membalas, 
        // dan agar admin di dashboard juga bisa mendengarkan channel ini nanti)
        broadcast(new NewHelpMessage($message));

        return response()->json($message, 201);
    }
}
