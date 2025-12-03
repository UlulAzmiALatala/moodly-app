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

// --- Komponen Input Text (Inline Edit) ---
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

// --- Komponen Edit Spesialisasi (Multi-Select) ---
const EditableSpecialization = ({ initialSpecs, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedSpecs, setSelectedSpecs] = useState([]);
    const [loading, setLoading] = useState(false);

    const options = [
        "Depresi",
        "Kecemasan",
        "Stress",
        "Trauma",
        "Hubungan",
        "Karir",
        "Keluarga",
        "Pengembangan Diri",
        "Gangguan Tidur",
        "Adiksi",
        "LGBTQ+",
        "Duka & Kehilangan",
    ];

    useEffect(() => {
        const current = Array.isArray(initialSpecs)
            ? initialSpecs
            : typeof initialSpecs === "string"
            ? initialSpecs.split(", ").filter(Boolean)
            : [];
        setSelectedSpecs(current);
    }, [initialSpecs]);

    const toggleSpec = (spec) => {
        setSelectedSpecs((prev) =>
            prev.includes(spec)
                ? prev.filter((s) => s !== spec)
                : [...prev, spec]
        );
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave(selectedSpecs);
            setIsEditing(false);
        } catch (error) {
            console.error("Gagal menyimpan spesialisasi:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray-700 font-bold">
                    Spesialisasi
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
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {options.map((option) => (
                            <label
                                key={option}
                                className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                    selectedSpecs.includes(option)
                                        ? "bg-cyan-50 border-cyan-200"
                                        : "bg-white border-gray-200 hover:bg-gray-100"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedSpecs.includes(option)}
                                    onChange={() => toggleSpec(option)}
                                    className="h-4 w-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500"
                                />
                                <span className="text-xs font-medium text-gray-700">
                                    {option}
                                </span>
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={loading}
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full bg-white border border-gray-200 rounded-lg p-3 min-h-[46px] flex flex-wrap gap-2">
                    {selectedSpecs.length > 0 ? (
                        selectedSpecs.map((spec, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs font-bold rounded-md border border-cyan-100"
                            >
                                {spec}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-400 text-sm italic">
                            Belum ada spesialisasi dipilih
                        </span>
                    )}
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

export default function CounselorEditProfilePage() {
    const navigate = useNavigate();
    const { user, getUser } = useAuth();
    const fileInputRef = useRef(null);

    const [isUploading, setIsUploading] = useState(false);
    const [avatarError, setAvatarError] = useState(null);

    // Format Data
    const profileData = {
        name: user?.name || "Nama Konselor",
        email: user?.email || "email@konselor.com",
        phone: user?.phone || "Nomor belum diatur",
        location: user?.city
            ? `${user.city}, ${user.province}`
            : "Lokasi belum diatur",
        address: user?.street_address || "Alamat belum diatur",
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
        spesialisasi: user?.spesialisasi || [],
        avatar:
            user?.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || "K"
            )}&background=E0F2FE&color=0EA5E9&bold=true`,
    };

    const handleBack = () => {
        navigate(-1);
    };

    // --- Handlers Update ---
    const handleSaveName = async (newName) => {
        await apiClient.post("/api/counselor/profile/update", {
            name: newName,
        });
        await getUser();
    };

    const handleSaveUniversitas = async (newUniv) => {
        await apiClient.post("/api/counselor/profile/update", {
            universitas: newUniv,
        });
        await getUser();
    };

    const handleSaveSpesialisasi = async (newSpecs) => {
        await apiClient.post("/api/counselor/profile/update", {
            spesialisasi: newSpecs,
        });
        await getUser();
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
            setAvatarError("Gagal mengupload gambar.");
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
                                    user?.name || "K"
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
                        onClick={() =>
                            navigate("/counselor/profile/change-email")
                        }
                    />
                    <MenuItem
                        label="Nomor Telepon"
                        value={profileData.phone}
                        onClick={() =>
                            navigate("/counselor/profile/change-phone")
                        }
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
                    {/* PERBAIKAN LINK: Mengarah ke change-address */}
                    <MenuItem
                        label="Lokasi (Provinsi, Kota, Kecamatan, Kode Pos)"
                        value={profileData.location}
                        valueLines={3}
                        onClick={() =>
                            navigate("/counselor/profile/change-address", {
                                state: { mode: "location" },
                            })
                        }
                    />
                    <MenuItem
                        label="Nama Jalan, Nomor Rumah"
                        value={profileData.address}
                        valueLines={2}
                        onClick={() =>
                            navigate("/counselor/profile/change-address", {
                                state: { mode: "street" },
                            })
                        }
                    />
                </section>

                {/* 4. Data Profesional */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 border-b-2 border-cyan-100 pb-2 mb-5">
                        Data Profesional
                    </h2>

                    {/* Edit Universitas - Inline */}
                    <EditableInputItem
                        label="Universitas Asal"
                        initialValue={profileData.universitas}
                        onSave={handleSaveUniversitas}
                    />

                    {/* SIP - Read Only */}
                    <ReadOnlyItem
                        label="Nomor SIPP / STR"
                        value={profileData.izinPraktik}
                    />

                    {/* Edit Spesialisasi - Multi Checkbox */}
                    <EditableSpecialization
                        initialSpecs={profileData.spesialisasi}
                        onSave={handleSaveSpesialisasi}
                    />
                </section>
            </main>
        </div>
    );
}
