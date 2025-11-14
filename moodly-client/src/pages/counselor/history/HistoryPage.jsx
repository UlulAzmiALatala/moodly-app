import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import apiClient from "../../../api/axios.js"; // Path 2x mundur
import { Calendar, Clock, Star } from "lucide-react";

// --- Komponen Internal ---

const StarIcon = ({ filled }) => (
    <Star
        size={16}
        className={` ${
            filled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
    />
);

const RatingStars = ({ rating }) => {
    // Pastikan rating adalah angka
    const numericRating = parseFloat(rating) || 0;

    return (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <StarIcon key={i} filled={i < Math.floor(numericRating)} />
            ))}
            <span className="text-sm font-semibold text-gray-700 ml-1">
                {numericRating.toFixed(1)}
            </span>
        </div>
    );
};

const TabNavigation = ({ activeTab, onTabClick }) => {
    // --- PERBAIKAN: Gunakan 'keys' untuk API ---
    const tabs = [
        { label: "Akan Datang", key: "upcoming" },
        { label: "Dibatalkan", key: "canceled" },
        { label: "Selesai", key: "completed" },
    ];
    // --- AKHIR PERBAIKAN ---

    return (
        <div className="flex bg-white p-1 rounded-full shadow-md">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onTabClick(tab.key)} // <-- Kirim 'key'
                    className={`w-1/3 py-2 px-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                        activeTab === tab.key // <-- Cek 'key'
                            ? "bg-sky-500 text-white shadow"
                            : "bg-white text-gray-500"
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

// --- Helper Format Tanggal & Waktu ---
const formatDate = (dateString) => {
    if (!dateString) return "...";
    try {
        return new Date(dateString)
            .toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
            .replace(/\//g, " - ");
    } catch (e) {
        return dateString;
    }
};

const formatTimeRange = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes) return startTime || "...";
    try {
        const start = startTime.substring(0, 5);
        const minutes = parseInt(durationMinutes);
        if (isNaN(minutes)) return start;
        const [startHour, startMin] = start.split(":").map(Number);
        const endDate = new Date();
        endDate.setHours(startHour, startMin + minutes, 0, 0);
        const endHour = String(endDate.getHours()).padStart(2, "0");
        const endMin = String(endDate.getMinutes()).padStart(2, "0");
        return `${start} - ${endHour}:${endMin}`;
    } catch (e) {
        return startTime.substring(0, 5);
    }
};
// --- Akhir Helper ---

// --- Komponen Kartu (Dibuat Dinamis) ---

const UpcomingCard = ({ booking, onCancelSuccess }) => {
    const navigate = useNavigate();

    // Ambil data dari relasi
    const customer = booking.customer || {};
    const duration = booking.durasi_konseling || {};

    const customerName = customer.name || "Customer";
    const customerAvatar =
        customer.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}`;

    const handleGantiJadwal = () => {
        // Arahkan ke halaman edit/reschedule
        navigate(`/counselor/history/reschedule/${booking.id}`);
    };

    const handleMulai = () => {
        // Arahkan ke halaman detail sesi "pintar" yang baru kita buat
        navigate(`/counselor/schedule/${booking.id}`);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
                <span className="text-xs text-gray-500 font-medium">
                    {duration.durasi_menit || "?"} Menit Sesi
                </span>
                <img
                    src={customerAvatar}
                    alt={customerName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=C`;
                    }}
                />
            </div>
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-sky-700">
                    {customerName}
                </h3>
                <span className="text-sm font-bold text-sky-500">
                    {booking.metode_konsultasi}
                </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-3">
                <span className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-gray-400" />
                    {formatDate(booking.tanggal_konsultasi)}
                </span>
                <span className="flex items-center gap-1.5">
                    <Clock size={16} className="text-gray-400" />
                    {formatTimeRange(
                        booking.jam_konsultasi,
                        duration.durasi_menit
                    )}
                </span>
            </div>
            <div className="flex items-center gap-3 pt-2">
                <button
                    onClick={handleGantiJadwal}
                    className="flex-1 py-2 px-4 border border-sky-500 text-sky-500 rounded-full text-sm font-semibold transition-all hover:bg-sky-50"
                >
                    Ganti Jadwal
                </button>
                <button
                    onClick={handleMulai}
                    className="flex-1 py-2 px-4 bg-sky-500 text-white rounded-full text-sm font-semibold transition-all hover:bg-sky-600"
                >
                    Mulai
                </button>
            </div>
        </div>
    );
};

