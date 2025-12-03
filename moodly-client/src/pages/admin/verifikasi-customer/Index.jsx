import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../../api/axios";
import {
    Search,
    Eye,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    User,
    Mail,
    Phone,
    Loader2,
} from "lucide-react";

// Import Modal
import ApproveModal from "./modals/ApproveModal";
import RejectModal from "./modals/RejectModal";

// 1. Import Hook Toast
import { useToast } from "../../../context/ToastContext";

// --- Komponen Badge Status ---
const StatusBadge = ({ status }) => {
    const styles = {
        "Menunggu Verifikasi": "bg-yellow-50 text-yellow-700 border-yellow-200",
        Verifikasi: "bg-yellow-50 text-yellow-700 border-yellow-200",
        Terverifikasi: "bg-green-50 text-green-700 border-green-200",
        Ditolak: "bg-red-50 text-red-700 border-red-200",
        Banned: "bg-gray-50 text-gray-700 border-gray-200",
    };

    const currentStyle =
        styles[status] || "bg-gray-50 text-gray-600 border-gray-200";

    return (
        <span
            className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${currentStyle}`}
        >
            {status}
        </span>
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

const VerifikasiCustomerPage = () => {
    // --- State Data ---
    const [customerList, setCustomerList] = useState([]);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    // --- State UI ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Panggil Hook Toast
    const { addToast } = useToast();

    // --- State Modals ---
    const [isApproveModalOpen, setApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // --- Fetch Data ---
    const fetchData = async (page = 1, search = "") => {
        setLoading(true);
        try {
            const response = await apiClient.get(
                `/api/admin/verifikasi-customer?page=${page}&search=${search}`
            );

            if (response.data.data) {
                setCustomerList(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    from: response.data.from,
                    to: response.data.to,
                });
            } else {
                setCustomerList(response.data);
                setPagination({});
            }
            setError(null);
        } catch (err) {
            setError("Gagal memuat data verifikasi.");
            console.error(err);
            addToast("Gagal memuat data verifikasi.", "error");
        } finally {
            setLoading(false);
        }
    };

    // Debounce Search
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

    // Fungsi Helper: Tutup modal & Refresh data & Toast
    const handleActionSuccess = (message, type = "success") => {
        setApproveModalOpen(false);
        setRejectModalOpen(false);
        setSelectedCustomer(null);
        fetchData(currentPage, searchTerm);
        addToast(message, type);
    };

    // --- Logic API Approve & Reject ---
    const handleApprove = async () => {
        if (!selectedCustomer) return;
        try {
            await apiClient.post(
                `/api/admin/verifikasi-customer/${selectedCustomer.id}/approve`
            );
            handleActionSuccess("Customer berhasil diverifikasi!");
        } catch (err) {
            console.error("Gagal menyetujui:", err);
            addToast("Gagal menyetujui verifikasi.", "error");
        }
    };

    const handleReject = async (reason) => {
        if (!selectedCustomer) return;
        try {
            await apiClient.post(
                `/api/admin/verifikasi-customer/${selectedCustomer.id}/reject`,
                {
                    alasan_ditolak: reason,
                }
            );
            handleActionSuccess("Verifikasi customer ditolak.", "info");
        } catch (err) {
            console.error("Gagal menolak:", err);
            addToast("Gagal menolak verifikasi.", "error");
        }
    };

    const openModal = (setter, customer) => {
        setSelectedCustomer(customer);
        setter(true);
    };

    return (
        <div className="space-y-6 p-6 pb-20 font-sans text-gray-600">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Verifikasi Customer
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Tinjau dan verifikasi pendaftaran customer baru.
                    </p>
                </div>

                <div className="relative w-full md:w-72">
                    <input
                        type="text"
                        placeholder="Cari nama, email..."
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

            {/* Table Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4 rounded-l-xl">ID</th>
                                <th className="px-6 py-4">Profil</th>
                                <th className="px-6 py-4">Kontak</th>
                                <th className="px-6 py-4 text-center">
                                    Status
                                </th>
                                <th className="px-6 py-4 rounded-r-xl text-right">
                                    Aksi
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
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent"></div>
                                        <p className="mt-3 text-gray-400 text-sm">
                                            Memuat data...
                                        </p>
                                    </td>
                                </tr>
                            ) : customerList.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-12 text-center text-gray-400 italic"
                                    >
                                        Tidak ada data verifikasi customer.
                                    </td>
                                </tr>
                            ) : (
                                customerList.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="hover:bg-cyan-50/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                                #
                                                {String(customer.id).padStart(
                                                    5,
                                                    "0"
                                                )}
                                            </span>
                                        </td>

                                        {/* Profil */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={
                                                        customer.avatar ||
                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                            customer.name
                                                        )}&background=ECFEFF&color=0891b2&bold=true`
                                                    }
                                                    alt={customer.name}
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                            customer.name
                                                        )}&background=ECFEFF&color=0891b2&bold=true`;
                                                    }}
                                                />
                                                <div>
                                                    <div className="font-bold text-gray-900">
                                                        {customer.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <User size={12} />{" "}
                                                        Customer
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Kontak */}
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Mail
                                                        size={14}
                                                        className="text-gray-400"
                                                    />
                                                    {customer.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Phone
                                                        size={14}
                                                        className="text-gray-400"
                                                    />
                                                    {customer.phone || "-"}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge
                                                status={customer.status}
                                            />
                                        </td>

                                        {/* Aksi */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    to={`/admin/verifikasi-customer/${customer.id}`}
                                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>

                                                {/* Tombol Aksi Cepat */}
                                                {(customer.status ===
                                                    "Verifikasi" ||
                                                    customer.status ===
                                                        "Menunggu Verifikasi") && (
                                                    <>
                                                        <button
                                                            onClick={() =>
                                                                openModal(
                                                                    setApproveModalOpen,
                                                                    customer
                                                                )
                                                            }
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Setujui"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                openModal(
                                                                    setRejectModalOpen,
                                                                    customer
                                                                )
                                                            }
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Tolak"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <Pagination meta={pagination} onPageChange={handlePageChange} />
            </div>

            {/* Modals */}
            <ApproveModal
                isOpen={isApproveModalOpen}
                onClose={() => setApproveModalOpen(false)}
                onConfirm={handleApprove} // Hubungkan fungsi
                customerName={selectedCustomer?.name}
            />
            <RejectModal
                isOpen={isRejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                onConfirm={handleReject} // Hubungkan fungsi
                customerName={selectedCustomer?.name}
            />
        </div>
    );
};

export default VerifikasiCustomerPage;
