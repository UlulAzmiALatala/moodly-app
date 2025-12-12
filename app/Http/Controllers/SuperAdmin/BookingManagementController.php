<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Events\PaymentVerified;
use App\Notifications\BookingStatusUpdated;

class BookingManagementController extends Controller
{
    public function index(Request $request)
    {
        try {
            $search = $request->query('search');

            $query = Booking::with([
                'customer:id,name,email,phone,avatar',
                'konselor:id,name,avatar'
            ]);

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($c) use ($search) {
                            $c->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('konselor', function ($k) use ($search) {
                            $k->where('name', 'like', "%{$search}%");
                        });
                });
            }

            $bookings = $query->orderByRaw("CASE WHEN status_pesanan = 'Menunggu Verifikasi' THEN 1 ELSE 2 END")
                ->latest()
                ->paginate(10);

            return response()->json($bookings);
        } catch (\Exception $e) {
            Log::error("Error fetching bookings: " . $e->getMessage());
            return response()->json(['message' => 'Gagal memuat data pesanan: ' . $e->getMessage()], 500);
        }
    }

    public function show(Booking $booking)
    {
        // PERBAIKAN: Hapus 'paymentMethod' dari load karena kolom ID-nya tidak ada di DB
        return $booking->load([
            'customer',
            'konselor',
            'jenisKonseling',
            'durasiKonseling',
            'tempatKonseling',
            'refund'
        ]);
    }

    public function destroy(Booking $booking)
    {
        try {
            if ($booking->payment_proof_image) {
                Storage::disk('public')->delete($booking->payment_proof_image);
            }
            $booking->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Error deleting booking:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menghapus booking.'], 500);
        }
    }

    public function approvePayment(Booking $booking)
    {
        if ($booking->status_pesanan !== 'Menunggu Verifikasi') {
            return response()->json([
                'message' => 'Hanya booking dengan status "Menunggu Verifikasi" yang bisa disetujui.'
            ], 409);
        }

        try {
            $booking->status_pesanan = 'Dijadwalkan';
            $booking->save();

            // 1. Kirim Notifikasi Database (Lonceng)
            try {
                $booking->customer->notify(new BookingStatusUpdated($booking->fresh()));
            } catch (\Exception $e) {
                Log::error('Gagal kirim notif database: ' . $e->getMessage());
            }

            // 2. [PENTING] Broadcast Event Realtime ke Reverb
            broadcast(new PaymentVerified($booking->fresh()));

            Log::info('Payment approved & broadcasted:', ['booking_id' => $booking->id]);

            return response()->json($booking->fresh()->load([
                'customer',
                'konselor',
                'jenisKonseling',
                'durasiKonseling',
                'tempatKonseling'
            ]));
        } catch (\Exception $e) {
            Log::error('Error approving payment:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menyetujui pembayaran.'], 500);
        }
    }

    public function rejectPayment(Request $request, Booking $booking)
    {
        if ($booking->status_pesanan !== 'Menunggu Verifikasi') {
            return response()->json([
                'message' => 'Hanya booking dengan status "Menunggu Verifikasi" yang bisa ditolak.'
            ], 409);
        }

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            if ($booking->payment_proof_image) {
                Storage::disk('public')->delete($booking->payment_proof_image);
            }

            $booking->status_pesanan = 'Pembayaran Ditolak';
            $booking->payment_proof_image = null;
            $booking->payment_proof_notes = null;
            $booking->catatan_pembatalan = $request->input('reason');
            $booking->save();

            // 1. Notifikasi Database
            try {
                $booking->customer->notify(new BookingStatusUpdated($booking->fresh()));
            } catch (\Exception $e) {
                Log::error('Gagal kirim notif database: ' . $e->getMessage());
            }

            // 2. [PENTING] Broadcast Realtime
            broadcast(new PaymentVerified($booking->fresh()));

            Log::info('Payment rejected & broadcasted:', ['booking_id' => $booking->id]);

            return response()->json($booking->fresh()->load([
                'customer',
                'konselor',
                'jenisKonseling',
                'durasiKonseling',
                'tempatKonseling'
            ]));
        } catch (\Exception $e) {
            Log::error('Error rejecting payment:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menolak pembayaran.'], 500);
        }
    }

    public function getPaymentProofImage(Booking $booking)
    {
        try {
            if (!$booking->payment_proof_image || !Storage::disk('public')->exists($booking->payment_proof_image)) {
                return response()->json(['message' => 'Gambar bukti pembayaran tidak ditemukan.'], 404);
            }
            $path = Storage::disk('public')->path($booking->payment_proof_image);
            return response()->file($path);
        } catch (\Exception $e) {
            Log::error('Error fetching payment proof image:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal mengambil gambar.'], 500);
        }
    }

    public function updateLink(Request $request, Booking $booking)
    {
        $request->validate(['gmeet_link' => 'nullable|url']);
        $booking->update(['gmeet_link' => $request->gmeet_link]);
        return response()->json(['message' => 'Link meeting berhasil disimpan.', 'data' => $booking]);
    }
}
