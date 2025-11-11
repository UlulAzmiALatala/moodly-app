import React, { useState, useEffect } from "react";
// Impor useNavigate dan useLocation
import { useNavigate, useLocation } from "react-router-dom";
// Impor apiClient
import apiClient from "../../../api/axios";

// --- Komponen Ikon ---
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
const ArrowRightIcon = () => (
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
    >
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
);
// --- Akhir Komponen Ikon ---

// Fungsi helper untuk mendapatkan tab awal dari URL
const getInitialTab = (location) => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    // Perbaiki: Sesuaikan dengan nilai 'tipe_layanan' dari backend ('Offline')
    if (type === "Offline") return "Tatap Muka";
    return "Online"; // Default
};

export default function BookingPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // State untuk data
    const [activeTab, setActiveTab] = useState(() => getInitialTab(location));
    const [allServices, setAllServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Fetch data saat komponen mount
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                // Kita bisa gunakan ulang endpoint beranda-data
                const response = await apiClient.get("/api/beranda-data");
                setAllServices(response.data.services || []);
                setError(null);
            } catch (err) {
                console.error("Gagal mengambil data layanan:", err);
                setError("Gagal memuat data layanan.");
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []); // <-- PERBAIKAN: Pastikan ini adalah array kosong []

    // 2. Filter data saat tab atau search berubah
    useEffect(() => {
        // Tentukan tipe layanan berdasarkan tab aktif
        const serviceType = activeTab === "Tatap Muka" ? "Offline" : "Online";

        const filtered = allServices
            .filter((service) => service.tipe_layanan === serviceType) // Filter berdasarkan tab
            .filter((service) =>
                service.jenis_konseling // Filter berdasarkan search
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            );

        setFilteredServices(filtered);
    }, [allServices, activeTab, searchTerm]); // <-- PERBAIKAN: Pastikan ini HANYA berisi 3 item ini

    // --- FUNGSI HANDLE BOOK CLICK YANG DIPERBARUI ---
    const handleBookClick = (service) => {
        // Cek tipe layanan
        if (service.tipe_layanan === "Online") {
            // Jika Online, arahkan ke halaman pilih psikolog
            navigate("/booking/find-counselor", {
                state: {
                    serviceId: service.id,
                    serviceName: service.jenis_konseling,
                    method: "Online", // Tandai sebagai Online
                },
            });
        } else if (service.tipe_layanan === "Offline") {
            // Jika Offline, arahkan ke halaman pilih tempat (InPersonPage)
            navigate("/booking/in-person", {
                state: {
                    serviceId: service.id,
                    serviceName: service.jenis_konseling,
                    // Tidak perlu method di sini, karena halaman InPersonPage akan meneruskannya
                },
            });
        } else {
            console.warn("Tipe layanan tidak dikenal:", service.tipe_layanan);
            // Fallback atau tampilkan error jika perlu
        }
    };
    // ---------------------------------------------

    return (
        <>
            <header className="p-4 sticky top-0 z-10 bg-white">
                <h1 className="text-xl font-bold text-gray-800 text-center">
                    Jenis Konseling
                </h1>
                <div className="mt-4 flex justify-around border-b">
                    <button
                        onClick={() => setActiveTab("Online")}
                        className={`w-full py-3 text-sm font-semibold ${
                            activeTab === "Online"
                                ? "border-b-2 border-cyan-500 text-cyan-500"
                                : "text-gray-500"
                        }`}
                    >
                        Online
                    </button>
                    <button
                        onClick={() => setActiveTab("Tatap Muka")}
                        className={`w-full py-3 text-sm font-semibold ${
                            activeTab === "Tatap Muka"
                                ? "border-b-2 border-cyan-500 text-cyan-500"
                                : "text-gray-500"
                        }`}
                    >
                        Tatap Muka
                    </button>
                </div>
            </header>
            <main className="p-4">
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="Cari jenis konseling..." // Ganti placeholder
                        className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {" "}
                        {/* Disable pointer events */}
                        <SearchIcon />
                    </div>
                </div>

                {/* Tampilkan Loading atau Error */}
                {loading && (
                    <div className="text-center text-gray-500 py-5">
                        Memuat...
                    </div>
                )}
                {error && (
                    <div className="text-center text-red-500 py-5">{error}</div>
                )}

                {/* Tampilkan data dinamis */}
                {!loading && !error && (
                    <div className="grid grid-cols-2 gap-4">
                        {filteredServices.length > 0 ? (
                            filteredServices.map((service) => (
                                <div
                                    key={service.id}
                                    className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center text-center transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1"
                                >
                                    <img
                                        // Gunakan service.image (hasil dari accessor di backend)
                                        src={
                                            service.image ||
                                            "https://placehold.co/80x80/E0F2FE/0EA5E9?text=Icon"
                                        }
                                        alt={service.jenis_konseling}
                                        className="w-20 h-20 object-contain" // object-contain
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                                "https://placehold.co/80x80/E0F2FE/0EA5E9?text=Icon";
                                        }}
                                    />
                                    <p className="font-semibold text-gray-700 mt-3 text-sm">
                                        {service.jenis_konseling}
                                    </p>
                                    <button
                                        onClick={() => handleBookClick(service)} // Panggil fungsi dinamis
                                        className="mt-4 flex items-center gap-1 text-sm font-bold text-gray-500 bg-gray-100 px-4 py-1 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <span>Book</span>
                                        <ArrowRightIcon />
                                    </button>
                                </div>
                            ))
                        ) : (
                            // Tampilkan jika tidak ada hasil
                            <p className="col-span-2 text-center text-gray-500 py-5">
                                {searchTerm
                                    ? "Jenis konseling tidak ditemukan."
                                    : `Tidak ada layanan "${activeTab}" saat ini.`}{" "}
                                {/* Pesan lebih jelas */}
                            </p>
                        )}
                    </div>
                )}
            </main>
        </>
    );
}
