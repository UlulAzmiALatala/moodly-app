import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

// --- IMPORT ECHO & PUSHER (REAL-TIME) ---
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { Bell, ChevronDown } from "lucide-react"; // Import Ikon

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

// --- Ikon SVG Statis (Arrow, Building, ThumbsUp) ---
const ArrowRightIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white ml-1"
    >
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);

const BuildingIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-400"
    >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
    </svg>
);

const ThumbsUpIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-yellow-500"
    >
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
    </svg>
);

// --- KOMPONEN HEADER CUSTOMER (DINAMIS & REAL-TIME) ---
const CustomerHeader = () => {
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
        const channelName = `customer.${user.id}`;

        const handleNewNotification = () => {
            setUnreadCount((prev) => prev + 1);
        };

        echo.private(channelName).notification(handleNewNotification);
        return () => echo.leave(channelName);
    }, [user]);

    // Ambil nama depan
    const firstName = user?.name ? user.name.split(" ")[0] : "Teman";

    // PERBAIKAN: Hapus rounded-b-3xl agar menjadi navbar yang rata
    return (
        <header className="flex items-center justify-between px-6 py-5 bg-white shadow-sm sticky top-0 z-30 border-b border-gray-100">
            <div className="flex items-center gap-3">
                {/* Foto Profil Customer */}
                <img
                    src={
                        user?.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user?.name || "U"
                        )}&background=EBF4FF&color=3B82F6&bold=true`
                    }
                    alt="Profil"
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 shadow-sm bg-gray-50"
                />
                <div>
                    <h2 className="font-extrabold text-xl text-gray-800 leading-tight">
                        Hi, {firstName}! 👋
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">
                        Bagaimana perasaanmu?
                    </p>
                </div>
            </div>

            {/* Tombol Notifikasi */}
            <button
                onClick={() => navigate("/notifications")}
                className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 transition-all active:scale-95 relative border border-gray-100 shadow-sm"
            >
                <Bell size={24} strokeWidth={2} />
                {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>
        </header>
    );
};

// --- KOMPONEN CAROUSEL IKLAN ---
const AdCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const ads = [
        {
            id: 1,
            title: "Kesehatan Mental Itu Penting",
            desc: "Dapatkan diskon 50% untuk sesi pertamamu bersama psikolog terbaik.",
            bg: "bg-gradient-to-r from-blue-400 to-indigo-400",
            emoji: "🧠",
        },
        {
            id: 2,
            title: "Paket Hemat 4 Sesi",
            desc: "Komitmen untuk pulih lebih hemat dengan paket bundling bulanan.",
            bg: "bg-gradient-to-r from-teal-400 to-emerald-500",
            emoji: "🌱",
        },
        {
            id: 3,
            title: "Webinar: Stress Release",
            desc: "Gabung sesi gratis setiap Jumat malam via Zoom. Daftar sekarang!",
            bg: "bg-gradient-to-r from-rose-400 to-pink-500",
            emoji: "🧘‍♀️",
        },
        {
            id: 4,
            title: "Tantangan 7 Hari Self-Love",
            desc: "Ikuti panduan harian gratis untuk lebih mencintai dirimu sendiri.",
            bg: "bg-gradient-to-r from-amber-300 to-orange-400",
            emoji: "🧡",
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [ads.length]);

    return (
        <div className="px-4 w-full overflow-hidden mt-4 mb-2">
            <div className="relative w-full h-32 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div
                    className="flex h-full transition-transform duration-1000 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {ads.map((ad) => (
                        <div
                            key={ad.id}
                            className={`w-full h-full flex-shrink-0 ${ad.bg} text-white flex items-center justify-between px-6`}
                        >
                            <div className="w-2/3">
                                <h3 className="font-bold text-lg leading-tight drop-shadow-sm">
                                    {ad.title}
                                </h3>
                                <p className="text-xs opacity-95 mt-1.5 font-medium leading-snug">
                                    {ad.desc}
                                </p>
                            </div>
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner">
                                <span className="text-3xl filter drop-shadow-md">
                                    {ad.emoji}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {ads.map((_, idx) => (
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

// --- Section Header ---
const SectionHeader = ({ title, to }) => (
    <div className="flex justify-between items-center pt-6 px-4 mb-3">
        <h3 className="font-bold text-gray-800 text-lg tracking-tight">
            {title}
        </h3>
        {to ? (
            <Link
                to={to}
                className="text-xs font-bold text-cyan-600 hover:text-cyan-700 transition-colors bg-cyan-50 px-2 py-1 rounded-md"
            >
                Lihat Semua
            </Link>
        ) : (
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Rekomendasi
            </span>
        )}
    </div>
);

// --- Card Layanan ---
const ServiceCard = ({ service, highlighted = false }) => {
    const navigate = useNavigate();

    const handleBook = () => {
        navigate("/booking", {
            state: {
                selectedService: service.id,
                serviceName: service.jenis_konseling,
            },
        });
    };

    return (
        <div
            className={`bg-white p-4 rounded-2xl border ${
                highlighted
                    ? "border-cyan-100 bg-gradient-to-b from-white to-cyan-50/30"
                    : "border-gray-100"
            } shadow-sm transition-all active:scale-95 flex flex-col items-center text-center h-full justify-between hover:border-cyan-200`}
        >
            <div className="w-14 h-14 flex items-center justify-center mb-3 bg-white rounded-2xl shadow-sm border border-gray-50 p-2">
                <img
                    src={
                        service.image_url ||
                        "https://placehold.co/64x64/EBF4FF/3B82F6?text=Logo"
                    }
                    alt={service.jenis_konseling}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                            "https://placehold.co/64x64/EBF4FF/3B82F6?text=Img";
                    }}
                />
            </div>
            <div className="w-full mb-3">
                <p className="font-bold text-gray-800 text-xs leading-tight line-clamp-2 min-h-[2.5em]">
                    {service.jenis_konseling}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                    {service.tipe_layanan}
                </p>
            </div>

            <button
                onClick={handleBook}
                className="w-full py-2 px-3 flex items-center justify-center gap-1 text-[10px] font-bold text-white bg-cyan-500 rounded-xl hover:bg-cyan-600 transition-colors shadow-sm shadow-cyan-100"
            >
                <span>Pesan</span> <ArrowRightIcon />
            </button>
        </div>
    );
};

// --- Card Konselor ---
const CounselorCard = ({ counselor }) => (
    <div className="relative flex-shrink-0 w-[300px] bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex gap-4 items-center snap-center transition-transform">
        <img
            src={
                counselor.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    counselor.name
                )}&background=EBF4FF&color=3B82F6&bold=true`
            }
            alt={counselor.name}
            className="w-20 h-24 rounded-xl object-cover bg-gray-50 border border-gray-100"
        />
        <div className="flex-1 min-w-0 py-1">
            <h4 className="font-extrabold text-base text-gray-800 truncate mb-1">
                {counselor.name}
            </h4>

            <div className="flex items-center gap-1.5 mb-1.5">
                <ThumbsUpIcon />
                <p className="text-xs font-bold text-gray-600">
                    {counselor.rating
                        ? `${parseFloat(counselor.rating).toFixed(1)} / 5.0`
                        : "Konselor Baru"}
                </p>
            </div>

            <div className="flex items-center gap-1.5 mb-2 text-gray-500">
                <BuildingIcon />
                <p className="text-[11px] truncate max-w-[150px]">
                    {counselor.universitas || "-"}
                </p>
            </div>

            <div className="flex flex-wrap gap-1">
                {(counselor.spesialisasi || ["Psikolog Klinis"])
                    .slice(0, 2)
                    .map((spec, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md truncate max-w-full border border-blue-100"
                        >
                            {spec}
                        </span>
                    ))}
            </div>
        </div>
    </div>
);

