import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
// --- PERBAIKAN: Path import dikoreksi (tanpa .js) ---
import apiClient from "../../../../api/axios";
// --- AKHIR PERBAIKAN ---

// --- Komponen Ikon ---
const BackArrowIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor" // Warna diatur dari parent
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white group-hover:text-gray-100"
    >
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);
const ClockIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-gray-500"
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z"
            clipRule="evenodd"
        />
    </svg>
);
const CalendarIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-gray-500"
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
        />
    </svg>
);
const LocationMarkerIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-gray-500"
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
        />
    </svg>
);
const InformationCircleIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-blue-500"
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
        />
    </svg>
);
// --- Akhir Komponen Ikon ---

export default function PaymentOfflinePage() {
    const navigate = useNavigate();
    const location = useLocation();

    // --- PERBAIKAN 1: Ambil data dari state yang benar ---
    // (Dikirim dari PsychologistDetailPage)
    const { booking, displayData } = location.state || {};
    // --- AKHIR PERBAIKAN 1 ---

    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false); // Tetap gunakan untuk loading navigasi
    const [error, setError] = useState(null);

    // --- PERBAIKAN 2: Jika tidak ada data, redirect ---
    useEffect(() => {
        // Cek 'booking' (data API) bukan 'bookingData' (struktur lama)
        if (!booking || !displayData) {
            console.error("Tidak ada data booking, kembali ke beranda.");
            navigate("/"); // Redirect ke home
        }
    }, [booking, displayData, navigate]); // Dependensi diperbarui
    // --- AKHIR PERBAIKAN 2 ---

    // Format Rupiah
    const formatCurrency = (amount) => {
        if (typeof amount !== "number") return "Rp 0";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // --- PERBAIKAN 3: Isi data dari 'booking' (API) dan 'displayData' (Tampilan) ---
    const bookingDetails = displayData
        ? {
              // Gunakan ID booking asli dari API
              bookingCode: `MOODLY-${booking.id}`,
              bookingDate: new Date(booking.created_at).toLocaleDateString(
                  "id-ID",
                  {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                  }
              ),
              psychologistName: displayData.counselorName,
              psychologistImage: displayData.counselorImage,
              university: displayData.counselorUniversity,
              specialty: `Spesialisasi : ${displayData.counselorSpecialty}`,
              scheduleType: displayData.method,
              scheduleDate: displayData.scheduleDateDisplay,
              scheduleTime: `${displayData.scheduleTime} WIB`,
              locationName: displayData.tempatName || "Lokasi tidak ditentukan",
              locationAddress:
                  displayData.tempatAddress ||
                  "Alamat akan diinformasikan setelah pembayaran.",
              consultationFee: displayData.consultationFee,
              serviceFee: displayData.serviceFee,
          }
        : {};

    // Gunakan total harga dari 'booking' (API) sebagai sumber kebenaran
    const totalPayment = booking?.total_harga || 0;
    // --- AKHIR PERBAIKAN 3 ---

    const handleBack = () => {
        navigate(-1);
    };

    // --- PERBAIKAN 4: Handler HANYA untuk navigasi ---
    const handleContinue = async () => {
        if (!agreed) {
            setError("Anda harus menyetujui syarat dan ketentuan.");
            return;
        }

        setLoading(true); // Tampilkan loading
        setError(null);

        // HAPUS SEMUA LOGIKA apiClient.post
        // Halaman ini tidak lagi bertanggung jawab membuat booking

        try {
            // Logika berhasil (karena booking sudah dibuat)
            console.log("Konfirmasi Offline, navigasi ke QRIS...", booking);

            // Langsung navigasi ke halaman QRIS
            navigate(`/booking/payment/qris/${booking.id}`, {
                replace: true,
                state: { booking: booking }, // Kirim data booking (termasuk total_harga)
            });
            // Tidak perlu setLoading(false) karena kita navigasi
        } catch (err) {
            // Ini seharusnya tidak terjadi, tapi sebagai fallback
            console.error("Error saat navigasi:", err);
            setError("Gagal melanjutkan. Silakan coba lagi.");
            setLoading(false);
        }
    };
    // --- AKHIR PERBAIKAN 4 ---

    // Tampilkan loading jika data belum siap (meskipun useEffect akan redirect)
    if (!booking || !displayData) {
        return (
            <div className="bg-gray-50 min-h-full font-sans flex items-center justify-center">
                Memuat data...
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-full font-sans">
            {/* Header Halaman */}
            <header className="bg-cyan-400 p-4 pt-6 flex items-center sticky top-0 z-20 text-white rounded-b-2xl shadow-lg">
                <button
                    onClick={handleBack}
                    className="p-2 -ml-2 mr-2 rounded-full hover:bg-cyan-500 group transition-colors"
                    aria-label="Kembali"
                >
                    <BackArrowIcon />
                </button>
                <h1 className="text-lg font-bold text-center flex-grow -translate-x-4">
                    Konfirmasi Pesanan
                </h1>
                <div className="w-8"></div> {/* Spacer */}
            </header>

            {/* Konten Utama */}
            <main className="relative p-4 pb-40">
                {/* Timer Pembayaran */}
                <div className="bg-white p-3 rounded-lg shadow mb-4 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                        Selesaikan Pembayaran dalam
                    </span>
                    <span className="text-sm font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded">
                        23 : 59 : 54 {/* TODO: Implementasi Timer */}
                    </span>
                </div>

                {/* Tampilkan Error API jika ada */}
                {error && (
                    <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg shadow mb-4 text-sm">
                        <strong>Oops!</strong> {error}
                    </div>
                )}

                {/* Detail Booking */}
                <div className="bg-white p-4 rounded-lg shadow space-y-4">
                    {/* Info Kode Booking */}
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <span className="text-sm font-semibold text-gray-800">
                            {bookingDetails.bookingCode}
                        </span>
                        <span className="text-xs text-gray-400">
                            {bookingDetails.bookingDate}
                        </span>
                    </div>

                    {/* Info Psikolog */}
                    <div className="flex items-center gap-3">
                        <img
                            src={
                                bookingDetails.psychologistImage ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    bookingDetails.psychologistName || "P"
                                )}&background=EBF4FF&color=3B82F6&bold=true&size=64`
                            }
                            alt={bookingDetails.psychologistName}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    bookingDetails.psychologistName || "P"
                                )}&background=EBF4FF&color=3B82F6&bold=true&size=64`;
                            }}
                        />
                        <div>
                            <h3 className="font-semibold text-sm text-gray-800">
                                {bookingDetails.psychologistName}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {bookingDetails.university || "-"}
                            </p>
                            <p className="text-xs text-gray-500">
                                {bookingDetails.specialty || "-"}
                            </p>
                        </div>
                    </div>

                    {/* Info Jadwal */}
                    <div className="space-y-1 pt-3 border-t border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1">
                            Jadwal Konsultasi
                        </h4>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded">
                                {bookingDetails.scheduleType}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarIcon />
                            <p className="text-sm text-gray-700">
                                {bookingDetails.scheduleDate}
                            </p>{" "}
                        </div>
                        <div className="flex items-center gap-2">
                            <ClockIcon />
                            <p className="text-sm text-gray-700">
                                {bookingDetails.scheduleTime}
                            </p>
                        </div>
                    </div>

                    {/* Info Lokasi (Hanya untuk Offline) */}
                    <div className="space-y-1 pt-3 border-t border-gray-100">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1">
                            Lokasi
                        </h4>
                        <div className="flex items-start gap-2">
                            <LocationMarkerIcon className="mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-gray-700">
                                    {bookingDetails.locationName}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {bookingDetails.locationAddress}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rincian Biaya */}
                    <div className="space-y-1 pt-3 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                                Biaya Konsultasi
                            </p>
                            <p className="text-sm text-gray-700">
                                {formatCurrency(bookingDetails.consultationFee)}
                            </p>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                                Biaya Layanan
                            </p>
                            <p className="text-sm text-gray-700">
                                {formatCurrency(bookingDetails.serviceFee)}
                            </p>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                            <p className="text-sm font-bold text-gray-800">
                                Total Pembayaran
                            </p>
                            <p className="text-sm font-bold text-cyan-600">
                                {formatCurrency(totalPayment)}
                            </p>
                        </div>
                    </div>

                    {/* Persetujuan */}
                    <div className="flex items-start space-x-2 pt-4">
                        <input
                            type="checkbox"
                            id="agreement"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="mt-1 h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                        />
                        <label
                            htmlFor="agreement"
                            className="text-xs text-gray-500"
                        >
                            Dengan ini kamu menyetujui syarat dan ketentuan{" "}
                            <Link
                                to="/peraturan-konseling" // TODO: Pastikan rute ini ada
                                className="text-cyan-600 hover:underline font-medium"
                            >
                                Peraturan Konseling
                            </Link>
                        </label>
                    </div>

                    {/* Bantuan */}
                    <div className="flex justify-center pt-2">
                        <Link
                            to="/help" // TODO: Pastikan rute ini ada
                            className="flex items-center gap-1 text-xs text-blue-500 hover:underline"
                        >
                            <InformationCircleIcon /> Butuh Bantuan ?
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer Total & Tombol Lanjutkan */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t border-gray-200 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] z-20 flex justify-between items-center">
                <div>
                    <p className="text-xs text-gray-500">Total Pembayaran</p>
                    <p className="text-lg font-bold text-cyan-600">
                        {formatCurrency(totalPayment)}
                    </p>
                </div>
                <button
                    onClick={handleContinue}
                    disabled={!agreed || loading}
                    className={`px-6 py-3 rounded-lg font-semibold text-white shadow transition-colors duration-200 ${
                        !agreed || loading
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-cyan-500 hover:bg-cyan-600 active:scale-95"
                    }`}
                >
                    {loading ? "Memproses..." : "Lanjutkan"}
                </button>
            </div>
        </div>
    );
}
