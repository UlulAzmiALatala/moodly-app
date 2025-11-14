import React, { useState, useEffect, useRef } from "react"; // <-- Tambahkan useRef
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axios";

// --- Komponen Ikon ---
const BackArrowIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-700 group-hover:text-gray-900"
    >
        {" "}
        <line x1="19" y1="12" x2="5" y2="12"></line>{" "}
        <polyline points="12 19 5 12 12 5"></polyline>{" "}
    </svg>
);
const EditIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
    >
        {" "}
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>{" "}
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>{" "}
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
        {" "}
        <polyline points="9 18 15 12 9 6"></polyline>{" "}
    </svg>
);
const CheckIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-green-500"
    >
        {" "}
        <polyline points="20 6 9 17 4 12"></polyline>{" "}
    </svg>
);
const XIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-red-500"
    >
        {" "}
        <line x1="18" y1="6" x2="6" y2="18"></line>{" "}
        <line x1="6" y1="6" x2="18" y2="18"></line>{" "}
    </svg>
);
// --- Akhir Komponen Ikon ---

// --- Komponen Input yang Bisa Diedit (untuk NAMA) ---
const EditableInputItem = ({ label, initialValue, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const handleSave = async () => {
        if (value === initialValue || !value) {
            setIsEditing(false);
            return;
        }
        setLoading(true);
        try {
            await onSave(value);
            setIsEditing(false);
        } catch (error) {
            console.error("Gagal menyimpan:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 rounded-lg p-3">
            <label className="text-xs text-gray-500 font-medium block mb-1">
                {label}
            </label>
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="flex-grow text-sm text-gray-800 bg-white border border-cyan-500 rounded-md px-2 py-1 focus:outline-none"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="p-1 hover:bg-gray-200 rounded-full"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-cyan-500 rounded-full animate-spin"></div>
                        ) : (
                            <CheckIcon />
                        )}
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        disabled={loading}
                        className="p-1 hover:bg-gray-200 rounded-full"
                    >
                        <XIcon />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => setIsEditing(true)}
                    className="flex justify-between items-center cursor-pointer"
                >
                    <p className="text-sm text-gray-800 truncate pr-2">
                        {value || "-"}
                    </p>
                    <ChevronRightIcon />
                </div>
            )}
        </div>
    );
};
// --- AKHIR KOMPONEN NAMA ---

// --- Komponen Tombol Menu (untuk Telepon, Alamat) ---
const MenuItem = ({
    label,
    value,
    valueLines = 1,
    editable = true,
    onClick,
}) => (
    <div
        onClick={editable ? onClick : undefined}
        className={`bg-gray-100 rounded-lg p-3 relative ${
            editable
                ? "cursor-pointer hover:bg-gray-200 transition-colors"
                : "opacity-70" // Read-only
        }`}
    >
        <label className="text-xs text-gray-500 font-medium block mb-1">
            {label}
        </label>
        {valueLines > 1 ? (
            <p className="text-sm text-gray-800 whitespace-pre-line pr-6">
                {value || "-"}
            </p>
        ) : (
            <p className="text-sm text-gray-800 truncate pr-6">
                {value || "-"}
            </p>
        )}

        {editable && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <ChevronRightIcon />
            </div>
        )}
    </div>
);

