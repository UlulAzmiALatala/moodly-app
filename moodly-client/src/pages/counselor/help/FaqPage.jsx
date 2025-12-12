import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Bot } from "lucide-react";

export default function CounselorFaqPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const messagesEndRef = useRef(null);

    const initialQuestion = location.state?.question;

    // --- DATABASE PENGETAHUAN BOT (KHUSUS KONSELOR) ---
    // Konten tetap menggunakan data Konselor, tapi tampilan mengikuti Customer
    const knowledgeBase = [
        {
            keywords: ["jadwal", "atur", "waktu", "availability", "praktik"],
            answer: "Untuk mengatur jadwal, buka menu 'Jadwal Saya' di dashboard. Anda bisa menambahkan atau menghapus slot waktu yang tersedia.",
        },
        {
            keywords: [
                "gaji",
                "cair",
                "bayar",
                "transfer",
                "pendapatan",
                "rekening",
            ],
            answer: "Gaji akan dicairkan oleh Admin setelah Anda menandai sesi sebagai 'Selesai'. Pastikan nomor rekening di profil Anda sudah benar.",
        },
        {
            keywords: ["tidak hadir", "absen", "telat", "pasien", "customer"],
            answer: "Jika pasien tidak hadir setelah 15 menit, Anda berhak membatalkan sesi. Hubungi Admin jika butuh bantuan verifikasi.",
        },
        {
            keywords: ["profil", "foto", "keahlian", "spesialisasi", "ubah"],
            answer: "Anda bisa mengubah foto profil, universitas, dan spesialisasi di menu 'Profil Saya' -> 'Edit Profil'.",
        },
        {
            keywords: ["batal", "cancel", "reschedule", "jadwal ulang"],
            answer: "Jika Anda perlu membatalkan atau menjadwal ulang sesi mendadak, harap informasikan kepada pasien melalui fitur chat dan ajukan Reschedule.",
        },
        {
            keywords: ["sanksi", "hukuman", "blokir"],
            answer: "Pembatalan sepihak tanpa alasan jelas dapat mempengaruhi rating performa Anda dan visibilitas di pencarian pasien.",
        },
        {
            keywords: ["halo", "hi", "pagi", "siang", "malam", "admin"],
            answer: "Halo Dok/Kak! Saya asisten virtual Moodly. Ada yang bisa saya bantu terkait praktik Anda hari ini?",
        },
    ];

    const getBotResponse = (userInput) => {
        const lowerInput = userInput.toLowerCase();
        const found = knowledgeBase.find((item) =>
            item.keywords.some((keyword) => lowerInput.includes(keyword))
        );
        return found
            ? found.answer
            : "Maaf, saya belum mengerti konteks pertanyaan Anda. 🤔 Silakan gunakan kata kunci yang lebih spesifik atau hubungi Admin Support langsung.";
    };

    // 1. Inisialisasi State
    const [messages, setMessages] = useState(() => {
        if (initialQuestion) {
            return [{ id: 1, sender: "user", text: initialQuestion }];
        }
        return [
            {
                id: 1,
                sender: "bot",
                text: "Halo! Saya asisten virtual Moodly untuk Mitra. Ada yang ingin ditanyakan seputar praktik?",
            },
        ];
    });

    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // 2. Efek Bot Menjawab
    useEffect(() => {
        if (initialQuestion) {
            setIsTyping(true);
            const timer = setTimeout(() => {
                const answer = getBotResponse(initialQuestion);
                setMessages((prev) => {
                    if (
                        prev.some(
                            (m) => m.sender === "bot" && m.text === answer
                        )
                    )
                        return prev;
                    return [
                        ...prev,
                        { id: Date.now(), sender: "bot", text: answer },
                    ];
                });
                setIsTyping(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [initialQuestion]);

    // 3. Auto Scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // 4. Handle Kirim Pesan
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
                sender: "bot",
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
        <div className="flex justify-center min-h-screen bg-gray-50 font-sans">
            <div className="w-full max-w-md min-h-screen bg-white flex flex-col shadow-xl relative overflow-hidden">
                {/* HEADER - Diubah menyesuaikan style Customer (Gradient & Lucide Icon) */}
                <header className="relative h-24 flex-shrink-0 bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center px-4 shadow-md z-20">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full text-white hover:bg-white/20 transition-colors mr-3"
                    >
                        <ChevronLeft />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 backdrop-blur-sm">
                            <Bot size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-white text-base leading-tight">
                                Moodly Bot (Mitra)
                            </h1>
                            <p className="text-xs text-white/90 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                </header>

                {/* CHAT AREA */}
                <main className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-50 pb-20">
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
                                        ? "bg-cyan-500 text-white rounded-2xl rounded-tr-none" // Style bubble user disamakan
                                        : "bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-200"
                                }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {/* Indikator Typing */}
                    {isTyping && (
                        <div className="flex w-full justify-start">
                            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-200 flex items-center gap-1 shadow-sm">
                                <span
                                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0s" }}
                                ></span>
                                <span
                                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.2s" }}
                                ></span>
                                <span
                                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.4s" }}
                                ></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                {/* INPUT AREA - Diubah menyesuaikan style Customer */}
                <footer className="bg-white p-4 sticky bottom-0 border-t border-gray-100 z-30">
                    <div className="flex items-center gap-3 bg-gray-50 p-2 pr-2 pl-4 rounded-full border border-gray-200 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100 transition-all shadow-sm">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ketik pertanyaan seputar praktik..."
                            className="flex-grow bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                            disabled={isTyping}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputText.trim() || isTyping}
                            className="w-9 h-9 flex items-center justify-center bg-cyan-500 text-white rounded-full hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