// --- PAGE UTAMA ---
export default function HomePage() {
    const { user } = useAuth();
    const [services, setServices] = useState([]);
    const [counselors, setCounselors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get("/api/beranda-data");
                setServices(response.data.services);
                setCounselors(response.data.counselors);
                setError(null);
            } catch (err) {
                console.error("Gagal mengambil data beranda:", err);
                setError("Gagal memuat data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const onlineServices = services.filter((s) => s.tipe_layanan === "Online");
    const offlineServices = services.filter(
        (s) => s.tipe_layanan === "Offline"
    );

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="h-3 w-24 bg-gray-300 rounded"></div>
                </div>
            </div>
        );
    }

    // PERBAIKAN: Struktur Halaman
    return (
        <main className="bg-[#FAFAFA] min-h-screen pb-2">
            {/* 1. Header (Dinamis) - DI LUAR CONTAINER AGAR JADI NAVBAR STICKY */}
            <CustomerHeader />

            {/* 2. Banner & Ads Container - Rounded di bawah saja */}
            <div className="bg-white pb-6 rounded-b-[2rem] shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] pt-2 z-10 relative">
                {/* Banner Biru */}
                <div className="px-4 mb-2 mt-4">
                    <div className="bg-cyan-500 rounded-3xl p-6 text-white relative overflow-hidden h-48 shadow-lg shadow-cyan-200/50 flex items-center">
                        <div className="relative z-10 w-[65%]">
                            <h2 className="font-extrabold text-lg leading-tight mb-2 drop-shadow-md">
                                Ceritakan masalahmu hari ini
                            </h2>
                            <p className="text-xs text-cyan-50 opacity-90 mb-5 leading-relaxed font-medium pr-2">
                                Kami siap mendengarkan tanpa menghakimi.
                            </p>
                            <Link
                                to="/booking"
                                className="inline-block bg-white text-cyan-600 font-bold py-2.5 px-6 rounded-full text-xs shadow-md hover:shadow-lg hover:scale-105 transition-all active:scale-95"
                            >
                                Mulai Konsultasi
                            </Link>
                        </div>
                        <img
                            src="images/beranda/dokter1.png"
                            alt="Hero"
                            className="absolute -bottom-4 -right-4 w-48 h-auto object-contain z-0 drop-shadow-xl filter brightness-105"
                            onError={(e) => (e.target.style.display = "none")}
                        />
                    </div>
                </div>

                {/* Carousel Iklan */}
                <AdCarousel />
            </div>

            {/* 3. Layanan Online */}
            <div className="mt-2">
                <SectionHeader
                    title="Konseling Online"
                    to="/booking?type=Online"
                />
                <div className="grid grid-cols-2 gap-3 px-4">
                    {onlineServices.length > 0 ? (
                        onlineServices
                            .slice(0, 2)
                            .map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    highlighted
                                />
                            ))
                    ) : (
                        <div className="col-span-2 py-8 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                            <p className="text-xs font-medium">
                                Layanan online segera hadir
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Layanan Offline */}
            <div className="mt-2">
                <SectionHeader
                    title="Tatap Muka (Offline)"
                    to="/booking?type=Offline"
                />
                <div className="grid grid-cols-2 gap-3 px-4">
                    {offlineServices.length > 0 ? (
                        offlineServices
                            .slice(0, 2)
                            .map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                />
                            ))
                    ) : (
                        <div className="col-span-2 py-8 bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                            <p className="text-xs font-medium">
                                Layanan tatap muka segera hadir
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* 5. Daftar Konselor */}
            <div className="mt-4">
                <SectionHeader title="Konselor Pilihan" to={null} />

                <div className="flex space-x-4 overflow-x-auto px-4 pb-2 pt-1 scrollbar-hide snap-x snap-mandatory">
                    {counselors.length > 0 ? (
                        counselors.slice(0, 5).map((counselor) => (
                            <div key={counselor.id} className="snap-center">
                                <CounselorCard counselor={counselor} />
                            </div>
                        ))
                    ) : (
                        <div className="w-full text-center py-10 text-gray-400 text-xs bg-white rounded-2xl border border-dashed border-gray-200 mx-4">
                            Belum ada konselor terdaftar.
                        </div>
                    )}
                    <div className="w-1 shrink-0"></div>
                </div>
            </div>
        </main>
    );
}
