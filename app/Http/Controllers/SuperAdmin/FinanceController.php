<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Notifications\PayoutReceived; // [PENTING] Import Notifikasi Baru

class FinanceController extends Controller
{
    /**
     * Menampilkan Laporan Keuangan & Tagihan Gaji Konselor
     * GET /api/super-admin/keuangan
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $month = $request->query('month');
        $year = $request->query('year', date('Y'));
        $paymentStatus = $request->query('payment_status'); // Filter: ALL, PAID, UNPAID

        // Query Dasar: Hanya yang statusnya SELESAI
        $query = Booking::with(['customer', 'konselor', 'jenisKonseling', 'durasiKonseling'])
            ->where('status_pesanan', 'Selesai'); // Case sensitive sesuai DB

        // Filter Waktu (Bulan & Tahun)
        if ($month) $query->whereMonth('created_at', $month);
        if ($year) $query->whereYear('created_at', $year);

        // Filter Status Pembayaran Gaji (UNPAID / PAID)
        if ($paymentStatus && in_array($paymentStatus, ['PAID', 'UNPAID'])) {
            $query->where('counselor_payment_status', $paymentStatus);
        }

        // Filter Pencarian (Nama Customer / Konselor)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('customer', function ($c) use ($search) {
                    $c->where('name', 'like', "%{$search}%");
                })->orWhereHas('konselor', function ($k) use ($search) {
                    $k->where('name', 'like', "%{$search}%");
                });
            });
        }

        // Pagination (10 per halaman)
        $bookings = $query->latest()->paginate(10);

        // --- SUMMARY STATISTIK (Dihitung Real-time dari Database) ---
        // Kita hitung ulang berdasarkan filter tahun/bulan yang aktif agar relevan
        $summaryQuery = Booking::where('status_pesanan', 'Selesai');
        if ($month) $summaryQuery->whereMonth('created_at', $month);
        if ($year) $summaryQuery->whereYear('created_at', $year);

        $summaryData = $summaryQuery->select(
            DB::raw('SUM(total_harga) as total_omset'),
            DB::raw('SUM(admin_fee) as total_profit'),
            DB::raw('SUM(counselor_net) as total_payout'), // Total Kewajiban Gaji
            DB::raw('SUM(CASE WHEN counselor_payment_status = "UNPAID" THEN counselor_net ELSE 0 END) as pending_payout') // Yang belum dibayar
        )->first();

        return response()->json([
            'bookings' => $bookings,
            'summary' => [
                'total_omset' => (int) $summaryData->total_omset,
                'total_bersih' => (int) $summaryData->total_profit,
                'total_payout' => (int) $summaryData->total_payout,
                'pending_payout' => (int) $summaryData->pending_payout, // Utang yang harus segera dibayar
            ]
        ]);
    }

    /**
     * Menampilkan Detail Satu Transaksi (Untuk Halaman Receipt/Struk)
     * GET /api/super-admin/keuangan/{id}
     */
    public function show($id)
    {
        $booking = Booking::with(['customer', 'konselor', 'jenisKonseling', 'durasiKonseling'])
            ->find($id);

        if (!$booking) {
            return response()->json(['message' => 'Data transaksi tidak ditemukan'], 404);
        }

        return response()->json($booking);
    }

    /**
     * PROSES PEMBAYARAN GAJI (Disbursement)
     * Admin upload bukti transfer -> Status jadi PAID -> Notifikasi Konselor
     * POST /api/super-admin/keuangan/{id}/pay
     */
    public function processPayment(Request $request, Booking $booking)
    {
        // 1. Validasi Status Booking
        if ($booking->status_pesanan !== 'Selesai') {
            return response()->json(['message' => 'Booking belum selesai, tidak bisa diproses.'], 422);
        }

        // 2. Cek apakah sudah lunas
        if ($booking->counselor_payment_status === 'PAID') {
            return response()->json(['message' => 'Tagihan ini sudah lunas (PAID).'], 409);
        }

        // 3. Validasi Input File
        $validator = Validator::make($request->all(), [
            'proof_image' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Bukti transfer wajib diupload.', 'errors' => $validator->errors()], 422);
        }

        try {
            // 4. Upload Gambar ke Storage
            $path = $request->file('proof_image')->store('counselor_payouts', 'public');

            // 5. Update Database Booking
            $booking->update([
                'counselor_payment_status' => 'PAID',
                'counselor_payment_proof' => $path,
                'counselor_paid_at' => now(),
            ]);

            // 6. Kirim Notifikasi ke Konselor "Gaji Cair"
            try {
                $booking->konselor->notify(new PayoutReceived($booking));
                Log::info("Notifikasi Gaji Cair terkirim ke Konselor ID: " . $booking->konselor_id);
            } catch (\Exception $e) {
                // Error notifikasi jangan sampai menggagalkan transaksi
                Log::error("Gagal kirim notif gaji cair: " . $e->getMessage());
            }

            return response()->json([
                'message' => 'Pembayaran berhasil dicatat! Status berubah menjadi PAID.',
                'booking' => $booking->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal proses payout admin:', ['id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan server.'], 500);
        }
    }
}
