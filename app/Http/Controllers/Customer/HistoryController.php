<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\Booking;
use Illuminate\Support\Facades\Validator; // <-- TAMBAHKAN IMPORT INI

class HistoryController extends Controller
{
    /**
     * Menampilkan daftar riwayat booking milik customer yang sedang login.
     * (Fungsi index tidak berubah)
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $statusFilter = $request->query('status', 'upcoming');
        $query = Booking::where('customer_id', $user->id);

        // --- LOGIKA FILTER BARU ---
        $query->when($statusFilter == 'upcoming', function ($q) {
            $q->whereIn('status_pesanan', ['Dijadwalkan', 'DISETUJUI']);
        });

        $query->when($statusFilter == 'canceled', function ($q) {
            $q->whereIn('status_pesanan', ['DIBATALKAN', 'DITOLAK']);
        });

        $query->when($statusFilter == 'unpaid', function ($q) {
            $q->whereIn('status_pesanan', [
                'Menunggu Pembayaran',
                'Menunggu Verifikasi',
                'MENUNGGU_PEMBAYARAN',
                'MENUNGGU_VERIFIKASI_PEMBAYARAN'
            ]);
        });

        $query->when($statusFilter == 'completed', function ($q) {
            $q->where('status_pesanan', 'SELESAI');
        });
        // --- AKHIR LOGIKA FILTER BARU ---

        $bookings = $query->with([
            'konselor' => function ($query) {
                $query->select('id', 'name', 'avatar');
            },
            'jenisKonseling' => function ($query) {
                $query->select('id', 'jenis_konseling', 'image');
            },
            'durasiKonseling' => function ($query) {
                $query->select('id', 'durasi_menit');
            },
            'tempatKonseling' => function ($query) {
                $query->select('id', 'nama_tempat', 'image');
            }
        ])
            ->orderBy('tanggal_konsultasi', 'desc')
            ->orderBy('jam_konsultasi', 'desc')
            ->paginate(10);

        return response()->json($bookings);
    }

    /**
     * Menampilkan detail spesifik dari satu booking.
     * (Fungsi show tidak berubah, sudah kita perbaiki)
     */
    public function show(Booking $booking): JsonResponse
    {
        if (Auth::id() !== $booking->customer_id) {
            return response()->json(['message' => 'Tidak diizinkan mengakses sumber daya ini.'], 403);
        }

        $booking->load([
            'konselor' => function ($query) {
                $query->select('id', 'name', 'email', 'phone', 'avatar', 'spesialisasi');
            },
            'customer',
            'jenisKonseling',
            'durasiKonseling',
            'tempatKonseling',
            // 'paymentMethod' (dihapus)
        ]);

        return response()->json($booking);
    }

    /**
     * Membatalkan booking yang masih dalam status tertentu.
     * --- PERBAIKAN: Fungsi ini sekarang menerima alasan & catatan ---
     */
    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        if (Auth::id() !== $booking->customer_id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        // Status yang tidak bisa dibatalkan
        if (in_array($booking->status_pesanan, ['Selesai', 'Dibatalkan', 'DITOLAK'])) {
            return response()->json([
                'message' => 'Booking dengan status ini tidak dapat dibatalkan.'
            ], 422); // 422 Unprocessable Entity
        }

        // --- TAMBAHAN: Validasi input ---
        $validator = Validator::make($request->all(), [
            'alasan' => 'required|string|max:255',
            'catatan' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Alasan pembatalan wajib diisi.', 'errors' => $validator->errors()], 422);
        }
        $validated = $validator->validated();
        // --- AKHIR TAMBAHAN ---

        // --- PERBAIKAN: Simpan alasan & catatan ---
        $booking->status_pesanan = 'Dibatalkan'; // Gunakan ejaan standar Anda
        $booking->alasan_pembatalan = $validated['alasan'];
        $booking->catatan_pembatalan = $validated['catatan'] ?? null;
        $booking->save();
        // --- AKHIR PERBAIKAN ---

        return response()->json([
            'message' => 'Booking telah berhasil dibatalkan.',
            'booking' => $booking->fresh()
        ]);
    }

    /**
     * Menjadwal ulang booking.
     * (Fungsi reschedule tidak berubah)
     */
    public function reschedule(Request $request, Booking $booking): JsonResponse
    {
        // ... (kode fungsi reschedule Anda tetap sama)
        if (Auth::id() !== $booking->customer_id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        if (in_array($booking->status_pesanan, ['SELESAI', 'DIBATALKAN'])) {
            return response()->json([
                'message' => 'Booking dengan status ini tidak dapat dijadwal ulang.'
            ], 422);
        }

        $validated = $request->validate([
            'tanggal_konsultasi' => 'required|date|after_or_equal:today',
            'jam_konsultasi' => 'required|date_format:H:i:s',
        ]);

        $booking->tanggal_konsultasi = $validated['tanggal_konsultasi'];
        $booking->jam_konsultasi = $validated['jam_konsultasi'];
        $booking->status_pesanan = 'MENUNGGU_KONFIRMASI_JADWAL';
        $booking->save();

        return response()->json([
            'message' => 'Booking telah berhasil dijadwal ulang. Menunggu konfirmasi dari admin.',
            'booking' => $booking->fresh()
        ]);
    }
}
