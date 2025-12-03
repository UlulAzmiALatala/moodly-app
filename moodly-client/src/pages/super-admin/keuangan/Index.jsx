import React, { useState, useEffect } from "react";
import apiClient from "../../../api/axios";
import {
    Search,
    Wallet,
    TrendingUp,
    UserCheck,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";

// --- Helper Format Rupiah ---
const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount || 0);
};

// --- Helper Format Tanggal ---
const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

// --- KOMPONEN PAGINASI (Sesuai Referensi Gambar) ---
const Pagination = ({ meta, onPageChange }) => {
    if (!meta || meta.total === 0) return null;

    const { current_page, last_page, from, to, total } = meta;

    // Logic untuk membuat array halaman (misal: [1, 2, 3, 4, 5])
    // Kita batasi max 5 tombol angka agar rapi
    const getPageNumbers = () => {
        let pages = [];
        let startPage = Math.max(1, current_page - 2);
        let endPage = Math.min(last_page, startPage + 4);

        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
            {/* Teks Informasi Data */}
            <p className="text-sm text-gray-500">
                Menampilkan{" "}
                <span className="font-bold text-gray-900">{from || 0}</span>{" "}
                sampai{" "}
                <span className="font-bold text-gray-900">{to || 0}</span> dari{" "}
                <span className="font-bold text-gray-900">{total}</span> data
            </p>

            {/* Tombol Navigasi */}
            <div className="flex items-center gap-2">
                {/* Tombol Previous */}
                <button
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>

                {/* Tombol Angka */}
                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all shadow-sm border ${
                            current_page === page
                                ? "bg-cyan-400 text-white border-cyan-400 shadow-cyan-200" // Warna Aktif (Moodly Blue/Cyan)
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {/* Tombol Next */}
                <button
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

const FinancePage = () => {
    const [data, setData] = useState({ bookings: { data: [] }, summary: {} });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1
    );
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(
                `/api/super-admin/keuangan?page=${currentPage}&search=${searchTerm}&month=${selectedMonth}&year=${selectedYear}`
            );
            setData(response.data);
            setPagination(response.data.bookings || {});
        } catch (error) {
            console.error("Gagal memuat data keuangan:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, selectedMonth, selectedYear]);

    const handlePageChange = (page) => setCurrentPage(page);

    return (
        <div className="space-y-6 p-6 pb-20 font-sans text-gray-600">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Laporan Keuangan
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Pantau arus kas, pemasukan bersih, dan hak konselor.
                    </p>
                </div>

                <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                    <div className="relative">
                        <select
                            value={selectedMonth}
                            onChange={(e) => {
                                setSelectedMonth(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="appearance-none bg-transparent pl-3 pr-8 py-2 text-sm font-medium text-gray-700 focus:outline-none cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(0, i).toLocaleString("id-ID", {
                                        month: "long",
                                    })}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-px bg-gray-200 my-2"></div>
                    <div className="relative">
                        <select
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="appearance-none bg-transparent pl-3 pr-8 py-2 text-sm font-medium text-gray-700 focus:outline-none cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Statistik Cards (Warna Moodly: Cyan & Blue) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Pemasukan Bersih (Utama - Cyan Gradient) */}
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl p-6 text-white shadow-lg shadow-cyan-100 transition-transform hover:scale-[1.01]">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Wallet size={24} className="text-white" />
                        </div>
                        <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded text-cyan-50 uppercase tracking-wide">
                            Net Profit
                        </span>
                    </div>
                    <div>
                        <p className="text-sm opacity-90 font-medium mb-1">
                            Pemasukan Aplikasi
                        </p>
                        <h3 className="text-3xl font-extrabold">
                            {loading
                                ? "..."
                                : formatRupiah(data.summary?.total_bersih)}
                        </h3>
                        <p className="text-xs mt-2 opacity-80">
                            Saldo bersih setelah bagi hasil
                        </p>
                    </div>
                </div>

                {/* Card 2: Hak Konselor (Putih dengan Aksen Biru) */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-transform hover:scale-[1.01]">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <UserCheck size={24} />
                        </div>
                        <span className="text-[10px] font-bold bg-blue-50 px-2 py-1 rounded text-blue-600 uppercase tracking-wide">
                            Payout
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">
                            Hak Konselor
                        </p>
                        <h3 className="text-3xl font-extrabold text-gray-900">
                            {loading
                                ? "..."
                                : formatRupiah(data.summary?.total_payout)}
                        </h3>
                        <p className="text-xs mt-2 text-gray-400">
                            Dana yang harus disalurkan
                        </p>
                    </div>
                </div>

                {/* Card 3: Total Omset (Putih dengan Aksen Cyan Gelap) */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-transform hover:scale-[1.01]">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-cyan-50 rounded-xl text-cyan-700">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-[10px] font-bold bg-cyan-50 px-2 py-1 rounded text-cyan-700 uppercase tracking-wide">
                            Gross Revenue
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">
                            Total Omset Transaksi
                        </p>
                        <h3 className="text-3xl font-extrabold text-gray-900">
                            {loading
                                ? "..."
                                : formatRupiah(data.summary?.total_omset)}
                        </h3>
                        <p className="text-xs mt-2 text-gray-400">
                            Total uang masuk bruto
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabel Rincian */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header Tabel & Pencarian */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        Rincian Transaksi
                        {!loading && pagination.total > 0 && (
                            <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {pagination.total} Data
                            </span>
                        )}
                    </h3>
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Cari ID, Customer..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">ID & Tanggal</th>
                                <th className="px-6 py-4">
                                    Customer & Konselor
                                </th>
                                <th className="px-6 py-4 text-right">
                                    Total Bayar
                                </th>
                                <th className="px-6 py-4 text-right text-blue-600 bg-blue-50/30 border-l border-blue-100">
                                    Hak Konselor
                                </th>
                                <th className="px-6 py-4 text-right text-emerald-600 bg-emerald-50/30 border-l border-emerald-100">
                                    Income App
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="inline-flex flex-col items-center gap-2">
                                            <Loader2 className="animate-spin text-gray-300" />
                                            <span className="text-gray-400 text-xs">
                                                Menghitung data...
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : !data.bookings?.data ||
                              data.bookings.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-12 text-center text-gray-400 italic"
                                    >
                                        Tidak ada transaksi selesai pada periode
                                        ini.
                                    </td>
                                </tr>
                            ) : (
                                data.bookings.data.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 group-hover:border-gray-300 transition-colors">
                                                #
                                                {String(item.id).padStart(
                                                    5,
                                                    "0"
                                                )}
                                            </span>
                                            <div className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                                                <Calendar size={12} />{" "}
                                                {formatDate(item.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">
                                                {item.customer?.name ||
                                                    "Unknown"}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                Konselor:{" "}
                                                {item.konselor?.name ||
                                                    "Unknown"}
                                            </div>
                                            <span className="inline-block mt-1.5 px-2 py-0.5 bg-white text-gray-600 text-[10px] font-medium rounded border border-gray-200 shadow-sm">
                                                {item.jenis_konseling
                                                    ?.jenis_konseling || "-"}
                                            </span>
                                        </td>
                                        {/* Gunakan optional chaining */}
                                        <td className="px-6 py-4 text-right font-extrabold text-gray-800">
                                            {formatRupiah(
                                                item.financial_report
                                                    ?.total_transaksi
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-blue-600 bg-blue-50/10 border-l border-gray-50">
                                            {formatRupiah(
                                                item.financial_report
                                                    ?.hak_konselor
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-extrabold text-emerald-600 bg-emerald-50/10 border-l border-gray-50">
                                            +{" "}
                                            {formatRupiah(
                                                item.financial_report
                                                    ?.total_pemasukan_aplikasi
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginasi Baru (Sesuai Gambar) */}
                <Pagination meta={pagination} onPageChange={handlePageChange} />
            </div>
        </div>
    );
};

export default FinancePage;
