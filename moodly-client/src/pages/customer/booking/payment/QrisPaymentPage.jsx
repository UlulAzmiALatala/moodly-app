import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../../api/axios";
import NotificationModal from "../../../../components/common/NotificationModal";

// --- Komponen Ikon ---
const BackArrowIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        className="w-6 h-6 text-gray-800 hover:text-black"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
        />
    </svg>
);

// --- Komponen Loading ---
const Spinner = () => (
    <div className="w-12 h-12 border-4 border-white border-t-transparent border-solid rounded-full animate-spin"></div>
);

// --- Komponen Error ---
const ErrorDisplay = ({ message }) => (
    <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl text-center w-full">
        <h4 className="font-bold mb-1">Oops!</h4>
        <p className="text-sm">{message}</p>
    </div>
);

function QrisPaymentPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: bookingIdFromUrl } = useParams();
    const qrImageRef = useRef(null);

    // --- Data Booking ---
    const { booking } = location.state || {};
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State Modal ---
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: "confirm",
        title: "",
        message: "",
        isLoading: false,
    });

    const orderId = booking?.id || bookingIdFromUrl;
    const totalPayment = booking?.total_harga;

    // --- Fetch Data ---
    useEffect(() => {
        if (!orderId) {
            navigate("/history");
            return;
        }

        const fetchPaymentMethods = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiClient.get("/api/payment-methods");
                const activeQrisMethods = response.data.filter(
                    (method) => method.status === "Aktif" && method.image_url
                );

                if (activeQrisMethods.length === 0) {
                    setError("Metode pembayaran QRIS tidak tersedia.");
                } else {
                    setPaymentMethods(activeQrisMethods);
                }
            } catch (err) {
                console.error("Error:", err);
                setError("Gagal memuat data pembayaran.");
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentMethods();
    }, [orderId, navigate]);

    const handleBack = () => navigate(-1);

    // --- Logic Simpan QR ---
    const initiateSaveQR = () => {
        setModalState({
            isOpen: true,
            type: "confirm",
            title: "Simpan QR Code",
            message: "Apakah Anda yakin ingin menyimpan QR Code ini ke galeri?",
            isLoading: false,
        });
    };

    const handleConfirmSave = async () => {
        const qrisMethod = paymentMethods[0];
        const API_URL = "http://localhost:8000";
        const imageUrl = `${API_URL}/api/payment-methods/image/${qrisMethod.id}`;

        setModalState((prev) => ({ ...prev, isLoading: true }));

        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `qris_moodly_${qrisMethod.name}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setModalState({
                isOpen: true,
                type: "success",
                title: "Berhasil",
                message: "QR Code telah disimpan ke galeri",
                isLoading: false,
            });

            setTimeout(() => {
                setModalState((prev) => ({ ...prev, isOpen: false }));
            }, 2000);
        } catch (error) {
            console.error("Gagal simpan QR:", error);
            setModalState({
                isOpen: true,
                type: "error",
                title: "Gagal",
                message: "Gagal menyimpan gambar. Silakan coba lagi.",
                isLoading: false,
            });
        }
    };

    const closeModal = () => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
    };

    const handleNavigateToUpload = () => {
        if (!orderId) return;
        navigate(`/booking/upload-proof/${orderId}`, { state: { booking } });
    };

    const formatCurrency = (amount) => {
        if (typeof amount !== "number") return "Rp 0";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // --- Render Content ---
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-500 font-medium">
                        Memuat QR Code...
                    </p>
                </div>
            );
        }

        if (error) return <ErrorDisplay message={error} />;

        const qrisMethod = paymentMethods[0];
        if (!qrisMethod)
            return <ErrorDisplay message="QRIS tidak ditemukan." />;

        // --- LOGIKA PARSING (PEMECAHAN STRING) DI SINI ---
        // Database hanya punya kolom 'account_details' (misal: "123456789 a/n Moodly")
        // Kita pecah string tersebut berdasarkan pemisah " a/n "

        const rawDetails = qrisMethod.account_details || "";
        let accNumber = "-";
        let accName = "Moodly"; // Default jika tidak ditemukan

        // Cek apakah ada pemisah " a/n " (case insensitive)
        const splitDetails = rawDetails.split(/ a\/n /i);

        if (splitDetails.length > 1) {
            accNumber = splitDetails[0].trim(); // Bagian depan (No Rekening)
            accName = splitDetails[1].trim(); // Bagian belakang (Atas Nama)
        } else {
            // Jika format admin beda, tampilkan rawDetails di no rekening saja
            accNumber = rawDetails;
        }
        // --- AKHIR LOGIKA PARSING ---

        const API_URL = "http://localhost:8000";
        const imageUrl = `${API_URL}/api/payment-methods/image/${qrisMethod.id}`;

        return (
            <>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Scan QR Anda
                </h2>

                {/* QR Code Container */}
                <div className="border border-gray-400 rounded-lg p-2 mb-8 inline-block bg-white">
                    <img
                        ref={qrImageRef}
                        src={imageUrl}
                        alt="QR Code"
                        className="w-48 h-48 object-contain"
                        crossOrigin="anonymous"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "https://via.placeholder.com/200?text=QR+Error";
                        }}
                    />
                </div>

                {/* Detail Pembayaran (Sekarang sudah Dinamis & Terpisah) */}
                <div className="bg-gray-100 rounded-2xl p-5 w-full text-sm space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                        <span className="text-gray-600">Bank</span>
                        <span className="font-bold text-gray-900 italic">
                            {qrisMethod.name}
                        </span>
                    </div>

                    <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                        <span className="text-gray-600">No. Rekening</span>
                        <span className="font-bold text-gray-900 italic tracking-wide">
                            {/* Menampilkan No Rekening hasil parsing */}
                            {accNumber}
                        </span>
                    </div>

                    <div className="flex justify-between items-center pb-2">
                        <span className="text-gray-600">Atas nama</span>
                        <span className="font-bold text-gray-900 italic">
                            {/* Menampilkan Atas Nama hasil parsing */}
                            {accName}
                        </span>
                    </div>

                    <div className="bg-pink-500 rounded-lg p-3 flex justify-between items-center text-white mt-2">
                        <span className="font-medium">Total Pembayaran</span>
                        <span className="font-bold text-lg italic">
                            {formatCurrency(totalPayment)}
                        </span>
                    </div>

                    {/* Tombol Simpan */}
                    <button
                        onClick={initiateSaveQR}
                        className="w-full bg-cyan-400 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-full shadow-md transition-all active:scale-95 mt-4"
                    >
                        Simpan QR
                    </button>
                </div>
            </>
        );
    };

    return (
        <div className="font-sans bg-cyan-500 min-h-screen max-w-md mx-auto flex flex-col">
            <header className="flex items-center p-4 bg-white shadow-sm sticky top-0 z-10">
                <button onClick={handleBack} className="p-1 -ml-1 mr-2 group">
                    <BackArrowIcon />
                </button>
                <h1 className="text-lg font-bold flex-1 text-center text-black mr-6">
                    Bayar Dengan QRIS
                </h1>
            </header>

            <main className="flex-1 p-6 flex flex-col items-center justify-center">
                <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 w-full flex flex-col items-center mb-8">
                    {renderContent()}
                </div>

                {!loading && !error && (
                    <button
                        onClick={handleNavigateToUpload}
                        className="w-full max-w-[90%] bg-black text-white font-bold py-4 px-6 rounded-full shadow-lg hover:bg-gray-900 transition-transform active:scale-95"
                    >
                        Upload Bukti Transaksi
                    </button>
                )}
            </main>

            {/* --- MODAL SYSTEM --- */}
            <NotificationModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                type={modalState.type}
                title={modalState.title}
                message={modalState.message}
                onConfirm={handleConfirmSave}
                confirmText="Simpan"
                cancelText="Batal"
                isLoading={modalState.isLoading}
            />
        </div>
    );
}

export default QrisPaymentPage;
