import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import apiClient from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";

// --- TAMBAHAN BARU: Import Echo & Pusher ---
import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Beri tahu Pusher untuk menggunakan instance Pusher,
// meskipun kita terhubung ke Reverb (karena Reverb kompatibel)
window.Pusher = Pusher;

// --- Konfigurasi Echo ---
// Buat instance Echo yang terhubung ke server Reverb lokal Anda
// dan menggunakan apiClient (axios) kita untuk otorisasi
const echo = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY || "reverb_key", // Ganti 'reverb_key' jika Anda set di .env
    wsHost: import.meta.env.VITE_REVERB_HOST || "127.0.0.1",
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080, // Port default Reverb
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || "http") === "https",
    enabledTransports: ["ws", "wss"],
    // Gunakan apiClient kita untuk endpoint otorisasi
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
// --- AKHIR TAMBAHAN BARU ---

// Komponen MobileLayout
const MobileLayout = ({ children }) => (
    <div className="flex justify-center min-h-screen bg-white">
        <div className="w-full max-w-md min-h-screen bg-white flex flex-col border-x">
            {children}
        </div>
    </div>
);

// Ikon panah kembali (ChevronLeft)
const ChevronLeftIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
        />
    </svg>
);

// Ikon Kirim (Panah Kanan)
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

