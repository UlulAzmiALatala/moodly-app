import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios.js";
import {
    Calendar,
    Clock,
    Star,
    Search,
    Video,
    Phone,
    MessageCircle,
    MapPin,
    AlertCircle,
} from "lucide-react";

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

// --- HEADER TETAP ---
const Header = () => (
    <header className="sticky top-0 z-50 bg-cyan-600 text-white p-4 shadow-md flex items-center justify-center">
        <h1 className="text-lg font-bold tracking-wide">
            Riwayat Konseling Saya
        </h1>
    </header>
);

// --- SEARCH BAR TETAP ---
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

// --- TABS TETAP ---
const TabNavigation = ({ activeTab, onTabClick }) => {
    const tabs = [
        { label: "Akan Datang", key: "upcoming" },
        { label: "Dibatalkan", key: "canceled" },
        { label: "Selesai", key: "completed" },
    ];
    return (
        <div className="flex bg-white p-1 rounded-full shadow-md mb-6">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onTabClick(tab.key)}
                    className={`flex-1 py-2 px-3 rounded-full text-sm font-semibold transition-all duration-300 ${
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

// --- COUNTDOWN DIGITAL (SAMA DENGAN CUSTOMER) ---
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

const CountdownDisplay = ({ days, hours, minutes, seconds }) => (
    <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex items-center justify-center gap-1 mb-2">
            <Clock size={14} className="text-cyan-600" />
            <p className="text-xs font-bold text-gray-600 tracking-wide uppercase">
                Waktu Tersisa
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

const RatingStars = ({ rating }) => {
    const numericRating = parseFloat(rating) || 0;
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={14}
                    className={
                        i < Math.floor(numericRating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-200"
                    }
                />
            ))}
            <span className="text-xs font-bold text-gray-600 ml-1">
                ({numericRating.toFixed(1)})
            </span>
        </div>
    );
};

// --- MODERN CARD (COUNSELOR) ---
const ModernCard = ({ booking, activeTab }) => {
    const navigate = useNavigate();
    const customer = booking.customer || {};
    const customerName = customer.name || "Customer";
    const customerAvatar =
        customer.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}`;
    const { isReady, days, hours, minutes, seconds } = useCountdown(
        booking.tanggal_konsultasi,
        booking.jam_konsultasi
    );
    const isOnline = booking.metode_konsultasi !== "Tatap Muka";

    // Icon Config
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

    return (
        <div className="bg-white rounded-2xl p-5 mb-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 relative overflow-hidden transition-all hover:shadow-lg">
            {/* Aksen Warna di Kiri Card */}
            <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${method.bg
                    .replace("bg-", "bg-gradient-to-b from-")
                    .replace("100", "500")
                    .replace("50", "500")} to-gray-200`}
            ></div>

            {/* Header */}
            <div className="flex justify-between items-start mb-4 pl-3">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Order ID
                    </span>
                    <span className="text-sm font-mono font-bold text-gray-800">
                        #{booking.id}
                    </span>
                </div>
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

            {/* Profile Customer */}
            <div className="flex items-center gap-4 mb-4 pl-3">
                <img
                    src={customerAvatar}
                    alt={customerName}
                    className="w-12 h-12 rounded-xl object-cover shadow-sm bg-gray-100"
                />
                <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 leading-tight">
                        {customerName}
                    </h3>
                    {activeTab === "completed" && (
                        <RatingStars rating={booking.rating} />
                    )}

                    {/* Grid Jadwal Mini */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100 mt-2">
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

            {/* Ulasan */}
            {activeTab === "completed" && booking.ulasan_customer && (
                <div className="bg-gray-50 p-3 rounded-xl mb-4 ml-3 border border-gray-100">
                    <p className="text-xs text-gray-600 italic">
                        "{booking.ulasan_customer}"
                    </p>
                </div>
            )}

            {/* Alasan Batal */}
            {activeTab === "canceled" && (
                <div className="flex items-start gap-2 bg-red-50 p-3 rounded-lg mb-4 ml-3 border border-red-100 text-xs">
                    <AlertCircle
                        size={16}
                        className="text-red-500 shrink-0 mt-0.5"
                    />
                    <div>
                        <span className="font-bold text-red-600 block mb-0.5">
                            Dibatalkan
                        </span>
                        <span className="text-red-500">
                            {booking.alasan_pembatalan}
                        </span>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pl-3 mt-2 border-t border-gray-50 pt-3">
                {activeTab === "upcoming" && (
                    <>
                        <button
                            onClick={() =>
                                navigate(
                                    `/counselor/history/reschedule/${booking.id}`
                                )
                            }
                            className="px-4 py-2.5 rounded-lg border border-gray-200 text-cyan-600 text-xs font-bold hover:bg-cyan-50 hover:border-cyan-200 transition-all"
                        >
                            Reschedule
                        </button>
                        <button
                            onClick={() =>
                                navigate(`/counselor/schedule/${booking.id}`)
                            }
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
                                ? "Detail Sesi"
                                : isReady
                                ? "Mulai Sesi Sekarang"
                                : "Sesi Belum Aktif"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default function HistoryPage() {
    const [activeTab, setActiveTab] = useState("upcoming");
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchHistory(1, searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, activeTab]);

    const fetchHistory = async (pageNum, search) => {
        setLoading(true);
        try {
            const response = await apiClient.get(
                `/api/counselor/history?status=${activeTab}&page=${pageNum}&search=${search}`
            );
            setBookings((prev) =>
                pageNum === 1
                    ? response.data.data
                    : [...prev, ...response.data.data]
            );
            setPagination(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchHistory(nextPage, searchQuery);
    };

    // --- PERBAIKAN DI SINI ---
    // Saya menghapus 'pt-4' dari div container utama,
    // dan memindahkannya ke div pembungkus SearchBar/Tabs di bawahnya.
    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <Header />
            <div className="px-5 pt-4">
                <SearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
                <TabNavigation
                    activeTab={activeTab}
                    onTabClick={(tab) => {
                        setActiveTab(tab);
                        setSearchQuery("");
                    }}
                />

                <div className="space-y-4 min-h-[50vh]">
                    {bookings.length > 0
                        ? bookings.map((item) => (
                              <ModernCard
                                  key={item.id}
                                  booking={item}
                                  activeTab={activeTab}
                              />
                          ))
                        : !loading && (
                              <div className="text-center py-20 opacity-60">
                                  <Search
                                      size={48}
                                      className="mx-auto mb-4 text-gray-300"
                                  />
                                  <p className="text-gray-500 font-medium">
                                      Tidak ada data ditemukan.
                                  </p>
                              </div>
                          )}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className="w-8 h-8 border-4 border-gray-200 border-t-cyan-500 rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                {!loading && pagination && pagination.next_page_url && (
                    <div className="text-center mt-6">
                        <button
                            onClick={loadMore}
                            className="px-6 py-2 bg-white border border-cyan-100 text-cyan-600 rounded-full text-xs font-bold shadow-sm hover:bg-cyan-50 transition-colors"
                        >
                            Muat Lebih Banyak
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
