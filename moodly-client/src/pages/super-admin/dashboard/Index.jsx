import React, { useState } from "react";
import {
    Users,
    ShoppingBag,
    UserCheck,
    DollarSign,
    Search,
    Eye,
    Trash2,
    FileEdit,
    ChevronDown,
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

// --- Data Dummy ---
const statsCards = [
    {
        title: "Total Customer",
        value: "2500+",
        icon: Users,
        color: "bg-cyan-100",
        iconColor: "text-cyan-600",
    },
    {
        title: "Total Pesanan",
        value: "1500+",
        icon: ShoppingBag,
        color: "bg-green-100",
        iconColor: "text-green-600",
    },
    {
        title: "Total Konselor",
        value: "500+",
        icon: UserCheck,
        color: "bg-indigo-100",
        iconColor: "text-indigo-600",
    },
    {
        title: "Total Pendapatan",
        value: "50.000.000",
        icon: DollarSign,
        color: "bg-blue-100",
        iconColor: "text-blue-600",
    },
];

const chartData = [
    {
        name: "Minggu 1",
        Chat: 4000,
        "Vidio Call": 2400,
        "Voice Call": 7000,
        "Tatap Muka": 3000,
    },
    {
        name: "Minggu 2",
        Chat: 1000,
        "Vidio Call": 11000,
        "Voice Call": 5000,
        "Tatap Muka": 13000,
    },
    {
        name: "Minggu 3",
        Chat: 9000,
        "Vidio Call": 8000,
        "Voice Call": 12000,
        "Tatap Muka": 5000,
    },
];

const tableData = [
    {
        id: 1,
        idAdmin: "110918",
        tanggal: "2025-10-20",
        nama: "Aisyah Putri",
        telepon: "+6281029110123",
        konsultasi: "Vidio Call",
        status: "Selesai",
    },
    {
        id: 2,
        idAdmin: "110918",
        tanggal: "2025-10-20",
        nama: "Nada Ayu",
        telepon: "+6281029110123",
        konsultasi: "Voice Call",
        status: "Selesai",
    },
    {
        id: 3,
        idAdmin: "110918",
        tanggal: "2025-10-19",
        nama: "Daffa Haaq",
        telepon: "+6281029110123",
        konsultasi: "Chat",
        status: "Batal",
    },
    {
        id: 4,
        idAdmin: "110918",
        tanggal: "2025-10-19",
        nama: "Almira Ifsha",
        telepon: "+6281029110123",
        konsultasi: "Jakarta",
        status: "Proses",
    },
];
// --- Akhir Data Dummy ---

// Komponen Kartu Statistik
const StatCard = ({ title, value, icon: Icon, color, iconColor }) => (
    <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
    </div>
);

// Komponen Status
const StatusBadge = ({ status }) => {
    let classes = "";
    if (status === "Selesai") {
        classes = "bg-green-100 text-green-700";
    } else if (status === "Batal") {
        classes = "bg-red-100 text-red-700";
    } else if (status === "Proses") {
        classes = "bg-yellow-100 text-yellow-700";
    } else {
        classes = "bg-gray-100 text-gray-700";
    }
    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${classes}`}
        >
            {status}
        </span>
    );
};

// --- Komponen Utama Dashboard ---
export default function DashboardPage() {
    const [year, setYear] = useState("2021");

    return (
        // Latar belakang diatur oleh AdminLayout
        <div className="p-6 space-y-6">
            {/* Header Konten (Search Bar) */}
            <div className="flex justify-between items-center">
                <div>
                    {/* Judul bisa ditambahkan di sini jika layout tidak menyediakannya */}
                    {/* <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1> */}
                </div>
                <div className="relative w-72">
                    <input
                        type="text"
                        placeholder="Cari disini"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Search size={18} className="text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Grid Kartu Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((card) => (
                    <StatCard
                        key={card.title}
                        title={card.title}
                        value={card.value}
                        icon={card.icon}
                        color={card.color}
                        iconColor={card.iconColor}
                    />
                ))}
            </div>

            {/* Bagian Grafik */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">
                            Curhat Booked
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">
                            Rp 50.000.000
                        </p>
                        <p className="text-sm text-gray-500">2000 Orders</p>
                    </div>
                    <div className="relative">
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="pl-3 pr-8 py-1.5 rounded-md border border-gray-300 bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        >
                            <option>2021</option>
                            <option>2022</option>
                            <option>2023</option>
                            <option>2024</option>
                            <option>2025</option>
                        </select>
                        <ChevronDown
                            size={16}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                        />
                    </div>
                </div>

                {/* Grafik */}
                <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 0, left: -20, bottom: 5 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                fontSize={12}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                fontSize={12}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "white",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    border: "none",
                                }}
                                labelStyle={{
                                    fontWeight: "bold",
                                    color: "#333",
                                }}
                            />
                            <Legend
                                iconType="circle"
                                iconSize={10}
                                wrapperStyle={{ paddingTop: "20px" }}
                            />
                            <Bar
                                dataKey="Chat"
                                fill="#3B82F6"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="Vidio Call"
                                fill="#EF4444"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="Voice Call"
                                fill="#10B981"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar
                                dataKey="Tatap Muka"
                                fill="#F59E0B"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bagian Tabel */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800">
                        Data Customer
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    No
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID Admin
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tanggal
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nama Pelanggan
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    No Telepon
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pilihan Konsultasi
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tableData.map((row) => (
                                <tr key={row.id}>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {row.id}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {row.idAdmin}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {row.tanggal}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                        {row.nama}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {row.telepon}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {row.konsultasi}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <StatusBadge status={row.status} />
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <div className="flex items-center gap-3">
                                            <button className="text-blue-500 hover:text-blue-700">
                                                <Eye size={18} />
                                            </button>
                                            <button className="text-green-500 hover:text-green-700">
                                                <FileEdit size={18} />
                                            </button>
                                            <button className="text-red-500 hover:text-red-700">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
