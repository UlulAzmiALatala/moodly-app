import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// --- Komponen Ikon ---
const BackArrowIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white" // Ikon di header biru
    >
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const CalendarIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-500"
    >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const ClockIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-500"
    >
        <circle cx="12" cy="12" r="8"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const ChevronDownIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-500"
    >
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);
// --- Akhir Komponen Ikon ---

// --- Data Dummy (ganti dengan data dari props/API) ---
const dummyCounselor = {
    name: "Vina Amalia, M.Psi., Psikolog",
    specialization: "Konseling anak",
    date: "12 - 09 - 2025",
    time: "16.00 - 17.00",
    type: "Vidio Call",
    avatar: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=600",
};

// --- Komponen Utama ---
export default function SchedulePage() {
    const navigate = useNavigate();
    const [reason, setReason] = useState("");
    const [notes, setNotes] = useState(
        "Saya mohon maaf karena harus mengganti sesi ini. Tiba-tiba ada urusan keluarga yang tidak bisa ditinggalkan."
    );

    const handleBack = () => {
        navigate(-1); // Kembali ke halaman history
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Alasan:", reason);
        console.log("Catatan:", notes);
        // Logika API untuk ganti jadwal
        navigate(-1); // Kembali setelah submit
    };

    return (
        // Latar belakang pink-muda
        <div className="bg-pink-50 min-h-screen font-sans">
            {/* Header Halaman (Biru Sesuai Desain) */}
            <header className="bg-cyan-500 p-4 pt-6 flex items-center sticky top-0 z-20 text-white rounded-b-3xl shadow-lg">
                <button
                    onClick={handleBack}
                    className="p-2 -ml-2 mr-2 rounded-full hover:bg-cyan-600/50 group transition-colors"
                    aria-label="Kembali"
                >
                    <BackArrowIcon />
                </button>
                <h1 className="text-xl font-bold text-center flex-grow -translate-x-4">
                    Ganti Jadwal Konseling
                </h1>
                <div className="w-8"></div> {/* Spacer */}
            </header>

            {/* Konten Utama */}
            <form onSubmit={handleSubmit}>
                <main className="p-4 space-y-5 pb-28 relative z-10 -mt-12">
                    {/* Kartu Info Konselor */}
                    <div className="bg-white rounded-2xl shadow-lg p-4">
                        <div className="flex items-center gap-4">
                            <img
                                src={dummyCounselor.avatar}
                                alt={dummyCounselor.name}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                            <div className="flex-grow">
                                <h2 className="text-base font-bold text-gray-900">
                                    {dummyCounselor.name}
                                </h2>
                                <p className="text-xs text-gray-600 mt-1">
                                    Spesialisasi :{" "}
                                    {dummyCounselor.specialization}
                                </p>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 my-3"></div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1.5 text-gray-700">
                                <CalendarIcon />
                                {dummyCounselor.date}
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-700">
                                <ClockIcon />
                                {dummyCounselor.time}
                            </span>
                            <span className="font-bold text-cyan-500">
                                {dummyCounselor.type}
                            </span>
                        </div>
                    </div>

                    {/* Pilih Alasan */}
                    <div className="relative">
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full pl-4 pr-10 py-3.5 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none text-sm font-medium text-gray-700"
                        >
                            <option value="" disabled>
                                Pilih Alasan Ganti Jadwal
                            </option>
                            <option value="Urusan Keluarga">
                                Urusan Keluarga
                            </option>
                            <option value="Sakit">Sakit</option>
                            <option value="Lainnya">Alasan Lainnya</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                            <ChevronDownIcon />
                        </div>
                    </div>

                    {/* Tanggal Baru (Disabled Sesuai Desain) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Tanggal Baru
                        </label>
                        <input
                            type="text"
                            disabled
                            placeholder="" // Desain tidak ada placeholder
                            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                        />
                    </div>

                    {/* Tanggal Baru (Disabled Sesuai Desain) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Tanggal Baru
                        </label>
                        <input
                            type="text"
                            disabled
                            placeholder="" // Desain tidak ada placeholder
                            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                        />
                    </div>

                    {/* Catatan */}
                    <div>
                        <label
                            htmlFor="notes"
                            className="block text-sm font-semibold text-gray-800 mb-2"
                        >
                            Catatan
                        </label>
                        <textarea
                            id="notes"
                            rows="5"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                            placeholder="Tuliskan catatan Anda di sini..."
                        ></textarea>
                    </div>
                </main>

                {/* Tombol Ganti Jadwal (Sticky Bawah) */}
                <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-gradient-to-t from-pink-50 via-pink-50 to-transparent z-10">
                    <button
                        type="submit"
                        className="w-full bg-cyan-500 text-white text-lg font-bold py-3.5 px-4 rounded-full shadow-lg hover:bg-cyan-600 transition-colors active:scale-95"
                    >
                        Ganti Jadwal
                    </button>
                </div>
            </form>
        </div>
    );
}
