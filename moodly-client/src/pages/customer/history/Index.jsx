import React, { useState, useEffect } from "react";
// --- PERBAIKAN: Tambahkan 'useNavigate' DAN 'useLocation' ---
import { Link, useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../../../api/axios";

// --- Icon untuk Tombol Kembali ---
const BackIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

// --- Komponen Tab (Style Disesuaikan) ---
const TabButton = ({ label, statusKey, activeTab, onClick }) => {
    const isActive = activeTab === statusKey;
    return (
        <button
            onClick={() => onClick(statusKey)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
                isActive
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700"
            }`}
        >
            {label}
        </button>
    );
};

// --- Komponen UI Bawaan ---
const LoadingSpinner = () => <div className="p-4 text-center">Memuat...</div>;
const Pagination = ({ pagination, onPageChange }) => (
    <div className="flex justify-between px-4">
        <button
            onClick={() => onPageChange(pagination.current_page - 1)}
            disabled={!pagination.prev_page_url}
            className="px-4 py-2 bg-gray-300 text-sm rounded-lg disabled:opacity-50"
        >
            Sebelumnya
        </button>
        <span className="self-center text-sm text-gray-700">
            Halaman {pagination.current_page}
        </span>
        <button
            onClick={() => onPageChange(pagination.current_page + 1)}
            disabled={!pagination.next_page_url}
            className="px-4 py-2 bg-gray-300 text-sm rounded-lg disabled:opacity-50"
        >
            Berikutnya
        </button>
    </div>
);

// --- Helper Format Tanggal & Waktu (Sesuai Desain) ---
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

        const minutes = parseInt(String(durationMinutes).split(" ")[0]);
        if (isNaN(minutes)) return start;

        const [startHour, startMin] = start.split(":").map(Number);
        const endDate = new Date();
        endDate.setHours(startHour, startMin + minutes, 0, 0);

        const endHour = String(endDate.getHours()).padStart(2, "0");
        const endMin = String(endDate.getMinutes()).padStart(2, "0");

        return `${start} - ${endHour}:${endMin}`; // "16:00 - 18:00"
    } catch (e) {
        return startTime.substring(0, 5);
    }
};

// --- Komponen Card ---
const BookingCard = ({ booking, activeTab }) => {
    const navigate = useNavigate();

    const counselorName = booking.konselor?.name || "Konselor Dihapus";
    const counselorPhoto =
        booking.konselor?.avatar || // Gunakan 'avatar' (URL lengkap dari accessor)
        `https://ui-avatars.com/api/?name=${counselorName.replace(
            /\s/g,
            "+"
        )}&background=random`;

    // Mendapatkan tag metode (Chat, Video Call, Tatap Muka)
    const getMethodTag = () => {
        let text, bgColor, textColor;
        switch (booking.metode_konsultasi) {
            case "Video Call":
                text = "Video Call";
                bgColor = "bg-green-100";
                textColor = "text-green-700";
                break;
            case "Tatap Muka":
                text = "Tatap Muka";
                bgColor = "bg-purple-100";
                textColor = "text-purple-700";
                break;
            case "Chat":
            default:
                text = "Chat";
                bgColor = "bg-blue-100";
                textColor = "text-blue-700";
        }
        return (
            <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${bgColor} ${textColor}`}
            >
                {text}
            </span>
        );
    };

    // Handler untuk 'Mulai' (Punya Logika)
    const handleStartSession = () => {
        if (booking.metode_konsultasi === "Tatap Muka") {
            // Offline -> Ke Halaman Detail Riwayat
            navigate(`/history/${booking.id}`);
        } else {
            // Online (Chat, VC, Call) -> Ke Halaman Sesi
            navigate(`/session/chat/${booking.id}`);
        }
    };

    // --- LOGIKA TOMBOL KONDISIONAL ---
    const renderCardActions = () => {
        // --- Komponen Link ---
        const PrimaryLink = ({ to, state, children }) => (
            <Link
                to={to}
                state={state}
                className="px-5 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-600"
            >
                {children}
            </Link>
        );
        const SecondaryLink = ({ to, children }) => (
            <Link
                to={to}
                className="px-5 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200"
            >
                {children}
            </Link>
        );
        // --- Komponen Button ---
        const PrimaryButton = ({ onClick, children }) => (
            <button
                onClick={onClick}
                className="px-5 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-600"
            >
                {children}
            </button>
        );

        switch (activeTab) {
            case "upcoming":
                return (
                    <div className="flex gap-2">
                        {/* Tombol Batalkan link ke CancelPage */}
                        <SecondaryLink to={`/history/cancel/${booking.id}`}>
                            Batalkan
                        </SecondaryLink>
                        {/* Tombol Mulai menggunakan handler */}
                        <PrimaryButton onClick={handleStartSession}>
                            {booking.metode_konsultasi === "Tatap Muka"
                                ? "Detail"
                                : "Mulai"}
                        </PrimaryButton>
                    </div>
                );
            case "canceled":
                return (
                    <div className="flex justify-between items-center w-full">
                        <span className="text-sm font-medium text-red-600">
                            Telah Dibatalkan
                        </span>
                        {/* Link ke CancelDetailPage */}
                        <PrimaryLink
                            to={`/history/cancel-detail/${booking.id}`}
                        >
                            Detail
                        </PrimaryLink>
                    </div>
                );
            case "unpaid":
                return (
                    <div className="flex gap-2">
                        <SecondaryLink to={`/history/${booking.id}`}>
                            Lihat Detail
                        </SecondaryLink>
                        {/* Link ke QRIS */}
                        <PrimaryLink
                            to={`/booking/payment/qris/${booking.id}`}
                            state={{ booking: booking }}
                        >
                            Bayar Sekarang
                        </PrimaryLink>
                    </div>
                );
            case "completed":
                return (
                    <div className="flex gap-2">
                        {/* Link ke session/chat */}
                        <SecondaryLink to={`/session/chat/${booking.id}`}>
                            Riwayat Chat
                        </SecondaryLink>
                        {/* Link ke history/rating */}
                        <PrimaryLink to={`/history/rating/${booking.id}`}>
                            Beri Nilai
                        </PrimaryLink>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mx-4">
            {/* Tag Kuning (Hanya untuk Belum Dibayar) */}
            {activeTab === "unpaid" && (
                <div className="border-b border-gray-100 pb-3 mb-3">
                    <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded">
                        Menunggu Pembayaran
                    </span>
                    {/* TODO: Implementasi Timer dinamis di sini */}
                    <div className="flex gap-1.5 mt-2">
                        <span className="px-2 py-1 bg-blue-600 text-white text-sm font-bold rounded-md">
                            01
                        </span>
                        <span className="self-center font-bold text-blue-600">
                            :
                        </span>
                        <span className="px-2 py-1 bg-blue-600 text-white text-sm font-bold rounded-md">
                            39
                        </span>
                        <span className="self-center font-bold text-blue-600">
                            :
                        </span>
                        <span className="px-2 py-1 bg-blue-600 text-white text-sm font-bold rounded-md">
                            04
                        </span>
                    </div>
                </div>
            )}

            {/* Info Spesialisasi */}
            <p className="text-xs text-gray-500 mb-2">
                Spesialisasi:{" "}
                {booking.jenis_konseling?.jenis_konseling || "Konseling"}
            </p>

            {/* Info Utama Konselor & Waktu */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 pr-3">
                    <h3 className="text-base font-bold text-gray-900 mb-1.5">
                        {counselorName}
                    </h3>
                    <p className="flex items-center text-xs text-gray-600 mb-1">
                        <span className="w-4 h-4 mr-1.5">🗓️</span>
                        {formatDate(booking.tanggal_konsultasi)}
                    </p>
                    <p className="flex items-center text-xs text-gray-600">
                        <span className="w-4 h-4 mr-1.5">⏰</span>
                        {formatTimeRange(
                            booking.jam_konsultasi,
                            booking.durasi_konseling?.durasi_menit
                        )}
                    </p>
                </div>
                <img
                    src={counselorPhoto}
                    alt={counselorName}
                    className="w-12 h-12 rounded-full object-cover bg-gray-200 flex-shrink-0"
                />
            </div>

            {/* Tag Metode (Chat/Video/Tatap Muka) */}
            <div className="mb-4">{getMethodTag()}</div>

            {/* Aksi Tombol Bawah */}
            <div className="flex justify-end">{renderCardActions()}</div>
        </div>
    );
};

// --- Komponen Utama Halaman ---
export default function HistoryIndex() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState("upcoming");

    // --- State baru untuk memicu refresh ---
    const location = useLocation(); // <-- INI YANG MEMBUTUHKAN IMPORT

    useEffect(() => {
        const fetchHistory = async (page) => {
            setLoading(true);
            setError(null);
            try {
                const response = await axiosClient.get(
                    `/api/history?page=${page}&status=${activeTab}`
                );
                setBookings(
                    page === 1
                        ? response.data.data
                        : (prev) => [...prev, ...response.data.data]
                );
                const { data, ...meta } = response.data;
                setPagination(meta);
            } catch (err) {
                console.error("Error fetching history:", err);
                setError("Gagal memuat riwayat booking.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory(currentPage);

        // Cek state 'refresh' dari CancelPage
        if (location.state?.refresh) {
            // Hapus state agar tidak refresh terus menerus
            window.history.replaceState({}, document.title);
            // Fetch ulang data untuk tab saat ini
            fetchHistory(1);
        }
    }, [currentPage, activeTab, location.state]); // Tambahkan location.state

    const handlePageChange = (newPage) => {
        if (newPage > 0 && pagination && newPage <= pagination.last_page) {
            setCurrentPage(newPage);
        }
    };

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        setCurrentPage(1); // Reset ke halaman 1
        setBookings([]); // Kosongkan data lama
    };

    // --- Render Logic ---
    let content;
    if (loading && currentPage === 1) {
        content = (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    } else if (error) {
        content = (
            <div className="text-center text-red-600 p-6 bg-red-50 rounded-lg shadow mx-4">
                <p className="font-semibold">{error}</p>
            </div>
        );
    } else if (bookings.length === 0) {
        content = (
            <div className="text-center text-gray-500 p-10 bg-gray-50 rounded-lg shadow-inner mx-4">
                <p className="text-lg font-medium">
                    Tidak ada data untuk kategori ini.
                </p>
            </div>
        );
    } else {
        content = (
            <div className="space-y-4">
                {bookings.map((booking) => (
                    <BookingCard
                        key={booking.id}
                        booking={booking}
                        activeTab={activeTab}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white-100 flex-grow min-h-screen">
            {/* --- HEADER BARU (SESUAI DESAIN) --- */}
            <header className="p-4 sticky top-0 z-20 bg-blue-500 text-white flex items-center shadow-lg">
                <Link to="/home" className="p-1 -ml-1">
                    <BackIcon />
                </Link>
                <h1 className="text-lg font-bold text-white text-center flex-grow">
                    Riwayat
                </h1>
                <div className="w-6"></div>{" "}
            </header>

            {/* --- Tombol Tab (Sticky di bawah header) --- */}
            <div className="sticky top-[60px] z-10 bg-white px-4 py-3 shadow-sm overflow-x-auto">
                <div className="flex space-x-2">
                    <TabButton
                        label="Akan Datang"
                        statusKey="upcoming"
                        activeTab={activeTab}
                        onClick={handleTabChange}
                    />
                    <TabButton
                        label="Dibatalkan"
                        statusKey="canceled"
                        activeTab={activeTab}
                        onClick={handleTabChange}
                    />
                    <TabButton
                        label="Belum Dibayar"
                        statusKey="unpaid"
                        activeTab={activeTab}
                        onClick={handleTabChange}
                    />
                    <TabButton
                        label="Selesai"
                        statusKey="completed"
                        activeTab={activeTab}
                        onClick={handleTabChange}
                    />
                </div>
            </div>

            {/* Konten (Kartu) */}
            <div className="py-6">
                {content}

                {/* Pagination */}
                {!loading &&
                    !error &&
                    pagination &&
                    pagination.last_page > 1 && (
                        <div className="mt-8">
                            <Pagination
                                pagination={pagination}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
            </div>
        </div>
    );
}
