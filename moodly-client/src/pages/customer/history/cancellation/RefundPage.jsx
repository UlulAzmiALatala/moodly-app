import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import apiClient from "../../../../api/axios";
import { useAuth } from "../../../../context/AuthContext";
import {
    ChevronLeft,
    UploadCloud,
    User,
    CreditCard,
    Building2,
    FileText,
    AlertCircle,
    CheckCircle2,
    Banknote,
} from "lucide-react";

// --- KOMPONEN UI MODERN ---

const MobileLayout = ({ children }) => (
    <div className="flex justify-center min-h-screen bg-gray-50 font-sans">
        <div className="w-full max-w-md min-h-screen bg-[#F8F9FE] flex flex-col relative shadow-2xl overflow-hidden">
            {children}
        </div>
    </div>
);

const PageHeader = ({ title, onBack }) => (
    <div className="sticky top-0 z-30 flex items-center p-4 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
        <button
            onClick={onBack}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition active:scale-95"
        >
            <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-extrabold text-center text-gray-800 flex-grow tracking-tight">
            {title}
        </h1>
        <div className="w-8"></div>
    </div>
);

const LoadingSpinner = () => (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <div className="w-12 h-12 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-bold text-cyan-600 animate-pulse">
            Memproses...
        </p>
    </div>
);

const ErrorMessage = ({ message, onClose }) => (
    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm mb-6 relative border border-red-100 shadow-sm flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="flex-1">
            <p className="font-bold">Oops!</p>
            <p className="text-xs mt-1 leading-relaxed">{message}</p>
        </div>
        <button onClick={onClose} className="text-red-400 hover:text-red-700">
            ✕
        </button>
    </div>
);

const formatCurrency = (amount) => {
    if (amount == null) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(amount));
};

// --- HALAMAN UTAMA ---

