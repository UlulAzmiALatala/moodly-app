import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios";
import {
    ArrowLeft,
    Edit2,
    Save,
    X,
    Camera,
    Loader2,
    User,
    MapPin,
    Phone,
    Mail,
    Calendar,
    ShieldCheck,
} from "lucide-react";

// 1. Import Hook Toast
import { useToast } from "../../../context/ToastContext";

// --- Komponen Badge Status ---
const StatusBadge = ({ status }) => {
    const styles = {
        Active: "bg-green-100 text-green-700 border-green-200",
        Online: "bg-green-100 text-green-700 border-green-200",
        Offline: "bg-gray-100 text-gray-600 border-gray-200",
        Banned: "bg-red-100 text-red-700 font-bold border-red-200",
        Verifikasi: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
    return (
        <span
            className={`px-3 py-1 text-xs font-bold rounded-full border ${
                styles[status] || styles.Offline
            }`}
        >
            {status || "Offline"}
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
    options = null,
}) => (
    <div>
        <label className="text-sm font-medium text-gray-500 mb-1 block">
            {label}
        </label>
        {isEditing ? (
            options ? (
                <div className="relative">
                    <select
                        name={name}
                        value={value || ""}
                        onChange={onChange}
                        className="w-full px-4 py-2 bg-white border border-cyan-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none shadow-sm appearance-none"
                    >
                        <option value="" disabled>
                            Pilih {label}
                        </option>
                        {options.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                            ></path>
                        </svg>
                    </div>
                </div>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    className="w-full px-4 py-2 bg-white border border-cyan-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none shadow-sm"
                />
            )
        ) : (
            <div className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[42px] flex items-center">
                {value || "-"}
            </div>
        )}
    </div>
);

// --- Helper Format Tanggal ---
const formatDate = (dateString) => {
    if (!dateString) return "-";
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

const AdminDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast(); // Hook Toast

    // State Data
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State Editing
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({});
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewAvatar, setPreviewAvatar] = useState(null);
    const fileInputRef = useRef(null);

    // Fetch Data
    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(
                    `/api/super-admin/admin-management/${id}`
                );
                setAdmin(response.data);
            } catch (err) {
                setError("Gagal memuat detail admin.");
                console.error(err);
                addToast("Gagal memuat data admin.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchAdmin();
    }, [id]);

    // --- Handlers Edit ---
    const handleEditClick = () => {
        setFormData({
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            city: admin.city,
            gender: admin.gender,
            dob: admin.dob,
            // Password tidak dimasukkan ke state awal agar tidak tertimpa string kosong jika user tidak mau ubah
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

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const submitData = new FormData();

            // Append text fields
            Object.keys(formData).forEach((key) => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    submitData.append(key, formData[key]);
                }
            });

            // Append file
            if (avatarFile) {
                submitData.append("avatar", avatarFile);
            }

            // Method Spoofing PUT
            submitData.append("_method", "PUT");

            const response = await apiClient.post(
                `/api/super-admin/admin-management/${id}`,
                submitData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            setAdmin(response.data);
            setIsEditing(false);
            addToast("Profil admin berhasil diperbarui.", "success");
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

    if (loading)
        return (
            <div className="p-10 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent mb-2"></div>
                <p>Memuat detail...</p>
            </div>
        );
    if (error)
        return <div className="p-10 text-center text-red-500">{error}</div>;
    if (!admin)
        return <div className="p-10 text-center">Admin tidak ditemukan.</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen pb-20">
            {/* Header Navigation */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm text-gray-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                        {isEditing ? "Edit Admin" : "Profil Admin"}
                    </h1>
                </div>

                {/* Action Buttons */}
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
                                onClick={handleSave}
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

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Profile Header Section */}
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-b from-white to-gray-50/50">
                    {/* Avatar Section */}
                    <div className="relative group">
                        <img
                            src={
                                previewAvatar ||
                                admin.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    admin.name
                                )}&background=ECFEFF&color=0891b2&size=128&bold=true`
                            }
                            alt={admin.name}
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

                    {/* Name & Email */}
                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
                            {admin.name}
                        </h2>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-gray-500 font-medium mb-3 justify-center md:justify-start">
                            <span className="flex items-center gap-2">
                                <Mail size={16} /> {admin.email}
                            </span>
                            <span className="hidden md:inline">•</span>
                            <span className="flex items-center gap-2">
                                <ShieldCheck size={16} /> Administrator
                            </span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <StatusBadge status={admin.status} />
                            <span className="text-xs text-gray-400 font-mono px-2 py-1 bg-gray-50 rounded border border-gray-100">
                                ID: #{admin.id}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Detail Grid */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <h3 className="md:col-span-2 text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-2 flex items-center gap-2">
                            <User size={20} className="text-cyan-600" />{" "}
                            Informasi Profil
                        </h3>

                        <DetailField
                            label="Nama Lengkap"
                            name="name"
                            value={isEditing ? formData.name : admin.name}
                            isEditing={isEditing}
                            onChange={handleInputChange}
                        />

                        <DetailField
                            label="Tanggal Lahir"
                            name="dob"
                            type="date"
                            value={
                                isEditing
                                    ? formData.dob
                                    : isEditing
                                    ? ""
                                    : formatDate(admin.dob)
                            }
                            isEditing={isEditing}
                            onChange={handleInputChange}
                        />

                        <DetailField
                            label="Email"
                            name="email"
                            type="email"
                            value={isEditing ? formData.email : admin.email}
                            isEditing={isEditing}
                            onChange={handleInputChange}
                        />

                        <DetailField
                            label="Nomor Telepon"
                            name="phone"
                            type="tel"
                            value={isEditing ? formData.phone : admin.phone}
                            isEditing={isEditing}
                            onChange={handleInputChange}
                        />

                        <DetailField
                            label="Kota Domisili"
                            name="city"
                            value={isEditing ? formData.city : admin.city}
                            isEditing={isEditing}
                            onChange={handleInputChange}
                        />

                        <DetailField
                            label="Jenis Kelamin"
                            name="gender"
                            value={isEditing ? formData.gender : admin.gender}
                            isEditing={isEditing}
                            onChange={handleInputChange}
                            options={["Laki-laki", "Perempuan"]}
                        />

                        <div className="md:col-span-2 mt-4 border-t pt-4">
                            <DetailField
                                label="Tanggal Bergabung"
                                value={formatDate(admin.created_at)}
                                isEditing={false}
                            />
                        </div>

                        {/* Password Change (Hanya Tampil saat Edit) */}
                        {isEditing && (
                            <div className="md:col-span-2 mt-4 border-t border-gray-100 pt-4">
                                <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    Ubah Password{" "}
                                    <span className="text-xs font-normal text-gray-400">
                                        (Opsional)
                                    </span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <DetailField
                                        label="Password Baru"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        isEditing={true}
                                        onChange={handleInputChange}
                                    />
                                    <DetailField
                                        label="Konfirmasi Password"
                                        name="password_confirmation"
                                        type="password"
                                        value={formData.password_confirmation}
                                        isEditing={true}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDetailPage;
