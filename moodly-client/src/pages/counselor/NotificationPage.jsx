import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import {
    Bell,
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    User,
    ChevronLeft,
} from "lucide-react";

window.Pusher = Pusher;

// --- 1. CONFIG ECHO (SAMA DENGAN CUSTOMER) ---
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
    if (interval > 1) return Math.floor(interval) + " thn lalu";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bln lalu";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hr lalu";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mnt lalu";
    return Math.floor(seconds) + " dtk lalu";
};

// --- KOMPONEN ITEM NOTIFIKASI (KONSELOR STYLE) ---
const NotificationItem = ({ notification }) => {
    const navigate = useNavigate();
    const { data, created_at, read_at } = notification;
    const isUnread = read_at === null;

    const handleClick = () => {
        if (data.link) navigate(data.link);
    };

    // Ikon berdasarkan konteks pesan
    const getIcon = () => {
        const msg = data.message?.toLowerCase() || "";
        if (msg.includes("baru") || msg.includes("dijadwalkan"))
            return <Calendar size={24} className="text-cyan-600" />;
        if (msg.includes("batal") || msg.includes("cancelled"))
            return <XCircle size={24} className="text-red-500" />;
        if (msg.includes("reschedule") || msg.includes("jadwal ulang"))
            return <Clock size={24} className="text-orange-500" />;
        if (msg.includes("selesai"))
            return <CheckCircle2 size={24} className="text-green-500" />;
        return <User size={24} className="text-blue-500" />;
    };

    return (
        <div
            onClick={handleClick}
            className={`flex gap-4 p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 relative ${
                isUnread ? "bg-cyan-50/40" : "bg-white"
            }`}
        >
            {/* Indikator Unread */}
            {isUnread && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full"></div>
            )}

            <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isUnread ? "bg-white shadow-sm" : "bg-gray-100"
                }`}
            >
                {getIcon()}
            </div>

            <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                    <h3
                        className={`text-sm ${
                            isUnread
                                ? "font-bold text-gray-900"
                                : "font-semibold text-gray-700"
                        }`}
                    >
                        {data.title || "Info Sistem"}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                        {timeAgo(created_at)}
                    </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {data.message}
                </p>
            </div>
        </div>
    );
};

// --- KOMPONEN HALAMAN UTAMA ---
export default function CounselorNotificationPage() {
    const { user: authUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Data Awal
    useEffect(() => {
        if (!authUser) return;
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get("/api/notifications");
                // Menangani format array vs object response
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

    // 2. Real-time Listener (Reverb)
    useEffect(() => {
        if (!authUser) return;
        // Channel konselor menggunakan format: counselor.{id}
        // Pastikan di routes/channels.php definisinya benar, atau gunakan user.{id} jika shared
        // Mari kita asumsikan Anda pakai 'counselor.{id}' untuk pemisahan,
        // ATAU jika Auth::user()->id unik global, pakai 'App.Models.User.{id}' standar Laravel.
        // Berdasarkan kode sebelumnya: `customer.{id}`. Kita coba samakan pola.

        // PENTING: Cek channel name di backend Anda nanti.
        // Jika pakai Auth::user(), biasanya channelnya private-user.{id}
        const channelName = `counselor.${authUser.id}`;

        console.log(`Mendengarkan channel: ${channelName}`);

        const handleNewNotification = (notification) => {
            console.log("Notif Konselor Baru:", notification);
            setNotifications((prev) => [notification, ...prev]);
            apiClient.post("/api/notifications/mark-read");
        };

        echo.private(channelName).notification(handleNewNotification);

        return () => echo.leave(channelName);
    }, [authUser]);

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Header Sticky */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 p-4 shadow-sm flex items-center justify-center">
                <Link
                    to="/counselor/home"
                    className="absolute left-4 p-1 hover:bg-gray-100 rounded-full transition"
                >
                    <ChevronLeft size={24} className="text-gray-600" />
                </Link>
                <h1 className="text-lg font-bold tracking-tight text-gray-800">
                    Notifikasi Masuk
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
                        <p className="font-medium text-sm">
                            Belum ada notifikasi baru.
                        </p>
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
