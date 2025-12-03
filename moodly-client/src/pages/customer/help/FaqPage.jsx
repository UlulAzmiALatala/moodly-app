import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// --- Komponen Ikon ---
function BackArrowIcon() {
    return (
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
}

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
// --- Akhir Komponen Ikon ---

export default function FaqPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const messagesEndRef = useRef(null);

    const initialQuestion = location.state?.question;

    // --- DATABASE PENGETAHUAN BOT ---
    const knowledgeBase = [
        {
            keywords: ["lupa", "sandi", "password", "reset", "login", "masuk"],
            answer: "Untuk masalah login atau lupa kata sandi, silakan kembali ke halaman Login lalu klik 'Lupa Kata Sandi'. Link reset akan dikirim ke emailmu.",
        },
        {
            keywords: ["mulai", "sesi", "curhat", "booking", "pesan", "jadwal"],
            answer: "Cara memulai sesi: Masuk ke Beranda > Pilih Psikolog > Klik 'Jadwal' > Pilih Waktu & Metode > Lakukan Pembayaran.",
        },
        {
            keywords: ["pro", "langganan", "premium", "paket", "harga"],
            answer: "Saat ini paket berlangganan Pro sedang kami siapkan dengan fitur eksklusif. Tunggu update selanjutnya ya!",
        },
        {
            keywords: ["durasi", "lama", "waktu", "jam"],
            answer: "Durasi standar satu sesi konseling adalah 60 menit. Kamu bisa menambah durasi saat melakukan pemesanan jika konselor tersedia.",
        },
        {
            keywords: ["telat", "terlambat", "lewat", "hangus"],
            answer: "Toleransi keterlambatan adalah 15 menit. Jika lewat dari itu tanpa kabar, sesi dianggap hangus. Harap hubungi Admin segera jika ada kendala darurat.",
        },
        {
            keywords: ["bayar", "pembayaran", "transfer", "qris", "gagal"],
            answer: "Pembayaran bisa dilakukan via Transfer Bank atau QRIS. Jika pembayaran gagal atau status tidak berubah, silakan kirim bukti transfer di menu Riwayat.",
        },
        {
            keywords: ["refund", "kembali", "uang", "batal"],
            answer: "Pengembalian dana (Refund) bisa diajukan jika sesi dibatalkan minimal 24 jam sebelum jadwal. Akan ada potongan biaya admin sebesar 10%.",
        },
        {
            keywords: [
                "halo",
                "hi",
                "hai",
                "hello",
                "selamat",
                "pagi",
                "siang",
                "malam",
            ],
            answer: "Halo! Saya Moodly Bot. Ada yang bisa saya bantu terkait layanan kami? Kamu bisa tanya soal cara booking, pembayaran, atau akun.",
        },
    ];

    const getBotResponse = (userInput) => {
        const lowerInput = userInput.toLowerCase();
        const found = knowledgeBase.find((item) =>
            item.keywords.some((keyword) => lowerInput.includes(keyword))
        );
        return found
            ? found.answer
            : "Maaf, saya kurang mengerti pertanyaan itu. 🤔 Bisa coba gunakan kata kunci lain? Atau gunakan tombol 'Hubungi Admin' di halaman sebelumnya untuk bantuan manusia.";
    };

    // 1. Inisialisasi State
    const [messages, setMessages] = useState(() => {
        if (initialQuestion) {
            // Pesan user muncul langsung
            return [{ id: 1, sender: "user", text: initialQuestion }];
        }
        return [
            {
                id: 1,
                sender: "admin",
                text: "Halo! Saya asisten virtual Moodly. Ada yang ingin ditanyakan?",
            },
        ];
    });

    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // 2. PERBAIKAN: Efek Bot Menjawab (Tanpa Ref Guard yang bermasalah)
    useEffect(() => {
        if (initialQuestion) {
            setIsTyping(true);

            const timer = setTimeout(() => {
                const answer = getBotResponse(initialQuestion);

                setMessages((prev) => {
                    // Cek agar tidak duplikat (jika Strict Mode menjalankan effect 2x)
                    if (prev.some((m) => m.id === 2 && m.sender === "admin")) {
                        return prev;
                    }
                    return [...prev, { id: 2, sender: "admin", text: answer }];
                });

                setIsTyping(false); // Matikan loading
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [initialQuestion]);

    // 3. Auto Scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // 4. Handle Kirim Pesan Baru
    const handleSend = () => {
        if (!inputText.trim()) return;

        const userText = inputText;
        setInputText("");

        const newUserMsg = { id: Date.now(), sender: "user", text: userText };
        setMessages((prev) => [...prev, newUserMsg]);

        setIsTyping(true);

        setTimeout(() => {
            const botAnswer = getBotResponse(userText);
            const newBotMsg = {
                id: Date.now() + 1,
                sender: "admin",
                text: botAnswer,
            };
            setMessages((prev) => [...prev, newBotMsg]);
            setIsTyping(false);
        }, 1000 + Math.random() * 500);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex justify-center min-h-screen bg-[#FFF9F8]">
            <div className="w-full max-w-md min-h-screen bg-[#00D1FF] flex flex-col relative">
                {/* HEADER */}
                <header className="w-full p-4 pt-8 sticky top-0 z-20 bg-[#00D1FF] flex-shrink-0 shadow-none">
                    <div className="flex items-center gap-4">
                        <button
                            className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                            onClick={() => navigate(-1)}
                        >
                            <BackArrowIcon />
                        </button>
                        <div className="flex items-center gap-3">
                            <img
                                src="/images/Admin_Moodly.png"
                                alt="Bot Avatar"
                                className="w-10 h-10 rounded-full object-cover bg-white border-2 border-white/20"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                        "https://ui-avatars.com/api/?name=Moodly+Bot&background=fff&color=00D1FF&bold=true";
                                }}
                            />
                            <div>
                                <h1 className="font-bold text-white text-base">
                                    Pusat Bantuan
                                </h1>
                                <p className="text-xs text-white/80 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    Bot Penjawab Otomatis
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* CHAT CONTAINER */}
                <div className="flex-grow flex flex-col bg-white pt-6 z-10 rounded-t-[2.5rem] overflow-hidden shadow-2xl mt-2">
                    <main className="flex-grow p-4 space-y-4 overflow-y-auto bg-white">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex w-full ${
                                    msg.sender === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[85%] px-5 py-3.5 text-sm leading-relaxed shadow-sm transition-all duration-300 animate-fadeIn ${
                                        msg.sender === "user"
                                            ? "bg-blue-50 text-gray-800 rounded-2xl rounded-tr-none border border-blue-100"
                                            : "bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none border border-gray-200"
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Indikator Typing */}
                        {isTyping && (
                            <div className="flex w-full justify-start">
                                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-200 flex items-center gap-1">
                                    <span
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "0s" }}
                                    ></span>
                                    <span
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.2s" }}
                                    ></span>
                                    <span
                                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.4s" }}
                                    ></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </main>

                    {/* Input Area */}
                    <footer className="bg-white p-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 bg-gray-50 p-2 pr-2 pl-4 rounded-full border border-gray-200 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100 transition-all shadow-sm">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ketik pertanyaan lain..."
                                className="flex-grow bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                                disabled={isTyping}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputText.trim() || isTyping}
                                className="w-10 h-10 flex items-center justify-center bg-[#00D1FF] text-white rounded-full hover:bg-[#00bde6] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                            >
                                <PlayIcon />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center mt-2">
                            Bot ini merespon berdasarkan kata kunci otomatis.
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
