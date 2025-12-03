import React, { useState, useEffect } from "react";
// --- 1. IMPOR SEMUA HOOK YANG DIPERLUKAN ---
import { useNavigate, useParams, Link } from "react-router-dom";
import apiClient from "../../../api/axios"; // Sesuaikan path

// --- Komponen Layout (Tidak Berubah) ---
const MobileLayout = ({ children }) => {
    return (
        <div className="flex justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md bg-white flex flex-col border-x">
                {children}
            </div>
        </div>
    );
};

// --- Ikon (Tidak Berubah) ---
const ChevronLeftIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
        />
    </svg>
);
const StarIcon = ({ filled }) => (
    <svg
        className={`w-8 h-8 transition-colors duration-200 ${
            filled ? "text-[#FFC700]" : "text-gray-300"
        }`}
        fill={filled ? "currentColor" : "none"} // <-- Perbaikan kecil untuk bintang terisi
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.95-.69l1.519-4.674z"
        />
    </svg>
);
// --- Akhir Ikon ---

export default function RatingPage() {
    // --- 2. TAMBAHKAN HOOK & STATE DINAMIS ---
    const { id: bookingId } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null); // Data booking
    const [loading, setLoading] = useState(true); // Loading data
    const [error, setError] = useState(null);

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false); // true jika sudah pernah submit
    // --- AKHIR STATE ---

    // --- 3. FETCH DATA BOOKING ---
    useEffect(() => {
        apiClient
            .get(`/api/history/${bookingId}`)
            .then((response) => {
                const bookingData = response.data;
                setBooking(bookingData);

                // Cek apakah sudah pernah di-rating
                if (bookingData.rating) {
                    setRating(bookingData.rating);
                    setReview(bookingData.ulasan_customer || "");
                    setSubmitted(true); // Kunci form jika sudah ada rating
                }
            })
            .catch((err) => {
                console.error("Gagal fetch booking data:", err);
                setError("Gagal memuat data sesi.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [bookingId]);
    // --- AKHIR FETCH ---

    const handleRatingChange = (newRating) => {
        if (submitted) return;
        setRating(newRating);
    };

    // --- 4. HUBUNGKAN SUBMIT KE API ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null); // Bersihkan error lama

        if (rating === 0) {
            setError("Harap berikan minimal 1 bintang.");
            return;
        }
        if (!review.trim()) {
            setError("Harap isi ulasan Anda.");
            return;
        }

        setIsSubmitting(true);

        try {
            await apiClient.post(`/api/history/${bookingId}/rate`, {
                rating: rating,
                review: review,
            });

            setSubmitted(true); // Kunci form
            setIsSubmitting(false);
            alert("Terima kasih atas ulasan Anda!");
            navigate("/history"); // Arahkan kembali ke riwayat
        } catch (err) {
            console.error("Gagal submit rating:", err);
            const apiError =
                err.response?.data?.message || "Gagal mengirim ulasan.";
            setError(apiError);
            setIsSubmitting(false);
        }
    };
    // --- AKHIR SUBMIT ---

    // --- Tampilan Loading / Error ---
    if (loading) {
        return (
            <MobileLayout>
                <div className="flex-1 flex items-center justify-center">
                    <p>Memuat data sesi...</p>
                </div>
            </MobileLayout>
        );
    }

    // (Render error jika tidak termasuk 'submitted' error)
    if (error && !isSubmitting && !submitted) {
        return (
            <MobileLayout>
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 text-blue-600"
                    >
                        Kembali
                    </button>
                </div>
            </MobileLayout>
        );
    }
    // --- Akhir Tampilan Loading ---

    // --- 5. SIAPKAN DATA DINAMIS UNTUK RENDER ---
    const konselor = booking?.konselor || {};
    const specialization =
        booking?.jenis_konseling?.jenis_konseling || "Konseling";
    const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        konselor.name || "K"
    )}&background=EBF4FF&color=3B82F6&bold=true&size=96`;

    return (
        <MobileLayout>
            <div className="w-full bg-[#00B2FF] flex flex-col flex-1">
                {/* Header */}
                <header className="pt-12 pb-8 px-4 flex items-center justify-between relative z-10">
                    <button
                        onClick={() => navigate(-1)} // <-- Arahkan kembali
                        className="text-white p-2"
                    >
                        <ChevronLeftIcon />
                    </button>
                    <h1 className="text-white text-xl font-bold">
                        Beri Penilaian
                    </h1>
                    <div className="w-10"></div>
                </header>

                {/* Konten Utama (Dinamis) */}
                <main className="flex-grow pt-8 p-6 bg-white rounded-t-[2.5rem] flex flex-col items-center">
                    <img
                        src={konselor.avatar_url || avatarFallback} // <-- Dinamis
                        alt={konselor.name}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = avatarFallback;
                        }}
                        className="w-24 h-24 rounded-full object-cover shadow-md"
                    />

                    <h2 className="text-xl font-bold text-gray-800 text-center mt-4">
                        {konselor.name || "Nama Konselor"} {/* <-- Dinamis */}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Spesialisasi: {specialization} {/* <-- Dinamis */}
                    </p>

                    <div className="flex justify-center my-6 space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => handleRatingChange(star)}
                                disabled={submitted}
                            >
                                <StarIcon filled={star <= rating} />
                            </button>
                        ))}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="w-full flex flex-col items-center mt-2 flex-grow"
                    >
                        <div
                            className={`w-full p-4 border-2 border-[#00B2FF] rounded-[1.75rem] h-36 flex items-start ${
                                submitted ? "bg-gray-100" : "bg-white"
                            }`}
                        >
                            {submitted ? (
                                // Tampilkan review jika sudah disubmit
                                <p className="text-gray-700 text-sm leading-relaxed italic">
                                    {review}
                                </p>
                            ) : (
                                <textarea
                                    className="w-full h-full bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none resize-none"
                                    placeholder="Bagikan ulasanmu disini...."
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                />
                            )}
                        </div>

                        {/* Tampilkan error submit di sini */}
                        {error && (isSubmitting || submitted) && (
                            <p className="text-red-500 text-sm mt-3">{error}</p>
                        )}

                        {/* Tampilkan pesan jika sudah disubmit */}
                        {submitted && !error && (
                            <p className="text-green-600 text-sm mt-3 font-semibold">
                                Anda sudah memberi ulasan untuk sesi ini.
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting || submitted} // <-- Kunci tombol jika sudah submit
                            className="mt-10 w-48 py-3 bg-[#00B2FF] text-white font-bold text-lg rounded-full shadow-[0_10px_20px_-5px_rgba(0,178,255,0.5)] hover:bg-[#009ee6] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting
                                ? "Mengirim..."
                                : submitted
                                ? "Terkirim"
                                : "Kirim"}
                        </button>
                    </form>
                </main>
            </div>
        </MobileLayout>
    );
}
