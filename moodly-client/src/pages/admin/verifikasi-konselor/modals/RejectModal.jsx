import React, { useState } from "react";
import { createPortal } from "react-dom";
import { XCircle, X, Loader2, AlertTriangle } from "lucide-react";

export default function RejectModal({
    isOpen,
    onClose,
    onConfirm,
    konselorName,
}) {
    if (!isOpen) return null;

    const [loading, setLoading] = useState(false);
    const [reason, setReason] = useState(""); // Alasan wajib diisi

    const handleConfirm = async () => {
        if (!reason.trim()) return;

        setLoading(true);
        try {
            await onConfirm(reason);
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
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                        Tolak Verifikasi?
                    </h3>

                    <p className="text-gray-500 mb-6 leading-relaxed text-sm">
                        Anda akan menolak pendaftaran konselor <br />
                        <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded mx-1">
                            {konselorName}
                        </span>
                        . Status akan berubah menjadi{" "}
                        <span className="font-bold text-red-600">Ditolak</span>.
                    </p>

                    {/* Reason Input */}
                    <div className="text-left mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">
                            Alasan Penolakan{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Contoh: Dokumen STR tidak valid, Foto buram..."
                            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none min-h-[100px] transition-all placeholder:text-gray-400"
                            disabled={loading}
                        ></textarea>
                        {!reason.trim() && (
                            <p className="text-xs text-gray-400 mt-1 ml-1 italic">
                                Wajib diisi agar konselor tahu alasannya.
                            </p>
                        )}
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
                            onClick={handleConfirm}
                            disabled={loading || !reason.trim()}
                            className="flex-1 px-5 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                "Tolak Verifikasi"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
