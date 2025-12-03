import React, { useEffect, useState } from "react";
import apiClient from "../../../api/axios";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import {
    Users,
    UserCheck,
    Briefcase,
    ShieldCheck,
    Wallet,
    Calendar,
    Loader2,
    Search,
} from "lucide-react";

// --- Komponen Kartu Statistik (Interaktif) ---
const StatCard = ({
    icon: Icon,
    value,
    title,
    bgClass,
    textClass,
    isActive,
    onClick,
}) => (
    <div
        onClick={onClick}
        className={`
            bg-white p-6 rounded-2xl shadow-sm border cursor-pointer transition-all duration-300
            flex items-center justify-between hover:shadow-md
            ${
                isActive
                    ? "border-blue-500 ring-2 ring-blue-100 scale-[1.02]"
                    : "border-gray-100 hover:border-blue-200"
            }
        `}
    >
        <div>
            <h3
                className={`text-3xl font-extrabold ${
                    isActive ? "text-blue-600" : "text-gray-900"
                }`}
            >
                {value}
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-1">{title}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgClass}`}>
            <Icon className={`w-6 h-6 ${textClass}`} />
        </div>
    </div>
);

// --- FORMATTERS ---
const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(num);
const formatDate = (d) =>
    new Date(d).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
const formatTime = (t) => t?.substring(0, 5) || "-";

export default function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [year, setYear] = useState(new Date().getFullYear());

    // State Data
    const [stats, setStats] = useState({});
    const [allCharts, setAllCharts] = useState({}); // Menyimpan semua data grafik
    const [tableData, setTableData] = useState([]);

    // State untuk Interaksi Grafik
    // Default active: 'total_customer'
    const [activeTab, setActiveTab] = useState("total_customer");

    // Mapping Judul Grafik berdasarkan Tab
    const chartTitles = {
        total_customer: "Pertumbuhan Total Customer",
        active_customer: "Pertumbuhan Customer Aktif (Tidak Banned)",
        total_konselor: "Registrasi Konselor Baru",
        verified_konselor: "Konselor Terverifikasi per Bulan",
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await apiClient.get(
                    `/api/admin/dashboard-stats?year=${year}`
                );
                setStats(response.data.stats);
                setAllCharts(response.data.charts); // Simpan semua grafik
                setTableData(response.data.upcoming);
            } catch (error) {
                console.error("Gagal memuat dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [year]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center text-gray-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span>Memuat Dashboard...</span>
            </div>
        );
    }

    return (
        <div className="p-6 font-sans space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Dashboard Admin
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Ringkasan aktivitas dan statistik platform.
                    </p>
                </div>
            </div>

            {/* Bagian 1: Kartu Statistik (Klik untuk Ganti Grafik) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={Users}
                    value={stats.total_customer}
                    title="Total Customer"
                    bgClass="bg-blue-50"
                    textClass="text-blue-600"
                    isActive={activeTab === "total_customer"}
                    onClick={() => setActiveTab("total_customer")}
                />
                <StatCard
                    icon={UserCheck}
                    value={stats.active_customer}
                    title="Customer Aktif"
                    bgClass="bg-cyan-50"
                    textClass="text-cyan-600"
                    isActive={activeTab === "active_customer"}
                    onClick={() => setActiveTab("active_customer")}
                />
                <StatCard
                    icon={Briefcase}
                    value={stats.total_konselor}
                    title="Total Konselor"
                    bgClass="bg-purple-50"
                    textClass="text-purple-600"
                    isActive={activeTab === "total_konselor"}
                    onClick={() => setActiveTab("total_konselor")}
                />
                <StatCard
                    icon={ShieldCheck}
                    value={stats.verified_konselor}
                    title="Konselor Terverifikasi"
                    bgClass="bg-green-50"
                    textClass="text-green-600"
                    isActive={activeTab === "verified_konselor"}
                    onClick={() => setActiveTab("verified_konselor")}
                />
            </div>

            {/* Bagian 2: Grafik Dinamis & Pendapatan */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kartu Pendapatan (Statis) */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">
                        Total Pendapatan
                    </h3>
                    <p className="text-3xl font-extrabold text-gray-900 mb-4">
                        {formatRupiah(stats.total_revenue)}
                    </p>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-emerald-700 font-bold">
                                Keuangan Sehat
                            </p>
                            <p className="text-[10px] text-emerald-600">
                                Dari pesanan selesai
                            </p>
                        </div>
                    </div>
                </div>

                {/* Grafik Dinamis */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            {/* Judul berubah sesuai Tab */}
                            {chartTitles[activeTab]}
                        </h3>
                        <select
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        >
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                        </select>
                    </div>

                    <div style={{ width: "100%", height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={allCharts[activeTab] || []} // Data berubah sesuai Tab
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
                                    stroke="#F1F5F9"
                                />
                                <XAxis
                                    dataKey="name"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: "#64748B" }}
                                    dy={10}
                                />
                                <YAxis
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: "#64748B" }}
                                />
                                <Tooltip
                                    cursor={{ fill: "#F8FAFC" }}
                                    contentStyle={{
                                        borderRadius: "12px",
                                        border: "none",
                                        boxShadow:
                                            "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                    }}
                                />
                                {/* Warna bar berubah sedikit sesuai Tab agar lebih hidup */}
                                <Bar
                                    dataKey="value"
                                    name="Jumlah"
                                    fill={
                                        activeTab === "total_customer"
                                            ? "#3B82F6"
                                            : activeTab === "active_customer"
                                            ? "#06b6d4" // cyan
                                            : activeTab === "total_konselor"
                                            ? "#a855f7" // purple
                                            : "#22c55e" // green
                                    }
                                    radius={[4, 4, 0, 0]}
                                    barSize={28}
                                    animationDuration={500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bagian 3: Tabel Jadwal */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        Jadwal Konsultasi Terbaru
                    </h3>
                    <div className="relative w-64 hidden md:block">
                        <input
                            type="text"
                            placeholder="Cari jadwal..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4 rounded-l-xl">
                                    ID Booking
                                </th>
                                <th className="px-6 py-4">Waktu</th>
                                <th className="px-6 py-4">Jenis</th>
                                <th className="px-6 py-4">Klien</th>
                                <th className="px-6 py-4 rounded-r-xl text-center">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {tableData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-8 text-center text-gray-400 italic"
                                    >
                                        Belum ada jadwal mendatang.
                                    </td>
                                </tr>
                            ) : (
                                tableData.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                #{row.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900">
                                                {formatDate(row.tanggal)}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {formatTime(row.jam)} WIB
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                                                {row.jenis}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {row.klien}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                    row.status === "Dijadwalkan"
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : row.status ===
                                                          "Selesai"
                                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                }`}
                                            >
                                                {row.status}
                                            </span>
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
