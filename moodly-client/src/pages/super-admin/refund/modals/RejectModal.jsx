import React from "react";
import { createPortal } from "react-dom"; // 1. Import createPortal
import { AlertTriangle, X } from "lucide-react";

// Helper format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function RejectModal({
    isOpen,
    onClose,
    refund,
    onConfirm,
    isSubmitting,
}) {
    if (!isOpen || !refund) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm();
    };

    // 2. Bungkus return dengan createPortal
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            {/* Overlay click to close */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className="text-lg font-bold text-red-700">
                        Tolak Pengajuan
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Info Singkat */}
                    <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-2 border border-gray-100">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Customer:</span>
                            <span className="font-medium text-gray-800">
                                {refund.customer?.name}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Nominal:</span>
                            <span className="font-bold text-gray-800">
                                {formatCurrency(refund.jumlah_refund)}
                            </span>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
                        <AlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0" />
                        <p className="text-sm text-red-800 leading-relaxed">
                            Anda yakin ingin menolak pengajuan refund ini?
                            Status akan berubah menjadi <strong>Ditolak</strong>{" "}
                            dan tidak dapat diubah lagi.
                        </p>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex gap-3">
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
                            className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition disabled:bg-gray-400 flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Memproses...
                                </>
                            ) : (
                                "Tolak Pengajuan"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body // Target Portal
    );
}