const CancelledCard = ({ booking }) => {
    const customer = booking.customer || {};
    const duration = booking.durasi_konseling || {};
    const customerName = customer.name || "Customer";
    const customerAvatar =
        customer.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}`;

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3 opacity-90">
            <div className="flex justify-between items-start">
                <span className="text-xs text-gray-500 font-medium">
                    {duration.durasi_menit || "?"} Menit Sesi
                </span>
                <img
                    src={customerAvatar}
                    alt={customerName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=C`;
                    }}
                />
            </div>
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-sky-700">
                    {customerName}
                </h3>
                <span className="text-sm font-bold text-sky-500">
                    {booking.metode_konsultasi}
                </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-3">
                <span className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-gray-400" />
                    {formatDate(booking.tanggal_konsultasi)}
                </span>
                <span className="flex items-center gap-1.5">
                    <Clock size={16} className="text-gray-400" />
                    {formatTimeRange(
                        booking.jam_konsultasi,
                        duration.durasi_menit
                    )}
                </span>
            </div>
            <div className="pt-2">
                <p className="text-red-600 font-semibold text-sm capitalize">
                    {booking.status_pesanan.toLowerCase()}
                </p>
                {/* Tampilkan alasan jika ada */}
                {booking.alasan_pembatalan && (
                    <p className="text-xs text-gray-500 mt-1">
                        Alasan: {booking.alasan_pembatalan}
                    </p>
                )}
            </div>
        </div>
    );
};

const CompletedCard = ({ booking }) => {
    const customer = booking.customer || {};
    const duration = booking.durasi_konseling || {};
    const customerName = customer.name || "Customer";
    const customerAvatar =
        customer.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}`;

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
                <img
                    src={customerAvatar}
                    alt={customerName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=C`;
                    }}
                />
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-sky-700">
                        {customerName}
                    </h3>
                    <RatingStars rating={booking.rating} />
                </div>
            </div>
            {/* Tampilkan ulasan jika ada */}
            {booking.ulasan_customer && (
                <p className="text-sm text-gray-700 pt-2 italic">
                    "{booking.ulasan_customer}"
                </p>
            )}
            <div className="flex flex-wrap justify-between items-center text-sm text-gray-600 border-t pt-3 gap-2">
                <span className="font-bold text-sky-500">
                    {booking.metode_konsultasi}
                </span>
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                        <Calendar size={16} className="text-gray-400" />
                        {formatDate(booking.tanggal_konsultasi)}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock size={16} className="text-gray-400" />
                        {formatTimeRange(
                            booking.jam_konsultasi,
                            duration.durasi_menit
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
};

// --- Komponen Loading & Error ---
const LoadingComponent = () => (
    <div className="text-center p-10">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Memuat riwayat...</p>
    </div>
);
const ErrorComponent = ({ error }) => (
    <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg">
        {error}
    </div>
);
const EmptyComponent = () => (
    <div className="text-center text-gray-500 p-10 bg-white rounded-lg shadow-md">
        <p>Tidak ada riwayat untuk kategori ini.</p>
    </div>
);

// --- Komponen Utama Halaman Riwayat ---
export default function HistoryPage() {
    const [activeTab, setActiveTab] = useState("upcoming"); // Default tab
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [page, setPage] = useState(1);

    // --- Efek untuk mengambil data saat tab atau halaman berubah ---
    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                // Panggil API baru kita dengan filter status dan halaman
                const response = await apiClient.get(
                    `/api/counselor/history?status=${activeTab}&page=${page}`
                );

                // Jika halaman 1, ganti data. Jika > 1, tambahkan (infinite scroll)
                setBookings((prev) =>
                    page === 1
                        ? response.data.data
                        : [...prev, ...response.data.data]
                );
                setPagination(response.data); // Simpan info paginasi
            } catch (err) {
                console.error("Gagal mengambil riwayat:", err);
                setError("Gagal memuat riwayat.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [activeTab, page]); // Jalankan ulang jika tab atau halaman berubah

    // --- Handler untuk ganti tab ---
    const handleTabChange = (newTabKey) => {
        setActiveTab(newTabKey);
        setPage(1); // Reset ke halaman 1
        setBookings([]); // Kosongkan data lama
        setPagination(null); // Reset paginasi
    };

    // --- Handler untuk infinite scroll (opsional) ---
    const loadMore = () => {
        if (pagination && pagination.next_page_url) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    const renderContent = () => {
        if (loading && page === 1) {
            return <LoadingComponent />;
        }
        if (error) {
            return <ErrorComponent error={error} />;
        }
        if (bookings.length === 0) {
            return <EmptyComponent />;
        }

        // Tampilkan kartu berdasarkan data dinamis
        return bookings.map((item) => {
            switch (activeTab) {
                case "upcoming":
                    return <UpcomingCard key={item.id} booking={item} />;
                case "canceled":
                    return <CancelledCard key={item.id} booking={item} />;
                case "completed":
                    return <CompletedCard key={item.id} booking={item} />;
                default:
                    return null;
            }
        });
    };

    return (
        // Gunakan bg-gray-50 (lebih netral)
        <div className="bg-gray-50 min-h-full p-4 pb-24">
            <TabNavigation activeTab={activeTab} onTabClick={handleTabChange} />

            <div className="mt-6 space-y-4">{renderContent()}</div>

            {/* Tombol Load More */}
            {!loading && pagination && pagination.next_page_url && (
                <div className="mt-6 text-center">
                    <button
                        onClick={loadMore}
                        className="py-2 px-6 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-semibold transition-all hover:bg-gray-100"
                    >
                        Muat Lebih Banyak
                    </button>
                </div>
            )}
        </div>
    );
}
