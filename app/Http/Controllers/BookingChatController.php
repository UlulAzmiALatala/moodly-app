<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use App\Events\NewChatMessage; // <-- TAMBAHKAN IMPORT EVENT

// TODO: Import Notifikasi jika sudah siap
// use App\Notifications\NewChatMessageNotification;

class BookingChatController extends Controller
{
    /**
     * Mengambil pesan chat DAN data booking untuk booking tertentu.
     * GET /api/booking/{booking}/chat/messages
     */
    public function index(Booking $booking)
    {
        try {
            // Otorisasi: Pastikan user yang login adalah customer atau konselor dari booking ini
            Gate::authorize('viewChat', $booking);

            // --- PERUBAHAN: Load data konselor/customer untuk header chat ---
            $booking->load([
                'konselor:id,name,avatar',
                'customer:id,name,avatar'
            ]);
            // --- AKHIR PERUBAHAN ---

            // Ambil pesan, urutkan dari yang terlama, sertakan data pengirim
            $messages = $booking->chatMessages()
                ->with('sender:id,name,avatar') // Hanya ambil kolom yg perlu dari sender
                ->orderBy('created_at', 'asc')
                ->get();

            // TODO: Tandai pesan sebagai sudah dibaca (jika perlu)

            // --- PERUBAHAN: Kembalikan booking dan messages ---
            return response()->json([
                'booking' => $booking,
                'messages' => $messages,
            ]);
            // --- AKHIR PERUBAHAN ---

        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            Log::warning('Authorization failed for viewing chat:', ['booking_id' => $booking->id, 'user_id' => Auth::id()]);
            return response()->json(['message' => 'Anda tidak diizinkan mengakses chat ini.'], 403);
        } catch (\Exception $e) {
            Log::error('Error fetching chat messages:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal mengambil data chat.'], 500);
        }
    }

    /**
     * Menyimpan pesan baru untuk booking tertentu.
     * POST /api/booking/{booking}/chat/messages
     */
    public function store(Request $request, Booking $booking)
    {
        try {
            // Otorisasi: Pastikan user boleh mengirim pesan (cek status booking)
            Gate::authorize('sendMessage', $booking);

            // Validasi
            $validated = $request->validate([
                'message' => 'required|string|max:1000',
            ]);

            // Buat pesan baru
            $message = $booking->chatMessages()->create([
                'sender_id' => Auth::id(),
                'message' => $validated['message'],
                'is_read' => false,
            ]);

            // Muat data pengirim untuk respon
            $message->load('sender:id,name,avatar');

            // --- PERBAIKAN: Kirim event broadcast ---
            // Siarkan event ke user lain (bukan si pengirim)
            broadcast(new NewChatMessage($message))->toOthers();
            // --- AKHIR PERBAIKAN ---

            return response()->json($message, 201); // 201 = Created

        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            Log::warning('Authorization failed for sending message:', ['booking_id' => $booking->id, 'user_id' => Auth::id()]);
            // Cek status booking untuk pesan error yg lebih spesifik
            if (!in_array($booking->status_pesanan, ['Aktif', 'Dijadwalkan'])) {
                return response()->json(['message' => 'Sesi konseling ini sudah berakhir.'], 403);
            }
            return response()->json(['message' => 'Anda tidak diizinkan mengirim pesan.'], 403);
        } catch (\Exception $e) {
            Log::error('Error storing chat message:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal mengirim pesan.'], 500);
        }
    }
}
