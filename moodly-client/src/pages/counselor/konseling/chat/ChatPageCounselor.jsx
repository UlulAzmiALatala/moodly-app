import React, { useState, useEffect, useRef, useMemo } from "react"; // 1. Import useMemo
import { useNavigate, useParams, Link } from "react-router-dom";
import apiClient from "../../../../api/axios.js";
import { useAuth } from "../../../../context/AuthContext.jsx";

import Echo from "laravel-echo";
import Pusher from "pusher-js";
window.Pusher = Pusher;

// --- Echo Config (Tidak Berubah) ---
const echo = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY || "reverb_key",
    wsHost: import.meta.env.VITE_REVERB_HOST || "127.0.0.1",
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || "http") === "https",
    enabledTransports: ["ws", "wss"],
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                apiClient
                    .post("/api/broadcasting/auth", {
                        socket_id: socketId,
                        channel_name: channel.name,
                    })
                    .then((response) => {
                        callback(null, response.data);
                    })
                    .catch((error) => {
                        callback(error);
                    });
            },
        };
    },
});

// --- Komponen Layout & Ikon (Tidak Berubah) ---
const MobileLayout = ({ children }) => (
    <div className="flex justify-center min-h-screen bg-white">
        <div className="w-full max-w-md min-h-screen bg-white flex flex-col border-x">
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
const SendIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2.5"
        stroke="currentColor"
        className="w-6 h-6"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
        />
    </svg>
);
// --- Akhir Komponen Layout & Ikon ---

// --- 2. HELPER BARU: Format Sisa Waktu ---
const formatTimeRemaining = (ms) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
        2,
        "0"
    );
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
};
// --- AKHIR HELPER ---

