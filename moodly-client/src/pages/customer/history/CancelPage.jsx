import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
// --- PERBAIKAN: Hapus ekstensi .js ---
import apiClient from "../../../api/axios";

// --- Helper Format Tanggal ---
function formatDate(dateString) {
    try {
        const options = { day: "2-digit", month: "2-digit", year: "numeric" };
        return new Date(dateString)
            .toLocaleDateString("id-ID", options)
            .replace(/\//g, " - ");
    } catch (e) {
        return dateString; // fallback
    }
}

// --- HELPER BARU: Format Waktu ---
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
// --- AKHIR HELPER BARU ---

// Komponen untuk memilih alasan pembatalan
const CancellationPage = () => {
    const { id } = useParams(); // ID dari sesi yang dibatalkan
    const navigate = useNavigate();

    const [sessionData, setSessionData] = useState(null); // Untuk data sesi
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedReason, setSelectedReason] = useState(""); // Untuk alasan pembatalan
    const [note, setNote] = useState(""); // Catatan pembatalan
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Daftar alasan pembatalan
    const reasons = [
        "Ingin menjadwalkan ulang sesi",
        "Psikolog tidak responsif",
        "Saya tidak membutuhkan sesi ini lagi",
        "Jadwal saya bentrok",
        "Lainnya",
    ];

    // Fetch data sesi saat komponen dimuat
    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                setLoading(true);
                // Kita panggil API yang SAMA dengan DetailPage
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

    // Fungsi untuk menangani pembatalan
    const handleCancel = async () => {
        if (!selectedReason) {
            alert("Silakan pilih alasan pembatalan.");
            return;
        }
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Kirim data pembatalan ke API
            // (Backend HistoryController@cancel sekarang sudah siap menerima ini)
            await apiClient.patch(`/api/history/${id}/cancel`, {
                alasan: selectedReason,
                catatan: note,
            });

            // Arahkan kembali ke riwayat setelah berhasil
            // Tambahkan state untuk memberi tahu halaman riwayat agar refresh (opsional)
            navigate("/history", { state: { refresh: true } });
        } catch (err) {
            console.error("Gagal membatalkan sesi:", err);
            const apiError =
                err.response?.data?.message ||
                "Gagal membatalkan sesi. Coba lagi.";
            setError(apiError);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Tampilkan loading atau error
    if (loading) {
        return <div className="p-4 text-center">Memuat data sesi...</div>;
    }
    // Tampilkan error API di atas form jika ada (selain error loading)
    if (error && !sessionData) {
        return <div className="p-4 text-center text-red-500">{error}</div>;
    }
    if (!sessionData) {
        return <div className="p-4 text-center">Sesi tidak ditemukan.</div>;
    }

    // Ambil data konselor
    const konselor = sessionData.konselor || {};
    // --- PERBAIKAN: Gunakan jenis_konseling sebagai spesialisasi ---
    const specialization =
        sessionData.jenis_konseling?.jenis_konseling || "Konseling";
    // --- AKHIR PERBAIKAN ---

    // --- PERBAIKAN: Gunakan formatTimeRange ---
    const formattedTime = formatTimeRange(
        sessionData.jam_konsultasi,
        sessionData.durasi_konseling?.durasi_menit
    );
    // --- AKHIR PERBAIKAN ---

    // Fallback Avatar
    const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        konselor.name || "K"
    )}&background=EBF4FF&color=3B82F6&bold=true&size=64`;

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center mb-4">
                <button onClick={() => navigate(-1)} className="text-gray-800">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
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
                <h1 className="text-xl font-bold text-center text-gray-800 flex-grow">
                    Pembatalan
                </h1>
                <div className="w-6"></div> {/* Spacer */}
            </div>

            {/* Menampilkan error submit di atas */}
            {error && sessionData && (
                <div className="p-3 text-center text-sm text-red-700 bg-red-100 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {/* Informasi Sesi (Dinamis) */}
            <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
                <div className="flex items-center space-x-3">
                    <img
                        // --- PERBAIKAN: Fallback avatar ---
                        src={konselor.avatar || avatarFallback}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = avatarFallback;
                        }}
                        // --- AKHIR PERBAIKAN ---
                        alt={konselor.name || "Konselor"}
                        className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                        <h2 className="font-bold text-gray-900">
                            {konselor.name || "Konselor"}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {specialization}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-600 mt-2">
                            <span>
                                {formatDate(sessionData.tanggal_konsultasi)}
                            </span>
                            {/* --- PERBAIKAN: Gunakan waktu yang diformat --- */}
                            <span>{formattedTime}</span>
                        </div>
                        <span className="text-xs text-blue-600 font-semibold">
                            {sessionData.metode_konsultasi}
                        </span>
                    </div>
                </div>
            </div>

            {/* Pilih Alasan Pembatalan */}
            <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Pilih Alasan Pembatalan
                </label>
                <select
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    disabled={isSubmitting}
                >
                    <option value="" disabled>
                        Pilih alasan...
                    </option>
                    {reasons.map((reason, index) => (
                        <option key={index} value={reason}>
                            {reason}
                        </option>
                    ))}
                </select>
            </div>

            {/* Catatan Pembatalan */}
            <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Catatan
                </label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    rows={4}
                    placeholder="Masukkan catatan Anda (opsional)..."
                    disabled={isSubmitting}
                />
            </div>

            {/* Tombol Batalkan */}
            <div className="text-center">
                <button
                    onClick={handleCancel}
                    disabled={isSubmitting || !selectedReason}
                    className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                    {isSubmitting ? "Memproses..." : "Batalkan Sesi"}
                </button>
            </div>
        </div>
    );
};

export default CancellationPage;
