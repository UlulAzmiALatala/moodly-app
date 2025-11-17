<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\SuperAdmin\JenisKonselingController;
use App\Http\Controllers\SuperAdmin\DurasiKonselingController;
use App\Http\Controllers\SuperAdmin\TempatKonselingController;
use App\Http\Controllers\SuperAdmin\AdminManagementController;
use App\Http\Controllers\SuperAdmin\KonselorManagementController;
use App\Http\Controllers\SuperAdmin\CustomerManagementController;
use App\Http\Controllers\SuperAdmin\BookingManagementController;
use App\Http\Controllers\SuperAdmin\PaymentMethodController;

use App\Http\Controllers\Admin\JadwalKonsultasiController;
use App\Http\Controllers\Admin\KonselorVerificationController;
use App\Http\Controllers\Admin\CustomerVerificationController;

use App\Http\Controllers\Customer\BerandaController;
use App\Http\Controllers\Customer\HistoryController;
use App\Http\Controllers\Customer\BookingFlowController;
use App\Http\Controllers\Customer\ProfileController;
use App\Http\Controllers\BookingChatController;

use App\Http\Controllers\Counselor\DashboardController;
use App\Http\Controllers\Counselor\ScheduleController;
use App\Http\Controllers\Counselor\HistoryController as CounselorHistoryController;
use App\Http\Controllers\Counselor\ProfileController as CounselorProfileController;

use App\Http\Middleware\RoleMiddleware;
use App\Models\User;
use App\Models\Booking;
use App\Models\TempatKonseling;

