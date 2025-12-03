import React, { useState, useEffect } from "react";
import { NavLink, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Fixed path: ../../context instead of ../context
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import apiClient from "../api/axios"; // Fixed path: ../../api instead of ../api
import {
    Home as CounselorHomeIcon,
    ClipboardList as CounselorHistoryIcon,
    User as CounselorProfileIcon,
    MessageSquare as CounselorScheduleIcon,
    Bell,
} from "lucide-react";

import VerificationGuard from "../components/common/VerificationGuard"; // Fixed path: ../../components instead of ../components

window.Pusher = Pusher;

// Environment variable fallback helper to avoid import.meta issues in some builds
const getEnv = (key, defaultValue) => {
    try {
        return import.meta.env[key] || defaultValue;
    } catch (e) {
        return defaultValue;
    }
};

const echo = new Echo({
    broadcaster: "reverb",
    key: getEnv("VITE_REVERB_APP_KEY", "reverb_key"),
    wsHost: getEnv("VITE_REVERB_HOST", "127.0.0.1"),
    wsPort: getEnv("VITE_REVERB_PORT", 8080),
    wssPort: getEnv("VITE_REVERB_PORT", 8080),
    forceTLS: getEnv("VITE_REVERB_SCHEME", "http") === "https",
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

const ChevronDownIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-500 ml-1"
    >
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const CustomerHomeIcon = ({ active }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        fill={active ? "currentColor" : "none"}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active ? "text-sky-500" : "text-gray-400"}
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M5 12l-2 0l9 -9l9 9l-2 0"></path>
        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"></path>
        {!active && <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"></path>}
        {active && (
            <path
                d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"
                fill="currentColor"
            ></path>
        )}
    </svg>
);

const CustomerCounselingIcon = ({ active }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active ? "text-sky-500" : "text-gray-400"}
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1"></path>
        <path d="M8 12h8"></path>
        <path d="M8 9h6"></path>
    </svg>
);

const CustomerHistoryIcon = ({ active }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active ? "text-sky-500" : "text-gray-400"}
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2"></path>
        <path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z"></path>
        <path d="M9 12l.01 0"></path>
        <path d="M13 12l2 0"></path>
        <path d="M9 16l.01 0"></path>
        <path d="M13 16l2 0"></path>
    </svg>
);

const CustomerProfileIcon = ({ active }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active ? "text-sky-500" : "text-gray-400"}
    >
        <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
        <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"></path>
        <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"></path>
    </svg>
);

