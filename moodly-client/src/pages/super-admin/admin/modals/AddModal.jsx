import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Upload, Image as ImageIcon, Loader2, UserPlus } from "lucide-react";

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
        password: "",
        password_confirmation: "",
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    // Inisialisasi Data
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && initialData) {
                setFormData({
                    name: initialData.name || "",
                    email: initialData.email || "",
                    phone: initialData.phone || "",
                    city: initialData.city || "",
                    password: "", // Kosongkan saat edit
                    password_confirmation: "",
                });
                setAvatarPreview(initialData.avatar || null);
            } else {
                // Reset Form
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    city: "",
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
        setErrors({});

        // Siapkan Object Data (Kita kirim object biasa, parent yang convert ke FormData atau sebaliknya)
        // Tapi karena parent (Index.jsx) handleSave menggunakan logika FormData looping,
        // kita bisa kirim object flat, tapi file harus terpisah atau digabung.

        // Mari kita kirim object yang siap diolah parent,
        // tapi karena parent `handleSave` di Admin Index.jsx loop key,
        // kita masukkan avatar ke formData object sementara atau kirim terpisah.

        const dataToSubmit = { ...formData };

        // Hapus password jika kosong saat edit
        if (isEditMode && !dataToSubmit.password) {
            delete dataToSubmit.password;
            delete dataToSubmit.password_confirmation;
        }

        if (avatarFile) {
            dataToSubmit.avatar = avatarFile;
        }

        // Panggil onSave dari Parent
        // Parent diharapkan menghandle try-catch dan memanggil setErrors(validationErrors)
        await onSave(dataToSubmit, (validationErrors) => {
            setErrors(validationErrors);
            setLoading(false);
        });

        // Jika sukses, biasanya parent akan menutup modal, jadi loading=false disini opsional
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 p-4">
            {/* Overlay Close */}
            <div
                className="absolute inset-0"
                onClick={!loading ? onClose : undefined}
            ></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col relative z-10 max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-extrabold text-gray-900">
                                {isEditMode
                                    ? "Edit Admin"
                                    : "Tambah Admin Baru"}
                            </h3>
                            <p className="text-sm text-gray-500">
                                Kelola akses administrator.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 bg-gray-50 rounded-full hover:bg-gray-200 transition text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <form
                    onSubmit={handleSubmit}
                    className="flex-grow overflow-y-auto p-8"
                >
                    <div className="space-y-6">
                        {/* Upload Avatar */}
                        <div className="flex items-center gap-6">
                            <div
                                className="shrink-0 w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition overflow-hidden relative group bg-gray-50"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="text-gray-400 w-8 h-8" />
                                )}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Upload className="text-white w-5 h-5" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-gray-700 mb-1">
                                    Foto Profil
                                </h4>
                                <p className="text-xs text-gray-500 mb-3">
                                    Format: JPG, PNG. Maksimal 2MB.
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Pilih Foto
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Nama */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                                    placeholder="Nama Admin"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.name[0]}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                                    placeholder="admin@moodly.com"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.email[0]}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    No. Telepon
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.phone[0]}
                                    </p>
                                )}
                            </div>

                            {/* Kota */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    Kota Domisili
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm"
                                />
                                {errors.city && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.city[0]}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                            <h4 className="text-sm font-bold text-gray-800 mb-3">
                                Keamanan
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                        Password{" "}
                                        {isEditMode && (
                                            <span className="font-normal text-gray-400 normal-case">
                                                (Opsional)
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required={!isEditMode}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none transition text-sm"
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.password[0]}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
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
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 outline-none transition text-sm"
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
                        {isEditMode ? "Simpan Perubahan" : "Tambah Admin"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
