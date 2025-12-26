import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Commet from "../components/Commet.jsx";

// =========================================
// 1. LAYOUTS
// =========================================
import MobileLayout from "../layouts/MobileLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import AuthAdminLayout from "../layouts/AuthAdminLayout.jsx";
import PageLayout from "../layouts/PageLayout.jsx";

// =========================================
// 2. AUTHENTICATION PAGES
// =========================================
// --- Customer Auth ---
import CustomerLoginPage from "../pages/auth/customer/LoginPage.jsx";
import CustomerRegisterPage from "../pages/auth/customer/RegisterPage.jsx";
import CustomerAddressPage from "../pages/auth/customer/AddressPage.jsx";
import CustomerCreatePasswordPage from "../pages/auth/customer/CreatePasswordPage.jsx";
import OnboardingPage from "../pages/auth/OnboardingPage.jsx";

// --- Counselor Auth ---
import CounselorLoginPage from "../pages/auth/counselor/LoginPage.jsx";
import CounselorRegisterPage from "../pages/auth/counselor/RegisterPage.jsx";
import CounselorAddressPage from "../pages/auth/counselor/AddressPage.jsx";
import CounselorCreatePasswordPage from "../pages/auth/counselor/CreatePasswordPage.jsx";

// --- Admin Auth ---
import AdminLoginPage from "../pages/auth/admin/LoginPage.jsx";
import NewPasswordPage from "../pages/auth/admin/NewPasswordPage.jsx";
import AdminForgotPasswordPage from "../pages/auth/admin/ForgotPasswordPage.jsx";

// --- General Auth ---
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage.jsx";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage.jsx";
import VerifyCodePage from "../pages/auth/VerifyCodePage.jsx";

// =========================================
// 3. CUSTOMER PAGES
// =========================================
import HomePage from "../pages/customer/HomePage.jsx";
import NotificationPage from "../pages/customer/NotificationPage.jsx";
import NotificationSchedule from "../pages/customer/NotificationSchedule.jsx";
import NotificationRefund from "../pages/customer/NotificationRefund.jsx";
import PrivacyPolicyPage from "../pages/customer/PrivacyPolicyPage.jsx";

// --- Booking & Payment ---
import BookingPage from "../pages/customer/booking/Index.jsx";
import FindCounselorPage from "../pages/customer/booking/FindCounselorPage.jsx";
import InPersonPage from "../pages/customer/booking/InPersonPage.jsx";
import LocationDetailPage from "../pages/customer/booking/LocationDetailPage.jsx";
import PsychologistDetailPage from "../pages/customer/booking/PsychologistDetailPage.jsx";
import PaymentOnlinePage from "../pages/customer/booking/payment/PaymentOnlinePage.jsx";
import QrisPaymentPage from "../pages/customer/booking/payment/QrisPaymentPage.jsx";
import PaymentOfflinePage from "../pages/customer/booking/payment/PaymentOfflinePage.jsx";
import UploadPaymentProofPage from "../pages/customer/booking/payment/UploadPaymentProofPage.jsx";

// --- History ---
import HistoryPage from "../pages/customer/history/Index.jsx";
import HistoryDetailPage from "../pages/customer/history/DetailPage.jsx";
import RatingPage from "../pages/customer/history/RatingPage.jsx";
import ReschedulePage from "../pages/customer/history/ReschedulePage.jsx";
import LoadingPage from "../pages/customer/history/LoadingPage.jsx";
import ReceiptPage from "../pages/customer/history/ReceiptPage.jsx";

// --- History Cancellation Flow ---
import CancelPage from "../pages/customer/history/cancellation/CancelPage.jsx";
import RefundAgreement from "../pages/customer/history/cancellation/RefundAgreement.jsx";
import RefundPage from "../pages/customer/history/cancellation/RefundPage.jsx";
import CancelDetailPage from "../pages/customer/history/cancellation/CancelDetailPage.jsx";

// --- Profile ---
import ProfilePage from "../pages/customer/profile/Index.jsx";
import EditProfilePage from "../pages/customer/profile/EditPage.jsx";
import ChangePasswordPage from "../pages/customer/profile/ChangePasswordPage.jsx";
import ChangeEmailPage from "../pages/customer/profile/ChangeEmailPage.jsx";
import ChangePhoneNumberPage from "../pages/customer/profile/ChangePhoneNumberPage.jsx";
import ChangeAddressPage from "../pages/customer/profile/ChangeAddressPage.jsx";

