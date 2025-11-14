import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import apiClient from "../../../api/axios.js"; // Path 3x mundur + .js
import { useAuth } from "../../../context/AuthContext.jsx"; // Path 3x mundur + .jsx

// --- Komponen Ikon ---
const BackArrowIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
        />
    </svg>
);
const StarIcon = ({ filled = true }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 ${filled ? "text-yellow-400" : "text-gray-300"}`}
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);
// --- Akhir Komponen Ikon ---

// --- Helper & Layout ---
const MobileLayout = ({ children }) => (
    <div className="flex justify-center min-h-screen bg-white">
        <div className="w-full max-w-md min-h-screen bg-white flex flex-col">
            {children}
        </div>
    </div>
);
const Spinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-cyan-500 rounded-full animate-spin"></div>
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
// --- Akhir Helper & Layout ---

export default function CounselorScheduleDetailPage() {
    const navigate = useNavigate();
    const { id: bookingId } = useParams(); // Ambil ID dari URL
    const { user } = useAuth(); // Ambil konselor yang login

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Untuk tombol 'Selesai'

    // Fetch data booking detail
    useEffect(() => {
        if (!bookingId) {
            setError("Booking ID tidak ditemukan.");
            setLoading(false);
            return;
        }

        const fetchBookingDetail = async () => {
            try {
                setLoading(true);
                // Panggil API baru kita (ScheduleController@show)
                const response = await apiClient.get(
                    `/api/counselor/booking/${bookingId}`
                );
                setBooking(response.data);
                setError(null);
            } catch (err) {
                console.error("Gagal mengambil detail booking:", err);
                setError("Gagal memuat data sesi.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetail();
    }, [bookingId]);

    // Handler untuk tombol "Selesai"
    const handleCompleteSession = async () => {
        if (isSubmitting) return;
        if (
            !window.confirm(
                "Anda yakin ingin menandai sesi ini sebagai 'Selesai'?"
            )
        ) {
            return;
        }

        setIsSubmitting(true);
        try {
            // Panggil API baru kita (ScheduleController@completeSession)
            const response = await apiClient.post(
                `/api/counselor/booking/${bookingId}/complete`
            );
            // Perbarui state booking dengan data baru dari server
            setBooking(response.data.booking);
            alert("Sesi berhasil ditandai sebagai Selesai.");
        } catch (err) {
            const apiError =
                err.response?.data?.message || "Gagal menyelesaikan sesi.";
            console.error("Gagal selesaikan sesi:", err);
            alert(apiError);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Fungsi Render Dinamis ---

    // Menampilkan detail info (No.Telp, Rating, Status)
    const renderDynamicDetails = (booking) => {
        const status = booking.status_pesanan;

        // Jika sesi AKAN DATANG / AKTIF (logika dari RecallPage)
        const activeStatuses = [
            "Dijadwalkan",
            "Aktif",
            "Proses",
            "Menunggu Konfirmasi",
        ];
        if (activeStatuses.includes(status)) {
            if (booking.metode_konsultasi !== "Chat") {
                return (
                    <div className="flex items-center">
                        <span className="w-[90px] font-semibold">
                            No. Telepon
                        </span>
                        <span className="w-[10px] text-center">:</span>
                        <span className="flex-1">
                            {booking.customer?.phone || "Tidak ada"}
                        </span>
                    </div>
                );
            }
            return null; // Tidak ada info tambahan untuk Chat
        }

        // Jika sesi SELESAI (logika dari RatingPage & EndPage)
        if (status === "Selesai") {
            return (
                <>
                    <div className="flex items-center">
                        <span className="w-[90px] font-semibold">Ulasan</span>
                        <span className="w-[10px] text-center">:</span>
                        {/* Ganti ulasan_customer dengan nama kolom yang benar di DB Anda */}
                        <span className="flex-1">
                            “
                            {booking.ulasan_customer ||
                                "Customer belum memberi ulasan"}
                            ”
                        </span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-[90px] font-semibold">Rating</span>
                        <span className="w-[10px] text-center">:</span>
                        <span className="flex-1 text-yellow-400">
                            {booking.rating ? (
                                [...Array(5)].map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        filled={i < booking.rating}
                                    />
                                ))
                            ) : (
                                <span className="text-gray-500 text-xs">
                                    Belum ada rating
                                </span>
                            )}
                        </span>
                    </div>
                </>
            );
        }

        // Jika Dibatalkan atau status lain
        return (
            <div className="flex items-center">
                <span className="w-[90px] font-semibold">Status</span>
                <span className="w-[10px] text-center">:</span>
                <span className="flex-1 text-red-500 font-medium">
                    {booking.status_pesanan}
                </span>
            </div>
        );
    };

    // Menampilkan tombol dinamis
    const renderDynamicButtons = (booking) => {
        const status = booking.status_pesanan;
        const activeStatuses = [
            "Dijadwalkan",
            "Aktif",
            "Proses",
            "Menunggu Konfirmasi",
        ];

        // Jika sesi AKAN DATANG / AKTIF (logika dari SchedulePage & RecallPage)
        if (activeStatuses.includes(status)) {
            return (
                <div className="mt-8 w-full flex flex-col items-center gap-4">
                    <Link
                        // Arahkan ke halaman chat KONSelor
                        to={`/counselor/chat/${booking.id}`}
                        className="w-[85%] text-center bg-[#00B2FF] text-white font-semibold py-3 rounded-full shadow-md hover:opacity-90 transition"
                    >
                        {booking.metode_konsultasi === "Chat"
                            ? "Mulai Chat"
                            : "Hubungi (Via Chat)"}
                    </Link>

                    <button
                        onClick={handleCompleteSession}
                        disabled={isSubmitting}
                        className="w-[85%] bg-gray-700 text-white font-semibold py-3 rounded-full shadow-md hover:bg-gray-800 transition disabled:bg-gray-400"
                    >
                        {isSubmitting ? "Memproses..." : "Tandai Selesai"}
                    </button>
                </div>
            );
        }

        // Jika sesi SELESAI (logika dari RatingPage)
        if (status === "Selesai") {
            return (
                <div className="mt-8 w-full flex flex-col items-center">
                    <Link
                        to={`/counselor/chat/${booking.id}`} // Tombol "Riwayat Obrolan"
                        className="w-[85%] text-center bg-[#00B2FF] text-white font-semibold py-3 rounded-full shadow-md hover:opacity-90 transition"
                    >
                        Riwayat Obrolan
                    </Link>
                </div>
            );
        }

        // Jika Dibatalkan (logika dari EndPage), tidak ada tombol
        return null;
    };

    // --- Render Halaman Utama ---

    if (loading) {
        return (
            <MobileLayout>
                <ScheduleHeaderLoading />
                <Spinner />
            </MobileLayout>
        );
    }

    if (error || !booking) {
        return (
            <MobileLayout>
                <ScheduleHeaderLoading />
                <div className="p-6 text-center text-red-600">
                    {error || "Data tidak ditemukan."}
                </div>
            </MobileLayout>
        );
    }

    // Data sudah siap
    const customer = booking.customer || {};
    const duration = booking.durasi_konseling || {};

    return (
        <MobileLayout>
            <div className="flex flex-col h-full w-full bg-[#00D1FF] relative overflow-hidden">
                {/* HEADER DINAMIS */}
                <header className="w-full p-4 pt-8 pb-10 z-20 bg-[#00D1FF] relative">
                    <div className="flex items-center justify-between">
                        <button
                            className="text-white"
                            onClick={() => navigate(-1)}
                            aria-label="Kembali"
                        >
                            <BackArrowIcon />
                        </button>
                        <h1 className="absolute left-1/2 -translate-x-1/2 font-semibold text-white text-xl truncate px-12">
                            {customer.name || "Detail Sesi"}
                        </h1>
                        <div className="w-6"></div>
                    </div>
                </header>

                {/* Lengkungan bawah header */}
                <div className="absolute top-[88px] left-0 w-full overflow-hidden leading-[0] z-10">
                    <svg
                        className="relative block w-full h-[55px]"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 500 80"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M0,0 C150,55 350,0 500,45 L500,00 L0,0 Z"
                            fill="#00D1FF"
                        ></path>
                    </svg>
                </div>

                {/* KONTEN PUTIH DINAMIS */}
                <div className="flex-1 flex flex-col bg-white pt-10 z-10 rounded-t-[2rem] items-center">
                    <main className="flex flex-col items-center justify-start p-6 w-full max-w-sm flex-grow">
                        {/* CARD INFO DINAMIS */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 w-full text-center">
                            <img
                                src={
                                    customer.avatar_url ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        customer.name || "C"
                                    )}`
                                }
                                alt={customer.name}
                                className="w-28 h-28 rounded-full object-cover mx-auto mb-4"
                            />
                            <h2 className="font-semibold text-base text-gray-800 mb-6">
                                {customer.name}
                            </h2>

                            {/* INFO DETAIL DINAMIS */}
                            <div className="mx-auto text-sm text-gray-700 w-[90%] space-y-3 text-left">
                                <div className="flex items-center">
                                    <span className="w-[90px] font-semibold">
                                        Jadwal
                                    </span>
                                    <span className="w-[10px] text-center">
                                        :
                                    </span>
                                    <span className="flex-1">
                                        {formatDate(booking.tanggal_konsultasi)}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-[90px] font-semibold">
                                        Jam
                                    </span>
                                    <span className="w-[10px] text-center">
                                        :
                                    </span>
                                    <span className="flex-1">
                                        {formatTimeRange(
                                            booking.jam_konsultasi,
                                            duration.durasi_menit
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-[90px] font-semibold">
                                        Metode
                                    </span>
                                    <span className="w-[10px] text-center">
                                        :
                                    </span>
                                    <span className="flex-1">
                                        {booking.metode_konsultasi}
                                    </span>
                                </div>

                                {/* Tampilkan No.Telp / Rating / Status */}
                                {renderDynamicDetails(booking)}
                            </div>
                        </div>

                        {/* TOMBOL DINAMIS */}
                        {renderDynamicButtons(booking)}
                    </main>
                </div>
            </div>
        </MobileLayout>
    );
}

// Header statis untuk fallback saat loading/error
const ScheduleHeaderLoading = () => (
    <header className="w-full p-4 pt-8 pb-10 z-20 bg-[#00D1FF] relative">
        <div className="flex items-center justify-between">
            <button className="text-white" disabled>
                <BackArrowIcon />
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 font-semibold text-white text-xl">
                Memuat Sesi...
            </h1>
            <div className="w-6"></div>
        </div>
    </header>
);
