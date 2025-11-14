import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx"; // <-- PERBAIKAN: Path 2x mundur + .jsx
import apiClient from "../../api/axios.js"; // <-- PERBAIKAN: Path 2x mundur + .js

// Import ikon-ikon
import {
    Wallet,
    Download,
    Calendar,
    Clock,
    Bell,
    ChevronDown, // <-- Ganti ikon panah
} from "lucide-react";

// --- Komponen-Komponen Kecil ---

// Header sekarang dinamis
const CounselorHeader = () => {
    const { user } = useAuth(); // Ambil data user dari context
    const navigate = useNavigate();

    // Fallback jika user belum ada
    const counselorName = user?.name || "Konselor Moodly";
    const counselorAvatar =
        user?.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
            counselorName
        )}&background=EBF4FF&color=3B82F6`;
    const counselorCity = user?.city || "Lokasi";

    return (
        <header className="flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <img
                    src={counselorAvatar}
                    alt={counselorName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=K`;
                    }}
                />
                <div>
                    <h1 className="text-base font-semibold text-gray-800">
                        {counselorName}
                    </h1>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                        {counselorCity}, Indonesia <ChevronDown size={16} />
                    </p>
                </div>
            </div>
            <button onClick={() => navigate("/counselor/notifications")}>
                <Bell size={24} className="text-gray-600" />
            </button>
        </header>
    );
};

const WelcomeBanner = () => (
    <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl shadow-lg flex items-center overflow-hidden h-32">
        <img
            src="https://img.freepik.com/free-photo/beautiful-young-female-doctor-looking-camera-office_1301-10023.jpg?w=1380"
            alt="Konselor"
            className="w-2/5 h-full object-cover object-center"
        />
        <div className="p-4 w-3/5">
            <p className="text-white font-medium text-sm leading-snug">
                Berikan pendampingan terbaik,{" "}
                <span className="font-bold">MOODLY</span> mendukung perjalananmu
                sebagai konselor.
            </p>
        </div>
    </div>
);

// Saldo sekarang dinamis
const BalanceCard = ({ balance }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="bg-sky-400 rounded-2xl shadow-lg p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
                <Wallet size={32} />
                <span className="text-2xl font-bold">
                    {formatCurrency(balance)}
                </span>
            </div>
            <button className="bg-white/30 p-2 rounded-lg active:bg-white/50 transition-all">
                <Download size={24} />
            </button>
        </div>
    );
};

// Kartu Jadwal sekarang dinamis
const ScheduleCard = ({ booking }) => {
    // Helper untuk format tanggal & waktu
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
            const start = startTime.substring(0, 5); // "16:00"
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

    const customer = booking.customer || {};
    const duration = booking.durasi_konseling || {};

    const customerName = customer.name || "Customer";
    const customerAvatar =
        customer.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}`;

    return (
        <div className="bg-white rounded-xl shadow-md p-4 mb-4 transition-all hover:shadow-lg">
            <div className="flex justify-between items-start mb-2">
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
            <h3 className="text-lg font-bold text-gray-800 mb-3">
                {customerName}
            </h3>

            <div className="flex flex-wrap justify-between items-center text-sm gap-y-2">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-gray-600">
                        <Calendar size={16} className="text-gray-400" />
                        {formatDate(booking.tanggal_konsultasi)}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-600">
                        <Clock size={16} className="text-gray-400" />
                        {formatTimeRange(
                            booking.jam_konsultasi,
                            duration.durasi_menit
                        )}
                    </span>
                </div>
                <span className="font-bold text-blue-500">
                    {booking.metode_konsultasi}
                </span>
            </div>
        </div>
    );
};

// --- Komponen Utama (Sekarang Dinamis) ---
export default function HomePage() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                // Panggil API baru kita
                const response = await apiClient.get(
                    "/api/counselor/dashboard-data"
                );
                setDashboardData(response.data);
                setError(null);
            } catch (err) {
                console.error("Gagal mengambil data dashboard:", err);
                setError("Gagal memuat data dashboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []); // Hanya jalankan sekali saat halaman dimuat

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header sekarang dinamis (mengambil dari useAuth) */}
            <CounselorHeader />

            {/* Konten utama */}
            <main className="flex-grow p-4 space-y-6 pb-24">
                <WelcomeBanner />

                {/* Tampilkan Loading atau Error jika ada */}
                {loading && (
                    <div className="text-center p-10">
                        <div className="w-8 h-8 border-4 border-gray-300 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">
                            Memuat data...
                        </p>
                    </div>
                )}

                {error && (
                    <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Tampilkan data jika sukses dimuat */}
                {dashboardData && !loading && !error && (
                    <>
                        <BalanceCard balance={dashboardData.balance} />

                        <div>
                            <div className="flex justify-between items-center mb-3 px-1">
                                <h2 className="text-lg font-bold text-gray-800">
                                    Jadwal Terbaru
                                </h2>
                                <Link
                                    to="/counselor/schedule" // <-- Ganti ke Link
                                    className="text-sm font-medium text-cyan-500 hover:text-cyan-600"
                                >
                                    Lihat Semua
                                </Link>
                            </div>

                            {/* List Jadwal Dinamis */}
                            <div>
                                {dashboardData.upcomingSchedules.length > 0 ? (
                                    dashboardData.upcomingSchedules.map(
                                        (item) => (
                                            <ScheduleCard
                                                key={item.id}
                                                booking={item}
                                            />
                                        )
                                    )
                                ) : (
                                    <div className="text-center text-gray-500 p-6 bg-white rounded-lg shadow-md">
                                        <p>Tidak ada jadwal akan datang.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
