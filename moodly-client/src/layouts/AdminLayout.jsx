import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import apiClient from "../api/axios";
import {
    Bell,
    X,
    RefreshCw,
    FileText, // Ikon Refund
    UserCheck, // Ikon Konselor Baru
    CreditCard, // Ikon Payout/Gaji
    AlertTriangle, // Ikon Warning (Gmeet)
} from "lucide-react";

window.Pusher = Pusher;

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

const NotificationToast = ({ notification, onClose }) => {
    // Default Style (Info)
    let borderColor = "border-[#00D1FF]";
    let iconBg = "bg-cyan-50";
    let IconComp = Bell;
    let iconColor = "text-[#00D1FF]";

    // Logika Warna Berdasarkan Tipe
    if (notification?.type === "cancel") {
        borderColor = "border-red-500";
        iconBg = "bg-red-50";
        IconComp = X;
        iconColor = "text-red-500";
    } else if (notification?.type === "reschedule") {
        borderColor = "border-yellow-500";
        iconBg = "bg-yellow-50";
        IconComp = RefreshCw;
        iconColor = "text-yellow-600";
    } else if (notification?.type === "refund_request") {
        borderColor = "border-purple-500";
        iconBg = "bg-purple-50";
        IconComp = FileText;
        iconColor = "text-purple-600";
    } else if (notification?.type === "new_counselor") {
        borderColor = "border-blue-600";
        iconBg = "bg-blue-50";
        IconComp = UserCheck;
        iconColor = "text-blue-600";
    } else if (notification?.type === "payout_request") {
        borderColor = "border-emerald-500";
        iconBg = "bg-emerald-50";
        IconComp = CreditCard;
        iconColor = "text-emerald-600";
    } else if (notification?.type === "missing_link") {
        borderColor = "border-orange-500";
        iconBg = "bg-orange-50";
        IconComp = AlertTriangle;
        iconColor = "text-orange-600 animate-pulse";
    }

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: 50 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="fixed top-6 right-6 z-[9999] w-full max-w-sm"
                >
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            // Jika user klik toast, jalankan aksi tutup (atau bisa navigasi juga jika mau)
                            onClose();
                        }}
                        className={`bg-white/90 backdrop-blur-md border-l-4 ${borderColor} rounded-lg shadow-2xl p-4 flex items-start gap-3 cursor-pointer hover:bg-white transition`}
                    >
                        <div
                            className={`flex-shrink-0 p-2 ${iconBg} rounded-full`}
                        >
                            <IconComp className={`w-5 h-5 ${iconColor}`} />
                        </div>
                        <div className="flex-1 pt-1">
                            <h4 className="text-gray-900 font-bold text-sm">
                                {notification.title}
                            </h4>
                            <p className="text-gray-600 text-xs mt-1 leading-relaxed line-clamp-2">
                                {notification.message}
                            </p>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default function AdminLayout() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [toastData, setToastData] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const response = await apiClient.get("/api/notifications");
            const formatted = response.data.map((n) => ({
                id: n.id,
                type: n.type,
                data: n.data,
                read_at: n.read_at,
                created_at: n.created_at,
                title: n.data.title || "Info Sistem",
                message: n.data.message || "Notifikasi baru diterima",
                link: n.data.link || n.data.url || "#", // Support 'link' atau 'url'
            }));
            setNotifications(formatted);
            setUnreadCount(formatted.filter((n) => !n.read_at).length);
        } catch (error) {
            console.error("Gagal fetch notifikasi:", error);
        }
    };

    useEffect(() => {
        if (user) fetchNotifications();
    }, [user]);

    // --- FUNGSI KLIK NOTIFIKASI (NAVIGASI) ---
    const handleNotificationClick = async (notif) => {
        // 1. Tandai sudah dibaca di backend
        if (!notif.isRealTime && !notif.read_at) {
            try {
                await apiClient.post("/api/notifications/mark-read", {
                    id: notif.id,
                });
            } catch (error) {
                console.error(error);
            }
        }

        // 2. Update state lokal
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === notif.id
                    ? { ...n, read_at: new Date().toISOString() }
                    : n
            )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setIsDropdownOpen(false);

        // 3. LOGIKA NAVIGASI (PRIORITASKAN LINK LANGSUNG)
        if (notif.link && notif.link !== "#") {
            navigate(notif.link);
        } else if (notif.data?.booking_id) {
            navigate(`/admin/booking-management/${notif.data.booking_id}`);
        }
    };

    // --- LISTENER WEBSOCKET REAL-TIME ---
    useEffect(() => {
        if (user?.role === "admin" || user?.role === "super-admin") {
            const channelName = "admin-notifications";
            console.log(`📡 Admin: Listening to ${channelName}...`);
            const channel = echo.private(channelName);

            // Fungsi Helper untuk Mencegah Duplikat
            const handleNewNotification = (newNotif) => {
                setNotifications((prev) => {
                    // Cek jika ID sudah ada di list
                    const exists = prev.some((n) => n.id === newNotif.id);
                    if (exists) return prev; // Jangan tambah jika sudah ada
                    return [newNotif, ...prev];
                });

                // Update badge & Toast
                setUnreadCount((prev) => prev + 1);
                setToastData(newNotif);

                // Bunyi notifikasi (opsional)
                // const audio = new Audio('/sounds/notification.mp3');
                // audio.play().catch(e => console.log("Audio play failed"));

                setTimeout(() => setToastData(null), 8000);
            };

            // 1. Pembayaran Masuk
            channel.listen(".PaymentProofUploaded", (e) => {
                handleNewNotification({
                    id: `pay-${e.booking.id}-${Date.now()}`,
                    title: "Pembayaran Masuk",
                    message: `${e.booking.customer.name} mengunggah bukti bayar #${e.booking.id}`,
                    link: `/admin/booking-management/${e.booking.id}`,
                    read_at: null,
                    created_at: new Date().toISOString(),
                    isRealTime: true,
                    type: "payment",
                });
            });

            // 2. Pembatalan Booking
            channel.listen(".BookingCancelled", (e) => {
                handleNewNotification({
                    id: `cancel-${e.booking.id}-${Date.now()}`,
                    title: "Pesanan Dibatalkan",
                    message: `${e.booking.customer.name} membatalkan pesanan #${e.booking.id}`,
                    link: `/admin/booking-management/${e.booking.id}`,
                    read_at: null,
                    created_at: new Date().toISOString(),
                    isRealTime: true,
                    type: "cancel",
                });
            });

            // 3. Reschedule Request
            channel.listen(".RescheduleRequested", (e) => {
                handleNewNotification({
                    id: `resched-${e.booking.id}-${Date.now()}`,
                    title: "Pengajuan Reschedule",
                    message: `${e.booking.customer.name} meminta jadwal baru untuk #${e.booking.id}`,
                    link: `/admin/jadwal-konsultasi/${e.booking.id}`,
                    read_at: null,
                    created_at: new Date().toISOString(),
                    isRealTime: true,
                    type: "reschedule",
                });
            });

            // 4. Refund Request
            channel.listen(".RefundRequested", (e) => {
                handleNewNotification({
                    id: `refund-${e.refund.id}-${Date.now()}`,
                    title: "Pengajuan Refund",
                    message:
                        "Ada pengajuan refund baru dari Customer. Harap tinjau.",
                    link: "/super-admin/refund-management",
                    read_at: null,
                    created_at: new Date().toISOString(),
                    isRealTime: true,
                    type: "refund_request",
                });
            });

            // 5. Konselor Baru
            channel.listen(".NewCounselorRegistered", (e) => {
                handleNewNotification({
                    id: `counselor-${e.user.id}-${Date.now()}`,
                    title: "Pendaftaran Konselor",
                    message: `${e.user.name} mendaftar sebagai konselor.`,
                    link: `/admin/verifikasi-konselor`,
                    read_at: null,
                    created_at: new Date().toISOString(),
                    isRealTime: true,
                    type: "new_counselor",
                });
            });

            // 6. Payout / Gaji Konselor
            channel.listen(".PayoutActionRequired", (e) => {
                handleNewNotification({
                    id: `payout-${e.booking.id}-${Date.now()}`,
                    title: "Pembayaran Gaji Diperlukan",
                    message: `Sesi #${e.booking.id} selesai. Harap proses gaji.`,
                    link: `/super-admin/keuangan`,
                    read_at: null,
                    created_at: new Date().toISOString(),
                    isRealTime: true,
                    type: "payout_request",
                });
            });

            // 7. Missing Gmeet Link (Opsional jika via broadcast)
            // Jika Notification class tidak membroadcast ke 'admin-notifications'
            // maka block ini mungkin tidak terpanggil lewat pusher, tapi akan muncul
            // saat admin refresh page (karena masuk DB).
            channel.listen(".MissingGmeetLinkNotification", (e) => {
                handleNewNotification({
                    id: `missing-${Date.now()}`,
                    title: "Link GMeet Belum Ada!",
                    message:
                        "Segera isi link meeting untuk sesi yang akan mulai!",
                    link: `/admin/booking-management/${e.booking_id}`, // Sesuaikan data dari event
                    read_at: null,
                    created_at: new Date().toISOString(),
                    isRealTime: true,
                    type: "missing_link",
                });
            });

            return () => {
                echo.leave(channelName);
            };
        }
    }, [user]);

    // Listener klik luar dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            )
                setIsDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const roleDisplay = "ADMINISTRATOR";
    const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        user?.name || "A"
    )}&background=EBF4FF&color=00D1FF&bold=true&size=128`;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64 relative h-full overflow-y-auto bg-[#F3F4F6]">
                <NotificationToast
                    notification={toastData}
                    onClose={() => setToastData(null)}
                />

                <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-8 py-4 flex justify-between items-center">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                            {roleDisplay}
                        </h2>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                            Selamat Datang kembali, {user?.name}!
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-[#00D1FF] focus-within:bg-white focus-within:ring-2 focus-within:ring-cyan-100 transition-all w-64">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                placeholder="Cari data..."
                                className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-700 placeholder-gray-400"
                            />
                        </div>

                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() =>
                                    setIsDropdownOpen(!isDropdownOpen)
                                }
                                className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#00D1FF] transition-colors outline-none"
                            >
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                                )}
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{
                                            opacity: 0,
                                            y: 10,
                                            scale: 0.95,
                                        }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{
                                            opacity: 0,
                                            y: 10,
                                            scale: 0.95,
                                        }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                                    >
                                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                            <h3 className="text-sm font-bold text-gray-700">
                                                Notifikasi
                                            </h3>
                                            {unreadCount > 0 && (
                                                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                                                    {unreadCount} Baru
                                                </span>
                                            )}
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                                            {notifications.length === 0 ? (
                                                <div className="p-6 text-center text-gray-400 text-xs">
                                                    Tidak ada notifikasi saat
                                                    ini.
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        onClick={() =>
                                                            handleNotificationClick(
                                                                notif
                                                            )
                                                        }
                                                        className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-blue-50 transition-colors flex gap-3 items-start ${
                                                            !notif.read_at
                                                                ? "bg-blue-50 border-l-4 border-l-blue-500"
                                                                : "bg-white opacity-60 hover:opacity-100"
                                                        }`}
                                                    >
                                                        <div
                                                            className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                                                !notif.read_at
                                                                    ? "bg-blue-500"
                                                                    : "bg-gray-300"
                                                            }`}
                                                        ></div>
                                                        <div>
                                                            <p
                                                                className={`text-xs ${
                                                                    !notif.read_at
                                                                        ? "font-bold text-gray-800"
                                                                        : "text-gray-600"
                                                                }`}
                                                            >
                                                                {notif.title}
                                                            </p>
                                                            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                                                                {notif.message}
                                                            </p>
                                                            <span className="text-[10px] text-gray-400 mt-1 block">
                                                                {new Date(
                                                                    notif.created_at
                                                                ).toLocaleDateString()}{" "}
                                                                •{" "}
                                                                {new Date(
                                                                    notif.created_at
                                                                ).toLocaleTimeString(
                                                                    [],
                                                                    {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    }
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="p-2 bg-gray-50 text-center border-t border-gray-100">
                                            <button className="text-xs text-blue-600 font-semibold hover:underline">
                                                Lihat Semua
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                            <div className="text-right hidden lg:block">
                                <p className="text-sm font-bold text-gray-800">
                                    {user?.name}
                                </p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                                    {user?.role}
                                </p>
                            </div>
                            <img
                                src={user?.avatar_url || avatarFallback}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = avatarFallback;
                                }}
                            />
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 relative">
                    <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent -z-10 pointer-events-none"></div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>

                <footer className="px-8 py-6 text-center text-xs text-gray-400 border-t border-gray-200 bg-gray-50">
                    &copy; {new Date().getFullYear()} Moodly Admin Panel. All
                    rights reserved.
                </footer>
            </div>
        </div>
    );
}
