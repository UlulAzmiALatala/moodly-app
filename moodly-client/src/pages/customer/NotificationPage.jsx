import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
    Bell,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronLeft,
    Info,
} from "lucide-react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

// --- CONFIG ECHO (Sesuaikan dengan .env Anda) ---
const echo = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
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

// Helper Waktu (Time Ago)
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
    return "Baru saja";
};

// --- KOMPONEN ITEM ---
const NotificationItem = ({ notification }) => {
    const navigate = useNavigate();
    const { data, created_at, read_at } = notification;
    const isUnread = read_at === null;

    // Handle Klik Notifikasi
    const handleClick = () => {
        // Jika ada link spesifik dari backend (misal: /history/receipt/123)
        if (data.link) {
            navigate(data.link);
        } else {
            // Default behavior jika tidak ada link (opsional)
            console.log("Notifikasi ini tidak memiliki link tujuan.");
        }
    };

    // Ikon Dinamis berdasarkan tipe notifikasi / pesan
    const getIcon = () => {
        // Cek icon dari backend dulu (jika ada)
        if (data.icon) {
            if (data.icon === "CheckCircle")
                return <CheckCircle2 size={24} className="text-green-500" />;
            if (data.icon === "XCircle")
                return <XCircle size={24} className="text-red-500" />;
            if (data.icon === "Clock")
                return <Clock size={24} className="text-orange-500" />;
        }

        // Fallback: Cek dari teks pesan
        const msg = (data.message || "").toLowerCase();
        if (
            msg.includes("sukses") ||
            msg.includes("diterima") ||
            msg.includes("disetujui")
        )
            return <CheckCircle2 size={24} className="text-green-500" />;
        if (
            msg.includes("ditolak") ||
            msg.includes("gagal") ||
            msg.includes("batal")
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
                isUnread ? "bg-cyan-50/40" : "bg-white"
            }`}
        >
            <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${
                    isUnread
                        ? "bg-white border-cyan-100 shadow-sm"
                        : "bg-gray-50 border-transparent"
                }`}
            >
                {getIcon()}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1 gap-2">
                    <p
                        className={`text-sm leading-tight truncate ${
                            isUnread
                                ? "font-bold text-gray-900"
                                : "font-medium text-gray-700"
                        }`}
                    >
                        {data.title || "Notifikasi Baru"}
                    </p>
                    {isUnread && (
                        <span className="w-2 h-2 bg-red-500 rounded-full shrink-0 mt-1"></span>
                    )}
                </div>
                <p
                    className={`text-xs leading-relaxed line-clamp-2 ${
                        isUnread ? "text-gray-700" : "text-gray-500"
                    }`}
                >
                    {data.message}
                </p>
                <p className="text-[10px] text-gray-400 font-medium mt-1.5 flex items-center gap-1">
                    <Clock size={10} /> {timeAgo(created_at)}
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

    // 1. Fetch Data Awal
    useEffect(() => {
        if (!authUser) return;
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get("/api/notifications");
                // Handle struktur response Laravel (biasanya array langsung atau object data)
                const notifData = Array.isArray(response.data)
                    ? response.data
                    : response.data.data || [];
                setNotifications(notifData);

                // Tandai sudah dibaca saat halaman dibuka (Opsional, atau saat diklik satu-satu)
                await apiClient.post("/api/notifications/mark-read");
            } catch (err) {
                console.error("Gagal load notif:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [authUser]);

    // 2. Real-time Listener (Pusher/Reverb)
    useEffect(() => {
        if (!authUser) return;

        // Channel Private Customer
        const channelName = `customer.${authUser.id}`;
        console.log(`🔌 Listening: ${channelName}`);

        const handleNewNotification = (notification) => {
            console.log("🔔 Notif Masuk:", notification);
            // Tambahkan notifikasi baru ke paling atas list
            setNotifications((prev) => [
                {
                    id: notification.id,
                    data: notification, // Struktur data dari event broadcast biasanya langsung di sini
                    created_at: new Date().toISOString(),
                    read_at: null,
                },
                ...prev,
            ]);
        };

        // Mendengarkan event notifikasi bawaan Laravel
        echo.private(channelName).notification(handleNewNotification);

        return () => echo.leave(channelName);
    }, [authUser]);

    return (
        <div className="bg-white min-h-screen">
            {/* Header Sticky Modern */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <Link
                    to="/home" // Atau navigate(-1)
                    className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition text-gray-700"
                >
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-base font-bold text-gray-800 flex-1 text-center pr-8">
                    Notifikasi
                </h1>
            </header>

            {/* Content List */}
            <main>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-3">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-cyan-500 rounded-full animate-spin"></div>
                        <p className="text-xs text-gray-400">
                            Memuat info terbaru...
                        </p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                            <Bell size={40} />
                        </div>
                        <h3 className="text-gray-900 font-bold mb-1">
                            Tidak ada notifikasi
                        </h3>
                        <p className="text-gray-400 text-sm max-w-xs">
                            Belum ada aktivitas terbaru. Notifikasi pesanan dan
                            info lainnya akan muncul di sini.
                        </p>
                    </div>
                ) : (
                    <div>
                        {notifications.map((notif) => (
                            // Pastikan key unik
                            <NotificationItem
                                key={notif.id}
                                notification={notif}
                            />
                        ))}

                        {/* Footer List Hint */}
                        <div className="p-6 text-center text-xs text-gray-300 italic">
                            Semua notifikasi ditampilkan
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
