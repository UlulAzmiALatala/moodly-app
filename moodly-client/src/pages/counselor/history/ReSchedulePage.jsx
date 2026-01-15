import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../api/axios";
import { Calendar, Clock, ChevronLeft, CalendarDays, Info } from "lucide-react";

// --- Components Layout ---
const MobileLayout = ({ children }) => (
    <div className="flex justify-center min-h-screen bg-gray-50 font-sans">
        <div className="w-full max-w-md min-h-screen bg-gray-50 flex flex-col relative shadow-2xl overflow-hidden">
            {children}
        </div>
    </div>
);

const Spinner = () => (
    <div className="flex justify-center items-center py-10">
        <div className="w-10 h-10 border-4 border-cyan-100 border-t-cyan-600 rounded-full animate-spin"></div>
    </div>
);

// --- Helper Format Tanggal ---
const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

export default function CounselorReschedulePage() {
    const navigate = useNavigate();
    const { id: bookingId } = useParams();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [tanggal, setTanggal] = useState("");
    const [jam, setJam] = useState("");

    // 1. Fetch Data Booking
    useEffect(() => {
        if (!bookingId) {
            navigate("/counselor/schedule");
            return;
        }

        const fetchBooking = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(
                    `/api/counselor/booking/${bookingId}`
                );
                const data = response.data;
                setBooking(data);

                // Isi default form dengan jadwal lama
                setTanggal(data.tanggal_konsultasi);
                setJam(data.jam_konsultasi.substring(0, 5));
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Gagal memuat data sesi.");
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId, navigate]);

    // 2. Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!tanggal || !jam) {
            setError("Tanggal dan Jam wajib diisi.");
            setIsSubmitting(false);
            return;
        }

        try {
            const jamFormatted = `${jam}:00`;
            await apiClient.post(
                `/api/counselor/booking/${bookingId}/reschedule`,
                {
                    tanggal_konsultasi: tanggal,
                    jam_konsultasi: jamFormatted,
                }
            );

            alert("Pengajuan jadwal ulang berhasil dikirim!");
            navigate(`/counselor/schedule/${bookingId}`);
        } catch (err) {
            console.error("Reschedule error:", err);
            const apiError =
                err.response?.data?.message || "Gagal mengubah jadwal.";

            if (err.response?.data?.conflict_with) {
                setError(
                    `Jadwal bentrok dengan sesi jam ${err.response.data.conflict_with}. Pilih waktu lain.`
                );
            } else if (err.response?.data?.errors) {
                const msgs = Object.values(err.response.data.errors).join("\n");
                setError(msgs);
            } else {
                setError(apiError);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <MobileLayout>
            {/* Header Modern */}
            <header className="relative bg-gradient-to-br from-cyan-600 to-blue-600 pb-28 pt-8 px-6 rounded-b-[3rem] shadow-xl z-10 overflow-hidden">
                {/* Dekorasi Background Header */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>

                <div className="relative z-10 flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition active:scale-95 border border-white/10"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <h1 className="text-lg font-bold text-white tracking-wide">
                        Reschedule Sesi
                    </h1>
                    <div className="w-10"></div> {/* Spacer */}
                </div>

                <div className="relative z-10 text-center text-white/90 max-w-xs mx-auto">
                    <p className="text-sm font-medium">
                        Ajukan perubahan waktu
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                        Status akan berubah menjadi menunggu konfirmasi customer
                    </p>
                </div>
            </header>

            {/* Konten Utama */}
            <div className="flex-1 px-5 -mt-20 pb-8 z-20">
                <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-gray-100 p-6 min-h-[450px] flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex flex-col justify-center items-center">
                            <Spinner />
                            <p className="text-center text-gray-400 text-xs animate-pulse mt-4">
                                Sedang memuat data...
                            </p>
                        </div>
                    ) : !booking ? (
                        <div className="flex-1 flex flex-col justify-center items-center text-center py-10">
                            <Info size={40} className="text-gray-300 mb-2" />
                            <p className="text-gray-500">
                                Data sesi tidak ditemukan.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Section: Customer Info & Jadwal Lama */}
                            <div className="mb-8">
                                <div className="flex items-center gap-4 mb-5">
                                    <div className="relative">
                                        <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-70 blur-[2px]"></div>
                                        <img
                                            src={
                                                booking.customer?.avatar ||
                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                    booking.customer?.name
                                                )}`
                                            }
                                            alt="Customer"
                                            className="w-14 h-14 rounded-full object-cover relative border-2 border-white"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider mb-0.5">
                                            Customer
                                        </p>
                                        <h3 className="text-lg font-bold text-gray-800 leading-tight">
                                            {booking.customer?.name}
                                        </h3>
                                    </div>
                                </div>

                                {/* Current Schedule Card */}
                                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-3 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                        Jadwal Saat Ini
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">
                                                Tanggal
                                            </p>
                                            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                <Calendar
                                                    size={14}
                                                    className="text-cyan-500"
                                                />
                                                {formatDate(
                                                    booking.tanggal_konsultasi
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">
                                                Jam
                                            </p>
                                            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                                <Clock
                                                    size={14}
                                                    className="text-cyan-500"
                                                />
                                                {booking.jam_konsultasi.substring(
                                                    0,
                                                    5
                                                )}{" "}
                                                WIB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Form Jadwal Baru */}
                            <form
                                onSubmit={handleSubmit}
                                className="flex-1 flex flex-col"
                            >
                                <div className="mb-2">
                                    <p className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                                        Pilih Jadwal Baru
                                    </p>

                                    <div className="space-y-4">
                                        {/* Input Tanggal */}
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <CalendarDays
                                                    size={18}
                                                    className="text-gray-400 group-focus-within:text-cyan-600 transition-colors"
                                                />
                                            </div>
                                            <input
                                                type="date"
                                                value={tanggal}
                                                onChange={(e) =>
                                                    setTanggal(e.target.value)
                                                }
                                                min={today}
                                                className="w-full bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-sm"
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        {/* Input Jam */}
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Clock
                                                    size={18}
                                                    className="text-gray-400 group-focus-within:text-cyan-600 transition-colors"
                                                />
                                            </div>
                                            <input
                                                type="time"
                                                value={jam}
                                                onChange={(e) =>
                                                    setJam(e.target.value)
                                                }
                                                className="w-full bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all shadow-sm"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-gray-400 mt-2 ml-1 flex items-center gap-1">
                                        <Info size={10} />
                                        Pastikan slot tersedia selama{" "}
                                        {
                                            booking.durasi_konseling
                                                ?.durasi_menit
                                        }{" "}
                                        menit.
                                    </p>
                                </div>

                                {/* Error Box */}
                                {error && (
                                    <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-3 animate-pulse">
                                        <Info
                                            size={16}
                                            className="text-red-500 mt-0.5 shrink-0"
                                        />
                                        <p className="text-xs text-red-600 font-medium leading-relaxed">
                                            {error}
                                        </p>
                                    </div>
                                )}

                                <div className="flex-1 min-h-[20px]"></div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-200 hover:shadow-cyan-300 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Mengirim Pengajuan...
                                        </span>
                                    ) : (
                                        "Ajukan Perubahan"
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </MobileLayout>
    );
}
