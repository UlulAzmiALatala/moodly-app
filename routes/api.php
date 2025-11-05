<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\SuperAdmin\JenisKonselingController;
// ... (use statements tidak berubah) ...
use App\Http\Controllers\SuperAdmin\DurasiKonselingController;
use App\Http\Controllers\SuperAdmin\TempatKonselingController;
use App\Http\Controllers\SuperAdmin\AdminManagementController;
use App\Http\Controllers\SuperAdmin\KonselorManagementController;
use App\Http\Controllers\SuperAdmin\CustomerManagementController;
use App\Http\Controllers\SuperAdmin\BookingManagementController;
// --- TAMBAHKAN IMPORT INI ---
use App\Http\Controllers\SuperAdmin\PaymentMethodController;
// --- AKHIR TAMBAHAN ---

use App\Http\Controllers\Admin\JadwalKonsultasiController;
use App\Http\Controllers\Admin\KonselorVerificationController;
use App\Http\Controllers\Admin\CustomerVerificationController;

use App\Http\Controllers\Customer\BerandaController;
use App\Http\Controllers\Customer\HistoryController;
use App\Http\Controllers\Customer\BookingFlowController;
use App\Http\Controllers\BookingChatController;

use App\Http\Middleware\RoleMiddleware;
use App\Models\User;
use App\Models\Booking;
use App\Models\TempatKonseling;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- GRUP UTAMA UNTUK SEMUA RUTE YANG MEMBUTUHKAN SESI ---
Route::group(['middleware' => [
    \Illuminate\Cookie\Middleware\EncryptCookies::class,
    \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
    \Illuminate\Session\Middleware\StartSession::class,
]], function () {

    // 1. Rute Autentikasi
    require __DIR__ . '/auth.php';

    // --- RUTE PUBLIK (TIDAK PERLU LOGIN) ---
    // Rute untuk Customer mengambil daftar QRIS
    Route::get('/payment-methods', [BookingFlowController::class, 'getPaymentMethods']);

    // --- INI RUTE BARU (PROXY GAMBAR) ---
    // Rute "Proxy" untuk mengambil gambar QRIS (menghindari CORS error di 'php artisan serve')
    // Kita gunakan 'paymentMethod' (model binding) agar lebih rapi
    Route::get('/payment-methods/image/{paymentMethod}', [BookingFlowController::class, 'getPaymentMethodImage'])
        ->where('paymentMethod', '[0-9]+'); // Pastikan ID adalah angka
    // --- AKHIR RUTE BARU ---


    // 2. Grup untuk SEMUA rute yang terproteksi
    Route::middleware('auth:sanctum')->group(function () {

        // Rute umum
        Route::get('/user', function (Request $request) {
            return $request->user();
        });

        // --- RUTE UNTUK CUSTOMER ---
        Route::get('/beranda-data', [BerandaController::class, 'getBerandaData']);

        // History
        Route::get('/history', [HistoryController::class, 'index']);
        // ... (rute history customer tidak berubah) ...
        Route::get('/history/{booking}', [HistoryController::class, 'show']);
        Route::patch('/history/{booking}/cancel', [HistoryController::class, 'cancel']);
        Route::patch('/history/{booking}/reschedule', [HistoryController::class, 'reschedule']);

        // Booking Flow
        Route::get('/booking/tempat-konseling', [BookingFlowController::class, 'getTempatKonseling']);
        // ... (rute booking flow tidak berubah) ...
        Route::get('/booking/tempat-konseling/{tempatKonseling}', [BookingFlowController::class, 'getTempatDetail'])
            ->where('tempatKonseling', '[0-9]+');
        Route::get('/booking/counselors', [BookingFlowController::class, 'getCounselors']);
        Route::get('/booking/counselors/{konselor}', [BookingFlowController::class, 'showCounselor'])
            ->where('konselor', '[0-9]+');
        Route::get('/booking/counselors/{konselor}/schedule-options', [BookingFlowController::class, 'getScheduleOptions'])
            ->where('konselor', '[0-9]+');
        Route::post('/booking/create', [BookingFlowController::class, 'storeBooking']);

        // --- RUTE BARU UNTUK UPLOAD BUKTI BAYAR ---
        Route::post('/booking/{booking}/upload-proof', [BookingFlowController::class, 'uploadPaymentProof'])
            ->where('booking', '[0-9]+');
        // --- AKHIR RUTE BARU ---

        // Booking Chat
        Route::prefix('booking/{booking}/chat')->group(function () {
            // ... (rute chat tidak berubah) ...
            Route::get('/messages', [BookingChatController::class, 'index'])->where('booking', '[0-9]+');
            Route::post('/messages', [BookingChatController::class, 'store'])->where('booking', '[0-9]+');
        });


        // --- RUTE UNTUK SUPER ADMIN ---
        Route::middleware(RoleMiddleware::class . ':super-admin')->prefix('super-admin')->group(function () {
            Route::apiResource('jenis-konseling', JenisKonselingController::class);
            // ... (rute super admin lainnya tidak berubah) ...
            Route::post('jenis-konseling/{jenisKonseling}', [JenisKonselingController::class, 'update']);
            Route::apiResource('durasi-konseling', DurasiKonselingController::class);
            Route::apiResource('tempat-konseling', TempatKonselingController::class);
            Route::post('tempat-konseling/{tempatKonseling}', [TempatKonselingController::class, 'update']);

            // Manajemen Admin
            // ... (rute admin management tidak berubah) ...
            Route::post('admin-management/{user}/block', [AdminManagementController::class, 'block']);
            Route::post('admin-management/{user}/unblock', [AdminManagementController::class, 'unblock']);
            Route::apiResource('admin-management', AdminManagementController::class)->parameters(['admin-management' => 'user']);

            // Manajemen Konselor
            // ... (rute konselor management tidak berubah) ...
            Route::post('konselor-management/{user}/block', [KonselorManagementController::class, 'block']);
            Route::post('konselor-management/{user}/unblock', [KonselorManagementController::class, 'unblock']);
            Route::apiResource('konselor-management', KonselorManagementController::class)->parameters(['konselor-management' => 'user']);
            Route::post('konselor-management/{user}', [KonselorManagementController::class, 'update']);

            // Manajemen Jadwal Konselor
            // ... (rute jadwal konselor tidak berubah) ...
            Route::get('konselor-management/{user}/availabilities', [KonselorManagementController::class, 'getAvailabilities']);
            Route::post('konselor-management/{user}/availabilities', [KonselorManagementController::class, 'storeAvailability']);
            Route::put('konselor-management/{user}/availabilities/{availability}', [KonselorManagementController::class, 'updateAvailability']);
            Route::delete('konselor-management/{user}/availabilities/{availability}', [KonselorManagementController::class, 'destroyAvailability']);

            // --- TAMBAHKAN RUTE INI UNTUK SUPER ADMIN MENGELOLA QRIS ---
            Route::apiResource('payment-methods', PaymentMethodController::class);
            Route::post('payment-methods/{paymentMethod}', [PaymentMethodController::class, 'update']); // Untuk handle FormData/Update gambar
            // --- AKHIR RUTE BARU ---

            // Manajemen Customer
            // ... (rute customer management tidak berubah) ...
            Route::post('customer-management/{user}/block', [CustomerManagementController::class, 'block']);
            Route::post('customer-management/{user}/unblock', [CustomerManagementController::class, 'unblock']);
            Route::apiResource('customer-management', CustomerManagementController::class)->parameters(['customer-management' => 'user'])->only(['index', 'show', 'destroy']);

            // Manajemen Booking
            Route::apiResource('booking-management', BookingManagementController::class)->only(['index', 'show', 'destroy']);

            // --- RUTE BARU UNTUK VERIFIKASI PEMBAYARAN ---
            Route::post('booking-management/{booking}/approve-payment', [BookingManagementController::class, 'approvePayment'])
                ->where('booking', '[0-9]+');
            Route::post('booking-management/{booking}/reject-payment', [BookingManagementController::class, 'rejectPayment'])
                ->where('booking', '[0-9]+');
            // --- AKHIR RUTE BARU ---

        });

        // --- RUTE UNTUK ADMIN ---
        Route::middleware(RoleMiddleware::class . ':admin,super-admin')->prefix('admin')->group(function () {
            // Jadwal Konsultasi
            // ... (rute admin tidak berubah) ...
            Route::get('jadwal-konsultasi', [JadwalKonsultasiController::class, 'index']);
            Route::get('jadwal-konsultasi/{booking:id}', [JadwalKonsultasiController::class, 'show']);
            Route::delete('jadwal-konsultasi/{booking:id}', [JadwalKonsultasiController::class, 'destroy']);
            Route::patch('jadwal-konsultasi/{booking:id}/status', [JadwalKonsultasiController::class, 'updateStatus']);

            // Verifikasi Konselor
            // ... (rute verifikasi konselor tidak berubah) ...
            Route::get('verifikasi-konselor', [KonselorVerificationController::class, 'index']);
            Route::get('verifikasi-konselor/{user:id}', [KonselorVerificationController::class, 'show']);
            Route::post('verifikasi-konselor/{user:id}/approve', [KonselorVerificationController::class, 'approve']);
            Route::post('verifikasi-konselor/{user:id}/reject', [KonselorVerificationController::class, 'reject']);

            // Verifikasi Customer
            // ... (rute verifikasi customer tidak berubah) ...
            Route::get('verifikasi-customer', [CustomerVerificationController::class, 'index']);
            Route::get('verifikasi-customer/{user:id}', [CustomerVerificationController::class, 'show']);
            Route::post('verifikasi-customer/{user:id}/approve', [CustomerVerificationController::class, 'approve']);
            Route::post('verifikasi-customer/{user:id}/reject', [CustomerVerificationController::class, 'reject']);
        });
    });
});
