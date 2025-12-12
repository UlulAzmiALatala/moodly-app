import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
    X,
    Upload,
    Image as ImageIcon,
    Loader2,
    Wallet,
    CreditCard,
    Copy,
    Check,
} from "lucide-react";
import apiClient from "../../../../api/axios";

// Helper Format Rupiah
const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount || 0);
};

export default function PaymentModal({ isOpen, onClose, booking, onSuccess }) {
    if (!isOpen || !booking) return null;

    // State
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const fileInputRef = useRef(null);

    // Reset State saat modal dibuka
    useEffect(() => {
        if (isOpen) {
            setFile(null);
            setPreview(null);
            setIsCopied(false);
            setLoading(false);
        }
    }, [isOpen]);

    // Handle File Upload
    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    // Handle Copy Rekening
    const handleCopyRekening = () => {
        const textToCopy = booking.konselor?.account_number || "";
        navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    // Handle Submit
    const handleSubmit = async () => {
        if (!file) return alert("Mohon upload bukti transfer terlebih dahulu.");

        setLoading(true);
        const formData = new FormData();
        formData.append("proof_image", file);

        try {
            await apiClient.post(
                `/api/super-admin/keuangan/${booking.id}/pay`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            onSuccess();
            onClose();
            alert("Pembayaran berhasil dikonfirmasi!");
        } catch (error) {
            console.error(error);
            alert("Gagal mengupload bukti transfer.");
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

            {/* Container Modal */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col relative z-10 max-h-[90vh]">
                {/* --- HEADER (Style AddEditModal) --- */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                            <Wallet size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                Konfirmasi Pembayaran
                            </h3>
                            <p className="text-xs text-gray-500">
                                Booking #{String(booking.id).padStart(5, "0")} •{" "}
                                {booking.konselor?.name}
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

                {/* --- CONTENT SCROLLABLE --- */}
                <div className="flex-grow overflow-y-auto p-6 space-y-5 bg-white">
                    {/* 1. Informasi Tujuan Transfer */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
                            <CreditCard size={14} /> Tujuan Transfer
                        </h4>

                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-xs text-gray-500 mb-0.5">
                                    Bank Tujuan
                                </p>
                                <p className="font-bold text-gray-800 text-sm">
                                    {booking.konselor?.bank_name ||
                                        "Tidak Diketahui"}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 mb-0.5">
                                    Atas Nama
                                </p>
                                <p className="font-bold text-gray-800 text-sm">
                                    {booking.konselor?.account_holder_name ||
                                        booking.konselor?.name}
                                </p>
                            </div>
                        </div>

                        {/* Nomor Rekening dengan Copy Button */}
                        <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between group hover:border-blue-300 transition-colors">
                            <div className="flex-1">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                    Nomor Rekening
                                </p>
                                <p className="text-lg font-mono font-bold text-gray-800 tracking-tight">
                                    {booking.konselor?.account_number || "-"}
                                </p>
                            </div>
                            <button
                                onClick={handleCopyRekening}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-blue-600 relative"
                                title="Salin"
                            >
                                {isCopied ? (
                                    <Check
                                        size={18}
                                        className="text-green-500"
                                    />
                                ) : (
                                    <Copy size={18} />
                                )}
                            </button>
                        </div>

                        {/* Total Nominal */}
                        <div className="mt-3 pt-3 border-t border-gray-200 border-dashed flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase">
                                Total Transfer
                            </span>
                            <span className="text-lg font-extrabold text-blue-600">
                                {formatRupiah(booking.counselor_net)}
                            </span>
                        </div>
                    </div>

                    {/* 2. Upload Bukti (Style AddEditModal) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                            Bukti Transfer{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-4">
                            <div
                                className="shrink-0 w-full h-32 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition overflow-hidden relative group bg-gray-50"
                                onClick={() =>
                                    !loading && fileInputRef.current?.click()
                                }
                            >
                                {preview ? (
                                    <>
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-full h-full object-contain p-2"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <p className="text-white text-xs font-bold flex items-center gap-2">
                                                <Upload size={16} /> Ganti
                                                Gambar
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 border border-gray-200 shadow-sm text-gray-400">
                                            <ImageIcon size={20} />
                                        </div>
                                        <p className="text-xs font-bold text-gray-600">
                                            Klik untuk upload bukti
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            Format: JPG, PNG (Max 2MB)
                                        </p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER (Style AddEditModal) --- */}
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
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !file}
                        className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition text-sm flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                        ) : null}
                        Konfirmasi Bayar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
