import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";

export default function DeleteModal({ isOpen, onClose, onConfirm, itemName }) {
    if (!isOpen) return null;

    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await onConfirm();
        } catch (e) {
            console.error(e);
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
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-50 mb-6 animate-in zoom-in duration-300 border-4 border-red-100">
                        <Trash2 className="h-10 w-10 text-red-600" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                        Hapus Jenis Konseling?
                    </h3>

                    <p className="text-gray-500 mb-6 leading-relaxed">
                        Apakah Anda yakin ingin menghapus jenis konseling <br />
                        <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded mx-1">
                            {itemName}
                        </span>
                        secara permanen?
                    </p>

                    {/* Warning Box */}
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-8 text-left flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">
                            <span className="font-bold">Peringatan:</span> Data
                            yang dihapus tidak dapat dikembalikan. Pastikan
                            tidak ada transaksi aktif yang menggunakan jenis
                            ini.
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
