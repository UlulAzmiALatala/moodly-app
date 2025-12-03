import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../../../api/axios";

// --- Helper function untuk format mata uang ---
const formatCurrency = (amount) => {
    if (typeof amount !== "number") {
        return "Rp 0";
    }
    return `Rp ${amount.toLocaleString("id-ID")}`;
};

// --- Helper untuk format tanggal batas bayar (misal: Hari ini + 1 hari) ---
const getDueDate = (bookingDateString) => {
    if (!bookingDateString) return "-";
    const date = new Date(bookingDateString);
    // Tambah 2 jam atau 1 hari sebagai batas bayar (sesuai kebijakan).
    // Di sini kita samakan dengan tanggal booking tapi jamnya +2 jam.
    return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

// --- Komponen Ikon (Tetap Sama) ---
const BackArrowIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="currentColor"
        className="text-gray-800 group-hover:text-black"
        viewBox="0 0 16 16"
    >
        <path
            fillRule="evenodd"
            d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
        />
    </svg>
);
const HelpIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="h-5 w-5 mr-1"
        viewBox="0 0 16 16"
    >
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
        <path d="M5.25 6.033h1.32c0-.771.643-1.305 1.33-1.305.756 0 1.33.63 1.33 1.305 0 .721-.403 1.218-.814 1.754l-.523.678c-.289.375-.589.65-.589.97v.5h1.32c0-.251.04-.492.12-.688.08-.196.22-.396.43-.61G8.4 9.124l.592-.772c.494-.64.834-1.274.834-2.11C9.826 4.613 8.986 4 8 4s-1.826.613-1.826 2.033zM8 11.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    </svg>
);
const PhoneIcon = ({ className = "h-5 w-5" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className={className}
        viewBox="0 0 16 16"
    >
        <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547c.52-.13 1.071-.015 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.363-1.031-.038-2.137.703-2.877L1.885.511z" />
    </svg>
);
const ClockIcon = ({ className = "h-5 w-5" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className={className}
        viewBox="0 0 16 16"
    >
        <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
    </svg>
);
const UniversityIcon = ({ className = "h-5 w-5" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className={className}
        viewBox="0 0 16 16"
    >
        <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0l7.5-3a.5.5 0 0 0 .025-.917l-7.5-3.5zM8 5.482 1.5 8.03l6.5 2.61 6.5-2.61L8 5.482z" />
        <path d="M3.5 9.422a.5.5 0 0 0-.025.917l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0-.025-.917V8.87l-4.223 1.69a.5.5 0 0 1-.372 0L3.5 8.87v.552zM14 9.173l-4.5 1.8v3.25a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3.25l1-1.838v-3.504l-1 .399v2.748zM2 9.173l4.5 1.8v3.25a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-3.25L1 7.335v3.504l1-.399v-2.748z" />
    </svg>
);
const SpecializationIcon = ({ className = "h-5 w-5" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className={className}
        viewBox="0 0 16 16"
    >
        <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5zm1.886 6.914L15 7.151V12.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V7.15l6.614 1.764a1.5 1.5 0 0 0 .772 0zM1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5z" />
    </svg>
);

// --- Komponen Utama ---
function PaymentOnlinePage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Ambil data dari state
    const { booking, displayData } = location.state || {};

    const [phoneJustUpdated, setPhoneJustUpdated] = useState(false);
    const [isPhoneConfirmed, setIsPhoneConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- STATE TIMER ---
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [isExpired, setIsExpired] = useState(false);

    // --- LOGIKA TIMER 2 JAM (REAL TIME) ---
    useEffect(() => {
        if (!booking?.created_at) return;

        const bookingTime = new Date(booking.created_at).getTime();
        // Tambahkan 2 jam (2 jam * 60 menit * 60 detik * 1000 ms)
        const expirationTime = bookingTime + 2 * 60 * 60 * 1000;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = expirationTime - now;

            if (distance < 0) {
                clearInterval(interval);
                setIsExpired(true);
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            } else {
                const hours = Math.floor(
                    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                const minutes = Math.floor(
                    (distance % (1000 * 60 * 60)) / (1000 * 60)
                );
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft({ hours, minutes, seconds });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [booking?.created_at]);

    // Logic untuk notifikasi update telepon
    useEffect(() => {
        if (location.state?.phoneUpdated) {
            setPhoneJustUpdated(true);
            setIsPhoneConfirmed(false);
            const { phoneUpdated, ...restState } = location.state;
            navigate(location.pathname, { state: restState, replace: true });
        }
    }, [location.state, navigate]);

    // Validasi State
    if (!booking || !displayData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 font-sans max-w-md mx-auto">
                <h2 className="text-xl font-bold mb-4">
                    Data Pemesanan Tidak Ditemukan
                </h2>
                <button
                    onClick={() => navigate("/booking")}
                    className="py-3 px-6 rounded-lg cursor-pointer font-bold text-sm bg-blue-600 text-white hover:bg-blue-700"
                >
                    Kembali ke Pemesanan
                </button>
            </div>
        );
    }

    // Destructure Data
    const {
        counselorName,
        counselorImage,
        counselorUniversity,
        counselorSpecialty,
        method,
        scheduleDateDisplay,
        scheduleTime,
        durationText,
        consultationFee,
        serviceFee,
    } = displayData;

    const {
        id: orderId,
        total_harga: totalPayment,
        created_at: bookingDateString, // Ambil tanggal booking dibuat
        customer,
    } = booking;

    const userPhoneNumber = customer?.phone || "08xx-xxxx-xxxx";

    // Batas bayar dinamis
    const paymentDueDate = getDueDate(bookingDateString);

    const handleBack = () => navigate(-1);

    const handleConfirmPhoneNumber = () => {
        setIsPhoneConfirmed(true);
        setPhoneJustUpdated(false);
    };

    const handleChangePhoneNumber = () => {
        navigate("/profile/change-phone", {
            state: {
                ...location.state,
                currentPhoneNumber: userPhoneNumber,
                from: location.pathname,
            },
        });
    };

    const handleContinueToPayment = async () => {
        if (!isPhoneConfirmed && !phoneJustUpdated) {
            alert("Harap konfirmasi nomor telepon Anda terlebih dahulu.");
            return;
        }

        if (isExpired) {
            alert("Waktu pembayaran telah habis. Silakan buat pesanan ulang.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Navigasi ke halaman QRIS dengan membawa data booking
            navigate(`/booking/payment/qris/${orderId}`, {
                state: {
                    booking: booking,
                },
            });
        } catch (err) {
            console.error("Error:", err);
            alert("Gagal memproses. Silakan coba lagi.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="font-sans bg-pink-50 min-h-screen relative pb-28 max-w-md mx-auto">
            {/* 1. Header */}
            <header className="flex items-center p-4 bg-white shadow-sm sticky top-0 z-10">
                <button onClick={handleBack} className="p-1 -ml-1 mr-2 group">
                    <BackArrowIcon />
                </button>
                <h1 className="text-lg font-bold m-0 flex-1 text-gray-800">
                    Konsultasi yang dipilih
                </h1>
            </header>

            {/* 2. Konten Utama */}
            <main className="p-4">
                {/* Timer Pembayaran Real-Time */}
                <div className="text-center mb-4 text-sm text-gray-800">
                    {isExpired ? (
                        <span className="text-red-600 font-bold">
                            Waktu Pembayaran Habis
                        </span>
                    ) : (
                        <>
                            Selesaikan Pembayaran dalam
                            <div className="flex items-center justify-center mt-1 gap-1">
                                {/* Jam */}
                                <span className="bg-blue-900 text-white px-2 py-1 rounded font-bold min-w-[30px]">
                                    {String(timeLeft.hours).padStart(2, "0")}
                                </span>
                                <span className="font-bold">:</span>
                                {/* Menit */}
                                <span className="bg-blue-900 text-white px-2 py-1 rounded font-bold min-w-[30px]">
                                    {String(timeLeft.minutes).padStart(2, "0")}
                                </span>
                                <span className="font-bold">:</span>
                                {/* Detik */}
                                <span className="bg-blue-900 text-white px-2 py-1 rounded font-bold min-w-[30px]">
                                    {String(timeLeft.seconds).padStart(2, "0")}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Kartu Detail */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 divide-y divide-gray-100">
                    {/* Info Psikolog */}
                    <div className="p-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-3">
                            <span>Order ID: #{orderId}</span>
                            <span>Batas Bayar: {paymentDueDate}</span>
                        </div>
                        <div className="flex items-center">
                            <img
                                src={
                                    counselorImage ||
                                    "https://via.placeholder.com/80"
                                }
                                alt="Foto Psikolog"
                                className="w-14 h-14 rounded-full object-cover mr-4 border border-gray-300"
                            />
                            <div className="text-sm text-gray-600 space-y-1">
                                <div className="text-base font-bold text-black">
                                    {counselorName || "Nama Psikolog"}
                                </div>
                                <div className="flex items-center">
                                    <UniversityIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                    {counselorUniversity ||
                                        "Universitas tidak diketahui"}
                                </div>
                                <div className="flex items-center">
                                    <SpecializationIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                    Spesialisasi :{" "}
                                    {counselorSpecialty || "Belum ada"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Jadwal Konsultasi */}
                    <div className="p-4">
                        <h4 className="m-0 mb-3 text-base font-bold">
                            Jadwal Konsultasi Online
                        </h4>
                        <div className="flex items-center text-sm text-gray-800 mb-2">
                            <PhoneIcon className="h-5 w-5 mr-1.5 flex-shrink-0" />
                            {method} ({durationText || "..."} Menit)
                        </div>
                        <div className="flex items-center text-sm text-gray-800 mb-2">
                            <ClockIcon className="h-5 w-5 mr-1.5 flex-shrink-0" />
                            {scheduleDateDisplay}, {scheduleTime} WIB
                        </div>
                    </div>

                    {/* Konfirmasi Nomor */}
                    <div className="p-4">
                        <p className="text-sm">
                            Apakah nomor yang kamu gunakan sudah benar?
                        </p>
                        <div className="text-sm text-gray-800 mb-2 mt-2">
                            <strong className="flex items-center">
                                <PhoneIcon className="h-5 w-5 mr-1.5 flex-shrink-0" />
                                {userPhoneNumber}
                            </strong>
                        </div>

                        {phoneJustUpdated && !isPhoneConfirmed && (
                            <p className="text-xs text-green-600 mt-1.5">
                                No. Telepon berhasil di ubah
                            </p>
                        )}
                        {isPhoneConfirmed && (
                            <p className="text-xs text-green-600 mt-1.5">
                                Pastikan nomor telepon ini aktif dan dapat
                                menerima panggilan selama sesi berlangsung.
                            </p>
                        )}

                        {!isPhoneConfirmed && (
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={handleChangePhoneNumber}
                                    className="flex-1 py-2.5 px-4 rounded-md cursor-pointer font-bold text-xs bg-orange-400 text-white hover:bg-orange-500"
                                >
                                    Ubah
                                </button>
                                <button
                                    onClick={handleConfirmPhoneNumber}
                                    className="flex-1 py-2.5 px-4 rounded-md cursor-pointer font-bold text-xs bg-green-500 text-white hover:bg-green-600"
                                >
                                    Benar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Rincian Biaya */}
                    <div className="p-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Biaya Konsultasi</span>
                            <span>{formatCurrency(consultationFee)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span>Biaya Layanan</span>
                            <span>{formatCurrency(serviceFee)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold border-t border-dashed border-gray-300 pt-3 mt-3">
                            <strong>Total Pembayaran</strong>
                            <strong>{formatCurrency(totalPayment)}</strong>
                        </div>
                    </div>
                </div>

                {/* Syarat & Ketentuan */}
                <div className="text-center text-xs text-gray-600 mt-5 leading-normal">
                    <p>Dengan ini kamu menyetujui syarat dan ketentuan</p>
                    <a
                        href="#"
                        className="text-blue-600 no-underline font-bold hover:underline"
                    >
                        Peraturan Konseling
                    </a>
                    <div className="mt-2">
                        <a
                            href="#"
                            className="flex items-center justify-center text-blue-600 no-underline font-bold hover:underline"
                        >
                            <HelpIcon /> Butuh Bantuan ?
                        </a>
                    </div>
                </div>
            </main>

            {/* 3. Footer Pembayaran */}
            <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white p-4 flex justify-between items-center shadow-[0_-2px_8px_rgba(0,0,0,0.1)]">
                <div>
                    <div className="text-sm">Total Pembayaran</div>
                    <div className="font-bold text-lg text-black">
                        {formatCurrency(totalPayment)}
                    </div>
                </div>
                <button
                    onClick={handleContinueToPayment}
                    className="py-3 px-6 rounded-lg cursor-pointer font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={
                        (!isPhoneConfirmed && !phoneJustUpdated) ||
                        isSubmitting ||
                        isExpired
                    }
                >
                    {isSubmitting ? "Memproses..." : "Lanjutkan"}
                </button>
            </footer>
        </div>
    );
}

export default PaymentOnlinePage;
