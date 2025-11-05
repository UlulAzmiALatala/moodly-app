import React, { useState, useEffect } from "react";
// --- TAMBAHAN BARU ---
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../../api/axios";
// --- AKHIR TAMBAHAN ---

const MobileLayout = ({ children }) => (
    <div className="flex justify-center min-h-screen bg-[#FFF9F8]">
        <div className="w-full max-w-md min-h-screen bg-[#FFF9F8] flex flex-col">
            {children}
        </div>
    </div>
);

const BackArrowIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
        />
    </svg>
);

// --- KOMPONEN BARU UNTUK LOADING DAN ERROR ---
const LoadingSpinner = () => (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 border-solid rounded-full animate-spin"></div>
    </div>
);

const ErrorMessage = ({ message, onClose }) => (
    <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm mb-4 relative">
        <p>{message}</p>
        <button
            onClick={onClose}
            className="absolute top-1 right-2 text-red-700 font-bold"
        >
            X
        </button>
    </div>
);
// --- AKHIR KOMPONEN BARU ---

export default function UploadBuktiPembayaranPage() {
    const navigate = useNavigate();
    // --- PERUBAHAN: Ambil ID booking dari URL ---
    const { bookingId } = useParams();
    // --- AKHIR PERUBAHAN ---

    const [kodePembayaran, setKodePembayaran] = useState("");
    const [gambar, setGambar] = useState(null);
    const [preview, setPreview] = useState(null);
    const [keterangan, setKeterangan] = useState("");

    // --- STATE BARU UNTUK API ---
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // --- AKHIR STATE BARU ---

    useEffect(() => {
        // --- PERUBAHAN: Gunakan bookingId asli, bukan Math.random ---
        if (bookingId) {
            setKodePembayaran(`PAY-${bookingId.toString().padStart(6, "0")}`);
        } else {
            console.error("Tidak ada ID Booking!");
            // Sebaiknya redirect jika tidak ada ID
            navigate("/history");
        }
        // --- AKHIR PERUBAHAN ---
    }, [bookingId, navigate]); // Dependensi ke bookingId

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validasi ukuran file (misal 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError("Ukuran gambar maksimal adalah 2MB.");
                setGambar(null);
                setPreview(null);
                e.target.value = null; // Reset input file
                return;
            }
            setGambar(file);
            setPreview(URL.createObjectURL(file));
            setError(null); // Hapus error jika valid
        } else {
            setPreview(null);
        }
    };

    // --- PERUBAHAN BESAR: handleSubmit terhubung ke API ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!gambar) {
            setError("Silakan upload bukti pembayaran terlebih dahulu!");
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("image", gambar);
        formData.append("keterangan", keterangan);

        try {
            // Panggil API yang sudah kita buat
            await apiClient.post(
                `/api/booking/${bookingId}/upload-proof`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            // Sukses!
            setLoading(false);
            // Ganti alert dengan pesan sukses yang lebih baik jika ada waktu
            alert(
                "Bukti pembayaran berhasil dikirim! Pesanan Anda sedang diverifikasi."
            );
            navigate("/history"); // Arahkan ke halaman riwayat
        } catch (err) {
            setLoading(false);
            console.error("Gagal upload bukti:", err);
            if (err.response && err.response.data && err.response.data.errors) {
                // Tampilkan error validasi dari Laravel
                const firstError = Object.values(
                    err.response.data.errors
                )[0][0];
                setError(firstError);
            } else if (
                err.response &&
                err.response.data &&
                err.response.data.message
            ) {
                // Tampilkan error custom dari controller (misal 403, 400)
                setError(err.response.data.message);
            } else {
                setError("Gagal mengirim bukti. Silakan coba lagi.");
            }
        }
    };
    // --- AKHIR PERUBAHAN BESAR ---

    return (
        <MobileLayout>
            {/* Tampilkan loading spinner di atas segalanya */}
            {loading && <LoadingSpinner />}

            <div className="flex flex-col h-full w-full bg-[#00D1FF] relative">
                {/* Header */}
                <header className="w-full p-4 pt-8 sticky top-0 z-20 bg-[#00D1FF]">
                    <div className="flex items-center gap-4">
                        <button
                            className="text-white"
                            onClick={() => navigate(-1)}
                            aria-label="Kembali"
                        >
                            <BackArrowIcon />
                        </button>
                        <h1 className="text-white font-semibold text-lg">
                            Upload Bukti Pembayaran
                        </h1>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-white rounded-t-[2.5rem] overflow-y-auto">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col justify-between flex-1 p-6 mt-8 space-y-7"
                    >
                        <div className="space-y-7">
                            {/* Tampilkan Error di sini */}
                            {error && (
                                <ErrorMessage
                                    message={error}
                                    onClose={() => setError(null)}
                                />
                            )}

                            {/* Kode Pembayaran */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Kode Booking
                                </label>
                                <input
                                    type="text"
                                    value={kodePembayaran}
                                    readOnly
                                    className="w-full px-4 py-3 border-2 border-black rounded-xl bg-gray-100 font-semibold"
                                />
                            </div>

                            {/* Upload Gambar */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Upload Bukti Pembayaran (Wajib, Max 2MB)
                                </label>
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-xl py-7 bg-gray-50">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-40 h-40 object-cover rounded-xl border border-gray-300"
                                        />
                                    ) : (
                                        <p className="text-gray-500 text-sm">
                                            Belum ada gambar
                                        </p>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleFileChange}
                                        className="mt-3 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Keterangan */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Keterangan
                                </label>
                                <textarea
                                    value={keterangan}
                                    onChange={(e) =>
                                        setKeterangan(e.target.value)
                                    }
                                    placeholder="Tulis keterangan tambahan (opsional)"
                                    className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none resize-none"
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Tombol Kirim */}
                        <div className="pt-8 pb-6">
                            <button
                                type="submit"
                                // Nonaktifkan tombol saat loading
                                disabled={loading}
                                className="w-full bg-[#00D1FF] text-white font-semibold py-3 rounded-xl border-2 border-black hover:bg-[#00bde6] transition disabled:bg-gray-400"
                            >
                                {/* Ubah teks saat loading */}
                                {loading
                                    ? "Mengirim..."
                                    : "Kirim Bukti Pembayaran"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </MobileLayout>
    );
}
