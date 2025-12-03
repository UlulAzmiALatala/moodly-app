import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import apiClient from "../../api/axios.js";

// --- IMPORT ECHO & PUSHER (REAL-TIME) ---
import Echo from "laravel-echo";
import Pusher from "pusher-js";
window.Pusher = Pusher;

// --- KONFIGURASI ECHO ---
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

import {
    Calendar,
    Clock,
    Bell,
    ChevronDown,
    MessageSquare,
    Video,
    Phone,
    Loader2,
    Info,
    Lightbulb,
    BookOpen,
    Coffee,
} from "lucide-react";

// --- KOMPONEN CAROUSEL INFO ---
const InfoCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const slides = [
        {
            id: 1,
            title: "Tips Sesi Pertama",
            desc: "Bangun 'Rapport' yang kuat di 5 menit awal untuk kenyamanan klien.",
            bg: "bg-gradient-to-r from-blue-400 to-indigo-400",
            icon: <Lightbulb size={28} className="text-white" />,
        },
        {
            id: 2,
            title: "Fitur Baru: Catatan",
            desc: "Sekarang Anda bisa menyimpan catatan klinis langsung di detail riwayat.",
            bg: "bg-gradient-to-r from-teal-400 to-emerald-500",
            icon: <BookOpen size={28} className="text-white" />,
        },
        {
            id: 3,
            title: "Jaga Kesehatan Mental",
            desc: "Jangan lupa istirahat sejenak di antara sesi untuk mencegah burnout.",
            bg: "bg-gradient-to-r from-rose-400 to-pink-500",
            icon: <Coffee size={28} className="text-white" />,
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    return (
        <div className="px-5 mt-4 w-full overflow-hidden">
            <div className="flex items-center gap-2 mb-3 px-1">
                <Info size={14} className="text-gray-400" />
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Info & Tips
                </h3>
            </div>
            <div className="relative w-full h-28 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div
                    className="flex h-full transition-transform duration-1000 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {slides.map((slide) => (
                        <div
                            key={slide.id}
                            className={`w-full h-full flex-shrink-0 ${slide.bg} text-white flex items-center justify-between px-6`}
                        >
                            <div className="w-3/4 pr-4">
                                <h3 className="font-bold text-base leading-tight drop-shadow-sm">
                                    {slide.title}
                                </h3>
                                <p className="text-xs opacity-95 mt-1 font-medium leading-relaxed">
                                    {slide.desc}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner">
                                {slide.icon}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                idx === currentIndex
                                    ? "bg-white w-4 opacity-100"
                                    : "bg-white/40 w-1.5"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- HEADER KONSELOR (DINAMIS & REAL-TIME) ---
const CounselorHeader = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    // 1. Fetch Status Notifikasi Awal
    useEffect(() => {
        const fetchNotifStatus = async () => {
            try {
                const response = await apiClient.get(
                    "/api/notifications/status"
                );
                setUnreadCount(response.data.unreadCount || 0);
            } catch (err) {
                console.error("Gagal ambil status notifikasi:", err);
            }
        };
        fetchNotifStatus();
    }, []);

    // 2. Real-time Listener
    useEffect(() => {
        if (!user) return;
        const channelName = `counselor.${user.id}`;

        const handleNewNotification = () => {
            setUnreadCount((prev) => prev + 1);
        };

        echo.private(channelName).notification(handleNewNotification);

        return () => echo.leave(channelName);
    }, [user]);

    return (
        <header className="flex items-center justify-between p-5 bg-white shadow-sm sticky top-0 z-30 border-b border-gray-100">
            <div className="flex items-center gap-3">
                <img
                    src={
                        user?.avatar_url || // <-- MENGGUNAKAN FIELD BARU DARI MODEL
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user?.name || "K"
                        )}&background=EBF4FF&color=3B82F6&bold=true`
                    }
                    alt="Avatar"
                    className="w-11 h-11 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                />
                <div>
                    <h1 className="text-base font-bold text-gray-800 leading-tight">
                        {user?.name || "Konselor"}
                    </h1>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        {user?.city || "Indonesia"} <ChevronDown size={12} />
                    </p>
                </div>
            </div>

            {/* Tombol Notifikasi */}
            <button
                onClick={() => navigate("/counselor/notifications")}
                className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 transition-all active:scale-95 relative border border-gray-100"
            >
                <Bell size={24} strokeWidth={2} />

                {/* Dot Merah Dinamis */}
                {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>
        </header>
    );
};

// Banner Hero
const WelcomeBanner = () => {
    const { user } = useAuth();

    return (
        <div className="px-5 pt-6 pb-2">
            <div className="bg-cyan-500 rounded-3xl p-6 text-white relative overflow-hidden h-48 shadow-lg shadow-cyan-200/50 flex items-center">
                <div className="relative z-10 w-[65%]">
                    <h2 className="font-extrabold text-xl leading-tight mb-2 drop-shadow-md">
                        Halo, {user?.name ? user.name.split(" ")[0] : "Dok"}! 👋
                    </h2>
                    <p className="text-xs text-cyan-50 opacity-90 mb-5 leading-relaxed font-medium pr-2">
                        Terima kasih telah menjadi pendengar yang baik. Siap
                        membantu klien hari ini?
                    </p>
                    <div className="inline-block bg-white/20 backdrop-blur-sm text-white font-bold py-2 px-4 rounded-xl text-[10px] border border-white/30">
                        Semangat Mengabdi! 💪
                    </div>
                </div>
                <img
                    src="/images/beranda/dokter1.png"
                    alt="Hero"
                    className="absolute -bottom-4 -right-4 w-48 h-auto object-contain z-0 drop-shadow-xl filter brightness-105"
                    onError={(e) => (e.target.style.display = "none")}
                />
            </div>
        </div>
    );
};

// Kartu Jadwal
const ScheduleCard = ({ booking }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (timeStr) => (timeStr ? timeStr.substring(0, 5) : "-");

    const MethodIcon =
        {
            "Video Call": Video,
            "Voice Call": Phone,
            Chat: MessageSquare,
        }[booking.metode_konsultasi] || Video;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-3 hover:border-blue-100 transition-all active:scale-[0.99]">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <MethodIcon size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-bold text-gray-800">
                                {booking.customer?.name || "Customer"}
                            </h3>
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                {booking.metode_konsultasi}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400">Klien</p>
                    </div>
                </div>
                <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                        booking.status_pesanan === "Dijadwalkan"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                    }`}
                >
                    {booking.status_pesanan}
                </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="font-medium">
                        {formatDate(booking.tanggal_konsultasi)}
                    </span>
                </div>
                <div className="w-px h-3 bg-gray-300"></div>
                <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-400" />
                    <span className="font-medium">
                        {formatTime(booking.jam_konsultasi)} WIB
                    </span>
                </div>
                <div className="w-px h-3 bg-gray-300"></div>
                <span className="font-medium text-gray-500">
                    {booking.durasi_konseling?.durasi_menit || 60} Min
                </span>
            </div>
        </div>
    );
};

