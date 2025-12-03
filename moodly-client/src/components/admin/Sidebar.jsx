import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// --- IMPORT IKON DARI LUCIDE ---
import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    UserCog,
    UserCheck,
    Settings,
    LogOut,
    ChevronDown,
    ChevronRight,
    CreditCard,
    CalendarRange,
    FileCheck,
    MapPin,
    Clock,
    Tag,
    Receipt,
    MessageCircleQuestion,
    Wallet, // <-- Ikon Baru untuk Keuangan
} from "lucide-react";

// --- KOMPONEN SECTION HEADER ---
const SectionHeader = ({ label }) => (
    <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
    </div>
);

// --- KOMPONEN NAV ITEM ---
const NavItem = ({ item, isChild = false }) => (
    <NavLink
        to={item.path}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-all duration-200
            ${
                isChild
                    ? "pl-11 text-gray-400 hover:text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }
            ${
                isActive
                    ? isChild
                        ? "!text-blue-400 font-bold"
                        : "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                    : ""
            }`
        }
    >
        {({ isActive }) => (
            <>
                {item.icon && (
                    <item.icon
                        size={isChild ? 16 : 20}
                        className={isActive ? "text-white" : "text-gray-400"}
                    />
                )}
                <span>{item.label}</span>
            </>
        )}
    </NavLink>
);

// --- KOMPONEN DROPDOWN ---
const NavDropdown = ({ item, isActive }) => {
    const [isOpen, setIsOpen] = useState(isActive);

    useEffect(() => {
        if (isActive) setIsOpen(true);
    }, [isActive]);

    return (
        <div className="mx-2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex justify-between items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200
                ${
                    isActive
                        ? "text-white bg-gray-800"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
            >
                <div className="flex items-center gap-3">
                    {item.icon && (
                        <item.icon
                            size={20}
                            className={
                                isActive ? "text-blue-400" : "text-gray-400"
                            }
                        />
                    )}
                    <span>{item.label}</span>
                </div>
                {isOpen ? (
                    <ChevronDown size={16} />
                ) : (
                    <ChevronRight size={16} />
                )}
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="mt-1 space-y-0.5">
                    {item.children.map((child) => (
                        <NavItem key={child.path} item={child} isChild={true} />
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- MENU DEFINITIONS ---
const SidebarMenu = ({ role }) => {
    const location = useLocation();

    const checkActive = (item) => {
        if (item.children) {
            return item.children.some(
                (child) =>
                    location.pathname === child.path ||
                    location.pathname.startsWith(child.path)
            );
        }
        return (
            location.pathname === item.path ||
            (location.pathname.startsWith(item.path) &&
                item.path !== "/admin/dashboard")
        );
    };

    // --- MENU SUPER ADMIN ---
    const superAdminStructure = [
        {
            section: "Utama",
            items: [
                {
                    label: "Dashboard",
                    path: "/super-admin/dashboard", // Pastikan path dashboard super admin benar
                    icon: LayoutDashboard,
                },
            ],
        },
        {
            section: "Laporan", // <-- SECTION BARU
            items: [
                {
                    label: "Laporan Keuangan",
                    path: "/super-admin/keuangan",
                    icon: Wallet,
                },
            ],
        },
        {
            section: "Transaksi",
            items: [
                {
                    label: "Pesanan Booking",
                    path: "/admin/booking-management",
                    icon: ShoppingCart,
                },
                {
                    label: "Manajemen Refund",
                    path: "/super-admin/refund-management",
                    icon: Receipt,
                },
                {
                    label: "Metode Pembayaran",
                    path: "/admin/payment-methods",
                    icon: CreditCard,
                },
            ],
        },
        {
            section: "Pengguna",
            items: [
                {
                    label: "Konselor",
                    path: "/admin/konselor-management",
                    icon: UserCog,
                },
                {
                    label: "Customer",
                    path: "/admin/customer-management",
                    icon: Users,
                },
                {
                    label: "Admin",
                    path: "/admin/admin-management",
                    icon: UserCheck,
                },
            ],
        },
        {
            section: "Master Data",
            items: [
                {
                    label: "Pengaturan Konseling",
                    icon: Settings,
                    children: [
                        {
                            label: "Jenis Konseling",
                            path: "/admin/jenis-konseling",
                            icon: Tag,
                        },
                        {
                            label: "Durasi Sesi",
                            path: "/admin/durasi-konseling",
                            icon: Clock,
                        },
                        {
                            label: "Tempat Praktik",
                            path: "/admin/tempat-konseling",
                            icon: MapPin,
                        },
                    ],
                },
            ],
        },
        {
            section: "Dukungan",
            items: [
                {
                    label: "Pusat Bantuan",
                    path: "/super-admin/help-center",
                    icon: MessageCircleQuestion,
                },
            ],
        },
    ];

    // --- MENU ADMIN ---
    const adminStructure = [
        {
            section: "Utama",
            items: [
                {
                    label: "Dashboard",
                    path: "/admin/dashboard",
                    icon: LayoutDashboard,
                },
            ],
        },
        {
            section: "Operasional",
            items: [
                {
                    label: "Jadwal Konsultasi",
                    path: "/admin/jadwal-konsultasi",
                    icon: CalendarRange,
                },
            ],
        },
        {
            section: "Verifikasi",
            items: [
                {
                    label: "Verifikasi Data",
                    icon: FileCheck,
                    children: [
                        {
                            label: "Konselor Baru",
                            path: "/admin/verifikasi-konselor",
                        },
                        {
                            label: "Customer Baru",
                            path: "/admin/verifikasi-customer",
                        },
                    ],
                },
            ],
        },
        // Admin Biasa juga bisa akses Pusat Bantuan (Optional)
        {
            section: "Dukungan",
            items: [
                {
                    label: "Pusat Bantuan",
                    path: "/admin/help/conversations", // Sesuaikan route admin chat
                    icon: MessageCircleQuestion,
                },
            ],
        },
    ];

    const menuStructure =
        role === "super-admin" ? superAdminStructure : adminStructure;

    return (
        <div className="pb-4">
            {menuStructure.map((group, index) => (
                <div key={index}>
                    <SectionHeader label={group.section} />
                    <div className="space-y-1">
                        {group.items.map((item) =>
                            item.children ? (
                                <NavDropdown
                                    key={item.label}
                                    item={item}
                                    isActive={checkActive(item)}
                                />
                            ) : (
                                <NavItem key={item.path} item={item} />
                            )
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

// === SIDEBAR UTAMA ===
export default function Sidebar() {
    const { user, logout } = useAuth();

    return (
        <aside className="fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white flex flex-col z-50 shadow-2xl">
            <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
                <div>
                    <h1 className="text-xl font-extrabold tracking-wider text-white">
                        MOODLY<span className="text-blue-500">.</span>
                    </h1>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-0.5">
                        {user?.role?.replace("-", " ") || "Admin Panel"}
                    </p>
                </div>
            </div>

            {/* Area Menu Scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
                <SidebarMenu role={user?.role} />
            </div>

            {/* Footer Logout */}
            <div className="p-4 border-t border-gray-800 bg-gray-900">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
                >
                    <LogOut
                        size={20}
                        className="group-hover:-translate-x-1 transition-transform"
                    />
                    <span className="text-sm font-medium">Keluar</span>
                </button>
            </div>
        </aside>
    );
}
