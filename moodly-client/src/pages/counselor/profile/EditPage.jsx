import React from "react";
import { useNavigate } from "react-router-dom";
// --- PERBAIKAN: Path harus naik 3 level (../../../) ---
import { useAuth } from "../../../context/AuthContext.jsx";

// --- Komponen Ikon ---
const BackArrowIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5" // Dibuat sedikit lebih tebal
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-800 group-hover:text-black"
    >
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const CameraIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-400"
    >
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);
// --- Akhir Komponen Ikon ---

// --- Komponen Item Form (Sesuai Desain Baru) ---
const FormItem = ({ label, value, onClick, valueLines = 1 }) => (
    <div className="mb-4">
        <label className="text-sm text-gray-700 font-semibold block mb-2">
            {label}
        </label>
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between text-left bg-gray-100 rounded-lg p-3.5 pr-3 transition-colors hover:bg-gray-200"
        >
            {valueLines > 1 ? (
                <p className="text-sm text-gray-800 whitespace-pre-line">
                    {value}
                </p>
            ) : (
                <p className="text-sm text-gray-800 truncate">{value}</p>
            )}
            <ChevronRightIcon />
        </button>
    </div>
);

export default function CounselorEditProfilePage() {
    const navigate = useNavigate();
    const { user } = useAuth(); // Ambil data user dari context

    // Format data dummy dari user context
    const profileData = {
        name: user?.name || "Konselor 1",
        email: user?.email || "konselor1@moodly.com",
        phone: user?.phone || "+62 898 - 9879 - 9484",
        address:
            user?.practiceAddress ||
            "Jl. Rotowijayan No.56, Panembahan,\nKraton, Yogyakarta 55131",
        avatar:
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || "K1"
            )}&background=E0F2FE&color=0EA5E9&bold=true`,
    };

    const handleBack = () => {
        navigate(-1); // Kembali ke halaman sebelumnya (Profile Menu)
    };

    // --- Fungsi Navigasi (sesuaikan tujuannya) ---
    const handleEditName = () => {
        console.log("Navigasi ke edit nama");
        // navigate('/counselor/profile/edit/name');
    };

    const handleEditPhone = () => {
        console.log("Navigasi ke edit nomor");
        // navigate('/counselor/profile/edit/phone');
    };

    const handleEditAddress = () => {
        console.log("Navigasi ke edit alamat praktik");
        // navigate('/counselor/profile/edit/address');
    };

    const handleEditAvatar = () => {
        console.log("Logika ganti avatar");
        // Buka file picker
    };

    return (
        <div className="bg-white-50 min-h-full font-sans">
            {/* Header Halaman (Bagian dari konten, bukan layout) */}
            <header className="bg-white p-4 py-5 flex items-center sticky top-0 z-10 border-b border-gray-200">
                <button
                    onClick={handleBack}
                    className="p-2 -ml-2 mr-2 rounded-full hover:bg-gray-100 group transition-colors"
                    aria-label="Kembali"
                >
                    <BackArrowIcon />
                </button>
                <h1 className="text-lg font-bold text-gray-900 text-center flex-grow -translate-x-4">
                    Edit Profile
                </h1>
                <div className="w-8"></div> {/* Spacer agar judul di tengah */}
            </header>

            {/* Konten Utama */}
            <main className="p-5 pt-8 space-y-4">
                {/* Info Profil Atas */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="relative mb-3">
                        <img
                            src={profileData.avatar}
                            alt="Profile Avatar"
                            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    user?.name || "K1"
                                )}&background=E0F2FE&color=0EA5E9&bold=true`;
                            }}
                        />
                        {/* Tombol Edit Avatar (Sesuai Desain) */}
                        <button
                            onClick={handleEditAvatar}
                            className="absolute bottom-1 right-1 bg-cyan-500 p-2 rounded-full border-2 border-white shadow-md hover:bg-cyan-600 transition-colors"
                        >
                            <CameraIcon />
                        </button>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                        {profileData.name}
                    </h2>
                    <p className="text-sm text-gray-500">{profileData.email}</p>
                </div>

                {/* Form Items (Sesuai Desain) */}
                <FormItem
                    label="Nama"
                    value={profileData.name}
                    onClick={handleEditName}
                />
                <FormItem
                    label="Nomor"
                    value={profileData.phone}
                    onClick={handleEditPhone}
                />
                <FormItem
                    label="Alamat Praktik"
                    value={profileData.address}
                    valueLines={2} // Tampilkan 2 baris
                    onClick={handleEditAddress}
                />
            </main>
        </div>
    );
}
