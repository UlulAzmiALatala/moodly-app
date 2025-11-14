import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios.js"; // <-- PERBAIKAN: Path 3x mundur
import { Calendar, Clock } from "lucide-react";

// --- Komponen Header ---
const ScheduleHeader = () => (
    <header className="relative bg-sky-500 h-28 flex items-center justify-center rounded-b-3xl shadow-md">
        <h1 className="text-xl font-bold text-white">Jadwal Pasien</h1>
    </header>
);

// --- Komponen Kartu Jadwal Individual (Sekarang Dinamis) ---
const PatientScheduleCard = ({ booking, onClick }) => {
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

    // Ambil data dari relasi
    const customer = booking.customer || {};
    const duration = booking.durasi_konseling || {};

    const customerName = customer.name || "Customer";
    const customerAvatar =
        customer.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}`;

    return (
        // --- Tambahkan onClick di sini ---
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-md p-4 mb-4 transition-all hover:shadow-lg hover:bg-gray-50 cursor-pointer"
        >
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

// --- Komponen Utama CounselorSchedulePage ---
export default function CounselorSchedulePage() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                setLoading(true);
                // Panggil API baru kita
                const response = await apiClient.get(
                    "/api/counselor/schedules"
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

        fetchSchedules();
    }, []); // Hanya jalankan sekali

    // --- Handler untuk klik kartu ---
    const handleCardClick = (bookingId) => {
        // Arahkan ke halaman detail (sesuai SS Anda berikutnya)
        navigate(`/counselor/schedule/${bookingId}`);
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="text-center p-10">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">
                        Memuat jadwal...
                    </p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg">
                    {error}
                </div>
            );
        }

        if (schedules.length === 0) {
            return (
                <div className="text-center text-gray-500 p-10 bg-white rounded-lg shadow-md">
                    <p>Tidak ada jadwal pasien yang akan datang.</p>
                </div>
            );
        }

        return schedules.map((item) => (
            <PatientScheduleCard
                key={item.id}
                booking={item}
                onClick={() => handleCardClick(item.id)}
            />
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header Halaman Jadwal Pasien */}
            <ScheduleHeader />

            {/* Konten utama yang bisa discroll */}
            <main className="flex-grow p-4 pt-6 space-y-4 pb-24">
                {renderContent()}
            </main>
        </div>
    );
}
