<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Refund;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Notifications\RefundStatusUpdated;

class RefundManagementController extends Controller
{
    /**
     * Menampilkan daftar semua pengajuan refund dengan Paginasi & Search.
     * GET /api/super-admin/refund-management?page=1&search=query
     */
    public function index(Request $request)
    {
        try {
            $search = $request->query('search');

            // Eager load relasi yang dibutuhkan
            $query = Refund::with([
                'customer:id,name,email,phone',
                'booking:id,tanggal_konsultasi'
            ]);

            // Logika Pencarian
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                        ->orWhere('nama_bank', 'like', "%{$search}%")
                        ->orWhere('nama_pemilik_rekening', 'like', "%{$search}%")
                        ->orWhere('nomor_rekening', 'like', "%{$search}%")
                        ->orWhereHas('customer', function ($c) use ($search) {
                            $c->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            }

            // Sorting & Pagination (10 item per halaman)
            // paginate() otomatis membaca parameter ?page= dari URL
            $refunds = $query->latest()->paginate(10);

            return response()->json($refunds);
        } catch (\Exception $e) {
            Log::error("Error fetching refunds: " . $e->getMessage());
            return response()->json(['message' => 'Gagal memuat data refund.'], 500);
        }
    }

    /**
     * Memproses status refund (Menyetujui/Mentransfer atau Menolak).
     * POST /api/super-admin/refund-management/{refund}/process
     */
    public function process(Request $request, Refund $refund)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:Selesai,Ditolak',
            // Jika status Selesai, bukti transfer admin WAJIB ada
            'bukti_transfer' => 'required_if:status,Selesai|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $dataToUpdate = [
                'status' => $request->status,
            ];

            // Jika Admin mengupload bukti transfer (artinya status Selesai)
            if ($request->hasFile('bukti_transfer')) {
                $path = $request->file('bukti_transfer')->store('refund_transfers_admin', 'public');
                $dataToUpdate['bukti_transfer_admin'] = $path;
            }

            $refund->update($dataToUpdate);

            // Kirim Notifikasi
            $refund->load('customer');
            if ($refund->customer) {
                // Pastikan class RefundStatusUpdated ada dan berfungsi
                $refund->customer->notify(new RefundStatusUpdated($refund));
            }

            Log::info('Refund processed:', ['refund_id' => $refund->id, 'status' => $request->status]);

            return response()->json([
                'message' => 'Status refund berhasil diperbarui.',
                'refund' => $refund->fresh()->load(['customer', 'booking'])
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal memproses refund:', ['id' => $refund->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan server: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Mengambil gambar bukti refund dari customer (Buku Tabungan/QRIS).
     * GET /api/super-admin/refund-management/{refund}/customer-proof
     */
    public function getCustomerProofImage(Refund $refund)
    {
        try {
            if (!$refund->bukti_refund_customer || !Storage::disk('public')->exists($refund->bukti_refund_customer)) {
                return response()->json(['message' => 'Gambar tidak ditemukan.'], 404);
            }
            return response()->file(Storage::disk('public')->path($refund->bukti_refund_customer));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengambil gambar.'], 500);
        }
    }

    /**
     * Mengambil gambar bukti transfer dari admin.
     * GET /api/super-admin/refund-management/{refund}/admin-proof
     */
    public function getAdminTransferImage(Refund $refund)
    {
        try {
            if (!$refund->bukti_transfer_admin || !Storage::disk('public')->exists($refund->bukti_transfer_admin)) {
                return response()->json(['message' => 'Gambar tidak ditemukan.'], 404);
            }
            return response()->file(Storage::disk('public')->path($refund->bukti_transfer_admin));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengambil gambar.'], 500);
        }
    }
}
