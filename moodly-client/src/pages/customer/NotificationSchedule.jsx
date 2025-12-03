import React, { useState, useEffect } from "react";
// --- 1. IMPORT HOOKS ASLI ---
import { useNavigate, useParams, Link } from "react-router-dom";
import apiClient from "../../api/axios"; // Sesuaikan path

// --- 2. KOMPONEN LAYOUT (Gunakan PageLayout, bukan MobileLayout kustom) ---
// (Kita akan hapus MobileLayout internal dan style object)

// --- 3. HELPER BARU (Format Tanggal & Waktu) ---
const formatDateTime = (dateString, timeString) => {
    if (!dateString || !timeString) return "N/A";
    try {
        const dateTime = new Date(`${dateString}T${timeString}`);
        return dateTime
            .toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
            })
            .replace(/\./g, ":"); // Ganti titik jadi : (misal 14.00 -> 14:00)
    } catch (e) {
        return "Invalid Date";
    }
};

// --- Ikon (Tidak Berubah) ---
const WarningIcon = () => {
    const shadowStyle = {
        filter: "drop-shadow(0 4px 10px rgba(249, 115, 22, 0.3))",
    };
    return (
        <svg
            width="80"
            height="80"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            style={shadowStyle}
        >
            <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#F97316"
                strokeWidth="6"
                fill="none"
            />
            <circle cx="50" cy="50" r="38" fill="#FDE047" />
            <polygon points="50,28 78,72 22,72" fill="#1F2937" />
            <rect x="47" y="42" width="6" height="16" rx="3" fill="#FDE044" />
            <circle cx="50" cy="65" r="3" fill="#FDE047" />
        </svg>
    );
};

// --- Komponen Loading Spinner ---
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-cyan-500 rounded-full animate-spin"></div>
    </div>
);

export default function NotificationSchedule() {
    // --- 4. STATE DINAMIS ---
    const { id: bookingId } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- 5. FETCH DATA BOOKING ---
    useEffect(() => {
        if (!bookingId) {
            setError("ID Booking tidak ditemukan.");
            setLoading(false);
            return;
        }

        apiClient
            .get(`/api/history/${bookingId}`)
            .then((response) => {
                const data = response.data;
                // Validasi: Cek apakah booking ini memang menunggu konfirmasi
                if (data.status_pesanan !== "Menunggu Konfirmasi Customer") {
                    setError(
                        "Pengajuan jadwal ulang ini sudah tidak valid atau sudah dikonfirmasi."
                    );
                }
                setBooking(data);
            })
            .catch((err) => {
                console.error("Gagal fetch data booking:", err);
                setError("Gagal memuat data pengajuan jadwal ulang.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [bookingId]);

    // --- 6. FUNGSI HANDLER UNTUK TOMBOL ---
    const handleAction = async (action) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setError(null);

        const endpoint =
            action === "approve"
                ? `/api/history/${bookingId}/reschedule/approve`
                : `/api/history/${bookingId}/reschedule/reject`;

        try {
            const response = await apiClient.post(endpoint);

            alert(response.data.message);

            // --- PERBAIKAN DI SINI ---
            // Tambahkan state: { refresh: true } agar halaman history memuat ulang data
            navigate("/history", {
                state: { refresh: true },
                replace: true,
            });
            // --- AKHIR PERBAIKAN ---
        } catch (err) {
            console.error(`Gagal ${action} reschedule:`, err);
            setError(err.response?.data?.message || "Terjadi kesalahan.");
            setIsSubmitting(false);
        }
    };

    // --- 7. RENDER KONTEN DINAMIS ---

    // Header halaman ini akan di-handle oleh PageLayout

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error || !booking) {
        return (
            <div className="p-6 text-center">
                <h3 className="font-bold text-red-600">Error</h3>
                <p className="text-gray-700 mt-2">
                    {error || "Data tidak ditemukan."}
                </p>
                <Link
                    to="/history"
                    className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Kembali ke Riwayat
                </Link>
            </div>
        );
    }

    // Data siap, kita render halaman
    const jadwalLama = formatDateTime(
        booking.tanggal_konsultasi,
        booking.jam_konsultasi
    );
    const jadwalBaru = formatDateTime(
        booking.proposed_date,
        booking.proposed_time
    );

    return (
        // Gunakan Tailwind, hapus style inline
        <div className="p-4 flex flex-col flex-1">
            {/* Greeting (bisa dihapus/dibuat dinamis jika perlu) */}
            <div className="flex justify-between items-center border-b pb-3 mb-8">
                <span className="text-base font-medium">
                    Hi {booking.customer.name}!
                </span>
                <span className="text-sm text-gray-500">
                    {new Date().toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })}
                </span>
            </div>

            <div className="flex justify-center mb-6 pt-4">
                <WarningIcon />
            </div>

            <h2 className="text-center text-2xl font-bold mb-3">
                Peringatan Penting!
            </h2>
            <p className="text-center text-base text-gray-600 leading-relaxed max-w-xs mx-auto mb-6">
                {booking.konselor.name} mengajukan perubahan jadwal. Mohon
                konfirmasi segera.
            </p>

            {/* Schedule Box (Dinamis) */}
            <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-5 mb-6">
                <h3 className="text-lg font-bold mb-1">Perubahan Jadwal</h3>
                <p className="text-sm text-gray-600 border-b border-yellow-200 pb-3 mb-4">
                    Jadwal konseling Anda telah diubah oleh psikolog.
                </p>
                <div className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-3 items-center">
                    <span className="text-sm text-gray-600">Jadwal lama:</span>
                    <span className="text-sm font-medium text-gray-800 line-through">
                        {jadwalLama}
                    </span>

                    <span className="text-sm font-bold text-gray-900">
                        Jadwal Baru:
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                        {jadwalBaru}
                    </span>
                </div>
            </div>

            <p className="text-center text-sm text-gray-500 leading-relaxed mb-8">
                Mohon segera konfirmasi ketersediaan Anda untuk jadwal yang baru
                agar sesi konseling dapat berjalan dengan lancar.
            </p>

            {/* Tampilkan error API jika ada */}
            {error && (
                <p className="text-center text-red-600 text-sm mb-4">{error}</p>
            )}

            {/* Action Buttons (Sticky di bawah) */}
            <div className="mt-auto flex flex-col gap-3 pt-4">
                <button
                    style={{ backgroundColor: "#F97316" }} // Oranye
                    className="w-full py-4 rounded-xl text-white text-base font-bold"
                    onClick={() => handleAction("approve")}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Memproses..." : "Konfirmasi Sekarang"}
                </button>
                <button
                    style={{ backgroundColor: "#EF4444" }} // Merah
                    className="w-full py-4 rounded-xl text-white text-base font-bold"
                    onClick={() => handleAction("reject")}
                    disabled={isSubmitting}
                >
                    Tolak
                </button>
            </div>
        </div>
    );
}
