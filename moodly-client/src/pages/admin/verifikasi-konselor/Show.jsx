import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios";
import {
    ArrowLeft,
    Star,
    CheckCircle,
    XCircle,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    Home,
    GraduationCap,
    FileText,
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
    return (
        <span
            className={`px-3 py-1 text-xs font-bold rounded-full border ${
                styles[status] || "bg-gray-50 text-gray-600 border-gray-200"
            }`}
        >
            {status}
        </span>
    );
};

// --- Komponen Detail Field (Read Only Style Cyan) ---
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

// --- Helper Format ---
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

const VerifikasiDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // 2. Panggil Hook Toast
    const { addToast } = useToast();

    // Data State
    const [konselor, setKonselor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal State
    const [isApproveModalOpen, setApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    // Fetch Data
    useEffect(() => {
        const fetchKonselor = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(
                    `/api/admin/verifikasi-konselor/${id}`
                );
                setKonselor(response.data);
                setError(null);
            } catch (err) {
                setError("Gagal memuat detail konselor.");
                addToast("Gagal memuat data konselor.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchKonselor();
    }, [id]);

    // --- Handlers Verifikasi ---
    const handleApprove = async () => {
        try {
            await apiClient.post(
                `/api/admin/verifikasi-konselor/${id}/approve`
            );
            setApproveModalOpen(false);
            addToast("Konselor berhasil diverifikasi!", "success");
            navigate("/admin/verifikasi-konselor");
        } catch (err) {
            console.error("Gagal approve:", err);
            addToast("Gagal menyetujui verifikasi.", "error");
        }
    };

    const handleReject = async (reason) => {
        try {
            await apiClient.post(
                `/api/admin/verifikasi-konselor/${id}/reject`,
                { alasan_ditolak: reason }
            );
            setRejectModalOpen(false);
            addToast("Verifikasi konselor ditolak.", "info");
            navigate("/admin/verifikasi-konselor");
        } catch (err) {
            console.error("Gagal reject:", err);
            addToast("Gagal menolak verifikasi.", "error");
        }
    };

    if (loading)
        return (
            <div className="p-10 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-500 border-t-transparent mb-2"></div>
                <p>Memuat detail...</p>
            </div>
        );
    if (error)
        return <div className="p-10 text-center text-red-500">{error}</div>;
    if (!konselor)
        return (
            <div className="p-10 text-center text-gray-500">
                Data tidak ditemukan.
            </div>
        );

    // Data Helper
    const birthDate = konselor.dob || konselor.tanggal_lahir;
    const addressParts = [
        konselor.street_address,
        konselor.district ? `Kec. ${konselor.district}` : null,
        konselor.city,
        konselor.province,
        konselor.postal_code,
    ]
        .filter(Boolean)
        .join(", ");

    // Render Spesialisasi
    const renderSpesialisasi = () => {
        if (!konselor.spesialisasi || konselor.spesialisasi.length === 0)
            return <span className="text-gray-400 italic">-</span>;

        const list = Array.isArray(konselor.spesialisasi)
            ? konselor.spesialisasi
            : [];
        return (
            <div className="flex flex-wrap gap-2 mt-1">
                {list.map((spec, idx) => (
                    <span
                        key={idx}
                        className="px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-100 rounded-full text-xs font-bold"
                    >
                        {spec}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen pb-20">
            {/* Header Navigation */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/admin/verifikasi-konselor")}
                        className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm text-gray-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Detail Verifikasi
                        </h1>
                        <p className="text-sm text-gray-500">
                            Tinjau data diri dan dokumen profesional.
                        </p>
                    </div>
                </div>

                {/* Tombol Aksi Verifikasi (Hanya jika status Verifikasi) */}
                {(konselor.status === "Verifikasi" ||
                    konselor.status === "Menunggu Verifikasi") && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setRejectModalOpen(true)}
                            className="px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 flex items-center gap-2 shadow-sm transition-all"
                        >
                            <XCircle size={18} /> Tolak
                        </button>
                        <button
                            onClick={() => setApproveModalOpen(true)}
                            className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-200 transition-all"
                        >
                            <CheckCircle size={18} /> Setujui
                        </button>
                    </div>
                )}
            </div>

            {/* Konten Utama */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-8">
                {/* Header Profil */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-gray-100">
                    <img
                        src={
                            konselor.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                konselor.name
                            )}&background=ECFEFF&color=0891b2&size=128&bold=true`
                        }
                        alt="Avatar"
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 shadow-sm"
                    />
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-extrabold text-gray-900">
                            {konselor.name}
                        </h2>
                        <p className="text-gray-500 font-medium mt-1 flex items-center justify-center md:justify-start gap-2">
                            <Mail size={16} /> {konselor.email}
                        </p>
                        <div className="mt-3 flex items-center justify-center md:justify-start gap-3">
                            <StatusBadge status={konselor.status} />
                            <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded border border-gray-200">
                                ID: #{konselor.id}
                            </span>
                        </div>
                    </div>

                    {/* Statistik Singkat */}
                    <div className="md:ml-auto flex gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="text-center">
                            <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                                Bergabung
                            </p>
                            <p className="text-sm font-bold text-gray-800">
                                {formatDate(konselor.created_at)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Grid Detail 3 Kolom */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Kolom 1: Info Pribadi */}
                    <div className="space-y-5">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
                            <User size={18} className="text-cyan-500" /> Data
                            Diri
                        </h3>
                        <DetailField
                            label="Nama Lengkap"
                            value={konselor.name}
                        />
                        <DetailField
                            label="Jenis Kelamin"
                            value={konselor.gender}
                            icon={User}
                        />
                        <DetailField
                            label="Tanggal Lahir"
                            value={formatDate(birthDate)}
                            icon={Calendar}
                        />
                        <DetailField
                            label="Nomor Telepon"
                            value={konselor.phone}
                            icon={Phone}
                        />
                    </div>

                    {/* Kolom 2: Info Profesional */}
                    <div className="space-y-5">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
                            <Briefcase size={18} className="text-purple-500" />{" "}
                            Profesional
                        </h3>
                        <DetailField
                            label="Universitas Asal"
                            value={konselor.universitas}
                            icon={GraduationCap}
                        />
                        <DetailField
                            label="No. SIPP / STR"
                            value={konselor.surat_izin_praktik}
                            icon={FileText}
                        />

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                                <Star size={14} className="text-yellow-500" />{" "}
                                Spesialisasi
                            </label>
                            {renderSpesialisasi()}
                        </div>
                    </div>

                    {/* Kolom 3: Lokasi & Alamat */}
                    <div className="space-y-5">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
                            <MapPin size={18} className="text-red-500" /> Lokasi
                            Praktik
                        </h3>

                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm text-gray-600">
                                    <Home size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">
                                        Kota Domisili
                                    </p>
                                    <p className="font-bold text-gray-900 text-lg">
                                        {konselor.city || "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                                    Alamat Lengkap
                                </p>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {addressParts || (
                                        <span className="italic text-gray-400">
                                            Alamat belum dilengkapi.
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Jika Ditolak, Tampilkan Alasan (Full Width) */}
                    {konselor.status === "Ditolak" &&
                        konselor.alasan_ditolak && (
                            <div className="md:col-span-3 mt-4">
                                <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex gap-4 items-start">
                                    <XCircle className="text-red-600 w-6 h-6 mt-0.5 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-red-800 mb-1">
                                            Verifikasi Ditolak
                                        </h4>
                                        <p className="text-sm text-red-700">
                                            "{konselor.alasan_ditolak}"
                                        </p>
                                    </div>
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
                konselorName={konselor.name}
            />
            <RejectModal
                isOpen={isRejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                onConfirm={handleReject}
                konselorName={konselor.name}
                setReason={setRejectReason}
                reason={rejectReason}
            />
        </div>
    );
};

export default VerifikasiDetailPage;
