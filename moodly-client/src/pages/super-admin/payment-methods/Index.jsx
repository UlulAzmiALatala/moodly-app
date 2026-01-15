import React, { useState, useEffect } from "react";
import apiClient from "../../../api/axios";
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import AddEditModal from "./modals/AddEditModal";
import DeleteModal from "./modals/DeleteModal";

// 1. Import Hook Toast
import { useToast } from "../../../context/ToastContext";

// --- Komponen Badge Status (Tetap sesuai aslinya) ---
const StatusBadge = ({ status }) => {
    const isActive = status === "Aktif";
    return (
        <span
            className={`px-3 py-1 text-xs font-bold rounded-full border ${
                isActive
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-50 text-gray-600 border-gray-200"
            }`}
        >
            {isActive ? "Aktif" : "Non-Aktif"}
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

export default function PaymentMethodsPage() {
    // --- State Data ---
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    // --- State UI ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // --- 2. Panggil Hook Toast ---
    const { addToast } = useToast();

    // --- State Modal ---
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);

    // --- 1. Fetch Data (Dengan Page & Search) ---
    const fetchPaymentMethods = async (page = 1, search = "") => {
        setLoading(true);
        try {
            const response = await apiClient.get(
                `/api/super-admin/payment-methods?page=${page}&search=${search}`
            );

            if (response.data.data) {
                setPaymentMethods(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    from: response.data.from,
                    to: response.data.to,
                });
            } else {
                setPaymentMethods(response.data);
                setPagination({});
            }
            setError(null);
        } catch (err) {
            const errorMsg = "Gagal mengambil data metode pembayaran.";
            setError(errorMsg);
            // Tambahkan Toast Error
            addToast(errorMsg, "error");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Effect: Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPaymentMethods(currentPage, searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [currentPage, searchTerm]);

    // --- 2. Handlers ---
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= (pagination.last_page || 1)) {
            setCurrentPage(newPage);
        }
    };

    const handleOpenAddModal = () => {
        setSelectedMethod(null);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (method) => {
        setSelectedMethod(method);
        setIsAddEditModalOpen(true);
    };

    const handleOpenDeleteModal = (method) => {
        setSelectedMethod(method);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsAddEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedMethod(null);
    };

    const handleSuccess = () => {
        handleCloseModals();
        fetchPaymentMethods(currentPage, searchTerm); // Refresh data
        // Catatan: Toast sukses biasanya dipanggil di dalam modal setelah aksi berhasil,
        // atau bisa ditambahkan di sini jika modal mengembalikan status sukses.
    };

    return (
        <div className="space-y-6 p-2 pb-20">
            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Metode Pembayaran
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Atur opsi pembayaran (QRIS/Bank Transfer) untuk
                        aplikasi.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Cari metode..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all text-sm shadow-sm"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200 text-sm font-bold"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Baru
                    </button>
                </div>
            </div>

            {/* --- Konten Utama --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent"></div>
                        <p className="mt-3 text-gray-500 text-sm">
                            Memuat data...
                        </p>
                    </div>
                ) : error ? (
                    <div className="p-12 text-center text-red-500 bg-red-50">
                        <p>{error}</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Logo / QR</th>
                                        <th className="px-6 py-4">
                                            Nama Metode
                                        </th>
                                        <th className="px-6 py-4">
                                            Detail Akun
                                        </th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {paymentMethods.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-6 py-12 text-center text-gray-400 italic"
                                            >
                                                Tidak ada metode pembayaran
                                                ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        paymentMethods.map((method) => (
                                            <tr
                                                key={method.id}
                                                className="hover:bg-cyan-50/30 transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="w-16 h-16 rounded-lg border border-gray-200 bg-white p-1 flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src={
                                                                method.image_url
                                                            }
                                                            alt={method.name}
                                                            className="w-full h-full object-contain rounded-md"
                                                            onError={(e) => {
                                                                e.target.onerror =
                                                                    null;
                                                                e.target.src =
                                                                    "https://placehold.co/100x100/f3f4f6/9ca3af?text=No+Img";
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900 text-base">
                                                        {method.name}
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        ID: {method.id}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {method.account_details ? (
                                                        <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded inline-block text-gray-700">
                                                            {
                                                                method.account_details
                                                            }
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-xs">
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge
                                                        status={method.status}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() =>
                                                                handleOpenEditModal(
                                                                    method
                                                                )
                                                            }
                                                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleOpenDeleteModal(
                                                                    method
                                                                )
                                                            }
                                                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
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

                        {/* --- Footer Paginasi (Menggunakan Komponen Baru) --- */}
                        <Pagination
                            meta={pagination}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>

            {/* --- Modals --- */}
            <AddEditModal
                isOpen={isAddEditModalOpen}
                onClose={handleCloseModals}
                onSuccess={handleSuccess}
                methodToEdit={selectedMethod}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                onSuccess={handleSuccess}
                methodToDelete={selectedMethod}
            />
        </div>
    );
}
