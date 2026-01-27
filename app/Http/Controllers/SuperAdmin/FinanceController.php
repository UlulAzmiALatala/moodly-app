<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Notifications\PayoutReceived;
use App\Mail\PayoutProcessed;

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
        $paymentStatus = $request->query('payment_status');

        $query = Booking::with(['customer', 'konselor', 'jenisKonseling', 'durasiKonseling'])
            ->where('status_pesanan', 'Selesai');

        if ($month) $query->whereMonth('created_at', $month);
        if ($year) $query->whereYear('created_at', $year);

        if ($paymentStatus && in_array($paymentStatus, ['PAID', 'UNPAID'])) {
            $query->where('counselor_payment_status', $paymentStatus);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('customer', function ($c) use ($search) {
                    $c->where('name', 'like', "%{$search}%");
                })->orWhereHas('konselor', function ($k) use ($search) {
                    $k->where('name', 'like', "%{$search}%");
                });
            });
        }

        $bookings = $query->latest()->paginate(10);

        $summaryQuery = Booking::where('status_pesanan', 'Selesai');
        if ($month) $summaryQuery->whereMonth('created_at', $month);
        if ($year) $summaryQuery->whereYear('created_at', $year);

        $summaryData = $summaryQuery->select(
            DB::raw('SUM(total_harga) as total_omset'),
            DB::raw('SUM(admin_fee) as total_profit'),
            DB::raw('SUM(counselor_net) as total_payout'),
            DB::raw('SUM(CASE WHEN counselor_payment_status = "UNPAID" THEN counselor_net ELSE 0 END) as pending_payout')
        )->first();

        return response()->json([
            'bookings' => $bookings,
            'summary' => [
                'total_omset' => (int) $summaryData->total_omset,
                'total_bersih' => (int) $summaryData->total_profit,
                'total_payout' => (int) $summaryData->total_payout,
                'pending_payout' => (int) $summaryData->pending_payout,
            ]
        ]);
    }

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
        if ($booking->status_pesanan !== 'Selesai') {
            return response()->json(['message' => 'Booking belum selesai, tidak bisa diproses.'], 422);
        }

        if ($booking->counselor_payment_status === 'PAID') {
            return response()->json(['message' => 'Tagihan ini sudah lunas (PAID).'], 409);
        }

        $validator = Validator::make($request->all(), [
            'proof_image' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Bukti transfer wajib diupload.', 'errors' => $validator->errors()], 422);
        }

        try {
            $path = $request->file('proof_image')->store('counselor_payouts', 'public');

            $booking->update([
                'counselor_payment_status' => 'PAID',
                'counselor_payment_proof' => $path,
                'counselor_paid_at' => now(),
            ]);

            // [BARU] Kirim Notifikasi & Email
            try {
                // 1. Kirim Notifikasi Database (Lonceng)
                $booking->konselor->notify(new PayoutReceived($booking));

                // 2. Kirim Email (PENTING)
                if ($booking->konselor && $booking->konselor->email) {
                    Mail::to($booking->konselor->email)->send(new PayoutProcessed($booking));
                }

                Log::info("Notifikasi & Email Gaji Cair terkirim ke Konselor ID: " . $booking->konselor_id);
            } catch (\Exception $e) {
                // Error notifikasi jangan sampai menggagalkan transaksi
                Log::error("Gagal kirim notif gaji cair: " . $e->getMessage());
            }

            return response()->json([
                'message' => 'Pembayaran berhasil dicatat! Email notifikasi telah dikirim.',
                'booking' => $booking->fresh()
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal proses payout admin:', ['id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan server.'], 500);
        }
    }
}
