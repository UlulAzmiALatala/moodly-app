<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\JenisKonseling;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class JenisKonselingController extends Controller
{
    /**
     * Menampilkan daftar semua jenis konseling.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');

        $query = JenisKonseling::latest();

        if ($search) {
            $query->where('jenis_konseling', 'like', "%{$search}%");
        }

        // Gunakan paginate agar sesuai dengan frontend yang mengharapkan struktur paginasi
        return $query->paginate(10);
    }

    /**
     * Menyimpan jenis konseling baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'jenis_konseling' => 'required|string|max:255|unique:jenis_konselings,jenis_konseling',
            'tipe_layanan' => ['required', 'string', Rule::in(['Online', 'Offline'])],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
            'biaya_layanan' => ['required', 'string', Rule::in(['Nominal Tetap', 'Persentase'])],
            'nilai' => 'required|string|max:50',
            'status' => ['required', 'string', Rule::in(['Aktif', 'Tidak Aktif'])],
        ]);

        try {
            $dataToCreate = $request->except('image');

            // Upload Gambar
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('jenis-konseling-icons', 'public');
                $dataToCreate['image'] = $path;
            }

            $jenisKonseling = JenisKonseling::create($dataToCreate);

            return response()->json($jenisKonseling, 201);
        } catch (\Exception $e) {
            Log::error("Gagal simpan jenis konseling: " . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan server'], 500);
        }
    }

    /**
     * Menampilkan satu jenis konseling spesifik.
     */
    public function show(JenisKonseling $jenisKonseling)
    {
        return $jenisKonseling;
    }

    /**
     * Memperbarui jenis konseling yang sudah ada.
     */
    public function update(Request $request, $id)
    {
        $jenisKonseling = JenisKonseling::findOrFail($id);

        $request->validate([
            'jenis_konseling' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('jenis_konselings')->ignore($jenisKonseling->id)],
            'tipe_layanan' => ['sometimes', 'required', 'string', Rule::in(['Online', 'Offline'])],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048',
            'biaya_layanan' => ['sometimes', 'required', 'string', Rule::in(['Nominal Tetap', 'Persentase'])],
            'nilai' => 'sometimes|required|string|max:50',
            'status' => ['sometimes', 'required', 'string', Rule::in(['Aktif', 'Tidak Aktif'])],
        ]);

        try {
            $dataToUpdate = $request->except('image');

            // Logika Update Gambar
            if ($request->hasFile('image')) {
                // Hapus gambar lama (Gunakan getRawOriginal untuk dapatkan path, bukan URL)
                if ($jenisKonseling->getRawOriginal('image') && Storage::disk('public')->exists($jenisKonseling->getRawOriginal('image'))) {
                    Storage::disk('public')->delete($jenisKonseling->getRawOriginal('image'));
                }

                // Simpan gambar baru
                $path = $request->file('image')->store('jenis-konseling-icons', 'public');
                $dataToUpdate['image'] = $path;
            }

            $jenisKonseling->update($dataToUpdate);

            return response()->json($jenisKonseling->fresh());
        } catch (\Exception $e) {
            Log::error("Gagal update jenis konseling {$id}: " . $e->getMessage());
            return response()->json(['message' => 'Gagal menyimpan perubahan'], 500);
        }
    }

    /**
     * Menghapus jenis konseling dari database.
     */
    public function destroy($id)
    {
        $jenisKonseling = JenisKonseling::findOrFail($id);

        // Hapus gambar dari storage saat data dihapus
        if ($jenisKonseling->getRawOriginal('image') && Storage::disk('public')->exists($jenisKonseling->getRawOriginal('image'))) {
            Storage::disk('public')->delete($jenisKonseling->getRawOriginal('image'));
        }

        $jenisKonseling->delete();

        return response()->json(null, 204);
    }
}