export default function RefundPage() {
    const navigate = useNavigate();
    const { id: bookingId } = useParams();
    const { state } = useLocation();
    const { user } = useAuth();

    const [booking, setBooking] = useState(state?.booking || null);
    const [loading, setLoading] = useState(!state?.booking);
    const [error, setError] = useState(null);

    const [nama, setNama] = useState(user?.name || "");
    const [jenisBank, setJenisBank] = useState("");
    const [customBank, setCustomBank] = useState("");
    const [noRekening, setNoRekening] = useState("");
    const [gambar, setGambar] = useState(null);
    const [preview, setPreview] = useState(null);
    const [keterangan, setKeterangan] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Data jika tidak ada di state
    useEffect(() => {
        if (!booking && bookingId) {
            setLoading(true);
            apiClient
                .get(`/api/history/${bookingId}`)
                .then((response) => {
                    setBooking(response.data);
                    if (!nama && response.data.customer)
                        setNama(response.data.customer.name);
                })
                .catch((err) => {
                    console.error("Gagal fetch booking:", err);
                    setError("Gagal memuat data booking.");
                })
                .finally(() => setLoading(false));
        }
    }, [bookingId, booking, nama]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError("Ukuran gambar maksimal 2MB.");
                return;
            }
            setGambar(file);
            setPreview(URL.createObjectURL(file));
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const bankFinal = jenisBank === "LAINNYA" ? customBank : jenisBank;

        if (!nama || !noRekening || !bankFinal) {
            setError(
                "Mohon lengkapi data rekening (Nama, Bank, No. Rekening)."
            );
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const formData = new FormData();
        formData.append("nama_pemilik_rekening", nama);
        formData.append("nama_bank", bankFinal);
        formData.append("nomor_rekening", noRekening);
        if (keterangan) formData.append("keterangan_customer", keterangan);
        if (gambar) formData.append("bukti_refund_customer", gambar);

        try {
            await apiClient.post(
                `/api/history/${bookingId}/submit-refund`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            // Redirect ke Detail Status
            navigate(`/history/cancel-detail/${bookingId}`, { replace: true });
        } catch (err) {
            const msg =
                err.response?.data?.message || "Gagal mengirim pengajuan.";
            const validationErrors = err.response?.data?.errors
                ? Object.values(err.response.data.errors).flat().join(", ")
                : "";
            setError(`${msg} ${validationErrors}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading)
        return (
            <MobileLayout>
                <LoadingSpinner />
            </MobileLayout>
        );

    if (error && !booking) {
        return (
            <MobileLayout>
                <PageHeader title="Error" onBack={() => navigate(-1)} />
                <div className="p-8 flex flex-col items-center justify-center h-[80vh] text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="text-red-500 w-8 h-8" />
                    </div>
                    <p className="text-gray-800 font-bold text-lg mb-2">
                        Gagal Memuat Data
                    </p>
                    <p className="text-gray-500 text-sm mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/history")}
                        className="px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-bold"
                    >
                        Kembali ke Riwayat
                    </button>
                </div>
            </MobileLayout>
        );
    }

    if (!booking) return null;

    return (
        <MobileLayout>
            {isSubmitting && <LoadingSpinner />}
            <PageHeader title="Formulir Refund" onBack={() => navigate(-1)} />

            <div className="flex-1 overflow-y-auto pb-32">
                {/* --- 1. KARTU RINGKASAN (Ticket Style) --- */}
                <div className="p-5">
                    <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
                        {/* Hiasan Lingkaran Tiket */}
                        <div className="absolute -left-3 top-1/2 w-6 h-6 bg-[#F8F9FE] rounded-full"></div>
                        <div className="absolute -right-3 top-1/2 w-6 h-6 bg-[#F8F9FE] rounded-full"></div>

                        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 text-white text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                                Total Refund
                            </p>
                            <h2 className="text-3xl font-extrabold mt-1 tracking-tight">
                                {formatCurrency(booking.refund_amount)}
                            </h2>
                        </div>

                        <div className="p-5 space-y-3 bg-white">
                            <div className="flex justify-between items-center text-sm border-b border-dashed border-gray-200 pb-3">
                                <span className="text-gray-500">
                                    Total Bayar
                                </span>
                                <span className="font-medium text-gray-900">
                                    {formatCurrency(booking.total_harga)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 flex items-center gap-1">
                                    Potongan Admin{" "}
                                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                                        20%
                                    </span>
                                </span>
                                <span className="font-medium text-red-500">
                                    - {formatCurrency(booking.admin_fee)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 2. FORM INPUT --- */}
                <form onSubmit={handleSubmit} className="px-5 space-y-5">
                    {error && (
                        <ErrorMessage
                            message={error}
                            onClose={() => setError(null)}
                        />
                    )}

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <Banknote size={16} className="text-cyan-600" />{" "}
                            Rekening Tujuan
                        </h3>

                        {/* Input Nama */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={nama}
                                onChange={(e) => setNama(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm font-medium text-gray-700"
                                placeholder="Nama Pemilik Rekening"
                            />
                        </div>

                        {/* Select Bank */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Building2 className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                            </div>
                            <select
                                value={jenisBank}
                                onChange={(e) => setJenisBank(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3.5 border border-gray-200 rounded-xl bg-white text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 appearance-none transition-all"
                            >
                                <option value="">Pilih Bank</option>
                                <option value="BCA">BCA</option>
                                <option value="BNI">BNI</option>
                                <option value="BRI">BRI</option>
                                <option value="MANDIRI">Mandiri</option>
                                <option value="LAINNYA">
                                    Bank Lain / E-Wallet
                                </option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <ChevronLeft className="h-5 w-5 text-gray-400 -rotate-90" />
                            </div>
                        </div>

                        {/* Custom Bank Input */}
                        {jenisBank === "LAINNYA" && (
                            <div className="animate-fadeIn">
                                <input
                                    type="text"
                                    value={customBank}
                                    onChange={(e) =>
                                        setCustomBank(e.target.value)
                                    }
                                    className="block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                                    placeholder="Tulis Nama Bank / E-Wallet (DANA/OVO)"
                                />
                            </div>
                        )}

                        {/* Nomor Rekening */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CreditCard className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-500 transition-colors" />
                            </div>
                            <input
                                type="text" // number kadang membatasi karakter dash (-)
                                inputMode="numeric"
                                value={noRekening}
                                onChange={(e) => setNoRekening(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm font-mono font-medium text-gray-700"
                                placeholder="Nomor Rekening"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <FileText size={16} className="text-cyan-600" />{" "}
                            Bukti & Keterangan
                        </h3>

                        {/* Upload Area Modern */}
                        <div className="group">
                            <label
                                htmlFor="file-upload"
                                className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all
                                    ${
                                        preview
                                            ? "border-cyan-300 bg-cyan-50/30"
                                            : "border-gray-300 bg-white hover:bg-gray-50 hover:border-cyan-400"
                                    }`}
                            >
                                {preview ? (
                                    <div className="relative w-full h-full p-2">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-full h-full object-contain rounded-xl"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                            <p className="text-white text-xs font-bold">
                                                Ganti Gambar
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="p-3 bg-cyan-100 text-cyan-600 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                            <UploadCloud className="w-6 h-6" />
                                        </div>
                                        <p className="mb-1 text-sm text-gray-500 font-medium">
                                            <span className="font-bold text-cyan-600">
                                                Klik untuk upload
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            JPG, PNG (Max 2MB)
                                        </p>
                                    </div>
                                )}
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        <textarea
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            className="w-full p-4 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all resize-none bg-white"
                            rows={3}
                            placeholder="Tambahkan catatan jika perlu..."
                        />
                    </div>
                </form>
            </div>

            {/* --- FOOTER BUTTON STICKY --- */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] z-20">
                <button
                    onClick={handleSubmit}
                    disabled={
                        isSubmitting || !nama || !noRekening || !jenisBank
                    }
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Mengirim...</span>
                        </>
                    ) : (
                        <>
                            <span>Kirim Pengajuan</span>
                            <CheckCircle2 size={18} />
                        </>
                    )}
                </button>
            </div>
        </MobileLayout>
    );
}
