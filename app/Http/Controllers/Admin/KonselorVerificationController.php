<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use App\Events\UserStatusUpdated;
use Illuminate\Support\Facades\Mail; // <-- IMPORT MAIL
use App\Mail\AccountVerified;          // <-- IMPORT MAILABLE
use App\Mail\AccountRejected;          // <-- IMPORT MAILABLE

class KonselorVerificationController extends Controller
{
    /**
     * Menampilkan daftar konselor yang menunggu verifikasi (Paginasi & Search).
     */
    public function index(Request $request)
    {
        $search = $request->query('search');

        // Filter user role konselor dengan status Verifikasi
        // Menggunakan whereIn untuk fleksibilitas status
        $query = User::where('role', 'konselor')
            ->whereIn('status', ['Verifikasi', 'Menunggu Verifikasi']);

        // Logika Pencarian
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('universitas', 'like', "%{$search}%"); // Tambahan search universitas
            });
        }

        // Gunakan pagination agar konsisten dengan frontend
        return $query->latest()->paginate(10);
    }

    /**
     * Menampilkan detail satu konselor untuk diverifikasi.
     */
    public function show(User $user)
    {
        if ($user->role !== 'konselor') {
            abort(404);
        }
        return $user;
    }

    /**
     * Menyetujui verifikasi konselor.
     */
    public function approve(User $user)
    {
        // Validasi status sebelum approve
        if ($user->role !== 'konselor' || !in_array($user->status, ['Verifikasi', 'Menunggu Verifikasi'])) {
            return response()->json(['message' => 'Aksi tidak diizinkan atau user sudah diproses.'], 403);
        }

        $user->update(['status' => 'Terverifikasi']);

        // 1. Broadcast WebSocket (Real-time layar terbuka)
        // PENTING: Gunakan fresh() agar status TERBARU terkirim ke WebSocket
        broadcast(new UserStatusUpdated($user->fresh()));

        // 2. Kirim Email Notifikasi
        try {
            Mail::to($user->email)->send(new AccountVerified($user));
        } catch (\Exception $e) {
            // Log error email tapi jangan hentikan proses response
            \Illuminate\Support\Facades\Log::error("Gagal kirim email approve konselor: " . $e->getMessage());
        }

        return response()->json(['message' => 'Konselor berhasil diverifikasi.', 'user' => $user]);
    }

    /**
     * Menolak verifikasi konselor.
     */
    public function reject(Request $request, User $user)
    {
        if ($user->role !== 'konselor' || !in_array($user->status, ['Verifikasi', 'Menunggu Verifikasi'])) {
            return response()->json(['message' => 'Aksi tidak diizinkan atau user sudah diproses.'], 403);
        }

        // Validasi alasan penolakan (Wajib diisi)
        $validated = $request->validate([
            'alasan_ditolak' => 'required|string|max:255'
        ]);

        // Update status dan simpan alasan
        $user->update([
            'status' => 'Ditolak',
            'alasan_ditolak' => $validated['alasan_ditolak']
        ]);

        // 1. Broadcast WebSocket
        // PENTING: Gunakan fresh() agar data alasan penolakan ikut terkirim
        broadcast(new UserStatusUpdated($user->fresh()));

        // 2. Kirim Email Notifikasi (dengan alasan)
        try {
            Mail::to($user->email)->send(new AccountRejected($user, $validated['alasan_ditolak']));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Gagal kirim email reject konselor: " . $e->getMessage());
        }

        return response()->json(['message' => 'Verifikasi konselor ditolak.', 'user' => $user]);
    }
}