// --- Help & Session ---
import HelpPage from "../pages/customer/help/Index.jsx";
import FaqPage from "../pages/customer/help/FaqPage.jsx";
import ChatAdminPage from "../pages/customer/help/ChatAdminPage.jsx";
import ChatPage from "../pages/customer/session/ChatPage.jsx";
import VideoCallPage from "../pages/customer/session/VideoCallPage.jsx";

// =========================================
// 4. COUNSELOR PAGES
// =========================================
import CounselorHomePage from "../pages/counselor/HomePage.jsx";
import CounselorNotificationPage from "../pages/counselor/NotificationPage.jsx";

// --- Schedule & History ---
import CounselorSchedulePage from "../pages/counselor/schedule/Index.jsx";
import CounselorScheduleDetailPage from "../pages/counselor/schedule/DetailPage.jsx";
import CounselorHistoryPage from "../pages/counselor/history/HistoryPage.jsx";
import CounselorHistoryEditPage from "../pages/counselor/history/Edit.jsx";
import CounselorReschedulePage from "../pages/counselor/history/ReSchedulePage.jsx";
import CounselorReceiptPage from "../pages/counselor/history/ReceiptPage.jsx";

// --- Profile ---
import CounselorProfilePage from "../pages/counselor/profile/Index.jsx";
import CounselorProfileEditPage from "../pages/counselor/profile/EditPage.jsx";
import CounselorChangeEmailPage from "../pages/counselor/profile/ChangeEmailPage.jsx";
import CounselorChangePasswordPage from "../pages/counselor/profile/ChangePasswordPage.jsx";
import CounselorChangePhonePage from "../pages/counselor/profile/ChangePhoneNumberPage.jsx";
import CounselorChangeBankAccountPage from "../pages/counselor/profile/ChangeBankAccount.jsx";
import CounselorChangeLocationPage from "../pages/counselor/profile/ChangeLocation.jsx";
import CounselorChangeAddressPage from "../pages/counselor/profile/ChangeAddressPage.jsx";
import CounselorChangeSchedulePage from "../pages/counselor/profile/ChangeSchedulePage.jsx";

// --- Help & Session ---
import CounselorHelpPage from "../pages/counselor/help/Index.jsx";
import CounselorFaqPage from "../pages/counselor/help/FaqPage.jsx";
import CounselorChatAdminPage from "../pages/counselor/help/ChatAdminPage.jsx";
import CounselorChatPage from "../pages/counselor/konseling/chat/ChatPageCounselor.jsx";

// =========================================
// 5. ADMIN & SUPER ADMIN PAGES
// =========================================
import AdminDashboardPage from "../pages/admin/dashboard/Index.jsx";
import SuperAdminDashboardPage from "../pages/super-admin/dashboard/Index.jsx";

// --- Master Data ---
import JenisKonselingPage from "../pages/super-admin/konseling/jenis/Index.jsx";
import DurasiKonselingPage from "../pages/super-admin/konseling/durasi/Index.jsx";
import TempatKonselingPage from "../pages/super-admin/konseling/tempat/Index.jsx";
import PaymentMethodsPage from "../pages/super-admin/payment-methods/Index.jsx";

// --- Management ---
import AdminManagementPage from "../pages/super-admin/admin/Index.jsx";
import AdminDetailPage from "../pages/super-admin/admin/Show.jsx";
import KonselorManagementPage from "../pages/super-admin/konselor/Index.jsx";
import KonselorDetailPage from "../pages/super-admin/konselor/Show.jsx";
import CustomerManagementPage from "../pages/super-admin/customer/Index.jsx";
import CustomerDetailPage from "../pages/super-admin/customer/Show.jsx";

// --- Operations ---
import BookingManagementPage from "../pages/super-admin/pesanan/Index.jsx";
import BookingDetailPage from "../pages/super-admin/pesanan/Show.jsx";
import JadwalKonsultasiPage from "../pages/admin/jadwal-konsultasi/Index.jsx";
import JadwalDetailPage from "../pages/admin/jadwal-konsultasi/Show.jsx";
import VerifikasiKonselorPage from "../pages/admin/verifikasi-konselor/Index.jsx";
import VerifikasiDetailPage from "../pages/admin/verifikasi-konselor/Show.jsx";
import VerifikasiCustomerPage from "../pages/admin/verifikasi-customer/Index.jsx";
import VerifikasiCustomerDetailPage from "../pages/admin/verifikasi-customer/Show.jsx";
import RefundManagementPage from "../pages/super-admin/refund/Index.jsx";
import SuperAdminHelpChatPage from "../pages/super-admin/help/Index.jsx";

