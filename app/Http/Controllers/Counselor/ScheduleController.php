<?php

namespace App\Http\Controllers\Counselor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Booking;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Notification;
use App\Models\User;
use Carbon\Carbon;
use App\Services\BookingFinanceService;
use App\Notifications\RescheduleRequested;
use App\Notifications\BookingStatusUpdated;
use App\Notifications\PayoutRequested;

class ScheduleController extends Controller
{
    protected $financeService;

    public function __construct(BookingFinanceService $financeService)
    {
        $this->financeService = $financeService;
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        $search = $request->query('search');

        $upcomingStatuses = [
            'Dijadwalkan',
            'Aktif',
            'Proses',
            'Menunggu Konfirmasi',
            'Menunggu Konfirmasi Customer'
        ];

        $query = Booking::where('konselor_id', $user->id)
            ->whereIn('status_pesanan', $upcomingStatuses)
            ->where('tanggal_konsultasi', '>=', now()->toDateString());

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('customer', function ($subQ) use ($search) {
                    $subQ->where('name', 'like', "%{$search}%");
                })->orWhere('id', 'like', "%{$search}%");
            });
        }

        $schedules = $query->with([
            'customer:id,name,avatar',
            'durasiKonseling:id,durasi_menit'
        ])
            ->orderBy('tanggal_konsultasi', 'asc')
            ->orderBy('jam_konsultasi', 'asc')
            ->get();

        return response()->json($schedules);
    }

    public function show(Request $request, Booking $booking)
    {
        $user = Auth::user();

        if ($booking->konselor_id !== $user->id) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $booking->load([
            'customer:id,name,avatar,phone',
            'durasiKonseling:id,durasi_menit',
            'jenisKonseling:id,jenis_konseling'
        ]);

        return response()->json($booking);
    }

    public function completeSession(Request $request, Booking $booking)
    {
        $user = Auth::user();

        if ($booking->konselor_id !== $user->id) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $validStatusToComplete = ['Dijadwalkan', 'Aktif', 'Proses', 'Menunggu Konfirmasi'];
        if (!in_array($booking->status_pesanan, $validStatusToComplete)) {
            return response()->json(['message' => 'Sesi ini tidak dapat diselesaikan.'], 409);
        }

        try {
            $this->financeService->completeBooking($booking);

            try {
                $booking->customer->notify(new BookingStatusUpdated($booking));
            } catch (\Exception $e) {
                Log::error('Gagal kirim notif selesai: ' . $e->getMessage());
            }

            try {
                $admins = User::whereIn('role', ['admin', 'super-admin'])->get();
                Notification::send($admins, new PayoutRequested($booking));
            } catch (\Exception $e) {
                Log::error('Gagal kirim notif payout admin: ' . $e->getMessage());
            }

            Log::info('Sesi Selesai & Perhitungan Keuangan Sukses:', ['booking_id' => $booking->id]);

            return response()->json([
                'message' => 'Sesi berhasil ditandai sebagai Selesai. Pendapatan telah dicatat.',
                'booking' => $booking->fresh()->load([
                    'customer:id,name,avatar,phone',
                    'durasiKonseling',
                    'jenisKonseling'
                ])
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal menyelesaikan sesi:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Gagal menyelesaikan sesi.'], 500);
        }
    }

    public function reschedule(Request $request, Booking $booking)
    {
        $user = Auth::user();

        if ($booking->konselor_id !== $user->id) {
            return response()->json(['message' => 'Tidak diizinkan'], 403);
        }

        $nonReschedulableStatus = ['Selesai', 'Batal', 'DIBATALKAN', 'DITOLAK', 'SELESAI'];
        if (in_array($booking->status_pesanan, $nonReschedulableStatus)) {
            return response()->json(['message' => 'Sesi dengan status ini tidak dapat dijadwal ulang.'], 422);
        }

        if ($booking->status_pesanan === 'Menunggu Konfirmasi Customer') {
            return response()->json(['message' => 'Sudah ada pengajuan jadwal ulang yang menunggu konfirmasi customer.'], 409);
        }

        $validator = Validator::make($request->all(), [
            'tanggal_konsultasi' => 'required|date',
            'jam_konsultasi' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Data tidak valid.', 'errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();
        $newDate = $validated['tanggal_konsultasi'];
        $newTime = substr($validated['jam_konsultasi'], 0, 5);

        $reqDateTime = Carbon::parse("$newDate $newTime");

        if ($reqDateTime->lt(now()->subMinutes(15))) {
            return response()->json(['message' => 'Waktu yang dipilih sudah berlalu.'], 422);
        }

        $durationMinutes = $booking->durasiKonseling->durasi_menit ?? 60;
        $reqEnd = $reqDateTime->copy()->addMinutes($durationMinutes);

        $conflictingBookings = Booking::where('konselor_id', $user->id)
            ->where('tanggal_konsultasi', $newDate)
            ->where('id', '!=', $booking->id)
            ->whereIn('status_pesanan', ['Dijadwalkan', 'Aktif', 'Proses', 'Menunggu Konfirmasi', 'Menunggu Konfirmasi Customer'])
            ->with('durasiKonseling')
            ->get();

        $conflict = null;
        foreach ($conflictingBookings as $existing) {
            $existingStart = Carbon::parse($existing->tanggal_konsultasi . ' ' . $existing->jam_konsultasi);
            $existingDuration = $existing->durasiKonseling->durasi_menit ?? 60;
            $existingEnd = $existingStart->copy()->addMinutes($existingDuration);

            if ($reqDateTime->lt($existingEnd) && $reqEnd->gt($existingStart)) {
                $conflict = $existing;
                break;
            }
        }

        if ($conflict) {
            return response()->json([
                'message' => 'Jadwal baru bentrok dengan sesi lain.',
                'conflict_with' => substr($conflict->jam_konsultasi, 0, 5)
            ], 409);
        }

        try {
            $booking->update([
                'proposed_date' => $newDate,
                'proposed_time' => $newTime,
                'status_pesanan' => 'Menunggu Konfirmasi Customer',
            ]);

            $booking->load('customer');

            try {
                $booking->customer->notify(new RescheduleRequested($booking));
            } catch (\Exception $e) {
                Log::error('Gagal kirim notif reschedule ke customer: ' . $e->getMessage());
            }

            Log::info('Pengajuan reschedule oleh konselor:', ['booking_id' => $booking->id]);

            return response()->json([
                'message' => 'Pengajuan jadwal ulang telah dikirim ke customer.',
                'booking' => $booking->fresh()->load([
                    'customer:id,name,avatar,phone',
                    'durasiKonseling',
                    'jenisKonseling'
                ])
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal mengajukan reschedule oleh konselor:', ['booking_id' => $booking->id, 'error' => $e->getMessage()]);
            return response()->json(['message' => 'Terjadi kesalahan saat mengajukan jadwal ulang.'], 500);
        }
    }
}
