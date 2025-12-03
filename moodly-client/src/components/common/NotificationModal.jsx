import React from "react";

const NotificationModal = ({
    isOpen,
    onClose,
    title,
    message,
    type = "error", // error, success, info, confirm
    onConfirm, // Fungsi yang dijalankan saat tombol "Simpan/Ya" diklik
    confirmText = "Ya",
    cancelText = "Batal",
    isLoading = false, // Untuk loading di tombol
}) => {
    if (!isOpen) return null;

    const isConfirm = type === "confirm";
    const isSuccess = type === "success";
    const isError = type === "error";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn">
            {/* Modal Container */}
            <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-sm p-6 transform transition-all scale-100 animate-scaleIn relative overflow-hidden text-center">
                {/* Tombol Close (X) di pojok kanan atas - Hanya muncul jika BUKAN loading */}
                {!isLoading && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}

                {/* --- IKON --- */}
                <div className="flex justify-center mb-4">
                    {isSuccess && (
                        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-bounce-short">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                    )}
                    {isError && (
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8 text-red-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </div>
                    )}
                    {/* Ikon Konfirmasi (Opsional, bisa dihilangkan agar lebih mirip desain gambar 1) */}
                </div>

                {/* --- KONTEN TEKS --- */}
                <h3
                    className={`text-lg font-bold text-gray-800 mb-2 ${
                        isSuccess ? "mt-2" : ""
                    }`}
                >
                    {title}
                </h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed px-2">
                    {message}
                </p>

                {/* --- TOMBOL AKSI --- */}
                <div className="flex gap-3 justify-center">
                    {/* Mode Konfirmasi (Ada 2 Tombol) */}
                    {isConfirm ? (
                        <>
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-200 transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:bg-gray-400"
                            >
                                {isLoading ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        {/* Ikon Download Kecil */}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                            />
                                        </svg>
                                        {confirmText}
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        /* Mode Standard (Hanya 1 Tombol - Kecuali Success bisa di auto-close) */
                        !isSuccess && (
                            <button
                                onClick={onClose}
                                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-white shadow-md transition-transform active:scale-95 ${
                                    isError
                                        ? "bg-red-500 hover:bg-red-600"
                                        : "bg-cyan-500 hover:bg-cyan-600"
                                }`}
                            >
                                Mengerti
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;
