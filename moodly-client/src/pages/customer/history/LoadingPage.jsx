import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axios";

// --- Impor Echo & Pusher ---
import Echo from "laravel-echo";
import Pusher from "pusher-js";
window.Pusher = Pusher;

// --- Inisialisasi Echo (Sesuaikan dengan .env Anda) ---
const echo = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
    enabledTransports: ["ws", "wss"],
    // Authorizer Custom untuk Sanctum
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                apiClient
                    .post("/api/broadcasting/auth", {
                        socket_id: socketId,
                        channel_name: channel.name,
                    })
                    .then((response) => callback(null, response.data))
                    .catch((error) => callback(error));
            },
        };
    },
});

// --- Styles Animasi CSS-in-JS ---
const styles = `
@keyframes coin-flow {
  0% { transform: translate(-40px, -20px) scale(0.8); opacity: 0; }
  20% { transform: translate(0px, 0px) scale(1); opacity: 1; }
  80% { transform: translate(0px, 40px) scale(1); opacity: 1; }
  100% { transform: translate(0px, 60px) scale(0.6); opacity: 0; }
}
@keyframes pulse-target {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.coin-flow-animation {
  animation: coin-flow 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  animation-delay: 0.2s;
}
.pulse-target-animation {
  animation: pulse-target 1s ease-in-out infinite;
  transform-origin: center bottom;
}
.money-animation-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 150px;
}
@keyframes check-pop {
  0% { transform: scale(0.5) rotate(-10deg); opacity: 0; }
  60% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); }
}
.check-pop-animation {
  animation: check-pop 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
}
@keyframes cross-pop {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); }
}
.cross-pop-animation {
  animation: cross-pop 0.6s ease-out forwards;
}
`;

// --- Ikon SVG Animasi Custom ---
const SendingMoneyIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className="w-full h-full relative"
        fill="none"
    >
        {/* Target (Admin) */}
        <g
            id="receiver-target"
            className="pulse-target-animation"
            transform="translate(0, 5)"
        >
            <rect
                x="20"
                y="60"
                width="60"
                height="25"
                rx="5"
                fill="#4CAF50"
                stroke="#388E3C"
                strokeWidth="2"
            />
            <path d="M20 60 L50 55 L80 60 Z" fill="#388E3C" />
            <rect x="40" y="56" width="20" height="3" fill="#2E7D32" rx="1.5" />
            <circle cx="50" cy="70" r="5" fill="#FFFFFF" />
            <path d="M40 75 C40 80, 60 80, 60 75 Z" fill="#FFFFFF" />
        </g>

        {/* Koin Terbang */}
        <g id="animated-coin" className="coin-flow-animation">
            <circle
                cx="50"
                cy="20"
                r="12"
                fill="#FFD700"
                stroke="#DAA520"
                strokeWidth="2"
            />
            <text
                x="50"
                y="24"
                textAnchor="middle"
                fontSize="10"
                fill="#DAA520"
                fontWeight="bold"
            >
                $
            </text>
        </g>

        {/* Partikel Cahaya */}
        <g
            id="flow-particle-1"
            className="coin-flow-animation"
            style={{ animationDelay: "0.0s" }}
        >
            <circle cx="50" cy="20" r="3" fill="#FFD700" opacity="0.6" />
        </g>
        <g
            id="flow-particle-2"
            className="coin-flow-animation"
            style={{ animationDelay: "0.4s" }}
        >
            <circle cx="50" cy="20" r="3" fill="#FFD700" opacity="0.6" />
        </g>
    </svg>
);

const SuccessIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-36 h-36 text-white check-pop-animation"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeOpacity="0.3"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
);

const RejectedIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-36 h-36 text-red-500 bg-white rounded-full cross-pop-animation"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeOpacity="0.3"
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
        />
    </svg>
);

const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-10">
        <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
    </div>
);

const MobileLayout = ({ children }) => (
    <div className="flex justify-center min-h-screen bg-[#FFF9F8]">
        <div className="w-full max-w-md min-h-screen bg-[#00B0FF] flex flex-col">
            {children}
        </div>
    </div>
);

