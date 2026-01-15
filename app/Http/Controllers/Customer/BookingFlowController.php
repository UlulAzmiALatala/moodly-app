<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TempatKonseling;
use App\Models\User;
use App\Models\DurasiKonseling;
use App\Models\Booking;
use App\Models\CounselorAvailability;
use App\Models\PaymentMethod;
use App\Models\JenisKonseling; // Import Model Jenis Konseling
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Carbon\CarbonInterval;
use App\Events\PaymentProofUploaded;
use App\Notifications\NewBookingReceived;

class BookingFlowController extends Controller
{
    /**
     * Mengambil daftar tempat konseling aktif.
     */
    public function getTempatKonseling()
    {
        try {
            $tempatList = TempatKonseling::where('status', 'Aktif')
                ->select('id', 'nama_tempat', 'alamat', 'image', 'rating', 'review_count')
                ->orderBy('nama_tempat')
                ->get();
            return response()->json($tempatList);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal mengambil data tempat konseling.'], 500);
        }
    }

    public function getTempatDetail(TempatKonseling $tempatKonseling)
    {
        return response()->json($tempatKonseling);
    }

    /**
     * Mengambil daftar konselor (Active & Verified).
     * Data 'spesialisasi' otomatis diconvert jadi Text Label via Accessor di Model User.
     */
    public function getCounselors(Request $request)
    {
        try {
            $query = User::where('role', 'konselor')
                ->where('status', 'Terverifikasi');

            if ($request->has('serviceId')) {
                $serviceId = (int) $request->query('serviceId');
                $query->whereJsonContains('spesialisasi', $serviceId);
            }

            $counselors = $query->orderBy('name')->get();

            // Transformasi Data Manual untuk Frontend
            $counselors->transform(function ($counselor) {
                return [
                    'id' => $counselor->id,
                    'name' => $counselor->name,
                    'avatar' => $counselor->avatar_url, // Menggunakan Accessor URL
                    'universitas' => $counselor->universitas,
                    'spesialisasi' => $counselor->spesialisasi_label, // Menggunakan Accessor Label Teks
                    'rating' => $counselor->rating,
                ];
            });

            return response()->json($counselors);
        } catch (\Exception $e) {
            Log::error('Error fetching counselors:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal mengambil data konselor.'], 500);
        }
    }

    /**
     * Mengambil detail satu konselor.
     */
    public function showCounselor(User $konselor)
    {
        try {
            if ($konselor->role !== 'konselor' || $konselor->status !== 'Terverifikasi') {
                return response()->json(['message' => 'Konselor tidak ditemukan.'], 404);
            }

            return response()->json([
                'id' => $konselor->id,
                'name' => $konselor->name,
                'avatar' => $konselor->avatar_url,
                'universitas' => $konselor->universitas,
                'spesialisasi' => $konselor->spesialisasi_label, // Array Teks ["Stress", "Karir"]
                'rating' => $konselor->rating,
                'surat_izin_praktik' => $konselor->surat_izin_praktik,
                'metode_layanan' => $konselor->metode_layanan ?? [],
                'reviews' => null
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching counselor detail:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal mengambil detail konselor.'], 500);
        }
    }

    /**
     * Mengambil jadwal (Anti-Bentrok Visual).
     */
    public function getScheduleOptions(User $konselor)
    {
        try {
            // 1. Durasi
            $durations = DurasiKonseling::select('id', 'durasi_menit', 'harga')->orderBy('harga')->get();
            if ($durations->isEmpty()) return response()->json(['message' => 'Data durasi kosong.'], 404);

            $minDuration = $durations->min('durasi_menit');
            $interval = CarbonInterval::minutes($minDuration ?? 60);

            // 2. Ketersediaan
            $today = Carbon::today();
            $availabilities = CounselorAvailability::where('counselor_id', $konselor->id)
                ->where('tanggal_konsultasi', '>=', $today)
                ->orderBy('tanggal_konsultasi', 'asc')
                ->orderBy('start_time', 'asc')
                ->get();

            // 3. Booking Aktif (untuk menandai slot penuh)
            $upcomingBookings = Booking::where('konselor_id', $konselor->id)
                ->where('tanggal_konsultasi', '>=', $today)
                ->whereIn('status_pesanan', ['Dijadwalkan', 'Aktif', 'Menunggu Pembayaran', 'Proses', 'Menunggu Konfirmasi', 'Menunggu Konfirmasi Customer'])
                ->with('durasiKonseling:id,durasi_menit')
                ->get();

            $bookedSlots = [];
            foreach ($upcomingBookings as $booking) {
                if (!$booking->durasiKonseling) continue;
                $startTime = Carbon::parse($booking->jam_konsultasi);
                $duration = $booking->durasiKonseling->durasi_menit;
                $endTime = $startTime->copy()->addMinutes($duration);
                $currentSlot = $startTime->copy();

                while ($currentSlot < $endTime) {
                    $key = $booking->tanggal_konsultasi . '_' . $currentSlot->format('H:i');
                    $bookedSlots[$key] = true;
                    $currentSlot->add($interval);
                }
            }

            // 4. Generate Slot
            $availableDates = [];
            $groupedAvailabilities = $availabilities->groupBy(function ($item) {
                return Carbon::parse($item->tanggal_konsultasi)->format('Y-m-d');
            });

            foreach ($groupedAvailabilities as $dateStr => $dayAvails) {
                $date = Carbon::parse($dateStr);
                $slots = [];

                foreach ($dayAvails as $availability) {
                    $startTime = Carbon::parse($availability->start_time);
                    $endTime = Carbon::parse($availability->end_time);
                    $currentTime = $startTime->copy();

                    while ($currentTime < $endTime) {
                        $slotStartStr = $currentTime->format('H:i');
                        $slotKey = $dateStr . '_' . $slotStartStr;

                        if (!isset($bookedSlots[$slotKey])) {
                            if ($currentTime->copy()->add($interval) <= $endTime) {
                                $slots[] = $slotStartStr;
                            }
                        }
                        $currentTime->add($interval);
                    }
                }

                $slots = array_unique($slots);
                sort($slots);

                if (!empty($slots)) {
                    $groupedSlots = ['Pagi' => [], 'Siang' => [], 'Sore' => [], 'Malam' => []];
                    foreach ($slots as $slot) {
                        $hour = (int) substr($slot, 0, 2);
                        if ($hour >= 6 && $hour < 11) $groupedSlots['Pagi'][] = $slot;
                        elseif ($hour >= 11 && $hour < 15) $groupedSlots['Siang'][] = $slot;
                        elseif ($hour >= 15 && $hour < 18) $groupedSlots['Sore'][] = $slot;
                        elseif ($hour >= 18 && $hour < 22) $groupedSlots['Malam'][] = $slot;
                    }

                    $availableSlotsGrouped = array_filter($groupedSlots);
                    if (!empty($availableSlotsGrouped)) {
                        $availableDates[] = [
                            'date' => $dateStr,
                            'dayName' => $date->translatedFormat('l'),
                            'dayOfMonth' => $date->day,
                            'monthName' => $date->translatedFormat('M'),
                            'availableTimes' => $availableSlotsGrouped,
                        ];
                    }
                }
            }

            usort($availableDates, function ($a, $b) {
                return strtotime($a['date']) - strtotime($b['date']);
            });

            return response()->json([
                'durations' => $durations,
                'availableDates' => $availableDates,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching schedule:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal mengambil jadwal.'], 500);
        }
    }

    /**
     * Simpan Booking (Anti-Bentrok).
     */
    public function storeBooking(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'counselorId' => 'required|exists:users,id',
            'jenisKonselingId' => 'nullable|exists:jenis_konselings,id',
            'durationId' => 'required|exists:durasi_konselings,id',
            'tempatId' => 'nullable|required_if:method,Tatap Muka|exists:tempat_konselings,id',
            'date' => 'required|date_format:Y-m-d|after_or_equal:today',
            'time' => 'required|date_format:H:i',
            'method' => 'required|string|in:Chat,Voice Call,Video Call,Tatap Muka',
        ]);

        if ($validator->fails()) return response()->json(['errors' => $validator->errors()], 422);

        $validated = $validator->validated();

        try {
            $user = Auth::user();
            $durasi = DurasiKonseling::find($validated['durationId']);
            if (!$durasi) return response()->json(['message' => 'Durasi tidak valid'], 404);

            $reqStart = Carbon::parse($validated['date'] . ' ' . $validated['time']);
            $reqEnd = $reqStart->copy()->addMinutes($durasi->durasi_menit);

            if ($reqStart->isPast()) {
                return response()->json(['message' => 'Waktu yang dipilih sudah berlalu.'], 422);
            }

            // Cek Bentrok
            $conflict = Booking::where('konselor_id', $validated['counselorId'])
                ->where('tanggal_konsultasi', $validated['date'])
                ->whereIn('status_pesanan', ['Dijadwalkan', 'Aktif', 'Menunggu Pembayaran', 'Proses', 'Menunggu Konfirmasi', 'Menunggu Konfirmasi Customer'])
                ->with('durasiKonseling')
                ->get()
                ->filter(function ($existing) use ($reqStart, $reqEnd) {
                    $existingStart = Carbon::parse($existing->tanggal_konsultasi . ' ' . $existing->jam_konsultasi);
                    $existingDuration = $existing->durasiKonseling->durasi_menit ?? 60;
                    $existingEnd = $existingStart->copy()->addMinutes($existingDuration);
                    return ($reqStart < $existingEnd) && ($reqEnd > $existingStart);
                })
                ->first();

            if ($conflict) {
                return response()->json([
                    'message' => 'Jadwal bentrok dengan sesi lain. Slot waktu ini sudah terisi.',
                    'conflict_time' => $conflict->jam_konsultasi
                ], 409);
            }

            // Create Booking
            $booking = Booking::create([
                'customer_id' => $user->id,
                'konselor_id' => $validated['counselorId'],
                'jenis_konseling_id' => $validated['jenisKonselingId'] ?? null,
                'durasi_konseling_id' => $validated['durationId'],
                'tempat_konseling_id' => $validated['method'] === 'Tatap Muka' ? $validated['tempatId'] : null,
                'tanggal_konsultasi' => $validated['date'],
                'jam_konsultasi' => $validated['time'],
                'metode_konsultasi' => $validated['method'],
                'status_pesanan' => 'Menunggu Pembayaran',
                'total_harga' => $durasi->harga + 5000,
            ]);

            // Load Data Lengkap untuk Frontend
            $booking->load([
                'customer:id,name,phone',
                'konselor:id,name,avatar,universitas,spesialisasi,surat_izin_praktik', // PENTING: Data lengkap untuk frontend
                'jenisKonseling',
                'durasiKonseling',
                'tempatKonseling'
            ]);

            // Notifikasi Konselor
            try {
                if ($booking->konselor) {
                    $booking->konselor->notify(new NewBookingReceived($booking));
                }
            } catch (\Exception $e) {
                Log::error('Notif error: ' . $e->getMessage());
            }

            return response()->json([
                'message' => 'Booking berhasil dibuat.',
                'booking' => $booking
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error storeBooking: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan server.'], 500);
        }
    }

    public function getPaymentMethods()
    {
        return response()->json(PaymentMethod::where('status', 'Aktif')->get());
    }

    public function getPaymentMethodImage(PaymentMethod $paymentMethod)
    {
        if (!$paymentMethod->image || !Storage::disk('public')->exists($paymentMethod->image)) {
            return response()->json(['message' => 'Gambar tidak ditemukan.'], 404);
        }
        return response()->file(Storage::disk('public')->path($paymentMethod->image));
    }

    public function uploadPaymentProof(Request $request, Booking $booking)
    {
        if ($booking->customer_id !== Auth::id()) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        // [PERBAIKAN] Izinkan upload jika status 'Menunggu Pembayaran' ATAU 'Pembayaran Ditolak'
        if (!in_array($booking->status_pesanan, ['Menunggu Pembayaran', 'Pembayaran Ditolak'])) {
            return response()->json([
                'message' => 'Tidak dapat mengupload bukti untuk pesanan ini (Status: ' . $booking->status_pesanan . ')'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'image' => 'required|image|max:2048', // 2MB Max
            'keterangan' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Hapus bukti lama jika ada (agar hemat storage)
            if ($booking->payment_proof_image && Storage::disk('public')->exists($booking->payment_proof_image)) {
                Storage::disk('public')->delete($booking->payment_proof_image);
            }

            $path = $request->file('image')->store('payment_proofs', 'public');

            $booking->update([
                'payment_proof_image' => $path,
                'payment_proof_notes' => $request->input('keterangan'),
                'status_pesanan' => 'Menunggu Verifikasi',
                'catatan_pembatalan' => null // Reset catatan penolakan admin
            ]);

            // Broadcast event agar admin dashboard terupdate real-time
            broadcast(new PaymentProofUploaded($booking));

            return response()->json(['message' => 'Bukti terupload', 'booking' => $booking]);
        } catch (\Exception $e) {
            Log::error('Upload error: ' . $e->getMessage());
            return response()->json(['message' => 'Gagal upload', 'error' => $e->getMessage()], 500);
        }
    }
}
