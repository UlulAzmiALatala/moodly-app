import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
    CheckCircle,
    XCircle,
    FileText,
    Eye,
} from "lucide-react";

import { useToast } from "../../../context/ToastContext";
import PaymentModal from "./modals/PaymentModal";

// --- Helper Functions ---
const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount || 0);
};

const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const Pagination = ({ meta, onPageChange }) => {
    if (!meta || meta.total === 0) return null;
    const { current_page, last_page, from, to, total } = meta;
    const getPageNumbers = () => {
        let pages = [];
        let startPage = Math.max(1, current_page - 2);
        let endPage = Math.min(last_page, startPage + 4);
        if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
        for (let i = startPage; i <= endPage; i++) pages.push(i);
        return pages;
    };
    return (
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-white">
            <p className="text-sm text-gray-500">
                Menampilkan{" "}
                <span className="font-bold text-gray-900">{from || 0}</span>{" "}
                sampai{" "}
                <span className="font-bold text-gray-900">{to || 0}</span> dari{" "}
                <span className="font-bold text-gray-900">{total}</span> data
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>
                {getPageNumbers().map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all shadow-sm border ${current_page === page ? "bg-cyan-500 text-white border-cyan-500 shadow-cyan-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page === last_page}
                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

const FinancePage = () => {
    const [data, setData] = useState({ bookings: { data: [] }, summary: {} });
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1,
    );
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = `/api/super-admin/keuangan?page=${currentPage}&search=${searchTerm}&month=${selectedMonth}&year=${selectedYear}`;
            if (filterStatus !== "ALL")
                url += `&payment_status=${filterStatus}`;
            const response = await apiClient.get(url);
            setData(response.data);
            const meta = response.data.bookings;
            if (meta) {
                setPagination({
                    current_page: meta.current_page,
                    last_page: meta.last_page,
                    total: meta.total,
                    from: meta.from,
                    to: meta.to,
                });
            }
        } catch (error) {
            console.error("Gagal memuat data keuangan:", error);
            addToast("Gagal memuat data laporan keuangan.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchData(), 500);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, selectedMonth, selectedYear, filterStatus]);

    const handlePageChange = (page) => setCurrentPage(page);

    // --- LOGIKA CALCULATOR SAKTI (VERSI PERBAIKAN) ---
    const calculatePayout = (booking) => {
        const total = parseInt(booking.total_harga || 0);

        // 1. PRIORITAS UTAMA: AMBIL DARI DATABASE
        // Backend sudah menghitung dan menyimpan di kolom 'admin_fee' dan 'counselor_net'
        const dbTotalPotongan = parseInt(booking.admin_fee || 0);
        const dbGajiKonselor = parseInt(booking.counselor_net || 0);

        // Jika data dari DB valid (lebih dari 0), GUNAKAN ITU LANGSUNG!
        if (dbTotalPotongan > 0 || dbGajiKonselor > 0) {
            const fixedAdmin = 5000;
            // App Fee = Total Potongan - Biaya Admin 5000
            let appFeeReal = dbTotalPotongan - fixedAdmin;
            if (appFeeReal < 0) appFeeReal = 0;

            return {
                total,
                appFee: appFeeReal,
                adminFee: fixedAdmin,
                totalPotongan: dbTotalPotongan,
                gajiKonselor: dbGajiKonselor,
            };
        }

        // 2. FALLBACK: HITUNG MANUAL (Hanya jika DB masih 0/NULL)
        // Ini untuk berjaga-jaga jika ada data lama yang belum ter-update oleh cronjob

        const relasi = booking.jenisKonseling || booking.jenis_konseling;
        let appFeeHitungan = 0;

        if (relasi) {
            // [FIX] Ambil angka dari 'nilai', bersihkan dari "Rp" atau titik
            let rawNilai = String(relasi.nilai || "0").replace(/[^0-9]/g, "");
            let nilaiBersih = parseInt(rawNilai);

            // Cek tipe: Persentase atau Nominal
            const tipe = (relasi.biaya_layanan || "").toLowerCase();

            if (tipe.includes("persen") || tipe.includes("percentage")) {
                // Rumus Persen: (Total - 5000) * Persen
                const dasar = total - 5000;
                appFeeHitungan = dasar * (nilaiBersih / 100);
            } else {
                // Rumus Nominal: Langsung ambil nilainya
                appFeeHitungan = nilaiBersih;
            }
        }

        const adminFee = 5000;
        const totalPotongan = appFeeHitungan + adminFee;

        let gajiHitungan = total - totalPotongan;
        if (gajiHitungan < 0) gajiHitungan = 0;

        return {
            total,
            appFee: appFeeHitungan,
            adminFee,
            totalPotongan,
            gajiKonselor: gajiHitungan,
        };
    };

    const openPaymentModal = (booking) => {
        const { gajiKonselor } = calculatePayout(booking);
        setSelectedBooking({
            ...booking,
            counselor_net: gajiKonselor,
        });
        setIsModalOpen(true);
    };

    const handlePaymentSuccess = () => {
        fetchData();
        addToast("Pembayaran gaji berhasil dicatat!", "success");
    };

    return (
        <div className="space-y-6 p-6 pb-20 font-sans text-gray-600">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Laporan & Penggajian
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola bagi hasil, pantau omset, dan bayar gaji
                        konselor.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
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
                            <option value="2026">2026</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                            Total Omset
                        </span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900">
                        {loading
                            ? "..."
                            : formatRupiah(data.summary?.total_omset)}
                    </h3>
                </div>
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-cyan-200 hover:shadow-cyan-300 transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-lg text-white">
                            <Wallet size={20} />
                        </div>
                        <span className="text-xs font-bold text-cyan-100 uppercase tracking-wide">
                            Net Profit (App)
                        </span>
                    </div>
                    <h3 className="text-2xl font-extrabold">
                        {loading
                            ? "..."
                            : formatRupiah(data.summary?.total_bersih)}
                    </h3>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <UserCheck size={20} />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                            Total Hak Konselor
                        </span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900">
                        {loading
                            ? "..."
                            : formatRupiah(data.summary?.total_payout)}
                    </h3>
                </div>
                <div className="bg-red-50 rounded-2xl p-5 border border-red-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <FileText size={20} />
                        </div>
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wide">
                            Belum Dibayar
                        </span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-red-600">
                        {loading
                            ? "..."
                            : formatRupiah(data.summary?.pending_payout)}
                    </h3>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-center gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-xl w-full xl:w-auto">
                        {["ALL", "UNPAID", "PAID"].map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    setFilterStatus(status);
                                    setCurrentPage(1);
                                }}
                                className={`flex-1 xl:flex-none px-6 py-2 rounded-lg text-xs font-bold transition-all ${filterStatus === status ? "bg-white text-cyan-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                {status === "ALL"
                                    ? "Semua"
                                    : status === "UNPAID"
                                      ? "Belum Bayar"
                                      : "Lunas"}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full xl:w-72">
                        <input
                            type="text"
                            placeholder="Cari ID, Konselor, Customer..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all text-sm shadow-sm"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">ID & Waktu</th>
                                <th className="px-6 py-4">
                                    Customer & Konselor
                                </th>
                                <th className="px-6 py-4 text-right">
                                    Total Transaksi
                                </th>
                                <th className="px-6 py-4 text-right">
                                    Potongan (App + Admin)
                                </th>
                                <th className="px-6 py-4 text-right bg-blue-50/30 text-blue-700 border-l border-blue-50">
                                    Gaji Konselor
                                </th>
                                <th className="px-6 py-4 text-center">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="inline-flex flex-col items-center gap-2">
                                            <Loader2 className="animate-spin text-cyan-500 h-8 w-8" />
                                            <span className="text-gray-400 text-xs">
                                                Memuat data...
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : !data.bookings?.data ||
                              data.bookings.data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-6 py-12 text-center text-gray-400 italic"
                                    >
                                        Tidak ada data transaksi ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                data.bookings.data.map((item) => {
                                    // PANGGIL CALCULATOR
                                    const {
                                        total,
                                        appFee,
                                        adminFee,
                                        totalPotongan,
                                        gajiKonselor,
                                    } = calculatePayout(item);

                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-cyan-50/30 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <Link
                                                    to={`/admin/keuangan/${item.id}`}
                                                    className="block group-hover:translate-x-1 transition-transform"
                                                >
                                                    <span className="font-mono font-bold text-xs text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100 group-hover:text-cyan-700 group-hover:border-cyan-300 transition-colors inline-flex items-center gap-1">
                                                        #
                                                        {String(
                                                            item.id,
                                                        ).padStart(5, "0")}
                                                        <Eye
                                                            size={10}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                        />
                                                    </span>
                                                    <div className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                                                        <Calendar size={10} />{" "}
                                                        {formatDate(
                                                            item.created_at,
                                                        )}
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-800">
                                                    {item.customer?.name}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    Konselor:{" "}
                                                    {item.konselor?.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-500">
                                                {formatRupiah(total)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-red-500 font-medium">
                                                <div className="flex flex-col items-end text-[10px]">
                                                    <span>
                                                        Admin:{" "}
                                                        {formatRupiah(adminFee)}
                                                    </span>
                                                    <span
                                                        className={
                                                            appFee === 0
                                                                ? "text-gray-300"
                                                                : ""
                                                        }
                                                    >
                                                        App:{" "}
                                                        {formatRupiah(appFee)}
                                                    </span>
                                                    <span className="border-t border-red-200 mt-0.5 pt-0.5 font-bold">
                                                        Total: -
                                                        {formatRupiah(
                                                            totalPotongan,
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-blue-600 bg-blue-50/10 border-l border-blue-50">
                                                {formatRupiah(gajiKonselor)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.counselor_payment_status ===
                                                "PAID" ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                                                        <CheckCircle
                                                            size={10}
                                                        />{" "}
                                                        LUNAS
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                                        <XCircle size={10} />{" "}
                                                        BELUM BAYAR
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.counselor_payment_status ===
                                                "UNPAID" ? (
                                                    <button
                                                        onClick={() =>
                                                            openPaymentModal(
                                                                item,
                                                            )
                                                        }
                                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-200 transition active:scale-95 flex items-center gap-2 mx-auto"
                                                    >
                                                        <Wallet size={12} />{" "}
                                                        Bayar
                                                    </button>
                                                ) : (
                                                    <a
                                                        href={
                                                            item.counselor_payment_proof_url
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition mx-auto"
                                                    >
                                                        <FileText size={12} />{" "}
                                                        Bukti
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination meta={pagination} onPageChange={handlePageChange} />
            </div>
            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                booking={selectedBooking}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default FinancePage;
