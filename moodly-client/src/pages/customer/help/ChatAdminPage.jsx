import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";

import Echo from "laravel-echo";
import Pusher from "pusher-js";
window.Pusher = Pusher;

// --- Inisialisasi Echo ---
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
                    .then((response) => callback(null, response.data))
                    .catch((error) => callback(error));
            },
        };
    },
});

// --- Komponen UI ---
const MobileLayout = ({ children }) => (
    <div className="flex justify-center min-h-screen bg-[#FFF9F8]">
        <div className="w-full max-w-md min-h-screen bg-[#FFF9F8] flex flex-col relative">
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

const PlayIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 ml-1"
        fill="currentColor"
        viewBox="0 0 24 24"
    >
        <path d="M8 5v14l11-7z" />
    </svg>
);

const faqsList = [
    "Apa yang harus dilakukan jika lupa kata sandi?",
    "Bagaimana cara memulai sesi curhat?",
    "Bagaimana cara berlangganan pro?",
    "Berapa lama durasi sesi curhat?",
    "Apa yang terjadi jika saya terlambat?",
];

export default function ChatAdminPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);

    // Auto Scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 1. Fetch History & Listen Real-time
    useEffect(() => {
        if (!user) return;

        // Fetch Pesan Lama
        const fetchMessages = async () => {
            try {
                const response = await apiClient.get("/api/help/messages");
                setMessages(response.data);
            } catch (error) {
                console.error("Gagal load chat bantuan:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();

        // Setup Real-time Listener
        const channelName = `help.user.${user.id}`;
        console.log(`HelpChat: Mendengarkan ${channelName}`);

        const channel = echo.private(channelName);

        channel.listen(".NewHelpMessage", (e) => {
            // LOGIKA PENTING:
            // Jika pesan berasal dari diri sendiri (user.id), abaikan.
            // Karena pesan kita sudah muncul duluan lewat Optimistic UI (handleSend).
            // Ini mencegah pesan muncul ganda (double bubble).
            if (e.message.sender_id === user.id) {
                return;
            }

            setMessages((prev) => {
                // Cek id ganda sebagai pengaman tambahan
                if (!prev.find((m) => m.id === e.message.id)) {
                    return [...prev, e.message];
                }
                return prev;
            });
        });

        return () => {
            echo.leave(channelName);
        };
    }, [user]);

    // 2. Fungsi Kirim Pesan
    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const tempId = Date.now();
        // Optimistic UI: Tampilkan pesan langsung seolah-olah sudah terkirim
        const newMessage = {
            id: tempId,
            user_id: user.id,
            sender_id: user.id,
            message: text,
            created_at: new Date().toISOString(),
            isOptimistic: true,
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputText("");

        try {
            const response = await apiClient.post("/api/help/messages", {
                message: text,
            });
            // Update pesan dengan data asli dari server (mengganti ID sementara)
            setMessages((prev) =>
                prev.map((msg) => (msg.id === tempId ? response.data : msg))
            );
        } catch (error) {
            console.error("Gagal kirim pesan:", error);
            // Hapus pesan jika gagal
            setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
            alert("Gagal mengirim pesan. Periksa koneksi Anda.");
        }
    };

    const handleSendClick = () => {
        sendMessage(inputText);
    };

    const handleInputKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendClick();
        }
    };

    const handleFAQClick = (question) => {
        sendMessage(question);
    };

    return (
        <MobileLayout>
            <div className="flex flex-col min-h-screen w-full bg-[#00D1FF] relative">
                {/* Header */}
                <header className="w-full p-4 pt-8 sticky top-0 z-20 bg-[#00D1FF]">
                    <div className="flex items-center gap-4">
                        <button
                            className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                            onClick={() => navigate(-1)}
                            aria-label="Kembali"
                        >
                            <BackArrowIcon />
                        </button>
                        <div className="flex items-center gap-3">
                            <img
                                src="/images/Admin_Moodly.png"
                                alt="Admin Avatar"
                                className="w-12 h-12 rounded-full object-cover bg-white border-2 border-white/20"
                                onError={(e) =>
                                    (e.target.src =
                                        "https://ui-avatars.com/api/?name=Admin&background=fff&color=00D1FF&bold=true")
                                }
                            />
                            <div>
                                <h1 className="font-semibold text-white text-base">
                                    Admin Bantuan
                                </h1>
                                <p className="text-xs text-white/90 flex items-center gap-1">
                                    <span
                                        className={`w-2 h-2 rounded-full ${
                                            loading
                                                ? "bg-yellow-400"
                                                : "bg-green-400"
                                        }`}
                                    ></span>
                                    {loading ? "Menghubungkan..." : "Online"}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Chat Container */}
                <div className="flex-1 flex flex-col bg-white pt-6 z-10 rounded-t-[2.5rem] overflow-hidden shadow-2xl mt-2">
                    <main className="flex-1 p-4 space-y-4 overflow-y-auto bg-white">
                        {/* Sambutan Default */}
                        {!loading && messages.length === 0 && (
                            <div className="flex justify-start animate-fadeIn">
                                <div className="max-w-xs px-5 py-3 rounded-2xl rounded-tl-none bg-gray-100 text-gray-800 border border-gray-200 shadow-sm">
                                    <p className="text-sm">
                                        Halo! Ada yang bisa saya bantu terkait
                                        aplikasi Moodly?
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Daftar Pesan */}
                        {messages.map((msg, i) => {
                            const isMe = msg.sender_id === user?.id;
                            return (
                                <div
                                    key={msg.id || i}
                                    className={`flex w-full ${
                                        isMe ? "justify-end" : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[85%] px-5 py-3.5 text-sm leading-relaxed shadow-sm transition-all ${
                                            isMe
                                                ? "bg-blue-50 text-gray-800 rounded-2xl rounded-tr-none border border-blue-100"
                                                : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none border border-gray-200"
                                        } ${
                                            msg.isOptimistic ? "opacity-70" : ""
                                        }`}
                                    >
                                        {msg.message}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </main>

                    {/* FAQ Shortcuts */}
                    <section className="px-4 pb-2">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {faqsList.map((faq, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleFAQClick(faq)}
                                    className="whitespace-nowrap px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                                >
                                    {faq}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Input Area */}
                    <footer className="bg-white p-4 sticky bottom-0 border-t border-gray-100">
                        <div className="flex items-center gap-3 bg-gray-50 p-2 pr-2 pl-4 rounded-full border border-gray-200 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100 transition-all shadow-sm">
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                                className="flex-grow bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 resize-none h-5 py-0.5"
                                rows={1}
                                placeholder="Ketik pesan bantuan..."
                            />
                            <button
                                onClick={handleSendClick}
                                disabled={!inputText.trim()}
                                className="w-10 h-10 flex items-center justify-center bg-[#00D1FF] text-white rounded-full hover:bg-[#00bde6] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex-shrink-0"
                                aria-label="Kirim Pesan"
                            >
                                <PlayIcon />
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </MobileLayout>
    );
}
