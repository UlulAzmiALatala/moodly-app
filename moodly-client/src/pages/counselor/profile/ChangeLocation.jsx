import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// --- Komponen Ikon ---
// --- PERBAIKAN: BackArrowIcon dikembalikan ---
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

// Ikon centang untuk checkbox
const CheckIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);
// --- Akhir Komponen Ikon ---

// --- Data Dummy (ganti dengan data dari API) ---
const dummyLocations = [
    {
        id: 1,
        name: "Rumah Moodly",
        address: "Jl. Magelang Km 4.5 No. 18, Mlati, Sleman, Yogyakarta 55284",
        image: "https://images.pexels.com/photos/2635038/pexels-photo-2635038.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
        id: 2,
        name: "Rumah Moodly",
        address:
            "Jl. Parangtritis No.17, Purbayan, Kotagede, Bantul, Yogyakarta 55171",
        image: "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
    {
        id: 3,
        name: "Rumah Moodly",
        address: "Jl. Rotowijayan No.56, Panembahan, Kraton, Yogyakarta 55131",
        image: "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
];

// --- Komponen Kartu Lokasi ---
const LocationCard = ({ location, isSelected, onSelect }) => (
    <div
        onClick={onSelect}
        className={`bg-white rounded-2xl shadow-md p-3 flex items-center gap-4 transition-all ${
            isSelected ? "ring-2 ring-cyan-500" : "ring-0"
        } cursor-pointer`}
    >
        {/* Gambar */}
        <img
            src={location.image}
            alt={location.name}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://placehold.co/80x80/E0F2FE/0EA5E9?text=Gambar`;
            }}
        />
        {/* Info Teks */}
        <div className="flex-grow">
            <h3 className="text-base font-bold text-gray-800">
                {location.name}
            </h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {location.address}
            </p>
        </div>
        {/* Checkbox Kustom */}
        <div
            className={`w-6 h-6 flex-shrink-0 rounded-md flex items-center justify-center transition-all ${
                isSelected
                    ? "bg-cyan-500 border-cyan-500"
                    : "bg-gray-200 border-gray-300"
            } border`}
        >
            {isSelected && <CheckIcon />}
        </div>
    </div>
);

// --- Komponen Utama ---
export default function PracticeLocationPage() {
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState(dummyLocations[2].id); // Default pilihan ketiga

    // --- PERBAIKAN: handleBack dikembalikan ---
    const handleBack = () => {
        navigate(-1); // Kembali ke halaman profile
    };

    const handleSave = () => {
        console.log("Tempat praktik tersimpan:", selectedId);
        // Tambahkan logika API untuk menyimpan
        navigate(-1); // Kembali setelah menyimpan
    };

    return (
        <div className="bg-white-50 min-h-screen font-sans">
            {/* --- PERBAIKAN: Header dikembalikan --- */}
            <header className="bg-cyan-500 p-4 pt-6 flex items-center sticky top-0 z-20 text-white rounded-b-3xl shadow-lg">
                <button
                    onClick={handleBack}
                    className="p-2 -ml-2 mr-2 rounded-full hover:bg-cyan-600/50 group transition-colors"
                    aria-label="Kembali"
                >
                    <BackArrowIcon />
                </button>
                <h1 className="text-xl font-bold text-center flex-grow -translate-x-4">
                    Atur Tempat Praktik
                </h1>
                <div className="w-8"></div> {/* Spacer */}
            </header>

            {/* Konten Utama */}
            {/* Beri padding bawah agar tidak tertutup tombol Simpan */}
            <main className="p-4 space-y-4 pb-28">
                {dummyLocations.map((loc) => (
                    <LocationCard
                        key={loc.id}
                        location={loc}
                        isSelected={selectedId === loc.id}
                        onSelect={() => setSelectedId(loc.id)}
                    />
                ))}
            </main>

            {/* Tombol Simpan (Sticky Bawah) */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-gradient-to-t from-pink-50 via-pink-50 to-transparent z-10">
                <button
                    onClick={handleSave}
                    className="w-full bg-cyan-500 text-white text-lg font-bold py-3.5 px-4 rounded-full shadow-lg hover:bg-cyan-600 transition-colors active:scale-95"
                >
                    {/* --- PERBAIKAN: Teks tombol diubah --- */}
                    Simpan Perubahan
                </button>
            </div>
        </div>
    );
}