// --- HALAMAN UTAMA ---
export default function HomePage() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(
                    "/api/counselor/dashboard-data"
                );
                setDashboardData(response.data);
                setError(null);
            } catch (err) {
                console.error("Gagal mengambil data:", err);
                setError("Gagal memuat data dashboard.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3 text-gray-400 text-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                    <p>Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center text-red-500 bg-red-50 p-4 rounded-xl w-full max-w-sm border border-red-100">
                    <p className="font-bold mb-1">Terjadi Kesalahan</p>
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 text-xs bg-white border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition"
                    >
                        Muat Ulang
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-2">
            {/* Header dengan Notifikasi Dinamis & Avatar URL */}
            <CounselorHeader />

            {/* 1. Hero Banner (Dokter) */}
            <WelcomeBanner />

            {/* 2. Info Carousel */}
            <InfoCarousel />

            {/* 3. Jadwal Konsultasi */}
            <main className="px-5 mt-6">
                <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">
                        Jadwal Mendatang
                    </h2>
                    <Link
                        to="/counselor/schedule"
                        className="text-xs font-bold text-cyan-600 bg-cyan-50 px-3 py-1.5 rounded-lg hover:bg-cyan-100 transition-colors"
                    >
                        Lihat Semua
                    </Link>
                </div>

                <div className="space-y-3">
                    {dashboardData?.upcomingSchedules?.length > 0 ? (
                        dashboardData.upcomingSchedules.map((item) => (
                            <ScheduleCard key={item.id} booking={item} />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 mx-1">
                            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                                <Calendar className="text-gray-300" size={28} />
                            </div>
                            <p className="text-sm text-gray-600 font-bold">
                                Jadwal Kosong
                            </p>
                            <p className="text-xs text-gray-400 mt-1 px-8 leading-relaxed">
                                Belum ada sesi konsultasi yang dijadwalkan dalam
                                waktu dekat.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