const CounselorNavBar = () => (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white shadow-lg border-t border-gray-200 z-40">
        <div className="flex justify-around items-center h-16">
            <NavLink
                to="/counselor/home"
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 py-1 flex-1 ${
                        isActive ? "text-sky-500" : "text-gray-500"
                    } hover:text-sky-500`
                }
            >
                <CounselorHomeIcon size={24} />
                <span className="text-xs">Beranda</span>
            </NavLink>
            <NavLink
                to="/counselor/schedule"
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 py-1 flex-1 ${
                        isActive ? "text-sky-500" : "text-gray-500"
                    } hover:text-sky-500`
                }
            >
                <CounselorScheduleIcon size={24} />
                <span className="text-xs">Jadwal</span>
            </NavLink>
            <NavLink
                to="/counselor/history"
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 py-1 flex-1 ${
                        isActive ? "text-sky-500" : "text-gray-500"
                    } hover:text-sky-500`
                }
            >
                <CounselorHistoryIcon size={24} />
                <span className="text-xs">Riwayat</span>
            </NavLink>
            <NavLink
                to="/counselor/profile"
                className={({ isActive }) =>
                    `flex flex-col items-center gap-1 py-1 flex-1 ${
                        isActive ? "text-sky-500" : "text-gray-500"
                    } hover:text-sky-500`
                }
            >
                <CounselorProfileIcon size={24} />
                <span className="text-xs">Profile</span>
            </NavLink>
        </div>
    </nav>
);

const CustomerBottomNavItem = ({ to, icon, label, active }) => (
    <NavLink
        to={to}
        className="flex flex-col items-center justify-center gap-1 flex-1 py-1"
    >
        {icon}
        <span
            className={`text-xs ${
                active ? "text-sky-500 font-bold" : "text-gray-500"
            }`}
        >
            {label}
        </span>
    </NavLink>
);

const CustomerNavBar = ({ currentPath }) => (
    <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 shadow-[0_-1px_4px_rgba(0,0,0,0.05)] z-40">
        <div className="flex justify-around items-center h-16">
            <CustomerBottomNavItem
                to="/home"
                icon={<CustomerHomeIcon active={currentPath === "/home"} />}
                label="Home"
                active={currentPath === "/home"}
            />
            <CustomerBottomNavItem
                to="/booking"
                icon={
                    <CustomerCounselingIcon
                        active={currentPath.startsWith("/booking")}
                    />
                }
                label="Booking"
                active={currentPath.startsWith("/booking")}
            />
            <CustomerBottomNavItem
                to="/history"
                icon={
                    <CustomerHistoryIcon
                        active={currentPath.startsWith("/history")}
                    />
                }
                label="History"
                active={currentPath.startsWith("/history")}
            />
            <CustomerBottomNavItem
                to="/profile"
                icon={
                    <CustomerProfileIcon
                        active={currentPath.startsWith("/profile")}
                    />
                }
                label="Profile"
                active={currentPath.startsWith("/profile")}
            />
        </div>
    </footer>
);

// Header dihapus di sini karena sudah ada di HomePage
const CustomerHeader = ({ user, unreadCount }) => (
    <header className="p-4 flex items-center justify-between sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-3">
            <img
                src={
                    user?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${
                        user?.name || "User"
                    }&background=EBF4FF&color=3B82F6&bold=true`
                }
                alt="User Avatar"
                className="w-11 h-11 rounded-full object-cover border-2 border-gray-100 shadow-sm"
            />
            <div>
                <h1 className="text-base text-gray-800 font-bold leading-tight">
                    {user?.name || "Pengguna"}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                    {user?.city || "Indonesia"}
                </p>
            </div>
        </div>

        <NavLink
            to="/notifications"
            className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 transition-all active:scale-95 relative border border-gray-100"
        >
            <Bell className="w-5 h-5" strokeWidth={2.5} />
            {unreadCount > 0 && (
                <span className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
        </NavLink>
    </header>
);

export default function MobileLayout() {
    const { user, setUser, getUser } = useAuth();
    const location = useLocation();
    const currentPath = location.pathname;
    const isCounselor =
        user &&
        (user.role?.includes("konselor") || user.role?.includes("counselor"));

    // FALSE agar header layout TIDAK muncul di halaman Home.
    // Halaman Home sekarang menggunakan header-nya sendiri (CustomerHeader di HomePage.jsx).
    const showCustomerHeader = false;

    const [unreadCount, setUnreadCount] = useState(0);

    // Mekanisme Auto-Check (Polling)
    useEffect(() => {
        let intervalId;

        if (
            user &&
            (user.status === "Verifikasi" ||
                user.status === "Menunggu Verifikasi")
        ) {
            console.log(
                "⏳ Status masih Verifikasi. Mengaktifkan auto-check..."
            );
            intervalId = setInterval(() => {
                getUser();
            }, 3000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [user?.status, getUser]);

    // Fetch Unread Count
    useEffect(() => {
        if (user && !isCounselor && location.pathname !== "/notifications") {
            apiClient
                .get("/api/notifications/status")
                .then((res) => setUnreadCount(res.data.unreadCount))
                .catch((err) =>
                    console.error("Gagal fetch status notif:", err)
                );
        } else if (location.pathname === "/notifications") {
            setUnreadCount(0);
        }
    }, [user, isCounselor, location.pathname]);

    // Listener Real-time
    useEffect(() => {
        if (!user) return;

        const channelName = isCounselor
            ? `counselor.${user.id}`
            : `customer.${user.id}`;
        const userChannelName = `user.${user.id}`;

        console.log(`MobileLayout: Mendengarkan channel '${channelName}'...`);

        // Listener Notifikasi
        echo.private(channelName).notification((notification) => {
            setUnreadCount((prevCount) => prevCount + 1);
        });

        // Listener Status User (WebSocket)
        echo.private(userChannelName).listen(".UserStatusUpdated", (e) => {
            console.log("⚡ STATUS UPDATE DITERIMA VIA SOCKET:", e.user.status);
            if (setUser) {
                setUser((prevUser) => ({
                    ...prevUser,
                    status: e.user.status,
                    alasan_ditolak: e.user.alasan_ditolak,
                }));
            }
        });

        return () => {
            echo.leave(channelName);
            echo.leave(userChannelName);
        };
    }, [user?.id, isCounselor, setUser]);

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            {/* Guard Overlay */}
            {user && (
                <VerificationGuard
                    status={user.status}
                    userRole={user.role}
                    reason={user.alasan_ditolak}
                />
            )}

            <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col relative">
                {showCustomerHeader && (
                    <CustomerHeader user={user} unreadCount={unreadCount} />
                )}

                <main className="flex-grow pb-20">
                    <Outlet />
                </main>
            </div>

            {isCounselor ? (
                <CounselorNavBar />
            ) : (
                <CustomerNavBar currentPath={currentPath} />
            )}
        </div>
    );
}
