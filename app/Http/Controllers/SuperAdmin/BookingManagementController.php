<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

// --- TAMBAHAN BARU ---
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
// --- AKHIR TAMBAHAN BARU ---

class BookingManagementController extends Controller
{
    /**
     * Menampilkan daftar semua pesanan dengan data relasi.
     */
    public function index()
    {
        // Eager load relasi untuk efisiensi query
        // Urutkan berdasarkan yang perlu diverifikasi dulu
        return Booking::with(['customer:id,name', 'konselor:id,name'])
            ->orderByRaw("FIELD(status_pesanan, 'Menunggu Verifikasi') DESC") // <-- Prioritaskan yang butuh aksi
            ->latest() // Urutkan sisanya berdasarkan terbaru
            ->get();
    }

    /**
     * Menampilkan detail satu pesanan dengan data relasi lengkap.
     */
    public function show(Booking $booking)
    {
        // --- PERBAIKAN: Load semua relasi yang mungkin ---
        // Ini akan otomatis menyertakan 'payment_proof_image_url' dari Model
        return $booking->load([
            'customer',
            'konselor',
            'jenisKonseling',
            'durasiKonseling',
            'tempatKonseling'
        ]);
        // --- AKHIR PERBAIKAN ---
    }

    /**
     * Menghapus pesanan.
     */
    public function destroy(Booking $booking)
    {
        // --- PERBAIKAN: Hapus juga bukti bayar jika ada ---
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
        // --- AKHIR PERBAIKAN ---
    }

    // Metode store dan update tidak diperlukan untuk Super Admin di halaman ini


    // --- METHOD BARU UNTUK VERIFIKASI ---

    /**
     * Menyetujui pembayaran booking.
     * POST /api/super-admin/booking-management/{booking}/approve-payment
     */
    public function approvePayment(Booking $booking)
    {
        // 1. Validasi: Hanya bisa approve jika statusnya "Menunggu Verifikasi"
        if ($booking->status_pesanan !== 'Menunggu Verifikasi') {
            return response()->json([
                'message' => 'Hanya booking dengan status "Menunggu Verifikasi" yang bisa disetujui.'
            ], 409); // 409 Conflict
        }

        try {
            // 2. Ubah status
            $booking->status_pesanan = 'Dijadwalkan';
            $booking->save();

            // 3. TODO: Kirim notifikasi ke customer (fitur nanti)
            // ...

            Log::info('Payment approved for booking:', ['booking_id' => $booking->id]);

            // 4. Kembalikan data booking yang sudah di-update
            return response()->json($booking->load([
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

    /**
     * Menolak pembayaran booking.
     * POST /api/super-admin/booking-management/{booking}/reject-payment
     */
    public function rejectPayment(Request $request, Booking $booking)
    {
        // 1. Validasi: Hanya bisa reject jika statusnya "Menunggu Verifikasi"
        if ($booking->status_pesanan !== 'Menunggu Verifikasi') {
            return response()->json([
                'message' => 'Hanya booking dengan status "Menunggu Verifikasi" yang bisa ditolak.'
            ], 409); // 409 Conflict
        }

        // 2. Validasi input (alasan penolakan)
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // 3. Hapus file bukti bayar yang lama (karena ditolak)
            if ($booking->payment_proof_image) {
                Storage::disk('public')->delete($booking->payment_proof_image);
            }

            // 4. Update status booking
            $booking->status_pesanan = 'Pembayaran Ditolak'; // Status baru
            $booking->payment_proof_image = null; // Hapus path dari DB
            $booking->payment_proof_notes = null;
            // Kita gunakan kolom 'catatan_pembatalan' untuk menyimpan alasan penolakan
            $booking->catatan_pembatalan = $request->input('reason');
            $booking->save();

            // 5. TODO: Kirim notifikasi ke customer (fitur nanti)
            // ...

            Log::info('Payment rejected for booking:', ['booking_id' => $booking->id, 'reason' => $request->input('reason')]);

            // 6. Kembalikan data booking yang sudah di-update
            return response()->json($booking->load([
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
}
