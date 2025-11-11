import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../../api/axios"; // Sesuaikan path

// --- Komponen Ikon (Tetap sama) ---
// Icon Panah Kiri (di header)
function ArrowLeftIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
            />
        </svg>
    );
}
// Icon Bintang (Rating)
function StarIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
        >
            {" "}
            {/* Sesuaikan ukuran jika perlu */}
            <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354l-4.597 2.622c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
            />
        </svg>
    );
}
// Icon Universitas
function UniversityIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
    );
}

// Komponen Kartu Psikolog (Sama seperti di FindCounselorPage)
const PsikologCard = ({ counselor, onClick }) => {
    // --- PERBAIKAN: Konversi ID (Angka) ke String ---
    // 1. Cek jika 'spesialisasi' adalah array
    const specs = Array.isArray(counselor.spesialisasi)
        ? // 2. Ubah tiap item (angka) menjadi string
          counselor.spesialisasi.map(String)
        : [];

    // 3. Ambil 2 item pertama
    const specializationTags = specs.slice(0, 2);
    // --- AKHIR PERBAIKAN ---

    // Tambahkan tag 'lainnya' jika > 2
    if (specs.length > 2) {
        specializationTags.push(`${specs.length - 2}+ lainnya`);
    }

    return (
        <button
            onClick={onClick}
            className="w-full bg-white p-3 rounded-2xl border-2 border-cyan-100 shadow-sm flex items-center gap-4 transition-transform duration-300 hover:scale-105 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-cyan-300"
        >
            <img
                src={counselor.avatar} // Sudah ada accessor di backend
                alt={counselor.name}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                onError={(e) => {
                    // Fallback jika avatar gagal load
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        counselor.name || "P"
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
                        {counselor.universitas || "Universitas tidak diketahui"}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    {specializationTags.length > 0 ? (
                        specializationTags.map((tag, index) => (
                            <span
                                key={index}
                                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                    // 'tag' sekarang sudah pasti string, .includes() aman
                                    index === specializationTags.length - 1 &&
                                    tag.includes("+")
                                        ? "bg-cyan-100 text-cyan-600"
                                        : "bg-blue-100 text-blue-600"
                                }`}
                            >
                                {tag}
                            </span>
                        ))
                    ) : (
                        <span className="text-xs text-gray-400">
                            Belum ada spesialisasi.
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
};

// --- Komponen Halaman ---
export default function LocationDetailPage() {
    // Ganti nama id menjadi tempatId agar lebih jelas
    const { id: tempatId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    // Ambil serviceId dan serviceName dari state navigasi sebelumnya
    const { serviceId, serviceName } = location.state || {};

    const [tempatDetail, setTempatDetail] = useState(null);
    const [counselors, setCounselors] = useState([]);
    const [loadingTempat, setLoadingTempat] = useState(true);
    const [loadingCounselor, setLoadingCounselor] = useState(true);
    const [error, setError] = useState(null);

    // --- Log untuk debugging ---
    console.log(
        "LocationDetailPage rendered. tempatId from useParams:",
        tempatId,
        "Type:",
        typeof tempatId,
        "Received State:",
        location.state
    );
    // -----------------------------

    // Fetch data detail tempat
    useEffect(() => {
        const fetchTempatDetail = async () => {
            console.log(
                "useEffect [tempatId] running. ID before fetch:",
                tempatId,
                "Type:",
                typeof tempatId
            );

            // Pengecekan ID yang lebih kuat
            if (
                !tempatId ||
                tempatId === "undefined" ||
                isNaN(Number(tempatId))
            ) {
                console.error("ID tempat tidak valid:", tempatId);
                setError("Gagal memuat detail tempat: ID tidak valid.");
                setLoadingTempat(false);
                return;
            }

            try {
                setLoadingTempat(true);
                const response = await apiClient.get(
                    `/api/booking/tempat-konseling/${tempatId}` // Gunakan tempatId
                );
                setTempatDetail(response.data);
                setError(null); // Reset error jika berhasil
            } catch (err) {
                console.error("Gagal mengambil detail tempat:", err);
                // Tampilkan error spesifik jika 404
                if (err.response && err.response.status === 404) {
                    setError("Tempat konseling tidak ditemukan.");
                } else {
                    setError("Gagal memuat detail tempat.");
                }
                setTempatDetail(null); // Set detail jadi null jika error
            } finally {
                setLoadingTempat(false);
            }
        };

        fetchTempatDetail();
    }, [tempatId]); // Dependensi pada tempatId

    // Fetch data konselor
    useEffect(() => {
        const fetchCounselors = async () => {
            // TODO: Idealnya, API /api/booking/counselors bisa menerima ?tempatId=...
            // Untuk sementara, ambil semua konselor aktif
            try {
                setLoadingCounselor(true);
                // --- PERBAIKAN SEMENTARA: Kirim serviceId agar filter topik tetap jalan ---
                // Nanti kita akan tambahkan tempatId di sini
                const response = await apiClient.get(
                    "/api/booking/counselors",
                    {
                        params: { serviceId: serviceId },
                    }
                );
                // --- AKHIR PERBAIKAN ---

                // Pastikan response.data adalah array
                setCounselors(
                    Array.isArray(response.data) ? response.data : []
                );
            } catch (err) {
                console.error("Gagal mengambil data konselor:", err);
                setCounselors([]); // Set array kosong jika gagal
            } finally {
                setLoadingCounselor(false);
            }
        };
        fetchCounselors();
        // --- PERBAIKAN: Tambahkan serviceId sebagai dependency ---
    }, [serviceId]);

    // --- PERUBAHAN: Handle klik pada kartu konselor ---
    const handleCounselorClick = (counselorId) => {
        // Navigasi ke halaman DETAIL PSIKOLOG (/booking/counselor/:id)
        console.log(
            "Navigating to counselor detail page with ID:",
            counselorId
        );
        navigate(`/booking/counselor/${counselorId}`, {
            state: {
                serviceId: serviceId,
                serviceName: serviceName,
                tempatId: tempatId, // Kirim ID tempat saat ini
                tempatName: tempatDetail?.nama_tempat, // Kirim nama tempat
                method: "Offline", // Tandai sebagai alur offline
            },
        });
    };
    // --- AKHIR PERUBAHAN ---

    // Tampilkan loading jika data tempat masih dimuat
    if (loadingTempat) {
        return <div className="p-4 text-center">Memuat detail tempat...</div>;
    }

    // Tampilkan error jika fetch tempat gagal
    if (error) {
        return (
            <div className="bg-pink-50 min-h-screen p-4">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-800 mb-4 inline-flex items-center gap-1" // Styling tombol kembali
                >
                    <ArrowLeftIcon className="w-5 h-5" stroke="currentColor" />{" "}
                    Kembali
                </button>
                <div className="text-center text-red-500">{error}</div>
            </div>
        );
    }

    // Tampilkan jika tempatDetail null (seharusnya tidak terjadi jika error sudah ditangani)
    if (!tempatDetail) {
        return (
            <div className="bg-gray-50 min-h-screen p-4">
                <button
                    onClick={() => navigate(-1)}
                    className="text-gray-800 mb-4 inline-flex items-center gap-1"
                >
                    <ArrowLeftIcon className="w-5 h-5" stroke="currentColor" />{" "}
                    Kembali
                </button>
                <div className="text-center text-gray-500">
                    Data tempat tidak ditemukan.
                </div>
            </div>
        );
    }

    // Format rating
    const ratingValue = tempatDetail.rating
        ? Number(tempatDetail.rating)
        : null;
    const ratingDisplay = ratingValue !== null ? ratingValue.toFixed(1) : "N/A";

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Gambar Header */}
            <div className="relative">
                <button
                    onClick={() => navigate(-1)} // Tombol kembali absolut
                    className="absolute top-4 left-4 z-10 p-2 bg-white bg-opacity-70 rounded-full text-gray-800 shadow-md hover:bg-opacity-90"
                >
                    <ArrowLeftIcon className="w-6 h-6" stroke="currentColor" />{" "}
                    {/* Pastikan stroke ada */}
                </button>
                <img
                    src={
                        tempatDetail.image ||
                        "https://placehold.co/400x200/E0F2FE/0EA5E9?text=Tempat"
                    }
                    alt={tempatDetail.nama_tempat}
                    className="w-full h-48 object-cover rounded-b-2xl shadow-md" // Tambah shadow
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                            "https://placehold.co/400x200/E0F2FE/0EA5E9?text=Tempat";
                    }}
                />
            </div>

            {/* Konten Detail */}
            <main className="p-4 -mt-8 relative z-20 pb-6">
                {" "}
                {/* Tambah pb-6 */}
                {/* Kartu Info Tempat */}
                <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
                    <h1 className="text-xl font-bold text-gray-800">
                        {tempatDetail.nama_tempat}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {tempatDetail.alamat}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon
                                key={i}
                                className={`w-5 h-5 ${
                                    ratingValue !== null &&
                                    i < Math.round(ratingValue)
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                }`}
                            />
                        ))}
                        <span className="font-bold text-gray-800 ml-1">
                            {ratingDisplay}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                            ({tempatDetail.review_count || 0}+ Reviews)
                        </span>
                    </div>
                </div>
                {/* Daftar Psikolog */}
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                    Daftar Psikolog yang tersedia
                </h2>
                {loadingCounselor && (
                    <div className="text-center text-gray-500 py-6">
                        {" "}
                        {/* Beri padding */}
                        Memuat konselor...
                    </div>
                )}
                {!loadingCounselor && (
                    <div className="space-y-3">
                        {counselors.length > 0 ? (
                            counselors.map((counselor) => (
                                <PsikologCard
                                    key={counselor.id}
                                    counselor={counselor}
                                    // Panggil handleCounselorClick saat diklik
                                    onClick={() =>
                                        handleCounselorClick(counselor.id)
                                    }
                                />
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-10">
                                Tidak ada konselor yang tersedia untuk layanan
                                ini di lokasi ini.
                            </p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
