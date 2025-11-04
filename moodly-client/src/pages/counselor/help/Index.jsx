import React from "react";
import { useNavigate } from "react-router-dom";

// --- Komponen Ikon ---
function ArrowLeftIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
            />
        </svg>
    );
}
// --- Akhir Komponen Ikon ---

export default function HelpPage() {
    const navigate = useNavigate();

    const faqs = [
        "Apa yang harus dilakukan jika lupa kata sandi?",
        "Bagaimana cara memulai sesi curhat?",
        "Bagaimana cara berlangganan pro?",
        "Berapa lama durasi sesi curhat?",
        "Apa yang terjadi jika saya terlambat?",
    ];

    const handleSelectFAQ = (faqItem) => {
        navigate("/help/faq", { state: { question: faqItem } });
    };

    const handleContactNow = () => {
        navigate("/help/chat-admin");
    };

    return (
        <>
            {/* === HEADER (Disamakan dengan LoginPage) === */}
            <header className="relative h-80 flex-shrink-0">
                {/* Background biru melengkung */}
                <div className="absolute inset-x-0 top-[-32px] w-full h-full">
                    <svg
                        viewBox="0 0 375 240"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M0 0H375V150C375 150 281.25 240 187.5 240C93.75 240 0 150 0 150V0Z"
                            fill="#00A9E0"
                        />
                    </svg>
                </div>

                {/* Tombol kembali */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 z-20 p-2 rounded-full text-white hover:bg-white/20 transition-colors"
                    aria-label="Kembali"
                >
                    <ArrowLeftIcon />
                </button>

                {/* Gambar Ilustrasi Tengah */}
                <div className="relative z-10 flex justify-center items-start h-full pt-12">
                    <img
                        src="/images/3.png"
                        alt="Help Illustration"
                        className="w-44 h-auto object-contain"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "https://placehold.co/192x192/00A9E0/FFFFFF?text=Help";
                        }}
                    />
                </div>
            </header>

            {/* === MAIN CONTENT (Seperti body login tapi isi Help) === */}
            <main className="flex-grow flex flex-col justify-center p-8">
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                        Pusat Bantuan
                    </h1>
                    <p className="text-sm text-gray-500 text-center mb-6">
                        Bagaimana Kami Dapat Membantu Anda?
                    </p>

                    {/* Kotak FAQ */}
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 bg-white text-left shadow-sm">
                        <div className="flex items-center px-4 py-3 gap-2 bg-gray-50 rounded-t-lg">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-400">
                                <span className="text-xs font-semibold text-gray-600">
                                    ?
                                </span>
                            </div>
                            <span className="font-semibold text-gray-700 text-sm">
                                FAQ
                            </span>
                        </div>

                        {faqs.map((item, i) => (
                            <button
                                key={i}
                                onClick={() => handleSelectFAQ(item)}
                                className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex justify-between items-center group"
                            >
                                <span>{item}</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                        ))}
                    </div>

                    {/* Tombol Hubungi Sekarang */}
                    <button
                        onClick={handleContactNow}
                        className="w-full py-3 mt-6 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Hubungi Sekarang
                    </button>
                </div>
            </main>
        </>
    );
}
