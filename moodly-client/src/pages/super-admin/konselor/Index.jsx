import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../../api/axios";
import {
    Plus,
    Search,
    MapPin,
    Star,
    MoreHorizontal,
    Edit2,
    Trash2,
    Shield,
    ShieldOff,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
} from "lucide-react";

// Import Modals
import AddModal from "./modals/AddModal";
import BlockModal from "./modals/BlockModal";
import UnblockModal from "./modals/UnblockModal";
import DeleteModal from "./modals/DeleteModal";

// 1. Import Hook Toast
import { useToast } from "../../../context/ToastContext";

// --- Komponen Badge Status ---
const StatusBadge = ({ status }) => {
    const styles = {
        Verifikasi: "bg-yellow-50 text-yellow-700 border-yellow-200",
        Terverifikasi: "bg-green-50 text-green-700 border-green-200",
        Ditolak: "bg-orange-50 text-orange-700 border-orange-200",
        Banned: "bg-red-50 text-red-700 border-red-200 font-bold",
        Offline: "bg-gray-50 text-gray-600 border-gray-200",
    };
    return (
        <span
            className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                styles[status] || styles.Offline
            }`}
        >
            {status}
        </span>
    );
};

// --- Helper Spesialisasi (Update: Cyan Style) ---
const SpesialisasiBadge = ({ items }) => {
    let list = [];
    try {
        list = Array.isArray(items) ? items : JSON.parse(items);
    } catch (e) {
        list = [];
    }

    if (!list || list.length === 0)
        return <span className="text-gray-400 text-xs">-</span>;

    const display = list.slice(0, 2);
    const remaining = list.length - 2;

    return (
        <div className="flex flex-wrap gap-1 min-w-[150px]">
            {display.map((item, idx) => (
                <span
                    key={idx}
                    className="px-1.5 py-0.5 bg-cyan-50 text-cyan-700 rounded text-[10px] font-medium border border-cyan-100 whitespace-nowrap"
                >
                    {item}
                </span>
            ))}
            {remaining > 0 && (
                <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px] border border-gray-200 whitespace-nowrap">
                    +{remaining}
                </span>
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

const KonselorManagementPage = () => {
    // --- State Data ---
    const [konselors, setKonselors] = useState([]);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    // --- State UI ---
    const [loading, setLoading] = useState(true);

    // 2. Panggil Hook Toast
    const { addToast } = useToast();

    // --- State Modals ---
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isBlockModalOpen, setBlockModalOpen] = useState(false);
    const [isUnblockModalOpen, setUnblockModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedKonselor, setSelectedKonselor] = useState(null);

    // --- Fetch Data ---
    const fetchData = async (page = 1, search = "") => {
        setLoading(true);
        try {
            const response = await apiClient.get(
                `/api/super-admin/konselor-management?page=${page}&search=${search}`
            );
            if (response.data.data) {
                setKonselors(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    from: response.data.from,
                    to: response.data.to,
                });
            } else {
                setKonselors(response.data);
                setPagination({});
            }
        } catch (err) {
            console.error(err);
            addToast("Gagal memuat data konselor.", "error");
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

    // --- Handle Save (Create/Update) dengan Toast ---
    const handleSave = async (data, setErrors) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            if (key === "spesialisasi" && Array.isArray(data[key])) {
                data[key].forEach((item, index) =>
                    formData.append(`${key}[${index}]`, item)
                );
            } else if (data[key] !== null) {
                formData.append(key, data[key]);
            }
        });
        if (selectedKonselor) {
            formData.append("_method", "PUT");
        }

        try {
            const url = selectedKonselor
                ? `/api/super-admin/konselor-management/${selectedKonselor.id}`
                : "/api/super-admin/konselor-management";

            await apiClient.post(url, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setAddModalOpen(false);
            setSelectedKonselor(null);
            fetchData(currentPage, searchTerm);

            addToast(
                selectedKonselor
                    ? "Data konselor diperbarui!"
                    : "Konselor baru ditambahkan!",
                "success"
            );
        } catch (err) {
            if (err.response?.status === 422) {
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

    // --- Handle Actions (Block/Delete) dengan Toast ---
    const executeAction = async (actionType) => {
        if (!selectedKonselor) return;
        try {
            let url = `/api/super-admin/konselor-management/${selectedKonselor.id}`;
            let msg = "";

            if (actionType === "block") {
                url += "/block";
                msg = "Konselor berhasil diblokir.";
            } else if (actionType === "unblock") {
                url += "/unblock";
                msg = "Blokir konselor dibuka.";
            } else if (actionType === "delete") {
                await apiClient.delete(url);
                msg = "Konselor dihapus permanen.";
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

    const openModal = (setter, konselor = null) => {
        setSelectedKonselor(konselor);
        setter(true);
    };

    return (
        <div className="space-y-6 p-6 pb-20 font-sans text-gray-600">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Data Konselor
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola psikolog dan status verifikasi mereka.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Cari nama, universitas..."
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
                        <Plus className="w-4 h-4" /> Tambah Konselor
                    </button>
                </div>
            </div>

            {/* Table Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent"></div>
                        <p className="mt-3 text-gray-500 text-sm">
                            Memuat data konselor...
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
                                <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Profil</th>
                                        <th className="px-6 py-4">Kontak</th>
                                        <th className="px-6 py-4">
                                            Universitas
                                        </th>
                                        <th className="px-6 py-4">Kota</th>
                                        <th className="px-6 py-4">
                                            Spesialisasi
                                        </th>
                                        <th className="px-6 py-4 text-center">
                                            Rating
                                        </th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {konselors.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="8"
                                                className="px-6 py-12 text-center text-gray-400 italic"
                                            >
                                                Tidak ada data konselor
                                                ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        konselors.map((konselor) => (
                                            <tr
                                                key={konselor.id}
                                                className="hover:bg-cyan-50/30 transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={
                                                                konselor.avatar ||
                                                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                                    konselor.name
                                                                )}&background=EBF4FF&color=0891b2&bold=true`
                                                            }
                                                            alt={konselor.name}
                                                            className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-50"
                                                            onError={(e) => {
                                                                e.target.onerror =
                                                                    null;
                                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                                    konselor.name
                                                                )}&background=EBF4FF&color=0891b2&bold=true`;
                                                            }}
                                                        />
                                                        <div>
                                                            <div className="font-bold text-gray-900">
                                                                {konselor.name}
                                                            </div>
                                                            <div className="text-xs text-gray-400 font-mono">
                                                                ID: #
                                                                {konselor.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-gray-900 font-medium">
                                                        {konselor.email}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        {konselor.phone || "-"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                        <GraduationCap className="w-4 h-4 text-cyan-400" />
                                                        {konselor.universitas || (
                                                            <span className="text-gray-400 italic">
                                                                Belum diisi
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <MapPin className="w-4 h-4 text-red-400" />
                                                        {konselor.city || (
                                                            <span className="text-gray-400 italic">
                                                                -
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <SpesialisasiBadge
                                                        items={
                                                            konselor.spesialisasi
                                                        }
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 border border-yellow-100 rounded-lg">
                                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                        <span className="font-bold text-yellow-700">
                                                            {konselor.rating
                                                                ? Number(
                                                                      konselor.rating
                                                                  ).toFixed(1)
                                                                : "0.0"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge
                                                        status={konselor.status}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <Link
                                                            to={`/admin/konselor-management/${konselor.id}`}
                                                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Detail Profil"
                                                        >
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Link>

                                                        <button
                                                            onClick={() =>
                                                                openModal(
                                                                    setAddModalOpen,
                                                                    konselor
                                                                )
                                                            }
                                                            className="p-2 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                                                            title="Edit Data"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>

                                                        {konselor.status ===
                                                        "Banned" ? (
                                                            <button
                                                                onClick={() =>
                                                                    openModal(
                                                                        setUnblockModalOpen,
                                                                        konselor
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
                                                                        konselor
                                                                    )
                                                                }
                                                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                                title="Blokir Akses"
                                                            >
                                                                <ShieldOff className="w-4 h-4" />
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() =>
                                                                openModal(
                                                                    setDeleteModalOpen,
                                                                    konselor
                                                                )
                                                            }
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hapus Permanen"
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

                        {/* Pagination Component Baru */}
                        <Pagination
                            meta={pagination}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>

            {/* Modals */}
            <AddModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setAddModalOpen(false);
                    setSelectedKonselor(null);
                }}
                onSave={handleSave}
                initialData={selectedKonselor}
                isEditMode={!!selectedKonselor}
            />
            <BlockModal
                isOpen={isBlockModalOpen}
                onClose={() => setBlockModalOpen(false)}
                onConfirm={() => executeAction("block")}
                konselorName={selectedKonselor?.name}
            />
            <UnblockModal
                isOpen={isUnblockModalOpen}
                onClose={() => setUnblockModalOpen(false)}
                onConfirm={() => executeAction("unblock")}
                konselorName={selectedKonselor?.name}
            />
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={() => executeAction("delete")}
                konselorName={selectedKonselor?.name}
            />
        </div>
    );
};

export default KonselorManagementPage;
