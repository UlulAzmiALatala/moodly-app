import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Commet from "../components/Commet";

// --- Layouts ---
import MobileLayout from "../layouts/MobileLayout";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import AuthAdminLayout from "../layouts/AuthAdminLayout";
import PageLayout from "../layouts/PageLayout";

// --- Halaman Auth (Mobile) ---
import CustomerLoginPage from "../pages/auth/customer/LoginPage";
import CustomerRegisterPage from "../pages/auth/customer/RegisterPage";
import CustomerAddressPage from "../pages/auth/customer/AddressPage";
import CustomerCreatePasswordPage from "../pages/auth/customer/CreatePasswordPage";
import OnboardingPage from "../pages/auth/OnboardingPage";
import CounselorLoginPage from "../pages/auth/counselor/LoginPage";
import CounselorRegisterPage from "../pages/auth/counselor/RegisterPage";
import CounselorAddressPage from "../pages/auth/counselor/AddressPage";
import CounselorCreatePasswordPage from "../pages/auth/counselor/CreatePasswordPage";
import AdminLoginPage from "../pages/auth/admin/LoginPage";

// --- Halaman Customer (Mobile) ---
import HomePage from "../pages/customer/HomePage";
import NotificationPage from "../pages/customer/NotificationPage";
import BookingPage from "../pages/customer/booking/Index";
import FindCounselorPage from "../pages/customer/booking/FindCounselorPage";
import InPersonPage from "../pages/customer/booking/InPersonPage";
import LocationDetailPage from "../pages/customer/booking/LocationDetailPage";
import PsychologistDetailPage from "../pages/customer/booking/PsychologistDetailPage";
import PaymentOnlinePage from "../pages/customer/booking/payment/PaymentOnlinePage";
import QrisPaymentPage from "../pages/customer/booking/payment/QrisPaymentPage";
import PaymentOfflinePage from "../pages/customer/booking/payment/PaymentOfflinePage";
import UploadPaymentProofPage from "../pages/customer/booking/payment/UploadPaymentProofPage";
import HistoryPage from "../pages/customer/history/Index";
import HistoryDetailPage from "../pages/customer/history/DetailPage";
import RatingPage from "../pages/customer/history/RatingPage";
import CancelPage from "../pages/customer/history/CancelPage";
import CancelDetailPage from "../pages/customer/history/CancelDetailPage";
import ReschedulePage from "../pages/customer/history/ReschedulePage";
import ProfilePage from "../pages/customer/profile/Index";
import EditProfilePage from "../pages/customer/profile/EditPage";
import ChangePasswordPage from "../pages/customer/profile/ChangePasswordPage";
import ChangeEmailPage from "../pages/customer/profile/ChangeEmailPage";
import ChangePhoneNumberPage from "../pages/customer/profile/ChangePhoneNumberPage";
import HelpPage from "../pages/customer/help/Index";
import FaqPage from "../pages/customer/help/FaqPage";
import ChatAdminPage from "../pages/customer/help/ChatAdminPage";
import ChatPage from "../pages/customer/session/ChatPage";

// --- BARU: Impor halaman edit profil ---
import ChangeAddressPage from "../pages/customer/profile/ChangeAddressPage"; // <-- KITA AKAN BUAT INI
// --- AKHIR BARU ---

// --- Halaman Admin & Super Admin (Website) ---
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
import PaymentMethodsPage from "../pages/super-admin/payment-methods/Index.jsx";
import JadwalKonsultasiPage from "../pages/admin/jadwal-konsultasi/Index.jsx";
import JadwalDetailPage from "../pages/admin/jadwal-konsultasi/Show.jsx";
import VerifikasiKonselorPage from "../pages/admin/verifikasi-konselor/Index.jsx";
import VerifikasiDetailPage from "../pages/admin/verifikasi-konselor/Show.jsx";
import VerifikasiCustomerPage from "../pages/admin/verifikasi-customer/Index.jsx";
import VerifikasiCustomerDetailPage from "../pages/admin/verifikasi-customer/Show.jsx";

// --- Halaman Konselor ---
import CounselorHomePage from "../pages/counselor/HomePage";
import CounselorSchedulePage from "../pages/counselor/schedule/index";
import CounselorHistoryPage from "../pages/counselor/history/HistoryPage";
import CounselorProfilePage from "../pages/counselor/profile/Index";
import PracticeLocationPage from "../pages/counselor/location/index";
import BankAccountPage from "../pages/counselor/bank-account/index";
import CounselorChatPage from "../pages/counselor/history/chat/ChatPageCounselor";
import CounselorNotificationPage from "../pages/counselor/NotificationPage";

// === GUARDS ===
const GuestGuard = () => {
    const { user } = useAuth();
    if (user) {
        if (
            user.role?.includes("admin") ||
            user.role?.includes("super-admin")
        ) {
            return <Navigate to="/admin/dashboard" />;
        }
        if (
            user.role?.includes("konselor") ||
            user.role?.includes("counselor")
        ) {
            return <Navigate to="/counselor/home" />;
        }
        return <Navigate to="/home" />;
    }
    return <Outlet />;
};

const ProtectedGuard = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (user.role?.includes("admin") || user.role?.includes("super-admin"))
        return <Navigate to="/admin/dashboard" />;
    if (user.role?.includes("konselor") || user.role?.includes("counselor"))
        return <Navigate to="/counselor/home" />;
    return <Outlet />;
};

