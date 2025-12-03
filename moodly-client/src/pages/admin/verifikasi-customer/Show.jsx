import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios";
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    Loader2,
    Home,
} from "lucide-react";

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
            className={`px-3 py-1 text-xs font-bold rounded-full border ${currentStyle}`}
        >
            {status}
        </span>
    );
};

// --- Komponen Detail Field (Cyan Style) ---
const DetailField = ({ label, value, icon: Icon, className = "" }) => (
    <div className={className}>
        <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 flex items-center gap-1.5">
            {Icon && <Icon size={14} className="text-cyan-500" />} {label}
        </label>
        <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm font-medium shadow-sm">
            {value || <span className="text-gray-400 italic">-</span>}
        </div>
    </div>
);

// --- Helper Format Tanggal ---
const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch (e) {
        return dateString;
    }
};

const VerifikasiCustomerDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // 2. Panggil Hook Toast
    const { addToast } = useToast();

    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State Modal
    const [isApproveModalOpen, setApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setRejectModalOpen] = useState(false);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(
                    `/api/admin/verifikasi-customer/${id}`
                );
                setCustomer(response.data);
                setError(null);
            } catch (error) {
                setError("Gagal memuat detail customer.");
                addToast("Gagal memuat detail customer.", "error");
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomer();
    }, [id]);

    // --- Handlers Verifikasi ---
    const handleApprove = async () => {
        try {
            await apiClient.post(
                `/api/admin/verifikasi-customer/${id}/approve`
            );
            setApproveModalOpen(false);
            addToast("Customer berhasil diverifikasi!", "success");
            navigate("/admin/verifikasi-customer");
        } catch (err) {
            console.error("Gagal approve:", err);
            addToast("Gagal menyetujui customer.", "error");
        }
    };

    const handleReject = async (reason = null) => {
        try {
            await apiClient.post(
                `/api/admin/verifikasi-customer/${id}/reject`,
                {
                    alasan_ditolak: reason,
                }
            );
            setRejectModalOpen(false);
            addToast("Verifikasi customer ditolak.", "info");
            navigate("/admin/verifikasi-customer");
        } catch (err) {
            console.error("Gagal reject:", err);
            addToast("Gagal menolak customer.", "error");
        }
    };

    if (loading)
        return (
            <div className="p-10 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent mb-2"></div>
                <p>Memuat data verifikasi...</p>
            </div>
        );
    if (error)
        return <div className="p-10 text-center text-red-500">{error}</div>;
    if (!customer)
        return <div className="p-10 text-center">Data tidak ditemukan.</div>;

    const needsAction =
        customer.status === "Verifikasi" ||
        customer.status === "Menunggu Verifikasi";
    const birthDate = customer.dob || customer.tanggal_lahir;

    // Format Detail Alamat (Tanpa Kota, karena sudah ada field sendiri)
    const addressDetails = [
        customer.district && `Kec. ${customer.district}`,
        customer.province,
        customer.postal_code,
    ]
        .filter(Boolean)
        .join(", ");

    return (
        <div className="p-6 bg-gray-50 min-h-screen pb-20">
            {/* Header Navigation */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/admin/verifikasi-customer")}
                        className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm text-gray-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
                            Detail Verifikasi Customer
                        </h1>
                        <p className="text-sm text-gray-500">
                            Tinjau data diri customer baru.
                        </p>
                    </div>
                </div>

                {needsAction && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setRejectModalOpen(true)}
                            className="px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition flex items-center gap-2 shadow-sm"
                        >
                            <XCircle size={18} /> Tolak
                        </button>
                        <button
                            onClick={() => setApproveModalOpen(true)}
                            className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center gap-2"
                        >
                            <CheckCircle size={18} /> Setujui
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Profile Header Section */}
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-b from-white to-gray-50/50">
                    <div className="relative group">
                        <img
                            src={
                                customer.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    customer.name
                                )}&background=EBF4FF&color=3B82F6&size=128&bold=true`
                            }
                            alt={customer.name}
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                        />
                        <div className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
                            <Shield size={16} className="text-cyan-500" />
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
                            {customer.name}
                        </h2>
                        <p className="text-gray-500 font-medium mb-3 flex items-center justify-center md:justify-start gap-2">
                            <Mail size={16} /> {customer.email}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <StatusBadge status={customer.status} />
                            <span className="text-xs text-gray-400 font-mono px-2 py-1 bg-gray-50 rounded border border-gray-100">
                                ID: #{customer.id}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Detail Grid */}
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <h3 className="md:col-span-2 text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-2 flex items-center gap-2">
                            <User size={20} className="text-cyan-600" />{" "}
                            Informasi Pribadi
                        </h3>

                        <DetailField
                            label="Nama Lengkap"
                            value={customer.name}
                        />
                        <DetailField
                            label="Nomor Telepon"
                            value={customer.phone}
                            icon={Phone}
                        />
                        <DetailField
                            label="Jenis Kelamin"
                            value={customer.gender}
                            icon={User}
                        />
                        <DetailField
                            label="Tanggal Lahir"
                            value={formatDate(birthDate)}
                            icon={Calendar}
                        />

                        <div className="md:col-span-2 mt-4">
                            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                                <MapPin size={20} className="text-red-500" />{" "}
                                Alamat & Lokasi
                            </h3>
                        </div>

                        <DetailField
                            label="Kota Domisili"
                            value={customer.city}
                        />

                        {/* CARD ALAMAT LENGKAP */}
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 flex items-center gap-1.5">
                                <Home size={14} className="text-cyan-500" />{" "}
                                Detail Alamat
                            </label>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <p className="text-gray-900 font-medium text-sm leading-relaxed mb-1">
                                    {customer.street_address || (
                                        <span className="text-gray-400 italic">
                                            Jalan belum diisi
                                        </span>
                                    )}
                                </p>
                                {addressDetails && (
                                    <p className="text-gray-500 text-xs">
                                        {addressDetails}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Jika Ditolak, Tampilkan Alasan */}
                    {customer.status === "Ditolak" &&
                        customer.alasan_ditolak && (
                            <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl text-red-800 text-sm shadow-sm flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold block mb-1">
                                        Verifikasi Ditolak
                                    </span>
                                    <p>"{customer.alasan_ditolak}"</p>
                                </div>
                            </div>
                        )}
                </div>
            </div>

            {/* Modals */}
            <ApproveModal
                isOpen={isApproveModalOpen}
                onClose={() => setApproveModalOpen(false)}
                onConfirm={handleApprove}
                customerName={customer.name}
            />
            <RejectModal
                isOpen={isRejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                onConfirm={handleReject}
                customerName={customer.name}
            />
        </div>
    );
};

export default VerifikasiCustomerDetailPage;
