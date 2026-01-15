import React, { useState, useEffect, useRef } from "react";
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
        strokeWidth="2.5"
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
        <polyline points="20 6 9 17 4 12"></polyline>
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
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
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
    >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

// --- Komponen Input Text (Inline Edit - Cyan Theme) ---
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
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-700 font-bold">
                    {label}
                </label>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-cyan-600 text-xs font-medium hover:text-cyan-700 flex items-center gap-1"
                    >
                        <EditIcon /> Ubah
                    </button>
                )}
            </div>
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="flex-grow text-sm text-gray-800 bg-white border border-cyan-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                        disabled={loading}
                        autoFocus
                    />
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="p-2 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-cyan-500 rounded-full animate-spin"></div>
                        ) : (
                            <CheckIcon />
                        )}
                    </button>
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            setValue(initialValue);
                        }}
                        disabled={loading}
                        className="p-2 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                    >
                        <XIcon />
                    </button>
                </div>
            ) : (
                <div className="w-full text-left bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 font-medium">
                    {value || "-"}
                </div>
            )}
        </div>
    );
};

// --- Komponen Item Menu (Link Only) ---
const MenuItem = ({ label, value, onClick, valueLines = 1 }) => (
    <div className="mb-4">
        <label className="text-sm text-gray-700 font-bold block mb-2">
            {label}
        </label>
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between text-left bg-white border border-gray-200 rounded-lg p-3 pr-3 transition-colors hover:bg-gray-50 group"
        >
            {valueLines > 1 ? (
                <p className="text-sm text-gray-800 whitespace-pre-line font-medium leading-relaxed">
                    {value || "-"}
                </p>
            ) : (
                <p className="text-sm text-gray-800 truncate font-medium">
                    {value || "-"}
                </p>
            )}
            <ChevronRightIcon />
        </button>
    </div>
);

// --- Komponen Read Only Item ---
const ReadOnlyItem = ({ label, value }) => (
    <div className="mb-4">
        <label className="text-sm text-gray-700 font-bold block mb-2">
            {label}
        </label>
        <div className="w-full bg-gray-100 border border-gray-200 rounded-lg p-3 text-sm text-gray-500 cursor-not-allowed">
            {value || "-"}
        </div>
    </div>
);

export default function CustomerEditProfilePage() {
    const navigate = useNavigate();
    const { user, getUser } = useAuth();
    const fileInputRef = useRef(null);

    const [isUploading, setIsUploading] = useState(false);
    const [avatarError, setAvatarError] = useState(null);

    // Format Data
    const profileData = {
        name: user?.name || "Nama Customer",
        email: user?.email || "email@contoh.com",
        phone: user?.phone || "Nomor belum diatur",
        location: user?.city
            ? `${user.city}, ${user.province || ""}\n${user.district || ""}, ${
                  user.postal_code || ""
              }`
            : "Lokasi belum diatur",
        address: user?.street_address || "Alamat belum diatur",
        dob: user?.dob
            ? new Date(user.dob).toLocaleDateString("id-ID", {
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
            )}&background=E0F2FE&color=0EA5E9&bold=true`,
    };

    const handleBack = () => {
        navigate(-1);
    };

    // --- Handlers Update ---
    const handleSaveName = async (newName) => {
        try {
            await apiClient.post("/api/profile/update", { name: newName });
            await getUser();
        } catch (error) {
            console.error("Gagal update nama:", error);
            throw error;
        }
    };

    const handleEditAvatar = () => {
        fileInputRef.current.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setAvatarError(null);

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            await apiClient.post("/api/profile/update-avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            await getUser();
        } catch (err) {
            console.error("Gagal upload avatar:", err);
            const message =
                err.response?.data?.errors?.avatar?.[0] ||
                "Gagal mengupload gambar.";
            setAvatarError(message);
        } finally {
            setIsUploading(false);
            e.target.value = null;
        }
    };

    return (
        <div className="bg-white min-h-full font-sans">
            {/* Header Halaman */}
            <header className="bg-white p-4 py-5 flex items-center sticky top-0 z-10 border-b border-gray-200 shadow-sm">
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
                <div className="w-8"></div>
            </header>

            {/* Konten Utama */}
            <main className="p-5 pt-8 space-y-8 pb-20">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/png, image/jpeg"
                    style={{ display: "none" }}
                />

                {/* 1. Foto Profil */}
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-3 group">
                        <img
                            src={profileData.avatar}
                            alt="Profile Avatar"
                            className={`w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg ${
                                isUploading ? "opacity-50" : ""
                            }`}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    user?.name || "U"
                                )}&background=E0F2FE&color=0EA5E9&bold=true`;
                            }}
                        />
                        <button
                            onClick={handleEditAvatar}
                            disabled={isUploading}
                            className="absolute bottom-1 right-1 bg-cyan-500 p-2.5 rounded-full border-4 border-white shadow-md hover:bg-cyan-600 transition-transform active:scale-90"
                        >
                            {isUploading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <CameraIcon />
                            )}
                        </button>
                    </div>
                    {avatarError && (
                        <p className="text-xs text-red-500 mt-2 font-medium">
                            {avatarError}
                        </p>
                    )}
                    <p className="text-sm text-gray-400 font-medium mt-1">
                        Ketuk ikon kamera untuk ubah foto
                    </p>
                </div>

                {/* 2. Data Diri */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 border-b-2 border-cyan-100 pb-2 mb-5">
                        Data Diri
                    </h2>
                    <EditableInputItem
                        label="Nama Lengkap"
                        initialValue={profileData.name}
                        onSave={handleSaveName}
                    />
                    <MenuItem
                        label="Email"
                        value={profileData.email}
                        onClick={() => navigate("/profile/change-email")}
                    />
                    <MenuItem
                        label="Nomor Telepon"
                        value={profileData.phone}
                        onClick={() => navigate("/profile/change-phone")}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <ReadOnlyItem
                            label="Jenis Kelamin"
                            value={profileData.gender}
                        />
                        <ReadOnlyItem
                            label="Tanggal Lahir"
                            value={profileData.dob}
                        />
                    </div>
                </section>

                {/* 3. Alamat */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 border-b-2 border-cyan-100 pb-2 mb-5">
                        Alamat Domisili
                    </h2>
                    <MenuItem
                        label="Lokasi (Provinsi, Kota, Kecamatan, Kode Pos)"
                        value={profileData.location}
                        valueLines={3}
                        onClick={() =>
                            navigate("/profile/edit/address", {
                                state: { mode: "full" },
                            })
                        }
                    />
                    <MenuItem
                        label="Nama Jalan, Nomor Rumah"
                        value={profileData.address}
                        valueLines={2}
                        onClick={() =>
                            navigate("/profile/edit/address", {
                                state: { mode: "street_only" },
                            })
                        }
                    />
                </section>
            </main>
        </div>
    );
}
