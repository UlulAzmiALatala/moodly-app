import React from "react";
import { createPortal } from "react-dom";
import { Trash2, AlertTriangle, X } from "lucide-react";

const DeleteModal = ({
    isOpen,
    onClose,
    onConfirm,
    bookingId,
    isSubmitting = false, // Default false jika parent tidak mengirim props ini
}) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
            {/* Overlay click to close */}
            <div
                className="absolute inset-0"
                onClick={!isSubmitting ? onClose : undefined}
            ></div>

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative z-10 transform transition-all scale-100">
                {/* Tombol Close Pojok Kanan */}
                <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                    <X size={20} />
                </button>

                <div className="text-center">
                    {/* 1. Big Trash Icon */}
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-50 mb-6 border-4 border-red-100 animate-in zoom-in duration-300">
                        <Trash2
                            className="h-12 w-12 text-red-600"
                            strokeWidth={2}
                        />
                    </div>

                    {/* 2. Text Content */}
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                        Hapus Pesanan?
                    </h3>

                    <p className="text-gray-500 mb-6">
                        Apakah Anda yakin ingin menghapus data pesanan <br />
                        <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                            #{String(bookingId).padStart(5, "0")}
                        </span>
                        ?
                    </p>

                    {/* Warning Box */}
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-8 text-left flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">
                            <span className="font-bold">Peringatan:</span>{" "}
                            Tindakan ini bersifat permanen. Data yang dihapus
                            tidak dapat dikembalikan lagi.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-5 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200 outline-none disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isSubmitting}
                            className="flex-1 px-5 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all focus:ring-2 focus:ring-red-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Menghapus...</span>
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    <span>Ya, Hapus</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DeleteModal;
