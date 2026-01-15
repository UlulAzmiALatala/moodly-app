<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use App\Events\UserStatusUpdated;
use Illuminate\Support\Facades\Mail; // <-- IMPORT MAIL
use App\Mail\AccountVerified;          // <-- IMPORT MAILABLE
use App\Mail\AccountRejected;          // <-- IMPORT MAILABLE

class CustomerVerificationController extends Controller
{
    /**
     * Menampilkan daftar customer yang menunggu verifikasi (Paginasi & Search).
     */
    public function index(Request $request)
    {
        $search = $request->query('search');

        // Filter user role customer dengan status Verifikasi
        // Kita gunakan whereIn untuk mengakomodasi variasi nama status jika ada
        $query = User::where('role', 'customer')
            ->whereIn('status', ['Verifikasi', 'Menunggu Verifikasi']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return $query->latest()->paginate(10);
    }

    /**
     * Menampilkan detail satu customer untuk diverifikasi.
     */
    public function show(User $user)
    {
        if ($user->role !== 'customer') {
            abort(404);
        }
        return $user;
    }

    /**
     * Menyetujui verifikasi customer (mengubah status menjadi 'Terverifikasi').
     */
    public function approve(User $user)
    {
        // Pastikan status valid sebelum approve
        if ($user->role !== 'customer' || !in_array($user->status, ['Verifikasi', 'Menunggu Verifikasi'])) {
            return response()->json(['message' => 'Aksi tidak diizinkan atau user sudah diproses.'], 403);
        }

        $user->update(['status' => 'Terverifikasi']);

        // 1. Broadcast WebSocket (Real-time layar terbuka)
        // PENTING: Gunakan fresh() agar yang dikirim adalah status TERBARU ke WebSocket
        broadcast(new UserStatusUpdated($user->fresh()));

        // 2. Kirim Email Notifikasi
        try {
            Mail::to($user->email)->send(new AccountVerified($user));
        } catch (\Exception $e) {
            // Jangan biarkan error email menghentikan proses response
            \Illuminate\Support\Facades\Log::error("Gagal kirim email approve: " . $e->getMessage());
        }

        return response()->json(['message' => 'Customer berhasil diverifikasi.', 'user' => $user]);
    }

    /**
     * Menolak verifikasi customer (mengubah status menjadi 'Ditolak').
     */
    public function reject(Request $request, User $user)
    {
        if ($user->role !== 'customer' || !in_array($user->status, ['Verifikasi', 'Menunggu Verifikasi'])) {
            return response()->json(['message' => 'Aksi tidak diizinkan atau user sudah diproses.'], 403);
        }

        // Validasi alasan penolakan (Wajib diisi dari Modal)
        $validated = $request->validate([
            'alasan_ditolak' => 'required|string|max:255'
        ]);

        // Update status dan simpan alasan
        // Pastikan kolom 'alasan_ditolak' sudah ada di tabel users Anda
        $user->update([
            'status' => 'Ditolak',
            'alasan_ditolak' => $validated['alasan_ditolak']
        ]);

        // 1. Broadcast WebSocket
        // PENTING: Gunakan fresh() agar data terbaru terkirim
        broadcast(new UserStatusUpdated($user->fresh()));

        // 2. Kirim Email Notifikasi (dengan alasan)
        try {
            Mail::to($user->email)->send(new AccountRejected($user, $validated['alasan_ditolak']));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Gagal kirim email reject: " . $e->getMessage());
        }

        return response()->json(['message' => 'Verifikasi customer ditolak.', 'user' => $user]);
    }
}
