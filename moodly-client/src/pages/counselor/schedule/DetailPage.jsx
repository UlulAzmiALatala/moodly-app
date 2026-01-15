import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../api/axios.js";
import {
    AlertCircle,
    CheckCircle2,
    XCircle,
    Calendar,
    Clock,
    Phone,
    Video,
    MessageCircle,
    User,
    ChevronLeft,
    Star,
    Hourglass,
    Info,
} from "lucide-react";

// --- HOOK USE COUNTDOWN ---
const useCountdown = (targetDate, targetTime) => {
    const targetDateTime = useMemo(() => {
        if (!targetDate || !targetTime) return new Date();
        return new Date(`${targetDate}T${targetTime}`);
    }, [targetDate, targetTime]);

    const [now, setNow] = useState(new Date());
    const timeRemaining = useMemo(
        () => targetDateTime - now,
        [targetDateTime, now]
    );

    useEffect(() => {
        if (timeRemaining <= 0) return;
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, [timeRemaining]);

    if (timeRemaining <= 0)
        return { isReady: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
        isReady: false,
        days: Math.floor(timeRemaining / (1000 * 60 * 60 * 24)),
        hours: Math.floor((timeRemaining / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((timeRemaining / 1000 / 60) % 60),
        seconds: Math.floor((timeRemaining / 1000) % 60),
    };
};

// --- KOMPONEN UI ---

const CountdownDisplay = ({ days, hours, minutes, seconds }) => (
    <div className="my-6 p-4 rounded-2xl bg-gray-50 border border-cyan-100 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-cyan-500/5 blur-xl opacity-50"></div>
        <p className="text-[10px] uppercase tracking-widest text-cyan-600 mb-3 font-bold relative z-10">
            SESI DIMULAI DALAM
        </p>
        <div className="flex justify-center items-end space-x-2 text-cyan-900 relative z-10 font-mono">
            {days > 0 && <TimeUnit value={days} label="Hari" />}
            <TimeUnit value={String(hours).padStart(2, "0")} label="Jam" />
            <span className="text-2xl font-bold pb-4 text-cyan-400 animate-pulse">
                :
            </span>
            <TimeUnit value={String(minutes).padStart(2, "0")} label="Mnt" />
            <span className="text-2xl font-bold pb-4 text-cyan-400 animate-pulse">
                :
            </span>
            <TimeUnit
                value={String(seconds).padStart(2, "0")}
                label="Dtk"
                isSeconds
            />
        </div>
    </div>
);

const TimeUnit = ({ value, label, isSeconds }) => (
    <div className="flex flex-col items-center">
        <div
            className={`text-3xl sm:text-4xl font-extrabold tabular-nums 
            ${isSeconds ? "text-cyan-500 drop-shadow-sm" : "text-gray-800"}`}
        >
            {value}
        </div>
        <span className="text-[9px] uppercase text-gray-400 mt-1 font-bold">
            {label}
        </span>
    </div>
);

const DetailRow = ({ icon: Icon, label, value, isStatus, statusColor }) => (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition px-2 rounded-lg">
        <div className="flex items-center gap-3">
            <div
                className={`p-2 rounded-lg ${
                    isStatus ? statusColor.bg : "bg-gray-100"
                } text-gray-500`}
            >
                <Icon size={18} className={isStatus ? statusColor.text : ""} />
            </div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                {label}
            </span>
        </div>
        <span
            className={`text-sm font-bold ${
                isStatus ? statusColor.text : "text-gray-800"
            } text-right max-w-[50%]`}
        >
            {value}
        </span>
    </div>
);

// Layout & Helper
const MobileLayout = ({ children }) => (
    <div className="flex justify-center min-h-screen bg-gray-100 font-sans antialiased">
        <div className="w-full max-w-md min-h-screen flex flex-col relative bg-[#F8FAFC] overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[45vh] bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-b-[3rem] scale-x-110"></div>
            <div className="relative z-10 flex-1 flex flex-col h-full">
                {children}
            </div>
        </div>
    </div>
);

const Spinner = () => (
    <div className="flex justify-center items-center h-64 relative z-20">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
    </div>
);

const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};
const formatTimeRange = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes) return "-";
    try {
        const start = startTime.substring(0, 5);
        const mins = parseInt(durationMinutes);
        if (isNaN(mins)) return start;
        const [h, m] = start.split(":").map(Number);
        const end = new Date();
        end.setHours(h, m + mins);
        return `${start} - ${String(end.getHours()).padStart(2, "0")}:${String(
            end.getMinutes()
        ).padStart(2, "0")} WIB`;
    } catch (e) {
        return startTime;
    }
};

