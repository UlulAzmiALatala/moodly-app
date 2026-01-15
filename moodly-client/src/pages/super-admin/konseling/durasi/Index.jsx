import React, { useState, useEffect } from "react";
import apiClient from "../../../../api/axios";
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Clock,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";

import AddEditModal from "./modals/AddEditModal";
import DeleteModal from "./modals/DeleteModal";

// 1. Import Hook Toast
import { useToast } from "../../../../context/ToastContext";

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

const DurasiKonselingPage = () => {
    // --- State Data ---
    const [durasiList, setDurasiList] = useState([]);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    // --- State UI ---
    const [loading, setLoading] = useState(true);

    // 2. Panggil Hook Toast
    const { addToast } = useToast();

    // --- State Modal ---
    const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedDurasi, setSelectedDurasi] = useState(null);

    // --- Helper Format ---
    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(number);
    };

    // --- Fetch Data ---
    const fetchData = async (page = 1, search = "") => {
        setLoading(true);
        try {
            const response = await apiClient.get(
                `/api/super-admin/durasi-konseling?page=${page}&search=${search}`
            );

            if (response.data.data) {
                setDurasiList(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    from: response.data.from,
                    to: response.data.to,
                });
            } else {
                setDurasiList(response.data);
                setPagination({});
            }
        } catch (err) {
            console.error(err);
            addToast("Gagal memuat data durasi konseling.", "error");
        } finally {
            setLoading(false);
        }
    };

    // Effect untuk Search (Debounce)
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

    const handleOpenAddModal = () => {
        setSelectedDurasi(null);
        setAddEditModalOpen(true);
    };

    const handleOpenEditModal = (data) => {
        setSelectedDurasi(data);
        setAddEditModalOpen(true);
    };

    const handleOpenDeleteModal = (data) => {
        setSelectedDurasi(data);
        setDeleteModalOpen(true);
    };

    // Handler Simpan (Create/Update) dengan Toast
    const handleSave = async (data, setErrors) => {
        try {
            if (selectedDurasi) {
                await apiClient.put(
                    `/api/super-admin/durasi-konseling/${selectedDurasi.id}`,
                    data
                );
            } else {
                await apiClient.post("/api/super-admin/durasi-konseling", data);
            }
            setAddEditModalOpen(false);
            fetchData(currentPage, searchTerm);

            addToast(
                selectedDurasi
                    ? "Data durasi diperbarui!"
                    : "Data durasi ditambahkan!",
                "success"
            );
        } catch (err) {
            console.error("Gagal menyimpan data:", err);
            if (err.response?.status === 422 && setErrors) {
                setErrors(err.response.data.errors);
                addToast("Periksa kembali inputan Anda.", "warning");
            } else {
                addToast(
                    err.response?.data?.message ||
                        "Terjadi kesalahan saat menyimpan.",
                    "error"
                );
            }
        }
    };

    // Handler Delete dengan Toast
    const handleDelete = async () => {
        try {
            await apiClient.delete(
                `/api/super-admin/durasi-konseling/${selectedDurasi.id}`
            );
            setDeleteModalOpen(false);
            fetchData(currentPage, searchTerm);
            addToast("Data durasi berhasil dihapus.", "success");
        } catch (err) {
            console.error("Gagal menghapus data:", err);
            addToast("Gagal menghapus data.", "error");
        }
    };

    return (
        <div className="space-y-6 p-2 pb-20">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Durasi Konseling
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Atur opsi lama waktu sesi konseling dan harganya.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Cari durasi..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all text-sm shadow-sm"
                        />
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200 text-sm font-bold whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> Tambah Durasi
                    </button>
                </div>
            </div>

            {/* Table Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent"></div>
                        <p className="mt-3 text-gray-500 text-sm">
                            Memuat data...
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4 w-16 text-center">
                                            No
                                        </th>
                                        <th className="px-6 py-4">
                                            Durasi Waktu
                                        </th>
                                        <th className="px-6 py-4">
                                            Harga Paket
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {durasiList.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="px-6 py-12 text-center text-gray-400 italic"
                                            >
                                                Belum ada data durasi konseling.
                                            </td>
                                        </tr>
                                    ) : (
                                        durasiList.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-cyan-50/30 transition-colors group"
                                            >
                                                <td className="px-6 py-4 text-center text-gray-400">
                                                    {pagination.from
                                                        ? pagination.from +
                                                          index
                                                        : index + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 font-bold text-gray-800 text-base">
                                                        <div className="p-1.5 bg-cyan-100 text-cyan-600 rounded-lg">
                                                            <Clock className="w-4 h-4" />
                                                        </div>
                                                        {item.durasi_menit}{" "}
                                                        Menit
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-green-600">
                                                    {formatRupiah(item.harga)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() =>
                                                                handleOpenEditModal(
                                                                    item
                                                                )
                                                            }
                                                            className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleOpenDeleteModal(
                                                                    item
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

                        {/* Pagination Footer */}
                        <Pagination
                            meta={pagination}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>

            {/* Modals */}
            <AddEditModal
                isOpen={isAddEditModalOpen}
                onClose={() => setAddEditModalOpen(false)}
                onSave={handleSave}
                initialData={selectedDurasi}
            />
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                itemName={
                    selectedDurasi ? `${selectedDurasi.durasi_menit} Menit` : ""
                }
            />
        </div>
    );
};

export default DurasiKonselingPage;
