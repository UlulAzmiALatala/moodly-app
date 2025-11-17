import React from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

import { BsPeopleFill, BsPersonCheckFill } from "react-icons/bs";
import { HiUsers, HiCheckCircle } from "react-icons/hi";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";

// --- DATA DUMMY UNTUK GRAFIK ---
const chartData = [
    { name: "Januari", "Total Customer": 600 },
    { name: "Februari", "Total Customer": 280 },
    { name: "Maret", "Total Customer": 800 },
    { name: "April", "Total Customer": 950 },
    { name: "Mei", "Total Customer": 650 },
    { name: "Juni", "Total Customer": 200 },
    { name: "Juli", "Total Customer": 100 },
    { name: "Agustus", "Total Customer": 750 },
    { name: "September", "Total Customer": 900 },
    { name: "Oktober", "Total Customer": 400 },
    { name: "November", "Total Customer": 800 },
    { name: "Desember", "Total Customer": 850 },
];

// --- DATA DUMMY UNTUK TABEL ---
const tableData = [
    {
        id: "123456701",
        tanggal: "05-Januari-2024",
        jam: "08.00-13.00",
        jenis: "Video Call",
        klien: "Andi Sari",
        status: "Dijadwalkan",
    },
    {
        id: "123456702",
        tanggal: "05-Januari-2024",
        jam: "08.00-13.00",
        jenis: "Video Call",
        klien: "Andi Sari",
        status: "Dijadwalkan",
    },
    {
        id: "123456703",
        tanggal: "05-Januari-2024",
        jam: "08.00-13.00",
        jenis: "Video Call",
        klien: "Andi Sari",
        status: "Dijadwalkan",
    },
    {
        id: "123456704",
        tanggal: "04-Januari-2024",
        jam: "10.00-11.00",
        jenis: "Offline",
        klien: "Budi Darmawan",
        status: "Selesai",
    },
];

// --- Komponen Kartu Statistik ---
const StatCard = ({ icon, value, title, iconBg, iconColor }) => (
    <div className="bg-white p-5 rounded-lg shadow-md flex items-center justify-between">
        <div>
            <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
            <p className="text-sm text-gray-500">{title}</p>
        </div>
        <div className={`p-3 rounded-full ${iconBg}`}>
            {React.cloneElement(icon, { className: `w-6 h-6 ${iconColor}` })}
        </div>
    </div>
);

// --- KOMPONEN UTAMA DASHBOARD ---
export default function AdminDashboardPage() {
    return (
        <div className="p-6 font-sans">
            {/* Judul Halaman */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            </div>

            {/* Bagian 1: Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Kartu 1 */}
                <div className="bg-blue-500 text-white p-5 rounded-lg shadow-lg flex items-center justify-between">
                    <div>
                        <h3 className="text-3xl font-bold">2500+</h3>
                        <p className="text-sm">Total Customer</p>
                    </div>
                    <div className="bg-white/30 p-3 rounded-full">
                        <BsPeopleFill className="w-6 h-6" />
                    </div>
                </div>

                <StatCard
                    icon={<BsPersonCheckFill />}
                    value="1500+"
                    title="Customer Terverifikasi"
                    iconBg="bg-blue-100"
                    iconColor="text-blue-500"
                />

                <StatCard
                    icon={<HiUsers />}
                    value="500+"
                    title="Total Konselor"
                    iconBg="bg-green-100"
                    iconColor="text-green-500"
                />

                {/* IKON SUDAH DIPERBAIKI */}
                <StatCard
                    icon={<HiCheckCircle />}
                    value="400+"
                    title="Konselor Terverifikasi"
                    iconBg="bg-yellow-100"
                    iconColor="text-yellow-500"
                />
            </div>

            {/* Bagian 2: Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md flex flex-col justify-center">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">
                        Curhat Booked
                    </h3>
                    <p className="text-4xl font-bold text-blue-600 mb-1">
                        Rp 50.000.000
                    </p>
                    <p className="text-gray-500">2000 Orders</p>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Total Customer
                        </h3>
                        <select className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                            <option>2025</option>
                            <option>2024</option>
                            <option>2023</option>
                            <option>2021</option>
                        </select>
                    </div>

                    <div style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 5,
                                    right: 20,
                                    left: -20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip wrapperClassName="shadow-lg rounded-md" />
                                <Bar
                                    dataKey="Total Customer"
                                    fill="#3B82F6"
                                    radius={[10, 10, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bagian 3: Tabel Jadwal Konsultasi */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Jadwal Konsultasi Mendatang
                    </h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari disini"
                            className="border rounded-lg p-2 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <FaSearch className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-cyan-100">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-cyan-800 uppercase tracking-wider">
                                    ID Pemesanan
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-cyan-800 uppercase tracking-wider">
                                    Tanggal
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-cyan-800 uppercase tracking-wider">
                                    Jam
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-cyan-800 uppercase tracking-wider">
                                    Jenis Konsultasi
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-cyan-800 uppercase tracking-wider">
                                    Klien
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-cyan-800 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-cyan-800 uppercase tracking-wider">
                                    Detail
                                </th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {tableData.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {row.id}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {row.tanggal}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {row.jam}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {row.jenis}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {row.klien}
                                    </td>

                                    <td className="px-4 py-3 text-sm font-medium">
                                        <span
                                            className={
                                                row.status === "Dijadwalkan"
                                                    ? "text-red-500"
                                                    : row.status === "Selesai"
                                                    ? "text-green-500"
                                                    : "text-gray-500"
                                            }
                                        >
                                            {row.status}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-sm text-gray-700 flex items-center gap-3">
                                        <button className="text-blue-500 hover:text-blue-700">
                                            <FaEdit />
                                        </button>
                                        <button className="text-red-500 hover:text-red-700">
                                            <FaTrash />
                                        </button>
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
