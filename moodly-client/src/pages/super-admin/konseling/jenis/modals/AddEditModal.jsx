import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
    X,
    Upload,
    Image as ImageIcon,
    Loader2,
    Tag,
    DollarSign,
} from "lucide-react";

export default function AddEditModal({ isOpen, onClose, onSave, initialData }) {
    if (!isOpen) return null;

    const isEditMode = Boolean(initialData);

    // State Form
    const [formData, setFormData] = useState({
        jenis_konseling: "",
        tipe_layanan: "Online",
        biaya_layanan: "Nominal Tetap",
        nilai: "",
        status: "Aktif",
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    // Inisialisasi Data
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && initialData) {
                setFormData({
                    jenis_konseling: initialData.jenis_konseling || "",
                    tipe_layanan: initialData.tipe_layanan || "Online",
                    biaya_layanan: initialData.biaya_layanan || "Nominal Tetap",
                    nilai: initialData.nilai || "",
                    status: initialData.status || "Aktif",
                });
                // PERBAIKAN DI SINI: Gunakan image_url
                setImagePreview(initialData.image_url || null);
            } else {
                // Reset Form
                setFormData({
                    jenis_konseling: "",
                    tipe_layanan: "Online",
                    biaya_layanan: "Nominal Tetap",
                    nilai: "",
                    status: "Aktif",
                });
                setImagePreview(null);
            }
            setImageFile(null);
            setErrors({});
            setLoading(false);
        }
    }, [isOpen, isEditMode, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        await onSave(formData, imageFile, (validationErrors) => {
            setErrors(validationErrors);
            setLoading(false);
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 p-4">
            {/* Overlay Close */}
            <div
                className="absolute inset-0"
                onClick={!loading ? onClose : undefined}
            ></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col relative z-10 max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                            <Tag size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {isEditMode
                                    ? "Edit Jenis Konseling"
                                    : "Tambah Jenis Baru"}
                            </h3>
                            <p className="text-xs text-gray-500">
                                Atur kategori dan biaya layanan.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Content */}
                <form
                    onSubmit={handleSubmit}
                    className="flex-grow overflow-y-auto p-6 space-y-5 bg-white"
                >
                    {/* Upload Gambar Ikon */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                            Ikon / Gambar
                        </label>
                        <div className="flex items-center gap-4">
                            <div
                                className="shrink-0 w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition overflow-hidden relative group bg-gray-50"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="text-gray-400 w-6 h-6" />
                                )}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Upload className="text-white w-5 h-5" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-2">
                                    Format: PNG, JPG. Maks: 2MB.
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Pilih File
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
                    </div>

                    {/* Input Jenis Konseling */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                            Jenis Konseling{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="jenis_konseling"
                            value={formData.jenis_konseling}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm font-medium text-gray-900 placeholder:text-gray-400"
                            placeholder="Contoh: Konseling Pernikahan"
                        />
                        {errors.jenis_konseling && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.jenis_konseling[0]}
                            </p>
                        )}
                    </div>

                    {/* Row: Tipe & Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                                Tipe Layanan
                            </label>
                            <div className="relative">
                                <select
                                    name="tipe_layanan"
                                    value={formData.tipe_layanan}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm bg-white appearance-none"
                                >
                                    <option value="Online">Online</option>
                                    <option value="Offline">Offline</option>
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
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                                Status
                            </label>
                            <div className="relative">
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm bg-white appearance-none"
                                >
                                    <option value="Aktif">Aktif</option>
                                    <option value="Tidak Aktif">
                                        Tidak Aktif
                                    </option>
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
                        </div>
                    </div>

                    {/* Row: Biaya & Nilai */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
                            <DollarSign size={14} /> Pengaturan Biaya
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                    Jenis Biaya
                                </label>
                                <select
                                    name="biaya_layanan"
                                    value={formData.biaya_layanan}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                                >
                                    <option value="Nominal Tetap">
                                        Nominal Tetap
                                    </option>
                                    <option value="Persentase">
                                        Persentase
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                    Nilai{" "}
                                    {formData.biaya_layanan === "Persentase"
                                        ? "(%)"
                                        : "(Rp)"}
                                </label>
                                <input
                                    type="text"
                                    name="nilai"
                                    value={formData.nilai}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    placeholder={
                                        formData.biaya_layanan === "Persentase"
                                            ? "Contoh: 10"
                                            : "Contoh: 50000"
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition text-sm disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition text-sm flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-70"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                        ) : null}
                        {isEditMode ? "Simpan Perubahan" : "Tambah Jenis"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
