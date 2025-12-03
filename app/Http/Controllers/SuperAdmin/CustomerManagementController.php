<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class CustomerManagementController extends Controller
{
    /**
     * Menampilkan daftar customer dengan search & pagination.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');

        $query = User::where('role', 'customer');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        // Pagination 10 item per halaman
        return $query->latest()->paginate(10);
    }

    /**
     * Menampilkan detail satu customer.
     */
    public function show(User $user)
    {
        if ($user->role !== 'customer') {
            return response()->json(['message' => 'User bukan customer'], 404);
        }

        // PERBAIKAN 1: Mapping agar frontend bisa membaca 'dob'
        $user->dob = $user->tanggal_lahir;

        return response()->json($user);
    }

    /**
     * Mengupdate data customer (Data Diri & Alamat).
     */
    public function update(Request $request, User $user)
    {
        // 1. Pastikan yang diedit adalah customer
        if ($user->role !== 'customer') {
            abort(404);
        }

        // 2. Validasi Input
        $validated = $request->validate([
            // Info Dasar
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'gender' => 'nullable|string|in:Laki-laki,Perempuan',
            'dob' => 'nullable|date', // Input dari frontend bernama 'dob'

            // Alamat
            'city' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:255',
            'district' => 'nullable|string|max:255',
            'street_address' => 'nullable|string',
            'postal_code' => 'nullable|string|max:10',

            // File & Keamanan
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'password' => 'nullable|confirmed|min:8',
        ]);

        try {
            // 3. Handle Upload Avatar
            if ($request->hasFile('avatar')) {
                if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                    Storage::disk('public')->delete($user->avatar);
                }
                $path = $request->file('avatar')->store('avatars', 'public');
                $user->avatar = $path;
            }

            // 4. Handle Password
            if (!empty($request->password)) {
                $user->password = Hash::make($request->password);
            }

            // 5. Update Data Lainnya
            // PERBAIKAN 2: Hapus 'dob' dari sini karena nama kolom beda
            $fieldsToUpdate = [
                'name',
                'email',
                'phone',
                'gender',
                'city',
                'province',
                'district',
                'street_address',
                'postal_code'
            ];

            foreach ($fieldsToUpdate as $field) {
                if ($request->has($field)) {
                    $user->$field = $request->input($field);
                }
            }

            // PERBAIKAN 3: Mapping Manual 'dob' -> 'tanggal_lahir'
            if ($request->has('dob')) {
                $user->tanggal_lahir = $request->input('dob');
            }

            $user->save();

            // Refresh dan kembalikan response dengan mapping dob
            $updatedUser = $user->fresh();
            $updatedUser->dob = $updatedUser->tanggal_lahir;

            return response()->json($updatedUser);
        } catch (\Exception $e) {
            Log::error("Gagal update customer {$user->id}: " . $e->getMessage());
            return response()->json(['message' => 'Gagal menyimpan perubahan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Menghapus customer.
     */
    public function destroy(User $user)
    {
        if ($user->role !== 'customer') {
            abort(404);
        }

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->delete();
        return response()->json(null, 204);
    }

    // --- Aksi Khusus (Block/Unblock) ---

    public function block(User $user)
    {
        if ($user->role !== 'customer') abort(404);
        $user->update(['status' => 'Banned']);
        return response()->json($user);
    }

    public function unblock(User $user)
    {
        if ($user->role !== 'customer') abort(404);
        $user->update(['status' => 'Online']);
        return response()->json($user);
    }
}
