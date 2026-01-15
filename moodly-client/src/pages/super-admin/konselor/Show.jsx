import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios.js";
import { ArrowLeft, Star, Save, X, Edit2, Camera, Loader2 } from "lucide-react";

// 1. Import Hook Toast
import { useToast } from "../../../context/ToastContext";

// --- Komponen Badge Status ---
const StatusBadge = ({ status }) => {
    const styles = {
        Verifikasi: "bg-yellow-100 text-yellow-700 border-yellow-200",
        Terverifikasi: "bg-green-100 text-green-700 border-green-200",
        Ditolak: "bg-orange-100 text-orange-700 border-orange-200",
        Banned: "bg-red-100 text-red-700 font-bold border-red-200",
        Offline: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
        <span
            className={`px-3 py-1 text-xs font-bold rounded-full border ${
                styles[status] || styles.Offline
            }`}
        >
            {status}
        </span>
    );
};

// --- Komponen Input Dinamis (Update: Cyan Style) ---
const DetailField = ({
    label,
    name,
    value,
    isEditing,
    onChange,
    type = "text",
    placeholder,
}) => (
    <div>
        <label className="text-sm font-medium text-gray-500 mb-1 block">
            {label}
        </label>
        {isEditing ? (
            <input
                type={type}
                name={name}
                value={value || ""}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-4 py-2 bg-white border border-cyan-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none shadow-sm"
            />
        ) : (
            <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[42px] flex items-center">
                {value || "-"}
            </div>
        )}
    </div>
);

// --- Helper Format ---
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    } catch (e) {
        return dateString;
    }
};

const formatTime = (timeString) =>
    timeString ? timeString.substring(0, 5) : "";

