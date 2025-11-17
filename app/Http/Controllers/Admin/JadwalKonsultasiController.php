<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator; // <-- TAMBAHAN: Import Validator

class JadwalKonsultasiController extends Controller
{
    /**
     * Menampilkan daftar jadwal konsultasi.
     */
    public function index(Request $request)
    {
        $query = Booking::with(['customer', 'konselor', 'jenisKonseling']);
        if ($request->has('status')) {
            $query->where('status_pesanan', $request->input('status'));
        }
        $query->orderBy('tanggal_konsultasi', 'asc')->orderBy('jam_konsultasi', 'asc');
        return $query->get();
    }

    /**
     * Menampilkan detail satu jadwal konsultasi.
     */
    // Pastikan menerima model Booking
    public function show(Booking $booking)
    {
        return $booking->load(['customer', 'konselor', 'jenisKonseling']);
    }

    /**
     * Menghapus jadwal konsultasi.
     */
    // Pastikan menerima model Booking
    public function destroy(Booking $booking)
    {
        $booking->delete();
        return response()->json(null, 204);
    }

    /**
     * Metode baru untuk memperbarui status pesanan/jadwal.
     */
    public function updateStatus(Request $request, Booking $booking)
    {
        // Tentukan status apa saja yang valid
        $allowedStatuses = ['Selesai', 'Batal', 'Proses', 'Dijadwalkan', 'Berlangsung', 'Menunggu Konfirmasi'];

        // Validasi input 'status_pesanan'
        $validated = $request->validate([
            'status_pesanan' => ['required', 'string', Rule::in($allowedStatuses)],
        ]);

        // Update status di database
        $booking->update(['status_pesanan' => $validated['status_pesanan']]);

        // Kirim notifikasi jika perlu (misal ke customer/konselor)

        // Kembalikan respons sukses beserta data booking yang sudah diupdate
        return response()->json($booking);
    }

    // --- TAMBAHAN BARU UNTUK GMEET ---
    /**
     * Update link Gmeet untuk booking tertentu.
     */
    public function updateGmeetLink(Request $request, Booking $booking)
    {
        $validator = Validator::make($request->all(), [
            // Validasi link harus URL dan dari meet.google.com
            // Kita buat nullable agar Admin juga bisa MENGHAPUS link jika perlu
            'gmeet_link' => ['nullable', 'url', 'starts_with:https://meet.google.com/'],
        ], [
            'gmeet_link.url' => 'Link Gmeet harus berupa URL yang valid.',
            'gmeet_link.starts_with' => 'Link Gmeet harus dimulai dengan https://meet.google.com/',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Data tidak valid.',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!in_array($booking->metode_konsultasi, ['Video Call', 'Call'])) {
            return response()->json(['message' => 'Metode layanan booking ini bukan VC atau Call.'], 400);
        }

        $booking->update([
            'gmeet_link' => $request->gmeet_link,
        ]);

        // Muat ulang relasi agar data yang dikirim balik lengkap
        $booking->load('customer', 'konselor', 'jenisKonseling');

        return response()->json([
            'message' => 'Link Gmeet berhasil diperbarui.',
            'booking' => $booking, // Kirim booking terbaru
        ]);
    }
}
