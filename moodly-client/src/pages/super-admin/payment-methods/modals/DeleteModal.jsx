import React, { useState } from "react";
import { createPortal } from "react-dom";
import apiClient from "../../../../api/axios";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";

export default function DeleteModal({
    isOpen,
    onClose,
    onSuccess,
    methodToDelete,
}) {
    if (!isOpen) return null;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        if (!methodToDelete) return;

        setLoading(true);
        setError(null);

        try {
            await apiClient.delete(
                `/api/super-admin/payment-methods/${methodToDelete.id}`
            );
            onSuccess(); // Refresh data di parent
        } catch (err) {
            console.error("Delete error:", err);
            let errorMessage = "Gagal menghapus data.";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 p-4">
            {/* Overlay Close (Disabled saat loading) */}
            <div
                className="absolute inset-0"
                onClick={!loading ? onClose : undefined}
            ></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden transform transition-all scale-100">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                    <X size={20} />
                </button>

                <div className="p-8 text-center">
                    {/* Big Icon */}
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-50 mb-6 animate-in zoom-in duration-300">
                        <Trash2 className="h-10 w-10 text-red-600" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Hapus Metode Ini?
                    </h3>

                    <p className="text-gray-500 mb-6 leading-relaxed">
                        Apakah Anda yakin ingin menghapus metode pembayaran{" "}
                        <br />
                        <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded mx-1">
                            {methodToDelete?.name}
                        </span>
                        ?
                    </p>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Warning Box */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 text-left flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">
                            <span className="font-bold">Peringatan:</span>{" "}
                            Tindakan ini tidak dapat dibatalkan. Pastikan metode
                            ini tidak sedang digunakan secara aktif.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-5 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors outline-none disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex-1 px-5 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Menghapus...</span>
                                </>
                            ) : (
                                "Ya, Hapus"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
