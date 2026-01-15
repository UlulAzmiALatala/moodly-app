import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../../../api/axios";
import {
    ArrowLeft,
    Clock,
    Calendar,
    MapPin,
    AlertTriangle,
    Loader2,
    GraduationCap, // Ikon Universitas
    Award, // Ikon Spesialisasi
    User,
} from "lucide-react";

// --- HOOK TIMER MUNDUR (2 JAM) ---
const usePaymentTimer = (createdAt) => {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: false,
    });

    useEffect(() => {
        if (!createdAt) return;

        // Hitung waktu deadline (Created At + 2 Jam)
        const createdDate = new Date(createdAt);
        const deadline = new Date(createdDate.getTime() + 2 * 60 * 60 * 1000);

        const interval = setInterval(() => {
            const now = new Date();
            const difference = deadline - now;

            if (difference <= 0) {
                clearInterval(interval);
                setTimeLeft({
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    isExpired: true,
                });
            } else {
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft({ hours, minutes, seconds, isExpired: false });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [createdAt]);

    return timeLeft;
};

export default function PaymentOfflinePage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Ambil data dari state navigasi sebelumnya
    const { booking, displayData } = location.state || {};

    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);

    // Panggil Hook Timer
    const { hours, minutes, seconds, isExpired } = usePaymentTimer(
        booking?.created_at
    );

    // Redirect jika data tidak ada
    useEffect(() => {
        if (!booking || !displayData) {
            console.warn("Data booking hilang, redirect ke home.");
            navigate("/home");
        }
    }, [booking, displayData, navigate]);

    // Format Rupiah
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };

    const handleBack = () => navigate(-1);

    const handleContinue = async () => {
        if (!agreed) return;
        if (isExpired) {
            alert("Waktu pembayaran telah habis. Silakan buat pesanan baru.");
            return;
        }

        setLoading(true);

        // Navigasi ke halaman QRIS
        setTimeout(() => {
            navigate(`/booking/payment/qris/${booking.id}`, {
                replace: true,
                state: { booking: booking },
            });
            setLoading(false);
        }, 500);
    };

    if (!booking || !displayData) return null;

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-32">
            {/* Header */}
            <header className="bg-cyan-500 p-4 pt-6 flex items-center sticky top-0 z-20 text-white rounded-b-3xl shadow-lg shadow-cyan-200/50">
                <button
                    onClick={handleBack}
                    className="p-2 -ml-2 mr-2 rounded-full hover:bg-white/20 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-center flex-grow -translate-x-4">
                    Konfirmasi Pembayaran
                </h1>
            </header>

            <main className="p-5 space-y-5">
                {/* 1. Card Timer (Dinamis 2 Jam) */}
                <div className="text-center mb-2">
                    {isExpired ? (
                        <span className="text-red-600 font-bold bg-red-100 px-4 py-2 rounded-full text-sm">
                            Waktu Pembayaran Habis
                        </span>
                    ) : (
                        <div className="flex flex-col items-center">
                            <p className="text-xs text-gray-500 mb-1">
                                Selesaikan Pembayaran dalam
                            </p>
                            <div className="flex items-center justify-center gap-1">
                                <span className="bg-blue-600 text-white px-2 py-1 rounded font-bold min-w-[32px] text-center">
                                    {String(hours).padStart(2, "0")}
                                </span>
                                <span className="font-bold text-gray-400">
                                    :
                                </span>
                                <span className="bg-blue-600 text-white px-2 py-1 rounded font-bold min-w-[32px] text-center">
                                    {String(minutes).padStart(2, "0")}
                                </span>
                                <span className="font-bold text-gray-400">
                                    :
                                </span>
                                <span className="bg-blue-600 text-white px-2 py-1 rounded font-bold min-w-[32px] text-center">
                                    {String(seconds).padStart(2, "0")}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Detail Pesanan */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-5">
                    {/* Kode Booking */}
                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                Kode Booking
                            </p>
                            <p className="text-sm font-bold text-gray-800 font-mono mt-0.5">
                                #
                                {booking.id
                                    ? String(booking.id).padStart(6, "0")
                                    : "-"}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                Tanggal
                            </p>
                            <p className="text-xs font-medium text-gray-600 mt-0.5">
                                {new Date(
                                    booking.created_at
                                ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Info Konselor (LENGKAP: Univ & Spesialisasi) */}
                    <div className="flex items-start gap-4">
                        <img
                            src={
                                displayData.counselorImage ||
                                `https://ui-avatars.com/api/?name=${displayData.counselorName}&background=random`
                            }
                            alt="Konselor"
                            className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-sm"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                            <h3 className="font-bold text-gray-900 text-base truncate">
                                {displayData.counselorName}
                            </h3>

                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <GraduationCap
                                    size={14}
                                    className="text-blue-500 shrink-0"
                                />
                                <span className="truncate">
                                    {displayData.counselorUniversity ||
                                        "Universitas tidak diketahui"}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Award
                                    size={14}
                                    className="text-orange-500 shrink-0"
                                />
                                <span className="truncate">
                                    Spesialisasi:{" "}
                                    {displayData.counselorSpecialty || "Umum"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Jadwal & Lokasi */}
                    <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-white rounded-lg shadow-sm text-gray-500">
                                <Calendar size={16} />
                            </div>
                            <p className="text-sm text-gray-700 font-medium">
                                {displayData.scheduleDateDisplay}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-white rounded-lg shadow-sm text-gray-500">
                                <Clock size={16} />
                            </div>
                            <p className="text-sm text-gray-700 font-medium">
                                {displayData.scheduleTime} WIB
                            </p>
                        </div>

                        {/* Lokasi (Khusus Offline) */}
                        <div className="flex items-start gap-3 pt-2 border-t border-gray-200/60 mt-2">
                            <div className="p-1.5 bg-white rounded-lg shadow-sm text-red-500 mt-0.5">
                                <MapPin size={16} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-800 font-bold">
                                    {displayData.tempatName ||
                                        "Lokasi Tatap Muka"}
                                </p>
                                <p className="text-xs text-gray-500 leading-snug mt-0.5">
                                    {displayData.tempatAddress ||
                                        "Alamat lengkap akan diinformasikan setelah pembayaran."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rincian Biaya */}
                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Biaya Konsultasi</span>
                            <span>
                                {formatCurrency(displayData.consultationFee)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Biaya Layanan</span>
                            <span>
                                {formatCurrency(displayData.serviceFee)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200 mt-3">
                            <span className="font-bold text-gray-800">
                                Total Bayar
                            </span>
                            <span className="text-xl font-extrabold text-cyan-600">
                                {formatCurrency(booking.total_harga)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Persetujuan */}
                <label className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="relative flex items-center pt-0.5">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            disabled={isExpired}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 transition-all checked:border-cyan-500 checked:bg-cyan-500 disabled:opacity-50"
                        />
                        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>
                    <span className="text-xs text-gray-500 leading-relaxed">
                        Saya menyetujui{" "}
                        <Link
                            to="#"
                            className="text-cyan-600 font-bold hover:underline"
                        >
                            Syarat & Ketentuan
                        </Link>{" "}
                        serta{" "}
                        <Link
                            to="#"
                            className="text-cyan-600 font-bold hover:underline"
                        >
                            Kebijakan Privasi
                        </Link>{" "}
                        layanan Moodly.
                    </span>
                </label>
            </main>

            {/* Bottom Action */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] max-w-md mx-auto z-20">
                <div className="flex gap-3">
                    <div className="flex-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Total Tagihan
                        </p>
                        <p className="text-lg font-extrabold text-gray-800">
                            {formatCurrency(booking.total_harga)}
                        </p>
                    </div>
                    <button
                        onClick={handleContinue}
                        disabled={!agreed || loading || isExpired}
                        className="flex-[1.5] bg-cyan-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-cyan-200 hover:bg-cyan-600 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin w-5 h-5" />
                        ) : (
                            "Bayar Sekarang"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
