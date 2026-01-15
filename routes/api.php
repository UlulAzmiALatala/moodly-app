<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- IMPORT CONTROLLERS ---

// Super Admin
use App\Http\Controllers\SuperAdmin\JenisKonselingController;
use App\Http\Controllers\SuperAdmin\DurasiKonselingController;
use App\Http\Controllers\SuperAdmin\TempatKonselingController;
use App\Http\Controllers\SuperAdmin\AdminManagementController;
use App\Http\Controllers\SuperAdmin\KonselorManagementController;
use App\Http\Controllers\SuperAdmin\CustomerManagementController;
use App\Http\Controllers\SuperAdmin\BookingManagementController;
use App\Http\Controllers\SuperAdmin\PaymentMethodController;
use App\Http\Controllers\SuperAdmin\RefundManagementController;
use App\Http\Controllers\SuperAdmin\FinanceController;
use App\Http\Controllers\SuperAdmin\HelpChatController as AdminHelpChatController;
use App\Http\Controllers\SuperAdmin\DashboardController as SuperAdminDashboardController;

// Admin
use App\Http\Controllers\Admin\JadwalKonsultasiController;
use App\Http\Controllers\Admin\KonselorVerificationController;
use App\Http\Controllers\Admin\CustomerVerificationController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;

// Customer
use App\Http\Controllers\Customer\BerandaController;
use App\Http\Controllers\Customer\HistoryController;
use App\Http\Controllers\Customer\BookingFlowController;
use App\Http\Controllers\Customer\ProfileController;
use App\Http\Controllers\HelpChatController; // Controller Chat Customer

// Konselor
use App\Http\Controllers\Counselor\DashboardController as CounselorDashboardController;
use App\Http\Controllers\Counselor\ScheduleController;
use App\Http\Controllers\Counselor\HistoryController as CounselorHistoryController;
use App\Http\Controllers\Counselor\ProfileController as CounselorProfileController;

// Shared
use App\Http\Controllers\BookingChatController;
use App\Http\Controllers\NotificationController;
use App\Http\Middleware\RoleMiddleware;

