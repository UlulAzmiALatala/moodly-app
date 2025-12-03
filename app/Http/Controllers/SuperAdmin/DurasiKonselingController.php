<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\DurasiKonseling;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DurasiKonselingController extends Controller
{
    /**
     * Menampilkan daftar durasi konseling (Search & Pagination).
     */
    public function index(Request $request)
    {
        $search = $request->query('search');

        $query = DurasiKonseling::latest();

        // Logika Pencarian
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('durasi_menit', 'like', "%{$search}%")
                    ->orWhere('harga', 'like', "%{$search}%");
            });
        }

        // Gunakan paginate agar sinkron dengan frontend
        return $query->paginate(10);
    }

    /**
     * Menyimpan data baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'durasi_menit' => 'required|string|max:255', // Bisa string misal "60 Menit" atau "1 Jam"
            'harga' => 'required|integer|min:0',
        ]);

        try {
            $durasi = DurasiKonseling::create($validated);
            return response()->json($durasi, 201);
        } catch (\Exception $e) {
            Log::error("Error storing durasi: " . $e->getMessage());
            return response()->json(['message' => 'Gagal menyimpan data.'], 500);
        }
    }

    /**
     * Menampilkan detail data.
     */
    public function show(DurasiKonseling $durasiKonseling)
    {
        return $durasiKonseling;
    }

    /**
     * Mengupdate data.
     */
    public function update(Request $request, DurasiKonseling $durasiKonseling)
    {
        $validated = $request->validate([
            'durasi_menit' => 'sometimes|required|string|max:255',
            'harga' => 'sometimes|required|integer|min:0',
        ]);

        try {
            $durasiKonseling->update($validated);
            return response()->json($durasiKonseling);
        } catch (\Exception $e) {
            Log::error("Error updating durasi: " . $e->getMessage());
            return response()->json(['message' => 'Gagal mengupdate data.'], 500);
        }
    }

    /**
     * Menghapus data.
     */
    public function destroy(DurasiKonseling $durasiKonseling)
    {
        try {
            $durasiKonseling->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error("Error deleting durasi: " . $e->getMessage());
            return response()->json(['message' => 'Gagal menghapus data.'], 500);
        }
    }
}
