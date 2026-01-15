import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeft,
    HelpCircle,
    Phone,
    Clock,
    Calendar,
    Award,
    MapPin,
    AlertCircle,
    FileText,
    ShieldCheck,
} from "lucide-react";

// --- Helper Format Mata Uang ---
const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// --- Helper Format Tanggal Batas Bayar ---
const getDueDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    date.setHours(date.getHours() + 2); // Tambah 2 jam dari waktu booking
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function PaymentOnlinePage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Ambil data dari state navigasi
    const { booking, displayData } = location.state || {};

    const [isPhoneConfirmed, setIsPhoneConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [isExpired, setIsExpired] = useState(false);

    // --- LOGIKA TIMER MUNDUR (2 JAM) ---
    useEffect(() => {
        if (!booking?.created_at) return;
        const bookingTime = new Date(booking.created_at).getTime();
        const expirationTime = bookingTime + 2 * 60 * 60 * 1000; // +2 Jam

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = expirationTime - now;

            if (distance < 0) {
                clearInterval(interval);
                setIsExpired(true);
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            } else {
                const hours = Math.floor(
                    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                const minutes = Math.floor(
                    (distance % (1000 * 60 * 60)) / (1000 * 60)
                );
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft({ hours, minutes, seconds });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [booking?.created_at]);

    // Handle Callback jika user baru saja mengubah nomor telepon
    useEffect(() => {
        if (location.state?.phoneUpdated) {
            setIsPhoneConfirmed(true);
            // Bersihkan state agar tidak loop
            const { phoneUpdated, ...restState } = location.state;
            navigate(location.pathname, { state: restState, replace: true });
        }
    }, [location.state, navigate]);

    // Validasi Data
    if (!booking) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-50">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <AlertCircle className="w-12 h-12 text-red-400 mb-4 mx-auto" />
                    <h2 className="text-lg font-bold text-gray-800">
                        Data Tidak Ditemukan
                    </h2>
                    <p className="text-gray-500 text-sm mt-2 mb-6">
                        Sepertinya Anda mengakses halaman ini secara langsung.
                    </p>
                    <button
                        onClick={() => navigate("/booking")}
                        className="w-full px-6 py-3 bg-cyan-500 text-white rounded-xl font-bold text-sm hover:bg-cyan-600 transition"
                    >
                        Kembali ke Booking
                    </button>
                </div>
            </div>
        );
    }

    // --- DESTRUCTURE DATA DINAMIS ---
    const {
        id: orderId,
        total_harga: totalPayment,
        created_at: bookingDateString,
        customer,
        konselor,
    } = booking;

    // Prioritas Data: Data Relasi (Backend) -> Data Display (Frontend State) -> Default
    const counselorName =
        konselor?.name || displayData?.counselorName || "Konselor";
    const counselorAvatar = konselor?.avatar || displayData?.counselorImage;

    // Data Dinamis Tambahan
    const counselorUni =
        konselor?.universitas ||
        displayData?.counselorUniversity ||
        "Universitas Tidak Diketahui";
    const counselorSpec = konselor?.spesialisasi
        ? Array.isArray(konselor.spesialisasi)
            ? konselor.spesialisasi.join(", ")
            : konselor.spesialisasi
        : displayData?.counselorSpecialty || "Umum";
    const counselorLicense =
        konselor?.surat_izin_praktik || "SIP Tidak Tersedia";

    const userPhoneNumber = customer?.phone || "Nomor tidak tersedia";
    const paymentDueDate = getDueDate(bookingDateString);

    const handleChangePhoneNumber = () => {
        navigate("/profile/change-phone", {
            state: {
                ...location.state,
                currentPhoneNumber: userPhoneNumber,
                from: location.pathname,
            },
        });
    };

    const handleContinueToPayment = async () => {
        if (!isPhoneConfirmed && !location.state?.phoneUpdated) {
            return alert(
                "Mohon konfirmasi nomor telepon Anda terlebih dahulu."
            );
        }
        if (isExpired)
            return alert("Waktu pembayaran habis. Silakan buat pesanan ulang.");

        setIsSubmitting(true);
        try {
            // Arahkan ke Halaman QRIS
            navigate(`/booking/payment/qris/${orderId}`, {
                state: { booking },
            });
        } catch (err) {
            console.error(err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#F8FAFC] min-h-screen pb-36 font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden">
            {/* Dekorasi Background */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-cyan-500 to-[#F8FAFC] z-0"></div>

            {/* --- HEADER --- */}
            <header className="p-4 flex items-center gap-3 sticky top-0 z-20">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full hover:bg-white/20 transition text-white"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-white tracking-wide">
                    Detail Pembayaran
                </h1>
            </header>

            <main className="p-5 space-y-5 relative z-10">
                {/* --- TIMER KAPSUL --- */}
                <div className="bg-white rounded-2xl p-4 shadow-lg shadow-cyan-500/20 border border-white/50 backdrop-blur-sm relative overflow-hidden">
                    <div className="flex justify-between items-center relative z-10">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                Sisa Waktu Bayar
                            </p>
                            {isExpired ? (
                                <span className="font-bold text-red-500 flex items-center gap-1">
                                    <AlertCircle size={16} /> Waktu Habis
                                </span>
                            ) : (
                                <div className="flex items-baseline gap-1 text-2xl font-mono font-extrabold text-cyan-600">
                                    <span>
                                        {String(timeLeft.hours).padStart(
                                            2,
                                            "0"
                                        )}
                                    </span>
                                    <span className="text-sm text-gray-300">
                                        :
                                    </span>
                                    <span>
                                        {String(timeLeft.minutes).padStart(
                                            2,
                                            "0"
                                        )}
                                    </span>
                                    <span className="text-sm text-gray-300">
                                        :
                                    </span>
                                    <span>
                                        {String(timeLeft.seconds).padStart(
                                            2,
                                            "0"
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="w-12 h-12 bg-cyan-50 rounded-full flex items-center justify-center text-cyan-500">
                            <Clock size={24} />
                        </div>
                    </div>
                </div>

                {/* --- CARD INFO BOOKING --- */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-4">
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">
                                Order ID
                            </p>
                            <p className="text-sm font-mono font-bold text-gray-800">
                                #{String(orderId).padStart(6, "0")}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">
                                Batas Bayar
                            </p>
                            <p className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg inline-block">
                                {paymentDueDate} WIB
                            </p>
                        </div>
                    </div>

                    {/* Profil Konselor Dinamis */}
                    <div className="flex gap-4 items-start mb-5">
                        <img
                            src={
                                counselorAvatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    counselorName
                                )}&background=EBF4FF&color=0891b2&bold=true`
                            }
                            alt={counselorName}
                            className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-base truncate leading-tight">
                                {counselorName}
                            </h3>

                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1.5">
                                <Award
                                    size={12}
                                    className="text-orange-400 flex-shrink-0"
                                />
                                <span className="truncate font-medium">
                                    {counselorSpec}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                                <MapPin size={12} className="flex-shrink-0" />
                                <span className="truncate">{counselorUni}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                                <FileText size={12} className="flex-shrink-0" />
                                <span className="truncate">
                                    SIP: {counselorLicense}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Detail Jadwal */}
                    <div className="bg-gray-50/80 rounded-2xl p-4 space-y-3 border border-gray-100">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 flex items-center gap-2 text-xs font-medium">
                                <Calendar size={14} /> Tanggal
                            </span>
                            <span className="font-bold text-gray-700 text-xs">
                                {displayData?.scheduleDateDisplay}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 flex items-center gap-2 text-xs font-medium">
                                <Clock size={14} /> Jam
                            </span>
                            <span className="font-bold text-gray-700 text-xs">
                                {displayData?.scheduleTime} WIB
                            </span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-gray-500 flex items-center gap-2 text-xs font-medium">
                                <Phone size={14} /> Metode
                            </span>
                            <span className="font-bold text-cyan-700 bg-cyan-100 px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wide">
                                {displayData?.method}
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- KONFIRMASI NO HP --- */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-green-500" />{" "}
                        Konfirmasi Nomor
                    </h4>
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 shadow-sm">
                                <Phone size={14} />
                            </div>
                            <span className="font-bold text-gray-800 text-sm">
                                {userPhoneNumber}
                            </span>
                        </div>

                        {!isPhoneConfirmed ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleChangePhoneNumber}
                                    className="text-xs font-bold text-gray-400 hover:text-gray-600 underline px-2"
                                >
                                    Ubah
                                </button>
                                <button
                                    onClick={() => setIsPhoneConfirmed(true)}
                                    className="text-xs font-bold text-white bg-green-500 px-3 py-1.5 rounded-lg hover:bg-green-600 transition shadow-sm shadow-green-200"
                                >
                                    Benar
                                </button>
                            </div>
                        ) : (
                            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg flex items-center gap-1 border border-green-200">
                                Terkonfirmasi
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 leading-relaxed italic">
                        *Pastikan nomor aktif untuk notifikasi darurat.
                    </p>
                </div>

                {/* --- RINCIAN BIAYA --- */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3">
                    <h4 className="font-bold text-gray-800 text-sm mb-1">
                        Rincian Pembayaran
                    </h4>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Sesi ({displayData?.durationText} mnt)</span>
                        <span>
                            {formatCurrency(displayData?.consultationFee)}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Biaya Layanan</span>
                        <span>{formatCurrency(displayData?.serviceFee)}</span>
                    </div>
                    <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center mt-2">
                        <span className="font-bold text-gray-900 text-sm">
                            Total Tagihan
                        </span>
                        <span className="font-extrabold text-lg text-cyan-600">
                            {formatCurrency(totalPayment)}
                        </span>
                    </div>
                </div>

                {/* --- FOOTER LINKS --- */}
                <div className="text-center space-y-4 pt-2">
                    <p className="text-[10px] text-gray-400 px-6 leading-relaxed">
                        Dengan melanjutkan, saya menyetujui{" "}
                        <Link
                            to="/privacy-policy"
                            className="text-cyan-600 font-bold hover:underline"
                        >
                            Peraturan Konseling
                        </Link>{" "}
                        yang berlaku di Moodly.
                    </p>
                    <Link
                        to="/help/chat-admin"
                        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-cyan-600 transition bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-200 hover:shadow-md"
                    >
                        <HelpCircle size={14} /> Butuh Bantuan?
                    </Link>
                </div>
            </main>

            {/* --- FLOATING ACTION BUTTON --- */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30 rounded-t-3xl">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Total Bayar
                        </span>
                        <span className="text-xl font-extrabold text-gray-900 leading-tight">
                            {formatCurrency(totalPayment)}
                        </span>
                    </div>
                    <button
                        onClick={handleContinueToPayment}
                        disabled={
                            isSubmitting || isExpired || !isPhoneConfirmed
                        }
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-cyan-200 hover:shadow-cyan-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm"
                    >
                        {isSubmitting ? "Memproses..." : "Bayar Sekarang"}
                    </button>
                </div>
            </div>
        </div>
    );
}
