import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios.js";
import {
    Calendar,
    Clock,
    Video,
    MessageCircle,
    Phone,
    MapPin,
    ChevronRight,
    Search,
} from "lucide-react";

// --- LAYOUT HELPER ---
const MobileLayout = ({ children }) => (
    <div className="flex justify-center min-h-screen bg-gray-100 font-sans antialiased">
        <div className="w-full max-w-md min-h-screen flex flex-col relative bg-[#F8FAFC] overflow-hidden shadow-2xl">
            {/* Background Gradient Futuristik */}
            <div className="absolute top-0 left-0 w-full h-[35vh] bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-b-[40px] scale-x-110"></div>
            {/* Subtle Pattern Overlay */}
            <div className="absolute top-0 left-0 w-full h-[35vh] opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] rounded-b-[40px] scale-x-110"></div>

            {/* Main Content Wrapper - Flex Column untuk mengatur scroll */}
            <div className="relative z-10 flex-1 flex flex-col h-full">
                {children}
            </div>
        </div>
    </div>
);

// --- HEADER COMPONENT ---
const ScheduleHeader = () => (
    <header className="px-6 pt-10 pb-6 text-white relative z-20 shrink-0">
        <div className="flex justify-between items-center mb-1">
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                    Jadwal Konsultasi
                </h1>
                <p className="text-cyan-100 text-sm font-medium opacity-90">
                    Kelola sesi pasien Anda hari ini
                </p>
            </div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                <Calendar size={20} className="text-white" />
            </div>
        </div>
    </header>
);

