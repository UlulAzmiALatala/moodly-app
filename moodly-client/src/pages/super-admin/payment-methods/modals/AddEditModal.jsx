import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import apiClient from "../../../../api/axios";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";

export default function AddEditModal({
    isOpen,
    onClose,
    onSuccess,
    methodToEdit,
}) {
    // Jika tidak open, jangan render apa-apa (hemat resource)
    if (!isOpen) return null;

    const isEditMode = Boolean(methodToEdit);
    const [name, setName] = useState("");
    const [accountDetails, setAccountDetails] = useState("");
    const [status, setStatus] = useState("Aktif");
    const [image, setImage] = useState(null); // File object
    const [imagePreview, setImagePreview] = useState(null); // URL

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Isi form jika mode edit
    useEffect(() => {
        if (isEditMode && methodToEdit) {
            setName(methodToEdit.name);
            setAccountDetails(methodToEdit.account_details || "");
            setStatus(methodToEdit.status);
            setImagePreview(methodToEdit.image_url); // Tampilkan gambar yang ada
        } else {
            // Reset form jika mode Tambah
            setName("");
            setAccountDetails("");
            setStatus("Aktif");
            setImage(null);
            setImagePreview(null);
        }
    }, [isEditMode, methodToEdit]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("account_details", accountDetails);
        formData.append("status", status);

        if (image) {
            formData.append("image", image);
        }

        // Tentukan URL dan method API
        let url = "/api/super-admin/payment-methods";
        // Method POST digunakan untuk kedua kasus, tapi untuk update kita spoofing method PUT
        // karena handling file upload dengan PUT murni terkadang bermasalah di beberapa server setup.

        if (isEditMode) {
            url = `/api/super-admin/payment-methods/${methodToEdit.id}`;
            formData.append("_method", "PUT");
        }

        try {
            await apiClient.post(url, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            onSuccess(); // Refresh data parent
        } catch (err) {
            console.error("Save error:", err);
            let errorMessage = "Gagal menyimpan data.";
            if (err.response?.data?.errors) {
                // Ambil error validasi pertama
                const firstError = Object.values(
                    err.response.data.errors
                )[0][0];
                errorMessage = firstError || errorMessage;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
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
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">
                        {isEditMode
                            ? "Edit Metode Pembayaran"
                            : "Tambah Metode Baru"}
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form
                    onSubmit={handleSubmit}
                    className="flex-grow overflow-y-auto p-6 space-y-5"
                >
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm flex items-start gap-2">
                            <span className="mt-0.5 font-bold">Error:</span>{" "}
                            {error}
                        </div>
                    )}

                    {/* Nama Metode */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-bold text-gray-700 mb-1.5"
                        >
                            Nama Metode <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Contoh: QRIS - BCA"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none text-sm"
                        />
                    </div>

                    {/* Detail Akun */}
                    <div>
                        <label
                            htmlFor="account_details"
                            className="block text-sm font-bold text-gray-700 mb-1.5"
                        >
                            Detail Akun / Nomor Rekening
                        </label>
                        <input
                            type="text"
                            id="account_details"
                            value={accountDetails}
                            onChange={(e) => setAccountDetails(e.target.value)}
                            placeholder="Contoh: 123456789 a/n Moodly"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none text-sm"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label
                            htmlFor="status"
                            className="block text-sm font-bold text-gray-700 mb-1.5"
                        >
                            Status <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none text-sm appearance-none bg-white"
                            >
                                <option value="Aktif">Aktif</option>
                                <option value="Tidak Aktif">Tidak Aktif</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                <svg
                                    className="w-4 h-4 text-gray-500"
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

                    {/* Upload Gambar */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Logo / Gambar QRIS
                        </label>

                        <div className="flex items-start gap-4">
                            {/* Preview Box */}
                            <div className="shrink-0 w-24 h-24 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center relative group">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <ImageIcon className="text-gray-400 w-8 h-8" />
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    ref={fileInputRef}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all text-sm font-medium shadow-sm"
                                >
                                    <Upload size={16} />
                                    {isEditMode
                                        ? "Ganti Gambar"
                                        : "Pilih Gambar"}
                                </button>
                                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                                    Format: JPG, PNG. Maks: 2MB.
                                    <br />
                                    {isEditMode &&
                                        "Biarkan kosong jika tidak ingin mengubah gambar."}
                                </p>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium text-sm disabled:opacity-50"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200 font-bold text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan Data"
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
