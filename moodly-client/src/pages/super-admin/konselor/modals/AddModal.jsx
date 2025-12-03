import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
    X,
    Upload,
    Image as ImageIcon,
    Loader2,
    AlertCircle,
} from "lucide-react";

export default function AddModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    isEditMode,
}) {
    if (!isOpen) return null;

    // State Form
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        city: "",
        province: "",
        street_address: "",
        universitas: "",
        surat_izin_praktik: "",
        spesialisasi: "", // String dipisah koma
        password: "",
        password_confirmation: "",
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Inisialisasi Data saat Modal Dibuka
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && initialData) {
                // Konversi Array Spesialisasi ke String untuk input
                let specString = "";
                try {
                    const specData = initialData.spesialisasi;
                    if (Array.isArray(specData)) {
                        specString = specData.join(", ");
                    } else if (typeof specData === "string") {
                        // Handle jika backend kirim string JSON
                        specString = JSON.parse(specData).join(", ");
                    }
                } catch (e) {
                    specString = "";
                }

                setFormData({
                    name: initialData.name || "",
                    email: initialData.email || "",
                    phone: initialData.phone || "",
                    city: initialData.city || "",
                    province: initialData.province || "",
                    street_address: initialData.street_address || "",
                    universitas: initialData.universitas || "",
                    surat_izin_praktik: initialData.surat_izin_praktik || "",
                    spesialisasi: specString,
                    password: "",
                    password_confirmation: "",
                });
                setAvatarPreview(initialData.avatar || null);
            } else {
                // Reset Form Mode Tambah
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    city: "",
                    province: "",
                    street_address: "",
                    universitas: "",
                    surat_izin_praktik: "",
                    spesialisasi: "",
                    password: "",
                    password_confirmation: "",
                });
                setAvatarPreview(null);
            }
            setAvatarFile(null);
            setErrors({});
            setLoading(false);
        }
    }, [isOpen, initialData, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Hapus error field tersebut jika user mulai mengetik
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({}); // Reset errors sebelum submit

        // Siapkan Object Data Bersih
        const dataToSubmit = { ...formData };

        // Proses Spesialisasi (String -> Array)
        // Backend Laravel mengharapkan array untuk field ini
        // Kita tidak convert di sini, tapi biarkan handleSave di parent yang mengurus FormData array appending
        // Atau kita olah jadi array disini agar parent lebih bersih
        const specArray = formData.spesialisasi
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== "");

        // Kita update dataToSubmit dengan array
        dataToSubmit.spesialisasi = specArray;

        // Hapus password jika kosong saat edit
        if (isEditMode && !dataToSubmit.password) {
            delete dataToSubmit.password;
            delete dataToSubmit.password_confirmation;
        }

        // Masukkan file avatar jika ada
        if (avatarFile) {
            dataToSubmit.avatar = avatarFile;
        }

        // Panggil fungsi dari Parent (Index.jsx)
        // Parent yang akan handle try-catch API dan setErrors
        await onSave(dataToSubmit, (validationErrors) => {
            setErrors(validationErrors);
            setLoading(false);
        });

        // Note: setLoading(false) dipanggil di parent atau callback error
        // Jika sukses, modal ditutup parent, jadi loading state disini dimount
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 p-4">
            <div
                className="absolute inset-0"
                onClick={!loading ? onClose : undefined}
            ></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col relative z-10 max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100">
                    <div>
                        <h3 className="text-xl font-extrabold text-gray-900">
                            {isEditMode
                                ? "Edit Profil Konselor"
                                : "Registrasi Konselor Baru"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Lengkapi informasi profesional di bawah ini.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <form
                    onSubmit={handleSubmit}
                    className="flex-grow overflow-y-auto p-8"
                >
                    <div className="space-y-8">
                        {/* Section 1: Profil & Avatar */}
                        <div className="flex flex-col sm:flex-row gap-6">
                            {/* Upload Avatar */}
                            <div className="shrink-0">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                    Foto Profil
                                </label>
                                <div
                                    className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition overflow-hidden relative group bg-gray-50"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <ImageIcon className="text-gray-400 w-8 h-8 mb-1" />
                                    )}

                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Upload className="text-white w-6 h-6" />
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                {errors.avatar && (
                                    <p className="text-red-500 text-xs mt-1 text-center">
                                        {errors.avatar[0]}
                                    </p>
                                )}
                            </div>

                            {/* Identitas Dasar */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Nama Lengkap{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        placeholder="Nama beserta gelar"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.name[0]}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        Email{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.email[0]}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">
                                        No. Telepon
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.phone[0]}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Profesionalitas */}
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                            <h4 className="text-sm font-bold text-gray-800 uppercase mb-4 flex items-center gap-2">
                                <AlertCircle size={16} /> Detail Profesional
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Universitas Asal
                                    </label>
                                    <input
                                        type="text"
                                        name="universitas"
                                        value={formData.universitas}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        No. SIPP / STR
                                    </label>
                                    <input
                                        type="text"
                                        name="surat_izin_praktik"
                                        value={formData.surat_izin_praktik}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Spesialisasi
                                    </label>
                                    <input
                                        type="text"
                                        name="spesialisasi"
                                        value={formData.spesialisasi}
                                        onChange={handleChange}
                                        placeholder="Contoh: Depresi, Kecemasan, Masalah Keluarga (Pisahkan dengan koma)"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 outline-none text-sm"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        *Pisahkan dengan tanda koma (,)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Lokasi */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Kota Domisili
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Provinsi
                                </label>
                                <input
                                    type="text"
                                    name="province"
                                    value={formData.province}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">
                                    Alamat Lengkap
                                </label>
                                <textarea
                                    name="street_address"
                                    value={formData.street_address}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                                ></textarea>
                            </div>
                        </div>

                        {/* Section 4: Keamanan (Password) */}
                        <div className="border-t border-gray-100 pt-6">
                            <h4 className="text-sm font-bold text-gray-800 mb-4">
                                Keamanan Akun
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password{" "}
                                        {isEditMode && (
                                            <span className="text-gray-400 font-normal text-xs">
                                                (Kosongkan jika tidak ubah)
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required={!isEditMode}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.password[0]}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Konfirmasi Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        required={
                                            !isEditMode || formData.password
                                        }
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition text-sm"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition text-sm flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-70"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                        ) : null}
                        {isEditMode ? "Simpan Perubahan" : "Tambah Konselor"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
