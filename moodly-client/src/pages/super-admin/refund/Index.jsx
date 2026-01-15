import React, { useState, useEffect } from "react";
import apiClient from "../../../api/axios";
import {
    Eye,
    CheckCircle,
    XCircle,
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";

// Import Modals (Sesuai kode Anda)
import AcceptModal from "./modals/AcceptModal";
import RejectModal from "./modals/RejectModal";

// 1. Import Hook Toast
import { useToast } from "../../../context/ToastContext";

// --- Helper Format Uang ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// --- Komponen Badge Status (Mempertahankan style Anda) ---
const StatusBadge = ({ status }) => {
    const styles = {
        "Menunggu Proses":
            "bg-yellow-50 text-yellow-800 border border-yellow-200",
        Diproses: "bg-blue-50 text-blue-800 border border-blue-200",
        Selesai: "bg-green-50 text-green-800 border-green-200",
        Ditolak: "bg-red-50 text-red-800 border-red-200",
    };

    // Fallback jika status tidak ada di map styles
    const activeStyle =
        styles[status] || "bg-gray-50 text-gray-600 border-gray-200";

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${activeStyle}`}
        >
            {status}
        </span>
    );
};

// --- KOMPONEN PAGINASI (Update: Gaya Moodly Cyan) ---
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
                                ? "bg-cyan-400 text-white border-cyan-400 shadow-cyan-200" // Style Cyan Moodly
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

export default function RefundManagementPage() {
    // --- State Data ---
    const [refunds, setRefunds] = useState([]);
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);

    // --- State UI ---
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // 2. Panggil Hook Toast
    const { addToast } = useToast();

    // --- State Modals ---
    const [isAcceptOpen, setIsAcceptOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- 1. Fetch Data ---
    const fetchRefunds = async (page = 1, search = "") => {
        setLoading(true);
        try {
            const response = await apiClient.get(
                `/api/super-admin/refund-management?page=${page}&search=${search}`
            );

            if (response.data.data) {
                setRefunds(response.data.data);
                setPagination({
                    current_page: response.data.current_page,
                    last_page: response.data.last_page,
                    total: response.data.total,
                    from: response.data.from,
                    to: response.data.to,
                });
            } else {
                setRefunds(response.data);
                setPagination({});
            }
        } catch (err) {
            console.error("Gagal load refund:", err);
            // Toast Error Fetch
            addToast("Gagal memuat data refund.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRefunds(currentPage, searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [currentPage, searchTerm]);

    // --- Handlers ---
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= (pagination.last_page || 1)) {
            setCurrentPage(newPage);
        }
    };

    const openAcceptModal = (refund) => {
        setSelectedRefund(refund);
        setIsAcceptOpen(true);
    };

    const openRejectModal = (refund) => {
        setSelectedRefund(refund);
        setIsRejectOpen(true);
    };

    const closeModals = () => {
        setIsAcceptOpen(false);
        setIsRejectOpen(false);
        setSelectedRefund(null);
    };

    // --- Logic Submit ke API (dengan Toast) ---
    const processRefundAPI = async (refundId, status, proofFile = null) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("status", status);

        if (proofFile) {
            formData.append("bukti_transfer", proofFile);
        }

        try {
            await apiClient.post(
                `/api/super-admin/refund-management/${refundId}/process`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            // Toast Sukses
            addToast(
                `Refund berhasil ${
                    status === "Selesai" ? "diselesaikan" : "ditolak"
                }!`,
                "success"
            );

            closeModals();
            fetchRefunds(currentPage, searchTerm);
        } catch (err) {
            console.error("Gagal proses refund:", err);
            // Toast Gagal
            addToast(
                err.response?.data?.message || "Gagal memproses refund.",
                "error"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Helper Lihat Bukti Customer ---
    const viewCustomerProof = async (refundId) => {
        try {
            const response = await apiClient.get(
                `/api/super-admin/refund-management/${refundId}/customer-proof`,
                { responseType: "blob", headers: { Accept: "image/*" } }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            window.open(url, "_blank");
        } catch (err) {
            // Toast Error Image
            addToast("Bukti tidak ditemukan atau gagal dimuat.", "error");
        }
    };

    return (
        <div className="space-y-6 p-6 pb-20 font-sans text-gray-600">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        Manajemen Refund
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola pengajuan pengembalian dana customer.
                    </p>
                </div>

                <div className="relative w-full md:w-72">
                    <input
                        type="text"
                        placeholder="Cari ID, Customer, Bank..."
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

            {/* Tabel Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Info Bank</th>
                                <th className="px-6 py-4">Nominal Refund</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                                        <p className="mt-2 text-sm text-gray-400">
                                            Memuat data refund...
                                        </p>
                                    </td>
                                </tr>
                            ) : refunds.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-12 text-center text-gray-400 italic"
                                    >
                                        Belum ada pengajuan refund.
                                    </td>
                                </tr>
                            ) : (
                                refunds.map((refund) => (
                                    <tr
                                        key={refund.id}
                                        className="hover:bg-blue-50/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                                #{refund.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">
                                                {refund.customer?.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {refund.customer?.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">
                                                {refund.nama_bank}
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono mt-0.5">
                                                {refund.nomor_rekening}
                                            </div>
                                            <div className="text-xs italic text-gray-400">
                                                a.n{" "}
                                                {refund.nama_pemilik_rekening}
                                            </div>

                                            {refund.bukti_refund_customer && (
                                                <button
                                                    onClick={() =>
                                                        viewCustomerProof(
                                                            refund.id
                                                        )
                                                    }
                                                    className="text-blue-600 text-xs hover:text-blue-800 hover:underline flex items-center gap-1 mt-2 font-medium transition"
                                                >
                                                    <Eye size={12} /> Lihat
                                                    Bukti
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-extrabold text-gray-900">
                                            {formatCurrency(
                                                refund.jumlah_refund
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge
                                                status={refund.status}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {refund.status ===
                                            "Menunggu Proses" ? (
                                                <div className="flex justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() =>
                                                            openAcceptModal(
                                                                refund
                                                            )
                                                        }
                                                        title="Setujui"
                                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 hover:scale-105 transition shadow-sm border border-green-200"
                                                    >
                                                        <CheckCircle
                                                            size={18}
                                                        />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            openRejectModal(
                                                                refund
                                                            )
                                                        }
                                                        title="Tolak"
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:scale-105 transition shadow-sm border border-red-200"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic font-medium">
                                                    Selesai
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Component */}
                <Pagination meta={pagination} onPageChange={handlePageChange} />
            </div>

            {/* Modals */}
            <AcceptModal
                isOpen={isAcceptOpen}
                onClose={closeModals}
                refund={selectedRefund}
                isSubmitting={isSubmitting}
                onConfirm={(file) =>
                    processRefundAPI(selectedRefund.id, "Selesai", file)
                }
            />

            <RejectModal
                isOpen={isRejectOpen}
                onClose={closeModals}
                refund={selectedRefund}
                isSubmitting={isSubmitting}
                onConfirm={() => processRefundAPI(selectedRefund.id, "Ditolak")}
            />
        </div>
    );
}
