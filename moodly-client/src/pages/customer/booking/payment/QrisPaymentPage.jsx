import React, { useRef, useState, useEffect } from "react";
// --- PERBAIKAN: Tambahkan 'Link' dan 'useParams' ---
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
// --- AKHIR PERBAIKAN ---
// --- PERBAIKAN: Path relatif 4x mundur, tanpa ekstensi ---
import apiClient from "../../../../api/axios";
// --- AKHIR PERBAIKAN ---

// --- Komponen Ikon ---
const BackArrowIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        className="w-6 h-6 text-gray-800 group-hover:text-black"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
        />
    </svg>
);
// --- Akhir Komponen Ikon ---

// --- Komponen Loading Spinner Sederhana ---
const Spinner = () => (
    <div className="w-16 h-16 border-4 border-cyan-200 border-t-cyan-500 border-solid rounded-full animate-spin"></div>
);

// --- Komponen Error Message ---
const ErrorDisplay = ({ message }) => (
    <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg text-center">
        <h4 className="font-bold mb-1">Oops! Terjadi Kesalahan</h4>
        <p className="text-sm">{message}</p>
    </div>
);
// --- Akhir Komponen ---

function QrisPaymentPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: bookingIdFromUrl } = useParams(); // Ambil ID dari URL
    const qrImageRef = useRef(null);

    // --- Ambil data booking dari state navigasi ---
    // (Dikirim dari PaymentOfflinePage / PaymentOnlinePage)
    const { booking } = location.state || {};

    // --- State untuk data payment method (QRIS) ---
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Tentukan bookingId dan totalPayment ---
    // Gunakan ID dari state, fallback ke URL param jika state tidak ada (misal saat refresh)
    const orderId = booking?.id || bookingIdFromUrl;
    const totalPayment = booking?.total_harga; // Ambil total harga dari booking

    // --- Fetch data metode pembayaran (QRIS) ---
    useEffect(() => {
        // Redirect jika tidak ada data booking sama sekali
        if (!orderId) {
            console.error("Tidak ada ID booking, kembali ke riwayat.");
            // Arahkan ke history, atau halaman error jika perlu
            navigate("/history");
            return;
        }

        const fetchPaymentMethods = async () => {
            try {
                setLoading(true);
                setError(null);
                // Panggil API publik yang kita buat
                const response = await apiClient.get("/api/payment-methods");

                // Filter hanya yang punya gambar (QRIS)
                const activeQrisMethods = response.data.filter(
                    (method) => method.status === "Aktif" && method.image_url
                );

                if (activeQrisMethods.length === 0) {
                    setError("Metode pembayaran QRIS tidak tersedia saat ini.");
                } else {
                    setPaymentMethods(activeQrisMethods);
                }
            } catch (err) {
                console.error("Gagal mengambil metode pembayaran:", err);
                setError(
                    "Tidak dapat memuat metode pembayaran. Silakan coba lagi nanti."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentMethods();
    }, [orderId, navigate]); // Dependensi pada orderId

    const handleBack = () => navigate(-1);

    const handleSaveQR = async (imageUrl, imageName) => {
        if (!imageUrl) {
            alert("Gambar QR tidak ditemukan.");
            return;
        }

        try {
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(
                    `Gagal mengambil gambar QR: ${response.statusText}`
                );
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `qris_payment_${imageName || Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error saat menyimpan QR Code:", error);
            alert(
                "Gagal menyimpan gambar QR Code. Silakan coba screenshot manual."
            );
        }
    };

    // Format Rupiah
    const formatCurrency = (amount) => {
        if (typeof amount !== "number") return "Rp 0";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // --- Render Konten Utama ---
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center p-10">
                    <Spinner />
                    <p className="mt-4 text-gray-600">Memuat QRIS...</p>
                </div>
            );
        }

        if (error) {
            return <ErrorDisplay message={error} />;
        }

        // Ambil metode QRIS pertama yang aktif
        const qrisMethod = paymentMethods[0];

        if (!qrisMethod) {
            // Seharusnya sudah ditangani 'setError' di useEffect, tapi sebagai fallback
            return (
                <ErrorDisplay message="Metode pembayaran QRIS tidak ditemukan." />
            );
        }

        return (
            <>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {qrisMethod.name}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                    {qrisMethod.account_details || "Scan QR Code di bawah ini"}
                </p>

                {/* Total Pembayaran */}
                {totalPayment && (
                    <div className="mb-4 text-center">
                        <p className="text-sm text-gray-500">
                            Total Pembayaran
                        </p>
                        <p className="text-3xl font-bold text-cyan-600">
                            {formatCurrency(totalPayment)}
                        </p>
                    </div>
                )}

                {/* Container QR Code */}
                <div className="relative inline-block p-1 border-2 border-dashed border-cyan-400 rounded-lg mb-8">
                    {/* Garis sudut */}
                    <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-cyan-500"></span>
                    <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-cyan-500"></span>
                    <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-cyan-500"></span>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-cyan-500"></span>

                    <img
                        ref={qrImageRef}
                        src={`http://localhost:8000/api/payment-methods/image/${qrisMethod.id}`}
                        alt={`QR Code ${qrisMethod.name}`}
                        className="w-full max-w-[200px] h-auto aspect-square block mx-auto bg-gray-100" // Tambah bg
                        crossOrigin="anonymous"
                        // Fallback jika gambar gagal load
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Error_Load_QR_${qrisMethod.id}`;
                        }}
                    />
                </div>

                {/* Tombol Simpan */}
                <button
                    onClick={() =>
                        handleSaveQR(
                            // GANTI "http://localhost:8000" dengan VITE_API_URL Anda jika ada
                            `http://localhost:8000/api/payment-methods/image/${qrisMethod.id}`,
                            qrisMethod.name
                        )
                    }
                    className="w-full bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-cyan-600 transition-colors active:scale-95"
                >
                    Simpan Code QR
                </button>
            </>
        );
    };

    return (
        <div className="font-sans bg-gray-50 min-h-screen max-w-md mx-auto">
            {/* 1. Header (Putih) */}
            <header className="flex items-center p-4 bg-white shadow-sm sticky top-0 z-10 text-gray-800">
                <button onClick={handleBack} className="p-1 -ml-1 mr-2 group">
                    <BackArrowIcon />
                </button>
                <h1 className="text-lg font-bold m-0 flex-1 text-center">
                    Bayar Dengan QRIS
                </h1>
                <div className="w-6 h-6 mr-2 opacity-0"></div>
            </header>

            {/* 2. Konten Utama */}
            <main className="p-4 flex flex-col items-center pt-10">
                {/* Kartu Putih */}
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs text-center">
                    {renderContent()}
                </div>

                {/* Info Tambahan */}
                <div className="mt-6 text-center text-gray-500 px-4">
                    <h3 className="font-semibold text-gray-700">
                        Sudah Selesai Bayar?
                    </h3>
                    <p className="text-xs leading-relaxed mt-2">
                        Pembayaran Anda akan diverifikasi secara otomatis oleh
                        sistem. Silakan cek halaman{" "}
                        <Link
                            to="/history"
                            className="text-cyan-600 font-medium hover:underline"
                        >
                            Riwayat Pesanan
                        </Link>{" "}
                        untuk melihat status terbaru.
                    </p>
                    {/* TODO: Tambahkan tombol konfirmasi jika verifikasi tidak otomatis */}
                    {/* <button className="mt-4 w-full max-w-xs bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-gray-800 transition-colors active:scale-95">
                        Saya Sudah Bayar
                    </button> */}
                </div>
            </main>
        </div>
    );
}

export default QrisPaymentPage;
