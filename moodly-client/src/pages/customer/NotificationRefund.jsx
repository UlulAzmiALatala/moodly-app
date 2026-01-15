import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import apiClient from "../../api/axios";
import {
    CheckCircle,
    XCircle,
    ArrowLeft,
    Banknote,
    Calendar,
    Building2,
    MessageCircle,
} from "lucide-react";

// --- Helper Format ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// --- Komponen Loading ---
const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">
            Memuat status refund...
        </p>
    </div>
);

export default function NotificationRefund() {
    const { id: bookingId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Kita ambil data booking yang menyertakan relasi refund
                const response = await apiClient.get(
                    `/api/history/${bookingId}`
                );

                if (!response.data.refund) {
                    setError("Data refund belum tersedia untuk booking ini.");
                } else {
                    setData(response.data);
                }
            } catch (err) {
                console.error("Error:", err);
                setError("Gagal memuat detail refund.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [bookingId]);

    if (loading) return <LoadingSpinner />;

    if (error || !data) {
        return (
            <div className="p-6 text-center h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="bg-red-100 p-4 rounded-full mb-4">
                    <XCircle className="w-12 h-12 text-red-500" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">
                    Terjadi Kesalahan
                </h3>
                <p className="text-gray-600 mt-2 mb-6">
                    {error || "Data tidak ditemukan"}
                </p>
                <Link
                    to="/history"
                    className="px-6 py-2 bg-gray-800 text-white rounded-full font-medium"
                >
                    Kembali ke Riwayat
                </Link>
            </div>
        );
    }

    const { refund } = data;
    const isSuccess = refund.status === "Selesai";
    const isRejected = refund.status === "Ditolak";

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header Sederhana */}
            <header className="bg-white p-4 shadow-sm flex items-center sticky top-0 z-10">
                <button
                    onClick={() => navigate("/history")}
                    className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="ml-2 text-lg font-bold text-gray-800">
                    Status Pengembalian Dana
                </h1>
            </header>

            <main className="flex-1 p-5 flex flex-col">
                {/* --- STATUS CARD UTAMA --- */}
                <div
                    className={`rounded-2xl p-6 mb-6 text-center shadow-sm border ${
                        isSuccess
                            ? "bg-green-50 border-green-200"
                            : isRejected
                            ? "bg-red-50 border-red-200"
                            : "bg-blue-50 border-blue-200"
                    }`}
                >
                    <div
                        className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                            isSuccess
                                ? "bg-green-100"
                                : isRejected
                                ? "bg-red-100"
                                : "bg-blue-100"
                        }`}
                    >
                        {isSuccess ? (
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        ) : isRejected ? (
                            <XCircle className="w-10 h-10 text-red-600" />
                        ) : (
                            <Banknote className="w-10 h-10 text-blue-600" />
                        )}
                    </div>

                    <h2
                        className={`text-xl font-bold mb-2 ${
                            isSuccess
                                ? "text-green-800"
                                : isRejected
                                ? "text-red-800"
                                : "text-blue-800"
                        }`}
                    >
                        {isSuccess
                            ? "Refund Berhasil!"
                            : isRejected
                            ? "Pengajuan Ditolak"
                            : "Sedang Diproses"}
                    </h2>

                    <p className="text-sm text-gray-600 leading-relaxed">
                        {isSuccess
                            ? "Dana telah berhasil kami transfer ke rekening tujuan Anda."
                            : isRejected
                            ? "Mohon maaf, pengajuan refund Anda belum dapat kami setujui."
                            : "Tim kami sedang memverifikasi data pengajuan Anda."}
                    </p>
                </div>

                {/* --- DETAIL INFORMASI --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-500">
                            ID Booking
                        </span>
                        <span className="font-mono text-sm font-bold text-gray-800">
                            #{data.id}
                        </span>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* Nominal */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Banknote className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">
                                    Total Refund
                                </p>
                                <p className="text-lg font-bold text-gray-900">
                                    {formatCurrency(refund.jumlah_refund)}
                                </p>
                            </div>
                        </div>

                        {/* Bank Tujuan */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">
                                    Rekening Tujuan
                                </p>
                                <p className="font-semibold text-gray-800">
                                    {refund.nama_bank}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {refund.nomor_rekening}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    a.n {refund.nama_pemilik_rekening}
                                </p>
                            </div>
                        </div>

                        {/* Tanggal Update */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">
                                    Waktu Pembaruan
                                </p>
                                <p className="text-sm font-medium text-gray-800">
                                    {formatDate(refund.updated_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ALASAN PENOLAKAN (Jika Ditolak) --- */}
                {isRejected && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                        <h4 className="text-sm font-bold text-red-800 mb-2">
                            Alasan Penolakan:
                        </h4>
                        {/* Menggunakan bukti_transfer_admin atau field lain jika Anda menyimpan alasan reject di sana, 
                            TAPI biasanya reject disimpan di catatan_pembatalan booking atau field khusus di refund.
                            Kita asumsikan admin belum input alasan spesifik di table refund, jadi kita pakai pesan default dulu 
                            atau Anda bisa minta backend kirim alasan reject */}
                        <p className="text-sm text-red-700">
                            Mohon hubungi admin untuk informasi lebih lanjut
                            mengenai penolakan ini.
                        </p>
                    </div>
                )}

                {/* --- TOMBOL AKSI --- */}
                <div className="mt-auto space-y-3">
                    {/* Jika Ditolak, arahkan ke Chat Admin (SOLUSI BARU) */}
                    {isRejected && (
                        <button
                            onClick={() => navigate(`/help/chat-admin`)}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-md hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Hubungi Admin Bantuan
                        </button>
                    )}

                    <Link
                        to="/history"
                        className="block w-full py-3 bg-gray-100 text-gray-700 text-center rounded-xl font-semibold hover:bg-gray-200 transition"
                    >
                        Kembali ke Riwayat
                    </Link>
                </div>
            </main>
        </div>
    );
}
