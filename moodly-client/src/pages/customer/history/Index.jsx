import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import {
    Search,
    Phone,
    Video,
    MessageCircle,
    MapPin,
    Calendar,
    Clock,
    User,
    AlertCircle,
} from "lucide-react";

window.Pusher = Pusher;

// --- CONFIG ECHO (TETAP) ---
const echo = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY || "reverb_key",
    wsHost: import.meta.env.VITE_REVERB_HOST || "127.0.0.1",
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || "http") === "https",
    enabledTransports: ["ws", "wss"],
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                apiClient
                    .post("/api/broadcasting/auth", {
                        socket_id: socketId,
                        channel_name: channel.name,
                    })
                    .then((response) => callback(null, response.data))
                    .catch((error) => callback(error));
            },
        };
    },
});

// --- UI COMPONENTS ---

// 1. Header (TANPA TOMBOL KEMBALI - SESUAI REQUEST)
const Header = () => (
    <header className="sticky top-0 z-50 bg-cyan-600 text-white p-4 shadow-md flex items-center justify-center">
        <h1 className="text-lg font-bold tracking-wide">
            Riwayat Konseling Saya
        </h1>
    </header>
);

// 2. Search Bar (KEMBALI KE STANDARD YANG ANDA SUKA)
const SearchBar = ({ searchQuery, setSearchQuery }) => (
    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3 mb-4 mt-4">
        <Search size={20} className="text-gray-400" />
        <input
            type="number"
            placeholder="Cari ID Pesanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
        />
    </div>
);

