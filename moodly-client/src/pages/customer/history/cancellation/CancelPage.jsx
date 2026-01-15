import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../../api/axios";

// --- Helper Format ---
function formatDate(dateString) {
    try {
        const options = { day: "2-digit", month: "2-digit", year: "numeric" };
        return new Date(dateString)
            .toLocaleDateString("id-ID", options)
            .replace(/\//g, " - ");
    } catch (e) {
        return dateString;
    }
}
const formatTimeRange = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes) return startTime || "...";
    try {
        const start = startTime.substring(0, 5);
        const minutes = parseInt(String(durationMinutes).split(" ")[0]);
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

// --- Header Halaman ---
const PageHeader = ({ title, onBack }) => (
    <div className="sticky top-0 z-10 flex items-center p-4 bg-white border-b border-gray-200 shadow-sm">
        <button
            onClick={onBack}
            className="text-gray-800 p-1 hover:bg-gray-100 rounded-full transition"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-6 h-6"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                />
            </svg>
        </button>
        <h1 className="text-lg font-bold text-center text-gray-900 flex-grow">
            {title}
        </h1>
        <div className="w-8"></div>
    </div>
);

// --- Komponen Pilihan Alasan ---
const ReasonSelector = ({ reason, selectedReason, setSelectedReason }) => {
    const isSelected = reason === selectedReason;
    return (
        <label
            className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                isSelected
                    ? "bg-cyan-50 border-cyan-500 ring-1 ring-cyan-200"
                    : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
        >
            <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? "border-cyan-500" : "border-gray-300"
                }`}
            >
                {isSelected && (
                    <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full"></div>
                )}
            </div>
            <input
                type="radio"
                name="cancel-reason"
                value={reason}
                checked={isSelected}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="hidden"
            />
            <span
                className={`ml-3 text-sm font-medium ${
                    isSelected ? "text-cyan-900" : "text-gray-700"
                }`}
            >
                {reason}
            </span>
        </label>
    );
};

// --- Mobile Layout ---
const MobileLayout = ({ children }) => (
    <div className="flex justify-center min-h-screen bg-gray-100 font-sans">
        <div className="w-full max-w-md min-h-screen bg-gray-50 flex flex-col relative shadow-xl">
            {children}
        </div>
    </div>
);

// --- Komponen Utama Halaman ---
const CancelPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReason, setSelectedReason] = useState("");
    const [note, setNote] = useState("");

    const reasons = [
        "Ingin menjadwalkan ulang sesi",
        "Psikolog tidak responsif",
        "Saya tidak membutuhkan sesi ini lagi",
        "Jadwal saya bentrok",
        "Lainnya",
    ];

    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/api/history/${id}`);
                setSessionData(response.data);
            } catch (err) {
                console.error("Gagal mengambil data sesi:", err);
                setError("Gagal memuat data sesi.");
            } finally {
                setLoading(false);
            }
        };
        fetchSessionData();
    }, [id]);

    const handleNext = () => {
        if (!selectedReason) {
            alert("Silakan pilih alasan pembatalan terlebih dahulu.");
            return;
        }

        // --- PERBAIKAN: Kirim data terpisah ke halaman Agreement ---
        navigate(`/history/cancel-agreement/${id}`, {
            state: {
                reason: selectedReason, // Alasan utama
                note: note, // Catatan tambahan
                booking: sessionData,
            },
        });
    };

    if (loading) {
        return (
            <MobileLayout>
                <PageHeader title="Pembatalan" onBack={() => navigate(-1)} />
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-cyan-500 rounded-full animate-spin mb-3"></div>
                    Memuat data...
                </div>
            </MobileLayout>
        );
    }

    if (error || !sessionData) {
        return (
            <MobileLayout>
                <PageHeader title="Error" onBack={() => navigate(-1)} />
                <div className="p-10 text-center text-red-500 bg-white m-4 rounded-xl shadow-sm">
                    <p className="font-bold">Terjadi Kesalahan</p>
                    <p className="text-sm mt-1">
                        {error || "Sesi tidak ditemukan"}
                    </p>
                </div>
            </MobileLayout>
        );
    }

    // Data siap
    const konselor = sessionData.konselor || {};
    const specialization =
        sessionData.jenis_konseling?.jenis_konseling || "Konseling";
    const formattedTime = formatTimeRange(
        sessionData.jam_konsultasi,
        sessionData.durasi_konseling?.durasi_menit
    );
    const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        konselor.name || "K"
    )}&background=EBF4FF&color=3B82F6&bold=true&size=64`;

    return (
        <MobileLayout>
            <PageHeader title="Batalkan Sesi" onBack={() => navigate(-1)} />

            <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-28">
                {/* 1. Kartu Informasi Sesi */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Sesi yang dibatalkan
                    </h3>
                    <div className="flex items-center space-x-3">
                        <img
                            src={konselor.avatar || avatarFallback}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = avatarFallback;
                            }}
                            alt={konselor.name || "Konselor"}
                            className="w-14 h-14 rounded-full object-cover border border-gray-100"
                        />
                        <div>
                            <h2 className="font-bold text-gray-900 text-sm">
                                {konselor.name || "Konselor"}
                            </h2>
                            <p className="text-xs text-gray-500 mb-1">
                                {specialization}
                            </p>
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                                <span>
                                    {formatDate(sessionData.tanggal_konsultasi)}
                                </span>
                                <span className="text-gray-300">|</span>
                                <span>{formattedTime}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Pilihan Alasan */}
                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-3 px-1">
                        Mengapa Anda membatalkan?
                    </label>
                    <div className="space-y-2.5">
                        {reasons.map((reason, index) => (
                            <ReasonSelector
                                key={index}
                                reason={reason}
                                selectedReason={selectedReason}
                                setSelectedReason={setSelectedReason}
                            />
                        ))}
                    </div>
                </div>

                {/* 3. Catatan Tambahan */}
                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2 px-1">
                        Catatan Tambahan (Opsional)
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                        rows={3}
                        placeholder="Ceritakan lebih detail alasan Anda..."
                    />
                </div>
            </div>

            {/* --- TOMBOL STICKY --- */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-20">
                <button
                    onClick={handleNext}
                    disabled={!selectedReason}
                    className={`w-full py-3.5 font-bold rounded-xl shadow-md transition-all active:scale-95 ${
                        selectedReason
                            ? "bg-cyan-500 text-white hover:bg-cyan-600 hover:shadow-lg"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                >
                    Lanjut ke Konfirmasi
                </button>
            </div>
        </MobileLayout>
    );
};

export default CancelPage;
