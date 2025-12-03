<?php

namespace App\Http\Controllers\Counselor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\TempatKonseling;

class ProfileController extends Controller
{
    /**
     * Update data profil umum (nama, alamat, dll).
     * POST /api/counselor/profile/update
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        /** @var \App\Models\User $user */

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'phone' => ['sometimes', 'required', 'string', 'max:20', Rule::unique('users')->ignore($user->id)],
            'province' => ['sometimes', 'required', 'string', 'max:255'],
            'city' => ['sometimes', 'required', 'string', 'max:255'],
            'district' => ['sometimes', 'required', 'string', 'max:255'],
            'postal_code' => ['sometimes', 'required', 'string', 'max:10'],
            'street_address' => ['sometimes', 'required', 'string'],
            'surat_izin_praktik' => ['sometimes', 'required', 'string', 'max:255'],
            'universitas' => ['sometimes', 'required', 'string', 'max:255'],

            // Validasi Spesialisasi (Array ID atau Array String tergantung implementasi frontend)
            // Disini kita asumsikan array string nama spesialisasi sesuai frontend EditPage.jsx
            'spesialisasi' => ['sometimes', 'required', 'array'],
            'spesialisasi.*' => ['string'],

            'bank_name' => ['sometimes', 'required', 'string', 'max:255'],
            'account_number' => ['sometimes', 'required', 'string', 'max:255'],
            'account_holder_name' => ['sometimes', 'required', 'string', 'max:255'],

            // Validasi Metode Layanan
            'metode_layanan' => ['sometimes', 'required', 'array'],
            'metode_layanan.*' => ['string', 'in:Chat,Video Call,Voice Call,Tatap Muka'],
        ]);

        try {
            if (empty($validated)) {
                return response()->json(['message' => 'Tidak ada data untuk diperbarui.'], 400);
            }

            // Handle Kolom Array/JSON secara manual agar aman
            if (isset($validated['spesialisasi'])) {
                $user->spesialisasi = $validated['spesialisasi'];
                unset($validated['spesialisasi']);
            }
            if (isset($validated['metode_layanan'])) {
                $user->metode_layanan = $validated['metode_layanan'];
                unset($validated['metode_layanan']);
            }

            // Update sisanya
            if (!empty($validated)) {
                $user->fill($validated);
            }

            $user->save(); // Simpan semua perubahan

            Log::info('Profil Konselor berhasil diperbarui:', ['user_id' => $user->id]);
            return response()->json($user->fresh());
        } catch (\Exception $e) {
            Log::error('Gagal update profil konselor:', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal memperbarui profil.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update avatar konselor.
     * POST /api/counselor/profile/update-avatar
     */
    public function updateAvatar(Request $request)
    {
        $user = Auth::user();
        /** @var \App\Models\User $user */

        $validated = $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);

        try {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $path = $request->file('avatar')->store('avatars', 'public');

            $user->avatar = $path;
            $user->save();

            Log::info('Avatar konselor diperbarui:', ['user_id' => $user->id]);
            return response()->json($user->fresh());
        } catch (\Exception $e) {
            Log::error('Gagal update avatar konselor:', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal mengupload avatar.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update password konselor.
     * POST /api/counselor/profile/change-password
     */
    public function updatePassword(Request $request)
    {
        $user = Auth::user();
        /** @var \App\Models\User $user */

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'confirmed', Rules\Password::defaults()],
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['errors' => ['current_password' => ['Password lama salah.']]], 422);
        }

        try {
            $user->password = Hash::make($validated['password']);
            $user->save();
            return response()->json(['message' => 'Password berhasil diperbarui.']);
        } catch (\Exception $e) {
            Log::error('Gagal update password konselor:', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal memperbarui password.'], 500);
        }
    }

    /**
     * Update email konselor.
     * POST /api/counselor/profile/change-email
     */
    public function updateEmail(Request $request)
    {
        $user = Auth::user();
        /** @var \App\Models\User $user */

        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'current_password' => ['required', 'string'],
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['errors' => ['current_password' => ['Password salah.']]], 422);
        }

        try {
            $user->email = $validated['email'];
            $user->email_verified_at = null; // Reset verifikasi
            $user->save();

            return response()->json(['message' => 'Email berhasil diperbarui. Silakan verifikasi email baru Anda.']);
        } catch (\Exception $e) {
            Log::error('Gagal update email konselor:', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal memperbarui email.'], 500);
        }
    }

    /**
     * Mengambil daftar tempat praktik (Support Search & Pagination).
     * GET /api/counselor/profile/practice-locations
     */
    public function getPracticeLocations(Request $request)
    {
        $user = Auth::user();
        /** @var \App\Models\User $user */

        try {
            // 1. Mulai Query Tempat Konseling Aktif
            $query = TempatKonseling::where('status', 'Aktif');

            // 2. Fitur Pencarian (Search)
            if ($request->has('search') && $request->search != '') {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('nama_tempat', 'like', "%{$search}%")
                        ->orWhere('alamat', 'like', "%{$search}%");
                });
            }

            // 3. Ambil Data (Paginated atau All)
            // Jika frontend mengirim parameter 'page', kita gunakan pagination
            if ($request->has('page')) {
                $allLocations = $query->orderBy('nama_tempat')->paginate(10);
            } else {
                $allLocations = $query->orderBy('nama_tempat')->get();
            }

            // 4. Ambil ID lokasi yang sudah dipilih user
            $myLocationIds = $user->practiceLocations()->pluck('tempat_konselings.id');

            // Return data (jika paginated, structure JSON-nya beda dikit, frontend harus handle)
            return response()->json([
                'all_locations' => $allLocations,
                'my_location_ids' => $myLocationIds,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching practice locations:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal memuat data lokasi.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update/sinkronkan tempat praktik yang dipilih konselor.
     * POST /api/counselor/profile/practice-locations
     */
    public function updatePracticeLocations(Request $request)
    {
        $user = Auth::user();
        /** @var \App\Models\User $user */

        $validated = $request->validate([
            'location_ids' => ['required', 'array'],
            'location_ids.*' => ['integer', 'exists:tempat_konselings,id'],
        ]);

        try {
            // Sync relationship Many-to-Many
            $user->practiceLocations()->sync($validated['location_ids']);

            Log::info('Practice locations updated for user: ' . $user->id);
            return response()->json(['message' => 'Tempat praktik berhasil diperbarui.']);
        } catch (\Exception $e) {
            Log::error('Practice locations update failed:', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal memperbarui tempat praktik.'], 500);
        }
    }
}
