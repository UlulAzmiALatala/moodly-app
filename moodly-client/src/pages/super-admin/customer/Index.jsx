import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../../api/axios";
import {
    Search,
    MoreHorizontal,
    Shield,
    ShieldOff,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";

// Import Modal
import BlockModal from "./modals/BlockModal";
import UnblockModal from "./modals/UnblockModal";
import DeleteModal from "./modals/DeleteModal";

// 1. Import Hook Toast
import { useToast } from "../../../context/ToastContext";

// --- Komponen Badge Status ---
const StatusBadge = ({ status }) => {
    const styles = {
        Active: "bg-green-50 text-green-700 border-green-200",
        Online: "bg-green-50 text-green-700 border-green-200",
        Offline: "bg-gray-50 text-gray-600 border-gray-200",
        Banned: "bg-red-50 text-red-700 border-red-200 font-bold",
        Verifikasi: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };
    const currentStyle = styles[status] || styles.Offline;

    return (
        <span
            className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${currentStyle}`}
        >
            {status || "Offline"}
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

const CustomerManagementPage = () => {
    // --- State Data ---
    const [customers, setCustomers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    // --- State UI ---
    const [loading, setLoading] = useState(true);

    // 2. Panggil Hook Toast
    const { addToast } = useToast();

    // --- State Modals ---
    const [isBlockModalOpen, setBlockModalOpen] = useState(false);
    const [isUnblockModalOpen, setUnblockModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // --- Fetch Data ---
    const fetchData = async (page = 1, search = "") => {
        setLoading(true);
        try {
            const response = await apiClient.get(
                `/api/super-admin/customer-management?page=${page}&search=${search}`
            );

            if (response.data.data) {
                setCustomers(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    from: response.data.from,
                    to: response.data.to,
                });
            } else {
                setCustomers(response.data);
                setPagination({});
            }
        } catch (err) {
            console.error(err);
            // 3. Toast Error Fetch
            addToast("Gagal memuat data customer.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData(currentPage, searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (pagination.last_page || 1)) {
            setCurrentPage(page);
        }
    };

    // --- 4. Update Logic Action dengan Toast ---
    const executeAction = async (actionType) => {
        if (!selectedCustomer) return;
        try {
            let url = `/api/super-admin/customer-management/${selectedCustomer.id}`;
            let msg = "";

            if (actionType === "block") {
                url += "/block";
                msg = "Customer berhasil diblokir.";
            } else if (actionType === "unblock") {
                url += "/unblock";
                msg = "Blokir customer berhasil dibuka.";
            } else if (actionType === "delete") {
                await apiClient.delete(url);
                msg = "Customer berhasil dihapus permanen.";
            } else {
                await apiClient.post(url);
            }

            if (actionType !== "delete") await apiClient.post(url);

            setBlockModalOpen(false);
            setUnblockModalOpen(false);
            setDeleteModalOpen(false);
            fetchData(currentPage, searchTerm);

            // Toast Sukses
            addToast(msg, "success");
        } catch (err) {
            // Toast Gagal
            addToast(
                err.response?.data?.message || "Gagal melakukan aksi.",
                "error"
            );
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
                        Data Customer
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola pengguna aplikasi (pasien/klien).
                    </p>
                </div>

                <div className="relative w-full md:w-72">
                    <input
                        type="text"
                        placeholder="Cari nama, email, kota..."
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
                    <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
                        <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4 text-center">
                                    Avatar
                                </th>
                                <th className="px-6 py-4">Nama Lengkap</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">No. Telepon</th>
                                <th className="px-6 py-4">Jenis Kelamin</th>
                                <th className="px-6 py-4">Kota</th>
                                <th className="px-6 py-4 text-center">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="inline-flex flex-col items-center gap-2">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent"></div>
                                            <span className="text-gray-400 text-xs">
                                                Memuat data...
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="9"
                                        className="px-6 py-12 text-center text-gray-400 italic"
                                    >
                                        Tidak ada data customer ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr
                                        key={customer.id}
                                        className="hover:bg-cyan-50/30 transition-colors group"
                                    >
                                        {/* 1. ID */}
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs">
                                                #
                                                {String(customer.id).padStart(
                                                    3,
                                                    "0"
                                                )}
                                            </span>
                                        </td>

                                        {/* 2. Avatar */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center">
                                                <img
                                                    src={
                                                        customer.avatar ||
                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                            customer.name
                                                        )}&background=EBF4FF&color=0891b2&bold=true`
                                                    }
                                                    alt={customer.name}
                                                    className="w-8 h-8 rounded-full object-cover border border-gray-200 bg-gray-50"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                            customer.name
                                                        )}&background=EBF4FF&color=0891b2&bold=true`;
                                                    }}
                                                />
                                            </div>
                                        </td>

                                        {/* 3. Nama */}
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {customer.name}
                                        </td>

                                        {/* 4. Email */}
                                        <td className="px-6 py-4">
                                            {customer.email}
                                        </td>

                                        {/* 5. No Telepon */}
                                        <td className="px-6 py-4">
                                            {customer.phone || "-"}
                                        </td>

                                        {/* 6. Jenis Kelamin */}
                                        <td className="px-6 py-4">
                                            {customer.gender || "-"}
                                        </td>

                                        {/* 7. Kota */}
                                        <td className="px-6 py-4">
                                            {customer.city || "-"}
                                        </td>

                                        {/* 8. Status */}
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge
                                                status={customer.status}
                                            />
                                        </td>

                                        {/* 9. Aksi */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    to={`/admin/customer-management/${customer.id}`}
                                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Detail"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Link>

                                                {customer.status ===
                                                "Banned" ? (
                                                    <button
                                                        onClick={() =>
                                                            openModal(
                                                                setUnblockModalOpen,
                                                                customer
                                                            )
                                                        }
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Buka Blokir"
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            openModal(
                                                                setBlockModalOpen,
                                                                customer
                                                            )
                                                        }
                                                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                        title="Blokir"
                                                    >
                                                        <ShieldOff className="w-4 h-4" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() =>
                                                        openModal(
                                                            setDeleteModalOpen,
                                                            customer
                                                        )
                                                    }
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

                {/* Pagination */}
                <Pagination meta={pagination} onPageChange={handlePageChange} />
            </div>

            {/* Modals */}
            <BlockModal
                isOpen={isBlockModalOpen}
                onClose={() => setBlockModalOpen(false)}
                onConfirm={() => executeAction("block")}
                customerName={selectedCustomer?.name}
            />
            <UnblockModal
                isOpen={isUnblockModalOpen}
                onClose={() => setUnblockModalOpen(false)}
                onConfirm={() => executeAction("unblock")}
                customerName={selectedCustomer?.name}
            />
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => executeAction("delete")}
                customerName={selectedCustomer?.name}
            />
        </div>
    );
};

export default CustomerManagementPage;