// --- Finance ---
import FinancePage from "../pages/super-admin/keuangan/Index.jsx";
import FinanceDetailPage from "../pages/super-admin/keuangan/Show.jsx"; // [IMPORT BARU]

// === GUARDS ===
const GuestGuard = () => {
    const { user } = useAuth();
    if (user) {
        if (user.role?.includes("super-admin"))
            return <Navigate to="/super-admin/dashboard" />;
        if (user.role?.includes("admin"))
            return <Navigate to="/admin/dashboard" />;
        if (user.role?.includes("konselor") || user.role?.includes("counselor"))
            return <Navigate to="/counselor/home" />;
        return <Navigate to="/home" />;
    }
    return <Outlet />;
};

const ProtectedGuard = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (user.role?.includes("super-admin"))
        return <Navigate to="/super-admin/dashboard" />;
    if (user.role?.includes("admin")) return <Navigate to="/admin/dashboard" />;
    if (user.role?.includes("konselor") || user.role?.includes("counselor"))
        return <Navigate to="/counselor/home" />;
    return <Outlet />;
};

const CounselorProtectedGuard = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/counselor/login" />;
    if (user.role?.includes("super-admin"))
        return <Navigate to="/super-admin/dashboard" />;
    if (user.role?.includes("admin")) return <Navigate to="/admin/dashboard" />;
    if (!user.role?.includes("konselor") && !user.role?.includes("counselor"))
        return <Navigate to="/home" />;
    return <Outlet />;
};