// --- CARD COMPONENT (Modern Glassmorphism) ---
const PatientScheduleCard = ({ booking, onClick }) => {
    const customer = booking.customer || {};
    const duration = booking.durasi_konseling || {};
    const customerName = customer.name || "Customer";
    const customerAvatar =
        customer.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}`;

    // Helper Format
    const formatDate = (dateString) => {
        if (!dateString) return "...";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const formatTimeRange = (startTime, durationMinutes) => {
        if (!startTime) return "...";
        try {
            const start = startTime.substring(0, 5);
            const mins = parseInt(durationMinutes || 60);
            const [h, m] = start.split(":").map(Number);
            const end = new Date();
            end.setHours(h, m + mins);
            return `${start} - ${String(end.getHours()).padStart(
                2,
                "0"
            )}:${String(end.getMinutes()).padStart(2, "0")}`;
        } catch (e) {
            return startTime;
        }
    };

    // Config Icon & Color berdasarkan Metode
    const getMethodConfig = (method) => {
        switch (method) {
            case "Video Call":
                return {
                    color: "text-purple-600",
                    bg: "bg-purple-50",
                    icon: Video,
                };
            case "Voice Call":
                return {
                    color: "text-teal-600",
                    bg: "bg-teal-50",
                    icon: Phone,
                };
            case "Tatap Muka":
                return {
                    color: "text-orange-600",
                    bg: "bg-orange-50",
                    icon: MapPin,
                };
            default:
                return {
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                    icon: MessageCircle,
                };
        }
    };

    const {
        color,
        bg,
        icon: MethodIcon,
    } = getMethodConfig(booking.metode_konsultasi);

    return (
        <div
            onClick={onClick}
            className="group relative bg-white/90 backdrop-blur-xl rounded-2xl p-4 mb-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-white/60 cursor-pointer overflow-hidden active:scale-[0.98]"
        >
            {/* Decorative Side Bar */}
            <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${bg
                    .replace("bg-", "bg-gradient-to-b from-")
                    .replace("50", "400")} to-gray-100`}
            ></div>

            <div className="flex items-center gap-4 pl-2">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-full blur-sm opacity-40 group-hover:opacity-70 transition-opacity"></div>
                    <img
                        src={customerAvatar}
                        alt={customerName}
                        className="w-14 h-14 rounded-full object-cover relative z-10 border-2 border-white shadow-sm"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=C`;
                        }}
                    />
                </div>

                {/* Info Utama */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900 truncate pr-2 text-base">
                            {customerName}
                        </h3>
                        <div
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${bg} ${color} text-[10px] font-bold uppercase tracking-wider`}
                        >
                            <MethodIcon size={10} /> {booking.metode_konsultasi}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md">
                            <Calendar size={12} className="text-gray-400" />
                            {formatDate(booking.tanggal_konsultasi)}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md">
                            <Clock size={12} className="text-gray-400" />
                            {formatTimeRange(
                                booking.jam_konsultasi,
                                duration.durasi_menit
                            )}
                        </div>
                    </div>
                </div>

                {/* Arrow Action */}
                <div className="text-gray-300 group-hover:text-cyan-500 transition-colors">
                    <ChevronRight size={20} />
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
export default function CounselorSchedulePage() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState(""); // State Pencarian
    const navigate = useNavigate();

    // Fetch Schedules dengan Debounce Search
    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                setLoading(true);
                // Kirim parameter search ke API
                const response = await apiClient.get(
                    `/api/counselor/schedules?search=${searchQuery}`
                );
                setSchedules(response.data);
                setError(null);
            } catch (err) {
                console.error("Gagal mengambil data jadwal:", err);
                setError("Gagal memuat jadwal.");
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchSchedules();
        }, 500); // Tunggu 500ms setelah user berhenti mengetik

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleCardClick = (bookingId) => {
        navigate(`/counselor/schedule/${bookingId}`);
    };

    // Render Content Logic
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-64 mt-10">
                    <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                    <p className="text-white/80 text-sm font-medium animate-pulse">
                        Sinkronisasi Jadwal...
                    </p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="mt-20 px-6">
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-red-100 text-center shadow-lg">
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <User size={24} className="text-red-400" />
                        </div>
                        <p className="text-gray-800 font-bold mb-1">
                            Gagal Memuat Data
                        </p>
                        <p className="text-sm text-gray-500">{error}</p>
                    </div>
                </div>
            );
        }

        if (schedules.length === 0) {
            return (
                <div className="mt-10 px-6">
                    <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-white/50 text-center shadow-xl">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <Calendar size={32} className="text-cyan-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {searchQuery ? "Tidak Ditemukan" : "Jadwal Kosong"}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            {searchQuery
                                ? `Tidak ada jadwal untuk "${searchQuery}"`
                                : "Belum ada sesi konsultasi yang dijadwalkan. Istirahat yang cukup!"}
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="px-4 pb-32 mt-2">
                {" "}
                {/* PB-32 = Padding Bottom Besar agar tidak terpotong */}
                {schedules.map((item) => (
                    <PatientScheduleCard
                        key={item.id}
                        booking={item}
                        onClick={() => handleCardClick(item.id)}
                    />
                ))}
            </div>
        );
    };

    return (
        <MobileLayout>
            <ScheduleHeader />

            {/* Main Content Area 
                - flex-1: Mengambil sisa ruang
                - overflow-y-auto: Scroll di dalam area ini
                - rounded-t: Membuat efek sheet
                - pb-32: Mencegah konten paling bawah terpotong
            */}
            <main className="flex-1 overflow-y-auto no-scrollbar rounded-t-[2.5rem] bg-white/30 backdrop-blur-sm border-t border-white/40 pt-6">
                {/* Search Bar - Sekarang Berfungsi */}
                <div className="px-4 mb-6 sticky top-0 z-30">
                    <div className="bg-white/80 backdrop-blur-md rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm border border-white/60 focus-within:ring-2 focus-within:ring-cyan-400 focus-within:bg-white transition-all">
                        <Search size={18} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama pasien atau ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm text-gray-700 font-medium w-full placeholder-gray-400"
                        />
                    </div>
                </div>

                {renderContent()}
            </main>
        </MobileLayout>
    );
}
