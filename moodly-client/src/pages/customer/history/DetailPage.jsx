import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios.js";

// --- 1. HOOK COUNTDOWN (Untuk Timer Pembayaran & Sesi) ---
const useCountdown = (targetDate) => {
    const targetTime = useMemo(() => {
        if (!targetDate) return null;
        return new Date(targetDate);
    }, [targetDate]);

    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: false,
    });

    useEffect(() => {
        if (!targetTime) return;

        const calculate = () => {
            const now = new Date();
            const difference = targetTime - now;

            if (difference <= 0) {
                return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
            }

            return {
                hours: Math.floor(difference / (1000 * 60 * 60)),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                isExpired: false,
            };
        };

        setTimeLeft(calculate());
        const timer = setInterval(() => setTimeLeft(calculate()), 1000);
        return () => clearInterval(timer);
    }, [targetTime]);

    return timeLeft;
};

// --- 2. HELPER FORMAT ---
const formatCurrency = (amount) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
const formatNum = (num) => String(num).padStart(2, "0");
const formatDateFull = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};
const formatTimeRange = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes) return "-";
    try {
        const [h, m] = startTime.split(":").map(Number);
        const start = new Date();
        start.setHours(h, m, 0);
        const end = new Date(start.getTime() + durationMinutes * 60000);
        const format = (d) =>
            d
                .toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                })
                .replace(".", ".");
        return `${format(start)} - ${format(end)}`;
    } catch {
        return startTime;
    }
};

// --- 3. IKON (Sederhana) ---
const Icons = {
    Back: () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
            />
        </svg>
    ),
    Copy: () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            className="text-[#00B2FF]"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
        </svg>
    ),
    Video: () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-[#00B2FF]"
        >
            <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
        </svg>
    ),
    Clock: () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            className="text-[#00B2FF]"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
        </svg>
    ),
};

