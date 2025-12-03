import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
    X,
    Upload,
    Image as ImageIcon,
    Loader2,
    MapPin,
    Star,
    Check,
} from "lucide-react";

export default function AddEditModal({ isOpen, onClose, onSave, initialData }) {
    if (!isOpen) return null;

    const isEditMode = Boolean(initialData);

    // State Form
    const [formData, setFormData] = useState({
        nama_tempat: "",
        alamat: "",
        status: "Aktif",
        rating: "",
        review_count: "",
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
                    nama_tempat: initialData.nama_tempat || "",
                    alamat: initialData.alamat || "",
                    status: initialData.status || "Aktif",
                    rating: initialData.rating || 0,
                    review_count: initialData.review_count || 0,
                });
                // Gunakan image_url dari accessor backend
                setImagePreview(initialData.image_url || null);
            } else {
                // Reset Form
                setFormData({
                    nama_tempat: "",
                    alamat: "",
                    status: "Aktif",
                    rating: 0,
                    review_count: 0,
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

        // Handle number inputs khusus
        if (name === "rating") {
            // Batasi rating 0-5
            if (value < 0 || value > 5) return;
        }

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

        // Panggil onSave dari Parent
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
                            <MapPin size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {isEditMode
                                    ? "Edit Tempat Konseling"
                                    : "Tambah Tempat Baru"}
                            </h3>
                            <p className="text-xs text-gray-500">
                                Lokasi praktik offline.
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
                    {/* Upload Gambar */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                            Foto Tempat
                        </label>
                        <div className="flex items-center gap-4">
                            <div
                                className="shrink-0 w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition overflow-hidden relative group bg-gray-50"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="text-gray-400 w-8 h-8" />
                                )}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Upload className="text-white w-6 h-6" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-2">
                                    Format: JPG, PNG. Maks: 2MB.
                                </p>
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
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
                    </div>

                    {/* Nama Tempat */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                            Nama Tempat <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nama_tempat"
                            value={formData.nama_tempat}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm font-medium text-gray-900 placeholder:text-gray-400"
                            placeholder="Contoh: Klinik Psikologi Sejahtera"
                        />
                        {errors.nama_tempat && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.nama_tempat[0]}
                            </p>
                        )}
                    </div>

                    {/* Alamat */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                            Alamat Lengkap{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="alamat"
                            value={formData.alamat}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm font-medium text-gray-900 placeholder:text-gray-400 resize-none"
                            placeholder="Jl. Kebahagiaan No. 1, Jakarta Selatan"
                        />
                        {errors.alamat && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.alamat[0]}
                            </p>
                        )}
                    </div>

                    {/* Row: Rating, Reviews, Status */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                Rating (0-5)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="rating"
                                    value={formData.rating}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm pl-8"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                />
                                <Star className="w-3 h-3 text-gray-400 absolute left-3 top-3" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                Jml Ulasan
                            </label>
                            <input
                                type="number"
                                name="review_count"
                                value={formData.review_count}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                Status
                            </label>
                            <div className="relative">
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white appearance-none"
                                >
                                    <option value="Aktif">Aktif</option>
                                    <option value="Tidak Aktif">
                                        Non-Aktif
                                    </option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                    <svg
                                        className="w-3 h-3"
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
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                        {isEditMode ? "Simpan" : "Tambah"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