export default function LoadingPage() {
    const navigate = useNavigate();
    const { id: bookingId } = useParams();
    const { state } = useLocation();
    const { user: authUser } = useAuth(); // Ambil user ID untuk channel privat

    const bookingRef = useRef(state?.booking || null);

    const [verificationStatus, setVerificationStatus] = useState("waiting"); // waiting, success, rejected
    const [rejectionReason, setRejectionReason] = useState("");
    const [loading, setLoading] = useState(!state?.booking);
    const [error, setError] = useState(null);

    // --- 1. FETCH DATA (Initial Check) ---
    useEffect(() => {
        if (bookingId) {
            apiClient
                .get(`/api/history/${bookingId}`)
                .then((response) => {
                    const data = response.data;
                    bookingRef.current = data;

                    // Update status jika sudah berubah di server saat halaman dimuat
                    if (data.status_pesanan === "Dijadwalkan") {
                        setVerificationStatus("success");
                    } else if (data.status_pesanan === "Pembayaran Ditolak") {
                        setRejectionReason(
                            data.catatan_pembatalan || "Ditolak oleh admin."
                        );
                        setVerificationStatus("rejected");
                    }
                })
                .catch((err) => {
                    console.error("Fetch error:", err);
                    setError("Gagal memuat status pesanan.");
                })
                .finally(() => setLoading(false));
        }
    }, [bookingId]);

    // --- 2. REAL-TIME LISTENER (Pusher/Reverb) ---
    useEffect(() => {
        if (!authUser) return;

        // Channel Private User
        const channelName = `customer.${authUser.id}`;
        console.log(`🔌 Listening to channel: ${channelName}`);

        echo.private(channelName).listen("PaymentVerified", (event) => {
            console.log("🔔 Payment Event Received:", event);

            // Pastikan event ini untuk booking yang sedang dibuka
            if (String(event.booking.id) === String(bookingId)) {
                bookingRef.current = event.booking;

                if (event.booking.status_pesanan === "Dijadwalkan") {
                    setVerificationStatus("success");
                } else if (
                    event.booking.status_pesanan === "Pembayaran Ditolak"
                ) {
                    setRejectionReason(
                        event.booking.catatan_pembatalan ||
                            "Alasan tidak spesifik."
                    );
                    setVerificationStatus("rejected");
                }
            }
        });

        return () => {
            echo.leave(channelName);
        };
    }, [authUser, bookingId]);

    // --- 3. NAVIGASI OTOMATIS ---
    useEffect(() => {
        if (verificationStatus === "success") {
            const timer = setTimeout(() => {
                navigate(`/history/receipt/${bookingId}`, {
                    state: { booking: bookingRef.current },
                    replace: true,
                });
            }, 2000); // Delay 2 detik untuk lihat animasi sukses
            return () => clearTimeout(timer);
        }

        if (verificationStatus === "rejected") {
            const timer = setTimeout(() => {
                // Arahkan kembali ke upload ulang
                navigate(`/booking/upload-proof/${bookingId}`, {
                    replace: true,
                    state: {
                        booking: bookingRef.current,
                        error: `Pembayaran ditolak: ${rejectionReason}`,
                    },
                });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [verificationStatus, bookingId, rejectionReason, navigate]);

    // --- RENDER CONTENT ---
    const renderContent = () => {
        if (loading)
            return (
                <>
                    <LoadingSpinner />
                    <h1 className="text-2xl font-semibold italic mt-4 text-shadow">
                        Memuat...
                    </h1>
                </>
            );
        if (error)
            return (
                <>
                    <div className="money-animation-container mb-12">
                        <RejectedIcon />
                    </div>
                    <h1 className="text-3xl font-semibold">Error</h1>
                    <p className="text-lg mt-2">{error}</p>
                </>
            );

        switch (verificationStatus) {
            case "success":
                return (
                    <>
                        <div className="money-animation-container mb-12">
                            <SuccessIcon />
                        </div>
                        <h1 className="text-3xl font-semibold text-shadow text-center">
                            Pembayaran Diterima!
                        </h1>
                        <p className="text-lg font-light mb-4 text-center">
                            Mengarahkan ke nota...
                        </p>
                    </>
                );
            case "rejected":
                return (
                    <>
                        <div className="money-animation-container mb-12">
                            <RejectedIcon />
                        </div>
                        <h1 className="text-3xl font-semibold text-shadow text-center">
                            Pembayaran Ditolak
                        </h1>
                        <p className="text-lg font-light mb-4 text-center bg-white/10 p-2 rounded">
                            Alasan: {rejectionReason}
                        </p>
                    </>
                );
            default: // Waiting
                return (
                    <>
                        <div className="money-animation-container mb-12">
                            <SendingMoneyIcon />
                        </div>
                        <h1 className="text-3xl font-semibold italic mb-2 text-shadow text-center">
                            Memverifikasi...
                        </h1>
                        <p className="text-lg font-light mb-4 text-center px-4">
                            Admin sedang mengecek bukti pembayaran Anda.
                            <br />
                            <span className="text-sm opacity-80">
                                (Biasanya memakan waktu 1-5 menit)
                            </span>
                        </p>

                        {/* Animasi Titik */}
                        <div className="text-4xl font-extrabold tracking-widest animate-pulse mt-4">
                            . . .
                        </div>

                        {/* Tombol Cek Nanti */}
                        <div className="mt-12 w-full px-8">
                            <button
                                onClick={() => navigate("/home")}
                                className="w-full py-3 bg-white/20 hover:bg-white/30 text-white border border-white/40 rounded-xl font-bold transition backdrop-blur-sm active:scale-95"
                            >
                                Tunggu di Beranda
                            </button>
                            <p className="text-xs text-center mt-3 text-white/70">
                                Kami akan mengirimkan notifikasi saat pembayaran
                                dikonfirmasi.
                            </p>
                        </div>
                    </>
                );
        }
    };

    return (
        <MobileLayout>
            {/* Inject CSS Animasi */}
            <style>{styles}</style>

            <div className="flex flex-col items-center justify-center flex-1 text-white p-8 bg-[#00B0FF] min-h-screen relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10 w-full flex flex-col items-center">
                    {renderContent()}
                </div>
            </div>
        </MobileLayout>
    );
}
