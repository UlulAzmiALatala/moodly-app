import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../../api/axios";
import DeleteModal from "./modals/DeleteModal";
import {
    Eye,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
    Calendar,
    User,
    Loader2,
    Video,
    Phone,
    MessageSquare,
} from "lucide-react";

// 1. Import Hook Toast
import { useToast } from "../../../context/ToastContext";

// --- Komponen Status Badge ---
const StatusBadge = ({ status }) => {
    let classes = "bg-gray-100 text-gray-600 border-gray-200";

    switch (status) {
        case "Selesai":
        case "SELESAI":
        case "Dijadwalkan":
        case "DISETUJUI":
            classes = "bg-green-50 text-green-700 border-green-200";
            break;
        case "Batal":
        case "DIBATALKAN":
        case "Dibatalkan":
        case "DITOLAK":
        case "Pembayaran Ditolak":
            classes = "bg-red-50 text-red-700 border-red-200";
            break;
        case "Proses":
        case "Menunggu Pembayaran":
        case "MENUNGGU_PEMBAYARAN":
            classes = "bg-yellow-50 text-yellow-700 border-yellow-200";
            break;
        case "Menunggu Verifikasi":
        case "MENUNGGU_VERIFIKASI_PEMBAYARAN":
            classes =
                "bg-purple-50 text-purple-700 border-purple-200 font-bold animate-pulse";
            break;
        case "Menunggu Konfirmasi":
        case "MENUNGGU_KONFIRMASI_JADWAL":
            classes = "bg-blue-50 text-blue-700 border-blue-200";
            break;
        default:
            break;
    }

    return (
        <span
            className={`px-3 py-1 text-xs font-bold rounded-full border ${classes} whitespace-nowrap`}
        >
            {status}
        </span>
    );
};

// --- KOMPONEN PAGINASI (Gaya Moodly) ---
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

