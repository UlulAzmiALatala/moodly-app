import React, { useState, useEffect } from "react";
import apiClient from "../../../../api/axios";
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Star,
    Image as ImageIcon,
    Loader2,
} from "lucide-react";

import AddEditModal from "./modals/AddEditModal";
import DeleteModal from "./modals/DeleteModal";

// 1. Import Hook Toast
import { useToast } from "../../../../context/ToastContext";

// --- Komponen Badge Status ---
const StatusBadge = ({ status }) => {
    const isActive = status === "Aktif";
    return (
        <span
            className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                isActive
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
            }`}
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

const TempatKonselingPage = () => {
    // --- State Data ---
    const [tempatList, setTempatList] = useState([]);
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
    const [selectedTempat, setSelectedTempat] = useState(null);

    // --- Fetch Data ---
    const fetchData = async (page = 1, search = "") => {
        setLoading(true);
        try {
            const response = await apiClient.get(
                `/api/super-admin/tempat-konseling?page=${page}&search=${search}`
            );

            if (response.data.data) {
                setTempatList(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    from: response.data.from,
                    to: response.data.to,
                });
            } else {
                setTempatList(response.data);
                setPagination({});
            }
        } catch (err) {
            console.error(err);
            addToast("Gagal memuat data tempat konseling.", "error");
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

    // --- Handlers ---
    const handlePageChange = (page) => {
        if (page >= 1 && page <= (pagination.last_page || 1)) {
            setCurrentPage(page);
        }
    };

    const handleOpenAddModal = () => {
        setSelectedTempat(null);
        setAddEditModalOpen(true);
    };

    const handleOpenEditModal = (data) => {
        setSelectedTempat(data);
        setAddEditModalOpen(true);
    };

    const handleOpenDeleteModal = (data) => {
        setSelectedTempat(data);
        setDeleteModalOpen(true);
    };

    // --- Handle Save (Support File Upload & Toast) ---
    const handleSave = async (data, imageFile, setErrors) => {
        const formData = new FormData();
        formData.append("nama_tempat", data.nama_tempat);
        formData.append("alamat", data.alamat);
        formData.append("rating", data.rating || 0);
        formData.append("review_count", data.review_count || 0);
        formData.append("status", data.status);

        if (imageFile) {
            formData.append("image", imageFile);
        }

        if (selectedTempat) {
            formData.append("_method", "PUT");
        }

        try {
            const url = selectedTempat
                ? `/api/super-admin/tempat-konseling/${selectedTempat.id}`
                : "/api/super-admin/tempat-konseling";

            await apiClient.post(url, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setAddEditModalOpen(false);
            fetchData(currentPage, searchTerm);

            addToast(
                selectedTempat
                    ? "Data tempat diperbarui!"
                    : "Data tempat ditambahkan!",
                "success"
            );
        } catch (err) {
            console.error("Gagal menyimpan:", err);
            if (err.response?.status === 422 && setErrors) {
                setErrors(err.response.data.errors);
                addToast("Periksa kembali inputan Anda.", "warning");
            } else {
                addToast(
                    err.response?.data?.message || "Gagal menyimpan data.",
                    "error"
                );
            }
        }
    };

    const handleDelete = async () => {
        try {
            await apiClient.delete(
                `/api/super-admin/tempat-konseling/${selectedTempat.id}`
            );
            setDeleteModalOpen(false);
            fetchData(currentPage, searchTerm);
            addToast("Data tempat berhasil dihapus.", "success");
        } catch (err) {
            console.error("Gagal menghapus:", err);
            addToast("Gagal menghapus data.", "error");
        }
    };

    return (
        <div className="space-y-6 p-2 pb-20">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Tempat Konseling
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola lokasi praktik dan fasilitas offline.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Cari tempat..."
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
                        <Plus className="w-4 h-4" /> Tambah Tempat
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
                                        <th className="px-6 py-4">Gambar</th>
                                        <th className="px-6 py-4">
                                            Nama Tempat
                                        </th>
                                        <th className="px-6 py-4">Alamat</th>
                                        <th className="px-6 py-4">Rating</th>
                                        <th className="px-6 py-4 text-center">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {tempatList.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-6 py-12 text-center text-gray-400 italic"
                                            >
                                                Belum ada data tempat konseling.
                                            </td>
                                        </tr>
                                    ) : (
                                        tempatList.map((item, index) => (
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

                                                {/* Kolom Gambar */}
                                                <td className="px-6 py-4">
                                                    <div className="w-16 h-12 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                                                        {item.image_url ? (
                                                            <img
                                                                src={
                                                                    item.image_url
                                                                }
                                                                alt={
                                                                    item.nama_tempat
                                                                }
                                                                className="w-full h-full object-cover"
                                                                onError={(
                                                                    e
                                                                ) => {
                                                                    e.target.onerror =
                                                                        null;
                                                                    e.target.style.display =
                                                                        "none";
                                                                    e.target.nextSibling.style.display =
                                                                        "block";
                                                                }}
                                                            />
                                                        ) : null}
                                                        {/* Fallback Icon */}
                                                        <ImageIcon
                                                            className="text-gray-400 w-6 h-6"
                                                            style={{
                                                                display:
                                                                    item.image_url
                                                                        ? "none"
                                                                        : "block",
                                                            }}
                                                        />
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 font-bold text-gray-800">
                                                    {item.nama_tempat}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-gray-600">
                                                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        <span
                                                            className="truncate max-w-[200px]"
                                                            title={item.alamat}
                                                        >
                                                            {item.alamat}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1 font-medium text-gray-700">
                                                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                                        {item.rating
                                                            ? Number(
                                                                  item.rating
                                                              ).toFixed(1)
                                                            : "0.0"}
                                                    </div>
                                                    <span className="text-xs text-gray-400 ml-5">
                                                        (
                                                        {item.review_count || 0}{" "}
                                                        ulasan)
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <StatusBadge
                                                        status={item.status}
                                                    />
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
                initialData={selectedTempat}
            />
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                itemName={selectedTempat?.nama_tempat}
            />
        </div>
    );
};

export default TempatKonselingPage;