export default function EditProfilePage() {
    const navigate = useNavigate();
    const { user, getUser } = useAuth();
    const fileInputRef = useRef(null); // <-- Referensi untuk input file

    const [isUploading, setIsUploading] = useState(false); // <-- State loading avatar
    const [avatarError, setAvatarError] = useState(null);

    // Format data untuk ditampilkan
    const profileData = {
        name: user?.name || "Belum diatur",
        email: user?.email || "Belum diatur",
        phone: user?.phone || "Belum diatur",
        location: `${user?.city || "Kota"}, ${user?.province || "Provinsi"}\n${
            user?.district || "Kecamatan"
        }, ${user?.postal_code || "Kode Pos"}`,
        address: user?.street_address || "Belum diatur",
        dob: user?.tanggal_lahir
            ? new Date(user.tanggal_lahir).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
              })
            : "Belum diatur",
        gender: user?.gender || "Belum diatur",
        avatar:
            user?.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || "U"
            )}`, // <-- Gunakan avatar_url
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleSaveName = async (newName) => {
        try {
            await apiClient.post("/api/profile/update", { name: newName });
            await getUser();
        } catch (error) {
            console.error("Gagal update nama:", error);
            throw error;
        }
    };

    // --- FUNGSI BARU: Klik tombol edit avatar ---
    const handleEditAvatarClick = () => {
        fileInputRef.current.click(); // Klik input file yang tersembunyi
    };

    // --- FUNGSI BARU: Handle saat file dipilih ---
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setAvatarError(null);

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            // Panggil API baru kita
            await apiClient.post("/api/profile/update-avatar", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            // Refresh data user (ini akan otomatis memperbarui gambar)
            await getUser();
        } catch (err) {
            console.error("Gagal upload avatar:", err);
            const message =
                err.response?.data?.errors?.avatar?.[0] ||
                "Gagal mengupload gambar.";
            setAvatarError(message);
        } finally {
            setIsUploading(false);
            // Reset input file
            e.target.value = null;
        }
    };

    return (
        <div className="bg-white min-h-full font-sans">
            {/* Header Halaman */}
            <header className="bg-white p-4 flex items-center sticky top-0 z-10 border-b border-gray-200">
                <button
                    onClick={handleBack}
                    className="p-2 -ml-2 mr-2 rounded-full hover:bg-gray-100 group transition-colors"
                    aria-label="Kembali"
                >
                    <BackArrowIcon />
                </button>
                <h1 className="text-lg font-bold text-gray-800 text-center flex-grow">
                    Edit Profile
                </h1>
                <div className="w-8"></div>
            </header>

            {/* Konten Utama */}
            <main className="p-4 space-y-5">
                {/* Info Profil Atas */}
                <div className="flex flex-col items-center text-center mb-6">
                    {/* --- Input File Tersembunyi --- */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        accept="image/png, image/jpeg"
                        style={{ display: "none" }}
                    />
                    {/* --- Akhir Input File --- */}

                    <div className="relative mb-3">
                        <img
                            src={profileData.avatar}
                            alt="Profile Avatar"
                            className={`w-24 h-24 rounded-full object-cover border-4 border-white shadow-md ${
                                isUploading ? "opacity-50" : ""
                            }`} // <-- Efek loading
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    user?.name || "U"
                                )}`;
                            }}
                        />
                        {/* Tombol loading saat upload */}
                        {isUploading && (
                            <div className="absolute inset-0 flex justify-center items-center">
                                <div className="w-8 h-8 border-4 border-gray-300 border-t-cyan-500 rounded-full animate-spin"></div>
                            </div>
                        )}

                        <button
                            onClick={handleEditAvatarClick}
                            disabled={isUploading}
                            className="absolute bottom-0 right-0 bg-cyan-500 p-1.5 rounded-full border-2 border-white shadow-md hover:bg-cyan-600 transition-colors"
                        >
                            <EditIcon />
                        </button>
                    </div>
                    {avatarError && (
                        <p className="text-xs text-red-500">{avatarError}</p>
                    )}
                </div>

                {/* Form Items (Menu Hibrid) */}
                <EditableInputItem
                    label="Nama"
                    initialValue={profileData.name}
                    onSave={handleSaveName}
                />
                <MenuItem
                    label="Nomor"
                    value={profileData.phone}
                    onClick={() => navigate("/profile/change-phone")}
                />
                <MenuItem
                    label="Provinsi, Kota, Kecamatan, Kode Pos"
                    value={profileData.location}
                    valueLines={3}
                    onClick={() =>
                        navigate("/profile/edit/address", {
                            state: { mode: "full" },
                        })
                    }
                />
                <MenuItem
                    label="Nama Jalan, No Rumah"
                    value={profileData.address}
                    valueLines={2}
                    onClick={() =>
                        navigate("/profile/edit/address", {
                            state: { mode: "street_only" },
                        })
                    }
                />
                <MenuItem
                    label="Tanggal Lahir"
                    value={profileData.dob}
                    editable={false}
                />
                <MenuItem
                    label="Jenis Kelamin"
                    value={profileData.gender}
                    editable={false}
                />
            </main>
        </div>
    );
}