// --- PUBLIC ROUTES (Tanpa Login) ---
Route::group(['middleware' => [
    \Illuminate\Cookie\Middleware\EncryptCookies::class,
    \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
    \Illuminate\Session\Middleware\StartSession::class,
]], function () {

    require __DIR__ . '/auth.php';

    // Public Data (Untuk Dropdown/Tampilan Awal)
    Route::get('/jenis-konseling', [JenisKonselingController::class, 'index']);
    Route::get('/payment-methods', [BookingFlowController::class, 'getPaymentMethods']);
    Route::get('/payment-methods/image/{paymentMethod}', [BookingFlowController::class, 'getPaymentMethodImage'])
        ->where('paymentMethod', '[0-9]+');

    // --- PROTECTED ROUTES (Harus Login) ---
    Route::middleware('auth:sanctum')->group(function () {

        // User Info
        Route::get('/user', function (Request $request) {
            return $request->user();
        });

        // Shared: Notifikasi System
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::get('/notifications/status', [NotificationController::class, 'status']);
        Route::post('/notifications/mark-read', [NotificationController::class, 'markAsRead']);

        // Shared: Chat Sesi Konseling (Realtime)
        Route::prefix('booking/{booking}/chat')->group(function () {
            Route::get('/messages', [BookingChatController::class, 'index'])->where('booking', '[0-9]+');
            Route::post('/messages', [BookingChatController::class, 'store'])->where('booking', '[0-9]+');
        });

        // =================================================================
        // ROLE: CUSTOMER
        // =================================================================

        // Beranda & Dashboard Customer
        Route::get('/beranda-data', [BerandaController::class, 'getBerandaData']);

        // Profile Customer
        Route::prefix('profile')->group(function () {
            Route::post('/update', [ProfileController::class, 'update']);
            Route::post('/change-password', [ProfileController::class, 'updatePassword']);
            Route::post('/change-email', [ProfileController::class, 'updateEmail']);
            Route::post('/change-phone', [ProfileController::class, 'updatePhone']);
            Route::post('/update-avatar', [ProfileController::class, 'updateAvatar']);
        });

        // History & Transaksi Customer
        // (URL tetap /api/history agar frontend tidak perlu diubah)
        Route::prefix('history')->group(function () {
            Route::get('/', [HistoryController::class, 'index']);
            Route::get('/{booking}', [HistoryController::class, 'show'])->where('booking', '[0-9]+');
            Route::patch('/{booking}/cancel', [HistoryController::class, 'cancel']);
            Route::patch('/{booking}/reschedule', [HistoryController::class, 'reschedule']);
            Route::post('/{booking}/reschedule/approve', [HistoryController::class, 'approveReschedule']);
            Route::post('/{booking}/reschedule/reject', [HistoryController::class, 'rejectReschedule']);
            Route::post('/{booking}/rate', [HistoryController::class, 'storeRating']);
            Route::post('/{booking}/submit-refund', [HistoryController::class, 'storeRefundRequest']);
        });

        // Booking Flow (Proses Pemesanan)
        Route::prefix('booking')->group(function () {
            Route::get('/tempat-konseling', [BookingFlowController::class, 'getTempatKonseling']);
            Route::get('/tempat-konseling/{tempatKonseling}', [BookingFlowController::class, 'getTempatDetail'])->where('tempatKonseling', '[0-9]+');
            Route::get('/counselors', [BookingFlowController::class, 'getCounselors']);
            Route::get('/counselors/{konselor}', [BookingFlowController::class, 'showCounselor'])->where('konselor', '[0-9]+');
            Route::get('/counselors/{konselor}/schedule-options', [BookingFlowController::class, 'getScheduleOptions'])->where('konselor', '[0-9]+');
            Route::post('/create', [BookingFlowController::class, 'storeBooking']);
            Route::post('/{booking}/upload-proof', [BookingFlowController::class, 'uploadPaymentProof'])->where('booking', '[0-9]+');
        });

        // Help Chat (Customer Support)
        Route::get('/help/messages', [HelpChatController::class, 'index']);
        Route::post('/help/messages', [HelpChatController::class, 'store']);


        // =================================================================
        // ROLE: KONSELOR
        // =================================================================
        Route::middleware(RoleMiddleware::class . ':konselor')->prefix('counselor')->group(function () {

            Route::get('/dashboard-data', [CounselorDashboardController::class, 'getDashboardData']);

            // Jadwal & Sesi
            Route::get('/schedules', [ScheduleController::class, 'index']);
            Route::get('/booking/{booking}', [ScheduleController::class, 'show'])->where('booking', '[0-9]+');
            Route::post('/booking/{booking}/complete', [ScheduleController::class, 'completeSession'])->where('booking', '[0-9]+');
            Route::post('/booking/{booking}/reschedule', [ScheduleController::class, 'reschedule'])->where('booking', '[0-9]+');

            // History Konselor
            Route::get('/history', [CounselorHistoryController::class, 'index']);

            // Profile Konselor
            Route::prefix('profile')->group(function () {
                Route::post('/update', [CounselorProfileController::class, 'update']);
                Route::post('/update-avatar', [CounselorProfileController::class, 'updateAvatar']);
                Route::post('/change-password', [CounselorProfileController::class, 'updatePassword']);
                Route::post('/change-email', [CounselorProfileController::class, 'updateEmail']);
                Route::get('/practice-locations', [CounselorProfileController::class, 'getPracticeLocations']);
                Route::post('/practice-locations', [CounselorProfileController::class, 'updatePracticeLocations']);
            });

            // Ketersediaan (Availability)
            Route::prefix('availability')->group(function () {
                Route::get('/', [KonselorManagementController::class, 'getAvailabilities']);
                Route::post('/', [KonselorManagementController::class, 'storeAvailability']);
                Route::delete('/{availability}', [KonselorManagementController::class, 'destroyAvailability']);
            });
        });


        // =================================================================
        // ROLE: ADMIN & SUPER ADMIN (SHARED)
        // =================================================================
        Route::middleware(RoleMiddleware::class . ':admin,super-admin')->prefix('admin')->group(function () {

            Route::get('/dashboard-stats', [AdminDashboardController::class, 'index']);

            // Jadwal Konsultasi (Admin View)
            Route::get('jadwal-konsultasi', [JadwalKonsultasiController::class, 'index']);
            Route::get('jadwal-konsultasi/{booking:id}', [JadwalKonsultasiController::class, 'show']);
            Route::delete('jadwal-konsultasi/{booking:id}', [JadwalKonsultasiController::class, 'destroy']);
            Route::patch('jadwal-konsultasi/{booking:id}/status', [JadwalKonsultasiController::class, 'updateStatus']);
            Route::post('jadwal-konsultasi/{booking:id}/update-gmeet', [JadwalKonsultasiController::class, 'updateGmeetLink']);

            // Verifikasi User
            Route::prefix('verifikasi-konselor')->group(function () {
                Route::get('/', [KonselorVerificationController::class, 'index']);
                Route::get('/{user:id}', [KonselorVerificationController::class, 'show']);
                Route::post('/{user:id}/approve', [KonselorVerificationController::class, 'approve']);
                Route::post('/{user:id}/reject', [KonselorVerificationController::class, 'reject']);
            });

            Route::prefix('verifikasi-customer')->group(function () {
                Route::get('/', [CustomerVerificationController::class, 'index']);
                Route::get('/{user:id}', [CustomerVerificationController::class, 'show']);
                Route::post('/{user:id}/approve', [CustomerVerificationController::class, 'approve']);
                Route::post('/{user:id}/reject', [CustomerVerificationController::class, 'reject']);
            });

            // Admin Help Chat
            Route::prefix('help')->group(function () {
                Route::get('/conversations', [AdminHelpChatController::class, 'getConversations']);
                Route::get('/messages/{userId}', [AdminHelpChatController::class, 'getMessages']);
                Route::post('/reply/{userId}', [AdminHelpChatController::class, 'reply']);
            });
        });


        // =================================================================
        // ROLE: SUPER ADMIN (EXCLUSIVE)
        // =================================================================
        Route::middleware(RoleMiddleware::class . ':super-admin')->prefix('super-admin')->group(function () {

            Route::get('/dashboard-stats', [SuperAdminDashboardController::class, 'index']);

            // Keuangan & Payout
            Route::get('/keuangan', [FinanceController::class, 'index']);
            Route::get('/keuangan/{booking}', [FinanceController::class, 'show'])->where('booking', '[0-9]+');
            Route::post('/keuangan/{booking}/pay', [FinanceController::class, 'processPayment'])->where('booking', '[0-9]+');

            // Master Data Resources
            Route::apiResource('jenis-konseling', JenisKonselingController::class);
            Route::post('jenis-konseling/{jenisKonseling}', [JenisKonselingController::class, 'update']);

            Route::apiResource('durasi-konseling', DurasiKonselingController::class);

            Route::apiResource('tempat-konseling', TempatKonselingController::class);
            Route::post('tempat-konseling/{tempatKonseling}', [TempatKonselingController::class, 'update']);

            Route::apiResource('payment-methods', PaymentMethodController::class);
            Route::post('payment-methods/{paymentMethod}', [PaymentMethodController::class, 'update']);

            // User Management
            Route::apiResource('admin-management', AdminManagementController::class)->parameters(['admin-management' => 'user']);
            Route::post('admin-management/{user}/block', [AdminManagementController::class, 'block']);
            Route::post('admin-management/{user}/unblock', [AdminManagementController::class, 'unblock']);

            Route::apiResource('customer-management', CustomerManagementController::class)
                ->parameters(['customer-management' => 'user'])
                ->only(['index', 'show', 'update', 'destroy']);
            Route::post('customer-management/{user}/block', [CustomerManagementController::class, 'block']);
            Route::post('customer-management/{user}/unblock', [CustomerManagementController::class, 'unblock']);

            Route::apiResource('konselor-management', KonselorManagementController::class)->parameters(['konselor-management' => 'user']);
            Route::post('konselor-management/{user}', [KonselorManagementController::class, 'update']);
            Route::post('konselor-management/{user}/block', [KonselorManagementController::class, 'block']);
            Route::post('konselor-management/{user}/unblock', [KonselorManagementController::class, 'unblock']);

            // Manage Availability Konselor (Super Admin Override)
            Route::get('konselor-management/{user}/availabilities', [KonselorManagementController::class, 'getAvailabilities']);
            Route::post('konselor-management/{user}/availabilities', [KonselorManagementController::class, 'storeAvailability']);
            Route::put('konselor-management/{user}/availabilities/{availability}', [KonselorManagementController::class, 'updateAvailability']);
            Route::delete('konselor-management/{user}/availabilities/{availability}', [KonselorManagementController::class, 'destroyAvailability']);

            // Booking & Payment Management
            Route::apiResource('booking-management', BookingManagementController::class)
                ->parameters(['booking-management' => 'booking'])
                ->only(['index', 'show', 'destroy']);
            Route::post('booking-management/{booking}/approve-payment', [BookingManagementController::class, 'approvePayment']);
            Route::post('booking-management/{booking}/reject-payment', [BookingManagementController::class, 'rejectPayment']);
            Route::get('booking-management/{booking}/payment-proof-image', [BookingManagementController::class, 'getPaymentProofImage']);
            Route::put('booking-management/{booking}/update-link', [BookingManagementController::class, 'updateLink']);

            // Refund Management
            Route::get('refund-management', [RefundManagementController::class, 'index']);
            Route::post('refund-management/{refund}/process', [RefundManagementController::class, 'process']);
            Route::get('refund-management/{refund}/customer-proof', [RefundManagementController::class, 'getCustomerProofImage']);
            Route::get('refund-management/{refund}/admin-proof', [RefundManagementController::class, 'getAdminTransferImage']);
        });
    });
});
