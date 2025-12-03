import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axios";

// --- Impor Echo & Pusher ---
import Echo from "laravel-echo";
import Pusher from "pusher-js";
window.Pusher = Pusher;

// --- Inisialisasi Echo ---
const echo = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
    enabledTransports: ["ws", "wss"],
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

// --- Styles Animasi (Sama) ---
const styles = `
@keyframes coin-flow { 0% { transform: translate(-40px, -20px) scale(0.8); opacity: 0; } 20% { transform: translate(0px, 0px) scale(1); opacity: 1; } 80% { transform: translate(0px, 40px) scale(1); opacity: 1; } 100% { transform: translate(0px, 60px) scale(0.6); opacity: 0; } }
@keyframes pulse-target { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
.coin-flow-animation { animation: coin-flow 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite; animation-delay: 0.2s; }
.pulse-target-animation { animation: pulse-target 1s ease-in-out infinite; transform-origin: center bottom; }
.money-animation-container { display: flex; justify-content: center; align-items: center; width: 150px; height: 150px; }
@keyframes check-pop { 0% { transform: scale(0.5) rotate(-10deg); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1) rotate(0deg); } }
.check-pop-animation { animation: check-pop 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards; }
@keyframes cross-pop { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); } }
.cross-pop-animation { animation: cross-pop 0.6s ease-out forwards; }
`;

// --- Ikon SVG (Sama) ---
const SendingMoneyIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className="w-full h-full relative"
        fill="none"
    >
        {" "}
        <g
            id="receiver-target"
            className="pulse-target-animation"
            transform="translate(0, 5)"
        >
            {" "}
            <rect
                x="20"
                y="60"
                width="60"
                height="25"
                rx="5"
                fill="#4CAF50"
                stroke="#388E3C"
                strokeWidth="2"
            />{" "}
            <path d="M20 60 L50 55 L80 60 Z" fill="#388E3C" />{" "}
            <rect x="40" y="56" width="20" height="3" fill="#2E7D32" rx="1.5" />{" "}
            <circle cx="50" cy="70" r="5" fill="#FFFFFF" />{" "}
            <path d="M40 75 C40 80, 60 80, 60 75 Z" fill="#FFFFFF" />{" "}
        </g>{" "}
        <g id="animated-coin" className="coin-flow-animation">
            {" "}
            <circle
                cx="50"
                cy="20"
                r="12"
                fill="#FFD700"
                stroke="#DAA520"
                strokeWidth="2"
            />{" "}
            <text
                x="50"
                y="24"
                textAnchor="middle"
                fontSize="10"
                fill="#DAA520"
                fontWeight="bold"
            >
                {" "}
                ${" "}
            </text>{" "}
        </g>{" "}
        <g
            id="flow-particle-1"
            className="coin-flow-animation"
            style={{ animationDelay: "0.0s" }}
        >
            {" "}
            <circle cx="50" cy="20" r="3" fill="#FFD700" opacity="0.6" />{" "}
        </g>{" "}
        <g
            id="flow-particle-2"
            className="coin-flow-animation"
            style={{ animationDelay: "0.4s" }}
        >
            {" "}
            <circle cx="50" cy="20" r="3" fill="#FFD700" opacity="0.6" />{" "}
        </g>{" "}
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
        {" "}
        <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeOpacity="0.3"
        />{" "}
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />{" "}
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
        {" "}
        <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeOpacity="0.3"
        />{" "}
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
        />{" "}
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
    const { user: authUser } = useAuth();

    const bookingRef = useRef(state?.booking || null);

    const [verificationStatus, setVerificationStatus] = useState("waiting");
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

                    // Update status jika sudah berubah di server
                    if (data.status_pesanan === "Dijadwalkan") {
                        setVerificationStatus("success");
                    } else if (data.status_pesanan === "Pembayaran Ditolak") {
                        setRejectionReason(
                            data.catatan_pembatalan || "Ditolak"
                        );
                        setVerificationStatus("rejected");
                    }
                })
                .catch((err) => console.error("Fetch error:", err))
                .finally(() => setLoading(false));
        }
    }, [bookingId]);

    // --- 2. REAL-TIME LISTENER (PERBAIKAN UTAMA) ---
    useEffect(() => {
        // Pastikan user dan bookingId ada
        if (!authUser || !bookingId) return;

        const channelName = `customer.${authUser.id}`;
        console.log(`🔌 [LoadingPage] Subscribe: ${channelName}`);

        const channel = echo.private(channelName);

        channel.listen("PaymentVerified", (event) => {
            console.log("🔔 [Event Masuk]", event);

            // --- FIX: Konversi ke String agar aman ---
            const eventBookingId = String(event.booking.id);
            const currentBookingId = String(bookingId);

            if (eventBookingId === currentBookingId) {
                console.log("✅ ID Cocok! Update State...");

                bookingRef.current = event.booking; // Update Ref

                // Update State UI Langsung
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
            } else {
                console.log(
                    `⚠️ ID Beda: Event(${eventBookingId}) vs URL(${currentBookingId})`
                );
            }
        });

        return () => {
            console.log(`🔌 Unsubscribe: ${channelName}`);
            channel.stopListening("PaymentVerified");
            echo.leave(channelName);
        };
    }, [authUser, bookingId]); // Dependency array

    // --- 3. NAVIGASI OTOMATIS ---
    useEffect(() => {
        if (verificationStatus === "success") {
            const timer = setTimeout(() => {
                navigate(`/history/receipt/${bookingId}`, {
                    state: { booking: bookingRef.current },
                    replace: true,
                });
            }, 2000);
            return () => clearTimeout(timer);
        }

        if (verificationStatus === "rejected") {
            const timer = setTimeout(() => {
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

    // --- RENDER (Sama) ---
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
            default:
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
                        </p>
                        <div className="text-4xl font-extrabold tracking-widest animate-pulse mt-4">
                            . . .
                        </div>
                    </>
                );
        }
    };

    return (
        <MobileLayout>
            <style>{styles}</style>
            <div className="flex flex-col items-center justify-center flex-1 text-white p-8 bg-[#00B0FF] min-h-screen">
                {renderContent()}
            </div>
        </MobileLayout>
    );
}
