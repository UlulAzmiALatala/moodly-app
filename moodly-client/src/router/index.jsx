import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
// --- PERBAIKAN: Mengembalikan path ke relatif (../) ---
import { useAuth } from "../context/AuthContext"; // Sesuaikan path jika perlu
import Commet from "../components/Commet";

// --- Layouts ---
import MobileLayout from "../layouts/MobileLayout";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import AuthAdminLayout from "../layouts/AuthAdminLayout";
import PageLayout from "../layouts/PageLayout";

// --- Halaman Auth (Mobile) ---
import LoginPage from "../pages/auth/LoginPage";
import AddressPage from "../pages/auth/AddressPage";
// Ini akan mengimpor file 'RegisterPage.jsx' Anda yang "pintar"
import RegisterPage from "../pages/auth/RegisterPage";
import OnboardingPage from "../pages/auth/OnboardingPage";

// --- Halaman Customer (Mobile) ---
import HomePage from "../pages/customer/HomePage";
import NotificationPage from "../pages/customer/NotificationPage";
import BookingPage from "../pages/customer/booking/Index";
import FindCounselorPage from "../pages/customer/booking/FindCounselorPage";
import InPersonPage from "../pages/customer/booking/InPersonPage";
// import PaymentPage from "../pages/customer/booking/PaymentPage"; // <-- Sudah benar dikomentari
import LocationDetailPage from "../pages/customer/booking/LocationDetailPage";
import PsychologistDetailPage from "../pages/customer/booking/PsychologistDetailPage";

// --- IMPORT UNTUK PAYMENT ---
import PaymentOnlinePage from "../pages/customer/booking/payment/PaymentOnlinePage";
// --- TAMBAHKAN IMPORT INI ---
import PaymentOfflinePage from "../pages/customer/booking/payment/PaymentOfflinePage";
// --- AKHIR TAMBAHAN ---
import QrisPaymentPage from "../pages/customer/booking/payment/QrisPaymentPage"; // <-- Tambahkan ini

import HistoryPage from "../pages/customer/history/Index";
// --- PERBAIKAN: Typo 'pagesa' di bawah ini ---
import HistoryDetailPage from "../pages/customer/history/DetailPage";
import RatingPage from "../pages/customer/history/RatingPage";
import CancelPage from "../pages/customer/history/CancelPage";
import CancelDetailPage from "../pages/customer/history/CancelDetailPage";
import ReschedulePage from "../pages/customer/history/ReschedulePage";

import ProfilePage from "../pages/customer/profile/Index";
import EditProfilePage from "../pages/customer/profile/EditPage";
import ChangePasswordPage from "../pages/customer/profile/ChangePasswordPage";
import ChangeEmailPage from "../pages/customer/profile/ChangeEmailPage";
import ChangePhoneNumberPage from "../pages/customer/profile/ChangePhoneNumberPage"; // <-- Import Halaman Ubah Nomor

import HelpPage from "../pages/customer/help/Index";
import FaqPage from "../pages/customer/help/FaqPage";
import ChatAdminPage from "../pages/customer/help/ChatAdminPage";
import ChatPage from "../pages/customer/session/ChatPage";

// --- Halaman Admin & Super Admin (Website) ---
// (Import halaman Admin/Super Admin tetap sama)
import JenisKonselingPage from "../pages/super-admin/konseling/jenis/Index.jsx";
import DurasiKonselingPage from "../pages/super-admin/konseling/durasi/Index.jsx";
import TempatKonselingPage from "../pages/super-admin/konseling/tempat/Index.jsx";
import AdminManagementPage from "../pages/super-admin/admin/Index.jsx";
import AdminDetailPage from "../pages/super-admin/admin/Show.jsx";
import KonselorManagementPage from "../pages/super-admin/konselor/Index.jsx";
import KonselorDetailPage from "../pages/super-admin/konselor/Show.jsx";
import CustomerManagementPage from "../pages/super-admin/customer/Index.jsx";
import CustomerDetailPage from "../pages/super-admin/customer/Show.jsx";
import BookingManagementPage from "../pages/super-admin/pesanan/Index.jsx";
import BookingDetailPage from "../pages/super-admin/pesanan/Show.jsx";

import JadwalKonsultasiPage from "../pages/admin/jadwal-konsultasi/Index.jsx";
import JadwalDetailPage from "../pages/admin/jadwal-konsultasi/Show.jsx";
import VerifikasiKonselorPage from "../pages/admin/verifikasi-konselor/Index.jsx";
import VerifikasiDetailPage from "../pages/admin/verifikasi-konselor/Show.jsx";
import VerifikasiCustomerPage from "../pages/admin/verifikasi-customer/Index.jsx";
import VerifikasiCustomerDetailPage from "../pages/admin/verifikasi-customer/Show.jsx";
import PaymentMethodsPage from "../pages/super-admin/payment-methods/Index.jsx";

