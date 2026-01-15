import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import apiClient from "../../../../api/axios";
import NotificationModal from "../../../../components/common/NotificationModal";

// --- Komponen Layout & Ikon (Tidak Berubah) ---
const MobileLayout = ({ children }) => (
    <div className="flex justify-center min-h-screen bg-[#FFF9F8]">
        <div className="w-full max-w-md min-h-screen bg-[#FFF9F8] flex flex-col">
            {children}
        </div>
    </div>
);

const BackArrowIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
        />
    </svg>
);

const LoadingSpinner = () => (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 border-solid rounded-full animate-spin"></div>
    </div>
);

// --- Helper Format Rupiah ---
const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
};

export default function UploadBuktiPembayaranPage() {
    const navigate = useNavigate();
    const { bookingId } = useParams();
    const location = useLocation();

    // Ambil data booking dari state (dikirim dari halaman sebelumnya)
    const bookingFromState = location.state?.booking;

    const [kodePembayaran, setKodePembayaran] = useState("");
    const [gambar, setGambar] = useState(null);
    const [preview, setPreview] = useState(null);
    const [keterangan, setKeterangan] = useState("");

    const [loading, setLoading] = useState(false);

    // --- STATE MODAL ---
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: "error",
        title: "",
        message: "",
    });

    // --- Inisialisasi Data ---
    useEffect(() => {
        if (bookingId) {
            // Format ID Booking agar terlihat profesional (PAY-000XXX)
            setKodePembayaran(`PAY-${bookingId.toString().padStart(6, "0")}`);
        } else {
            // Jika halaman diakses tanpa ID, kembalikan ke history
            navigate("/history");
        }
    }, [bookingId, navigate]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validasi Ukuran (2MB)
            if (file.size > 2 * 1024 * 1024) {
                setModalState({
                    isOpen: true,
                    type: "error",
                    title: "File Terlalu Besar",
                    message: "Ukuran gambar maksimal adalah 2MB.",
                });
                setGambar(null);
                setPreview(null);
                e.target.value = null;
                return;
            }
            setGambar(file);
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }
    };

    const closeModal = () => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!gambar) {
            setModalState({
                isOpen: true,
                type: "error",
                title: "Gambar Kosong",
                message:
                    "Silakan pilih gambar bukti pembayaran terlebih dahulu.",
            });
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("image", gambar);
        formData.append("keterangan", keterangan);

        try {
            // Panggil API Upload
            const response = await apiClient.post(
                `/api/booking/${bookingId}/upload-proof`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const uploadedBooking = response.data.booking;

            setLoading(false);

            // --- SUKSES: Tampilkan Modal ---
            setModalState({
                isOpen: true,
                type: "success",
                title: "Berhasil Terkirim!",
                message:
                    "Bukti pembayaran Anda sedang diverifikasi oleh sistem.",
            });

            // --- Navigasi Otomatis setelah 2 detik ---
            setTimeout(() => {
                setModalState((prev) => ({ ...prev, isOpen: false }));
                navigate(`/history/loading/${bookingId}`, {
                    state: { booking: uploadedBooking },
                });
            }, 2000);
        } catch (err) {
            setLoading(false);
            console.error("Gagal upload bukti:", err);

            let errorMessage = "Gagal mengirim bukti. Silakan coba lagi.";
            if (err.response?.data?.errors) {
                errorMessage = Object.values(err.response.data.errors)[0][0];
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            setModalState({
                isOpen: true,
                type: "error",
                title: "Gagal Mengirim",
                message: errorMessage,
            });
        }
    };

    return (
        <MobileLayout>
            {loading && <LoadingSpinner />}

            <div className="flex flex-col h-full w-full bg-[#00D1FF] relative">
                {/* Header */}
                <header className="w-full p-4 pt-8 sticky top-0 z-20 bg-[#00D1FF]">
                    <div className="flex items-center gap-4">
                        <button
                            className="text-white hover:bg-white/20 p-1 rounded-full transition"
                            onClick={() => navigate(-1)}
                            aria-label="Kembali"
                        >
                            <BackArrowIcon />
                        </button>
                        <h1 className="text-white font-semibold text-lg">
                            Upload Bukti Pembayaran
                        </h1>
                    </div>
                </header>

                {/* Main Content Card */}
                <div className="flex-1 flex flex-col bg-white rounded-t-[2.5rem] overflow-y-auto shadow-2xl mt-4">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col flex-1 p-6 pt-8 space-y-6"
                    >
                        {/* Info Total Tagihan (Jika Data Ada) */}
                        {bookingFromState && bookingFromState.total_harga && (
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                    Total Tagihan
                                </span>
                                <span className="font-bold text-blue-600 text-lg">
                                    {formatCurrency(
                                        bookingFromState.total_harga
                                    )}
                                </span>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Kode Pembayaran */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                                    Kode Booking
                                </label>
                                <input
                                    type="text"
                                    value={kodePembayaran}
                                    readOnly
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 font-mono font-semibold focus:outline-none"
                                />
                            </div>

                            {/* Upload Gambar Area */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                                    Bukti Transfer{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div
                                    className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-8 bg-gray-50 transition-colors ${
                                        preview
                                            ? "border-cyan-400 bg-cyan-50"
                                            : "border-gray-300 hover:border-cyan-400 hover:bg-gray-100"
                                    }`}
                                >
                                    {preview ? (
                                        <div className="relative group">
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="h-48 object-contain rounded-lg shadow-sm"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg text-white text-sm font-medium pointer-events-none">
                                                Ganti Gambar
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center px-4 pointer-events-none">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-6 w-6"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 text-sm font-medium">
                                                Ketuk untuk upload gambar
                                            </p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                JPG, PNG (Max 2MB)
                                            </p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Keterangan */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                                    Catatan (Opsional)
                                </label>
                                <textarea
                                    value={keterangan}
                                    onChange={(e) =>
                                        setKeterangan(e.target.value)
                                    }
                                    placeholder="Contoh: Transfer dari Rekening BCA a/n Budi"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all resize-none text-sm"
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Spacer agar tombol turun ke bawah */}
                        <div className="flex-grow"></div>

                        {/* Tombol Kirim */}
                        <div className="pt-4 pb-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-200 hover:bg-cyan-600 transition-all active:scale-95 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Mengirim...
                                    </>
                                ) : (
                                    "Kirim Bukti Pembayaran"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* --- MODAL SYSTEM --- */}
            <NotificationModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                type={modalState.type}
                title={modalState.title}
                message={modalState.message}
            />
        </MobileLayout>
    );
}
