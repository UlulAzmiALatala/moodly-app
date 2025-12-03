import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios";
import {
    Users,
    ShoppingBag,
    UserCheck,
    DollarSign,
    ChevronDown,
    ArrowRight,
    PlusCircle,
    FileText,
    CheckSquare,
    Eye,
    CreditCard, // Ikon baru
    MessageSquare, // Ikon baru
} from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
} from "recharts";

// --- Helper Format Uang ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// --- Komponen Kartu Statistik (Fixed: Text Wrapping) ---
const StatCard = ({ title, value, icon: Icon, color, iconColor }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 transition-transform hover:scale-[1.02] hover:shadow-md h-full">
        <div className={`p-4 rounded-xl flex-shrink-0 ${color}`}>
            <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500 mb-1 truncate">
                {title}
            </p>
            {/* Gunakan break-words dan leading-tight agar nominal panjang turun ke bawah */}
            <h3 className="text-2xl font-extrabold text-gray-900 break-words leading-tight">
                {value}
            </h3>
        </div>
    </div>
);

// --- Komponen Tombol Quick Action (Desain Lebih Compact) ---
const QuickActionBtn = ({
    label,
    subLabel,
    icon: Icon,
    to,
    colorClass,
    bgClass,
}) => (
    <Link
        to={to}
        className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all group"
    >
        <div
            className={`p-3 rounded-full ${bgClass} group-hover:scale-110 transition-transform`}
        >
            <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                {label}
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">{subLabel}</p>
        </div>
        <div className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
            <ArrowRight size={16} />
        </div>
    </Link>
);

