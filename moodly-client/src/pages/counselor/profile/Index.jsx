import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx"; // Path sudah benar (3x mundur)

// --- Komponen Ikon (Tidak berubah) ---
const UserIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-500"
    >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);
const MailIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-500"
    >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
);
const LockIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-500"
    >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);
const CloudCogIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-500"
    >
        <path d="M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9" />
        <circle cx="12" cy="17" r="2.5" />
        <path d="m12 14.5-1-1" />
        <path d="m15 17.5 1 1" />
        <path d="m12 19.5 1 1" />
        <path d="m9 16.5-1-1" />
        <path d="m16 17 1.5 0" />
        <path d="m6.5 17-1.5 0" />
        <path d="m14.2 19.2.8-1.7" />
        <path d="m9.8 14.8-.8 1.7" />
    </svg>
);
const CalendarIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-500"
    >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);
const HomeIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-500"
    >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);
const BankIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-500"
    >
        <path d="M3 21h18" />
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
        <path d="M9 21v-5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v5" />
        <line x1="7" y1="9" x2="17" y2="9" />
        <line x1="7" y1="13" x2="17" y2="13" />
    </svg>
);
const LogOutIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-500"
    >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);
const ChevronRightIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-400"
    >
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);
// --- Akhir Komponen Ikon ---

// --- Komponen Item Menu ---
const MenuItem = ({ icon, label, onClick, isLogout = false }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-4 rounded-lg transition-colors duration-200 group ${
            isLogout
                ? "bg-red-50 hover:bg-red-100"
                : "bg-gray-100 hover:bg-gray-200"
        }`}
    >
        <div className="flex items-center gap-3">
            {React.cloneElement(icon, {
                className: isLogout ? "text-red-500" : "text-gray-500",
            })}
            <span
                className={`text-sm font-medium group-hover:text-gray-900 ${
                    isLogout ? "text-red-700" : "text-gray-700"
                }`}
            >
                {label}
            </span>
        </div>
        {!isLogout && <ChevronRightIcon />}
    </button>
);

export default function CounselorProfilePage() {
    // <-- Nama komponen diubah
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            if (logout) {
                await logout();
            }
            // Guard akan menangani navigasi
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // --- FUNGSI NAVIGASI DIPERBARUI SESUAI STRUKTUR BARU ---
    const handleEditProfileClick = () => navigate("/counselor/profile/edit");
    const handleChangeEmailClick = () =>
        navigate("/counselor/profile/change-email");
    const handleChangePasswordClick = () =>
        navigate("/counselor/profile/change-password");

    // Perbarui rute ini agar sesuai dengan router/index.jsx
    const handleScheduleClick = () =>
        navigate("/counselor/profile/change-schedule");
    const handlePracticeLocationClick = () =>
        navigate("/counselor/profile/change-location");
    const handleBankClick = () => navigate("/counselor/profile/change-bank");

    const handleHelpClick = () => navigate("/counselor/help");
    // --- AKHIR PERBAIKAN NAVIGASI ---

    // Gunakan avatar_url (dari accessor) untuk URL lengkap
    const avatarUrl =
        user?.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user?.name || "K" // Fallback "K" untuk Konselor
        )}&background=EBF4FF&color=3B82F6&bold=true`;

    return (
        <div className="bg-white min-h-full font-sans pt-8 pb-4 px-4">
            {/* Info Profil Atas */}
            <div className="flex flex-col items-center text-center mb-8">
                <img
                    src={avatarUrl}
                    alt="Profile Avatar"
                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg mb-3"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user?.name || "K"
                        )}&background=EBF4FF&color=3B82F6&bold=true`;
                    }}
                />
                <h2 className="text-xl font-bold text-gray-800">
                    {user?.name || "Nama Konselor"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    {user?.email || "email@konselor.com"}
                </p>
            </div>

            {/* Daftar Menu */}
            <div className="space-y-3">
                <MenuItem
                    icon={<UserIcon />}
                    label="Edit Profile"
                    onClick={handleEditProfileClick}
                />

                <MenuItem
                    icon={<MailIcon />}
                    label="Email"
                    onClick={handleChangeEmailClick}
                />
                <MenuItem
                    icon={<LockIcon />}
                    label="Ubah Kata sandi"
                    onClick={handleChangePasswordClick}
                />

                {/* Rute-rute yang diperbarui */}
                <MenuItem
                    icon={<CalendarIcon />}
                    label="Atur Jadwal Praktik"
                    onClick={handleScheduleClick}
                />
                <MenuItem
                    icon={<HomeIcon />}
                    label="Atur Tempat Praktik"
                    onClick={handlePracticeLocationClick}
                />
                <MenuItem
                    icon={<BankIcon />}
                    label="Daftar Rekening"
                    onClick={handleBankClick}
                />

                <MenuItem
                    icon={<CloudCogIcon />}
                    label="Bantuan"
                    onClick={handleHelpClick}
                />
                <MenuItem
                    icon={<LogOutIcon />}
                    label="Log Out"
                    onClick={handleLogout}
                    isLogout={true}
                />
            </div>
        </div>
    );
}
