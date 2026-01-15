import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Tambahkan useLocation, useNavigate
import apiClient from "../../../api/axios"; // Sesuaikan path

// --- Komponen Ikon ---
const BackArrowIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        // stroke="currentColor" // Warna stroke diambil dari className
        strokeWidth="2.5" // Tebalkan sedikit
        strokeLinecap="round"
        strokeLinejoin="round"
        // className="text-gray-700" // Warna diatur di parent
    >
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const UniversityIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-gray-400"
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
);
// --- Akhir Komponen Ikon ---

// --- Komponen Kartu Psikolog (Diperbarui untuk handle klik) ---
const PsikologCard = ({ counselor, onClick }) => {
    // Ambil maks 2 spesialisasi pertama, atau default jika tidak ada
    const specializationTags = Array.isArray(counselor.spesialisasi)
        ? counselor.spesialisasi.slice(0, 2)
        : ["Spesialisasi"]; // Fallback jika bukan array

    // Tambahkan tag 'lainnya' jika > 2
    if (
        Array.isArray(counselor.spesialisasi) &&
        counselor.spesialisasi.length > 2
    ) {
        specializationTags.push(
            `${counselor.spesialisasi.length - 2}+ lainnya`
        );
    }

    return (
        // Gunakan button agar lebih aksesibel
        <button
            onClick={onClick} // Tambahkan onClick handler
            className="w-full text-left bg-white p-3 rounded-2xl border-2 border-cyan-100 shadow-sm flex items-center gap-4 transition-transform duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-300"
        >
            <img
                src={counselor.avatar} // Dinamis dari accessor
                alt={counselor.name}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0" // Tambah flex-shrink-0
                onError={(e) => {
                    // Fallback jika avatar gagal load
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        counselor.name || "P" // Fallback jika nama null
                    )}&background=EBF4FF&color=3B82F6&bold=true`;
                }}
            />
            <div className="flex-grow">
                <h3 className="font-bold text-gray-800 text-base">
                    {counselor.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                    <UniversityIcon />
                    <p className="text-sm text-gray-500">
                        {counselor.universitas || "Universitas"}
                    </p>{" "}
                    {/* Default jika null */}
                </div>
                {/* Tampilkan spesialisasi sebagai tags */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    {specializationTags.map((tag, index) => (
                        <span
                            key={index}
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                // Tag terakhir ('X+ lainnya') dibuat beda warna
                                index === specializationTags.length - 1 &&
                                tag.includes("+")
                                    ? "bg-cyan-100 text-cyan-600"
                                    : "bg-blue-100 text-blue-600"
                            }`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </button>
    );
};

export default function FindCounselorPage() {
    // Rename komponen
    const location = useLocation();
    const navigate = useNavigate();
    // Ambil data dari state navigasi DENGAN fallback object kosong
    const { serviceId, serviceName, tempatId, tempatName, method } =
        location.state || {};

    const [counselors, setCounselors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch daftar konselor
    useEffect(() => {
        const fetchCounselors = async () => {
            try {
                setLoading(true);

                // --- PERBAIKAN: Aktifkan params ---
                const response = await apiClient.get(
                    `/api/booking/counselors`,
                    {
                        // serviceId diambil dari location.state
                        params: { serviceId },
                    }
                );
                // --- AKHIR PERBAIKAN ---

                // Pastikan response.data adalah array
                setCounselors(
                    Array.isArray(response.data) ? response.data : []
                );
                setError(null);
            } catch (err) {
                console.error("Gagal mengambil data konselor:", err);
                setError("Gagal memuat daftar konselor.");
            } finally {
                setLoading(false);
            }
        };

        fetchCounselors();
    }, [serviceId]); // <-- PERBAIKAN: Tambahkan serviceId sebagai dependency

    // --- PERUBAHAN: Handle saat kartu psikolog diklik ---
    const handleSelectCounselor = (counselorId, counselorName) => {
        // Arahkan ke halaman DETAIL psikolog, bawa state sebelumnya + counselorId
        console.log("Navigating to counselor detail with ID:", counselorId);
        navigate(`/booking/counselor/${counselorId}`, {
            // <-- Rute baru ke detail
            state: {
                serviceId,
                serviceName,
                tempatId, // Akan null jika online
                tempatName, // Nama tempat (jika ada)
                method, // 'Online' atau 'Offline'
                // counselorName tidak perlu dikirim lagi karena detail sudah punya nama
            },
        });
    };
    // --- AKHIR PERUBAHAN ---

    // Tentukan URL kembali berdasarkan method (dari state)
    const backUrl =
        method === "Offline" ? `/booking/tempat/${tempatId}` : "/booking"; // Kembali ke detail tempat jika offline

    return (
        // Gunakan bg-sky-50 (lebih terang dari cyan-50)
        <div className="bg-sky-50 min-h-screen">
            {" "}
            {/* min-h-screen */}
            {/* Header Halaman */}
            <header className="bg-cyan-400 p-4 pt-6 flex items-center sticky top-0 z-10 text-white rounded-b-2xl shadow-lg">
                {/* Tombol kembali sekarang menggunakan Link */}
                <Link
                    to={backUrl}
                    state={location.state} // Kirim state kembali jika user menekan back
                    className="p-2 -ml-2 text-white"
                >
                    <BackArrowIcon stroke="currentColor" />{" "}
                </Link>
                <h1 className="text-lg font-bold text-center flex-grow -ml-4">
                    Pilih Psikolog {serviceName ? `(${serviceName})` : ""}{" "}
                    {/* Tampilkan nama layanan */}
                </h1>
                <div className="w-6"></div> {/* Spacer */}
            </header>
            {/* Konten Utama */}
            <main className="p-4 space-y-3">
                {" "}
                {/* Kurangi space y */}
                {loading && (
                    <div className="text-center text-gray-500 py-10">
                        Memuat konselor...
                    </div>
                )}
                {error && (
                    <div className="text-center text-red-500 py-10">
                        {error}
                    </div>
                )}
                {!loading &&
                    !error &&
                    (counselors.length > 0 ? (
                        counselors.map((counselor) => (
                            <PsikologCard
                                key={counselor.id}
                                counselor={counselor}
                                // Panggil handleSelectCounselor saat diklik
                                onClick={() =>
                                    handleSelectCounselor(
                                        counselor.id,
                                        counselor.name
                                    )
                                }
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-10">
                            Tidak ada konselor yang tersedia untuk layanan ini.
                        </p>
                    ))}
            </main>
        </div>
    );
}
