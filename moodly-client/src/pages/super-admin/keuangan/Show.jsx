import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios";
import { useToast } from "../../../context/ToastContext";
import {
    ChevronLeft,
    Printer,
    Download,
    Share2,
    Calendar,
    Clock,
    User,
    CreditCard,
    CheckCircle,
    XCircle,
    Wallet,
    FileText,
    Building,
} from "lucide-react";

// --- Import Modal Pembayaran ---
import PaymentModal from "./modals/PaymentModal";

// --- Helper Functions ---
const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount || 0);
};

const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function FinanceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchDetail = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(
                `/api/super-admin/keuangan/${id}`
            );
            setBooking(response.data);
        } catch (error) {
            console.error(error);
            addToast("Gagal memuat detail transaksi.", "error");
            navigate("/super-admin/keuangan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">
                        Memuat Tagihan...
                    </p>
                </div>
            </div>
        );
    }

    if (!booking) return null;

    const isPaid = booking.counselor_payment_status === "PAID";

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans text-gray-700">
            {/* --- HEADER NAVIGASI --- */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition font-medium px-4 py-2 rounded-lg hover:bg-white hover:shadow-sm"
                >
                    <ChevronLeft size={20} /> Kembali
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-bold rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition"
                    >
                        <Printer size={18} /> Print
                    </button>
                </div>
            </div>

            {/* --- KARTU TAGIHAN (RECEIPT) --- */}
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200 print:shadow-none print:border-none">
                {/* 1. Header Invoice */}
                <div className="bg-gray-900 text-white p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <p className="text-cyan-400 font-bold tracking-widest uppercase text-xs mb-1">
                                INVOICE PEMBAYARAN JASA
                            </p>
                            <h1 className="text-3xl font-extrabold mb-1">
                                Tagihan Konselor
                            </h1>
                            <p className="text-gray-400 text-sm">
                                ID Referensi: #
                                {String(booking.id).padStart(6, "0")}
                            </p>
                        </div>
                        <div
                            className={`px-5 py-2 rounded-xl border-2 font-bold text-sm tracking-wide uppercase ${
                                isPaid
                                    ? "bg-green-500/20 border-green-500 text-green-400"
                                    : "bg-red-500/20 border-red-500 text-red-400"
                            }`}
                        >
                            {isPaid ? "LUNAS (PAID)" : "BELUM DIBAYAR (UNPAID)"}
                        </div>
                    </div>
                </div>

                {/* 2. Informasi Utama */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Kiri: Detail Sesi */}
                    <div>
                        <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-cyan-600" />{" "}
                            Detail Sesi
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">
                                        Waktu Sesi
                                    </p>
                                    <p className="font-medium text-gray-800">
                                        {formatDate(booking.created_at)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">
                                        Durasi & Jenis
                                    </p>
                                    <p className="font-medium text-gray-800">
                                        {booking.durasi_konseling?.durasi_menit}{" "}
                                        Menit •{" "}
                                        {
                                            booking.jenis_konseling
                                                ?.jenis_konseling
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">
                                        Konselor (Penerima)
                                    </p>
                                    <p className="font-bold text-gray-900 text-lg">
                                        {booking.konselor?.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {booking.konselor?.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kanan: Info Bank & Pembayaran */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <h3 className="text-gray-900 font-bold text-lg mb-4 flex items-center gap-2">
                            <CreditCard size={20} className="text-cyan-600" />{" "}
                            Tujuan Transfer
                        </h3>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-gray-400 uppercase">
                                    Bank
                                </span>
                                <span className="font-bold text-gray-800 text-right">
                                    {booking.konselor?.bank_name ||
                                        "Tidak ada data"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-gray-400 uppercase">
                                    No. Rekening
                                </span>
                                <span className="font-mono font-bold text-lg text-gray-900 tracking-tight">
                                    {booking.konselor?.account_number || "-"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase">
                                    Atas Nama
                                </span>
                                <span className="font-medium text-gray-800 text-right text-sm">
                                    {booking.konselor?.account_holder_name ||
                                        "-"}
                                </span>
                            </div>
                        </div>

                        {!isPaid ? (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-200 transition active:scale-95 flex justify-center items-center gap-2 print:hidden"
                            >
                                <Wallet size={18} /> Bayar Sekarang
                            </button>
                        ) : (
                            <div className="w-full py-3 bg-green-100 text-green-700 font-bold rounded-xl border border-green-200 flex justify-center items-center gap-2">
                                <CheckCircle size={18} /> Pembayaran Selesai
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Rincian Keuangan (Table) */}
                <div className="border-t border-gray-200">
                    <div className="p-8">
                        <h3 className="text-gray-900 font-bold text-lg mb-4">
                            Rincian Perhitungan
                        </h3>
                        <div className="overflow-hidden rounded-xl border border-gray-200">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Deskripsi</th>
                                        <th className="px-6 py-3 text-right">
                                            Jumlah
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="px-6 py-4 text-gray-700">
                                            Total Transaksi Customer
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            {formatRupiah(booking.total_harga)}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 text-gray-700">
                                            Potongan Platform & Biaya Admin
                                            <span className="block text-xs text-gray-400 mt-0.5">
                                                Pendapatan Moodly
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-red-500">
                                            - {formatRupiah(booking.admin_fee)}
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot className="bg-cyan-50">
                                    <tr>
                                        <td className="px-6 py-4 font-bold text-cyan-800 uppercase tracking-wide">
                                            Total Transfer (Gaji Konselor)
                                        </td>
                                        <td className="px-6 py-4 text-right font-extrabold text-xl text-cyan-700">
                                            {formatRupiah(
                                                booking.counselor_net
                                            )}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 4. Footer / Bukti Bayar */}
                {isPaid && (
                    <div className="bg-gray-50 p-8 border-t border-gray-200">
                        <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wide mb-4">
                            Bukti Pembayaran
                        </h3>
                        {booking.counselor_payment_proof ? (
                            <div className="bg-white p-4 rounded-xl border border-gray-200 inline-block">
                                <img
                                    src={booking.counselor_payment_proof_url}
                                    alt="Bukti Transfer"
                                    className="max-h-64 rounded-lg shadow-sm"
                                />
                                <div className="mt-4 flex gap-3">
                                    <a
                                        href={
                                            booking.counselor_payment_proof_url
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-sm text-center transition"
                                    >
                                        Lihat Full
                                    </a>
                                    <p className="text-xs text-gray-400 self-center">
                                        Dibayar pada:{" "}
                                        {formatDate(booking.counselor_paid_at)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">
                                Bukti pembayaran tidak tersedia.
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="text-center text-gray-400 text-xs mt-8 pb-8 print:hidden">
                &copy; {new Date().getFullYear()} Moodly Finance System. Dokumen
                ini digenerate secara otomatis oleh sistem.
            </div>

            {/* --- MODAL --- */}
            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                booking={booking}
                onSuccess={() => {
                    fetchDetail();
                    addToast("Gaji berhasil dibayarkan!", "success");
                }}
            />
        </div>
    );
}
