import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Video,
    Phone,
    MessageSquare,
    User,
    Mail,
    Link as LinkIcon,
    ExternalLink,
    Copy,
    CheckCircle2,
    Save,
    Edit2,
    Loader2,
    AlertCircle,
    Hourglass,
} from "lucide-react";

// 1. Import Hook Toast
import { useToast } from "../../../context/ToastContext";

// --- HOOK: USE COUNTDOWN ---
const useCountdown = (targetDate, targetTime) => {
    const targetDateTime = useMemo(() => {
        if (!targetDate || !targetTime) return new Date();
        // Pastikan format YYYY-MM-DD dan HH:MM:00
        // Kita asumsikan targetTime hanya jam mulai (ex: "09:00")
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

// --- COMPONENT: STATUS BADGE ---
const StatusBadge = ({ status }) => {
    const styles = {
        Selesai: "bg-green-100 text-green-700 border-green-200",
        Batal: "bg-red-100 text-red-700 border-red-200",
        Proses: "bg-yellow-100 text-yellow-700 border-yellow-200",
        Dijadwalkan: "bg-cyan-100 text-cyan-700 border-cyan-200", // Cyan style
        Berlangsung: "bg-purple-100 text-purple-700 border-purple-200",
        "Menunggu Konfirmasi": "bg-gray-100 text-gray-700 border-gray-200",
    };
    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                styles[status] || "bg-gray-100 text-gray-600"
            }`}
        >
            {status}
        </span>
    );
};

// --- COMPONENT: SESSION TIMER CARD ---
const SessionTimerCard = ({ booking }) => {
    // Ambil jam mulai saja (misal "09:00 - 10:00" -> "09:00")
    const startTime = booking.jam_konsultasi
        ? booking.jam_konsultasi.split("-")[0].trim().substring(0, 5)
        : "00:00";

    const { isReady, days, hours, minutes, seconds } = useCountdown(
        booking.tanggal_konsultasi,
        startTime
    );

    // Hanya tampilkan jika status relevan
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
                            Status Waktu Sesi
                        </p>
                        {isReady ? (
                            <h3 className="text-xl font-extrabold text-white">
                                SEDANG BERLANGSUNG
                            </h3>
                        ) : (
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-mono font-bold">
                                    {days > 0 && `${days}h `}
                                    {String(hours).padStart(2, "0")}:
                                    {String(minutes).padStart(2, "0")}:
                                    {String(seconds).padStart(2, "0")}
                                </span>
                                <span className="text-sm text-cyan-100">
                                    menuju sesi
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Indikator Visual Tambahan */}
                {isReady && (
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500 rounded-full shadow-sm">
                        <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                        <span className="text-xs font-bold">LIVE NOW</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- COMPONENT: VIRTUAL ROOM CARD ---
const VirtualRoomCard = ({ booking, onSaveLink, loading }) => {
    const isOnline = ["Video Call", "Voice Call"].includes(
        booking.metode_konsultasi
    );
    const [link, setLink] = useState(booking.gmeet_link || "");
    const [isEditing, setIsEditing] = useState(!booking.gmeet_link);
    const [copied, setCopied] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        setLink(booking.gmeet_link || "");
        if (!booking.gmeet_link) setIsEditing(true);
    }, [booking.gmeet_link]);

    if (!isOnline) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        addToast("Link berhasil disalin!", "success");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = () => {
        onSaveLink(link);
        setIsEditing(false);
    };

    return (
        <div className="bg-white rounded-xl border border-cyan-100 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 bg-cyan-50/50 border-b border-cyan-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-cyan-100 text-cyan-600">
                        {booking.metode_konsultasi === "Video Call" ? (
                            <Video size={20} />
                        ) : (
                            <Phone size={20} />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm">
                            Virtual Meeting Room
                        </h3>
                        <p className="text-xs text-gray-500">
                            Platform untuk sesi {booking.metode_konsultasi}
                        </p>
                    </div>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs font-medium text-cyan-600 hover:text-cyan-800 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-cyan-100 shadow-sm transition-all"
                    >
                        <Edit2 size={12} /> Edit Link
                    </button>
                )}
            </div>

            <div className="p-6">
                {isEditing ? (
                    <div className="space-y-3">
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="url"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="Tempel link Google Meet / Zoom di sini..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setLink(booking.gmeet_link || "");
                                }}
                                className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 transition flex items-center gap-2 disabled:opacity-70"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Simpan Link
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-sm text-gray-600 font-mono truncate mr-2">
                                {link}
                            </span>
                            <button
                                onClick={handleCopy}
                                className="p-1.5 hover:bg-white rounded-md text-gray-400 hover:text-cyan-600 transition-colors"
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
                            className="w-full sm:w-auto px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
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
                        Link ini akan muncul otomatis di dashboard Customer dan
                        Konselor saat status booking "Dijadwalkan".
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---
const JadwalDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [jadwal, setJadwal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchJadwal = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(
                    `/api/admin/jadwal-konsultasi/${id}`
                );
                setJadwal(response.data);
            } catch (error) {
                console.error("Gagal load detail jadwal:", error);
                addToast("Gagal memuat detail jadwal.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchJadwal();
    }, [id]);

    const handleUpdateLink = async (newLink) => {
        setIsSubmitting(true);
        try {
            await apiClient.post(
                `/api/admin/jadwal-konsultasi/${id}/update-gmeet`,
                { gmeet_link: newLink }
            );
            setJadwal((prev) => ({ ...prev, gmeet_link: newLink }));
            addToast("Link meeting berhasil disimpan!", "success");
        } catch (error) {
            console.error("Gagal update link:", error);
            addToast("Gagal menyimpan link.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading)
        return (
            <div className="p-10 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent mb-2"></div>
                <p>Memuat detail...</p>
            </div>
        );
    if (!jadwal)
        return (
            <div className="p-10 text-center text-red-500">
                Data tidak ditemukan.
            </div>
        );

    return (
        <div className="p-6 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate("/admin/jadwal-konsultasi")}
                    className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600 shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Detail Konsultasi #{jadwal.id}
                        </h1>
                        <StatusBadge status={jadwal.status_pesanan} />
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />{" "}
                        {formatDate(jadwal.tanggal_konsultasi)}
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <Clock className="w-4 h-4" />{" "}
                        {formatTime(jadwal.jam_konsultasi)} WIB
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* KOLOM KIRI: Detail Sesi & Room */}
                <div className="lg:col-span-2 space-y-6">
                    {/* 1. SESSION TIMER CARD */}
                    <SessionTimerCard booking={jadwal} />

                    {/* 2. Virtual Room Card (Hanya jika online) */}
                    <VirtualRoomCard
                        booking={jadwal}
                        onSaveLink={handleUpdateLink}
                        loading={isSubmitting}
                    />

                    {/* 3. Detail Sesi */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-500" />
                                Rincian Sesi
                            </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                    Topik
                                </p>
                                <p className="text-gray-800 font-medium">
                                    {jadwal.jenis_konseling?.jenis_konseling}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                    Metode
                                </p>
                                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-700 text-sm font-bold border border-cyan-100">
                                    {jadwal.metode_konsultasi ===
                                        "Video Call" && <Video size={14} />}
                                    {jadwal.metode_konsultasi === "Call" && (
                                        <Phone size={14} />
                                    )}
                                    {jadwal.metode_konsultasi === "Chat" && (
                                        <MessageSquare size={14} />
                                    )}
                                    {jadwal.metode_konsultasi}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                    Durasi
                                </p>
                                <p className="text-gray-800 font-medium">
                                    {jadwal.durasi_konseling?.durasi_menit}{" "}
                                    Menit
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                    Tempat / Platform
                                </p>
                                <p className="text-gray-800 font-medium">
                                    {jadwal.tempat_konseling?.nama_tempat ||
                                        "Online"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KOLOM KANAN: Partisipan */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Customer Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <User size={16} /> Customer
                        </h3>
                        <div className="flex items-center gap-4 mb-4">
                            <img
                                src={
                                    jadwal.customer?.avatar ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        jadwal.customer?.name
                                    )}&background=ECFEFF&color=0891b2`
                                }
                                className="w-12 h-12 rounded-full object-cover border border-gray-100"
                                alt=""
                            />
                            <div>
                                <p className="font-bold text-gray-900 text-lg">
                                    {jadwal.customer?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    ID: #{jadwal.customer_id}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Mail size={14} className="text-gray-400" />{" "}
                                {jadwal.customer?.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" />{" "}
                                {jadwal.customer?.phone || "-"}
                            </div>
                        </div>
                    </div>

                    {/* Konselor Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <User size={16} /> Konselor
                        </h3>
                        <div className="flex items-center gap-4 mb-4">
                            <img
                                src={
                                    jadwal.konselor?.avatar ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        jadwal.konselor?.name
                                    )}&background=F3E8FF&color=9333EA`
                                }
                                className="w-12 h-12 rounded-full object-cover border border-gray-100"
                                alt=""
                            />
                            <div>
                                <p className="font-bold text-gray-900 text-lg">
                                    {jadwal.konselor?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Psikolog Klinis
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Mail size={14} className="text-gray-400" />{" "}
                                {jadwal.konselor?.email}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JadwalDetailPage;
