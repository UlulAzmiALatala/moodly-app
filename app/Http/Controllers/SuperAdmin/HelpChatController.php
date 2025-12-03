<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\HelpMessage;
use App\Events\NewHelpMessage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log; // Import Log

class HelpChatController extends Controller
{
    public function getConversations()
    {
        try {
            $users = User::whereHas('helpMessages')
                ->with(['helpMessages' => function ($query) {
                    $query->latest()->limit(1);
                }])
                ->get()
                ->map(function ($user) {
                    $lastMsg = $user->helpMessages->first();
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'avatar' => $user->avatar_url,
                        'last_message' => $lastMsg ? $lastMsg->message : '',
                        'last_time' => $lastMsg ? $lastMsg->created_at : null,
                        'unread_count' => 0
                    ];
                })
                ->sortByDesc('last_time')
                ->values();

            return response()->json($users);
        } catch (\Exception $e) {
            Log::error("Error Get Conversations: " . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function getMessages($userId)
    {
        try {
            $messages = HelpMessage::where('user_id', $userId)
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json($messages);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function reply(Request $request, $userId)
    {
        $request->validate(['message' => 'required|string']);

        // --- MULAI DEBUG ---
        try {
            $admin = Auth::user();

            // 1. Cek apakah Model HelpMessage sudah benar
            // Pastikan 'is_read' ada di $fillable di App\Models\HelpMessage.php
            $message = HelpMessage::create([
                'user_id' => $userId,
                'sender_id' => $admin->id,
                'message' => $request->message,
                'is_read' => true,
            ]);

            // 2. Cek Broadcast
            // Jika Reverb mati, ini akan throw error
            broadcast(new NewHelpMessage($message));

            return response()->json($message, 201);
        } catch (\Exception $e) {
            // Ini akan mencatat error asli ke storage/logs/laravel.log
            Log::error("Error Reply Chat SuperAdmin: " . $e->getMessage());

            // Ini akan mengirim pesan error ke Frontend (Network Tab)
            return response()->json([
                'message' => 'Gagal di Server: ' . $e->getMessage()
            ], 500);
        }
    }
}
