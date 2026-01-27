<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\BookingFinanceService; // <--- JANGAN LUPA IMPORT INI
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class JadwalKonsultasiController extends Controller
{
    /**
     * Menampilkan daftar jadwal konsultasi dengan Search & Pagination.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $status = $request->query('status');

        $query = Booking::with(['customer', 'konselor', 'jenisKonseling']);

        if ($status) {
            $query->where('status_pesanan', $status);
        }

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

        $query->orderBy('tanggal_konsultasi', 'asc')
            ->orderBy('jam_konsultasi', 'asc');

        return $query->paginate(10);
    }

    public function show(Booking $booking)
    {
        return $booking->load([
            'customer',
            'konselor',
            'jenisKonseling',
            'durasiKonseling',
            'tempatKonseling'
        ]);
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();
        return response()->json(null, 204);
    }

    /**
     * Memperbarui status pesanan/jadwal.
     * [PERBAIKAN] Mengintegrasikan BookingFinanceService saat status 'Selesai'
     */
    public function updateStatus(Request $request, Booking $booking, BookingFinanceService $financeService)
    {
        $allowedStatuses = ['Selesai', 'Batal', 'Proses', 'Dijadwalkan', 'Berlangsung', 'Menunggu Konfirmasi'];

        $validated = $request->validate([
            'status_pesanan' => ['required', 'string', Rule::in($allowedStatuses)],
        ]);

        $newStatus = $validated['status_pesanan'];

        // --- LOGIKA UTAMA PERBAIKAN ---
        if ($newStatus === 'Selesai') {
            // Jika status diubah jadi Selesai, JANGAN update manual.
            // Panggil Service biar duitnya dihitung!
            try {
                $financeService->completeBooking($booking);

                // Refresh data biar frontend dapet update nominalnya
                return response()->json($booking->fresh());
            } catch (\Exception $e) {
                Log::error("Gagal update status selesai: " . $e->getMessage());
                return response()->json(['message' => 'Gagal menghitung keuangan.'], 500);
            }
        } else {
            // Jika status lain (Batal, Proses, dll), update biasa
            $booking->update(['status_pesanan' => $newStatus]);
            return response()->json($booking);
        }
    }

    public function updateGmeetLink(Request $request, Booking $booking)
    {
        $validator = Validator::make($request->all(), [
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

        $allowedMethods = ['Video Call', 'Voice Call', 'Call'];

        if (!in_array($booking->metode_konsultasi, $allowedMethods)) {
            return response()->json([
                'message' => 'Metode layanan booking ini (' . $booking->metode_konsultasi . ') tidak memerlukan link meeting.'
            ], 400);
        }

        $booking->update([
            'gmeet_link' => $request->gmeet_link,
        ]);

        $booking->load('customer', 'konselor', 'jenisKonseling');

        return response()->json([
            'message' => 'Link meeting berhasil diperbarui.',
            'booking' => $booking,
        ]);
    }
}
