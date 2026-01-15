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
    /**
     * Mengambil semua user dengan role 'konselor' (Support Search & Pagination)
     */
    public function index(Request $request)
    {
        $search = $request->query('search');

        $query = User::where('role', 'konselor');

        // Logika Pencarian
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    // Pencarian kolom baru
                    ->orWhere('universitas', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%");
            });
        }

        // Pagination 10 item per halaman
        return $query->latest()->paginate(10);
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
            'universitas' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'spesialisasi' => 'nullable|array',
            'spesialisasi.*' => 'string|max:100',
            'rating' => 'nullable|numeric|min:0|max:5',
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        $konselor = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'city' => $validated['city'] ?? null,
            'universitas' => $validated['universitas'] ?? null,
            'avatar' => $avatarPath,
            'spesialisasi' => $validated['spesialisasi'] ?? null,
            'rating' => $validated['rating'] ?? null,
            'role' => 'konselor',
            'status' => 'Verifikasi',
        ]);

        return response()->json($konselor, 201);
    }


    /**
     * Menampilkan detail satu konselor
     */
    public function show(User $user)
    {
        if ($user->role !== 'konselor') {
            abort(404);
        }
        // Jika ada relasi practiceLocations, pastikan model User memilikinya
        // Jika error, hapus ->load(...) ini sementara
        // $user->load(['practiceLocations']); 
        return $user;
    }

    /**
     * Memperbarui data konselor yang sudah ada.
     */
    public function update(Request $request, User $user)
    {
        if ($user->role !== 'konselor') {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:255',
            'universitas' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'spesialisasi' => 'nullable|array',
            'spesialisasi.*' => 'string|max:100',
            'rating' => 'nullable|numeric|min:0|max:5',
        ]);

        $avatarPath = $user->avatar;

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $avatarPath;
        } else {
            unset($validated['avatar']);
        }

        $updateData = collect($validated)->filter(function ($value, $key) {
            return $value !== null || in_array($key, ['phone', 'city', 'universitas', 'avatar', 'spesialisasi', 'rating']);
        })->all();

        if (isset($validated['spesialisasi'])) {
            $updateData['spesialisasi'] = $validated['spesialisasi'];
        }

        $updateData['avatar'] = $avatarPath;
        $user->update($updateData);
        $user->refresh();

        return response()->json($user);
    }

    /**
     * Menghapus konselor
     */
    public function destroy(User $user)
    {
        if ($user->role !== 'konselor') {
            abort(404);
        }

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->delete();
        return response()->json(null, 204);
    }

    /**
     * Metode khusus untuk status
     */
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
        $user->update(['status' => 'Terverifikasi']);
        return response()->json($user);
    }

    /**
     * Menampilkan daftar jadwal ketersediaan untuk konselor tertentu.
     */
    public function getAvailabilities(Request $request, ?User $user = null)
    {
        $counselor = $user ?? Auth::user();
        /** @var \App\Models\User $counselor */

        if (!$counselor || $counselor->role !== 'konselor') {
            return response()->json(['message' => 'Konselor tidak ditemukan.'], 404);
        }

        $availabilities = $counselor->availabilities()
            ->orderBy('tanggal_konsultasi', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json($availabilities);
    }

    /**
     * Menyimpan jadwal ketersediaan baru untuk konselor.
     */
    public function storeAvailability(Request $request, ?User $user = null)
    {
        $counselor = $user ?? Auth::user();
        /** @var \App\Models\User $counselor */

        if (!$counselor || $counselor->role !== 'konselor') {
            return response()->json(['message' => 'Konselor tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'tanggal_konsultasi' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'], // Format "HH:MM"
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        try {
            $availability = $counselor->availabilities()->create([
                'tanggal_konsultasi' => $validated['tanggal_konsultasi'],
                'start_time' => $validated['start_time'] . ':00',
                'end_time' => $validated['end_time'] . ':00',
            ]);

            Log::info('Ketersediaan baru ditambahkan:', ['user_id' => $counselor->id, 'data' => $validated]);

            return response()->json(['availability' => $availability], 201);
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
     */
    public function destroyAvailability(Request $request, ?User $user = null, CounselorAvailability $availability)
    {
        $counselor = $user ?? Auth::user();
        /** @var \App\Models\User $counselor */

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
