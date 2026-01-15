import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../../api/axios";
import {
    Search,
    Plus,
    MoreHorizontal,
    Shield,
    ShieldOff,
    Trash2,
    ChevronLeft,
    ChevronRight,
    User,
    MapPin,
    Phone,
    Mail,
    Edit2,
    Loader2,
} from "lucide-react";

// Impor Modals
import AddModal from "./modals/AddModal";
import BlockModal from "./modals/BlockModal";
import UnblockModal from "./modals/UnblockModal";
import DeleteModal from "./modals/DeleteModal";

// 1. Import Toast
import { useToast } from "../../../context/ToastContext";

// --- Komponen Badge Status ---
const StatusBadge = ({ status }) => {
    const styles = {
        Active: "bg-green-50 text-green-700 border-green-200",
        Online: "bg-green-50 text-green-700 border-green-200",
        Offline: "bg-gray-50 text-gray-600 border-gray-200",
        Banned: "bg-red-50 text-red-700 border-red-200 font-bold",
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

const AdminManagementPage = () => {
    const [admins, setAdmins] = useState([]);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isBlockModalOpen, setBlockModalOpen] = useState(false);
    const [isUnblockModalOpen, setUnblockModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);

    // --- 2. Panggil Hook Toast ---
    const { addToast } = useToast();

    // --- Fetch Data ---
    const fetchData = async (page = 1, search = "") => {
        setLoading(true);
        try {
            const response = await apiClient.get(
                `/api/super-admin/admin-management?page=${page}&search=${search}`
            );

            if (response.data.data) {
                setAdmins(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    from: response.data.from,
                    to: response.data.to,
                });
            } else {
                setAdmins(response.data);
            }
        } catch (err) {
            console.error(err);
            addToast("Gagal memuat data admin.", "error");
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

    // --- 3. Logic Save (Toast) ---
    const handleSave = async (data, setErrors) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            if (data[key] !== null) formData.append(key, data[key]);
        });

        if (selectedAdmin) {
            formData.append("_method", "PUT");
        }

        try {
            const url = selectedAdmin
                ? `/api/super-admin/admin-management/${selectedAdmin.id}`
                : "/api/super-admin/admin-management";

            await apiClient.post(url, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setAddModalOpen(false);
            setSelectedAdmin(null);
            fetchData(currentPage, searchTerm);

            addToast(
                selectedAdmin
                    ? "Data admin diperbarui!"
                    : "Admin baru ditambahkan!",
                "success"
            );
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
                addToast("Cek inputan form.", "warning");
            } else {
                addToast("Gagal menyimpan data admin.", "error");
            }
        }
    };

    // --- 4. Logic Action (Toast) ---
    const executeAction = async (actionType) => {
        if (!selectedAdmin) return;
        try {
            let url = `/api/super-admin/admin-management/${selectedAdmin.id}`;
            let msg = "";

            if (actionType === "block") {
                url += "/block";
                msg = "Admin berhasil diblokir.";
            } else if (actionType === "unblock") {
                url += "/unblock";
                msg = "Blokir admin dibuka.";
            } else if (actionType === "delete") {
                await apiClient.delete(url);
                msg = "Admin dihapus permanen.";
            } else {
                await apiClient.post(url);
            }

            if (actionType !== "delete") await apiClient.post(url);

            setBlockModalOpen(false);
            setUnblockModalOpen(false);
            setDeleteModalOpen(false);
            fetchData(currentPage, searchTerm);

            addToast(msg, "success");
        } catch (err) {
            addToast("Gagal melakukan aksi.", "error");
        }
    };

    const openModal = (setter, admin = null) => {
        setSelectedAdmin(admin);
        setter(true);
    };

    return (
        <div className="space-y-6 p-6 pb-20 font-sans text-gray-600">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Data Admin
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola akun administrator sistem.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
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
                    <button
                        onClick={() => openModal(setAddModalOpen)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200 text-sm font-bold whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> Tambah Admin
                    </button>
                </div>
            </div>

            {/* Table Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
                        <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Profil</th>
                                <th className="px-6 py-4">Kontak</th>
                                <th className="px-6 py-4">Lokasi</th>
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
                                        colSpan="5"
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent"></div>
                                        <p className="mt-3 text-gray-500 text-sm">
                                            Memuat data admin...
                                        </p>
                                    </td>
                                </tr>
                            ) : admins.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-12 text-center text-gray-400 italic"
                                    >
                                        Tidak ada data admin ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                admins.map((admin) => (
                                    <tr
                                        key={admin.id}
                                        className="hover:bg-cyan-50/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={
                                                        admin.avatar ||
                                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                            admin.name
                                                        )}&background=ECFEFF&color=0891b2&bold=true`
                                                    }
                                                    alt={admin.name}
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-50"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                            admin.name
                                                        )}&background=ECFEFF&color=0891b2&bold=true`;
                                                    }}
                                                />
                                                <div>
                                                    <div className="font-bold text-gray-900">
                                                        {admin.name}
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-mono">
                                                        ID: #{admin.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900 font-medium">
                                                {admin.email}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {admin.phone || "-"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-gray-700">
                                                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-sm font-medium">
                                                    {admin.city || "-"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge
                                                status={admin.status}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    to={`/admin/admin-management/${admin.id}`}
                                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Detail"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Link>

                                                <button
                                                    onClick={() =>
                                                        openModal(
                                                            setAddModalOpen,
                                                            admin
                                                        )
                                                    }
                                                    className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>

                                                {admin.status === "Banned" ? (
                                                    <button
                                                        onClick={() =>
                                                            openModal(
                                                                setUnblockModalOpen,
                                                                admin
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
                                                                admin
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
                                                            admin
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
                <Pagination meta={pagination} onPageChange={handlePageChange} />
            </div>

            {/* Modals */}
            <AddModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setAddModalOpen(false);
                    setSelectedAdmin(null);
                }}
                onSave={handleSave}
                initialData={selectedAdmin}
                isEditMode={!!selectedAdmin}
            />
            <BlockModal
                isOpen={isBlockModalOpen}
                onClose={() => setBlockModalOpen(false)}
                onConfirm={() => executeAction("block")}
                adminName={selectedAdmin?.name}
            />
            <UnblockModal
                isOpen={isUnblockModalOpen}
                onClose={() => setUnblockModalOpen(false)}
                onConfirm={() => executeAction("unblock")}
                adminName={selectedAdmin?.name}
            />
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => executeAction("delete")}
                adminName={selectedAdmin?.name}
            />
        </div>
    );
};

export default AdminManagementPage;
