<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;

class JadwalKonsultasiController extends Controller
{
    /**
     * Menampilkan daftar jadwal konsultasi dengan Search & Pagination.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $status = $request->query('status');

        // Eager load relasi yang dibutuhkan
        $query = Booking::with(['customer', 'konselor', 'jenisKonseling']);

        // 1. Filter Berdasarkan Status (jika ada)
        if ($status) {
            $query->where('status_pesanan', $status);
        }

        // 2. Fitur Pencarian (ID, Nama Customer, Nama Konselor)
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

        // 3. Sorting: Tanggal & Jam Terdekat (Ascending)
        $query->orderBy('tanggal_konsultasi', 'asc')
            ->orderBy('jam_konsultasi', 'asc');

        // 4. Pagination (10 per halaman)
        return $query->paginate(10);
    }

    /**
     * Menampilkan detail satu jadwal konsultasi.
     */
    public function show(Booking $booking)
    {
        // Load relasi lengkap untuk detail page
        return $booking->load([
            'customer',
            'konselor',
            'jenisKonseling',
            'durasiKonseling',
            'tempatKonseling'
        ]);
    }

    /**
     * Menghapus jadwal konsultasi.
     */
    public function destroy(Booking $booking)
    {
        $booking->delete();
        return response()->json(null, 204);
    }

    /**
     * Memperbarui status pesanan/jadwal.
     */
    public function updateStatus(Request $request, Booking $booking)
    {
        $allowedStatuses = ['Selesai', 'Batal', 'Proses', 'Dijadwalkan', 'Berlangsung', 'Menunggu Konfirmasi'];

        $validated = $request->validate([
            'status_pesanan' => ['required', 'string', Rule::in($allowedStatuses)],
        ]);

        $booking->update(['status_pesanan' => $validated['status_pesanan']]);

        return response()->json($booking);
    }

    /**
     * Update link Gmeet/Zoom untuk booking tertentu.
     */
    public function updateGmeetLink(Request $request, Booking $booking)
    {
        $validator = Validator::make($request->all(), [
            // Validasi URL umum (agar bisa zoom, google meet, dll)
            'gmeet_link' => ['nullable', 'url'],
        ], [
            'gmeet_link.url' => 'Format link tidak valid.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Data tidak valid.',
                'errors' => $validator->errors()
            ], 422);
        }

        // Cek apakah metode layanan mendukung link meeting
        $allowedMethods = ['Video Call', 'Voice Call', 'Call'];

        if (!in_array($booking->metode_konsultasi, $allowedMethods)) {
            return response()->json([
                'message' => 'Metode layanan booking ini (' . $booking->metode_konsultasi . ') tidak memerlukan link meeting.'
            ], 400);
        }

        $booking->update([
            'gmeet_link' => $request->gmeet_link,
        ]);

        // Refresh data untuk dikirim balik ke frontend
        $booking->load('customer', 'konselor', 'jenisKonseling');

        return response()->json([
            'message' => 'Link meeting berhasil diperbarui.',
            'booking' => $booking,
        ]);
    }
}
