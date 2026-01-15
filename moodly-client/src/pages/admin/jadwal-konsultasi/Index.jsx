import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../../api/axios";
import DeleteModal from "./modals/DeleteModal";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Eye,
    Trash2,
    Video,
    Phone,
    MessageSquare,
    Calendar,
    Clock,
    ChevronDown,
    Loader2,
} from "lucide-react";

// 1. Import Hook Toast
import { useToast } from "../../../context/ToastContext";

// --- Komponen Status Dropdown ---
const StatusDropdown = ({ currentStatus, bookingId, onStatusChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const statuses = [
        "Menunggu Konfirmasi",
        "Dijadwalkan",
        "Berlangsung",
        "Selesai",
        "Batal",
    ];

    const statusStyles = {
        Selesai: "bg-green-100 text-green-700 border-green-200",
        Batal: "bg-red-100 text-red-700 border-red-200",
        Proses: "bg-yellow-100 text-yellow-700 border-yellow-200",
        Dijadwalkan: "bg-cyan-100 text-cyan-700 border-cyan-200", // Cyan style
        Berlangsung: "bg-purple-100 text-purple-700 border-purple-200",
        "Menunggu Konfirmasi": "bg-gray-100 text-gray-700 border-gray-200",
    };

    const handleChange = (newStatus) => {
        if (newStatus !== currentStatus) {
            onStatusChange(bookingId, newStatus);
        }
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && !event.target.closest(`.dropdown-${bookingId}`)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, bookingId]);

    const currentStyle =
        statusStyles[currentStatus] || statusStyles["Menunggu Konfirmasi"];

    return (
        <div
            className={`relative inline-block text-left dropdown-${bookingId}`}
        >
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center justify-center gap-1 w-full rounded-full border px-3 py-1 text-xs font-bold transition-all shadow-sm hover:shadow-md ${currentStyle}`}
            >
                {currentStatus}
                <ChevronDown size={14} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="py-1">
                        {statuses.map((status) => (
                            <button
                                key={status}
                                onClick={() => handleChange(status)}
                                disabled={status === currentStatus}
                                className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                    status === currentStatus
                                        ? "bg-gray-50 text-gray-400 cursor-default"
                                        : "text-gray-700 hover:bg-cyan-50 hover:text-cyan-600"
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- KOMPONEN PAGINASI (Gaya Moodly - Cyan) ---
const Pagination = ({ meta, onPageChange }) => {
    if (!meta || meta.total === 0) return null;

    const { current_page, last_page, from, to, total } = meta;

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
                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>

                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all shadow-sm border ${
                            current_page === page
                                ? "bg-cyan-400 text-white border-cyan-400 shadow-cyan-200"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        {page}
                    </button>
                ))}

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

// --- Komponen Utama Halaman ---
const JadwalKonsultasiPage = () => {
    const [jadwalList, setJadwalList] = useState([]);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedJadwal, setSelectedJadwal] = useState(null);

    // 2. Panggil Hook Toast
    const { addToast } = useToast();

    // --- Fetch Data ---
    const fetchData = async (page = 1, search = "", status = "") => {
        setLoading(true);
        try {
            const params = {
                page,
                search,
                ...(status && { status }),
            };

            const response = await apiClient.get(
                "/api/admin/jadwal-konsultasi",
                { params }
            );

            if (response.data.data) {
                setJadwalList(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    from: response.data.from,
                    to: response.data.to,
                });
            } else {
                setJadwalList(response.data);
            }
        } catch (err) {
            console.error("Fetch Jadwal Error:", err);
            addToast("Gagal memuat jadwal konsultasi.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData(currentPage, searchTerm, filterStatus);
        }, 500);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm, filterStatus]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (pagination.last_page || 1)) {
            setCurrentPage(page);
        }
    };

    const handleDelete = async () => {
        if (!selectedJadwal) return;
        try {
            await apiClient.delete(
                `/api/admin/jadwal-konsultasi/${selectedJadwal.id}`
            );
            setDeleteModalOpen(false);
            setSelectedJadwal(null);
            fetchData(currentPage, searchTerm, filterStatus);
            addToast("Jadwal berhasil dihapus.", "success");
        } catch (err) {
            console.error("Gagal menghapus jadwal:", err);
            addToast("Gagal menghapus jadwal.", "error");
        }
    };

    const openDeleteModal = (jadwal) => {
        setSelectedJadwal(jadwal);
        setDeleteModalOpen(true);
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        // Optimistic Update
        const oldJadwalList = [...jadwalList];
        setJadwalList((prevList) =>
            prevList.map((jadwal) =>
                jadwal.id === bookingId
                    ? { ...jadwal, status_pesanan: newStatus }
                    : jadwal
            )
        );

        try {
            await apiClient.patch(
                `/api/admin/jadwal-konsultasi/${bookingId}/status`,
                {
                    status_pesanan: newStatus,
                }
            );
            addToast("Status pesanan berhasil diperbarui.", "success");
        } catch (err) {
            console.error("Gagal mengubah status jadwal:", err);
            setJadwalList(oldJadwalList); // Rollback
            addToast(`Gagal mengubah status: ${err.message}`, "error");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const filterOptions = [
        "Semua Status",
        "Menunggu Konfirmasi",
        "Dijadwalkan",
        "Berlangsung",
        "Selesai",
        "Batal",
    ];

    return (
        <div className="space-y-6 p-6 pb-20 font-sans text-gray-600">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Jadwal Konsultasi
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Pantau dan kelola sesi konseling yang akan datang.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="appearance-none w-full md:w-48 pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all cursor-pointer"
                        >
                            {filterOptions.map((option) => (
                                <option
                                    key={option}
                                    value={
                                        option === "Semua Status" ? "" : option
                                    }
                                >
                                    {option}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Cari ID, Klien..."
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
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent"></div>
                        <p className="mt-3 text-gray-500 text-sm">
                            Memuat jadwal...
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">
                                            ID Booking
                                        </th>
                                        <th className="px-6 py-4">
                                            Jadwal Sesi
                                        </th>
                                        <th className="px-6 py-4">Metode</th>
                                        <th className="px-6 py-4">Klien</th>
                                        <th className="px-6 py-4">Konselor</th>
                                        <th className="px-6 py-4 text-center">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {jadwalList.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-6 py-12 text-center text-gray-400 italic"
                                            >
                                                Tidak ada jadwal yang sesuai
                                                filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        jadwalList.map((jadwal) => (
                                            <tr
                                                key={jadwal.id}
                                                className="hover:bg-cyan-50/30 transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                                        #
                                                        {String(
                                                            jadwal.id
                                                        ).padStart(5, "0")}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {formatDate(
                                                            jadwal.tanggal_konsultasi
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                        <Clock size={12} />{" "}
                                                        {jadwal.jam_konsultasi}{" "}
                                                        WIB
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {jadwal.metode_konsultasi ===
                                                            "Video Call" && (
                                                            <Video className="w-4 h-4 text-purple-500" />
                                                        )}
                                                        {jadwal.metode_konsultasi ===
                                                            "Call" && (
                                                            <Phone className="w-4 h-4 text-green-500" />
                                                        )}
                                                        {jadwal.metode_konsultasi ===
                                                            "Chat" && (
                                                            <MessageSquare className="w-4 h-4 text-cyan-500" />
                                                        )}
                                                        <span className="text-gray-700 font-medium">
                                                            {
                                                                jadwal.metode_konsultasi
                                                            }
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 text-xs font-bold">
                                                            {jadwal.customer?.name?.charAt(
                                                                0
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-sm">
                                                                {
                                                                    jadwal
                                                                        .customer
                                                                        ?.name
                                                                }
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                ID: #
                                                                {
                                                                    jadwal.customer_id
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">
                                                            {jadwal.konselor?.name?.charAt(
                                                                0
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-700">
                                                            {
                                                                jadwal.konselor
                                                                    ?.name
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <StatusDropdown
                                                        currentStatus={
                                                            jadwal.status_pesanan
                                                        }
                                                        bookingId={jadwal.id}
                                                        onStatusChange={
                                                            handleStatusChange
                                                        }
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <Link
                                                            to={`/admin/jadwal-konsultasi/${jadwal.id}`}
                                                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Lihat Detail"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    jadwal
                                                                )
                                                            }
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            meta={pagination}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                bookingId={selectedJadwal?.id}
            />
        </div>
    );
};

export default JadwalKonsultasiPage;
