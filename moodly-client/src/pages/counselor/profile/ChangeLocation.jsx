import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios.js"; // Path 3x mundur
import { useAuth } from "../../../context/AuthContext.jsx"; // Path 3x mundur

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

// --- Komponen Kartu Lokasi (Dinamis) ---
const LocationCard = ({ location, isSelected, onSelect }) => (
    <div
        onClick={onSelect}
        className={`bg-white rounded-2xl shadow-md p-3 flex items-center gap-4 transition-all ${
            isSelected ? "ring-2 ring-cyan-500" : "ring-0"
        } cursor-pointer`}
    >
        {/* Gambar */}
        <img
            src={location.image_url} // <-- Gunakan accessor 'image_url' (jika ada) atau 'image'
            alt={location.nama_tempat}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://placehold.co/80x80/E0F2FE/0EA5E9?text=Gambar`;
            }}
        />
        {/* Info Teks */}
        <div className="flex-grow">
            <h3 className="text-base font-bold text-gray-800">
                {location.nama_tempat}
            </h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {location.alamat}
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

// --- Komponen Loading/Error ---
const LoadingComponent = () => (
    <div className="p-10 text-center text-gray-500">Memuat lokasi...</div>
);
const ErrorComponent = ({ message }) => (
    <div className="p-10 text-center text-red-600 bg-red-50 rounded-lg">
        {message}
    </div>
);

// --- Komponen Utama ---
export default function ChangeLocationPage() {
    // <-- Nama diubah
    const navigate = useNavigate();
    const { user } = useAuth(); // Perlu user untuk tahu siapa yg login

    const [allLocations, setAllLocations] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set()); // Gunakan Set untuk performa
    const [searchQuery, setSearchQuery] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Fetch data saat halaman dimuat
    useEffect(() => {
        if (!user) return; // Tunggu sampai user ada

        const fetchLocations = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await apiClient.get(
                    "/api/counselor/profile/practice-locations"
                );
                setAllLocations(response.data.all_locations);
                // Inisialisasi Set dengan ID yang sudah dipilih
                setSelectedIds(new Set(response.data.my_location_ids));
            } catch (err) {
                console.error("Gagal mengambil data lokasi:", err);
                setError("Gagal memuat data lokasi.");
            } finally {
                setLoading(false);
            }
        };
        fetchLocations();
    }, [user]);

    const handleBack = () => {
        navigate(-1); // Kembali ke halaman profile
    };

    // 2. Handle klik pada kartu (pilih/batal pilih)
    const handleSelect = (locationId) => {
        // Buat salinan Set
        const newSelectedIds = new Set(selectedIds);
        if (newSelectedIds.has(locationId)) {
            newSelectedIds.delete(locationId); // Batal pilih
        } else {
            newSelectedIds.add(locationId); // Pilih
        }
        setSelectedIds(newSelectedIds);
    };

    // 3. Handle simpan
    const handleSave = async () => {
        setIsSubmitting(true);
        setError(null);

        // Ubah Set kembali menjadi array untuk dikirim ke API
        const dataToSubmit = {
            location_ids: Array.from(selectedIds),
        };

        try {
            // Panggil API update
            await apiClient.post(
                "/api/counselor/profile/practice-locations",
                dataToSubmit
            );

            // Kembali ke halaman profil setelah sukses
            navigate("/counselor/profile/edit");
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setError("Data yang dikirim tidak valid.");
            } else {
                setError("Gagal menyimpan perubahan.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Logika untuk memfilter rekening berdasarkan pencarian
    const filteredAccounts = useMemo(() => {
        const query = searchQuery.toLowerCase();
        if (!query) {
            return allLocations;
        }
        return allLocations.filter(
            (loc) =>
                loc.nama_tempat.toLowerCase().includes(query) ||
                loc.alamat.toLowerCase().includes(query)
        );
    }, [searchQuery, allLocations]);

    // --- Render Konten ---
    const renderContent = () => {
        if (loading) {
            return <LoadingComponent />;
        }
        if (error) {
            return <ErrorComponent message={error} />;
        }
        if (filteredAccounts.length === 0) {
            return (
                <p className="p-4 text-center text-gray-500 text-sm">
                    {searchQuery
                        ? "Lokasi tidak ditemukan."
                        : "Tidak ada lokasi praktik tersedia."}
                </p>
            );
        }
        return filteredAccounts.map((loc) => (
            <LocationCard
                key={loc.id}
                location={loc}
                isSelected={selectedIds.has(loc.id)}
                onSelect={() => handleSelect(loc.id)}
            />
        ));
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
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
                    Atur Tempat Praktik
                </h1>
                <div className="w-8"></div> {/* Spacer */}
            </header>

            {/* Konten Utama */}
            <main className="p-4 space-y-4 pb-28">
                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Cari nama atau alamat..."
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
                    Pilih Tempat Praktik Anda
                </h2>

                {/* List Rekening (Dinamis) */}
                <div className="space-y-4">{renderContent()}</div>
            </main>

            {/* Tombol Simpan (Sticky Bawah) */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent z-10">
                <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="w-full bg-cyan-500 text-white text-lg font-bold py-3.5 px-4 rounded-full shadow-lg hover:bg-cyan-600 transition-colors active:scale-95 disabled:bg-gray-400"
                >
                    {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
            </div>
        </div>
    );
}
