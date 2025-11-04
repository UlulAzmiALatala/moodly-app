import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const MobileLayout = ({ children }) => (
  <div className="flex justify-center min-h-screen bg-[#FFF9F8]">
    <div className="w-full max-w-md min-h-screen bg-[#FFF9F8] flex flex-col">
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
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
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

export default function FAQChatAdminPage() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    { sender: "admin", text: "Halo! Ada yang bisa saya bantu hari ini?" },
  ]);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);

    // Balasan otomatis jika FAQ dikenali
    if (answers[text]) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { sender: "admin", text: answers[text] },
        ]);
      }, 500);
    }
  };

  const handleSendClick = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText("");
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <MobileLayout>
      <div className="flex flex-col h-full w-full bg-[#00D1FF] relative">
        {/* Header — tetap di atas saat scroll */}
        <header className="w-full p-4 pt-8 sticky top-0 z-20 bg-[#00D1FF]">
          <div className="flex items-center gap-4">
            <button
              className="text-white"
              onClick={() => navigate(-1)}
              aria-label="Kembali"
            >
              <BackArrowIcon />
            </button>
            <img
              src="/images/Admin_Moodly.png"
              alt="Admin Avatar"
              className="w-12 h-12 rounded-full object-cover scale-[1.5]"
              style={{ borderRadius: "9999px" }}
            />
            <div>
              <h1 className="font-semibold text-white text-base">Admin Moodly</h1>
              <p className="text-xs text-white/90">Online</p>
            </div>
          </div>
        </header>

        {/* Chat area yang bisa di-scroll */}
        <div className="flex-1 flex flex-col bg-white pt-8 z-10 rounded-t-[2.5rem] overflow-y-auto">
          <main className="flex-1 p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-5 py-3 rounded-2xl ${
                    msg.sender === "user"
                      ? "rounded-tr-none bg-white text-gray-800 border-2 border-black"
                      : "rounded-tl-none bg-white text-gray-800 border-2 border-black"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </main>

          {/* FAQ bawah chat */}
          <section className="px-4 pb-4">
            <div className="border border-gray-300 rounded-lg divide-y divide-gray-300 bg-white text-left shadow-sm">
              <div className="flex items-center px-4 py-3 gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-400">
                  <span className="text-xs font-semibold text-gray-600">?</span>
                </div>
                <span className="font-semibold text-gray-700 text-sm">FAQ</span>
              </div>

              {faqsList.map((faq, i) => (
                <button
                  key={i}
                  className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  onClick={() => sendMessage(faq)}
                >
                  {faq}
                </button>
              ))}
            </div>
          </section>

          {/* Input tetap di bawah */}
          <footer className="bg-white p-4 sticky bottom-0">
            <div className="flex items-center space-x-3">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="flex-grow w-full px-5 py-3 bg-white border-2 border-black rounded-xl focus:outline-none resize-none"
                rows={1}
                placeholder="Ketik pesan..."
              />
              <button
                onClick={handleSendClick}
                disabled={!inputText.trim()}
                className="bg-[#00D1FF] text-white w-12 h-12 flex items-center justify-center rounded-full border-2 border-black flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