const ScheduleHeaderLoading = () => (
    <header className="w-full p-4 pt-8 z-30 relative flex items-center justify-between">
        <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse"></div>
        <div className="h-6 w-32 bg-white/20 rounded animate-pulse"></div>
        <div className="w-10"></div>
    </header>
);

// --- MAIN PAGE ---
export default function CounselorScheduleDetailPage() {
    const navigate = useNavigate();
    const { id: bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchBookingDetail = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(
                `/api/counselor/booking/${bookingId}`
            );
            setBooking(response.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Gagal memuat data sesi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (bookingId) fetchBookingDetail();
    }, [bookingId]);

    const { isReady, days, hours, minutes, seconds } = useCountdown(
        booking?.tanggal_konsultasi,
        booking?.jam_konsultasi
    );

    // Actions
    const handleCompleteSession = async () => {
        if (!window.confirm("Tandai sesi ini sebagai Selesai?")) return;
        setIsSubmitting(true);
        try {
            const res = await apiClient.post(
                `/api/counselor/booking/${bookingId}/complete`
            );
            setBooking(res.data.booking);
            alert("Sesi selesai!");
        } catch (err) {
            alert("Gagal menyelesaikan sesi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Renderers
    const renderDynamicDetails = (booking) => {
        const status = booking.status_pesanan;

        if (["Dibatalkan", "DIBATALKAN"].includes(status)) {
            return (
                <div className="bg-red-50/80 p-4 rounded-2xl border border-red-100 mt-4 relative overflow-hidden">
                    <div className="flex items-start gap-3 relative z-10">
                        <XCircle className="text-red-500 mt-0.5" size={20} />
                        <div>
                            <p className="text-xs font-bold text-red-600 uppercase mb-1">
                                Alasan Pembatalan
                            </p>
                            <p className="text-sm text-gray-700 italic">
                                "{booking.alasan_pembatalan || "-"}"
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        if (["Selesai", "SELESAI"].includes(status)) {
            return (
                <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-100 mt-4 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-amber-700 uppercase flex items-center gap-2">
                                <Star size={14} className="text-amber-500" />{" "}
                                Ulasan Customer
                            </span>
                            <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        fill={
                                            i < (booking.rating || 0)
                                                ? "currentColor"
                                                : "none"
                                        }
                                        className={
                                            i < (booking.rating || 0)
                                                ? "text-amber-400"
                                                : "text-gray-300"
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 italic pl-3 border-l-2 border-amber-300">
                            "{booking.ulasan_customer || "Belum ada ulasan"}"
                        </p>
                    </div>
                </div>
            );
        }

        if (
            ["Dijadwalkan", "Aktif", "Proses"].includes(status) &&
            booking.metode_konsultasi !== "Chat"
        ) {
            return (
                <DetailRow
                    icon={Phone}
                    label="No. Telepon"
                    value={booking.customer?.phone || "-"}
                />
            );
        }
        return null;
    };

    const renderActionButtons = (booking) => {
        const status = booking.status_pesanan;

        // --- STATUS: MENUNGGU KONFIRMASI (RESCHEDULE OLEH KONSELOR) ---
        if (
            status === "Menunggu Konfirmasi Customer" ||
            status === "MENUNGGU_KONFIRMASI_JADWAL"
        ) {
            return (
                <div className="mt-6 w-full p-5 bg-white rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-pink-500"></div>
                    <h3 className="text-center font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                        <Hourglass
                            className="text-orange-500 animate-pulse"
                            size={20}
                        />
                        Menunggu Konfirmasi Customer
                    </h3>

                    {/* Detail Jadwal yang Diajukan */}
                    <div className="text-center mb-4 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                        <p className="text-xs text-gray-500 mb-1">
                            Jadwal yang Anda ajukan:
                        </p>
                        <p className="text-lg font-bold text-gray-800">
                            {formatDate(
                                booking.proposed_date ||
                                    booking.tanggal_konsultasi
                            )}
                        </p>
                        <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-pink-600 my-1 font-mono">
                            {(
                                booking.proposed_time || booking.jam_konsultasi
                            )?.substring(0, 5)}{" "}
                            WIB
                        </p>
                    </div>

                    <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-xl">
                        <Info
                            size={16}
                            className="text-gray-400 mt-0.5 shrink-0"
                        />
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Anda tidak perlu melakukan tindakan apapun saat ini.
                            Customer akan menerima atau menolak pengajuan jadwal
                            ulang ini.
                        </p>
                    </div>
                </div>
            );
        }

        // --- STATUS: DIJADWALKAN / AKTIF ---
        if (["Dijadwalkan", "Aktif", "Proses"].includes(status)) {
            const isChat = booking.metode_konsultasi === "Chat";
            const MainIcon = isChat ? MessageCircle : Video;

            return (
                <div className="mt-8 w-full space-y-4 px-2">
                    {/* Tombol Masuk Sesi (Chat/Gmeet) */}
                    {isChat ? (
                        <button
                            onClick={() =>
                                isReady &&
                                navigate(`/counselor/chat/${booking.id}`)
                            }
                            disabled={!isReady}
                            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 relative overflow-hidden group ${
                                isReady
                                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-cyan-500/50"
                                    : "bg-gray-300 cursor-not-allowed"
                            }`}
                        >
                            {isReady && (
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            )}
                            <MainIcon
                                size={24}
                                className={isReady ? "animate-pulse" : ""}
                            />
                            {isReady ? "Masuk Ruang Chat" : "Chat Belum Dibuka"}
                        </button>
                    ) : (
                        <a
                            href={isReady ? booking.gmeet_link || "#" : "#"}
                            target={isReady ? "_blank" : undefined}
                            rel="noreferrer"
                            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 relative overflow-hidden group ${
                                isReady && booking.gmeet_link
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-green-500/50"
                                    : "bg-gray-300 cursor-not-allowed"
                            }`}
                            onClick={(e) =>
                                (!isReady || !booking.gmeet_link) &&
                                e.preventDefault()
                            }
                        >
                            {isReady && booking.gmeet_link && (
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            )}
                            <MainIcon
                                size={24}
                                className={
                                    isReady && booking.gmeet_link
                                        ? "animate-pulse"
                                        : ""
                                }
                            />
                            {isReady
                                ? "Gabung Google Meet"
                                : "Link Belum Aktif"}
                        </a>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        {/* Tombol Reschedule */}
                        <button
                            onClick={() =>
                                navigate(
                                    `/counselor/history/reschedule/${booking.id}`
                                )
                            }
                            className="py-3.5 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 hover:border-cyan-200 transition active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Clock size={18} /> Reschedule
                        </button>

                        {/* Tombol Selesai (Hanya jika sesi sudah mulai / isReady) */}
                        {isReady ? (
                            <button
                                onClick={handleCompleteSession}
                                disabled={isSubmitting}
                                className="py-3.5 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-bold rounded-2xl hover:shadow-lg active:scale-95 transition flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={18} /> Tandai Selesai
                            </button>
                        ) : (
                            <div className="py-3.5 bg-gray-100 border-2 border-gray-100 text-gray-400 font-bold rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed opacity-70">
                                <CheckCircle2 size={18} /> Belum Mulai
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    if (loading)
        return (
            <MobileLayout>
                <ScheduleHeaderLoading />
                <Spinner />
            </MobileLayout>
        );
    if (error || !booking)
        return (
            <MobileLayout>
                <ScheduleHeaderLoading />
                <div className="p-10 text-center text-red-500 font-medium bg-white/80 backdrop-blur-md rounded-2xl mx-4 mt-10 shadow-lg">
                    {error}
                </div>
            </MobileLayout>
        );

    const customer = booking.customer || {};
    const duration = booking.durasi_konseling || {};

    // Status Color Logic
    let statusColor = { bg: "bg-gray-100", text: "text-gray-800" };
    if (booking.status_pesanan === "Dijadwalkan")
        statusColor = { bg: "bg-cyan-100", text: "text-cyan-700" };
    else if (["Dibatalkan", "DIBATALKAN"].includes(booking.status_pesanan))
        statusColor = { bg: "bg-red-100", text: "text-red-700" };
    else if (["Selesai", "SELESAI"].includes(booking.status_pesanan))
        statusColor = { bg: "bg-green-100", text: "text-green-700" };
    else if (booking.status_pesanan.includes("Menunggu"))
        statusColor = { bg: "bg-orange-100", text: "text-orange-700" };

    return (
        <MobileLayout>
            <header className="w-full p-4 pt-8 z-30 relative flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="text-white p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition shadow-sm border border-white/20"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="font-bold text-white text-lg tracking-wide drop-shadow-md">
                    Detail Sesi
                </h1>
                <div className="w-10"></div>
            </header>

            <div className="flex-1 px-4 pb-8 z-20 mt-14 flex flex-col">
                <div className="w-full relative flex-1 flex flex-col">
                    {/* Layer 1: Background */}
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-cyan-400/20 blur-3xl opacity-50 pointer-events-none"></div>
                    </div>

                    {/* Layer 2: Content */}
                    <div className="relative z-10 p-6 flex flex-col h-full">
                        <div className="text-center -mt-16 mb-4">
                            <div className="relative inline-block group">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 blur-md opacity-60 animate-pulse"></div>
                                <img
                                    src={
                                        customer.avatar ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                            customer.name || "C"
                                        )}`
                                    }
                                    alt={customer.name}
                                    className="w-24 h-24 rounded-full object-cover relative z-10 border-[4px] border-white shadow-xl transition-transform group-hover:scale-105"
                                />
                            </div>
                            <h2 className="font-extrabold text-2xl text-gray-900 mt-3">
                                {customer.name}
                            </h2>
                            <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 bg-cyan-50 rounded-full border border-cyan-100">
                                <User size={12} className="text-cyan-600" />
                                <p className="text-xs text-cyan-700 font-bold uppercase tracking-wider">
                                    {booking.jenis_konseling?.jenis_konseling ||
                                        "Konseling"}
                                </p>
                            </div>
                        </div>

                        {!isReady &&
                            ["Dijadwalkan", "Aktif", "Proses"].includes(
                                booking.status_pesanan
                            ) &&
                            booking.metode_konsultasi !== "Tatap Muka" && (
                                <CountdownDisplay
                                    days={days}
                                    hours={hours}
                                    minutes={minutes}
                                    seconds={seconds}
                                />
                            )}

                        <div className="space-y-1 mt-2 bg-white/60 rounded-2xl p-2 border border-white/50 shadow-inner">
                            <DetailRow
                                icon={
                                    booking.metode_konsultasi === "Chat"
                                        ? MessageCircle
                                        : booking.metode_konsultasi ===
                                          "Tatap Muka"
                                        ? User
                                        : Video
                                }
                                label="Metode"
                                value={booking.metode_konsultasi}
                            />
                            <DetailRow
                                icon={Calendar}
                                label="Tanggal"
                                value={formatDate(booking.tanggal_konsultasi)}
                            />
                            <DetailRow
                                icon={Clock}
                                label="Jam"
                                value={formatTimeRange(
                                    booking.jam_konsultasi,
                                    duration.durasi_menit
                                )}
                            />
                            <DetailRow
                                icon={AlertCircle}
                                label="Status"
                                value={booking.status_pesanan}
                                isStatus
                                statusColor={statusColor}
                            />
                            {renderDynamicDetails(booking)}
                        </div>

                        {renderActionButtons(booking)}
                    </div>
                </div>
            </div>
        </MobileLayout>
    );
}