// 3. Tab Navigation (KEMBALI KE STANDARD PILL CYAN)
const TabNavigation = ({ activeTab, onTabClick }) => {
    const tabs = [
        { label: "Akan Datang", key: "upcoming" },
        { label: "Unpaid", key: "unpaid" },
        { label: "Batal", key: "canceled" },
        { label: "Selesai", key: "completed" },
    ];
    return (
        <div className="flex bg-white p-1 rounded-full shadow-md mb-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onTabClick(tab.key)}
                    className={`flex-1 min-w-[80px] py-2 px-2 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                        activeTab === tab.key
                            ? "bg-cyan-500 text-white shadow"
                            : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

// Hook Countdown (TETAP)
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

// --- KOMPONEN COUNTDOWN DIGITAL (FUTURISTIC) ---
const DigitalDigit = ({ value, label }) => (
    <div className="flex flex-col items-center">
        <div className="bg-gray-800 text-cyan-400 font-mono text-xl font-bold px-3 py-2 rounded-lg shadow-inner border border-gray-700">
            {String(value).padStart(2, "0")}
        </div>
        <span className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-wider">
            {label}
        </span>
    </div>
);

const CountdownDisplay = ({ days, hours, minutes, seconds }) => {
    return (
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex items-center justify-center gap-1 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <p className="text-xs font-bold text-gray-600 tracking-wide uppercase">
                    Sesi Dimulai Dalam
                </p>
            </div>
            <div className="flex justify-center items-center gap-2">
                {days > 0 && (
                    <>
                        <DigitalDigit value={days} label="Hari" />
                        <span className="text-gray-300 text-xl mb-4">:</span>
                    </>
                )}
                <DigitalDigit value={hours} label="Jam" />
                <span className="text-gray-300 text-xl mb-4">:</span>
                <DigitalDigit value={minutes} label="Menit" />
                <span className="text-gray-300 text-xl mb-4">:</span>
                <DigitalDigit value={seconds} label="Detik" />
            </div>
        </div>
    );
};

// Helper Format
const formatDate = (dateString) => {
    if (!dateString) return "...";
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
};
const formatTimeRange = (startTime, durationMinutes) => {
    if (!startTime) return "...";
    try {
        const start = startTime.substring(0, 5);
        const mins = parseInt(durationMinutes || 0);
        const [h, m] = start.split(":").map(Number);
        const end = new Date();
        end.setHours(h, m + mins);
        return `${start} - ${String(end.getHours()).padStart(2, "0")}:${String(
            end.getMinutes()
        ).padStart(2, "0")}`;
    } catch (e) {
        return startTime;
    }
};

// --- CARD MODERN & CLEAN ---
const BookingCard = ({ booking, activeTab }) => {
    const navigate = useNavigate();
    const { isReady, days, hours, minutes, seconds } = useCountdown(
        booking.tanggal_konsultasi,
        booking.jam_konsultasi
    );
    const counselorName = booking.konselor?.name || "Konselor";
    const counselorPhoto =
        booking.konselor?.avatar ||
        `https://ui-avatars.com/api/?name=${counselorName.replace(/\s/g, "+")}`;
    const isOnline = booking.metode_konsultasi !== "Tatap Muka";

    // Icon Configuration
    const getMethodConfig = () => {
        switch (booking.metode_konsultasi) {
            case "Video Call":
                return {
                    color: "text-purple-600",
                    bg: "bg-purple-100",
                    icon: Video,
                };
            case "Voice Call":
                return {
                    color: "text-teal-600",
                    bg: "bg-teal-100",
                    icon: Phone,
                };
            case "Tatap Muka":
                return {
                    color: "text-orange-600",
                    bg: "bg-orange-100",
                    icon: MapPin,
                };
            default:
                return {
                    color: "text-blue-600",
                    bg: "bg-blue-100",
                    icon: MessageCircle,
                };
        }
    };
    const method = getMethodConfig();
    const MethodIcon = method.icon;

    const handleStartSession = () => {
        if (!isOnline || isReady) {
            if (
                booking.metode_konsultasi === "Video Call" ||
                booking.metode_konsultasi === "Voice Call"
            )
                navigate(`/session/video/${booking.id}`);
            else if (booking.metode_konsultasi === "Chat")
                navigate(`/session/chat/${booking.id}`);
            else navigate(`/history/${booking.id}`);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-5 mb-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 relative overflow-hidden transition-all hover:shadow-lg">
            {/* Aksen Warna di Kiri Card */}
            <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${method.bg
                    .replace("bg-", "bg-gradient-to-b from-")
                    .replace("100", "500")
                    .replace("50", "500")} to-gray-200`}
            ></div>

            {/* Header Card: ID */}
            <div className="flex justify-between items-start mb-4 pl-3">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Order ID
                    </span>
                    <span className="text-sm font-mono font-bold text-gray-800">
                        #{booking.id}
                    </span>
                </div>
                {/* Method Badge */}
                <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${method.bg} ${method.color} text-[10px] font-bold uppercase tracking-wide`}
                >
                    <MethodIcon size={12} />
                    {booking.metode_konsultasi}
                </div>
            </div>

            {/* Countdown Area */}
            {activeTab === "upcoming" && !isReady && isOnline && (
                <div className="pl-3">
                    <CountdownDisplay
                        days={days}
                        hours={hours}
                        minutes={minutes}
                        seconds={seconds}
                    />
                </div>
            )}

            {/* Peringatan Pembayaran Ditolak */}
            {activeTab === "unpaid" &&
                booking.status_pesanan === "Pembayaran Ditolak" && (
                    <div className="ml-3 mb-4 bg-red-50 border border-red-100 p-3 rounded-lg flex gap-3">
                        <AlertCircle
                            size={18}
                            className="text-red-500 shrink-0"
                        />
                        <div>
                            <p className="text-xs font-bold text-red-600">
                                Pembayaran Ditolak
                            </p>
                            <p className="text-xs text-red-500 mt-0.5">
                                {booking.catatan_pembatalan ||
                                    "Bukti tidak valid."}
                            </p>
                        </div>
                    </div>
                )}

            {/* Info Konselor & Jadwal */}
            <div className="flex items-start gap-4 mb-4 pl-3">
                <img
                    src={counselorPhoto}
                    alt={counselorName}
                    className="w-12 h-12 rounded-xl object-cover shadow-sm bg-gray-100"
                />
                <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 leading-tight">
                        {counselorName}
                    </h3>
                    <p className="text-xs text-cyan-600 font-medium mb-2">
                        {booking.jenis_konseling?.jenis_konseling}
                    </p>

                    {/* Grid Jadwal Mini */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-gray-400" />
                            {formatDate(booking.tanggal_konsultasi)}
                        </div>
                        <div className="w-px h-3 bg-gray-300"></div>
                        <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-gray-400" />
                            {formatTimeRange(
                                booking.jam_konsultasi,
                                booking.durasi_konseling?.durasi_menit
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-2 pl-3 mt-2 border-t border-gray-50 pt-3">
                {activeTab === "upcoming" && (
                    <>
                        <Link
                            to={`/history/cancel/${booking.id}`}
                            className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                        >
                            Batal
                        </Link>
                        <button
                            onClick={handleStartSession}
                            disabled={!isReady && isOnline}
                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold text-center shadow-sm transition-all
                                ${
                                    !isReady && isOnline
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                        : "bg-cyan-600 text-white hover:bg-cyan-700 hover:shadow-md"
                                }
                            `}
                        >
                            {!isOnline
                                ? "Detail Tiket"
                                : isReady
                                ? "Mulai Sesi Sekarang"
                                : "Belum Waktunya"}{" "}
                            {/* Teks berubah sesuai request */}
                        </button>
                    </>
                )}

                {activeTab === "unpaid" &&
                    booking.status_pesanan !== "Pembayaran Ditolak" && (
                        <>
                            <Link
                                to={`/history/${booking.id}`}
                                className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold"
                            >
                                Detail
                            </Link>
                            <Link
                                to={`/booking/upload-proof/${booking.id}`}
                                state={{ booking }}
                                className="flex-1 py-2.5 bg-cyan-600 text-white rounded-lg text-xs font-bold text-center shadow-sm"
                            >
                                Bayar Sekarang
                            </Link>
                        </>
                    )}

                {activeTab === "completed" && (
                    <Link
                        to={`/history/rating/${booking.id}`}
                        className="w-full py-2.5 bg-cyan-600 text-white rounded-lg text-xs font-bold text-center shadow-sm"
                    >
                        Beri Ulasan
                    </Link>
                )}

                {activeTab === "canceled" && (
                    <Link
                        to={`/history/cancel-detail/${booking.id}`}
                        className="w-full py-2.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold text-center"
                    >
                        Lihat Detail Pembatalan
                    </Link>
                )}
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
export default function HistoryIndex() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState("upcoming");
    const { user: authUser } = useAuth();

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchHistory(currentPage, searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [currentPage, activeTab, searchQuery]);

    const fetchHistory = async (page, search) => {
        setLoading(true);
        try {
            const response = await apiClient.get(
                `/api/history?page=${page}&status=${activeTab}&search=${search}`
            );
            setBookings(
                page === 1
                    ? response.data.data
                    : (prev) => [...prev, ...response.data.data]
            );
            const { data, ...meta } = response.data;
            setPagination(meta);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Real-time listener tetap
    useEffect(() => {
        if (!authUser) return;
        const channelName = `customer.${authUser.id}`;
        const handlePaymentUpdate = (event) => {
            const updated = event.booking;
            setBookings((prev) => {
                const idx = prev.findIndex((b) => b.id === updated.id);
                let shouldInTab = false;
                if (
                    activeTab === "upcoming" &&
                    ["Dijadwalkan", "DISETUJUI"].includes(
                        updated.status_pesanan
                    )
                )
                    shouldInTab = true;
                if (
                    activeTab === "unpaid" &&
                    [
                        "Menunggu Pembayaran",
                        "Menunggu Verifikasi",
                        "Pembayaran Ditolak",
                    ].includes(updated.status_pesanan)
                )
                    shouldInTab = true;

                if (idx > -1) {
                    if (shouldInTab) {
                        const newArr = [...prev];
                        newArr[idx] = updated;
                        return newArr;
                    } else {
                        return prev.filter((b) => b.id !== updated.id);
                    }
                } else if (shouldInTab) {
                    return [updated, ...prev];
                }
                return prev;
            });
        };
        echo.private(channelName).listen(
            ".PaymentVerified",
            handlePaymentUpdate
        );
        return () => echo.leave(channelName);
    }, [authUser, activeTab]);

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            <Header /> {/* Header Sticky tanpa tombol kembali */}
            <div className="px-4">
                <SearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
                <TabNavigation
                    activeTab={activeTab}
                    onTabClick={(tab) => {
                        setActiveTab(tab);
                        setCurrentPage(1);
                        setSearchQuery("");
                    }}
                />

                <div className="min-h-[50vh]">
                    {loading && currentPage === 1 ? (
                        <div className="text-center py-10 text-gray-500">
                            Memuat...
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
                            <p className="text-gray-400">
                                Tidak ada riwayat ditemukan.
                            </p>
                        </div>
                    ) : (
                        bookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                activeTab={activeTab}
                            />
                        ))
                    )}
                </div>

                {!loading && pagination && pagination.next_page_url && (
                    <div className="text-center mt-6">
                        <button
                            onClick={() => setCurrentPage((c) => c + 1)}
                            className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-full text-xs font-bold shadow-sm hover:bg-gray-50"
                        >
                            Muat Lebih Banyak
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
