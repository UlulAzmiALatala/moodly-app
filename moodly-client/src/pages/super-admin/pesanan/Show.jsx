import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios";
import {
    ArrowLeft,
    Calendar,
    Clock,
    CreditCard,
    User,
    Mail,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Maximize2,
    X,
    Video,
    Link as LinkIcon,
    Copy,
    ExternalLink,
    Save,
    Edit2,
    ShieldCheck,
    Phone,
    MessageSquare,
    Loader2,
    Hourglass,
    AlertCircle,
} from "lucide-react";

// 1. Import Hook Toast
import { useToast } from "../../../context/ToastContext";

// --- UTILS ---
const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const formatTime = (timeString) =>
    timeString ? timeString.substring(0, 5) : "-";

const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(number);
};

// --- HOOK: USE COUNTDOWN ---
const useCountdown = (targetDate, targetTime) => {
    const targetDateTime = useMemo(() => {
        if (!targetDate || !targetTime) return new Date();
        const timePart = targetTime.includes(":") ? targetTime : "00:00";
        return new Date(`${targetDate}T${timePart}:00`);
    }, [targetDate, targetTime]);

    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const timeRemaining = targetDateTime - now;

    if (timeRemaining <= 0) {
        return { isReady: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
        isReady: false,
        days: Math.floor(timeRemaining / (1000 * 60 * 60 * 24)),
        hours: Math.floor((timeRemaining / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((timeRemaining / 1000 / 60) % 60),
        seconds: Math.floor((timeRemaining / 1000) % 60),
    };
};

// --- COMPONENTS ---

const StatusBadge = ({ status }) => {
    const styles = {
        Selesai: "bg-green-100 text-green-700 border-green-200",
        Dijadwalkan: "bg-cyan-100 text-cyan-700 border-cyan-200", // Cyan Style
        "Menunggu Verifikasi":
            "bg-purple-100 text-purple-700 border-purple-200 animate-pulse",
        "Menunggu Pembayaran":
            "bg-yellow-100 text-yellow-700 border-yellow-200",
        Batal: "bg-red-100 text-red-700 border-red-200",
        "Pembayaran Ditolak": "bg-red-100 text-red-700 border-red-200",
    };
    const currentStyle =
        styles[status] || "bg-gray-100 text-gray-700 border-gray-200";

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${currentStyle}`}
        >
            {status}
        </span>
    );
};

// --- SESSION TIMER CARD ---
const SessionTimerCard = ({ booking }) => {
    const startTime = booking.jam_konsultasi
        ? booking.jam_konsultasi.split("-")[0].trim().substring(0, 5)
        : "00:00";

    const { isReady, days, hours, minutes, seconds } = useCountdown(
        booking.tanggal_konsultasi,
        startTime
    );

    if (
        !["Dijadwalkan", "Menunggu Konfirmasi", "Berlangsung"].includes(
            booking.status_pesanan
        )
    ) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-cyan-600 to-blue-500 rounded-xl shadow-lg p-1 mb-6 text-white">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full animate-pulse">
                        <Hourglass className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-cyan-100 text-xs font-bold uppercase tracking-wider mb-1">
                            Waktu Menuju Sesi
                        </p>
                        {isReady ? (
                            <h3 className="text-xl font-extrabold text-white">
                                SESI DIMULAI
                            </h3>
                        ) : (
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-mono font-bold">
                                    {days > 0 && `${days}h `}
                                    {String(hours).padStart(2, "0")}:
                                    {String(minutes).padStart(2, "0")}:
                                    {String(seconds).padStart(2, "0")}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                {isReady && (
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500 rounded-full shadow-sm">
                        <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                        <span className="text-xs font-bold">LIVE</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MEETING LINK CARD ---
const MeetingLinkCard = ({ booking, onSave, loading }) => {
    const { addToast } = useToast();
    const isOnline = ["Video Call", "Voice Call"].includes(
        booking.metode_konsultasi
    );
    const [link, setLink] = useState(booking.gmeet_link || "");
    const [isEditing, setIsEditing] = useState(!booking.gmeet_link);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setLink(booking.gmeet_link || "");
    }, [booking.gmeet_link]);

    if (!isOnline) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        addToast("Link berhasil disalin!", "success");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = () => {
        if (!link) return addToast("Link tidak boleh kosong.", "warning");
        onSave(link);
        setIsEditing(false);
    };

    return (
        <div className="bg-white rounded-xl border border-cyan-100 shadow-sm mb-6 overflow-hidden">
            <div className="px-6 py-4 bg-cyan-50/50 border-b border-cyan-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-cyan-100 text-cyan-600 shadow-sm">
                        {booking.metode_konsultasi === "Video Call" ? (
                            <Video className="w-5 h-5" />
                        ) : (
                            <Phone className="w-5 h-5" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm">
                            Ruang Virtual {booking.metode_konsultasi}
                        </h3>
                        <p className="text-xs text-gray-500">
                            Link akses untuk Customer & Konselor
                        </p>
                    </div>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs font-medium text-cyan-600 hover:text-cyan-800 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-cyan-100 shadow-sm hover:shadow transition-all"
                    >
                        <Edit2 className="w-3 h-3" /> Edit Link
                    </button>
                )}
            </div>

            <div className="p-6">
                {isEditing ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="url"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="Tempel link Google Meet / Zoom di sini..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {loading ? "..." : "Simpan"}
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2.5 bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between group">
                            <span className="text-sm text-gray-600 font-mono truncate mr-2">
                                {link}
                            </span>
                            <button
                                onClick={handleCopy}
                                className="p-1.5 hover:bg-white rounded-md text-gray-400 hover:text-cyan-600 transition-colors shadow-sm"
                                title="Salin Link"
                            >
                                {copied ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm shadow-cyan-200"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Masuk Room
                        </a>
                    </div>
                )}
                <div className="mt-3 flex items-start gap-2">
                    <div className="mt-0.5 w-4 h-4 text-amber-500 flex items-center justify-center">
                        <AlertCircle className="w-3 h-3" />
                    </div>
                    <p className="text-[11px] text-gray-400 leading-tight">
                        Link ini akan otomatis muncul di dashboard Customer dan
                        Konselor.
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
const BookingDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal States
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // 2. Panggil Hook Toast
    const { addToast } = useToast();

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(
                    `/api/super-admin/booking-management/${id}`
                );
                setBooking(response.data);
            } catch (err) {
                console.error("Error fetching:", err);
                addToast("Gagal memuat detail pesanan.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [id]);

    // --- ACTIONS ---
    const handleUpdateLink = async (newLink) => {
        setIsSubmitting(true);
        try {
            await apiClient.put(
                `/api/super-admin/booking-management/${id}/update-link`,
                { gmeet_link: newLink }
            );
            setBooking((prev) => ({ ...prev, gmeet_link: newLink }));
            addToast("Link meeting berhasil disimpan!", "success");
        } catch (err) {
            console.error(err);
            addToast("Gagal menyimpan link.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApprove = async () => {
        if (
            !window.confirm(
                "Apakah Anda yakin ingin menyetujui pembayaran ini?"
            )
        )
            return;

        setIsSubmitting(true);
        try {
            await apiClient.post(
                `/api/super-admin/booking-management/${id}/approve-payment`
            );
            addToast("Pembayaran berhasil disetujui.", "success");
            // Force reload data
            const response = await apiClient.get(
                `/api/super-admin/booking-management/${id}`
            );
            setBooking(response.data);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                "Terjadi kesalahan saat menyetujui.";
            addToast(msg, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        setIsSubmitting(true);
        try {
            await apiClient.post(
                `/api/super-admin/booking-management/${id}/reject-payment`,
                { reason: rejectReason }
            );
            addToast("Pembayaran telah ditolak.", "success");
            setIsRejectModalOpen(false);
            // Force reload data
            const response = await apiClient.get(
                `/api/super-admin/booking-management/${id}`
            );
            setBooking(response.data);
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                "Terjadi kesalahan saat menolak.";
            addToast(msg, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading)
        return (
            <div className="p-10 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent mb-2"></div>
                <p>Memuat detail pesanan...</p>
            </div>
        );
    if (!booking)
        return (
            <div className="p-10 text-center text-red-500">
                Data pesanan tidak ditemukan.
            </div>
        );

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-6">
                <div className="flex items-center gap-4">
                    {/* --- PERBAIKAN LINK DI SINI --- */}
                    <Link
                        to="/admin/booking-management" // Mengarah ke rute yang benar di index.jsx
                        className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    {/* ------------------------------ */}
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Pesanan #{booking.id}
                            </h1>
                            <StatusBadge status={booking.status_pesanan} />
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Dibuat pada{" "}
                            {formatDate(booking.created_at)}
                        </p>
                    </div>
                </div>
            </div>

            {/* GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN (MAIN CONTENT) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* 0. SESSION TIMER */}
                    <SessionTimerCard booking={booking} />

                    {/* 1. MEETING LINK CARD */}
                    <MeetingLinkCard
                        booking={booking}
                        onSave={handleUpdateLink}
                        loading={isSubmitting}
                    />

                    {/* 2. SESSION DETAILS CARD */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-cyan-600" />{" "}
                                Detail Sesi Konseling
                            </h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                        Topik
                                    </p>
                                    <p className="text-gray-800 font-medium">
                                        {
                                            booking.jenis_konseling
                                                ?.jenis_konseling
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                        Metode
                                    </p>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-700 text-sm font-bold border border-cyan-100">
                                        {booking.metode_konsultasi}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                        Waktu
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-gray-900 font-bold text-lg">
                                            {formatTime(booking.jam_konsultasi)}{" "}
                                            WIB
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {formatDate(booking.tanggal_konsultasi)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                        Durasi
                                    </p>
                                    <p className="text-gray-800 font-medium">
                                        {booking.durasi_konseling?.durasi_menit}{" "}
                                        Menit
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                        Tempat / Platform
                                    </p>
                                    <p className="text-gray-800 font-medium">
                                        {booking.tempat_konseling
                                            ?.nama_tempat || "Online"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (SIDEBAR) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* CUSTOMER PROFILE */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" /> Data Customer
                        </h3>
                        <div className="flex items-center gap-3 mb-4">
                            {booking.customer?.avatar ? (
                                <img
                                    src={booking.customer.avatar}
                                    className="w-12 h-12 rounded-full object-cover"
                                    alt=""
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold text-lg">
                                    {booking.customer?.name?.charAt(0)}
                                </div>
                            )}
                            <div className="overflow-hidden">
                                <p className="font-bold text-gray-900 truncate">
                                    {booking.customer?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    ID: #{booking.customer?.id}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="truncate">
                                    {booking.customer?.email}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* COUNSELOR PROFILE */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" /> Data Konselor
                        </h3>
                        <div className="flex items-center gap-3 mb-4">
                            {booking.konselor?.avatar ? (
                                <img
                                    src={booking.konselor.avatar}
                                    className="w-12 h-12 rounded-full object-cover"
                                    alt=""
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">
                                    {booking.konselor?.name?.charAt(0)}
                                </div>
                            )}
                            <div className="overflow-hidden">
                                <p className="font-bold text-gray-900 truncate">
                                    {booking.konselor?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Psikolog
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="truncate">
                                    {booking.konselor?.email}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 3. PAYMENT & PROOF CARD */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-green-600" />{" "}
                                Pembayaran
                            </h2>
                            <span className="text-lg font-extrabold text-gray-900">
                                {formatRupiah(booking.total_harga)}
                            </span>
                        </div>
                        <div className="p-6">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                Bukti Transfer
                            </p>
                            {booking.payment_proof_image_url ? (
                                <div
                                    className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm cursor-pointer mb-4"
                                    onClick={() => setIsPreviewOpen(true)}
                                >
                                    <img
                                        src={booking.payment_proof_image_url}
                                        alt="Bukti"
                                        className="w-full h-32 object-cover object-top hover:opacity-90 transition-opacity"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                                            <Maximize2 className="w-3 h-3" />
                                            Perbesar
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 gap-2 mb-4">
                                    <CreditCard className="w-8 h-8 opacity-50" />
                                    <span className="text-xs">
                                        Belum ada bukti
                                    </span>
                                </div>
                            )}

                            {booking.payment_proof_notes && (
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 mb-4">
                                    <span className="font-bold block mb-1 text-xs uppercase opacity-70">
                                        Catatan Customer:
                                    </span>
                                    "{booking.payment_proof_notes}"
                                </div>
                            )}

                            {booking.status_pesanan ===
                                "Pembayaran Ditolak" && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800 mb-4">
                                    <span className="font-bold block mb-1 text-xs uppercase opacity-70">
                                        Alasan Penolakan:
                                    </span>
                                    "{booking.catatan_pembatalan}"
                                </div>
                            )}

                            {booking.status_pesanan ===
                            "Menunggu Verifikasi" ? (
                                <div className="space-y-3 pt-2 border-t border-gray-100">
                                    <button
                                        onClick={handleApprove}
                                        disabled={isSubmitting}
                                        className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                Setujui
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() =>
                                            setIsRejectModalOpen(true)
                                        }
                                        disabled={isSubmitting}
                                        className="w-full py-2.5 px-4 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-5 h-5" /> Tolak
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg border border-green-100 mt-4">
                                    <ShieldCheck className="w-5 h-5" />
                                    <span className="font-bold text-sm">
                                        Terverifikasi
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. REFUND INFO */}
                    {booking.refund && (
                        <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-red-50/50 border-b border-red-100">
                                <h2 className="font-bold text-red-800 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> Info
                                    Refund
                                </h2>
                            </div>
                            <div className="p-5 text-sm">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Bank</span>
                                    <span className="font-bold text-gray-900">
                                        {booking.refund.nama_bank}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">
                                        No. Rek
                                    </span>
                                    <span className="font-bold text-gray-900">
                                        {booking.refund.nomor_rekening}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-4">
                                    <span className="text-gray-600">A.N</span>
                                    <span className="font-bold text-gray-900">
                                        {booking.refund.nama_pemilik_rekening}
                                    </span>
                                </div>
                                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                                    <div className="flex justify-between mb-1">
                                        <span>Total Bayar</span>
                                        <span className="font-bold">
                                            {formatRupiah(
                                                booking.refund.total_bayar
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-red-600 mb-1">
                                        <span>Potongan</span>
                                        <span>
                                            -
                                            {formatRupiah(
                                                booking.refund.potongan_admin
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-bold pt-2 border-t border-red-200 text-gray-900">
                                        <span>Refund</span>
                                        <span>
                                            {formatRupiah(
                                                booking.refund.jumlah_refund
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Preview Modal */}
            {isPreviewOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setIsPreviewOpen(false)}
                >
                    <img
                        src={booking.payment_proof_image_url}
                        alt="Full"
                        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                    />
                </div>
            )}

            {/* Reject Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">
                                Tolak Pembayaran
                            </h3>
                            <button onClick={() => setIsRejectModalOpen(false)}>
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-500 mb-4">
                                Berikan alasan penolakan yang jelas untuk
                                customer.
                            </p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) =>
                                    setRejectReason(e.target.value)
                                }
                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none min-h-[100px]"
                                placeholder="Contoh: Bukti transfer tidak terbaca..."
                            ></textarea>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-200 rounded-lg"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason || isSubmitting}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {isSubmitting
                                    ? "Memproses..."
                                    : "Konfirmasi Tolak"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingDetailPage;
