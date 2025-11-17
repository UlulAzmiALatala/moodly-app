import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import apiClient from "../../../api/axios.js";

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
        {" "}
        <line x1="19" y1="12" x2="5" y2="12"></line>{" "}
        <polyline points="12 19 5 12 12 5"></polyline>{" "}
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
        {" "}
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />{" "}
        <circle cx="12" cy="13" r="3" />{" "}
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
        <div className="mb-4">
            <label className="text-sm text-gray-700 font-semibold block mb-2">
                {label}
            </label>
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="flex-grow text-sm text-gray-800 bg-white border border-cyan-500 rounded-lg px-3 py-3 focus:outline-none"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="p-2 hover:bg-gray-200 rounded-full"
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
                        className="p-2 hover:bg-gray-200 rounded-full"
                    >
                        <XIcon />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-between text-left bg-gray-100 rounded-lg p-3.5 pr-3 transition-colors hover:bg-gray-200 cursor-pointer"
                >
                    <p className="text-sm text-gray-800 truncate">
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
    onClick,
    valueLines = 1,
    editable = true,
}) => (
    <div className="mb-4">
        <label className="text-sm text-gray-700 font-semibold block mb-2">
            {label}
        </label>
        <button
            onClick={editable ? onClick : undefined}
            className={`w-full flex items-center justify-between text-left bg-gray-100 rounded-lg p-3.5 pr-3 transition-colors ${
                editable ? "cursor-pointer hover:bg-gray-200" : "opacity-70"
            }`}
        >
            {valueLines > 1 ? (
                <p className="text-sm text-gray-800 whitespace-pre-line">
                    {value || "-"}
                </p>
            ) : (
                <p className="text-sm text-gray-800 truncate">{value || "-"}</p>
            )}
            {editable && <ChevronRightIcon />}
        </button>
    </div>
);

// --- [BARU] Komponen Checkbox Metode ---
const MethodCheckbox = ({ label, name, checked, onChange, disabled }) => (
    <label className="flex items-center space-x-2">
        <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="h-5 w-5 text-cyan-600 rounded focus:ring-cyan-500 border-gray-300"
        />
        <span className="text-sm text-gray-700">{label}</span>
    </label>
);

