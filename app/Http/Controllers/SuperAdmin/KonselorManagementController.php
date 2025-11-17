<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CounselorAvailability;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class KonselorManagementController extends Controller
{
    // Mengambil semua user dengan role 'konselor'
    public function index()
    {
        // Eager load relasi jika ada, atau ambil data dasar
        return User::where('role', 'konselor')->latest()->get();
    }

    /**
     * Menyimpan konselor baru yang dibuat oleh Super Admin.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:255',
            // --- Validasi Kolom Baru ---
            'universitas' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
            'spesialisasi' => 'nullable|array', // Validasi jika Anda ingin mengirim spesialisasi dari sini
            'spesialisasi.*' => 'string|max:100', // Validasi tiap item array
            'rating' => 'nullable|numeric|min:0|max:5', // Tambahkan jika perlu
            // Tambahkan validasi lain jika ada (provinsi, alamat, dll.)
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            // Simpan gambar ke storage/app/public/avatars
            // Pastikan folder 'avatars' ada atau dibuat otomatis
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        $konselor = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'city' => $validated['city'] ?? null,
            'universitas' => $validated['universitas'] ?? null, // Simpan universitas
            'avatar' => $avatarPath, // Simpan path avatar
            'spesialisasi' => $validated['spesialisasi'] ?? null, // Simpan spesialisasi (jika dikirim)
            'rating' => $validated['rating'] ?? null, // Simpan rating (jika dikirim)
            'role' => 'konselor', // Otomatis set role sebagai konselor
            // Status awal mungkin lebih baik 'Terverifikasi' jika dibuat lgsg oleh Super Admin?
            // Atau tetap 'Verifikasi' jika butuh approval Admin? Sesuaikan.
            'status' => 'Verifikasi',
        ]);

        return response()->json($konselor, 21);
    }


    // Menampilkan detail satu konselor
    public function show(User $user)
    {
        if ($user->role !== 'konselor') {
            abort(404);
        }
        return $user;
    }

    // --- METHOD UPDATE BARU ---
    /**
     * Memperbarui data konselor yang sudah ada.
     * Menggunakan POST dengan _method=PUT karena FormData
     */
    public function update(Request $request, User $user)
    {
        if ($user->role !== 'konselor') {
            abort(404);
        }

        $validated = $request->validate([
            // 'sometimes' berarti hanya validasi jika field dikirim
            'name' => 'sometimes|required|string|max:255',
            // Abaikan email unik milik user ini sendiri
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:255',
            'universitas' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'spesialisasi' => 'nullable|array',
            'spesialisasi.*' => 'string|max:100',
            'rating' => 'nullable|numeric|min:0|max:5',
            // Password tidak diupdate di sini, bisa dibuat endpoint terpisah jika perlu
        ]);

        $avatarPath = $user->avatar; // Simpan path lama defaultnya

        if ($request->hasFile('avatar')) {
            // 1. Hapus avatar lama jika ada
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            // 2. Simpan avatar baru
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $avatarPath; // Masukkan path baru ke data yg akan diupdate
        } else {
            // Jika tidak ada file baru, pastikan 'avatar' tidak ikut diupdate
            // (kecuali jika ada fitur hapus avatar, bisa ditambahkan logikanya)
            unset($validated['avatar']);
        }


        // Update data user
        // Filter hanya data yg divalidasi dan bukan null (kecuali yg memang boleh null)
        $updateData = collect($validated)->filter(function ($value, $key) {
            return $value !== null || in_array($key, ['phone', 'city', 'universitas', 'avatar', 'spesialisasi', 'rating']); // Kolom yg boleh null
        })->all();


        // Update spesialisasi secara terpisah jika dikirim
        if (isset($validated['spesialisasi'])) {
            $updateData['spesialisasi'] = $validated['spesialisasi'];
        }

        // Tambahkan path avatar ke updateData jika ada file baru atau path lama (jika tidak ada file baru)
        // Ini memastikan kolom avatar di database selalu terisi path yang benar
        $updateData['avatar'] = $avatarPath;


        $user->update($updateData);


        // Load ulang data user untuk mendapatkan URL avatar terbaru
        $user->refresh();

        return response()->json($user);
    }
    // --- AKHIR METHOD UPDATE ---


    // Menghapus konselor
    public function destroy(User $user)
    {
        if ($user->role !== 'konselor') {
            abort(404);
        }

        // Hapus avatar dari storage jika ada
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->delete();
        return response()->json(null, 204);
    }

    // --- METODE KHUSUS UNTUK STATUS ---
    public function block(User $user)
    {
        if ($user->role !== 'konselor') {
            abort(404);
        }
        $user->update(['status' => 'Banned']);
        return response()->json($user);
    }

    public function unblock(User $user)
    {
        if ($user->role !== 'konselor') {
            abort(404);
        }
        // Saat di-unblock, kembalikan ke status 'Terverifikasi' jika sebelumnya aktif,
        // atau 'Verifikasi' jika belum pernah diverifikasi (logika ini bisa disesuaikan)
        // Untuk sederhana, kita set ke 'Terverifikasi'
        $user->update(['status' => 'Terverifikasi']);
        return response()->json($user);
    }

    /**
     * Menampilkan daftar jadwal ketersediaan untuk konselor tertentu.
     * GET /api/super-admin/konselor-management/{user}/availabilities
     */
    public function getAvailabilities(Request $request, ?User $user = null)
    {
        // Tentukan user (jika dari rute admin, $user ada, jika dari rute konselor, $user null)
        $counselor = $user ?? Auth::user();
        /** @var \App\Models\User $counselor */ // <-- Petunjuk untuk Linter

        if (!$counselor || $counselor->role !== 'konselor') {
            return response()->json(['message' => 'Konselor tidak ditemukan.'], 404);
        }

        // --- PERBAIKAN: Order berdasarkan TANGGAL (bukan hari) ---
        $availabilities = $counselor->availabilities()
            ->orderBy('tanggal_konsultasi', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();
        // --- AKHIR PERBAIKAN ---

        return response()->json($availabilities);
    }

    /**
     * Menyimpan jadwal ketersediaan baru untuk konselor.
     * Dipakai oleh Super Admin (POST /super-admin/konselor-management/{user}/availabilities)
     * DAN oleh Konselor (POST /counselor/availability)
     */
    // --- PERBAIKAN: Tambahkan ?User agar $user bisa null ---
    public function storeAvailability(Request $request, ?User $user = null)
    {
        $counselor = $user ?? Auth::user();
        /** @var \App\Models\User $counselor */ // <-- Petunjuk untuk Linter

        if (!$counselor || $counselor->role !== 'konselor') {
            return response()->json(['message' => 'Konselor tidak ditemukan.'], 404);
        }

        // --- PERBAIKAN: Validasi berdasarkan TANGGAL (bukan hari) ---
        $validated = $request->validate([
            'tanggal_konsultasi' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'], // Format "HH:MM"
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);
        // --- AKHIR PERBAIKAN ---

        try {
            // --- PERBAIKAN: Simpan data ketersediaan ---
            $availability = $counselor->availabilities()->create([
                'counselor_id' => $counselor->id, // counselor_id di-set otomatis oleh relasi
                'tanggal_konsultasi' => $validated['tanggal_konsultasi'], // <-- Simpan TANGGAL
                'start_time' => $validated['start_time'] . ':00', // Tambahkan detik
                'end_time' => $validated['end_time'] . ':00', // Tambahkan detik
                // Hapus 'day_of_week'
            ]);
            // --- AKHIR PERBAIKAN ---

            Log::info('Ketersediaan baru ditambahkan:', ['user_id' => $counselor->id, 'data' => $validated]);
            return response()->json($availability, 201);
        } catch (\Exception $e) {
            Log::error('Gagal menambah ketersediaan:', ['user_id' => $counselor->id, 'error' => $e->getMessage()]);
            if (str_contains($e->getMessage(), 'Duplicate entry') || str_contains($e->getMessage(), 'Constraint violation')) {
                return response()->json(['message' => 'Jadwal pada tanggal dan jam ini sudah ada.'], 409); // 409 Conflict
            }
            return response()->json(['message' => 'Gagal menyimpan jadwal.'], 500);
        }
    }

    /**
     * Menghapus jadwal ketersediaan.
     * Dipakai oleh Super Admin (DELETE /super-admin/konselor-management/{user}/availabilities/{availability})
     * DAN oleh Konselor (DELETE /counselor/availability/{availability})
     */
    // --- PERBAIKAN: Tambahkan ?User agar $user bisa null ---
    public function destroyAvailability(Request $request, ?User $user = null, CounselorAvailability $availability)
    {
        $counselor = $user ?? Auth::user();
        /** @var \App\Models\User $counselor */ // <-- Petunjuk untuk Linter

        // Otorisasi: Pastikan availability ini milik konselor yang benar
        if ($availability->counselor_id !== $counselor->id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        try {
            $availability->delete();
            Log::info('Ketersediaan dihapus:', ['id' => $availability->id, 'user_id' => $counselor->id]);
            return response()->json(null, 204); // 204 No Content
        } catch (\Exception $e) {
            Log::error('Gagal menghapus ketersediaan:', ['id' => $availability->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menghapus jadwal.'], 500);
        }
    }

    /**
     * Mengupdate jadwal ketersediaan.
     * (Kita tambahkan ini juga untuk jaga-jaga)
     * PUT /api/super-admin/konselor-management/{user}/availabilities/{availability}
     */
    public function updateAvailability(Request $request, User $user, CounselorAvailability $availability)
    {
        if ($availability->counselor_id !== $user->id) {
            return response()->json(['message' => 'Jadwal tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'tanggal_konsultasi' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        try {
            $availability->update([
                'tanggal_konsultasi' => $validated['tanggal_konsultasi'],
                'start_time' => $validated['start_time'] . ':00',
                'end_time' => $validated['end_time'] . ':00',
            ]);
            return response()->json($availability);
        } catch (\Exception $e) {
            Log::error('Gagal update ketersediaan:', ['id' => $availability->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal mengupdate jadwal.'], 500);
        }
    }
}
