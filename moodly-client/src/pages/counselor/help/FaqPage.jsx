import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useLocation

// --- Komponen Ikon Bantuan ---
// Icon Panah Kiri (SVG)
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
// Icon Kirim (Play)
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

// --- Komponen Utama ---
// Ganti nama komponen menjadi FaqPage
export default function FaqPage() {
    const navigate = useNavigate();
    const location = useLocation(); // Gunakan useLocation untuk state

    // Ambil pertanyaan dari state navigasi
    const faqQuestion = location.state?.question;

    // Daftar jawaban (tetap hardcoded untuk saat ini)
    const answers = {
        "Apa yang harus dilakukan jika lupa kata sandi?":
            "Jika kamu lupa kata sandi kamu bisa masuk ke profile lalu akan ada pilihan menu lupa kata sandi. Pilih menu tersebut dan kamu akan di arahkan untuk membuat kata sandi baru.",
        "Bagaimana cara memulai sesi curhat?":
            "Untuk memulai sesi curhat, kembali ke Beranda, pilih psikolog, dan jadwalkan sesi.",
        "Bagaimana cara berlangganan pro?":
            "Berlangganan pro dapat dilakukan di menu 'Profile' dengan memilih paket yang diinginkan.",
        "Berapa lama durasi sesi curhat?":
            "Durasi standar untuk sesi curhat adalah 60 menit.",
        "Apa yang terjadi jika saya terlambat?":
            "Jika terlambat lebih dari 15 menit, sesi akan dianggap hangus. Harap hubungi admin jika ada kendala.",
    };

    // Cari jawaban berdasarkan pertanyaan yang diterima
    const faqAnswer = faqQuestion
        ? answers[faqQuestion] ||
          "Maaf, jawaban untuk pertanyaan ini belum tersedia."
        : "Silakan ajukan pertanyaan Anda.";

    // State untuk pesan chat
    const [messages, setMessages] = useState(() => {
        // Inisialisasi chat dengan pertanyaan user dan jawaban admin
        if (faqQuestion) {
            return [
                { id: 1, sender: "user", text: faqQuestion },
                { id: 2, sender: "admin", text: faqAnswer },
            ];
        }
        // Jika tidak ada pertanyaan awal (misal akses langsung), tampilkan pesan default
        return [{ id: 1, sender: "admin", text: "Ada yang bisa dibantu?" }];
    });

    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef(null); // Ref untuk auto-scroll

    // Auto-scroll ke pesan terbaru
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Fungsi kirim pesan
    const handleSend = () => {
        const trimmedInput = inputText.trim();
        if (!trimmedInput) return;

        const newUserMessage = {
            id: Date.now(), // Gunakan timestamp sebagai ID sementara
            sender: "user",
            text: trimmedInput,
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInputText("");

        // TODO: Logika untuk mendapatkan jawaban dari admin/bot (jika diperlukan)
        // Contoh response dummy:
        // setTimeout(() => {
        //     const adminResponse = { id: Date.now() + 1, sender: 'admin', text: `Saya menerima pesan Anda: "${trimmedInput}". Saya akan segera merespon.`};
        //     setMessages(prev => [...prev, adminResponse]);
        // }, 1000);
    };

    // Kirim dengan Enter
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        // Hapus MobileLayout wrapper
        // --- Warna biru untuk latar belakang ---
        <div className="flex flex-col h-screen w-full bg-[#00D1FF]">
            {" "}
            {/* Gunakan h-screen */}
            {/* Header tetap di atas (sticky) */}
            <header className="w-full p-4 pt-8 sticky top-0 z-20 bg-[#00D1FF] flex-shrink-0">
                {" "}
                {/* Tambah flex-shrink-0 */}
                <div className="flex items-center gap-4">
                    <button className="text-white" onClick={() => navigate(-1)}>
                        <BackArrowIcon />
                    </button>
                    <img
                        src="/images/Admin_Moodly.png" // Pastikan path ini benar
                        alt="Admin Avatar"
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "https://ui-avatars.com/api/?name=Admin&background=fff&color=00D1FF&bold=true";
                        }} // Fallback
                    />
                    <div>
                        <h1 className="font-semibold text-white text-base">
                            Admin Moodly
                        </h1>
                        <p className="text-xs text-white/90">Online</p>
                    </div>
                </div>
            </header>
            {/* Kontainer putih untuk isi chat */}
            {/* Gunakan flex-grow dan overflow-y-auto di sini */}
            <div className="flex-grow flex flex-col bg-white pt-8 z-10 rounded-t-[2.5rem] overflow-hidden">
                {/* Chat area */}
                {/* Gunakan flex-grow dan overflow-y-auto di sini */}
                <main className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg) => (
                        <div
                            key={msg.id} // Gunakan ID unik
                            className={`flex ${
                                msg.sender === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-[80%] md:max-w-[70%] px-5 py-3 rounded-2xl shadow-sm ${
                                    // Tambah shadow
                                    msg.sender === "user"
                                        ? "rounded-tr-none bg-blue-50 text-gray-800 border border-blue-200" // Warna user
                                        : "rounded-tl-none bg-gray-100 text-gray-800 border border-gray-200" // Warna admin
                                }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-line">
                                    {msg.text}
                                </p>
                            </div>
                        </div>
                    ))}
                    {/* Elemen kosong untuk target auto-scroll */}
                    <div ref={messagesEndRef} />
                </main>

                {/* Input bawah */}
                {/* Gunakan flex-shrink-0 agar tidak ikut scroll */}
                <footer className="bg-white p-4 sticky bottom-0 border-t border-gray-200 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 w-full px-5 py-3 bg-gray-100 border border-gray-300 rounded-xl focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 resize-none text-sm"
                            rows={1}
                            placeholder="Ketik pesan..."
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputText.trim()}
                            className="bg-[#00D1FF] text-white w-12 h-12 flex items-center justify-center rounded-full border border-sky-300 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-500 transition-colors"
                            aria-label="Kirim Pesan"
                        >
                            <PlayIcon />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
        // Hapus </MobileLayout>
    );
}
