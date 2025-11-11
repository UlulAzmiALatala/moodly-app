import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
// --- PERBAIKAN: Path import apiClient (3x mundur, tanpa .js) ---
import apiClient from "../../../api/axios";

// --- Komponen Ikon (Dari file Anda) ---
function ClipboardIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                // --- PERBAIKAN: 'v0B2.25' diubah menjadi 'v0a2.25' ---
                d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 0 1-2.25 2.25H9A2.25 2.25 0 0 1 6.75 5.25v0a2.25 2.25 0 0 0-2.25-2.25H3v3.75a2.25 2.25 0 0 1-2.25 2.25H3v9A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V10.5h-3.75a2.25 2.25 0 0 1-2.25-2.25V3.888Z"
            />
        </svg>
    );
}
function VideoCameraIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z"
            />
        </svg>
    );
}
function ClockIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
        </svg>
    );
}
// --- Akhir Komponen Ikon ---

// --- Komponen Loading & Error ---
const Spinner = () => (
    <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-500 border-solid rounded-full animate-spin"></div>
    </div>
);
const ErrorDisplay = ({ message }) => (
    <div className="p-4 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg text-center max-w-md mx-auto">
            <h4 className="font-bold mb-1">Oops! Terjadi Kesalahan</h4>
            <p className="text-sm">{message}</p>
        </div>
    </div>
);
// --- Akhir Komponen ---

// --- Fungsi Helper (Bisa dipindah ke utils jika mau) ---

// Fungsi format mata uang
const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
};

// Fungsi format tanggal (Contoh: "Kam, 12 September 2025")
const formatDate = (dateString) => {
    if (!dateString) return "-";
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString("id-ID", {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

// Fungsi untuk styling status
const getStatusInfo = (status) => {
    switch (status) {
        case "Menunggu Pembayaran":
            return {
                text: "Menunggu Pembayaran",
                color: "bg-yellow-100 text-yellow-700",
            };
        case "Menunggu Verifikasi":
            return {
                text: "Menunggu Verifikasi",
                color: "bg-blue-100 text-blue-700",
            };
        case "Dijadwalkan":
            return {
                text: "Dijadwalkan",
                color: "bg-green-100 text-green-700",
            };
        case "Selesai":
            return { text: "Selesai", color: "bg-gray-100 text-gray-700" };
        case "Dibatalkan":
            return { text: "Dibatalkan", color: "bg-red-100 text-red-700" };
        default:
            return { text: status, color: "bg-gray-100 text-gray-700" };
    }
};

// Fungsi untuk menghitung waktu (Contoh: "15.00 - 16.00")
const formatTimeRange = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes) return "-";
    try {
        const [hour, minute] = startTime.split(":").map(Number);
        const startDate = new Date();
        startDate.setHours(hour, minute, 0);

        const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

        const format = (date) =>
            date
                .toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                })
                .replace(".", ":");

        return `${format(startDate)} - ${format(endDate)}`;
    } catch (e) {
        console.error("Error formatting time range:", e);
        return startTime;
    }
};
// --- Akhir Fungsi Helper ---