export default function CounselorEditProfilePage() {
    // <-- Nama diubah
    const navigate = useNavigate();
    const { user, getUser } = useAuth();
    const fileInputRef = useRef(null);

    const [isUploading, setIsUploading] = useState(false);
    const [avatarError, setAvatarError] = useState(null);
    const [isSavingMethods, setIsSavingMethods] = useState(false);

    // --- State untuk Metode Konseling ---
    const [metode, setMetode] = useState({
        Chat: false,
        "Video Call": false,
        "Voice Call": false,
        "Tatap Muka": false,
    });

    // Format data dinamis dari user context
    const profileData = {
        name: user?.name || "Nama Konselor",
        email: user?.email || "email@konselor.com",
        phone: user?.phone || "Nomor belum diatur",
        location: `${user?.city || "Kota"}, ${user?.province || "Provinsi"}\n${
            user?.district || "Kecamatan"
        }, ${user?.postal_code || "Kode Pos"}`,
        address: user?.street_address || "Alamat jalan belum diatur",
        dob: user?.tanggal_lahir
            ? new Date(user.tanggal_lahir).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
              })
            : "Belum diatur",
        gender: user?.gender || "Belum diatur",
        izinPraktik: user?.surat_izin_praktik || "Belum diatur",
        universitas: user?.universitas || "Belum diatur",
        spesialisasi: (user?.spesialisasi || []).join(", ") || "Belum diatur",
        avatar:
            user?.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || "K"
            )}&background=E0F2FE&color=0EA5E9&bold=true`,
    };

    // --- Isi state 'metode' saat user dimuat ---
    useEffect(() => {
        if (user?.metode_layanan) {
            const initialMethods = { ...metode };
            user.metode_layanan.forEach((methodName) => {
                if (methodName in initialMethods) {
                    initialMethods[methodName] = true;
                }
            });
            setMetode(initialMethods);
        }
    }, [user]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleSaveName = async (newName) => {
        try {
            await apiClient.post("/api/counselor/profile/update", {
                name: newName,
            });
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
            await apiClient.post(
                "/api/counselor/profile/update-avatar",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
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

    // --- [BARU] Handler untuk Checkbox Metode ---
    const handleMediaChange = (e) => {
        const { name, checked } = e.target;
        setMetode((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSaveMethods = async () => {
        setIsSavingMethods(true);

        // Ubah { Chat: true, "Video Call": false } menjadi ["Chat"]
        const selectedMethods = Object.keys(metode).filter(
            (key) => metode[key]
        );

        try {
            // Panggil API update profil
            await apiClient.post("/api/counselor/profile/update", {
                metode_layanan: selectedMethods,
            });
            await getUser(); // Refresh data
            alert("Metode konseling berhasil diperbarui!"); // Ganti dg toast
        } catch (error) {
            console.error("Gagal update metode:", error);
            alert("Gagal menyimpan metode.");
        } finally {
            setIsSavingMethods(false);
        }
    };
    // --- AKHIR HANDLER BARU ---

    return (
        <div className="bg-white min-h-full font-sans">
            {/* Header Halaman */}
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
                <div className="w-8"></div> {/* Spacer */}
            </header>

            {/* Konten Utama */}
            <main className="p-5 pt-8 space-y-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/png, image/jpeg"
                    style={{ display: "none" }}
                />

                {/* Info Profil Atas */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="relative mb-3">
                        <img
                            src={profileData.avatar}
                            alt="Profile Avatar"
                            className={`w-28 h-28 rounded-full object-cover border-4 border-white shadow-md ${
                                isUploading ? "opacity-50" : ""
                            }`}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    user?.name || "K1"
                                )}&background=E0F2FE&color=0EA5E9&bold=true`;
                            }}
                        />
                        <button
                            onClick={handleEditAvatar}
                            disabled={isUploading}
                            className="absolute bottom-1 right-1 bg-cyan-500 p-2 rounded-full border-2 border-white shadow-md hover:bg-cyan-600 transition-colors"
                        >
                            {isUploading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <CameraIcon />
                            )}
                        </button>
                    </div>
                    {avatarError && (
                        <p className="text-xs text-red-500">{avatarError}</p>
                    )}
                </div>

                {/* Form Items (Menu Hibrid) */}

                <h3 className="text-base font-bold text-gray-800 border-b pb-2">
                    Info Pribadi
                </h3>

                <EditableInputItem
                    label="Nama"
                    initialValue={profileData.name}
                    onSave={handleSaveName}
                />
                <MenuItem
                    label="Nomor Telepon"
                    value={profileData.phone}
                    onClick={() => navigate("/counselor/profile/change-phone")}
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

                <h3 className="text-base font-bold text-gray-800 border-b pb-2 pt-4">
                    Info Alamat
                </h3>

                <MenuItem
                    label="Provinsi, Kota, Kecamatan, Kode Pos"
                    value={profileData.location}
                    valueLines={3}
                    onClick={() =>
                        navigate("/counselor/profile/change-location")
                    }
                />
                <MenuItem
                    label="Nama Jalan, No Rumah"
                    value={profileData.address}
                    valueLines={2}
                    onClick={() =>
                        navigate("/counselor/profile/change-location")
                    }
                />

                <h3 className="text-base font-bold text-gray-800 border-b pb-2 pt-4">
                    Info Profesional
                </h3>

                <MenuItem
                    label="Info Profesional (SIP, Universitas, Spesialisasi)"
                    value={`${profileData.universitas} • ${profileData.izinPraktik}`}
                    valueLines={2}
                    onClick={() =>
                        navigate("/counselor/profile/change-schedule")
                    }
                />

                {/* --- [BARU] METODE KONSELING --- */}
                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Metode Konseling Tersedia
                    </label>
                    <div className="bg-gray-100 rounded-lg p-4 space-y-3">
                        <MethodCheckbox
                            label="Chat"
                            name="Chat"
                            checked={metode.Chat}
                            onChange={handleMediaChange}
                            disabled={isSavingMethods}
                        />
                        <MethodCheckbox
                            label="Video Call"
                            name="Video Call"
                            checked={metode["Video Call"]}
                            onChange={handleMediaChange}
                            disabled={isSavingMethods}
                        />
                        <MethodCheckbox
                            label="Voice Call"
                            name="Voice Call"
                            checked={metode["Voice Call"]}
                            onChange={handleMediaChange}
                            disabled={isSavingMethods}
                        />
                        <MethodCheckbox
                            label="Tatap Muka"
                            name="Tatap Muka"
                            checked={metode["Tatap Muka"]}
                            onChange={handleMediaChange}
                            disabled={isSavingMethods}
                        />
                        <button
                            onClick={handleSaveMethods}
                            disabled={isSavingMethods}
                            className="w-full mt-3 bg-cyan-500 text-white text-sm font-bold py-2 px-4 rounded-lg shadow hover:bg-cyan-600 transition-colors active:scale-95 disabled:bg-gray-400"
                        >
                            {isSavingMethods ? "Menyimpan..." : "Simpan Metode"}
                        </button>
                    </div>
                </div>
                {/* --- AKHIR BARU --- */}
            </main>
        </div>
    );
}
