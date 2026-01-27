import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
    FileCheck,
    MapPin,
    Clock,
    Tag,
    Receipt,
    MessageCircleQuestion,
    Wallet,
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

    // Fungsi cek aktif
    const checkActive = (item) => {
        if (item.children) {
            return item.children.some(
                (child) =>
                    location.pathname === child.path ||
                    location.pathname.startsWith(child.path),
            );
        }
        return (
            location.pathname === item.path ||
            (location.pathname.startsWith(item.path) &&
                item.path !== "/admin/dashboard")
        );
    };

    // --- STRUKTUR MENU UTAMA (Unified /Admin) ---
    // Kita menyusun satu array besar, nanti kita filter berdasarkan role
    const allMenuItems = [
        {
            section: "Utama",
            items: [
                {
                    label: "Dashboard",
                    path: "/admin/dashboard",
                    icon: LayoutDashboard,
                    roles: ["super-admin", "admin"], // Bisa diakses kedua role
                },
            ],
        },
        {
            section: "Validasi & Operasional",
            items: [
                {
                    label: "Verifikasi Data",
                    icon: FileCheck,
                    roles: ["super-admin", "admin"],
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
                {
                    label: "Semua Pesanan",
                    path: "/admin/booking-management",
                    icon: ShoppingCart,
                    roles: ["super-admin", "admin"],
                },
                {
                    label: "Manajemen Refund",
                    path: "/admin/refund-management", // Ubah path jadi admin
                    icon: Receipt,
                    roles: ["super-admin"], // Biasanya Super Admin, tapi bisa disesuaikan
                },
            ],
        },
        {
            section: "Laporan Keuangan",
            items: [
                {
                    label: "Keuangan & Payout",
                    path: "/admin/keuangan", // Ubah path jadi admin
                    icon: Wallet,
                    roles: ["super-admin", "admin"],
                },
            ],
        },
        {
            section: "Manajemen User",
            items: [
                {
                    label: "Data Admin",
                    path: "/admin/admin-management",
                    icon: UserCheck,
                    roles: ["super-admin"], // Hanya Super Admin
                },
                {
                    label: "Data Konselor",
                    path: "/admin/konselor-management",
                    icon: UserCog,
                    roles: ["super-admin", "admin"],
                },
                {
                    label: "Data Customer",
                    path: "/admin/customer-management",
                    icon: Users,
                    roles: ["super-admin", "admin"],
                },
            ],
        },
        {
            section: "Master Data", // Pengaturan Sistem biasanya ditaruh di bawah
            items: [
                {
                    label: "Pengaturan Sistem",
                    icon: Settings,
                    roles: ["super-admin"], // Biasanya hanya Super Admin
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
                        {
                            label: "Metode Pembayaran",
                            path: "/admin/payment-methods",
                            icon: CreditCard,
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
                    path: "/admin/help/conversations",
                    icon: MessageCircleQuestion,
                    roles: ["super-admin", "admin"],
                },
            ],
        },
    ];

    return (
        <div className="pb-4">
            {allMenuItems.map((group, index) => {
                // Filter item berdasarkan role user saat ini
                const visibleItems = group.items.filter((item) =>
                    item.roles.includes(role),
                );

                // Jika tidak ada item yang visible di section ini, jangan render section-nya
                if (visibleItems.length === 0) return null;

                return (
                    <div key={index}>
                        <SectionHeader label={group.section} />
                        <div className="space-y-1">
                            {visibleItems.map((item) =>
                                item.children ? (
                                    <NavDropdown
                                        key={item.label}
                                        item={item}
                                        isActive={checkActive(item)}
                                    />
                                ) : (
                                    <NavItem key={item.path} item={item} />
                                ),
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// === SIDEBAR UTAMA ===
export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (window.confirm("Apakah Anda yakin ingin keluar?")) {
            await logout();
            navigate("/admin/login");
        }
    };

    return (
        <aside className="fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white flex flex-col z-50 shadow-2xl">
            {/* Header Sidebar */}
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

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
                <SidebarMenu role={user?.role} />
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-800 bg-gray-900">
                <button
                    onClick={handleLogout}
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