const BookingManagementPage = () => {
    // --- State Data ---
    const [bookings, setBookings] = useState([]);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    // --- State UI ---
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // 2. Panggil Hook Toast
    const { addToast } = useToast();

    // --- State Modal ---
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // --- Fetch Data ---
    const fetchData = async (page = 1, search = "") => {
        try {
            setLoading(true);
            const response = await apiClient.get(
                `/api/super-admin/booking-management?page=${page}&search=${search}`
            );

            if (response.data.data) {
                setBookings(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    from: response.data.from,
                    to: response.data.to,
                });
            } else {
                setBookings(response.data);
                setPagination({});
            }
        } catch (err) {
            console.error("Error fetching bookings:", err);
            // 3. Toast Error Fetch
            addToast("Gagal memuat data pesanan.", "error");
        } finally {
            setLoading(false);
        }
    };

    // Effect: Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData(currentPage, searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [currentPage, searchTerm]);

    // --- Handlers ---
    const handlePageChange = (page) => {
        if (page >= 1 && page <= (pagination.last_page || 1)) {
            setCurrentPage(page);
        }
    };

    const openDeleteModal = (booking) => {
        setSelectedBooking(booking);
        setDeleteModalOpen(true);
    };

    // --- 4. Logic Delete dengan Toast ---
    const handleDelete = async () => {
        if (!selectedBooking) return;
        try {
            await apiClient.delete(
                `/api/super-admin/booking-management/${selectedBooking.id}`
            );
            setDeleteModalOpen(false);
            setSelectedBooking(null);
            fetchData(currentPage, searchTerm);

            // Toast Sukses
            addToast("Pesanan berhasil dihapus.", "success");
        } catch (err) {
            console.error("Gagal menghapus pesanan:", err);
            // Toast Gagal
            addToast("Gagal menghapus pesanan.", "error");
        }
    };

    // --- Format Tanggal Robust ---
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "-";

            return new Intl.DateTimeFormat("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }).format(date);
        } catch (error) {
            return "-";
        }
    };

    return (
        <div className="space-y-6 pb-10 p-6 font-sans text-gray-600">
            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Daftar Pesanan
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola semua transaksi dan jadwal konseling.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 md:w-72 md:flex-none w-full">
                    <input
                        type="text"
                        placeholder="Cari nama, ID..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm shadow-sm"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            {/* --- Konten Tabel --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-3 text-sm text-gray-500">
                            Memuat data...
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                        <th className="px-6 py-4">
                                            ID Booking
                                        </th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Konselor</th>
                                        <th className="px-6 py-4">Jadwal</th>
                                        <th className="px-6 py-4">Metode</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-center">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {bookings.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-6 py-12 text-center text-gray-400 italic"
                                            >
                                                Tidak ada data pesanan yang
                                                ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        bookings.map((booking) => (
                                            <tr
                                                key={booking.id}
                                                className="hover:bg-blue-50/30 transition-colors group"
                                            >
                                                {/* ID */}
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                                        #{booking.id}
                                                    </span>
                                                </td>

                                                {/* Customer */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-blue-600 font-bold text-xs border border-white shadow-sm overflow-hidden">
                                                            {booking.customer
                                                                ?.avatar ? (
                                                                <img
                                                                    src={
                                                                        booking
                                                                            .customer
                                                                            .avatar
                                                                    }
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                    onError={(
                                                                        e
                                                                    ) =>
                                                                        (e.target.style.display =
                                                                            "none")
                                                                    }
                                                                />
                                                            ) : (
                                                                booking.customer?.name
                                                                    ?.charAt(0)
                                                                    .toUpperCase()
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 line-clamp-1">
                                                                {booking
                                                                    .customer
                                                                    ?.name ||
                                                                    "Unknown"}
                                                            </p>
                                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                                <User className="w-3 h-3" />
                                                                ID:{" "}
                                                                {
                                                                    booking.customer_id
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Konselor */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs border border-white shadow-sm overflow-hidden">
                                                            {booking.konselor
                                                                ?.avatar ? (
                                                                <img
                                                                    src={
                                                                        booking
                                                                            .konselor
                                                                            .avatar
                                                                    }
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                    onError={(
                                                                        e
                                                                    ) =>
                                                                        (e.target.style.display =
                                                                            "none")
                                                                    }
                                                                />
                                                            ) : (
                                                                booking.konselor?.name
                                                                    ?.charAt(0)
                                                                    .toUpperCase()
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800 line-clamp-1">
                                                                {booking
                                                                    .konselor
                                                                    ?.name ||
                                                                    "Unknown"}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                Psikolog
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Jadwal */}
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1 text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                            <span className="font-medium">
                                                                {formatDate(
                                                                    booking.tanggal_konsultasi +
                                                                        " " +
                                                                        booking.jam_konsultasi
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Metode */}
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600">
                                                        {booking.metode_konsultasi ===
                                                            "Chat" && (
                                                            <MessageSquare className="w-3 h-3 text-blue-500" />
                                                        )}
                                                        {booking.metode_konsultasi ===
                                                            "Video Call" && (
                                                            <Video className="w-3 h-3 text-purple-500" />
                                                        )}
                                                        {booking.metode_konsultasi ===
                                                            "Voice Call" && (
                                                            <Phone className="w-3 h-3 text-green-500" />
                                                        )}
                                                        {
                                                            booking.metode_konsultasi
                                                        }
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    <StatusBadge
                                                        status={
                                                            booking.status_pesanan
                                                        }
                                                    />
                                                </td>

                                                {/* Aksi */}
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <Link
                                                            to={`/admin/booking-management/${booking.id}`}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Lihat Detail"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                openDeleteModal(
                                                                    booking
                                                                )
                                                            }
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hapus Pesanan"
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

                        {/* --- Pagination Baru --- */}
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
                bookingId={selectedBooking?.id}
            />
        </div>
    );
};

export default BookingManagementPage;
