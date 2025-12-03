<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AdminManagementController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $query = User::where('role', 'admin');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        return $query->latest()->paginate(10);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:255',
        ]);

        $admin = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'],
            'city' => $validated['city'],
            'role' => 'admin',
            'status' => 'Offline',
        ]);

        return response()->json($admin, 201);
    }

    public function show(User $user)
    {
        if ($user->role !== 'admin') {
            abort(404);
        }
        // Mapping atribut agar frontend menerima 'dob'
        $user->dob = $user->tanggal_lahir;
        return $user;
    }

    public function update(Request $request, User $user)
    {
        if ($user->role !== 'admin') {
            abort(404);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:255',
            'gender' => 'nullable|string|in:Laki-laki,Perempuan',
            'dob' => 'nullable|date', // Validasi input 'dob'
            'password' => 'nullable|confirmed|min:8',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            if ($request->hasFile('avatar')) {
                if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                    Storage::disk('public')->delete($user->avatar);
                }
                $user->avatar = $request->file('avatar')->store('avatars', 'public');
            }

            if (!empty($request->password)) {
                $user->password = Hash::make($request->password);
            }

            // Update field standar yang namanya sama
            $fields = ['name', 'email', 'phone', 'city', 'gender'];
            foreach ($fields as $field) {
                if ($request->has($field)) {
                    $user->$field = $request->input($field);
                }
            }

            // PERBAIKAN: Mapping 'dob' ke 'tanggal_lahir'
            if ($request->has('dob')) {
                $user->tanggal_lahir = $request->input('dob');
            }

            $user->save();

            // Refresh dan kembalikan response
            $updatedUser = $user->fresh();
            $updatedUser->dob = $updatedUser->tanggal_lahir; // Mapping balik untuk frontend

            return response()->json($updatedUser);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal update admin: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(User $user)
    {
        if ($user->role !== 'admin') {
            abort(404);
        }
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }
        $user->delete();
        return response()->json(null, 204);
    }

    public function block(User $user)
    {
        if ($user->role !== 'admin') abort(404);
        $user->update(['status' => 'Banned']);
        return response()->json($user);
    }

    public function unblock(User $user)
    {
        if ($user->role !== 'admin') abort(404);
        $user->update(['status' => 'Offline']);
        return response()->json($user);
    }
}
