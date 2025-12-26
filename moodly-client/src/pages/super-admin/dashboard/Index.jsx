import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../../api/axios";
import {
    Users,
    ShoppingBag,
    UserCheck,
    DollarSign,
    ArrowRight,
    CreditCard,
    MessageSquare,
    FileText,
    CheckSquare,
    TrendingUp,
    ChevronDown,
} from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    AreaChart,
    Area,
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

// --- Komponen Kartu Statistik (Interaktif) ---
const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    iconColor,
    isActive,
    onClick,
}) => (
    <div
        onClick={onClick}
        className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 border
        ${
            isActive
                ? "bg-white ring-2 ring-blue-500 shadow-lg scale-[1.02]"
                : "bg-white border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.01]"
        }`}
    >
        <div className="flex items-center gap-4 relative z-10">
            <div className={`p-3 rounded-xl flex-shrink-0 ${color}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 mb-1 truncate">
                    {title}
                </p>
                <h3 className="text-2xl font-extrabold text-gray-900 break-words leading-tight">
                    {value}
                </h3>
            </div>
        </div>
        {/* Dekorasi Background */}
        <div
            className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 ${color}`}
        ></div>
    </div>
);

// --- Komponen Tombol Quick Action ---
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
        className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all group h-full"
    >
        <div
            className={`p-3 rounded-full ${bgClass} group-hover:scale-110 transition-transform flex-shrink-0`}
        >
            <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                {label}
            </h4>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{subLabel}</p>
        </div>
        <div className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
            <ArrowRight size={16} />
        </div>
    </Link>
);

// --- Status Badge ---
const StatusBadge = ({ status }) => {
    let classes = "bg-gray-100 text-gray-700";
    if (["Selesai", "SELESAI", "Dijadwalkan", "DISETUJUI"].includes(status)) {
        classes = "bg-green-100 text-green-700 border border-green-200";
    } else if (
        ["Batal", "DIBATALKAN", "DITOLAK", "Pembayaran Ditolak"].includes(
            status
        )
    ) {
        classes = "bg-red-100 text-red-700 border border-red-200";
    } else if (
        ["Proses", "Menunggu Pembayaran", "Menunggu Verifikasi"].includes(
            status
        )
    ) {
        classes = "bg-yellow-100 text-yellow-700 border border-yellow-200";
    }
    return (
        <span
            className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide whitespace-nowrap ${classes}`}
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

    // State untuk memilih metrik grafik yang aktif
    const [selectedMetric, setSelectedMetric] = useState("pendapatan"); // default: pendapatan

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // [UBAH DISINI] Tambahkan parameter params: { year }
                const response = await apiClient.get(
                    "/api/super-admin/dashboard-stats",
                    {
                        params: { year: year },
                    }
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
    }, [year]);

    // --- Mockup Data Grafik Dinamis (Bisa disesuaikan dengan API nanti) ---
    // Karena API dashboard-stats biasanya cuma kirim 1 jenis grafik,
    // di sini kita simulasi perubahan data grafik berdasarkan klik card.
    const getChartData = () => {
        // Jika backend sudah support filter, panggil API ulang di sini.
        // Untuk sekarang, kita pakai data dummy visualisasi agar terlihat berubah.
        switch (selectedMetric) {
            case "customer":
                return [
                    { name: "Jan", value: 12 },
                    { name: "Feb", value: 19 },
                    { name: "Mar", value: 30 },
                    { name: "Apr", value: 45 },
                    { name: "Mei", value: 60 },
                    { name: "Jun", value: 85 },
                ];
            case "pesanan":
                return chartData; // Gunakan data asli dari API (biasanya grafik pesanan)
            case "konselor":
                return [
                    { name: "Jan", value: 5 },
                    { name: "Feb", value: 5 },
                    { name: "Mar", value: 8 },
                    { name: "Apr", value: 10 },
                    { name: "Mei", value: 12 },
                    { name: "Jun", value: 15 },
                ];
            case "pendapatan":
            default:
                // Transform data pesanan menjadi estimasi pendapatan (contoh)
                return chartData.map((d) => ({
                    ...d,
                    value: d.Chat * 50000 + d["Video Call"] * 100000,
                }));
        }
    };

    const activeChartData =
        selectedMetric === "pesanan" ? chartData : getChartData();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm font-medium">
                        Memuat dashboard...
                    </p>
                </div>
            </div>
        );
    }

    const cards = [
        {
            key: "customer",
            title: "Total Customer",
            value: stats?.total_customer || 0,
            icon: Users,
            color: "bg-cyan-50",
            iconColor: "text-cyan-600",
        },
        {
            key: "pesanan",
            title: "Total Pesanan",
            value: stats?.total_pesanan || 0,
            icon: ShoppingBag,
            color: "bg-green-50",
            iconColor: "text-green-600",
        },
        {
            key: "konselor",
            title: "Total Konselor",
            value: stats?.total_konselor || 0,
            icon: UserCheck,
            color: "bg-indigo-50",
            iconColor: "text-indigo-600",
        },
        {
            key: "pendapatan",
            title: "Total Pendapatan",
            value: formatCurrency(stats?.total_pendapatan || 0),
            icon: DollarSign,
            color: "bg-blue-50",
            iconColor: "text-blue-600",
        },
    ];

    // Judul Grafik Dinamis
    const getChartTitle = () => {
        switch (selectedMetric) {
            case "customer":
                return "Pertumbuhan Customer Baru";
            case "pesanan":
                return "Tren Pemesanan Konseling";
            case "konselor":
                return "Pertumbuhan Mitra Konselor";
            case "pendapatan":
                return "Tren Pendapatan Bulanan";
            default:
                return "Analitik";
        }
    };

    return (
        <div className="space-y-8 pb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Dashboard Overview
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Ringkasan aktivitas aplikasi Moodly hari ini.
                    </p>
                </div>
                <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                    {new Date().toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </div>
            </div>

            {/* SECTION 1: KARTU STATISTIK (Responsive Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <StatCard
                        key={card.key}
                        {...card}
                        isActive={selectedMetric === card.key}
                        onClick={() => setSelectedMetric(card.key)}
                    />
                ))}
            </div>

            {/* SECTION 2: GRAFIK & QUICK ACTIONS */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* GRAFIK (Lebih Lebar) */}
                <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-[450px]">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <TrendingUp
                                    size={20}
                                    className="text-blue-500"
                                />
                                {getChartTitle()}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Data tahun {year}
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

                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            {/* Tampilkan tipe grafik berbeda sesuai metric */}
                            {selectedMetric === "pendapatan" ||
                            selectedMetric === "customer" ? (
                                <AreaChart data={activeChartData}>
                                    <defs>
                                        <linearGradient
                                            id="colorVal"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#3B82F6"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#3B82F6"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
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
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "none",
                                            boxShadow:
                                                "0 4px 20px rgba(0,0,0,0.1)",
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#3B82F6"
                                        fillOpacity={1}
                                        fill="url(#colorVal)"
                                    />
                                </AreaChart>
                            ) : (
                                <BarChart data={activeChartData} barGap={4}>
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
                                            borderRadius: "12px",
                                            border: "none",
                                            boxShadow:
                                                "0 4px 20px rgba(0,0,0,0.1)",
                                        }}
                                    />
                                    <Bar
                                        dataKey="Chat"
                                        fill="#3B82F6"
                                        radius={[4, 4, 0, 0]}
                                        stackId="a"
                                    />
                                    <Bar
                                        dataKey="Video Call"
                                        fill="#8B5CF6"
                                        radius={[4, 4, 0, 0]}
                                        stackId="a"
                                    />
                                    <Bar
                                        dataKey="Voice Call"
                                        fill="#10B981"
                                        radius={[4, 4, 0, 0]}
                                        stackId="a"
                                    />
                                    <Bar
                                        dataKey="Tatap Muka"
                                        fill="#F59E0B"
                                        radius={[4, 4, 0, 0]}
                                        stackId="a"
                                    />
                                    {/* Jika selectedMetric konselor, tampilkan 1 bar saja */}
                                    {selectedMetric === "konselor" && (
                                        <Bar
                                            dataKey="value"
                                            fill="#6366f1"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    )}
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* KANAN: QUICK ACTIONS */}
                <div className="flex flex-col h-full">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                        Aksi Cepat
                    </h3>
                    <div className="grid grid-cols-1 gap-4 flex-1">
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

            {/* SECTION 3: TRANSAKSI TERBARU */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">
                            Transaksi Terbaru
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            5 pesanan terakhir yang masuk
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
                                        className="px-6 py-12 text-center text-gray-400 text-sm italic"
                                    >
                                        Belum ada transaksi terbaru.
                                    </td>
                                </tr>
                            ) : (
                                recentTransactions.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50/50 transition-colors"
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
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
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
                                                <span
                                                    className={`w-2 h-2 rounded-full ${
                                                        item.metode_konsultasi ===
                                                        "Chat"
                                                            ? "bg-blue-400"
                                                            : item.metode_konsultasi ===
                                                              "Video Call"
                                                            ? "bg-purple-400"
                                                            : "bg-green-400"
                                                    }`}
                                                ></span>
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