// --- TAMBAHAN: Import Halaman Counselor ---
// (Path sudah diganti ke Bahasa Inggris & Relatif)
import CounselorDashboard from "../pages/counselor/HomePage";
import CounselorSchedulePage from "../pages/counselor/schedule"; // <-- PERUBAHAN
import CounselorHistoryPage from "../pages/counselor/history/HistoryPage"; // <-- PERUBAHAN
// --- AKHIR TAMBAHAN ---

// --- Guards (Dimodifikasi untuk Counselor) ---
const GuestGuard = () => {
    const { user } = useAuth();
    if (user) {
        // 1. Cek Admin
        if (
            user.role?.includes("admin") ||
            user.role?.includes("super-admin")
        ) {
            return <Navigate to="/admin/dashboard" />;
        }
        // 2. Cek Counselor
        if (user.role?.includes("counselor")) {
            return <Navigate to="/counselor/home" />;
        }
        // 3. Sisanya (Customer)
        return <Navigate to="/home" />;
    }
    return <Outlet />;
};

const ProtectedGuard = () => {
    const { user } = useAuth();
    if (
        !user ||
        user.role?.includes("admin") ||
        user.role?.includes("super-admin") ||
        // TAMBAHAN: Counselor dilarang masuk rute customer
        user.role?.includes("counselor")
    ) {
        return <Navigate to="/login" />;
    }
    return <Outlet />;
};

const AdminGuestGuard = () => {
    const { user } = useAuth();
    return user &&
        (user.role?.includes("admin") || user.role?.includes("super-admin")) ? (
        <Navigate to="/admin/dashboard" />
    ) : (
        <Outlet />
    );
};

const AdminProtectedGuard = () => {
    const { user } = useAuth();
    return user &&
        (user.role?.includes("admin") || user.role?.includes("super-admin")) ? (
        <Outlet />
    ) : (
        <Navigate to="/admin/login" />
    );
};

// --- TAMBAHAN: Guard untuk Counselor ---
const CounselorProtectedGuard = () => {
    const { user } = useAuth();
    // Jika tidak login, redirect ke login
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Jika login TAPI BUKAN counselor, redirect
    if (!user.role?.includes("counselor")) {
        // Jika dia admin, lempar ke admin dashboard
        if (
            user.role?.includes("admin") ||
            user.role?.includes("super-admin")
        ) {
            return <Navigate to="/admin/dashboard" />;
        }
        // Jika dia customer, lempar ke home customer
        return <Navigate to="/home" />;
    }

    // Jika login DAN role-nya counselor, izinkan akses
    return <Outlet />;
};
// --- AKHIR TAMBAHAN ---

