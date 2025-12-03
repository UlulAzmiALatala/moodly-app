<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\TempatKonseling;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class TempatKonselingController extends Controller
{
    /**
     * Menampilkan daftar tempat konseling dengan Search & Pagination.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');

        // Mulai query dari data terbaru
        $query = TempatKonseling::latest();

        // Logika Pencarian
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_tempat', 'like', "%{$search}%")
                    ->orWhere('alamat', 'like', "%{$search}%");
            });
        }

        // Gunakan paginate(10) agar sesuai dengan frontend
        return $query->paginate(10);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_tempat' => 'required|string|max:255|unique:tempat_konselings,nama_tempat',
            'alamat' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'rating' => 'nullable|numeric|min:0|max:5',
            'review_count' => 'nullable|integer|min:0',
            'status' => ['required', Rule::in(['Aktif', 'Tidak Aktif'])],
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('tempat-konseling-images', 'public');
        }

        // Merge data gambar dan nilai default
        $dataToCreate = array_merge($validated, [
            'image' => $imagePath,
            'rating' => $validated['rating'] ?? 0,
            'review_count' => $validated['review_count'] ?? 0,
        ]);

        $tempat = TempatKonseling::create($dataToCreate);

        return response()->json($tempat, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(TempatKonseling $tempatKonseling)
    {
        return $tempatKonseling;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        // Note: Kita pakai $id dan findOrFail karena kadang Route Model Binding
        // bisa bermasalah jika parameter route tidak standar.
        $tempatKonseling = TempatKonseling::findOrFail($id);

        $validated = $request->validate([
            'nama_tempat' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('tempat_konselings')->ignore($tempatKonseling->id)],
            'alamat' => 'sometimes|required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'rating' => 'nullable|numeric|min:0|max:5',
            'review_count' => 'nullable|integer|min:0',
            'status' => ['sometimes', 'required', Rule::in(['Aktif', 'Tidak Aktif'])],
        ]);

        try {
            $dataToUpdate = collect($validated)->except(['image'])->toArray();

            // Handle Update Gambar
            if ($request->hasFile('image')) {
                // Hapus gambar lama jika ada (gunakan accessor getRawOriginal jika accessor URL aktif)
                $oldImage = $tempatKonseling->getRawOriginal('image') ?? $tempatKonseling->image;

                if ($oldImage && Storage::disk('public')->exists($oldImage)) {
                    Storage::disk('public')->delete($oldImage);
                }

                // Simpan gambar baru
                $path = $request->file('image')->store('tempat-konseling-images', 'public');
                $dataToUpdate['image'] = $path;
            }

            // Pastikan nilai default jika dikirim null (opsional, tergantung frontend)
            if (array_key_exists('rating', $validated) && is_null($validated['rating'])) {
                $dataToUpdate['rating'] = 0;
            }
            if (array_key_exists('review_count', $validated) && is_null($validated['review_count'])) {
                $dataToUpdate['review_count'] = 0;
            }

            $tempatKonseling->update($dataToUpdate);

            // Refresh model untuk memastikan accessor image_url terupdate
            return response()->json($tempatKonseling->fresh());
        } catch (\Exception $e) {
            Log::error("Gagal update tempat konseling {$id}: " . $e->getMessage());
            return response()->json(['message' => 'Gagal menyimpan perubahan'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $tempatKonseling = TempatKonseling::findOrFail($id);

        // Hapus gambar terkait
        $imagePath = $tempatKonseling->getRawOriginal('image') ?? $tempatKonseling->image;

        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            Storage::disk('public')->delete($imagePath);
        }

        $tempatKonseling->delete();

        return response()->json(null, 204);
    }
}
