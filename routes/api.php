<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\SuperAdmin\JenisKonselingController;
// ... (use statements lain tidak berubah) ...
use App\Http\Controllers\SuperAdmin\DurasiKonselingController;
use App\Http\Controllers\SuperAdmin\TempatKonselingController;
use App\Http\Controllers\SuperAdmin\AdminManagementController;
use App\Http\Controllers\SuperAdmin\KonselorManagementController;
use App\Http\Controllers\SuperAdmin\CustomerManagementController;
use App\Http\Controllers\SuperAdmin\BookingManagementController;
use App\Http\Controllers\SuperAdmin\PaymentMethodController;

use App\Http\Controllers\Admin\JadwalKonsultasiController;
// ... (use statements lain tidak berubah) ...
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

Route::group(['middleware' => [
    // ... (middleware group tidak berubah) ...
    \Illuminate\Cookie\Middleware\EncryptCookies::class,
    \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
    \Illuminate\Session\Middleware\StartSession::class,
]], function () {

    // 1. Rute Autentikasi
    require __DIR__ . '/auth.php';

    // --- RUTE PUBLIK (TIDAK PERLU LOGIN) ---
    Route::get('/payment-methods', [BookingFlowController::class, 'getPaymentMethods']);
    Route::get('/payment-methods/image/{paymentMethod}', [BookingFlowController::class, 'getPaymentMethodImage'])
        ->where('paymentMethod', '[0-9]+');


    // 2. Grup untuk SEMUA rute yang terproteksi
    Route::middleware('auth:sanctum')->group(function () {

        // Rute umum
        Route::get('/user', function (Request $request) {
            return $request->user();
        });

        // --- RUTE UNTUK CUSTOMER ---
        Route::get('/beranda-data', [BerandaController::class, 'getBerandaData']);

        // History
        // ... (rute history tidak berubah) ...
        Route::get('/history', [HistoryController::class, 'index']);
        Route::get('/history/{booking}', [HistoryController::class, 'show']);
        Route::patch('/history/{booking}/cancel', [HistoryController::class, 'cancel']);
        Route::patch('/history/{booking}/reschedule', [HistoryController::class, 'reschedule']);

        // Booking Flow
        // ... (rute booking flow tidak berubah) ...
        Route::get('/booking/tempat-konseling', [BookingFlowController::class, 'getTempatKonseling']);
        Route::get('/booking/tempat-konseling/{tempatKonseling}', [BookingFlowController::class, 'getTempatDetail'])
            ->where('tempatKonseling', '[0-9]+');
        Route::get('/booking/counselors', [BookingFlowController::class, 'getCounselors']);
        Route::get('/booking/counselors/{konselor}', [BookingFlowController::class, 'showCounselor'])
            ->where('konselor', '[0-9]+');
        Route::get('/booking/counselors/{konselor}/schedule-options', [BookingFlowController::class, 'getScheduleOptions'])
            ->where('konselor', '[0-9]+');
        Route::post('/booking/create', [BookingFlowController::class, 'storeBooking']);

        // Rute Upload Bukti Bayar
        Route::post('/booking/{booking}/upload-proof', [BookingFlowController::class, 'uploadPaymentProof'])
            ->where('booking', '[0-9]+');

        // Booking Chat
        // ... (rute chat tidak berubah) ...
        Route::prefix('booking/{booking}/chat')->group(function () {
            Route::get('/messages', [BookingChatController::class, 'index'])->where('booking', '[0-9]+');
            Route::post('/messages', [BookingChatController::class, 'store'])->where('booking', '[0-9]+');
        });


        // --- RUTE UNTUK SUPER ADMIN ---
        Route::middleware(RoleMiddleware::class . ':super-admin')->prefix('super-admin')->group(function () {
            Route::apiResource('jenis-konseling', JenisKonselingController::class);
            // ... (sisa rute super-admin tidak berubah) ...
            Route::post('jenis-konseling/{jenisKonseling}', [JenisKonselingController::class, 'update']);
            Route::apiResource('durasi-konseling', DurasiKonselingController::class);
            Route::apiResource('tempat-konseling', TempatKonselingController::class);
            Route::post('tempat-konseling/{tempatKonseling}', [TempatKonselingController::class, 'update']);

            // Manajemen Admin
            Route::post('admin-management/{user}/block', [AdminManagementController::class, 'block']);
            // ... (sisa rute super-admin tidak berubah) ...
            Route::post('admin-management/{user}/unblock', [AdminManagementController::class, 'unblock']);
            Route::apiResource('admin-management', AdminManagementController::class)->parameters(['admin-management' => 'user']);

            // Manajemen Konselor
            Route::post('konselor-management/{user}/block', [KonselorManagementController::class, 'block']);
            // ... (sisa rute super-admin tidak berubah) ...
            Route::post('konselor-management/{user}/unblock', [KonselorManagementController::class, 'unblock']);
            Route::apiResource('konselor-management', KonselorManagementController::class)->parameters(['konselor-management' => 'user']);
            Route::post('konselor-management/{user}', [KonselorManagementController::class, 'update']);

            // Manajemen Jadwal Konselor
            Route::get('konselor-management/{user}/availabilities', [KonselorManagementController::class, 'getAvailabilities']);
            // ... (sisa rute super-admin tidak berubah) ...
            Route::post('konselor-management/{user}/availabilities', [KonselorManagementController::class, 'storeAvailability']);
            Route::put('konselor-management/{user}/availabilities/{availability}', [KonselorManagementController::class, 'updateAvailability']);
            Route::delete('konselor-management/{user}/availabilities/{availability}', [KonselorManagementController::class, 'destroyAvailability']);

            // Manajemen QRIS
            Route::apiResource('payment-methods', PaymentMethodController::class);
            // ... (sisa rute super-admin tidak berubah) ...
            Route::post('payment-methods/{paymentMethod}', [PaymentMethodController::class, 'update']);

            // Manajemen Customer
            Route::post('customer-management/{user}/block', [CustomerManagementController::class, 'block']);
            // ... (sisa rute super-admin tidak berubah) ...
            Route::post('customer-management/{user}/unblock', [CustomerManagementController::class, 'unblock']);
            Route::apiResource('customer-management', CustomerManagementController::class)->parameters(['customer-management' => 'user'])->only(['index', 'show', 'destroy']);


            // --- INI PERBAIKANNYA ---
            // Manajemen Booking
            Route::apiResource('booking-management', BookingManagementController::class)
                ->parameters(['booking-management' => 'booking']) // <-- Biarkan ini
                ->only(['index', 'show', 'destroy']);

            // Rute Verifikasi
            Route::post('booking-management/{booking}/approve-payment', [BookingManagementController::class, 'approvePayment']);
            Route::post('booking-management/{booking}/reject-payment', [BookingManagementController::class, 'rejectPayment']);

            // --- TAMBAHKAN RUTE PROXY GAMBAR INI ---
            Route::get('booking-management/{booking}/payment-proof-image', [BookingManagementController::class, 'getPaymentProofImage']);
            // --- AKHIR PERBAIKAN ---

        });

        // --- RUTE UNTUK ADMIN ---
        // ... (rute admin tidak berubah) ...
        Route::middleware(RoleMiddleware::class . ':admin,super-admin')->prefix('admin')->group(function () {
            // Jadwal Konsultasi
            Route::get('jadwal-konsultasi', [JadwalKonsultasiController::class, 'index']);
            // ... (sisa file tidak berubah) ...
            Route::get('jadwal-konsultasi/{booking:id}', [JadwalKonsultasiController::class, 'show']);
            Route::delete('jadwal-konsultasi/{booking:id}', [JadwalKonsultasiController::class, 'destroy']);
            Route::patch('jadwal-konsultasi/{booking:id}/status', [JadwalKonsultasiController::class, 'updateStatus']);

            // Verifikasi Konselor
            Route::get('verifikasi-konselor', [KonselorVerificationController::class, 'index']);
            // ... (sisa file tidak berubah) ...
            Route::get('verifikasi-konselor/{user:id}', [KonselorVerificationController::class, 'show']);
            Route::post('verifikasi-konselor/{user:id}/approve', [KonselorVerificationController::class, 'approve']);
            Route::post('verifikasi-konselor/{user:id}/reject', [KonselorVerificationController::class, 'reject']);

            // Verifikasi Customer
            Route::get('verifikasi-customer', [CustomerVerificationController::class, 'index']);
            // ... (sisa file tidak berubah) ...
            Route::get('verifikasi-customer/{user:id}', [CustomerVerificationController::class, 'show']);
            Route::post('verifikasi-customer/{user:id}/approve', [CustomerVerificationController::class, 'approve']);
            Route::post('verifikasi-customer/{user:id}/reject', [CustomerVerificationController::class, 'reject']);
        });
    });
});