// --- PETA APLIKASI UTAMA ---
const AppRouter = () => {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Commet
                    color="#3139cc"
                    size="medium"
                    text="loading"
                    textColor=""
                />
            </div>
        );
    }

    return (
        <Routes>
            {/* === ZONA AUTH CUSTOMER & KONSELOR (MOBILE) === */}
            <Route element={<GuestGuard />}>
                <Route element={<AuthLayout />}>
                    <Route path="/" element={<OnboardingPage />} />

                    {/* Rute Login */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/counselor/login" element={<LoginPage />} />

                    {/* Rute Register */}
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        path="/counselor/register"
                        element={<RegisterPage />}
                    />
                </Route>
            </Route>

            {/* === ZONA CUSTOMER TERPROTEKSI (MOBILE) === */}
            <Route element={<ProtectedGuard />}>
                {/* 1. Rute MobileLayout */}
                <Route element={<MobileLayout />}>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route
                        path="/notifications"
                        element={<NotificationPage />}
                    />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route
                        path="/beranda"
                        element={<Navigate to="/home" />}
                    />{" "}
                    {/* Redirect */}
                </Route>

                {/* 2. Rute PageLayout */}
                <Route element={<PageLayout />}>
                    {/* Auth Flow (lanjutan) */}
                    <Route path="/address" element={<AddressPage />} />

                    {/* Profile Flow */}
                    <Route path="/profile/edit" element={<EditProfilePage />} />
                    <Route
                        path="/profile/change-password"
                        element={<ChangePasswordPage />}
                    />
                    <Route
                        path="/profile/change-email"
                        element={<ChangeEmailPage />}
                    />
                    <Route
                        path="/profile/change-phone" // Path untuk halaman ubah nomor
                        element={<ChangePhoneNumberPage />}
                    />
                    {/* Booking Flow */}
                    <Route
                        path="/booking/find-counselor"
                        element={<FindCounselorPage />}
                    />
                    <Route
                        path="/booking/in-person"
                        element={<InPersonPage />}
                    />
                    <Route
                        path="/booking/tempat/:id"
                        element={<LocationDetailPage />}
                    />
                    <Route
                        path="/booking/counselor/:id"
                        element={<PsychologistDetailPage />}
                    />

                    {/* --- RUTE KONFIRMASI (SESUAI NAVIGASI) --- */}
                    <Route
                        path="/booking/payment-offline"
                        element={<PaymentOfflinePage />}
                    />
                    <Route
                        path="/booking/payment-online"
                        element={<PaymentOnlinePage />}
                    />
                    {/* --- AKHIR RUTE KONFIRMASI --- */}

                    <Route
                        path="/booking/payment/online/:id"
                        element={<PaymentOnlinePage />}
                    />
                    {/* --- RUTE BARU DITAMBAHKAN DI SINI --- */}
                    <Route
                        path="/booking/payment/qris/:id" // Path untuk halaman QRIS
                        element={<QrisPaymentPage />}
                    />
                    {/* --- AKHIR RUTE BARU --- */}

                    {/* History Flow */}
                    <Route
                        path="/history/:id"
                        element={<HistoryDetailPage />}
                    />
                    <Route
                        path="/history/reschedule/:id"
                        element={<ReschedulePage />}
                    />
                    <Route
                        path="/history/cancel/:id"
                        element={<CancelPage />}
                    />
                    <Route
                        path="/history/cancel-detail/:id"
                        element={<CancelDetailPage />}
                    />
                    <Route path="/history/rate/:id" element={<RatingPage />} />

                    {/* Help Flow */}
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/help/faq" element={<FaqPage />} />
                    <Route
                        path="/help/chat-admin"
                        element={<ChatAdminPage />}
                    />
                    {/* Session Flow */}
                    <Route path="/session/chat/:id" element={<ChatPage />} />
                </Route>
            </Route>

            {/* --- TAMBAHAN: ZONA COUNSELOR TERPROTEKSI (MOBILE) --- */}
            <Route element={<CounselorProtectedGuard />}>
                <Route element={<MobileLayout />}>
                    <Route
                        path="/counselor/home"
                        element={<CounselorDashboard />}
                    />
                    <Route
                        path="/counselor/schedule"
                        element={<CounselorSchedulePage />}
                    />
                    <Route
                        path="/counselor/history"
                        element={<CounselorHistoryPage />}
                    />{" "}
                    {/* <-- RUTE RIWAYAT */}
                    {/* Redirect jika counselor akses /counselor */}
                    <Route
                        path="/counselor"
                        element={<Navigate to="/counselor/home" />}
                    />
                </Route>
            </Route>
            {/* --- AKHIR TAMBAHAN --- */}

            {/* === ZONA ADMIN (WEBSITE) === */}
            <Route element={<AdminGuestGuard />}>
                <Route element={<AuthAdminLayout />}>
                    <Route path="/admin/login" element={<LoginPage />} />
                </Route>
            </Route>
            <Route element={<AdminProtectedGuard />}>
                <Route element={<AdminLayout />}>
                    {/* Rute Admin/SuperAdmin tetap sama */}
                    <Route
                        path="/admin"
                        element={<Navigate to="/admin/dashboard" />}
                    />
                    <Route
                        path="/admin/dashboard"
                        element={
                            <div>
                                <h1>Selamat Datang di Dasbor!</h1>
                            </div>
                        }
                    />
                    <Route
                        path="/admin/jenis-konseling"
                        element={<JenisKonselingPage />}
                    />
                    <Route
                        path="/admin/durasi-konseling"
                        element={<DurasiKonselingPage />}
                    />
                    <Route
                        path="/admin/tempat-konseling"
                        element={<TempatKonselingPage />}
                    />
                    <Route
                        path="/admin/payment-methods"
                        element={<PaymentMethodsPage />}
                    />
                    <Route
                        path="/admin/admin-management"
                        element={<AdminManagementPage />}
                    />
                    <Route
                        path="/admin/admin-management/:id"
                        element={<AdminDetailPage />}
                    />
                    <Route
                        path="/admin/konselor-management"
                        element={<KonselorManagementPage />}
                    />
                    <Route
                        path="/admin/konselor-management/:id"
                        element={<KonselorDetailPage />}
                    />
                    <Route
                        path="/admin/customer-management"
                        element={<CustomerManagementPage />}
                    />
                    <Route
                        path="/admin/customer-management/:id"
                        element={<CustomerDetailPage />}
                    />
                    <Route
                        path="/admin/booking-management"
                        element={<BookingManagementPage />}
                    />
                    <Route
                        path="/admin/booking-management/:id"
                        element={<BookingDetailPage />}
                    />
                    <Route
                        path="/admin/jadwal-konsultasi"
                        element={<JadwalKonsultasiPage />}
                    />
                    <Route
                        path="/admin/jadwal-konsultasi/:id"
                        element={<JadwalDetailPage />}
                    />
                    <Route
                        path="/admin/verifikasi-konselor"
                        element={<VerifikasiKonselorPage />}
                    />
                    <Route
                        path="/admin/verifikasi-konselor/:id"
                        element={<VerifikasiDetailPage />}
                    />
                    <Route
                        path="/admin/verifikasi-customer"
                        element={<VerifikasiCustomerPage />}
                    />
                    <Route
                        path="/admin/verifikasi-customer/:id"
                        element={<VerifikasiCustomerDetailPage />}
                    />
                </Route>
            </Route>

            {/* === RUTE FALLBACK === */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route
                path="*"
                element={
                    <div>
                        <h1>404 - Halaman Tidak Ditemukan</h1>
                    </div>
                }
            />
        </Routes>
    );
};

export default AppRouter;