export default function DetailRiwayatPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;
        const fetchBooking = async () => {
            try {
                setLoading(true);
                // Pastikan relasi 'paymentMethod' diload di backend (HistoryController@show)
                const res = await apiClient.get(`/api/history/${id}`);
                setBooking(res.data);
            } catch (err) {
                console.error(err);
                setError("Gagal memuat data.");
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [id]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => alert("Disalin!"));
    };

    if (loading)
        return (
            <div className="flex h-screen justify-center items-center">
                <div className="w-10 h-10 border-4 border-[#00B2FF] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    if (error || !booking)
        return (
            <div className="p-6 text-center text-red-500">
                {error || "Data tidak ditemukan"}
            </div>
        );

    // --- DATA EXTRACT ---
    const { konselor, durasi_konseling, payment_method, jenis_konseling } =
        booking;

    // Hitung target waktu bayar (24 jam dari created_at)
    const paymentDeadline = new Date(
        new Date(booking.created_at).getTime() + 24 * 60 * 60 * 1000
    );

    // --- RENDER KHUSUS STATUS: MENUNGGU PEMBAYARAN ---
    if (booking.status_pesanan === "Menunggu Pembayaran") {
        return (
            <div className="bg-white min-h-screen font-sans flex flex-col relative">
                {/* Header Biru */}
                <div className="bg-[#00B2FF] px-4 py-6 pb-8 flex items-center relative shadow-md z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-white absolute left-4 p-1"
                    >
                        <Icons.Back />
                    </button>
                    <h1 className="text-lg font-bold text-white w-full text-center">
                        Detail Riwayat
                    </h1>
                </div>

                <div className="px-5 -mt-2 pb-24">
                    {/* 1. Timer Pembayaran */}
                    <PaymentTimerDisplay targetDate={paymentDeadline} />

                    {/* 2. Kartu Virtual Account */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                            <span className="font-bold text-gray-800 text-[15px]">
                                {payment_method?.name || "Virtual Account"}
                            </span>
                            {/* Logo Bank (Hardcoded BCA sesuai gambar, bisa dinamis) */}
                            <div className="bg-[#00529C] text-white px-2 py-0.5 text-[10px] font-bold rounded">
                                BCA
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-gray-400 mb-1">
                                Nomer Virtual Account
                            </p>
                            <div className="flex justify-between items-center">
                                <span className="text-base font-bold text-gray-800">
                                    {payment_method?.account_details ||
                                        "8000812345678"}
                                </span>
                                <button
                                    onClick={() =>
                                        copyToClipboard(
                                            payment_method?.account_details
                                        )
                                    }
                                    className="p-1 hover:bg-blue-50 rounded"
                                >
                                    <Icons.Copy />
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-400 mb-1">
                                Total Pembayaran
                            </p>
                            <div className="flex justify-between items-center">
                                <span className="text-base font-bold text-gray-800">
                                    {formatCurrency(booking.total_harga)}
                                </span>
                                <button
                                    onClick={() =>
                                        copyToClipboard(booking.total_harga)
                                    }
                                    className="p-1 hover:bg-blue-50 rounded"
                                >
                                    <Icons.Copy />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 3. Kartu Detail Sesi (Outline Biru & Badge Kuning) */}
                    <div className="bg-white rounded-2xl border-[1.5px] border-[#00B2FF] p-5 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-[#00B2FF] text-[15px]">
                                    {booking.metode_konsultasi} Konseling
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {jenis_konseling?.jenis_konseling ||
                                        "Individu"}{" "}
                                    | {durasi_konseling?.durasi_menit || "?"}{" "}
                                    Menit Sesi
                                </p>
                            </div>
                            {/* Badge Kuning */}
                            <span className="bg-[#F6C444] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                                Menunggu Pembayaran
                            </span>
                        </div>

                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                            <img
                                src={
                                    konselor?.avatar ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        konselor?.name
                                    )}&background=EBF4FF&color=00B2FF`
                                }
                                className="w-12 h-12 rounded-full object-cover border border-gray-100"
                                alt="Konselor"
                            />
                            <div>
                                <h4 className="font-bold text-[#4A6FA5] text-sm">
                                    {konselor?.name}
                                </h4>
                                <p className="text-xs text-gray-400 w-40 truncate">
                                    {konselor?.spesialisasi
                                        ? konselor.spesialisasi.join(", ")
                                        : "Psikolog Klinis"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-700 mb-4">
                            <div className="font-bold text-black text-[13px]">
                                {formatDateFull(booking.tanggal_konsultasi)}
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                                <Icons.Video />
                                <span>{booking.metode_konsultasi}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                                <Icons.Clock />
                                <span>
                                    {formatTimeRange(
                                        booking.jam_konsultasi,
                                        durasi_konseling?.durasi_menit
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <div>
                                <p className="text-[10px] text-gray-400 mb-0.5">
                                    Konseling Booking ID
                                </p>
                                <p className="text-sm font-bold text-gray-800 tracking-tight">{`MOODLY-${booking.id}`}</p>
                            </div>
                            <button
                                onClick={() =>
                                    copyToClipboard(`MOODLY-${booking.id}`)
                                }
                                className="p-1 hover:bg-blue-50 rounded"
                            >
                                <Icons.Copy />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. Tombol Aksi Bawah (Fixed) */}
                <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20 max-w-md mx-auto">
                    <button
                        onClick={() =>
                            navigate(`/booking/upload-proof/${booking.id}`, {
                                state: { booking },
                            })
                        }
                        className="w-full bg-[#00B2FF] text-white font-bold py-3.5 rounded-full shadow-lg hover:bg-[#009cd9] transition active:scale-[0.98]"
                    >
                        Lihat Invoice Pembayaran
                    </button>
                </div>
            </div>
        );
    }

    // --- FALLBACK: Render Standar (Status Lain) ---
    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <div className="bg-[#00B2FF] p-4 pt-8 pb-6 text-white flex items-center mb-4 rounded-b-xl -mx-4 -mt-4 shadow-sm">
                <button onClick={() => navigate(-1)}>
                    <Icons.Back />
                </button>
                <h1 className="text-lg font-bold w-full text-center -ml-6">
                    Detail Riwayat
                </h1>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
                <h2 className="font-bold text-gray-800 mb-2 text-lg">
                    {booking.status_pesanan}
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                    Detail lengkap untuk status ini belum di desain khusus.
                </p>
                {/* Tambahkan tombol aksi standar di sini jika perlu */}
            </div>
        </div>
    );
}

// --- Sub-komponen Timer ---
const PaymentTimerDisplay = ({ targetDate }) => {
    const { hours, minutes, seconds, isExpired } = useCountdown(targetDate);
    if (isExpired)
        return (
            <div className="text-center text-red-500 font-bold my-4">
                Waktu Pembayaran Habis
            </div>
        );

    return (
        <div className="flex items-center justify-center gap-3 my-6">
            <span className="text-sm font-semibold text-[#2B5F9E]">
                Sisa Waktu Pembayaran
            </span>
            <div className="flex items-center gap-1 text-white font-bold text-[13px]">
                <div className="bg-[#0044CC] w-7 h-7 flex items-center justify-center rounded">
                    {formatNum(hours)}
                </div>
                <span className="text-[#0044CC] font-bold">:</span>
                <div className="bg-[#0044CC] w-7 h-7 flex items-center justify-center rounded">
                    {formatNum(minutes)}
                </div>
                <span className="text-[#0044CC] font-bold">:</span>
                <div className="bg-[#0044CC] w-7 h-7 flex items-center justify-center rounded">
                    {formatNum(seconds)}
                </div>
            </div>
        </div>
    );
};
