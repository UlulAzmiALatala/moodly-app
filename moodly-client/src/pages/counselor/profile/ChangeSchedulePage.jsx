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
        className="text-white"
    >
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
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

const ChevronUpIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
    >
        <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
);

const PlusIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-cyan-600"
    >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const CalendarCheckIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-2"
    >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
        <path d="M9 16l2 2 4-4"></path>
    </svg>
);
// --- Akhir Komponen Ikon ---

// --- PERBAIKAN LOGIKA PICKER ---
// Komponen Input Jam dengan tombol naik/turun
const TimePickerInput = ({ value, onChange, label, max }) => {
    const increment = () => {
        const num = parseInt(value, 10);
        // Logika modulo diubah biar bener (0-59 atau 0-23)
        const newValue = (num + 1) % (max + 1);
        onChange(newValue.toString().padStart(2, "0"));
    };

    const decrement = () => {
        const num = parseInt(value, 10);
        // Logika modulo diubah biar bener
        const newValue = (num - 1 + (max + 1)) % (max + 1);
        onChange(newValue.toString().padStart(2, "0"));
    };

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={increment}
                type="button" // Biar ga submit form
                className="bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 p-2 rounded-t-lg transition-colors"
            >
                <ChevronUpIcon />
            </button>
            <input
                type="text"
                value={value}
                readOnly // Biarkan readOnly agar input selalu valid
                className="w-16 text-center text-lg font-bold py-2 bg-gray-100 border-t-0 border-b-0 border-x-0 outline-none text-gray-800"
            />
            <button
                onClick={decrement}
                type="button" // Biar ga submit form
                className="bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 p-2 rounded-b-lg transition-colors"
            >
                <ChevronUpIcon className="rotate-180" />{" "}
                {/* Rotasi ikon untuk ke bawah */}
            </button>
        </div>
    );
};
// --- AKHIR PERBAIKAN ---

// --- [BARU] Fungsi untuk mendapatkan tanggal hari ini format YYYY-MM-DD ---
const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // Bulan itu 0-indexed
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

export default function SchedulePage() {
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState(getTodayString()); // <-- STATE BARU

    const [hour, setHour] = useState("00");
    const [minute, setMinute] = useState("00");
    const [mediaKonseling, setMediaKonseling] = useState({
        videoCall: false,
        voiceCall: false,
        chat: false,
        tatapMuka: false,
    });

    const handleBack = () => {
        navigate(-1);
    };

    const handleMediaChange = (e) => {
        const { name, checked } = e.target;
        setMediaKonseling((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSaveSchedule = (e) => {
        e.preventDefault(); // Mencegah form submit default
        console.log("Jadwal Tersimpan:", {
            date: selectedDate,
            time: `${hour}:${minute}`,
            media: mediaKonseling,
        });
        // Di sini Anda bisa mengirim data ke API
        navigate(-1); // Kembali ke halaman sebelumnya
    };

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Header Halaman */}
            <header className="bg-cyan-500 p-4 pt-6 flex items-center sticky top-0 z-20 text-white rounded-b-3xl shadow-lg">
                <button
                    onClick={handleBack}
                    className="p-2 -ml-2 mr-2 rounded-full hover:bg-cyan-600/50 group transition-colors"
                    aria-label="Kembali"
                >
                    <BackArrowIcon />
                </button>
                <h1 className="text-xl font-bold text-center flex-grow -translate-x-4">
                    Atur Jadwal Praktik
                </h1>
                <div className="w-8"></div> {/* Spacer */}
            </header>

            {/* Konten Utama */}
            <form onSubmit={handleSaveSchedule}>
                <main className="p-6 space-y-6 pb-28">
                    {/* --- Pilihan Tanggal --- */}
                    <div>
                        <label
                            htmlFor="schedule-date"
                            className="block text-sm font-semibold text-gray-800 mb-2"
                        >
                            Pilih Tanggal
                        </label>
                        <input
                            type="date"
                            id="schedule-date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-700"
                            min={getTodayString()}
                        />
                    </div>

                    {/* Jam Mulai */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Jam Mulai
                        </label>
                        <div className="flex items-center gap-2">
                            {/* --- PERBAIKAN: Tambah max={23} --- */}
                            <TimePickerInput
                                value={hour}
                                onChange={setHour}
                                label="Jam"
                                max={23}
                            />
                            <span className="text-2xl font-bold text-gray-700">
                                :
                            </span>
                            {/* --- PERBAIKAN: Tambah max={59} --- */}
                            <TimePickerInput
                                value={minute}
                                onChange={setMinute}
                                label="Menit"
                                max={59}
                            />
                            <button
                                type="button" // Biar ga submit form
                                className="flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-full text-sm font-medium hover:bg-cyan-100 transition-colors shadow-sm ml-4"
                            >
                                <PlusIcon /> Tambah Jam
                            </button>
                        </div>
                    </div>

                    {/* Media Konseling */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                            Media Konseling yang Tersedia
                        </label>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="videoCall"
                                    name="videoCall"
                                    checked={mediaKonseling.videoCall}
                                    onChange={handleMediaChange}
                                    className="h-5 w-5 text-cyan-600 rounded focus:ring-cyan-500 border-gray-300"
                                />
                                <label
                                    htmlFor="videoCall"
                                    className="ml-3 text-sm text-gray-700"
                                >
                                    Vidio Call
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="voiceCall"
                                    name="voiceCall"
                                    checked={mediaKonseling.voiceCall}
                                    onChange={handleMediaChange}
                                    className="h-5 w-5 text-cyan-600 rounded focus:ring-cyan-500 border-gray-300"
                                />
                                <label
                                    htmlFor="voiceCall"
                                    className="ml-3 text-sm text-gray-700"
                                >
                                    Voice Call
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="chat"
                                    name="chat"
                                    checked={mediaKonseling.chat}
                                    onChange={handleMediaChange}
                                    className="h-5 w-5 text-cyan-600 rounded focus:ring-cyan-500 border-gray-300"
                                />
                                <label
                                    htmlFor="chat"
                                    className="ml-3 text-sm text-gray-700"
                                >
                                    Chat
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="tatapMuka"
                                    name="tatapMuka"
                                    checked={mediaKonseling.tatapMuka}
                                    onChange={handleMediaChange}
                                    className="h-5 w-5 text-cyan-600 rounded focus:ring-cyan-500 border-gray-300"
                                />
                                <label
                                    htmlFor="tatapMuka"
                                    className="ml-3 text-sm text-gray-700"
                                >
                                    Tatap Muka
                                </label>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Tombol Simpan Jadwal (Sticky Bawah) */}
                <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-gradient-to-t from-white via-white to-transparent z-10">
                    <button
                        type="submit" // Submit form
                        className="w-full bg-cyan-500 text-white text-lg font-bold py-3.5 px-4 rounded-full shadow-lg hover:bg-cyan-600 transition-colors active:scale-95 flex items-center justify-center"
                    >
                        <CalendarCheckIcon /> Simpan Jadwal
                    </button>
                </div>
            </form>
        </div>
    );
}
