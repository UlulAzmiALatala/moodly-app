import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Clock, Loader2, Check } from "lucide-react";

const AddEditModal = ({ isOpen, onClose, onSave, initialData }) => {
    if (!isOpen) return null;

    const isEditMode = Boolean(initialData);

    const [formData, setFormData] = useState({
        durasi_menit: "",
        harga: "",
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Reset atau isi form saat modal dibuka
    useEffect(() => {
        if (isOpen) {
            if (isEditMode && initialData) {
                setFormData({
                    durasi_menit: initialData.durasi_menit,
                    harga: initialData.harga,
                });
            } else {
                setFormData({
                    durasi_menit: "",
                    harga: "",
                });
            }
            setErrors({});
            setLoading(false);
        }
    }, [isOpen, isEditMode, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Validasi sederhana agar hanya angka yang masuk
        if (name === "harga" || name === "durasi_menit") {
            // Hanya izinkan angka
            if (value && !/^\d+$/.test(value)) return;
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Hapus error saat user mengetik
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Validasi Frontend Sederhana
        const newErrors = {};
        if (!formData.durasi_menit)
            newErrors.durasi_menit = ["Durasi waktu wajib diisi."];
        if (!formData.harga) newErrors.harga = ["Harga paket wajib diisi."];

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        // Panggil onSave parent (yang akan handle API call)
        // Kita kirim setErrors sebagai callback agar parent bisa melempar error validasi backend ke sini
        await onSave(formData, (serverErrors) => {
            setErrors(serverErrors);
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

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden transform transition-all scale-100">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {isEditMode
                                    ? "Edit Durasi Konseling"
                                    : "Tambah Durasi Baru"}
                            </h3>
                            <p className="text-xs text-gray-500">
                                Atur paket waktu dan harga.
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Input Durasi */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                            Durasi Waktu (Menit){" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="durasi_menit"
                                value={formData.durasi_menit}
                                onChange={handleChange}
                                className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm font-medium text-gray-900"
                                placeholder="Contoh: 60"
                                autoComplete="off"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-400 text-xs font-bold">
                                    Min
                                </span>
                            </div>
                        </div>
                        {errors.durasi_menit && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.durasi_menit[0]}
                            </p>
                        )}
                    </div>

                    {/* Input Harga */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
                            Harga Paket (Rp){" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-sm font-bold">
                                    Rp
                                </span>
                            </div>
                            <input
                                type="text"
                                name="harga"
                                value={formData.harga}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-sm font-medium text-gray-900"
                                placeholder="Contoh: 150000"
                                autoComplete="off"
                            />
                        </div>
                        {errors.harga && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.harga[0]}
                            </p>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span>Simpan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default AddEditModal;