const CounselorProtectedGuard = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/counselor/login" />;
    if (user.role?.includes("admin") || user.role?.includes("super-admin"))
        return <Navigate to="/admin/dashboard" />;
    if (!user.role?.includes("konselor") && !user.role?.includes("counselor"))
        return <Navigate to="/home" />;
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
// === END GUARDS ===

// === ROUTER UTAMA ===
const AppRouter = () => {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Commet color="#3139cc" size="medium" text="loading" />
            </div>
        );
    }

    return (
        <Routes>
            {/* === AUTH (SEMUA PERAN) === */}
            <Route element={<GuestGuard />}>
                {/* Rute di dalam AuthLayout (Header Gelombang) */}
                <Route element={<AuthLayout />}>
                    <Route path="/" element={<OnboardingPage />} />

                    {/* Rute Customer */}
                    <Route path="/login" element={<CustomerLoginPage />} />
                    <Route
                        path="/register"
                        element={<CustomerRegisterPage />}
                    />

                    {/* Rute Konselor */}
                    <Route
                        path="/counselor/login"
                        element={<CounselorLoginPage />}
                    />
                    <Route
                        path="/counselor/register"
                        element={<CounselorRegisterPage />}
                    />
                </Route>

                {/* Rute Multi-step (Header Polos) */}
                <Route element={<PageLayout />}>
                    {/* Alur Customer */}
                    <Route path="/address" element={<CustomerAddressPage />} />
                    <Route
                        path="/create-password"
                        element={<CustomerCreatePasswordPage />}
                    />

                    {/* Alur Konselor (BARU) */}
                    <Route
                        path="/counselor/address"
                        element={<CounselorAddressPage />}
                    />
                    <Route
                        path="/counselor/create-password"
                        element={<CounselorCreatePasswordPage />}
                    />
                </Route>
            </Route>

            {/* === CUSTOMER (PROTECTED) === */}
            <Route element={<ProtectedGuard />}>
                <Route element={<MobileLayout />}>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route
                        path="/notifications"
                        element={<NotificationPage />}
                    />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/beranda" element={<Navigate to="/home" />} />
                </Route>

                <Route element={<PageLayout />}>
                    {/* Rute Edit Profil */}
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
                        path="/profile/change-phone"
                        element={<ChangePhoneNumberPage />}
                    />

                    <Route
                        path="/profile/edit/address"
                        element={<ChangeAddressPage />}
                    />
                    {/* --- AKHIR BARU --- */}

                    {/* Rute Booking */}
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
                    <Route
                        path="/booking/payment-offline"
                        element={<PaymentOfflinePage />}
                    />
                    <Route
                        path="/booking/payment-online"
                        element={<PaymentOnlinePage />}
                    />
                    <Route
                        path="/booking/payment/online/:id"
                        element={<PaymentOnlinePage />}
                    />
                    <Route
                        path="/booking/payment/qris/:id"
                        element={<QrisPaymentPage />}
                    />
                    <Route
                        path="/booking/upload-proof/:bookingId"
                        element={<UploadPaymentProofPage />}
                    />

                    {/* Rute History */}
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
                    <Route
                        path="/history/rating/:id"
                        element={<RatingPage />}
                    />

                    {/* Rute Bantuan & Sesi */}
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/help/faq" element={<FaqPage />} />
                    <Route
                        path="/help/chat-admin"
                        element={<ChatAdminPage />}
                    />
                    <Route path="/session/chat/:id" element={<ChatPage />} />
                </Route>
            </Route>

            {/* === KONSELOR (PROTECTED) === */}
            <Route element={<CounselorProtectedGuard />}>
                <Route element={<MobileLayout />}>
                    <Route
                        path="/counselor/home"
                        element={<CounselorHomePage />}
                    />
                    <Route
                        path="/counselor/schedule"
                        element={<CounselorSchedulePage />}
                    />
                    <Route
                        path="/counselor/history"
                        element={<CounselorHistoryPage />}
                    />
                    <Route
                        path="/counselor/profile"
                        element={<CounselorProfilePage />}
                    />
                    <Route
                        path="/counselor"
                        element={<Navigate to="/counselor/home" />}
                    />
                </Route>
                <Route element={<PageLayout />}>
                    <Route
                        path="/counselor/location"
                        element={<PracticeLocationPage />}
                    />
                    <Route
                        path="/counselor/bank-account"
                        element={<BankAccountPage />}
                    />
                    <Route
                        path="/counselor/notifications"
                        element={<CounselorNotificationPage />}
                    />
                </Route>
                <Route
                    path="/counselor/chat/chat-page"
                    element={<CounselorChatPage />}
                />
            </Route>

            {/* === ADMIN & SUPER ADMIN === */}
            <Route element={<AdminGuestGuard />}>
                <Route element={<AuthAdminLayout />}>
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                </Route>
            </Route>

            <Route element={<AdminProtectedGuard />}>
                <Route element={<AdminLayout />}>
                    <Route
                        path="/admin"
                        element={<Navigate to="/admin/dashboard" />}
                    />
                    <Route
                        path="/admin/dashboard"
                        element={
                            <div>
                                {" "}
                                <h1>Selamat Datang di Dasbor!</h1>{" "}
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

            {/* === FALLBACK === */}
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
