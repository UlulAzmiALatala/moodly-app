import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../api/axios";
import MobileLayout from "../../../layouts/MobileLayout";
import html2canvas from "html2canvas";
import {
    ChevronLeft,
    Download,
    Share2,
    CheckCircle2,
    Building,
    User,
} from "lucide-react";

// --- Helper Format ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount || 0);
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

export default function CounselorReceiptPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const receiptRef = useRef(null);

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch Data Booking
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                // Gunakan endpoint yang sudah ada, pastikan backend mengirim counselor_net & proofs
                const response = await apiClient.get(
                    `/api/counselor/booking/${id}`
                );
                setBooking(response.data);
            } catch (error) {
                console.error("Gagal load receipt:", error);
                alert("Data tidak ditemukan.");
                navigate("/counselor/history");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, navigate]);

    // Download Image
    const handleSaveReceipt = async () => {
        if (!receiptRef.current) return;
        setIsSaving(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            const canvas = await html2canvas(receiptRef.current, {
                scale: 3,
                useCORS: true,
                backgroundColor: "#ffffff",
            });
            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = `Gaji-Moodly-${id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error(err);
            alert("Gagal menyimpan gambar.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                Memuat...
            </div>
        );
    if (!booking) return null;

    return (
        <MobileLayout>
            <div className="flex flex-col min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white p-4 flex items-center gap-3 sticky top-0 z-20 border-b border-gray-100">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="font-bold text-lg text-gray-800">
                        Rincian Pendapatan
                    </h1>
                </div>

                {/* --- STRUK AREA --- */}
                <div className="p-4 pb-24">
                    <div
                        ref={receiptRef}
                        className="bg-white rounded-3xl shadow-xl overflow-hidden relative"
                    >
                        {/* Header Struk */}
                        <div className="bg-green-500 p-6 text-center text-white relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-white/10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-50"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 border-2 border-white/30">
                                    <CheckCircle2
                                        size={28}
                                        className="text-white"
                                    />
                                </div>
                                <h2 className="text-lg font-bold tracking-wide">
                                    GAJI DITERIMA
                                </h2>
                                <p className="text-green-100 text-xs mt-1">
                                    {formatDate(
                                        booking.counselor_paid_at ||
                                            booking.updated_at
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Nominal Utama */}
                        <div className="p-6 text-center border-b border-gray-100 border-dashed">
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                                Total Pendapatan Bersih
                            </p>
                            <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                                {formatCurrency(booking.counselor_net)}
                            </h1>
                        </div>

                        {/* Detail */}
                        <div className="p-6 space-y-4">
                            {/* Baris 1: ID */}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">
                                    ID Referensi
                                </span>
                                <span className="font-mono font-bold text-gray-700">
                                    PAY-{String(booking.id).padStart(5, "0")}
                                </span>
                            </div>

                            {/* Baris 2: Customer */}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <User size={14} /> Pasien
                                </span>
                                <span className="font-bold text-gray-800">
                                    {booking.customer?.name}
                                </span>
                            </div>

                            {/* Baris 3: Bank */}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <Building size={14} /> Rekening Tujuan
                                </span>
                                <div className="text-right">
                                    <p className="font-bold text-gray-800">
                                        {booking.konselor?.bank_name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {booking.konselor?.account_number}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bukti Transfer Image */}
                        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-3">
                                Bukti Transfer Admin
                            </p>
                            {booking.counselor_payment_proof_url ? (
                                <img
                                    src={booking.counselor_payment_proof_url}
                                    alt="Bukti Transfer"
                                    className="w-full rounded-xl border border-gray-200 shadow-sm"
                                />
                            ) : (
                                <div className="py-8 text-gray-400 text-xs italic bg-gray-100 rounded-xl border border-dashed border-gray-300">
                                    Bukti gambar tidak tersedia
                                </div>
                            )}
                        </div>

                        {/* Footer Struk */}
                        <div className="bg-gray-100 p-3 text-center">
                            <p className="text-[10px] text-gray-400 font-medium">
                                Moodly Partner Earnings Receipt
                            </p>
                        </div>
                    </div>
                </div>

                {/* Floating Action Button */}
                <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t border-gray-100 z-30">
                    <button
                        onClick={handleSaveReceipt}
                        disabled={isSaving}
                        className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition shadow-lg active:scale-95 disabled:bg-gray-400"
                    >
                        {isSaving ? (
                            "Menyimpan..."
                        ) : (
                            <>
                                <Download size={18} /> Simpan Bukti
                            </>
                        )}
                    </button>
                </div>
            </div>
        </MobileLayout>
    );
}