export default function ChatPage() {
    const navigate = useNavigate();
    const { id: bookingId } = useParams();
    const { user: authUser } = useAuth();

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
        if (!bookingId) {
            setError("Booking ID tidak ditemukan.");
            setLoading(false);
            return;
        }

        if (!authUser) {
            setLoading(true);
            return;
        }

        const channelName = `chat.${bookingId}`;

        // --- FUNGSI BARU: Untuk menambahkan pesan ke state ---
        const handleNewMessage = (event) => {
            // event.message berisi data dari NewChatMessage->broadcastWith()
            const newMessage = event.message;

            // Cek agar tidak menambahkan pesan duplikat (jika optimistic UI dipakai)
            setMessages((prevMessages) => {
                // Hanya tambahkan jika ID pesan ini belum ada di state
                if (!prevMessages.find((msg) => msg.id === newMessage.id)) {
                    return [...prevMessages, newMessage];
                }
                return prevMessages; // Kembalikan state lama jika duplikat
            });
        };

        // --- FUNGSI Fetch Awal (Tetap diperlukan) ---
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
                    // --- PERUBAHAN: Mulai mendengarkan HANYA JIKA chat belum berakhir ---
                    console.log(`Mendengarkan di channel: ${channelName}`);
                    echo.private(channelName).listen(
                        ".new-message",
                        handleNewMessage
                    );
                    // --- AKHIR PERUBAHAN ---
                }
                setError(null);
            } catch (err) {
                console.error("Gagal mengambil data chat:", err);
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

        // --- FUNGSI CLEANUP ---
        // Ini SANGAT PENTING untuk berhenti mendengarkan
        // saat pengguna meninggalkan halaman
        return () => {
            console.log(`Berhenti mendengarkan di channel: ${channelName}`);
            echo.leave(channelName);
        };
    }, [bookingId, authUser]); // Jalankan jika bookingId atau authUser berubah

    // 2. Auto-scroll ke pesan terbaru
    useEffect(() => {
        scrollToBottom();
    }, [messages]); // Jalankan setiap kali messages berubah

    // 3. Fungsi kirim pesan (dinamis)
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isChatEnded || sending) return;

        setSending(true);

        // Kita tidak lagi perlu Optimistic UI, karena server akan
        // mengirim kembali pesan kita via broadcast (jika tidak pakai toOthers())
        // ATAU kita bisa tetap pakai, dan biarkan `handleNewMessage` menangani duplikat.

        const sentInput = input.trim();
        setInput(""); // Langsung kosongkan

        try {
            // Cukup kirim pesan. Event di controller akan di-broadcast
            // dan fungsi `.listen()` kita akan menangkapnya.
            // (Kita matikan 'toOthers()' di controller agar kita juga menerima siaran)
            // ATAU
            // (Jika 'toOthers()' aktif): Kita harus tambahkan pesan ke state secara manual

            const response = await apiClient.post(
                `/api/booking/${bookingId}/chat/messages`,
                { message: sentInput }
            );

            // --- PERBAIKAN: Jika kita menggunakan toOthers() di controller ---
            // Kita (sebagai pengirim) harus menambahkan pesan kita sendiri secara manual
            // karena broadcast .toOthers() tidak akan mengirim balik ke kita.
            setMessages((prev) => [...prev, response.data]);
            // --- AKHIR PERBAIKAN ---
        } catch (err) {
            console.error("Gagal mengirim pesan:", err);
            setInput(sentInput); // Kembalikan teks jika gagal

            if (err.response && err.response.data.message) {
                alert(err.response.data.message);
                if (err.response.status === 403) {
                    setIsChatEnded(true);
                }
            } else {
                alert("Gagal mengirim pesan.");
            }
        } finally {
            setSending(false);
        }
    };

    // --- Tampilan Loading, Error, atau Data Kosong ---

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
                <div className="text-center p-10 text-red-600">
                    <p>Data booking tidak ditemukan.</p>
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

    const counselor = bookingInfo.konselor;
    const userAvatar =
        authUser.avatar ||
        `https://placehold.co/32x32/E2E8F0/4A5568?text=${authUser.name.charAt(
            0
        )}`;

    return (
        <MobileLayout>
            {/* Header Dinamis */}
            <header className="bg-[#00A9E0] text-white flex items-center justify-between p-4 shadow-md sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="text-white p-2 -ml-2"
                >
                    <ChevronLeftIcon />
                </button>
                <div className="flex items-center flex-grow justify-center mr-10">
                    <img
                        src={
                            counselor.avatar ||
                            `https://placehold.co/40x40/EBF8FF/3B82F6?text=${counselor.name.charAt(
                                0
                            )}`
                        }
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://placehold.co/40x40/EBF8FF/7F9CF5?text=P`;
                        }}
                        alt={counselor.name}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div>
                        <h2 className="font-semibold text-sm leading-tight">
                            {counselor.name}
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

            {/* Chat area Dinamis */}
            <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9FAFB]">
                {messages.map((msg, i) => {
                    const isSenderMe = msg.sender_id === authUser.id;
                    const senderAvatar = isSenderMe
                        ? userAvatar
                        : counselor.avatar ||
                          `https://placehold.co/32x32/EBF8FF/3B82F6?text=${counselor.name.charAt(
                              0
                          )}`;
                    const fallbackAvatar = isSenderMe
                        ? `https://placehold.co/32x32/E2E8F0/4A5568?text=U`
                        : `https://placehold.co/32x32/EBF8FF/7F9CF5?text=P`;

                    return (
                        <div
                            key={msg.id || i}
                            className={`flex ${
                                isSenderMe ? "justify-end" : "justify-start"
                            } items-end`}
                        >
                            {!isSenderMe && (
                                <img
                                    src={senderAvatar}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = fallbackAvatar;
                                    }}
                                    alt="Sender"
                                    className="w-8 h-8 rounded-full mr-2 object-cover"
                                />
                            )}

                            <div
                                className={`whitespace-pre-line px-4 py-3 text-sm leading-relaxed text-white max-w-[75%] shadow-sm ${
                                    isSenderMe
                                        ? "bg-[#4C6ED7] rounded-2xl rounded-br-none"
                                        : "bg-[#175694] rounded-2xl rounded-bl-none"
                                }`}
                            >
                                {msg.message}
                            </div>

                            {isSenderMe && (
                                <img
                                    src={senderAvatar}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = fallbackAvatar;
                                    }}
                                    alt="Me"
                                    className="w-8 h-8 rounded-full ml-2 object-cover"
                                />
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />

                {isChatEnded && (
                    <div className="flex flex-col items-center text-center mt-6">
                        {bookingInfo.status_pesanan === "Selesai" && (
                            <Link
                                to={`/history/rating/${bookingId}`}
                                className="bg-[#706E6E] text-white text-sm font-medium px-6 py-2 rounded-md shadow-sm hover:bg-[#5a59B9] transition mb-4"
                            >
                                Beri Penilaian
                            </Link>
                        )}

                        <div className="border border-[#00A9E0] rounded-lg bg-white p-3 text-xs text-gray-600 leading-relaxed w-full">
                            <p>
                                Sesi chat ini telah berakhir (Status:{" "}
                                {bookingInfo.status_pesanan}). Jika Anda
                                membutuhkan bantuan lebih lanjut, silakan
                                menjadwalkan sesi baru.
                            </p>
                        </div>
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
                            className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 px-5 py-3 text-sm"
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
