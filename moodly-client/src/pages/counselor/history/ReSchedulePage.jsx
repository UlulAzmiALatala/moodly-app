import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
// Pastikan path ini benar
import apiClient from "../../../api/axios";

// --- Komponen Layout & Ikon (Tidak Berubah) ---
const MobileLayout = ({ children }) => (
    <div className="flex justify-center min-h-screen bg-white">
        <div className="w-full max-w-md min-h-screen bg-white flex flex-col">
            {children}
        </div>
    </div>
);
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
// --- Akhir Komponen ---

export default function CounselorReschedulePage() {
    const navigate = useNavigate();
    const { id: bookingId } = useParams(); // <-- Ambil bookingId dari URL

    // --- State Baru ---
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State untuk form
    const [tanggal, setTanggal] = useState("");
    const [jam, setJam] = useState(""); // Format: HH:MM
    // --- Akhir State Baru ---

    // --- Fetch Data Booking ---
    useEffect(() => {
        if (!bookingId) {
            navigate("/counselor/schedule"); // Kembali jika tidak ada ID
            return;
        }

        const fetchBooking = async () => {
            try {
                setLoading(true);
                // Panggil API yang sudah ada
                const response = await apiClient.get(
                    `/api/counselor/booking/${bookingId}`
                );
                const data = response.data;

                setBooking(data);
                // Isi form dengan data jadwal yang lama
                setTanggal(data.tanggal_konsultasi);
                setJam(data.jam_konsultasi.substring(0, 5)); // Ambil "14:00" dari "14:00:00"
            } catch (err) {
                console.error("Gagal fetch data booking:", err);
                setError("Gagal memuat data sesi.");
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId, navigate]);
    // --- Akhir Fetch Data ---

    // --- Handle Submit Form ---
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
            // Format jam ke H:i:s (e.g., "14:00:00")
            const jamFormatted = `${jam}:00`;

            // Panggil API Reschedule baru yang sudah kita buat
            await apiClient.post(
                `/api/counselor/booking/${bookingId}/reschedule`,
                {
                    tanggal_konsultasi: tanggal,
                    jam_konsultasi: jamFormatted,
                }
            );

            alert("Jadwal berhasil diubah!");
            // Kembali ke halaman detail jadwal
            navigate(`/counselor/schedule/${bookingId}`);
        } catch (err) {
            console.error("Gagal reschedule:", err);
            const apiError =
                err.response?.data?.message || "Gagal mengubah jadwal.";
            if (err.response?.data?.errors) {
                // Menampilkan error validasi (misal tanggal)
                const errors = Object.values(err.response.data.errors).join(
                    "\n"
                );
                setError(errors);
            } else {
                setError(apiError);
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    // --- Akhir Handle Submit ---

    // Mendapatkan tanggal hari ini (YYYY-MM-DD) untuk batas minimal input date
    const today = new Date().toISOString().split("T")[0];

    return (
        <MobileLayout>
            <div className="flex flex-col h-full w-full bg-[#00D1FF] relative">
                {/* HEADER */}
                <header className="w-full pt-10 pb-16 px-4 relative bg-[#00D1FF] z-20">
                    <button
                        className="absolute left-4 top-10 text-white"
                        onClick={() => navigate(-1)}
                        aria-label="Kembali"
                    >
                        <BackArrowIcon />
                    </button>
                    <h1 className="text-center text-white font-bold text-xl">
                        Ganti Jadwal
                    </h1>
                </header>

                {/* BAGIAN PUTIH */}
                <div className="flex-1 bg-white rounded-t-[2.5rem] -mt-6 z-30 relative p-6 pt-10 flex flex-col justify-between">
                    {/* Tampilan Loading atau Error */}
                    {loading && <p className="text-center">Memuat data...</p>}
                    {!loading && error && !booking && (
                        <p className="text-center text-red-500">{error}</p>
                    )}

                    {/* Tampilkan form HANYA jika data booking sudah ada */}
                    {booking && (
                        <>
                            {/* === KONTEN UTAMA (SUDAH DIUBAH) === */}
                            <div className="flex-grow">
                                <h2 className="font-semibold text-gray-800 mb-2">
                                    Jadwal Ulang untuk: {booking.customer.name}
                                </h2>
                                <p className="text-sm text-gray-500 mb-6">
                                    Durasi Sesi:{" "}
                                    {booking.durasi_konseling.durasi_menit}{" "}
                                    Menit
                                </p>

                                {/* Hapus Scroller Hari (Senin, Selasa...) */}

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    {/* Input Tanggal Baru */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-800 mb-1">
                                            Tanggal Konsultasi
                                        </label>
                                        <input
                                            type="date"
                                            value={tanggal}
                                            onChange={(e) =>
                                                setTanggal(e.target.value)
                                            }
                                            min={today} // Tidak bisa pilih tanggal kemarin
                                            className="w-full border border-black rounded-md p-2 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* Input Jam Baru */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-800 mb-1">
                                            Jam Mulai (WIB)
                                        </label>
                                        <input
                                            type="time"
                                            value={jam}
                                            onChange={(e) =>
                                                setJam(e.target.value)
                                            }
                                            className="w-full border border-black rounded-md p-2 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* Tampilkan Error Submit */}
                                    {error && (
                                        <p className="text-center text-red-500 text-sm">
                                            {error}
                                        </p>
                                    )}
                                </form>
                            </div>

                            {/* === TOMBOL FIXED DI BAWAH === */}
                            <div className="w-full pb-4 pt-6">
                                <button
                                    onClick={handleSubmit} // <-- Hubungkan ke submit
                                    disabled={isSubmitting || loading}
                                    className="w-full bg-[#00B2FF] text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:bg-gray-400"
                                >
                                    {isSubmitting
                                        ? "Menyimpan..."
                                        : "Ganti Jadwal"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </MobileLayout>
    );
}
