import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import apiClient from "../../../../api/axios";
import {
    ChevronLeft,
    Calendar,
    Clock,
    Video,
    Phone,
    MessageCircle,
    User,
    FileText,
    AlertTriangle,
    RefreshCw,
    ArrowLeft,
    Banknote,
} from "lucide-react";

// --- HELPER FORMAT ---
function formatDate(dateString) {
    try {
        const options = { day: "2-digit", month: "2-digit", year: "numeric" };
        return new Date(dateString)
            .toLocaleDateString("id-ID", options)
            .replace(/\//g, " - ");
    } catch (e) {
        return dateString;
    }
}

const formatTimeRange = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes)
        return startTime ? startTime.substring(0, 5) : "...";
    try {
        const start = startTime.substring(0, 5);
        const minutes = parseInt(String(durationMinutes).split(" ")[0]);
        if (isNaN(minutes)) return start;
        const [h, m] = start.split(":").map(Number);
        const end = new Date();
        end.setHours(h, m + mins);
        return `${start} - ${String(end.getHours()).padStart(2, "0")}:${String(
            end.getMinutes()
        ).padStart(2, "0")}`;
    } catch (e) {
        return startTime.substring(0, 5);
    }
};

const formatCurrency = (amount) => {
    if (amount == null) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(amount));
};

// --- KOMPONEN UI ---
const MobileLayout = ({ children }) => (
    <div className="flex justify-center min-h-screen bg-gray-50 font-sans">
        <div className="w-full max-w-md min-h-screen bg-gray-50 flex flex-col relative shadow-xl">
            {children}
        </div>
    </div>
);

const PageHeader = ({ title, onBack }) => (
    <div className="sticky top-0 z-30 flex items-center p-4 bg-white border-b border-gray-200 shadow-sm">
        <button
            onClick={onBack}
            className="p-1 -ml-1 text-gray-600 hover:bg-gray-100 rounded-full transition"
        >
            <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-center text-gray-800 flex-grow tracking-tight">
            {title}
        </h1>
        <div className="w-6"></div>
    </div>
);

const LoadingSpinner = () => (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-cyan-500 rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold text-gray-500">Memuat Data...</p>
    </div>
);

const MethodIcon = ({ method }) => {
    switch (method) {
        case "Video Call":
            return <Video className="w-4 h-4 text-gray-400" />;
        case "Voice Call":
            return <Phone className="w-4 h-4 text-gray-400" />;
        case "Chat":
            return <MessageCircle className="w-4 h-4 text-gray-400" />;
        default:
            return <User className="w-4 h-4 text-gray-400" />;
    }
};

