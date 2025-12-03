import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios";

// --- Ikon (Tidak berubah) ---
const VideoIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-10 h-10 text-blue-500"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z"
        />
    </svg>
);
const CopyIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 text-gray-500"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.467-7.5-9.312A4.5 4.5 0 0 0 7.5 7.5v1.875m7.5 10.375a4.5 4.5 0 0 1-4.5-4.5v-1.875m4.5 4.5v-1.875m0-1.125a1.125 1.125 0 0 1-1.125-1.125v-1.5a1.125 1.125 0 0 1 1.125-1.125v-1.5a1.125 1.125 0 0 1 1.125-1.125h1.5a1.125 1.125 0 0 1 1.125 1.125v1.5a1.125 1.125 0 0 1-1.125 1.125v1.5a1.125 1.125 0 0 1-1.125 1.125h-1.5Zm-6-9-1.5-1.5-1.5 1.5m1.5 1.5v-1.5"
        />
    </svg>
);

// --- Komponen Halaman ---
const VideoCallPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sesi, setSesi] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCopied, setIsCopied] = useState(false);

    // --- Fungsi Helper (Tidak berubah) ---
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    // --- Fetch Data Sesi ---
    useEffect(() => {
        const fetchSesi = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`/api/history/${id}`);
                const booking = response.data;

                // === PERBAIKAN DI SINI ===
                // Definisikan metode yang BOLEH masuk halaman ini
                const allowedMethods = ["Video Call", "Voice Call", "Call"];

                // Jika metode booking TIDAK ADA di 'allowedMethods'
                if (!allowedMethods.includes(booking.metode_konsultasi)) {
                    // Maka itu pasti 'Chat' (atau 'Tatap Muka' yg salah)
                    // Redirect ke halaman Chat
                    navigate(`/session/chat/${id}`);
                    return;
                }
                // === AKHIR PERBAIKAN ===

                if (booking.status_pesanan === "Menunggu Pembayaran") {
                    setError(
                        "Sesi ini belum dibayar. Silakan selesaikan pembayaran."
                    );
                    return;
                }

                setSesi(booking);
            } catch (err) {
                console.error("Gagal mengambil data sesi:", err);
                setError("Gagal memuat data sesi. Coba lagi nanti.");
            } finally {
                setLoading(false);
            }
        };

        fetchSesi();
    }, [id, navigate]);

    // --- Tampilan Loading & Error (Tidak berubah) ---
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Loading data sesi...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="p-6 text-center text-red-500">
                <p>{error}</p>
                <Link to="/history" className="text-blue-500 mt-4 inline-block">
                    Kembali ke Riwayat
                </Link>
            </div>
        );
    }
    if (!sesi) {
        return (
            <div className="p-6 text-center">
                <p>Data sesi tidak ditemukan.</p>
            </div>
        );
    }

    // --- Tampilan Utama (Tidak berubah) ---
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="p-6 flex flex-col items-center">
                <VideoIcon />
                <h1 className="text-xl font-bold text-gray-800 mt-2">
                    Jadwal Konseling Online
                </h1>
            </div>

            <div className="mx-4 mb-6 bg-white p-5 border border-gray-200 rounded-lg shadow-md">
                <h2 className="text-lg font-bold mb-4 text-gray-800">
                    Detail Sesi Konseling:
                </h2>
                <div className="space-y-3 text-sm">
                    <div className="flex">
                        <span className="w-2/5 text-gray-500">
                            Nama konselor
                        </span>
                        <span className="w-3/5 font-semibold text-gray-900">
                            : {sesi.konselor?.name || "-"}
                        </span>
                    </div>
                    <div className="flex">
                        <span className="w-2/5 text-gray-500">Tanggal</span>
                        <span className="w-3/5 font-semibold text-gray-900">
                            : {formatDate(sesi.tanggal_konsultasi)}
                        </span>
                    </div>
                    <div className="flex">
                        <span className="w-2/5 text-gray-500">Waktu</span>
                        <span className="w-3/5 font-semibold text-gray-900">
                            : {sesi.jam_konsultasi || "-"} WIB
                        </span>
                    </div>
                    <div className="flex">
                        <span className="w-2/5 text-gray-500">Tipe Sesi</span>
                        <span className="w-3/5 font-semibold text-gray-900">
                            : {sesi.metode_konsultasi} - Google Meet
                        </span>
                    </div>
                </div>
            </div>

            <div className="mx-4 mb-6 bg-white p-5 border border-gray-200 rounded-lg shadow-md">
                <h2 className="text-lg font-bold mb-4 text-gray-800">
                    Undangan Meeting:
                </h2>

                {sesi.gmeet_link ? (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-300">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Google_Meet_icon_%282020%29.svg/240px-Google_Meet_icon_%282020%29.svg.png"
                            alt="Google Meet"
                            className="w-10 h-10"
                        />
                        <div className="flex-1 overflow-hidden">
                            <span className="font-semibold text-sm">
                                Google Meet
                            </span>
                            <p className="text-xs text-blue-600 truncate">
                                {sesi.gmeet_link}
                            </p>
                        </div>
                        <button
                            onClick={() => copyToClipboard(sesi.gmeet_link)}
                            className="p-2 rounded-lg hover:bg-gray-200"
                        >
                            {isCopied ? (
                                <span className="text-xs text-green-500">
                                    Tersalin!
                                </span>
                            ) : (
                                <CopyIcon />
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="p-4 text-center bg-yellow-50 border border-yellow-300 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            Link meeting belum tersedia.
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                            Admin akan segera memberikan link sebelum sesi
                            dimulai.
                        </p>
                    </div>
                )}
            </div>

            <div className="mx-6 mb-6 text-center text-gray-500 text-xs">
                <p>
                    Harap bergabung 5-10 menit sebelum waktu yang ditentukan.
                    Pastikan koneksi internet stabil dan lingkungan sekitar
                    kondusif untuk sesi konseling.
                </p>
            </div>

            <div className="p-4 sticky bottom-0 bg-white shadow-lg border-t">
                <a
                    href={sesi.gmeet_link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full block text-center py-3 px-6 rounded-full font-bold text-white transition-colors ${
                        sesi.gmeet_link
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-gray-400 cursor-not-allowed"
                    }`}
                    onClick={(e) => !sesi.gmeet_link && e.preventDefault()}
                >
                    Gabung Meeting
                </a>
            </div>
        </div>
    );
};

export default VideoCallPage;