export default function ChatPageCounselor() {
    const navigate = useNavigate();
    const { id: bookingId } = useParams();
    const { user: authUser } = useAuth(); // Ini adalah Konselor

    const [messages, setMessages] = useState([]);
    const [bookingInfo, setBookingInfo] = useState(null);
    const [input, setInput] = useState("");
    const [isChatEnded, setIsChatEnded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);

    // --- 3. STATE BARU UNTUK TIMER ---
    const [timeRemainingString, setTimeRemainingString] = useState("Memuat...");
    // --- AKHIR STATE BARU ---

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 1. Fetch data chat (Tidak Berubah)
    useEffect(() => {
        if (!bookingId || !authUser) {
            setLoading(true);
            return;
        }

        const channelName = `chat.${bookingId}`;

        const handleNewMessage = (event) => {
            const newMessage = event.message;
            setMessages((prevMessages) => {
                if (!prevMessages.find((msg) => msg.id === newMessage.id)) {
                    return [...prevMessages, newMessage];
                }
                return prevMessages;
            });
        };

        const fetchChatData = async () => {
            try {
                setLoading(true);
                // Pastikan endpoint ini juga me-return booking.durasiKonseling
                const response = await apiClient.get(
                    `/api/booking/${bookingId}/chat/messages`
                );

                const booking = response.data.booking || null;
                setMessages(response.data.messages || []);
                setBookingInfo(booking); // <-- Simpan info booking

                const endedStatus = ["Selesai", "Dibatalkan", "Tidak Hadir"];
                if (
                    endedStatus.includes(response.data.booking?.status_pesanan)
                ) {
                    setIsChatEnded(true);
                    setTimeRemainingString("Sesi Selesai"); // Set timer jika sudah selesai
                } else {
                    console.log(
                        `Konselor mendengarkan di channel: ${channelName}`
                    );
                    echo.private(channelName).listen(
                        ".new-message",
                        handleNewMessage
                    );
                }
                setError(null);
            } catch (err) {
                console.error("Gagal mengambil data chat (Konselor):", err);
                // ... (error handling tidak berubah) ...
                if (err.response && err.response.status === 403) {
                    setError(
                        err.response.data.message ||
                            "Anda tidak diizinkan mengakses chat ini."
                    );
                } else {
                    setError("Gagal memuat percakapan.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchChatData();

        return () => {
            console.log(`Konselor berhenti mendengarkan: ${channelName}`);
            echo.leave(channelName);
        };
    }, [bookingId, authUser]);

    // --- 4. EFEK BARU UNTUK TIMER "KICK-OUT" ---
    useEffect(() => {
        if (!bookingInfo || isChatEnded) {
            return;
        }

        const { tanggal_konsultasi, jam_konsultasi, durasi_konseling } =
            bookingInfo;

        if (
            !tanggal_konsultasi ||
            !jam_konsultasi ||
            !durasi_konseling?.durasi_menit
        ) {
            setTimeRemainingString("Durasi tidak valid");
            return;
        }

        // Hitung waktu berakhir
        const startTime = new Date(`${tanggal_konsultasi}T${jam_konsultasi}`);
        const durationInMinutes = parseInt(durasi_konseling.durasi_menit);
        const endTime = new Date(
            startTime.getTime() + durationInMinutes * 60000
        );

        // Mulai interval timer
        const interval = setInterval(() => {
            const now = new Date();
            const remainingMs = endTime.getTime() - now.getTime();

            if (remainingMs <= 0) {
                // WAKTU HABIS
                clearInterval(interval);
                setTimeRemainingString("Sesi Selesai");
                setIsChatEnded(true); // <-- INI YANG AKAN MENGUNCI INPUT
            } else {
                // Update timer
                setTimeRemainingString(formatTimeRemaining(remainingMs));
            }
        }, 1000); // Setiap 1 detik

        // Cleanup interval saat komponen unmount
        return () => clearInterval(interval);
    }, [bookingInfo, isChatEnded]); // <-- Dijalankan saat bookingInfo dimuat
    // --- AKHIR EFEK BARU ---

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 3. Fungsi kirim pesan (Tidak Berubah)
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isChatEnded || sending) return;

        setSending(true);
        const sentInput = input.trim();
        setInput("");

        try {
            await apiClient.post(`/api/booking/${bookingId}/chat/messages`, {
                message: sentInput,
            });
        } catch (err) {
            console.error("Gagal mengirim pesan (Konselor):", err);
            setInput(sentInput);
            if (err.response && err.response.data.message) {
                alert(err.response.data.message);
                if (err.response.status === 403) setIsChatEnded(true);
            } else {
                alert("Gagal mengirim pesan.");
            }
        } finally {
            setSending(false);
        }
    };

    // --- Tampilan Loading, Error (Tidak Berubah) ---
    if (loading || !authUser) {
        return (
            <MobileLayout>
                <div className="text-center p-10">Memuat percakapan...</div>
            </MobileLayout>
        );
    }

    if (error) {
        return (
            <MobileLayout>
                <div className="text-center p-10 text-red-600">
                    <p>{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg"
                    >
                        Kembali
                    </button>
                </div>
            </MobileLayout>
        );
    }

    if (!bookingInfo) {
        return (
            <MobileLayout>
                <div className="text-center p-10">
                    Data booking tidak ditemukan.
                </div>
            </MobileLayout>
        );
    }
    // --- Akhir Tampilan Loading ---

    // --- Tampilan Chat Dinamis (Logika Avatar Dibalik) ---
    const customer = bookingInfo.customer;
    const counselorAvatar =
        authUser.avatar_url ||
        `https://placehold.co/32x32/E2E8F0/4A5568?text=${authUser.name.charAt(
            0
        )}`;
    const customerAvatar =
        customer.avatar_url ||
        `https://placehold.co/32x32/EBF8FF/3B82F6?text=${customer.name.charAt(
            0
        )}`;

    const fallbackCounselor = `https://placehold.co/32x32/E2E8F0/4A5568?text=K`;
    const fallbackCustomer = `https://placehold.co/32x32/EBF8FF/7F9CF5?text=C`;

    return (
        <MobileLayout>
            {/* Header */}
            <header className="bg-[#00A9E0] text-white flex items-center justify-between p-4 shadow-md sticky top-0 z-10">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="mr-3 p-1 hover:bg-[#0091D5]/30 rounded-full transition"
                    >
                        <BackArrowIcon />
                    </button>

                    <img
                        src={customerAvatar} // Tampilkan avatar customer
                        alt={customer.name}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = fallbackCustomer;
                        }}
                    />
                    <div>
                        <h2 className="font-semibold text-sm leading-tight">
                            {customer.name}
                        </h2>

                        {/* --- 5. TAMPILKAN TIMER --- */}
                        <span
                            className={`text-xs text-white/80 flex items-center ${
                                isChatEnded ? "font-bold text-yellow-300" : ""
                            }`}
                        >
                            <span
                                className={`w-2 h-2 rounded-full mr-1.5 ${
                                    isChatEnded ? "bg-red-500" : "bg-green-400"
                                }`}
                            ></span>
                            {isChatEnded
                                ? timeRemainingString
                                : `Sisa Waktu: ${timeRemainingString}`}
                        </span>
                        {/* --- AKHIR TAMPILAN TIMER --- */}
                    </div>
                </div>
            </header>

            {/* Chat Area (Logika Bubble Dibalik) */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9FAFB]">
                {messages.map((msg, i) => {
                    const isSenderMe = msg.sender_id === authUser.id; // 'Me' = Konselor

                    return (
                        <div
                            key={msg.id || i}
                            className={`flex ${
                                isSenderMe ? "justify-end" : "justify-start"
                            } items-end`}
                        >
                            {!isSenderMe && (
                                <img
                                    src={customerAvatar}
                                    alt={customer.name}
                                    className="w-8 h-8 rounded-full mr-2 object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = fallbackCustomer;
                                    }}
                                />
                            )}

                            <div
                                className={`whitespace-pre-line px-4 py-3 text-sm leading-relaxed text-white max-w-[75%] shadow-sm ${
                                    isSenderMe
                                        ? "bg-[#4C6ED7] rounded-2xl rounded-br-none" // Konselor (Me)
                                        : "bg-[#175694] rounded-2xl rounded-bl-none" // Customer (Other)
                                } ${msg.isOptimistic ? "opacity-70" : ""}`}
                            >
                                {msg.message}
                            </div>

                            {isSenderMe && (
                                <img
                                    src={counselorAvatar}
                                    alt={authUser.name}
                                    className="w-8 h-8 rounded-full ml-2 object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = fallbackCounselor;
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />

                {/* Pesan penutup jika sesi selesai (Sudah benar) */}
                {isChatEnded && (
                    <div className="flex flex-col items-center text-center mt-8 animate-fadeIn">
                        {/* (Style dari file Anda sebelumnya) */}
                        <div className="border border-[#00A9E0] rounded-lg bg-white p-3 text-xs text-gray-600 leading-relaxed w-full">
                            <p>
                                Sesi chat ini telah berakhir (Status:{" "}
                                {bookingInfo.status_pesanan}).
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {/* Input area (Logika disabled sudah benar) */}
            {!isChatEnded && (
                <form
                    onSubmit={sendMessage}
                    className="p-4 bg-gray-100 border-t sticky bottom-0 flex items-center space-x-3"
                >
                    <div className="flex-grow bg-white rounded-full flex items-center shadow-sm border border-gray-200">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Tulis pesan..."
                            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 px-5 py-3"
                            disabled={sending}
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-[#00A9E0] hover:bg-[#0091D5] text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors duration-300 flex-shrink-0 shadow-md active:scale-95 disabled:bg-gray-400"
                        disabled={sending || !input.trim()}
                    >
                        <SendIcon />
                    </button>
                </form>
            )}
        </MobileLayout>
    );
}
