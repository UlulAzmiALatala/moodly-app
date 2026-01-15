import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { ChevronLeft, Send, User } from "lucide-react";

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

const faqsList = [
    "Lupa kata sandi?",
    "Cara mulai sesi curhat?",
    "Langganan paket Pro?",
    "Durasi sesi berapa lama?",
    "Saya terlambat hadir?",
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

        const channelName = `help.user.${user.id}`;
        const channel = echo.private(channelName);

        channel.listen(".NewHelpMessage", (e) => {
            if (e.message.sender_id === user.id) return;
            setMessages((prev) => {
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
            setMessages((prev) =>
                prev.map((msg) => (msg.id === tempId ? response.data : msg))
            );
        } catch (error) {
            console.error("Gagal kirim pesan:", error);
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

    return (
        <div className="flex justify-center h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Inject CSS Khusus untuk Hide Scrollbar */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            <div className="w-full max-w-md h-full bg-white flex flex-col shadow-xl relative">
                {/* Header (Fixed) */}
                <header className="flex-shrink-0 bg-gradient-to-r from-cyan-500 to-blue-600 p-4 pt-6 flex items-center gap-3 shadow-md z-20">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 backdrop-blur-sm">
                            <User size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-white text-base leading-tight">
                                Admin Bantuan
                            </h1>
                            <div className="flex items-center gap-1.5">
                                <span
                                    className={`w-2 h-2 rounded-full ${
                                        loading
                                            ? "bg-yellow-400"
                                            : "bg-green-400"
                                    } animate-pulse`}
                                ></span>
                                <span className="text-xs text-white/90 font-medium">
                                    {loading ? "Menghubungkan..." : "Online"}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Chat Area Container */}
                <div className="flex-1 bg-gray-50 relative flex flex-col overflow-hidden">
                    {/* Background Pattern */}
                    <div
                        className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{
                            backgroundImage:
                                "radial-gradient(#cbd5e1 1px, transparent 1px)",
                            backgroundSize: "20px 20px",
                        }}
                    ></div>

                    {/* Chat Messages List - Added 'scrollbar-hide' class */}
                    <main className="flex-1 overflow-y-auto p-4 space-y-4 z-10 pb-4 scrollbar-hide">
                        {!loading && messages.length === 0 && (
                            <div className="flex justify-center mt-10">
                                <div className="bg-white px-6 py-4 rounded-2xl shadow-sm text-center border border-gray-100 max-w-[80%]">
                                    <p className="text-sm text-gray-600">
                                        Halo, Sobat Moodly! 👋 <br />
                                        Ada kendala teknis atau pertanyaan soal
                                        layanan? Admin siap membantu di sini.
                                    </p>
                                </div>
                            </div>
                        )}

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
                                        className={`max-w-[85%] px-5 py-3.5 text-sm leading-relaxed shadow-sm relative transition-all ${
                                            isMe
                                                ? "bg-cyan-500 text-white rounded-2xl rounded-tr-none"
                                                : "bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-200"
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
                </div>

                {/* Footer Input (Fixed) */}
                <footer className="flex-shrink-0 bg-white p-3 border-t border-gray-100 z-20">
                    {/* FAQ Shortcuts - Added 'scrollbar-hide' */}
                    <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-1 px-1">
                        {faqsList.map((faq, i) => (
                            <button
                                key={i}
                                onClick={() => sendMessage(faq)}
                                className="whitespace-nowrap px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-[11px] font-medium text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 transition-colors"
                            >
                                {faq}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-2 pr-2 pl-4 rounded-full border border-gray-200 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100 transition-all shadow-sm">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleInputKeyDown}
                            className="flex-grow bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 h-9"
                            placeholder="Tulis pesan bantuan..."
                        />
                        <button
                            onClick={handleSendClick}
                            disabled={!inputText.trim()}
                            className="w-9 h-9 flex items-center justify-center bg-cyan-500 text-white rounded-full hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex-shrink-0"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
