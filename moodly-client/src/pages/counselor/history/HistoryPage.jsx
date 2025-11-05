import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- 1. TAMBAHKAN IMPORT INI
// Import ikon-ikon HANYA UNTUK KONTEN (Calendar, Clock, Star)
import { Calendar, Clock, Star } from "lucide-react";

// --- Data Dummy ---
const dummyUpcomingData = [
    {
        id: 1,
        sesi: "1 Jam Sesi",
        name: "Indira Rahmania",
        img: "https://randomuser.me/api/portraits/women/68.jpg",
        date: "12 - 09 - 2025",
        time: "16.00 - 17.00",
        type: "Vidio Call",
    },
    {
        id: 2,
        sesi: "1 Jam Sesi",
        name: "Pelita Maharani",
        img: "https://randomuser.me/api/portraits/women/67.jpg",
        date: "12 - 09 - 2025",
        time: "17.00 - 18.00",
        type: "Chat",
    },
];
const dummyCancelledData = [
    {
        id: 1,
        sesi: "1 Jam Sesi",
        name: "Indira Rahmania",
        img: "https://randomuser.me/api/portraits/women/68.jpg",
        date: "12 - 09 - 2025",
        time: "16.00 - 17.00",
        type: "Chat",
        status: "Telah Dibatalkan Customer",
    },
];
const dummyCompletedData = [
    {
        id: 1,
        name: "Indira Rahmania",
        img: "https://randomuser.me/api/portraits/women/68.jpg",
        rating: 4.0,
        review: "Konselornya sabar dan membuat saya merasa didengar. Setelah sesi, hati saya jauh lebih tenang",
        date: "12 - 09 - 2025",
        time: "16.00 - 17.00",
        type: "Chat",
    },
];

// --- Komponen Internal ---

const StarIcon = ({ filled }) => (
    <Star
        size={16}
        className={` ${
            filled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
    />
);

const RatingStars = ({ rating }) => {
    return (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <StarIcon key={i} filled={i < Math.floor(rating)} />
            ))}
            <span className="text-sm font-semibold text-gray-700 ml-1">
                {rating.toFixed(1)}
            </span>
        </div>
    );
};

const TabNavigation = ({ activeTab, onTabClick }) => {
    const tabs = ["Akan Datang", "Dibatalkan", "Selesai"];

    return (
        <div className="flex bg-white p-1 rounded-full shadow-md">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => onTabClick(tab)}
                    className={`w-1/3 py-2 px-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                        activeTab === tab
                            ? "bg-sky-500 text-white shadow"
                            : "bg-white text-gray-500"
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};

// --- PERBAIKAN DI SINI ---
const UpcomingCard = ({ item }) => {
    const navigate = useNavigate(); // <-- 2. TAMBAHKAN HOOK NAVIGASI

    const handleGantiJadwal = () => {
        // --- 4. ARAHKAN KE HALAMAN EDIT SESUAI PERMINTAANMU ---
        navigate(`/counselor/history/Edit`);
    };

    const handleMulai = () => {
        // Arahkan ke chat page
        navigate(`/counselor/chat/${item.id}`);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
                <span className="text-xs text-gray-500 font-medium">
                    {item.sesi}
                </span>
                <img
                    src={item.img}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                />
            </div>
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-sky-700">{item.name}</h3>
                <span className="text-sm font-bold text-sky-500">
                    {item.type}
                </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-3">
                <span className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-gray-400" />
                    {item.date}
                </span>
                <span className="flex items-center gap-1.5">
                    <Clock size={16} className="text-gray-400" />
                    {item.time}
                </span>
            </div>
            <div className="flex items-center gap-3 pt-2">
                {/* --- 3. TAMBAHKAN onClick DI SINI --- */}
                <button
                    onClick={handleGantiJadwal}
                    className="flex-1 py-2 px-4 border border-sky-500 text-sky-500 rounded-full text-sm font-semibold transition-all hover:bg-sky-50"
                >
                    Ganti Jadwal
                </button>
                <button
                    onClick={handleMulai}
                    className="flex-1 py-2 px-4 bg-sky-500 text-white rounded-full text-sm font-semibold transition-all hover:bg-sky-600"
                >
                    Mulai
                </button>
            </div>
        </div>
    );
};
// --- AKHIR PERBAIKAN ---

const CancelledCard = ({ item }) => (
    <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3 opacity-90">
        <div className="flex justify-between items-start">
            <span className="text-xs text-gray-500 font-medium">
                {item.sesi}
            </span>
            <img
                src={item.img}
                alt={item.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
            />
        </div>
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-sky-700">{item.name}</h3>
            <span className="text-sm font-bold text-sky-500">{item.type}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-3">
            <span className="flex items-center gap-1.5">
                <Calendar size={16} className="text-gray-400" />
                {item.date}
            </span>
            <span className="flex items-center gap-1.5">
                <Clock size={16} className="text-gray-400" />
                {item.time}
            </span>
        </div>
        <div className="pt-2">
            <p className="text-red-600 font-semibold text-sm">{item.status}</p>
        </div>
    </div>
);

const CompletedCard = ({ item }) => (
    <div className="bg-white rounded-2xl shadow-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
            <img
                src={item.img}
                alt={item.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
            />
            <div className="flex-1">
                <h3 className="text-lg font-bold text-sky-700">{item.name}</h3>
                <RatingStars rating={item.rating} />
            </div>
        </div>
        <p className="text-sm text-gray-700 pt-2">{item.review}</p>
        <div className="flex flex-wrap justify-between items-center text-sm text-gray-600 border-t pt-3 gap-2">
            <span className="font-bold text-sky-500">{item.type}</span>
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-gray-400" />
                    {item.date}
                </span>
                <span className="flex items-center gap-1.5">
                    <Clock size={16} className="text-gray-400" />
                    {item.time}
                </span>
            </div>
        </div>
    </div>
);

// --- Komponen Utama Halaman Riwayat ---
export default function HistoryPage() {
    const [activeTab, setActiveTab] = useState("Akan Datang");

    const renderContent = () => {
        switch (activeTab) {
            case "Akan Datang":
                return dummyUpcomingData.map((item) => (
                    <UpcomingCard key={item.id} item={item} />
                ));
            case "Dibatalkan":
                return dummyCancelledData.map((item) => (
                    <CancelledCard key={item.id} item={item} />
                ));
            case "Selesai":
                return dummyCompletedData.map((item) => (
                    <CompletedCard key={item.id} item={item} />
                ));
            default:
                return null;
        }
    };

    return (
        // PERBAIKAN: bg-white-50 jadi bg-pink-50
        <div className="bg-pink-50 min-h-full p-4 pb-24">
            <TabNavigation activeTab={activeTab} onTabClick={setActiveTab} />

            <div className="mt-6 space-y-4">{renderContent()}</div>
        </div>
    );
}
