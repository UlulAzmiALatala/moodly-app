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
    Mail,
    Home,
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

const CustomerDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast(); // Hook Toast

    // State Data
    const [customer, setCustomer] = useState(null);
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
        const fetchCustomer = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(
                    `/api/super-admin/customer-management/${id}`
                );
                setCustomer(response.data);
            } catch (err) {
                setError("Gagal memuat detail customer.");
                console.error(err);
                addToast("Gagal memuat data customer.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchCustomer();
    }, [id]);

    // --- Handlers Edit ---
    const handleEditClick = () => {
        setFormData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            gender: customer.gender,
            dob: customer.dob,
            city: customer.city,
            // Pecah Alamat untuk Edit
            street_address: customer.street_address,
            district: customer.district,
            province: customer.province,
            postal_code: customer.postal_code,
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
                `/api/super-admin/customer-management/${id}`,
                submitData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            setCustomer(response.data); // Update state dengan data baru
            setIsEditing(false);
            addToast("Profil customer berhasil diperbarui.", "success");
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
    if (!customer)
        return (
            <div className="p-10 text-center">Customer tidak ditemukan.</div>
        );

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
                        {isEditing ? "Edit Customer" : "Profil Customer"}
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
                                customer.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    customer.name
                                )}&background=ECFEFF&color=0891b2&size=128&bold=true` // Cyan style avatar
                            }
                            alt={customer.name}
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
                            {customer.name}
                        </h2>
                        <p className="text-gray-500 font-medium mb-3 flex items-center justify-center md:justify-start gap-2">
                            <Mail size={16} /> {customer.email}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <StatusBadge status={customer.status} />
                            <span className="text-xs text-gray-400 font-mono px-2 py-1 bg-gray-50 rounded border border-gray-100">
                                ID: #{customer.id}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Detail Grid */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <h3 className="md:col-span-2 text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-2 flex items-center gap-2">
                            <User size={20} className="text-cyan-600" />{" "}
                            Informasi Pribadi
                        </h3>

                        <DetailField
                            label="Nama Lengkap"
                            name="name"
                            value={isEditing ? formData.name : customer.name}
                            isEditing={isEditing}
                            onChange={handleInputChange}
                        />

                        <DetailField
                            label="Nomor Telepon"
                            name="phone"
                            type="tel"
                            value={isEditing ? formData.phone : customer.phone}
                            isEditing={isEditing}
                            onChange={handleInputChange}
                        />

                        <DetailField
                            label="Jenis Kelamin"
                            name="gender"
                            value={
                                isEditing ? formData.gender : customer.gender
                            }
                            isEditing={isEditing}
                            onChange={handleInputChange}
                            options={["Laki-laki", "Perempuan"]}
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
                                    : formatDate(customer.dob)
                            }
                            isEditing={isEditing}
                            onChange={handleInputChange}
                        />

                        <div className="md:col-span-2 mt-4">
                            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                                <MapPin size={20} className="text-red-500" />{" "}
                                Alamat & Lokasi
                            </h3>
                        </div>

                        {/* Kota */}
                        <DetailField
                            label="Kota"
                            name="city"
                            value={isEditing ? formData.city : customer.city}
                            isEditing={isEditing}
                            onChange={handleInputChange}
                        />

                        {/* Alamat Lengkap (Gabungan) / Form Pecahan */}
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-500 mb-1 block">
                                Alamat Lengkap
                            </label>

                            {isEditing ? (
                                // Mode Edit: Form Terpisah
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                                            Jalan / Gedung
                                        </label>
                                        <textarea
                                            name="street_address"
                                            value={
                                                formData.street_address || ""
                                            }
                                            onChange={handleInputChange}
                                            rows={2}
                                            className="w-full px-4 py-2 bg-white border border-cyan-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-cyan-500 outline-none shadow-sm resize-none"
                                            placeholder="Contoh: Jl. Mawar No. 12"
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                                            Kecamatan
                                        </label>
                                        <input
                                            type="text"
                                            name="district"
                                            value={formData.district || ""}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-white border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                                            Provinsi
                                        </label>
                                        <input
                                            type="text"
                                            name="province"
                                            value={formData.province || ""}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-white border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                                            Kode Pos
                                        </label>
                                        <input
                                            type="text"
                                            name="postal_code"
                                            value={formData.postal_code || ""}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-white border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                                        />
                                    </div>
                                </div>
                            ) : (
                                // Mode Baca: Tampilkan Gabungan
                                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 min-h-[42px] flex items-center gap-2">
                                    <Home
                                        size={16}
                                        className="text-gray-400 shrink-0"
                                    />
                                    <span>
                                        {customer.street_address
                                            ? `${customer.street_address}, ${
                                                  customer.district || ""
                                              }, ${customer.city || ""}, ${
                                                  customer.province || ""
                                              } ${customer.postal_code || ""}`
                                            : "-"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailPage;
