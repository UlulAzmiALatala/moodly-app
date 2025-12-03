import React, { useState } from "react";
import { createPortal } from "react-dom"; // 1. Import createPortal
import { Upload, X } from "lucide-react";

// Helper format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function AcceptModal({
    isOpen,
    onClose,
    refund,
    onConfirm,
    isSubmitting,
}) {
    const [adminProof, setAdminProof] = useState(null);

    if (!isOpen || !refund) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!adminProof) {
            alert("Wajib upload bukti transfer!");
            return;
        }
        onConfirm(adminProof);
    };

    // 2. Bungkus return dengan createPortal(..., document.body)
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            {/* Overlay click to close (optional) */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className="text-lg font-bold text-green-700">
                        Setujui & Transfer
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Info Singkat */}
                    <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-2 border border-gray-100">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Customer:</span>
                            <span className="font-medium text-gray-800">
                                {refund.customer?.name}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Rekening:</span>
                            <span className="font-bold text-gray-800 text-right">
                                {refund.nama_bank} - {refund.nomor_rekening}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                            <span className="text-gray-500">Nominal:</span>
                            <span className="font-bold text-lg text-green-600">
                                {formatCurrency(refund.jumlah_refund)}
                            </span>
                        </div>
                    </div>

                    {/* Instruksi */}
                    <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100 leading-relaxed">
                        Silakan transfer sejumlah{" "}
                        <strong>{formatCurrency(refund.jumlah_refund)}</strong>{" "}
                        ke rekening di atas, lalu upload buktinya di bawah ini.
                    </div>

                    {/* Upload Area */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Upload Bukti Transfer (Wajib)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setAdminProof(e.target.files[0])
                                }
                                required
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center justify-center">
                                <div className="p-3 bg-gray-100 rounded-full mb-2 group-hover:bg-white transition">
                                    <Upload
                                        className="text-gray-400 group-hover:text-green-500 transition"
                                        size={24}
                                    />
                                </div>
                                {adminProof ? (
                                    <p className="text-sm text-green-600 font-medium truncate max-w-[200px]">
                                        {adminProof.name}
                                    </p>
                                ) : (
                                    <>
                                        <p className="text-sm text-gray-600 font-medium">
                                            Klik untuk upload bukti
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            JPG, PNG (Max 2MB)
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition disabled:bg-gray-400 flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Memproses...
                                </>
                            ) : (
                                "Selesai & Simpan"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body // Target Portal
    );
}
