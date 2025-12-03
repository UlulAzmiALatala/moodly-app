import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
    Bell,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    ChevronLeft,
} from "lucide-react"; // Ikon Modern
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

// --- CONFIG ECHO (TETAP) ---
const echo = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY || "reverb_key",
    wsHost: import.meta.env.VITE_REVERB_HOST || "127.0.0.1",
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || "http") === "https",
    enabledTransports: ["ws", "wss"],
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                apiClient
                    .post("/api/broadcasting/auth", {
                        socket_id: socketId,
                        channel_name: channel.name,
                    })
                    .then((response) => callback(null, response.data))
                    .catch((error) => callback(error));
            },
        };
    },
});

// Helper Waktu
const timeAgo = (dateString) => {
    if (!dateString) return "";
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
    return Math.floor(seconds) + " detik lalu";
};

// --- KOMPONEN ITEM (DESIGN MODERN) ---
const NotificationItem = ({ notification }) => {
    const navigate = useNavigate();
    const { data, created_at, read_at } = notification;
    const isUnread = read_at === null;

    const handleClick = () => {
        if (data.link) navigate(data.link);
    };

    // Ikon berdasarkan isi pesan
    const getIcon = () => {
        const msg = data.message.toLowerCase();
        if (
            msg.includes("sukses") ||
            msg.includes("dikonfirmasi") ||
            msg.includes("dijadwalkan")
        )
            return <CheckCircle2 size={24} className="text-green-500" />;
        if (
            msg.includes("ditolak") ||
            msg.includes("gagal") ||
            msg.includes("dibatalkan")
        )
            return <XCircle size={24} className="text-red-500" />;
        if (msg.includes("menunggu") || msg.includes("reschedule"))
            return <Clock size={24} className="text-orange-500" />;
        return <Bell size={24} className="text-cyan-500" />;
    };

    return (
        <div
            onClick={handleClick}
            className={`flex gap-4 p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 relative ${
                isUnread ? "bg-cyan-50/50" : "bg-white"
            }`}
        >
            <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    isUnread ? "bg-white shadow-sm" : "bg-gray-100"
                }`}
            >
                {getIcon()}
            </div>

            <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                    <p
                        className={`text-sm ${
                            isUnread
                                ? "font-bold text-gray-900"
                                : "font-medium text-gray-700"
                        }`}
                    >
                        {data.message}
                    </p>
                    {isUnread && (
                        <span className="w-2 h-2 bg-cyan-500 rounded-full mt-1.5 ml-2 shrink-0"></span>
                    )}
                </div>
                <p className="text-xs text-gray-400 font-medium">
                    {timeAgo(created_at)}
                </p>
            </div>
        </div>
    );
};

// --- HALAMAN UTAMA ---
export default function NotifikasiPage() {
    const { user: authUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Data
    useEffect(() => {
        if (!authUser) return;
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get("/api/notifications");

                // --- PERBAIKAN PENTING DI SINI ---
                // Controller Anda me-return Array langsung, bukan { data: [...] }
                // Jadi kita pakai response.data langsung.
                const notifData = Array.isArray(response.data)
                    ? response.data
                    : response.data.data || [];

                setNotifications(notifData);

                // Tandai sudah dibaca
                await apiClient.post("/api/notifications/mark-read");
            } catch (err) {
                console.error("Gagal load notif:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [authUser]);

    // 2. Real-time Listener
    useEffect(() => {
        if (!authUser) return;
        const channelName = `customer.${authUser.id}`;

        const handleNewNotification = (notification) => {
            console.log("Notif baru:", notification);
            // Tambahkan ke atas list
            setNotifications((prev) => [notification, ...prev]);
            // Tandai read di backend (opsional, atau biarkan user klik dulu)
            apiClient.post("/api/notifications/mark-read");
        };

        echo.private(channelName).notification(handleNewNotification);
        return () => echo.leave(channelName);
    }, [authUser]);

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Header Sticky Cyan */}
            <header className="sticky top-0 z-50 bg-cyan-600 text-white p-4 shadow-md flex items-center">
                <Link
                    to="/home"
                    className="absolute left-4 p-1 hover:bg-cyan-700 rounded-full transition"
                >
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-lg font-bold tracking-wide w-full text-center">
                    Notifikasi
                </h1>
            </header>

            <main className="min-h-[80vh]">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-cyan-500 rounded-full animate-spin"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 opacity-60">
                        <Bell size={64} className="mb-4 text-gray-200" />
                        <p className="font-medium">Belum ada notifikasi</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <NotificationItem key={notif.id} notification={notif} />
                    ))
                )}
            </main>
        </div>
    );
}