// --- HALAMAN UTAMA ---
export default function CancelDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookingData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/api/history/${id}`);
                setBookingData(response.data);
            } catch (err) {
                console.error("Gagal mengambil data booking:", err);
                setError("Gagal memuat data.");
            } finally {
                setLoading(false);
            }
        };
        fetchBookingData();
    }, [id]);

    if (loading)
        return (
            <MobileLayout>
                <LoadingSpinner />
            </MobileLayout>
        );

    if (error || !bookingData) {
        return (
            <MobileLayout>
                <PageHeader title="Error" onBack={() => navigate(-1)} />
                <div className="p-8 flex flex-col items-center justify-center h-[80vh] text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="text-red-500 w-8 h-8" />
                    </div>
                    <p className="text-gray-800 font-bold text-lg mb-2">
                        Data Tidak Ditemukan
                    </p>
                    <p className="text-gray-500 text-sm mb-6">
                        {error || "Sesi tidak tersedia."}
                    </p>
                    <button
                        onClick={() => navigate("/history")}
                        className="px-6 py-2 bg-gray-800 text-white rounded-full text-sm font-bold"
                    >
                        Kembali ke Riwayat
                    </button>
                </div>
            </MobileLayout>
        );
    }

    // Ekstrak data
    const konselor = bookingData.konselor || {};
    const formattedTime = formatTimeRange(
        bookingData.jam_konsultasi,
        bookingData.durasi_konseling?.durasi_menit
    );
    const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        konselor.name || "K"
    )}&background=EBF4FF&color=3B82F6&bold=true`;
    const cancelledAt = formatDate(bookingData.updated_at);
    const statusColor = "text-red-500";

    return (
        <MobileLayout>
            <PageHeader
                title="Detail Pembatalan"
                onBack={() => navigate("/history")}
            />

            {/* --- PERBAIKAN: pb-48 (Padding Bottom Besar) agar konten tidak tertutup tombol sticky --- */}
            <div className="flex-1 overflow-y-auto p-4 pb-48">
                {/* 1. Kartu Info Psikolog */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4">
                    <div className="flex items-center space-x-3 mb-4">
                        <img
                            src={konselor.avatar || avatarFallback}
                            alt={konselor.name}
                            className="w-16 h-16 rounded-full object-cover border border-gray-100"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = avatarFallback;
                            }}
                        />
                        <div>
                            <h2 className="font-bold text-gray-900 text-base">
                                {konselor.name}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {bookingData.jenis_konseling?.jenis_konseling ||
                                    "Konseling"}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center space-x-1.5">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>
                                {formatDate(bookingData.tanggal_konsultasi)}
                            </span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{formattedTime}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                            <MethodIcon
                                method={bookingData.metode_konsultasi}
                            />
                            <span className="text-cyan-600 font-semibold">
                                {bookingData.metode_konsultasi}
                            </span>
                        </div>
                    </div>

                    <div className="text-center border-t border-dashed border-gray-200 pt-3">
                        <span
                            className={`font-bold text-sm ${statusColor} uppercase tracking-wide`}
                        >
                            {bookingData.status_pesanan}
                        </span>
                    </div>
                </div>

                {/* 2. Kartu Ringkasan Refund */}
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-2 px-1 flex items-center gap-2">
                        <Banknote size={16} className="text-gray-500" />{" "}
                        Ringkasan Refund
                    </h3>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                                Total Pembayaran
                            </span>
                            <span className="font-medium text-gray-900">
                                {formatCurrency(bookingData.total_harga)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                                Potongan Admin (20%)
                            </span>
                            <span className="font-medium text-red-500">
                                - {formatCurrency(bookingData.admin_fee)}
                            </span>
                        </div>
                        <hr className="border-dashed border-gray-200" />
                        <div className="flex justify-between text-base">
                            <span className="font-bold text-gray-900">
                                Jumlah Dikembalikan
                            </span>
                            <span className="font-bold text-green-600">
                                {formatCurrency(bookingData.refund_amount)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 3. Kartu Alasan Pembatalan */}
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-2 px-1 flex items-center gap-2">
                        <FileText size={16} className="text-gray-500" /> Alasan
                        Pembatalan
                    </h3>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {bookingData.alasan_pembatalan ||
                                "Tidak ada alasan."}
                        </p>
                        <div className="flex items-center space-x-1.5 text-gray-400 mt-3 pt-3 border-t border-gray-100">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">
                                Dibatalkan pada {cancelledAt}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. Kartu Catatan */}
                {bookingData.catatan_pembatalan && (
                    <div className="mb-4">
                        {" "}
                        {/* Tambah margin bottom juga di sini */}
                        <h3 className="text-sm font-bold text-gray-800 mb-2 px-1">
                            Catatan
                        </h3>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-600 italic">
                                "{bookingData.catatan_pembatalan}"
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* --- FOOTER ACTIONS --- */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-20 space-y-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {/* Tombol Reschedule */}
                <Link
                    to={`/booking/counselor/${konselor.id}`}
                    state={{
                        from: "reschedule",
                        cancelledBookingId: bookingData.id,
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-cyan-600 text-white font-bold rounded-xl shadow-md hover:bg-cyan-700 active:scale-[0.98] transition-all"
                >
                    <RefreshCw size={18} />
                    <span>Jadwalkan Ulang Sesi</span>
                </Link>

                {/* Tombol Kembali */}
                <Link
                    to="/history"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all"
                >
                    <ArrowLeft size={18} />
                    <span>Kembali ke Riwayat</span>
                </Link>
            </div>
        </MobileLayout>
    );
}
