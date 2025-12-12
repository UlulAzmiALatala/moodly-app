import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import apiClient from "../../../api/axios";
import html2canvas from "html2canvas";

// --- CSS Animasi Centang ---
const styles = `
.checkmark-container {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
}
.checkmark-svg {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: block;
  stroke-width: 2;
  stroke: #fff;
  stroke-miterlimit: 10;
  box-shadow: inset 0px 0px 0px #4bb71b;
  animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
}
.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: #4bb71b;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}
.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}
@keyframes stroke { 100% { stroke-dashoffset: 0; } }
@keyframes scale { 0%, 100% { transform: none; } 50% { transform: scale3d(1.1, 1.1, 1); } }
@keyframes fill { 100% { box-shadow: inset 0px 0px 0px 50px #4bb71b; } }
`;

// --- Komponen Layout ---
const MobileLayout = ({ children }) => (
    <div className="flex justify-center min-h-screen bg-[#FFF9F8]">
        <div className="w-full max-w-md min-h-screen bg-[#FFF9F8] flex flex-col">
            {children}
        </div>
    </div>
);

// --- Ikon ---
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

const DownloadIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-white"
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
);

const AlertIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 text-red-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
    </svg>
);

// --- Helper ---
function formatReceiptTimestamp(dateString) {
    if (!dateString) return "-";
    try {
        const options = {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };
        return new Date(dateString)
            .toLocaleDateString("id-ID", options)
            .replace(/\./g, ":");
    } catch (e) {
        return dateString;
    }
}

const formatCurrency = (amount) => {
    if (amount == null) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function TransactionDetailPage() {
    const navigate = useNavigate();
    const { id: bookingId } = useParams();
    const { state } = useLocation();
    const receiptRef = useRef(null);

    const [booking, setBooking] = useState(state?.booking || null);
    const [loading, setLoading] = useState(!state?.booking);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Data jika tidak ada di state (misal dari notifikasi)
    useEffect(() => {
        if (!booking && bookingId) {
            setLoading(true);
            apiClient
                .get(`/api/history/${bookingId}`)
                .then((response) => {
                    setBooking(response.data);
                    setError(null);
                })
                .catch((err) => {
                    console.error("Gagal fetch booking:", err);
                    if (err.response && err.response.status === 404) {
                        setError(
                            "Data transaksi tidak ditemukan atau telah dihapus."
                        );
                    } else {
                        setError(
                            "Gagal memuat detail transaksi. Periksa koneksi Anda."
                        );
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [booking, bookingId]);

    const handleSaveReceipt = async () => {
        if (!receiptRef.current) return;
        setIsSaving(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            const canvas = await html2canvas(receiptRef.current, {
                scale: 3,
                backgroundColor: "#ffffff",
                useCORS: true,
                logging: false,
            });
            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = `Moodly-Receipt-${bookingId}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Gagal simpan:", err);
            alert("Gagal menyimpan nota.");
        } finally {
            setIsSaving(false);
        }
    };

    // --- RENDER ERROR STATE ---
    if (error) {
        return (
            <MobileLayout>
                <div className="flex flex-col flex-1 bg-white relative items-center justify-center p-6 text-center">
                    <AlertIcon />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Oops!
                    </h2>
                    <p className="text-gray-500 mb-8">{error}</p>
                    <button
                        onClick={() => navigate("/history")}
                        className="bg-[#00D1FF] text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-cyan-100 hover:bg-[#00b8e0] transition active:scale-95"
                    >
                        Kembali ke Riwayat
                    </button>
                </div>
            </MobileLayout>
        );
    }

    if (loading) {
        return (
            <MobileLayout>
                <div className="flex flex-col flex-1 bg-[#00D1FF] items-center justify-center text-white">
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-medium animate-pulse">Memuat Nota...</p>
                </div>
            </MobileLayout>
        );
    }

    // Pastikan booking ada sebelum render receipt
    if (!booking) return null;

    const adminFee = 5000;
    const subtotal = booking.total_harga - adminFee;
    const transactionDate = formatReceiptTimestamp(booking.updated_at);
    const transactionId = `PAY-${String(booking.id).padStart(6, "0")}`;

    return (
        <MobileLayout>
            <style>{styles}</style>
            <div className="flex flex-col flex-1 bg-[#00D1FF] relative">
                <header className="w-full p-4 pt-8 flex items-center bg-[#00D1FF] relative z-10">
                    <button
                        onClick={() => navigate("/history")}
                        className="text-white absolute left-4 top-1/2 -translate-y-1/2 mt-2 p-2 hover:bg-white/20 rounded-full transition"
                    >
                        <BackArrowIcon />
                    </button>
                </header>

                <div
                    ref={receiptRef}
                    className="bg-white rounded-3xl mx-4 p-6 mt-4 shadow-xl mb-24 flex flex-col relative z-0 pb-10"
                >
                    <div className="checkmark-container">
                        <svg
                            className="checkmark-svg"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 52 52"
                        >
                            <circle
                                className="checkmark-circle"
                                cx="26"
                                cy="26"
                                r="25"
                                fill="none"
                            />
                            <path
                                className="checkmark-check"
                                fill="none"
                                d="M14.1 27.2l7.1 7.2 16.7-16.8"
                            />
                        </svg>
                    </div>

                    <h2 className="text-lg font-bold text-gray-900 text-center mb-2">
                        Pembayaran Berhasil
                    </h2>
                    <p className="text-center text-gray-500 text-sm mb-6">
                        {transactionDate}
                    </p>

                    <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center mb-6">
                        <span className="text-gray-500 text-sm">
                            ID Transaksi
                        </span>
                        <span className="font-bold text-gray-800">
                            {transactionId}
                        </span>
                    </div>

                    <div className="text-center mb-6">
                        <span className="text-gray-500 text-sm block mb-1">
                            Total Bayar
                        </span>
                        <span className="text-3xl font-bold text-[#00D1FF]">
                            {formatCurrency(booking.total_harga)}
                        </span>
                    </div>

                    <hr className="border-gray-200 my-4 border-dashed" />

                    <div className="mb-4">
                        <h3 className="font-bold text-gray-900 text-sm mb-3">
                            Detail Pembayar
                        </h3>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">Nama</span>
                            <span className="font-medium text-gray-800">
                                {booking.customer?.name || "-"}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Metode</span>
                            <span className="font-medium text-gray-800">
                                Transfer Bank/QRIS
                            </span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-bold text-gray-900 text-sm mb-3">
                            Rincian Biaya
                        </h3>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-500">
                                Subtotal Pesanan
                            </span>
                            <span className="font-medium text-gray-800">
                                {formatCurrency(subtotal)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Biaya Admin</span>
                            <span className="font-medium text-gray-800">
                                {formatCurrency(adminFee)}
                            </span>
                        </div>
                    </div>

                    <div className="text-center text-[10px] text-gray-300 font-medium uppercase tracking-widest mt-auto">
                        Moodly Transaction Receipt
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate("/history")}
                            className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-200 transition active:scale-95"
                        >
                            Tutup
                        </button>
                        <button
                            onClick={handleSaveReceipt}
                            disabled={isSaving}
                            className="flex-[2] bg-[#00D1FF] text-white font-bold py-3 px-4 rounded-xl hover:bg-[#00b8e0] transition shadow-lg shadow-cyan-100 active:scale-95 flex items-center justify-center gap-2 disabled:bg-gray-300"
                        >
                            {isSaving ? (
                                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    <DownloadIcon /> Simpan Galeri
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