// --- FORM TAMBAH JADWAL (Update: Cyan Style & Toast) ---
const AddAvailabilityForm = ({ counselorId, onAvailabilityAdded }) => {
    const [tanggal, setTanggal] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [loading, setLoading] = useState(false);
    const today = new Date().toISOString().split("T")[0];

    const { addToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!tanggal || !startTime || !endTime) {
            addToast("Harap lengkapi semua field.", "warning");
            setLoading(false);
            return;
        }

        try {
            const response = await apiClient.post(
                `/api/super-admin/konselor-management/${counselorId}/availabilities`,
                {
                    tanggal_konsultasi: tanggal,
                    start_time: startTime,
                    end_time: endTime,
                }
            );
            onAvailabilityAdded(response.data.availability);
            setTanggal("");
            setStartTime("");
            setEndTime("");
            addToast("Jadwal berhasil ditambahkan.", "success");
        } catch (err) {
            addToast(
                err.response?.data?.message || "Gagal menambahkan jadwal.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 p-5 border border-gray-200 rounded-xl bg-gray-50"
        >
            <h4 className="text-md font-bold text-gray-800 mb-4">
                Tambah Jadwal Baru
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Tanggal
                    </label>
                    <input
                        type="date"
                        value={tanggal}
                        onChange={(e) => setTanggal(e.target.value)}
                        min={today}
                        required
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Mulai
                    </label>
                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Selesai
                    </label>
                    <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                </div>
            </div>
            <button
                type="submit"
                disabled={loading}
                className="mt-4 px-5 py-2.5 bg-cyan-600 text-white text-sm font-bold rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-all w-full md:w-auto shadow-lg shadow-cyan-200"
            >
                {loading ? "Menyimpan..." : "Simpan Jadwal"}
            </button>
        </form>
    );
};

// --- HALAMAN UTAMA ---
const KonselorDetailPage = () => {
    const { id: userId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast(); // Hook Toast

    // State Data Utama
    const [konselor, setKonselor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State Editing
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    // State Tab & Jadwal
    const [activeTab, setActiveTab] = useState("detail");
    const [availabilities, setAvailabilities] = useState([]);
    const [loadingAvailabilities, setLoadingAvailabilities] = useState(false);

    // Fetch Data Konselor
    useEffect(() => {
        const fetchKonselor = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(
                    `/api/super-admin/konselor-management/${userId}`
                );
                setKonselor(response.data);
            } catch (err) {
                setError("Gagal memuat data.");
                addToast("Gagal memuat data konselor.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchKonselor();
    }, [userId]);

    // --- HANDLER EDIT PROFILE ---

    const handleEditClick = () => {
        setFormData({
            name: konselor.name,
            email: konselor.email,
            phone: konselor.phone,
            universitas: konselor.universitas,
            city: konselor.city,
            province: konselor.province,
            street_address: konselor.street_address,
            surat_izin_praktik: konselor.surat_izin_praktik,
            spesialisasi: Array.isArray(konselor.spesialisasi)
                ? konselor.spesialisasi.join(", ")
                : konselor.spesialisasi || "",
        });
        setPreviewAvatar(null);
        setAvatarFile(null);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormData({});
        setPreviewAvatar(null);
        setAvatarFile(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setPreviewAvatar(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const submitData = new FormData();

            Object.keys(formData).forEach((key) => {
                if (key === "spesialisasi") {
                    const specArray = formData[key]
                        .split(",")
                        .map((item) => item.trim())
                        .filter((item) => item !== "");
                    specArray.forEach((item, index) => {
                        submitData.append(`spesialisasi[${index}]`, item);
                    });
                } else if (
                    formData[key] !== null &&
                    formData[key] !== undefined
                ) {
                    submitData.append(key, formData[key]);
                }
            });

            if (avatarFile) {
                submitData.append("avatar", avatarFile);
            }

            submitData.append("_method", "PUT");

            const response = await apiClient.post(
                `/api/super-admin/konselor-management/${userId}`,
                submitData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            setKonselor(response.data);
            setIsEditing(false);
            addToast("Profil berhasil diperbarui!", "success");
        } catch (err) {
            console.error(err);
            addToast(
                err.response?.data?.message || "Gagal menyimpan perubahan.",
                "error"
            );
        } finally {
            setIsSaving(false);
        }
    };

    // --- HANDLER JADWAL ---

    const fetchAvailabilities = async () => {
        setLoadingAvailabilities(true);
        try {
            const response = await apiClient.get(
                `/api/super-admin/konselor-management/${userId}/availabilities`
            );
            const sorted = response.data.sort(
                (a, b) =>
                    new Date(a.tanggal_konsultasi) -
                        new Date(b.tanggal_konsultasi) ||
                    a.start_time.localeCompare(b.start_time)
            );
            setAvailabilities(sorted);
        } catch (err) {
            console.error(err);
            addToast("Gagal memuat jadwal.", "error");
        } finally {
            setLoadingAvailabilities(false);
        }
    };

    useEffect(() => {
        if (activeTab === "jadwal" && availabilities.length === 0)
            fetchAvailabilities();
    }, [activeTab, userId]);

    const handleAvailabilityAdded = (newAv) => {
        setAvailabilities((prev) =>
            [...prev, newAv].sort(
                (a, b) =>
                    new Date(a.tanggal_konsultasi) -
                        new Date(b.tanggal_konsultasi) ||
                    a.start_time.localeCompare(b.start_time)
            )
        );
    };

    const handleDeleteAvailability = async (id) => {
        if (!window.confirm("Hapus jadwal ini?")) return;
        try {
            await apiClient.delete(
                `/api/super-admin/konselor-management/${userId}/availabilities/${id}`
            );
            setAvailabilities((prev) => prev.filter((a) => a.id !== id));
            addToast("Jadwal berhasil dihapus.", "success");
        } catch (err) {
            addToast("Gagal menghapus jadwal.", "error");
        }
    };

    // --- RENDER UTAMA ---

    if (loading)
        return (
            <div className="p-10 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent mb-2"></div>
                <p>Memuat profil...</p>
            </div>
        );
    if (error)
        return <div className="p-10 text-center text-red-500">{error}</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen pb-20">
            {/* Header & Tombol Aksi */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm text-gray-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                        {isEditing ? "Edit Profil Konselor" : "Profil Konselor"}
                    </h1>
                </div>

                <div className="flex gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition flex items-center gap-2"
                            >
                                <X size={16} /> Batal
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl font-bold text-sm hover:bg-cyan-700 transition shadow-lg shadow-cyan-200 flex items-center gap-2 disabled:opacity-70"
                            >
                                {isSaving ? (
                                    <Loader2
                                        className="animate-spin"
                                        size={16}
                                    />
                                ) : (
                                    <Save size={16} />
                                )}
                                Simpan
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleEditClick}
                            className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl font-bold text-sm hover:bg-cyan-700 transition shadow-lg shadow-cyan-200 flex items-center gap-2"
                        >
                            <Edit2 size={16} /> Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* HEADER PROFILE (Avatar & Nama) */}
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-b from-white to-gray-50/50">
                    <div className="relative group">
                        <img
                            src={
                                previewAvatar ||
                                konselor.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    konselor.name
                                )}&background=EBF4FF&color=0891b2&bold=true`
                            }
                            alt={konselor.name}
                            className={`w-32 h-32 rounded-full object-cover border-4 border-white shadow-md ${
                                isEditing ? "opacity-80" : ""
                            }`}
                        />
                        {isEditing && (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Camera className="text-white w-8 h-8" />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
                            {konselor.name}
                        </h2>
                        <p className="text-gray-500 font-medium mb-3">
                            {konselor.email}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <StatusBadge status={konselor.status} />
                            <div className="flex items-center gap-1 px-3 py-1 bg-yellow-50 border border-yellow-100 rounded-full">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-bold text-yellow-700">
                                    {konselor.rating
                                        ? Number(konselor.rating).toFixed(1)
                                        : "0.0"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex border-b border-gray-200 px-8">
                    <button
                        onClick={() => setActiveTab("detail")}
                        className={`py-4 px-2 border-b-2 font-bold text-sm transition-colors mr-6 ${
                            activeTab === "detail"
                                ? "border-cyan-600 text-cyan-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Detail Informasi
                    </button>
                    <button
                        onClick={() => setActiveTab("jadwal")}
                        className={`py-4 px-2 border-b-2 font-bold text-sm transition-colors ${
                            activeTab === "jadwal"
                                ? "border-cyan-600 text-cyan-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Jadwal Ketersediaan
                    </button>
                </div>

                {/* ISI KONTEN */}
                <div className="p-8">
                    {activeTab === "detail" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <h3 className="md:col-span-2 text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-2">
                                Informasi Pribadi
                            </h3>

                            <DetailField
                                label="Nama Lengkap"
                                name="name"
                                value={
                                    isEditing ? formData.name : konselor.name
                                }
                                isEditing={isEditing}
                                onChange={handleInputChange}
                            />
                            <DetailField
                                label="Universitas Asal"
                                name="universitas"
                                value={
                                    isEditing
                                        ? formData.universitas
                                        : konselor.universitas
                                }
                                isEditing={isEditing}
                                onChange={handleInputChange}
                            />
                            <DetailField
                                label="Email"
                                name="email"
                                type="email"
                                value={
                                    isEditing ? formData.email : konselor.email
                                }
                                isEditing={isEditing}
                                onChange={handleInputChange}
                            />
                            <DetailField
                                label="Nomor Telepon"
                                name="phone"
                                value={
                                    isEditing ? formData.phone : konselor.phone
                                }
                                isEditing={isEditing}
                                onChange={handleInputChange}
                            />
                            <DetailField
                                label="Kota"
                                name="city"
                                value={
                                    isEditing ? formData.city : konselor.city
                                }
                                isEditing={isEditing}
                                onChange={handleInputChange}
                            />
                            <DetailField
                                label="Provinsi"
                                name="province"
                                value={
                                    isEditing
                                        ? formData.province
                                        : konselor.province
                                }
                                isEditing={isEditing}
                                onChange={handleInputChange}
                            />

                            <div className="md:col-span-2">
                                <DetailField
                                    label="Alamat Lengkap"
                                    name="street_address"
                                    value={
                                        isEditing
                                            ? formData.street_address
                                            : konselor.street_address
                                    }
                                    isEditing={isEditing}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <DetailField
                                    label="Nomor Surat Izin Praktik"
                                    name="surat_izin_praktik"
                                    value={
                                        isEditing
                                            ? formData.surat_izin_praktik
                                            : konselor.surat_izin_praktik
                                    }
                                    isEditing={isEditing}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Spesialisasi Khusus */}
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-500 mb-1 block">
                                    Spesialisasi
                                </label>
                                {isEditing ? (
                                    <div>
                                        <input
                                            type="text"
                                            name="spesialisasi"
                                            value={formData.spesialisasi}
                                            onChange={handleInputChange}
                                            placeholder="Pisahkan dengan koma (contoh: Depresi, Kecemasan, Remaja)"
                                            className="w-full px-4 py-2 bg-white border border-cyan-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-cyan-500 outline-none shadow-sm"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">
                                            *Pisahkan setiap keahlian dengan
                                            tanda koma (,)
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {Array.isArray(konselor.spesialisasi) &&
                                        konselor.spesialisasi.length > 0 ? (
                                            konselor.spesialisasi.map(
                                                (spec, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-100 rounded-full text-xs font-bold"
                                                    >
                                                        {spec}
                                                    </span>
                                                )
                                            )
                                        ) : (
                                            <span className="text-gray-400">
                                                -
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "jadwal" && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-800">
                                    Jadwal Praktik
                                </h2>
                                {loadingAvailabilities && (
                                    <span className="text-xs text-gray-500 animate-pulse">
                                        Sinkronisasi...
                                    </span>
                                )}
                            </div>

                            {!loadingAvailabilities &&
                                availabilities.length === 0 && (
                                    <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                        <p className="text-gray-400 font-medium">
                                            Belum ada jadwal tersedia.
                                        </p>
                                    </div>
                                )}

                            {availabilities.length > 0 && (
                                <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm mb-8">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                                    Tanggal
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                                    Jam Mulai
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                                    Jam Selesai
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {availabilities.map((av) => (
                                                <tr
                                                    key={av.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                        {formatDate(
                                                            av.tanggal_konsultasi
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                                        {formatTime(
                                                            av.start_time
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                                        {formatTime(
                                                            av.end_time
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteAvailability(
                                                                    av.id
                                                                )
                                                            }
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition font-bold text-xs"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <AddAvailabilityForm
                                counselorId={userId}
                                onAvailabilityAdded={handleAvailabilityAdded}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KonselorDetailPage;
