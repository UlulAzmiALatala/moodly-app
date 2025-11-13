<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{
    /**
     * Update data profil umum (nama, alamat).
     * POST /api/profile/update
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'phone' => ['sometimes', 'required', 'string', 'max:20'],
            'province' => ['sometimes', 'required', 'string', 'max:255'],
            'city' => ['sometimes', 'required', 'string', 'max:255'],
            'district' => ['sometimes', 'required', 'string', 'max:255'],
            'postal_code' => ['sometimes', 'required', 'string', 'max:10'],
            'street_address' => ['sometimes', 'required', 'string'],
        ]);

        try {
            if (empty($validated)) {
                return response()->json(['message' => 'Tidak ada data untuk diperbarui.'], 400);
            }
            $user->update($validated);
            Log::info('Profile updated successfully for user: ' . $user->id, $validated);
            return response()->json($user->fresh());
        } catch (\Exception $e) {
            Log::error('Profile update failed for user: ' . $user->id, ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal memperbarui profil.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update password customer.
     * POST /api/profile/change-password
     */
    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'confirmed', Rules\Password::defaults()],
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Password lama yang Anda masukkan salah.',
                'errors' => ['current_password' => ['Password lama yang Anda masukkan salah.']]
            ], 422);
        }

        try {
            $user->update(['password' => Hash::make($validated['password'])]);
            return response()->json(['message' => 'Password berhasil diperbarui.']);
        } catch (\Exception $e) {
            Log::error('Password update failed for user: ' . $user->id, ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal memperbarui password.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update email customer.
     * POST /api/profile/change-email
     */
    public function updateEmail(Request $request)
    {
        $user = Auth::user();

        // Validasi email baru
        $validated = $request->validate([
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)
            ],
            // Pastikan password saat ini benar untuk mengubah email
            'current_password' => ['required', 'string'],
        ]);

        // Cek password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Password yang Anda masukkan salah.',
                'errors' => ['current_password' => ['Password yang Anda masukkan salah.']]
            ], 422);
        }

        try {
            // Update email dan set email_verified_at ke null (membutuhkan verifikasi ulang)
            $user->update([
                'email' => $validated['email'],
                'email_verified_at' => null,
            ]);

            // TODO: Kirim email verifikasi baru
            // $user->sendEmailVerificationNotification();

            return response()->json(['message' => 'Email berhasil diperbarui. Silakan verifikasi email baru Anda.']);
        } catch (\Exception $e) {
            Log::error('Email update failed for user: ' . $user->id, ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal memperbarui email.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update nomor telepon customer.
     * POST /api/profile/change-phone
     */
    public function updatePhone(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:20', Rule::unique('users')->ignore($user->id)],
            'current_password' => ['required', 'string'],
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Password yang Anda masukkan salah.',
                'errors' => ['current_password' => ['Password yang Anda masukkan salah.']]
            ], 422);
        }

        try {
            $user->update(['phone' => $validated['phone']]);
            return response()->json(['message' => 'Nomor telepon berhasil diperbarui.', 'user' => $user->fresh()]);
        } catch (\Exception $e) {
            Log::error('Phone update failed for user: ' . $user->id, ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal memperbarui nomor telepon.', 'error' => $e->getMessage()], 500);
        }
    }
}
