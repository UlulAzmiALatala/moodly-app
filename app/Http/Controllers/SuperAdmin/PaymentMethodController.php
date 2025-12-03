<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PaymentMethodController extends Controller
{
    /**
     * Menampilkan semua metode pembayaran dengan Search & Pagination.
     */
    public function index(Request $request)
    {
        // 1. Mulai Query
        $query = PaymentMethod::query();

        // 2. Logika Pencarian (Search)
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('account_details', 'like', "%{$search}%");
            });
        }

        // 3. Sorting & Pagination
        // 'paginate(10)' otomatis menangkap parameter '?page=' dari URL frontend
        $paymentMethods = $query->latest()->paginate(10);

        return response()->json($paymentMethods);
    }

    /**
     * Menyimpan metode pembayaran baru (termasuk upload gambar).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'account_details' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
            'status' => 'required|string|in:Aktif,Tidak Aktif',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            // Simpan di storage/app/public/payment_methods
            $imagePath = $request->file('image')->store('payment_methods', 'public');
        }

        $paymentMethod = PaymentMethod::create([
            'name' => $validated['name'],
            'account_details' => $validated['account_details'],
            'image' => $imagePath,
            'status' => $validated['status'],
        ]);

        return response()->json($paymentMethod, 201);
    }

    /**
     * Menampilkan detail satu metode.
     */
    public function show(PaymentMethod $paymentMethod)
    {
        return response()->json($paymentMethod);
    }

    /**
     * Mengupdate metode pembayaran.
     */
    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'account_details' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'status' => 'required|string|in:Aktif,Tidak Aktif',
        ]);

        $imagePath = $paymentMethod->image; // Path lama

        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($paymentMethod->image) {
                Storage::disk('public')->delete($paymentMethod->image);
            }
            // Simpan gambar baru
            $imagePath = $request->file('image')->store('payment_methods', 'public');
        }

        $paymentMethod->update([
            'name' => $validated['name'],
            'account_details' => $validated['account_details'],
            'image' => $imagePath,
            'status' => $validated['status'],
        ]);

        // Refresh model untuk memastikan data terbaru (terutama image accessor jika ada)
        $paymentMethod->refresh();

        return response()->json($paymentMethod);
    }

    /**
     * Menghapus metode pembayaran.
     */
    public function destroy(PaymentMethod $paymentMethod)
    {
        // Hapus gambar dari storage
        if ($paymentMethod->image) {
            Storage::disk('public')->delete($paymentMethod->image);
        }

        $paymentMethod->delete();

        return response()->json(null, 204);
    }
}
