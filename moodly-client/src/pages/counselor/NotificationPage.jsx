import React from "react";
import { Link } from "react-router-dom";

// --- Komponen Ikon SVG ---
const ArrowLeftIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-700"
    >
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

// Komponen untuk satu item notifikasi
const NotificationItem = ({ title, date, message }) => (
    <div className="flex items-start gap-4 p-4 border-b border-gray-200">
        <div className="flex-shrink-0">
            <img
                src="https://placehold.co/48x48/E0F2FE/38BDF8?text=👤"
                alt="avatar"
                className="w-12 h-12 rounded-full border-2 border-cyan-300"
            />
        </div>
        <div className="flex-grow">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800">{title}</h3>
                <p className="text-xs text-gray-500">{date}</p>
            </div>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
        </div>
    </div>
);

// Komponen utama halaman notifikasi
export default function NotifikasiPage() {
    const notifications = [
        {
            id: 1,
            title: "Hi Fiya!",
            date: "Dec 12, 2025",
            message:
                "Untuk link gmeet sesimu https://meet.google.com/iyah-yahyah-bro?authuser=1 segera bergabung untuk memulai sesi curhatmu",
        },
        {
            id: 2,
            title: "Hi Fiya!",
            date: "Dec 12, 2025",
            message:
                "Sesimu akan di ganti jadwal oleh psikolog segera konfirmasi sekarang",
        },
        {
            id: 3,
            title: "Hi Fiya!",
            date: "Dec 12, 2025",
            message:
                "Segera lakukan curhat dengan konseler pilihanmu, sebelum sesi curhatmu habis",
        },
        {
            id: 4,
            title: "Hi Fiya!",
            date: "Dec 12, 2025",
            message:
                "Ikuti sosialisai dengan dokter praprami,sosialisai ini akan membahas tentang mental health, untuk melakukan pendaftaran https://forms.gle/21212345",
        },
    ];

    return (
        // Wrapper utama dihapus, hanya menyisakan konten spesifik halaman
        <>
            <header className="p-4 flex items-center gap-4 sticky top-0 z-10 bg-white shadow-sm">
                <Link to="/beranda">
                    <ArrowLeftIcon />
                </Link>
                <h1 className="text-xl font-bold text-gray-800">Notifikasi</h1>
            </header>
            <main>
                {notifications.map((notif) => (
                    <NotificationItem
                        key={notif.id}
                        title={notif.title}
                        date={notif.date}
                        message={notif.message}
                    />
                ))}
            </main>
        </>
    );
}
