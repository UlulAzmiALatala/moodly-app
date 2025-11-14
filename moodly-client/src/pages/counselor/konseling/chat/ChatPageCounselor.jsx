import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import apiClient from "../../../../api/axios.js";
import { useAuth } from "../../../../context/AuthContext.jsx";

import Echo from "laravel-echo";
import Pusher from "pusher-js";
window.Pusher = Pusher;

// --- PERBAIKAN: Tambahkan 'client: apiClient' ---
const echo = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY || "reverb_key",
    wsHost: import.meta.env.VITE_REVERB_HOST || "127.0.0.1",
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || "http") === "https",
    enabledTransports: ["ws", "wss"],
    // client: apiClient, // <-- BARIS KUNCI ADA DI SINI
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
// --- AKHIR PERBAIKAN ---

// --- Komponen Layout & Ikon ---
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

export default function ChatPageCounselor() {
    const navigate = useNavigate();
    const { id: bookingId } = useParams(); // Ambil bookingId dari URL
    const { user: authUser } = useAuth(); // Ini adalah Konselor

    const [messages, setMessages] = useState([]);
    const [bookingInfo, setBookingInfo] = useState(null);
    const [input, setInput] = useState("");
    const [isChatEnded, setIsChatEnded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 1. Fetch data chat DAN Dengarkan Event Real-Time
    useEffect(() => {
        if (!bookingId || !authUser) {
            setLoading(true);
            return;
        }

        const channelName = `chat.${bookingId}`;

        // Fungsi ini sekarang menjadi SATU-SATUNYA sumber data baru
        const handleNewMessage = (event) => {
            const newMessage = event.message;
            setMessages((prevMessages) => {
                // Cek duplikat
                if (!prevMessages.find((msg) => msg.id === newMessage.id)) {
                    return [...prevMessages, newMessage];
                }
                return prevMessages;
            });
        };

        const fetchChatData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(
                    `/api/booking/${bookingId}/chat/messages`
                );

                setMessages(response.data.messages || []);
                setBookingInfo(response.data.booking || null);

                const endedStatus = ["Selesai", "Dibatalkan", "Tidak Hadir"];
                if (
                    endedStatus.includes(response.data.booking?.status_pesanan)
                ) {
                    setIsChatEnded(true);
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

        // --- Fungsi Cleanup ---
        return () => {
            console.log(`Konselor berhenti mendengarkan: ${channelName}`);
            echo.leave(channelName);
        };
    }, [bookingId, authUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 3. Fungsi kirim pesan (HANYA MENGIRIM)
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isChatEnded || sending) return;

        setSending(true);
        const sentInput = input.trim();
        setInput("");

        try {
            // Panggil API untuk menyimpan pesan
            // (Listener Echo (handleNewMessage) yang akan menangani update UI)
            await apiClient.post(`/api/booking/${bookingId}/chat/messages`, {
                message: sentInput,
            });
        } catch (err) {
            console.error("Gagal mengirim pesan (Konselor):", err);
            setInput(sentInput); // Kembalikan teks jika gagal
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

    // --- Tampilan Loading, Error ---
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

    // --- Tampilan Chat Dinamis ---
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
                        {!isChatEnded && (
                            <span className="text-xs text-white/80 flex items-center">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
                                Online
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9FAFB]">
                {messages.map((msg, i) => {
                    const isSenderMe = msg.sender_id === authUser.id;

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
                                        ? "bg-[#4C6ED7] rounded-2xl rounded-br-none"
                                        : "bg-[#175694] rounded-2xl rounded-bl-none"
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
                <div ref={messagesEndRef} /> {/* Untuk auto-scroll */}
                {/* Pesan penutup jika sesi selesai */}
                {isChatEnded && (
                    <div className="flex flex-col items-center text-center mt-8 animate-fadeIn">
                        <div className="bg-gradient-to-br from-[#FFD700] via-[#FFEA94] to-[#FFF8DC] border border-[#E6C200] rounded-2xl shadow-md p-5 text-gray-800 leading-relaxed w-full">
                            <p className="font-semibold text-[15px]">
                                ✨ Sesi percakapan telah berakhir.
                            </p>
                            <p className="mt-2 text-sm">
                                Status sesi ini: {bookingInfo.status_pesanan}
                            </p>
                        </div>
                        <Link
                            to={`/counselor/schedule/${bookingId}`}
                            className="mt-4 w-full max-w-[85%] bg-gray-700 text-white font-semibold py-3 rounded-full shadow-md hover:bg-gray-800 transition"
                        >
                            Kembali ke Detail Sesi
                        </Link>
                    </div>
                )}
            </main>

            {/* Input area */}
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
