<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use App\Events\NewChatMessage;

class BookingChatController extends Controller
{
    /**
     * Mengambil pesan chat DAN data booking untuk booking tertentu.
     * GET /api/booking/{booking}/chat/messages
     */
    public function index(Booking $booking)
    {
        try {
            Gate::authorize('viewChat', $booking);

            // --- PERBAIKAN DI SINI: Tambahkan 'durasiKonseling' ---
            $booking->load([
                'konselor:id,name,avatar',
                'customer:id,name,avatar',
                'durasiKonseling:id,durasi_menit' // <-- INI YANG PALING PENTING
            ]);
            // --- AKHIR PERBAIKAN ---

            $messages = $booking->chatMessages()
                ->with('sender:id,name,avatar')
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json([
                'booking' => $booking, // Sekarang $booking membawa data durasi
                'messages' => $messages,
            ]);
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
            Gate::authorize('sendMessage', $booking);

            $validated = $request->validate([
                'message' => 'required|string|max:1000',
            ]);

            $message = $booking->chatMessages()->create([
                'sender_id' => Auth::id(),
                'message' => $validated['message'],
                'is_read' => false,
            ]);

            $message->load('sender:id,name,avatar');

            broadcast(new NewChatMessage($message));

            return response()->json($message, 201);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            Log::warning('Authorization failed for sending message:', ['booking_id' => $booking->id, 'user_id' => Auth::id()]);

            // Cek status sesi (logika ini sudah benar)
            $activeStatuses = ['Dijadwalkan', 'Aktif', 'Proses', 'Menunggu Konfirmasi', 'Berlangsung'];
            if (!in_array($booking->status_pesanan, $activeStatuses)) {
                return response()->json(['message' => 'Sesi konseling ini sudah berakhir.'], 403);
            }
            return response()->json(['message' => 'Anda tidak diizinkan mengirim pesan.'], 403);
        } catch (\Exception $e) {
            Log::error('Error storing chat message:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal mengirim pesan.'], 500);
        }
    }
}