const AdminGuestGuard = () => {
    const { user } = useAuth();
    if (user) {
        if (user.role?.includes("super-admin"))
            return <Navigate to="/super-admin/dashboard" />;
        if (user.role?.includes("admin"))
            return <Navigate to="/admin/dashboard" />;
    }
    return <Outlet />;
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
                <Route element={<AuthLayout />}>
                    <Route path="/" element={<OnboardingPage />} />
                    <Route path="/login" element={<CustomerLoginPage />} />
                    <Route
                        path="/register"
                        element={<CustomerRegisterPage />}
                    />
                    <Route
                        path="/counselor/login"
                        element={<CounselorLoginPage />}
                    />
                    <Route
                        path="/counselor/register"
                        element={<CounselorRegisterPage />}
                    />
                </Route>
                <Route element={<PageLayout />}>
                    <Route path="/address" element={<CustomerAddressPage />} />
                    <Route
                        path="/create-password"
                        element={<CustomerCreatePasswordPage />}
                    />
                    <Route
                        path="/counselor/address"
                        element={<CounselorAddressPage />}
                    />
                    <Route
                        path="/counselor/create-password"
                        element={<CounselorCreatePasswordPage />}
                    />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPasswordPage />}
                    />
                    <Route
                        path="/reset-password"
                        element={<ResetPasswordPage />}
                    />
                    <Route path="/verify-code" element={<VerifyCodePage />} />
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
                    <Route
                        path="/notifications"
                        element={<NotificationPage />}
                    />
                    <Route
                        path="/notification/schedule/:id"
                        element={<NotificationSchedule />}
                    />
                    <Route
                        path="/notification/refund/:id"
                        element={<NotificationRefund />}
                    />

                    {/* Profile Management */}
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

                    {/* Payment */}
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

                    {/* History Details */}
                    <Route
                        path="/history/loading/:id"
                        element={<LoadingPage />}
                    />
                    <Route
                        path="/history/receipt/:id"
                        element={<ReceiptPage />}
                    />
                    <Route
                        path="/history/:id"
                        element={<HistoryDetailPage />}
                    />
                    <Route
                        path="/history/reschedule/:id"
                        element={<ReschedulePage />}
                    />
                    <Route
                        path="/history/rating/:id"
                        element={<RatingPage />}
                    />

                    {/* --- CANCELLATION FLOW (UPDATED) --- */}
                    <Route
                        path="/history/cancel/:id"
                        element={<CancelPage />}
                    />
                    <Route
                        path="/history/cancel-agreement/:id"
                        element={<RefundAgreement />}
                    />
                    <Route
                        path="/history/refund/:id"
                        element={<RefundPage />}
                    />
                    <Route
                        path="/history/cancel-detail/:id"
                        element={<CancelDetailPage />}
                    />

                    {/* Help & Session */}
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/help/faq" element={<FaqPage />} />
                    <Route
                        path="/help/chat-admin"
                        element={<ChatAdminPage />}
                    />
                    <Route path="/session/chat/:id" element={<ChatPage />} />
                    <Route
                        path="/session/video/:id"
                        element={<VideoCallPage />}
                    />
                    <Route
                        path="/privacy-policy"
                        element={<PrivacyPolicyPage />}
                    />
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
                        path="/counselor/notifications"
                        element={<CounselorNotificationPage />}
                    />
                    <Route
                        path="/counselor"
                        element={<Navigate to="/counselor/home" />}
                    />
                </Route>

                <Route element={<PageLayout />}>
                    <Route
                        path="/counselor/schedule/:id"
                        element={<CounselorScheduleDetailPage />}
                    />
                    <Route
                        path="/counselor/history/edit/:id"
                        element={<CounselorHistoryEditPage />}
                    />
                    <Route
                        path="/counselor/history/reschedule/:id"
                        element={<CounselorReschedulePage />}
                    />
                    <Route
                        path="/counselor/history/receipt/:id"
                        element={<CounselorReceiptPage />}
                    />
                    <Route
                        path="/counselor/chat/:id"
                        element={<CounselorChatPage />}
                    />
                    {/* Help */}
                    <Route
                        path="/counselor/help"
                        element={<CounselorHelpPage />}
                    />
                    <Route
                        path="/counselor/help/faq"
                        element={<CounselorFaqPage />}
                    />
                    <Route
                        path="/counselor/help/chat-admin"
                        element={<CounselorChatAdminPage />}
                    />
                    {/* Profile Management */}
                    <Route
                        path="/counselor/profile/edit"
                        element={<CounselorProfileEditPage />}
                    />
                    <Route
                        path="/counselor/profile/change-password"
                        element={<CounselorChangePasswordPage />}
                    />
                    <Route
                        path="/counselor/profile/change-email"
                        element={<CounselorChangeEmailPage />}
                    />
                    <Route
                        path="/counselor/profile/change-phone"
                        element={<CounselorChangePhonePage />}
                    />
                    <Route
                        path="/counselor/profile/change-location"
                        element={<CounselorChangeLocationPage />}
                    />
                    <Route
                        path="/counselor/profile/change-address"
                        element={<CounselorChangeAddressPage />}
                    />{" "}
                    {/* RUTE BARU */}
                    <Route
                        path="/counselor/profile/change-bank"
                        element={<CounselorChangeBankAccountPage />}
                    />
                    <Route
                        path="/counselor/profile/change-schedule"
                        element={<CounselorChangeSchedulePage />}
                    />
                </Route>
            </Route>

            {/* === ADMIN & SUPER ADMIN === */}
            <Route element={<AdminGuestGuard />}>
                <Route element={<AuthAdminLayout />}>
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route
                        path="/admin/ganti-password"
                        element={<NewPasswordPage />}
                    />
                    <Route
                        path="/admin/kesulitan-login"
                        element={<AdminForgotPasswordPage />}
                    />
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
                        element={<AdminDashboardPage />}
                    />
                    <Route
                        path="/super-admin/dashboard"
                        element={<SuperAdminDashboardPage />}
                    />

                    {/* Master Data */}
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

                    {/* Management Lists */}
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

                    {/* Operations */}
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

                    <Route
                        path="/admin/help/conversations"
                        element={<SuperAdminHelpChatPage />}
                    />

                    {/* Super Admin Exclusive */}
                    <Route
                        path="/super-admin/refund-management"
                        element={<RefundManagementPage />}
                    />
                    <Route
                        path="/super-admin/help-center"
                        element={<SuperAdminHelpChatPage />}
                    />

                    {/* --- KEUANGAN (FINANCE) --- */}
                    <Route
                        path="/super-admin/keuangan"
                        element={<FinancePage />}
                    />
                    <Route
                        path="/super-admin/keuangan/:id" // Rute Detail Transaksi Baru
                        element={<FinanceDetailPage />}
                    />
                </Route>
            </Route>

            {/* === FALLBACK === */}
            <Route
                path="*"
                element={
                    <div className="flex items-center justify-center min-h-screen bg-gray-50">
                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">
                                404
                            </h1>
                            <p className="text-gray-600">
                                Halaman Tidak Ditemukan
                            </p>
                        </div>
                    </div>
                }
            />
        </Routes>
    );
};

export default AppRouter;