Route::group(['middleware' => [
    \Illuminate\Cookie\Middleware\EncryptCookies::class,
    \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
    \Illuminate\Session\Middleware\StartSession::class,
]], function () {

    require __DIR__ . '/auth.php';

    Route::get('/jenis-konseling', [JenisKonselingController::class, 'index']);
    Route::get('/payment-methods', [BookingFlowController::class, 'getPaymentMethods']);
    Route::get('/payment-methods/image/{paymentMethod}', [BookingFlowController::class, 'getPaymentMethodImage'])
        ->where('paymentMethod', '[0-9]+');

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('/user', function (Request $request) {
            return $request->user();
        });

        // --- RUTE KONSELOR ---
        Route::get('/counselor/dashboard-data', [DashboardController::class, 'getDashboardData'])
            ->middleware(RoleMiddleware::class . ':konselor');
        Route::get('/counselor/schedules', [ScheduleController::class, 'index'])
            ->middleware(RoleMiddleware::class . ':konselor');
        Route::get('/counselor/booking/{booking}', [ScheduleController::class, 'show'])
            ->middleware(RoleMiddleware::class . ':konselor');
        Route::post('/counselor/booking/{booking}/complete', [ScheduleController::class, 'completeSession'])
            ->middleware(RoleMiddleware::class . ':konselor');
        Route::get('/counselor/history', [CounselorHistoryController::class, 'index'])
            ->middleware(RoleMiddleware::class . ':konselor');

        Route::prefix('counselor/profile')->middleware(RoleMiddleware::class . ':konselor')->group(function () {
            Route::post('/update', [CounselorProfileController::class, 'update']);
            Route::post('/update-avatar', [CounselorProfileController::class, 'updateAvatar']);
            Route::post('/change-password', [CounselorProfileController::class, 'updatePassword']);
            Route::post('/change-email', [CounselorProfileController::class, 'updateEmail']);
            Route::get('/practice-locations', [CounselorProfileController::class, 'getPracticeLocations']);
            Route::post('/practice-locations', [CounselorProfileController::class, 'updatePracticeLocations']);
        });

        Route::prefix('counselor/availability')->middleware(RoleMiddleware::class . ':konselor')->group(function () {
            Route::get('/', [KonselorManagementController::class, 'getAvailabilities'])
                ->scopeBindings();
            Route::post('/', [KonselorManagementController::class, 'storeAvailability'])
                ->scopeBindings();
            Route::delete('/{availability}', [KonselorManagementController::class, 'destroyAvailability'])
                ->scopeBindings();
        });

        // --- RUTE UNTUK CUSTOMER ---
        Route::get('/beranda-data', [BerandaController::class, 'getBerandaData']);
        Route::post('/profile/update', [ProfileController::class, 'update']);
        Route::post('/profile/change-password', [ProfileController::class, 'updatePassword']);
        Route::post('/profile/change-email', [ProfileController::class, 'updateEmail']);
        Route::post('/profile/change-phone', [ProfileController::class, 'updatePhone']);
        Route::post('/profile/update-avatar', [ProfileController::class, 'updateAvatar']);
        Route::get('/history', [HistoryController::class, 'index']);
        Route::get('/history/{booking}', [HistoryController::class, 'show']);
        Route::patch('/history/{booking}/cancel', [HistoryController::class, 'cancel']);
        Route::patch('/history/{booking}/reschedule', [HistoryController::class, 'reschedule']);
        Route::get('/booking/tempat-konseling', [BookingFlowController::class, 'getTempatKonseling']);
        Route::get('/booking/tempat-konseling/{tempatKonseling}', [BookingFlowController::class, 'getTempatDetail'])
            ->where('tempatKonseling', '[0-9]+');
        Route::get('/booking/counselors', [BookingFlowController::class, 'getCounselors']);
        Route::get('/booking/counselors/{konselor}', [BookingFlowController::class, 'showCounselor'])
            ->where('konselor', '[0-9]+');
        Route::get('/booking/counselors/{konselor}/schedule-options', [BookingFlowController::class, 'getScheduleOptions'])
            ->where('konselor', '[0-9]+');
        Route::post('/booking/create', [BookingFlowController::class, 'storeBooking']);
        Route::post('/booking/{booking}/upload-proof', [BookingFlowController::class, 'uploadPaymentProof'])
            ->where('booking', '[0-9]+');
        Route::prefix('booking/{booking}/chat')->group(function () {
            Route::get('/messages', [BookingChatController::class, 'index'])->where('booking', '[0-9]+');
            Route::post('/messages', [BookingChatController::class, 'store'])->where('booking', '[0-9]+');
        });

        // --- RUTE UNTUK SUPER ADMIN ---
        Route::middleware(RoleMiddleware::class . ':super-admin')->prefix('super-admin')->group(function () {
            Route::apiResource('jenis-konseling', JenisKonselingController::class);
            Route::post('jenis-konseling/{jenisKonseling}', [JenisKonselingController::class, 'update']);
            Route::apiResource('durasi-konseling', DurasiKonselingController::class);
            Route::apiResource('tempat-konseling', TempatKonselingController::class);
            Route::post('tempat-konseling/{tempatKonseling}', [TempatKonselingController::class, 'update']);
            Route::post('admin-management/{user}/block', [AdminManagementController::class, 'block']);
            Route::post('admin-management/{user}/unblock', [AdminManagementController::class, 'unblock']);
            Route::apiResource('admin-management', AdminManagementController::class)->parameters(['admin-management' => 'user']);
            Route::post('konselor-management/{user}/block', [KonselorManagementController::class, 'block']);
            Route::post('konselor-management/{user}/unblock', [KonselorManagementController::class, 'unblock']);
            Route::apiResource('konselor-management', KonselorManagementController::class)->parameters(['konselor-management' => 'user']);
            Route::post('konselor-management/{user}', [KonselorManagementController::class, 'update']);
            Route::get('konselor-management/{user}/availabilities', [KonselorManagementController::class, 'getAvailabilities']);
            Route::post('konselor-management/{user}/availabilities', [KonselorManagementController::class, 'storeAvailability']);
            Route::put('konselor-management/{user}/availabilities/{availability}', [KonselorManagementController::class, 'updateAvailability']);
            Route::delete('konselor-management/{user}/availabilities/{availability}', [KonselorManagementController::class, 'destroyAvailability']);
            Route::apiResource('payment-methods', PaymentMethodController::class);
            Route::post('payment-methods/{paymentMethod}', [PaymentMethodController::class, 'update']);
            Route::post('customer-management/{user}/block', [CustomerManagementController::class, 'block']);
            Route::post('customer-management/{user}/unblock', [CustomerManagementController::class, 'unblock']);
            Route::apiResource('customer-management', CustomerManagementController::class)->parameters(['customer-management' => 'user'])->only(['index', 'show', 'destroy']);

            Route::apiResource('booking-management', BookingManagementController::class)
                ->parameters(['booking-management' => 'booking'])
                ->only(['index', 'show', 'destroy']);

            Route::post('booking-management/{booking}/approve-payment', [BookingManagementController::class, 'approvePayment']);
            Route::post('booking-management/{booking}/reject-payment', [BookingManagementController::class, 'rejectPayment']);
            Route::get('booking-management/{booking}/payment-proof-image', [BookingManagementController::class, 'getPaymentProofImage']);
        });

        // --- RUTE UNTUK ADMIN ---
        Route::middleware(RoleMiddleware::class . ':admin,super-admin')->prefix('admin')->group(function () {
            Route::get('jadwal-konsultasi', [JadwalKonsultasiController::class, 'index']);
            Route::get('jadwal-konsultasi/{booking:id}', [JadwalKonsultasiController::class, 'show']);
            Route::delete('jadwal-konsultasi/{booking:id}', [JadwalKonsultasiController::class, 'destroy']);
            Route::patch('jadwal-konsultasi/{booking:id}/status', [JadwalKonsultasiController::class, 'updateStatus']);
            Route::post('jadwal-konsultasi/{booking:id}/update-gmeet', [JadwalKonsultasiController::class, 'updateGmeetLink']);
            Route::get('verifikasi-konselor', [KonselorVerificationController::class, 'index']);
            Route::get('verifikasi-konselor/{user:id}', [KonselorVerificationController::class, 'show']);
            Route::post('verifikasi-konselor/{user:id}/approve', [KonselorVerificationController::class, 'approve']);
            Route::post('verifikasi-konselor/{user:id}/reject', [KonselorVerificationController::class, 'reject']);
            Route::get('verifikasi-customer', [CustomerVerificationController::class, 'index']);
            Route::get('verifikasi-customer/{user:id}', [CustomerVerificationController::class, 'show']);
            Route::post('verifikasi-customer/{user:id}/approve', [CustomerVerificationController::class, 'approve']);
            Route::post('verifikasi-customer/{user:id}/reject', [CustomerVerificationController::class, 'reject']);
        });
    });
});
