import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../../api/axios";
import { X, ChevronLeft, AlertTriangle } from "lucide-react";

export default function RefundAgreement() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    // Ambil data dari state halaman sebelumnya (CancelPage)
    // PERBAIKAN: Ambil 'reason' dan 'note' terpisah
    const reason = location.state?.reason || "Tidak ada alasan";
    const note = location.state?.note || "";

    const handleConfirmCancel = async () => {
        setLoading(true);
        try {
            // Panggil API Cancel dengan parameter yang BENAR
            // Controller mengharapkan 'alasan' dan 'catatan'
            await apiClient.patch(`/api/history/${id}/cancel`, {
                alasan: reason,
                catatan: note,
            });

            // Jika sukses, arahkan ke Refund Page untuk isi rekening
            navigate(`/history/refund/${id}`, { replace: true });
        } catch (error) {
            console.error("Gagal membatalkan:", error);

            // Tampilkan pesan error spesifik jika ada dari backend
            const errorMsg =
                error.response?.data?.message ||
                "Terjadi kesalahan saat memproses pembatalan.";
            const validationErrors = error.response?.data?.errors;

            if (validationErrors) {
                // Jika error validasi, tampilkan detailnya (misal: alasan terlalu panjang)
                const detail = Object.values(validationErrors)
                    .flat()
                    .join("\n");
                alert(`${errorMsg}\n${detail}`);
            } else {
                alert(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* Header */}
            <header className="bg-cyan-500 text-white p-4 shadow-md sticky top-0 z-10 flex items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="p-1 hover:bg-cyan-600 rounded-full transition"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="ml-3 text-lg font-bold">
                    Konfirmasi Pembatalan
                </h1>
            </header>

            <main className="flex-1 p-6 flex flex-col items-center">
                {/* Ikon Merah Besar */}
                <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center shadow-lg mb-6 mt-4 animate-bounce-slow">
                    <X size={48} className="text-white" strokeWidth={3} />
                </div>

                <h2 className="text-xl font-extrabold text-gray-800 mb-6 text-center uppercase tracking-wide">
                    Yakin Batalkan Sesi Ini?
                </h2>

                {/* List Syarat */}
                <div className="w-full space-y-4 text-sm text-gray-600 leading-relaxed mb-6">
                    <div className="flex gap-3">
                        <span className="font-bold text-gray-800">1.</span>
                        <p>
                            <span className="font-bold text-red-500">
                                Kebijakan Pengembalian Dana:
                            </span>{" "}
                            Pembatalan hanya akan mengembalikan{" "}
                            <span className="font-bold">80%</span> dari total
                            biaya yang telah Anda bayarkan (sesuai potongan
                            admin 20%).
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <span className="font-bold text-gray-800">2.</span>
                        <p>
                            <span className="font-bold text-red-500">
                                Dana Tidak Kembali Penuh:
                            </span>{" "}
                            Sisa 20% dianggap sebagai biaya administrasi dan
                            kompensasi waktu konselor.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <span className="font-bold text-gray-800">3.</span>
                        <p>
                            <span className="font-bold text-gray-800">
                                Langkah Selanjutnya:
                            </span>{" "}
                            Setelah konfirmasi, Anda akan diarahkan ke halaman
                            Refund untuk mengisi data rekening.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <span className="font-bold text-gray-800">4.</span>
                        <p>
                            <span className="font-bold text-gray-800">
                                Proses Manual:
                            </span>{" "}
                            Tim Admin akan memverifikasi data Anda dalam waktu
                            1x24 jam kerja.
                        </p>
                    </div>
                </div>

                {/* Highlight Box */}
                <div className="w-full bg-orange-50 border border-orange-200 rounded-xl p-4 text-center mb-8">
                    <p className="text-orange-800 font-bold text-sm flex items-center justify-center gap-2">
                        <AlertTriangle size={16} />
                        Pengembalian Dana Estimasi 80%
                    </p>
                </div>

                <p className="text-xs text-gray-400 text-center mb-4">
                    Proses pengembalian dana akan dimulai setelah Anda menekan
                    tombol di bawah.
                </p>

                {/* Tombol Aksi */}
                <div className="w-full space-y-3 mt-auto mb-6">
                    <button
                        onClick={handleConfirmCancel}
                        disabled={loading}
                        className="w-full py-3.5 bg-cyan-500 text-white font-bold rounded-xl shadow-md hover:bg-cyan-600 transition active:scale-95 disabled:bg-gray-300"
                    >
                        {loading
                            ? "Memproses..."
                            : "Ya, Batalkan & Lanjut Refund"}
                    </button>

                    <button
                        onClick={() => navigate(-1)}
                        disabled={loading}
                        className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl shadow-md hover:bg-black transition active:scale-95 disabled:bg-gray-300"
                    >
                        Tidak, Kembali
                    </button>
                </div>
            </main>
        </div>
    );
}
