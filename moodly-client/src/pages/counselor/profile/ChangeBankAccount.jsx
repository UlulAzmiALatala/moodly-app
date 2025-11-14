import React, { useState, useMemo } from "react";
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

const SearchIcon = () => (
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
        className="text-gray-400"
    >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

// Komponen placeholder logo bank
const BankLogo = ({ bankName }) => {
    const getLogoClass = () => {
        if (bankName.toLowerCase() === "bri") {
            return "bg-blue-600 text-white";
        }
        if (bankName.toLowerCase() === "bni") {
            return "bg-orange-500 text-white";
        }
        return "bg-gray-200 text-gray-700";
    };

    return (
        <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${getLogoClass()}`}
        >
            {bankName.substring(0, 3).toUpperCase()}
        </div>
    );
};
// --- Akhir Komponen Ikon ---

// --- Data Dummy (ganti dengan data dari API) ---
const dummyAccounts = [
    {
        id: 1,
        bankName: "BRI",
        accountHolder: "KIM SEOKJIN",
        accountNumber: "1122 3344 5566 778",
    },
    {
        id: 2,
        bankName: "BNI",
        accountHolder: "SDRI KIM SEOKJIN",
        accountNumber: "1122 3344 55",
    },
    // Tambahkan data lain jika perlu
];

// --- Komponen Kartu Rekening ---
const BankAccountCard = ({ account }) => (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-b-0">
        <BankLogo bankName={account.bankName} />
        <div className="flex-grow">
            <h3 className="text-sm font-semibold text-gray-900">
                {account.accountHolder}
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
                {account.bankName} . {account.accountNumber}
            </p>
        </div>
    </div>
);

// --- Komponen Utama ---
export default function BankAccountPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const handleBack = () => {
        navigate(-1); // Kembali ke halaman profile
    };

    // Logika untuk memfilter rekening berdasarkan pencarian
    const filteredAccounts = useMemo(() => {
        const query = searchQuery.toLowerCase();
        if (!query) {
            return dummyAccounts;
        }
        return dummyAccounts.filter(
            (acc) =>
                acc.accountHolder.toLowerCase().includes(query) ||
                acc.bankName.toLowerCase().includes(query) ||
                acc.accountNumber.includes(query)
        );
    }, [searchQuery]);

    return (
        <div className="bg-white-50 min-h-screen font-sans">
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
                    Daftar Rekening
                </h1>
                <div className="w-8"></div> {/* Spacer */}
            </header>

            {/* Konten Utama */}
            <main className="p-4 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Cari nama bank atau No. Rekening"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <SearchIcon />
                    </div>
                </div>

                {/* Judul Daftar Rekening */}
                <h2 className="text-base font-semibold text-gray-800 px-1 pt-2">
                    Daftar Rekening Anda
                </h2>

                {/* List Rekening */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    {filteredAccounts.length > 0 ? (
                        filteredAccounts.map((acc) => (
                            <BankAccountCard key={acc.id} account={acc} />
                        ))
                    ) : (
                        <p className="p-4 text-center text-gray-500 text-sm">
                            Rekening tidak ditemukan.
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}