// --- Komponen Status Badge ---
const StatusBadge = ({ status }) => {
    let classes = "bg-gray-100 text-gray-700";
    if (["Selesai", "SELESAI", "Dijadwalkan", "DISETUJUI"].includes(status)) {
        classes = "bg-green-100 text-green-700 border border-green-200";
    } else if (
        [
            "Batal",
            "DIBATALKAN",
            "Dibatalkan",
            "DITOLAK",
            "Pembayaran Ditolak",
        ].includes(status)
    ) {
        classes = "bg-red-100 text-red-700 border border-red-200";
    } else if (
        [
            "Proses",
            "Menunggu Pembayaran",
            "Menunggu Verifikasi",
            "MENUNGGU_KONFIRMASI_JADWAL",
        ].includes(status)
    ) {
        classes = "bg-yellow-100 text-yellow-700 border border-yellow-200";
    }
    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide whitespace-nowrap ${classes}`}
        >
            {status}
        </span>
    );
};

export default function SuperAdminDashboardPage() {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear().toString());

    // --- Fetch Data Real-time ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(
                    "/api/super-admin/dashboard-stats"
                );
                const { stats, chart_data, recent_transactions } =
                    response.data;

                setStats(stats);
                setChartData(chart_data);
                setRecentTransactions(recent_transactions);
            } catch (error) {
                console.error("Gagal load dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm font-medium">
                        Memuat data dashboard...
                    </p>
                </div>
            </div>
        );
    }

    // Data untuk Cards
    const cards = [
        {
            title: "Total Customer",
            value: stats?.total_customer || 0,
            icon: Users,
            color: "bg-cyan-50",
            iconColor: "text-cyan-600",
        },
        {
            title: "Total Pesanan",
            value: stats?.total_pesanan || 0,
            icon: ShoppingBag,
            color: "bg-green-50",
            iconColor: "text-green-600",
        },
        {
            title: "Total Konselor",
            value: stats?.total_konselor || 0,
            icon: UserCheck,
            color: "bg-indigo-50",
            iconColor: "text-indigo-600",
        },
        {
            title: "Total Pendapatan",
            value: formatCurrency(stats?.total_pendapatan || 0),
            icon: DollarSign,
            color: "bg-blue-50",
            iconColor: "text-blue-600",
        },
    ];

    return (
        <div className="space-y-8 pb-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Dashboard Overview
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Ringkasan aktivitas aplikasi Moodly hari ini.
                    </p>
                </div>
            </div>

            {/* SECTION 1: STATISTIK UTAMA (FULL WIDTH) */}
            {/* Grid ini dipisah agar tidak terganggu oleh sidebar kanan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <StatCard key={index} {...card} />
                ))}
            </div>

            {/* SECTION 2: SPLIT VIEW (GRAFIK & QUICK ACTIONS) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* KIRI: Grafik (Lebih Lebar - Span 2) */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">
                                Analitik Pemesanan
                            </h3>
                            <p className="text-sm text-gray-500">
                                Tren metode konseling {year}
                            </p>
                        </div>
                        <div className="relative">
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                            >
                                <option>{new Date().getFullYear()}</option>
                                <option>{new Date().getFullYear() - 1}</option>
                            </select>
                            <ChevronDown
                                size={16}
                                className="text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            />
                        </div>
                    </div>

                    {/* Grafik Responsif */}
                    <div className="w-full h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 0,
                                    left: -20,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#F3F4F6"
                                />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#6B7280", fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#6B7280", fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{
                                        fill: "rgba(59, 130, 246, 0.05)",
                                    }}
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        borderRadius: "12px",
                                        border: "none",
                                        boxShadow:
                                            "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                                    }}
                                    itemStyle={{
                                        fontSize: "12px",
                                        fontWeight: 500,
                                    }}
                                />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ paddingTop: "20px" }}
                                />
                                <Bar
                                    dataKey="Chat"
                                    fill="#3B82F6"
                                    radius={[4, 4, 0, 0]}
                                    barSize={30}
                                />
                                <Bar
                                    dataKey="Video Call"
                                    fill="#8B5CF6"
                                    radius={[4, 4, 0, 0]}
                                    barSize={30}
                                />
                                <Bar
                                    dataKey="Voice Call"
                                    fill="#10B981"
                                    radius={[4, 4, 0, 0]}
                                    barSize={30}
                                />
                                <Bar
                                    dataKey="Tatap Muka"
                                    fill="#F59E0B"
                                    radius={[4, 4, 0, 0]}
                                    barSize={30}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* KANAN: Quick Actions (Span 1) */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            Aksi Cepat
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            <QuickActionBtn
                                label="Verifikasi Konselor"
                                subLabel="Cek pendaftar baru"
                                icon={CheckSquare}
                                to="/admin/verifikasi-konselor"
                                colorClass="text-green-600"
                                bgClass="bg-green-50"
                            />
                            <QuickActionBtn
                                label="Manajemen Refund"
                                subLabel="Proses pengajuan dana"
                                icon={FileText}
                                to="/super-admin/refund-management"
                                colorClass="text-orange-600"
                                bgClass="bg-orange-50"
                            />
                            <QuickActionBtn
                                label="Pusat Bantuan"
                                subLabel="Balas chat customer"
                                icon={MessageSquare}
                                to="/super-admin/help-center"
                                colorClass="text-blue-600"
                                bgClass="bg-blue-50"
                            />
                            <QuickActionBtn
                                label="Metode Pembayaran"
                                subLabel="Atur rekening/QRIS"
                                icon={CreditCard}
                                to="/admin/payment-methods"
                                colorClass="text-purple-600"
                                bgClass="bg-purple-50"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 3: Tabel Transaksi Terbaru (FULL WIDTH) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">
                            Transaksi Terbaru
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Pantau 5 pesanan terakhir yang masuk
                        </p>
                    </div>
                    <Link
                        to="/admin/booking-management"
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 transition-all"
                    >
                        Lihat Semua <ArrowRight size={16} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    ID Booking
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Tanggal
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Metode
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {recentTransactions.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-8 text-center text-gray-400 text-sm italic"
                                    >
                                        Belum ada transaksi terbaru.
                                    </td>
                                </tr>
                            ) : (
                                recentTransactions.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50/50 transition-colors group cursor-default"
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 text-xs border border-gray-200">
                                                #{item.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(
                                                item.tanggal_konsultasi
                                            ).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm">
                                                    {item.customer?.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {item.customer?.name}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {item.customer?.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 text-xs font-medium">
                                                {item.metode_konsultasi ===
                                                    "Chat" && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                                )}
                                                {item.metode_konsultasi ===
                                                    "Video Call" && (
                                                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                                                )}
                                                {item.metode_konsultasi ===
                                                    "Voice Call" && (
                                                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                                )}
                                                {item.metode_konsultasi ===
                                                    "Tatap Muka" && (
                                                    <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                                                )}
                                                {item.metode_konsultasi}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-800">
                                            {formatCurrency(item.total_harga)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge
                                                status={item.status_pesanan}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
