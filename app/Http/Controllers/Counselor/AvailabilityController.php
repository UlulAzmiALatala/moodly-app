<?php

namespace App\Http\Controllers\Counselor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\CounselorAvailability;
use Illuminate\Support\Facades\Log;

class AvailabilityController extends Controller
{
    /**
     * Mengambil semua ketersediaan milik konselor yang login.
     * GET /api/counselor/availability
     */
    public function index()
    {
        $user = Auth::user();
        $availabilities = $user->availabilities()
            ->orderBy('day_of_week', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json($availabilities);
    }

    /**
     * Menyimpan ketersediaan baru.
     * POST /api/counselor/availability
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'day_of_week' => ['required', 'integer', 'between:0,6'], // 0=Minggu, 6=Sabtu
            'start_time' => ['required', 'date_format:H:i'], // Format "HH:MM"
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
        ]);

        try {
            $availability = $user->availabilities()->create($validated);
            Log::info('Ketersediaan baru ditambahkan:', ['user_id' => $user->id, 'data' => $validated]);
            return response()->json($availability, 201); // 201 Created
        } catch (\Exception $e) {
            Log::error('Gagal menambah ketersediaan:', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menyimpan jadwal. Periksa apakah jadwal tumpang tindih.'], 500);
        }
    }

    /**
     * Menghapus ketersediaan.
     * DELETE /api/counselor/availability/{availability}
     */
    public function destroy(CounselorAvailability $availability)
    {
        $user = Auth::user();

        // Pastikan konselor hanya menghapus jadwal miliknya sendiri
        if ($availability->counselor_id !== $user->id) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        try {
            $availability->delete();
            Log::info('Ketersediaan dihapus:', ['id' => $availability->id, 'user_id' => $user->id]);
            return response()->json(null, 204); // 204 No Content
        } catch (\Exception $e) {
            Log::error('Gagal menghapus ketersediaan:', ['id' => $availability->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menghapus jadwal.'], 500);
        }
    }
}
