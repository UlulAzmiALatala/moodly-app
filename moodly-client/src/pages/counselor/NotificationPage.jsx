import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/axios";
import {
    Bell,
    CheckCircle2,
    Clock,
    Wallet,
    Calendar,
    Info,
    ChevronLeft,
    Loader2,
    XCircle,
    MessageCircle,
} from "lucide-react";

// --- Helper: Format Waktu ---
const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " tahun lalu";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bulan lalu";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari lalu";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit lalu";
    return "Baru saja";
};

// --- Helper: Get Icon ---
const getNotificationIcon = (iconName) => {
    switch (iconName) {
        case "Wallet":
            return <Wallet size={20} />;
        case "Calendar":
            return <Calendar size={20} />;
        case "Clock":
            return <Clock size={20} />;
        case "CheckCircle":
            return <CheckCircle2 size={20} />;
        case "XCircle":
            return <XCircle size={20} />;
        case "MessageCircle":
            return <MessageCircle size={20} />;
        default:
            return <Info size={20} />;
    }
};

export default function NotificationPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);

    // 1. Fetch Notifications
    const fetchNotifications = async () => {
        try {
            const response = await apiClient.get("/api/notifications");
            setNotifications(response.data);
        } catch (error) {
            console.error("Gagal memuat notifikasi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Polling 30s
        return () => clearInterval(interval);
    }, []);

    // 2. Handle Klik Notifikasi
    const handleNotificationClick = async (notification) => {
        // Update UI local agar terlihat sudah dibaca
        if (!notification.read_at) {
            try {
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notification.id
                            ? { ...n, read_at: new Date() }
                            : n
                    )
                );
            } catch (e) {
                console.error(e);
            }
        }

        // Navigasi ke Link (jika ada)
        if (notification.data?.link) {
            navigate(notification.data.link);
        }
    };

    // 3. Mark All as Read
    const handleMarkAllRead = async () => {
        setMarking(true);
        try {
            await apiClient.post("/api/notifications/mark-read");
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: new Date() }))
            );
        } catch (error) {
            console.error("Gagal update status:", error);
        } finally {
            setMarking(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Header Sticky */}
            <header className="bg-white border-b border-gray-100 p-4 sticky top-0 z-20 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full transition"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold text-gray-800">
                        Notifikasi
                    </h1>
                </div>

                {notifications.some((n) => !n.read_at) && (
                    <button
                        onClick={handleMarkAllRead}
                        disabled={marking}
                        className="text-xs font-bold text-cyan-600 hover:text-cyan-700 disabled:opacity-50 transition-colors"
                    >
                        {marking ? "Memproses..." : "Tandai Dibaca"}
                    </button>
                )}
            </header>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Loader2 className="animate-spin mb-2" />
                        <span className="text-xs">Memuat notifikasi...</span>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <Bell size={32} />
                        </div>
                        <h3 className="text-gray-800 font-bold mb-1">
                            Belum ada notifikasi
                        </h3>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto">
                            Informasi jadwal, pembayaran, dan update lainnya
                            akan muncul di sini.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 bg-white">
                        {notifications.map((notif) => {
                            const isUnread = !notif.read_at;
                            const { title, message, color, bg_color, icon } =
                                notif.data;

                            return (
                                <div
                                    key={notif.id}
                                    onClick={() =>
                                        handleNotificationClick(notif)
                                    }
                                    className={`
                                        p-4 flex gap-4 cursor-pointer transition-all active:bg-gray-50
                                        ${
                                            isUnread
                                                ? "bg-cyan-50/30 border-l-4 border-l-cyan-500"
                                                : "bg-white border-l-4 border-l-transparent opacity-90"
                                        }
                                    `}
                                >
                                    {/* Icon Container */}
                                    <div
                                        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                                            bg_color || "bg-gray-100"
                                        } ${color || "text-gray-500"}`}
                                    >
                                        {getNotificationIcon(icon)}
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4
                                                className={`text-sm font-bold truncate pr-2 ${
                                                    isUnread
                                                        ? "text-gray-900"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                {title}
                                            </h4>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap mt-0.5">
                                                {formatTimeAgo(
                                                    notif.created_at
                                                )}
                                            </span>
                                        </div>
                                        <p
                                            className={`text-xs leading-relaxed line-clamp-2 ${
                                                isUnread
                                                    ? "text-gray-700"
                                                    : "text-gray-400"
                                            }`}
                                        >
                                            {message}
                                        </p>
                                    </div>

                                    {/* Red Dot Indicator */}
                                    {isUnread && (
                                        <div className="shrink-0 self-center pl-1">
                                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white shadow-sm"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