// --- Komponen Halaman Detail Riwayat ---
export default function DetailRiwayatPage() {
    const { id } = useParams(); // Mengambil ID dari URL
    const navigate = useNavigate();

    // --- State Dinamis ---
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Fetch Data saat komponen mount ---
    useEffect(() => {
        if (!id) {
            setError("ID booking tidak valid.");
            setLoading(false);
            return;
        }

        const fetchBookingDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                // Panggil API endpoint /api/history/{id}
                // Controller HistoryController@show akan dipanggil
                const response = await apiClient.get(`/api/history/${id}`);

                setBooking(response.data); // Simpan data booking di state
            } catch (err) {
                console.error("Gagal mengambil detail riwayat:", err);
                setError("Gagal memuat detail riwayat. Silakan coba lagi.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetails();
    }, [id]); // Jalankan ulang jika ID berubah

    // Fungsi untuk menyalin teks (dari file Anda)
    const copyToClipboard = (textToCopy, fieldName) => {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            const successful = document.execCommand("copy");
            const msg = successful
                ? `${fieldName} berhasil disalin!`
                : `Gagal menyalin ${fieldName}.`;
            alert(msg); // Ganti dengan notifikasi yang lebih baik
        } catch (err) {
            console.error(`Gagal menyalin ${fieldName}: `, err);
            alert(`Gagal menyalin ${fieldName}.`);
        }
        document.body.removeChild(textArea);
    };

    // --- Render Loading & Error ---
    if (loading) {
        return (
            <div className="p-4 bg-gray-50 min-h-screen">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return <ErrorDisplay message={error} />;
    }

    if (!booking) {
        return <ErrorDisplay message="Data booking tidak ditemukan." />;
    }

    // --- Data Mapping (Data API -> Tampilan) ---
    const {
        konselor,
        durasi_konseling,
        payment_method, // Ini mungkin null jika relasi tidak ada/dihapus
        jenis_konseling,
    } = booking;

    const statusInfo = getStatusInfo(booking.status_pesanan);
    const formattedDate = formatDate(booking.tanggal_konsultasi);
    const formattedTime = formatTimeRange(
        booking.jam_konsultasi,
        durasi_konseling?.durasi_menit
    );
    const totalPayment = booking.total_harga;

    // Ambil detail spesialisasi (jika ada)
    const specialization = konselor?.spesialisasi
        ? `Spesialisasi: ${konselor.spesialisasi.map(String).join(", ")}`
        : "Psikolog";

    // Tentukan info sesi
    const sessionInfo = `${jenis_konseling?.jenis_konseling || "Konseling"} | ${
        durasi_konseling?.durasi_menit || "?"
    } Menit Sesi`;

    // --- Render Tombol Aksi Dinamis ---
    const renderActionButtons = () => {
        switch (booking.status_pesanan) {
            case "Menunggu Pembayaran":
                return (
                    <div className="mt-4 space-y-2">
                        <button
                            // Arahkan ke halaman QRIS
                            onClick={() =>
                                navigate(
                                    `/booking/payment/qris/${booking.id}`,
                                    { state: { booking } }
                                )
                            }
                            className="w-full bg-cyan-500 text-white font-semibold py-2.5 rounded-lg shadow-lg hover:bg-cyan-600 transition-colors text-sm"
                        >
                            Lanjutkan Pembayaran
                        </button>
                        <button
                            // Arahkan ke halaman upload
                            onClick={() =>
                                navigate(
                                    `/booking/upload-proof/${booking.id}`,
                                    { state: { booking } }
                                )
                            }
                            className="w-full bg-gray-700 text-white font-semibold py-2.5 rounded-lg shadow-lg hover:bg-gray-800 transition-colors text-sm"
                        >
                            Saya Sudah Bayar, Upload Bukti
                        </button>
                    </div>
                );
            case "Menunggu Verifikasi":
                return (
                    <div className="mt-4">
                        <button
                            disabled
                            className="w-full bg-blue-300 text-white font-semibold py-2.5 rounded-lg shadow-lg text-sm cursor-not-allowed"
                        >
                            Pembayaran Sedang Diverifikasi
                        </button>
                    </div>
                );
            case "Dijadwalkan":
                return (
                    <div className="mt-4">
                        <button
                            // Arahkan ke halaman chat/sesi
                            onClick={() =>
                                navigate(`/session/chat/${booking.id}`)
                            }
                            className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-lg shadow-lg hover:bg-green-700 transition-colors text-sm"
                        >
                            Masuk ke Sesi Konseling
                        </button>
                    </div>
                );
            case "Selesai":
                return (
                    <div className="mt-4">
                        <button
                            // Arahkan ke halaman rating
                            onClick={() =>
                                navigate(`/history/rating/${booking.id}`)
                            }
                            className="w-full bg-yellow-500 text-white font-semibold py-2.5 rounded-lg shadow-lg hover:bg-yellow-600 transition-colors text-sm"
                        >
                            Beri Ulasan
                        </button>
                    </div>
                );
            case "Dibatalkan":
                return (
                    <div className="mt-4">
                        <button
                            disabled
                            className="w-full bg-red-300 text-white font-semibold py-2.5 rounded-lg shadow-lg text-sm cursor-not-allowed"
                        >
                            Pesanan Dibatalkan
                        </button>
                    </div>
                );
            default:
                return null; // Tidak ada tombol untuk status lain
        }
    };

    // --- Render Halaman Utama ---
    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            {/* Header Halaman (versi kecil) */}
            <div className="flex items-center mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-800 p-1 -ml-1"
                >
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
                <h1 className="text-lg font-bold text-center text-gray-800 flex-grow">
                    Detail Riwayat
                </h1>
                <div className="w-6"></div> {/* Spacer */}
            </div>

            {/* --- Konten Dinamis --- */}

            {/* 1. Timer & Kartu Pembayaran (HANYA jika Menunggu Pembayaran) */}
            {booking.status_pesanan === "Menunggu Pembayaran" && (
                <>
                    <div className="flex flex-col items-center mb-3">
                        <p className="text-xs text-gray-700 mb-1">
                            Sisa Waktu Pembayaran
                        </p>
                        {/* TODO: Implementasikan komponen CountdownTimer dinamis di sini */}
                        <div className="flex items-center space-x-1.5">
                            <span className="bg-blue-600 text-white font-bold text-base p-1.5 rounded-md w-10 text-center">
                                23
                            </span>
                            <span className="text-blue-600 font-bold text-base">
                                :
                            </span>
                            <span className="bg-blue-600 text-white font-bold text-base p-1.5 rounded-md w-10 text-center">
                                59
                            </span>
                            <span className="text-blue-600 font-bold text-base">
                                :
                            </span>
                            <span className="bg-blue-600 text-white font-bold text-base p-1.5 rounded-md w-10 text-center">
                                00
                            </span>
                        </div>
                    </div>

                    {/* Kartu Virtual Account (HANYA jika ada payment_method) */}
                    {/* Kita hapus relasi ini dari backend, jadi bagian ini tidak akan tampil */}
                    {payment_method && (
                        <div className="bg-white p-3 rounded-xl shadow-lg mb-3">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-sm font-semibold text-gray-900">
                                    {payment_method.name}
                                </h2>
                                {/* TODO: Ganti dengan logo dinamis jika ada */}
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia_logo.svg/1280px-Bank_Central_Asia_logo.svg.png"
                                    alt="Logo Bank"
                                    className="h-4"
                                />
                            </div>
                            <div className="mb-2">
                                <label className="text-xs text-gray-500 block mb-0.5">
                                    Nomer Virtual Account
                                </label>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-800">
                                        {payment_method.account_details || "-"}
                                    </span>
                                    <button
                                        onClick={() =>
                                            copyToClipboard(
                                                payment_method.account_details,
                                                "Nomor Virtual Account"
                                            )
                                        }
                                        className="text-blue-600 hover:text-blue-800 ml-2 flex-shrink-0"
                                        title="Salin Nomor VA"
                                    >
                                        <ClipboardIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-0.5">
                                    Total Pembayaran
                                </label>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-blue-600">
                                        {formatCurrency(totalPayment)}
                                    </span>
                                    <button
                                        onClick={() =>
                                            copyToClipboard(
                                                totalPayment,
                                                "Total Pembayaran"
                                            )
                                        }
                                        className="text-blue-600 hover:text-blue-800 ml-2 flex-shrink-0"
                                        title="Salin Total Pembayaran"
                                    >
                                        <ClipboardIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* 3. Kartu Detail Sesi Konseling (Selalu Tampil) */}
            <div className="bg-white rounded-xl shadow-lg">
                <div className="p-3">
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm font-semibold text-gray-900">
                            {booking.metode_konsultasi} Konseling
                        </h2>
                        <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.color}`}
                        >
                            {statusInfo.text}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{sessionInfo}</p>
                </div>
                <div className="flex items-center space-x-3 px-3 pb-3">
                    <img
                        src={
                            konselor?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                konselor?.name || "P"
                            )}`
                        }
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                konselor?.name || "P"
                            )}`;
                        }}
                        alt={konselor?.name}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <h3 className="font-semibold text-gray-900 text-xs">
                            {konselor?.name || "Konselor"}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {specialization}
                        </p>
                    </div>
                </div>
                <hr className="mx-3" />
                <div className="p-3 space-y-2">
                    <p className="text-xs font-medium text-gray-800">
                        {formattedDate}
                    </p>
                    <div className="flex items-center space-x-2">
                        <VideoCameraIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-700">
                            {booking.metode_konsultasi}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-700">
                            {formattedTime}
                        </span>
                    </div>
                </div>
                <hr className="mx-3" />
                <div className="p-3">
                    <label className="text-xs text-gray-500 block mb-1">
                        Konseling Booking ID
                    </label>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-800 break-all">
                            {`MOODLY-${booking.id}`}
                        </span>
                        <button
                            onClick={() =>
                                copyToClipboard(
                                    `MOODLY-${booking.id}`,
                                    "Booking ID"
                                )
                            }
                            className="text-blue-600 hover:text-blue-800 ml-2 flex-shrink-0"
                            title="Salin Booking ID"
                        >
                            <ClipboardIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 4. Tombol Aksi Dinamis */}
            {renderActionButtons()}
        </div>
    );
}
