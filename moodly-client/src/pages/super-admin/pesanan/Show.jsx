import React, { useState, useEffect } from "react";
// --- TAMBAHAN BARU ---
import { useParams, Link, useNavigate } from "react-router-dom";
// --- AKHIR TAMBAHAN BARU ---
import apiClient from "../../../api/axios";

// --- KOMPONEN BARU: Badge Status (dikutip dari Index.jsx) ---
const StatusBadge = ({ status }) => {
    const styles = {
        Selesai: "bg-green-100 text-green-700",
        Batal: "bg-red-100 text-red-700",
        Proses: "bg-yellow-100 text-yellow-700",
        Dijadwalkan: "bg-blue-100 text-blue-700",
        "Menunggu Konfirmasi": "bg-gray-100 text-gray-700",
        "Menunggu Pembayaran": "bg-yellow-100 text-yellow-700",
        "Menunggu Verifikasi": "bg-purple-100 text-purple-700 font-bold", // <-- BUTUH AKSI
        "Pembayaran Ditolak": "bg-red-100 text-red-700",
    };
    return (
        <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${
                styles[status] || "bg-gray-100 text-gray-700"
            }`}
        >
            {status}
        </span>
    );
};
// --- AKHIR KOMPONEN BARU ---

// Komponen DetailField & BackIcon (sama seperti sebelumnya)
const DetailField = ({ label, value, isFullWidth = false }) => (
    <div className={isFullWidth ? "col-span-1 md:col-span-2" : ""}>
        <label className="text-sm text-gray-500">{label}</label>
        <div className="w-full px-4 py-2 mt-1 bg-gray-100 border rounded-lg text-gray-800 break-words">
            {value || "-"}
        </div>
    </div>
);
const BackIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

// --- KOMPONEN BARU: Modal Penolakan ---
const RejectModal = ({ isOpen, onClose, onSubmit, loading }) => {
    const [reason, setReason] = useState("");

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!reason.trim()) {
            alert("Alasan penolakan tidak boleh kosong.");
            return;
        }
        onSubmit(reason);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Tolak Pembayaran</h3>
                </div>
                <div className="p-6 space-y-4">
                    <label
                        htmlFor="rejectReason"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Alasan Penolakan (Wajib)
                    </label>
                    <textarea
                        id="rejectReason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="Contoh: Bukti transfer tidak jelas / jumlah tidak sesuai."
                    />
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:bg-gray-400"
                    >
                        {loading ? "Menolak..." : "Tolak Pembayaran"}
                    </button>
                </div>
            </div>
        </div>
    );
};
// --- AKHIR KOMPONEN BARU ---

const BookingDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate(); // <-- HOOK BARU
    const [booking, setBooking] = useState(null);

    // --- STATE BARU ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Untuk tombol approve/reject
    const [actionError, setActionError] = useState(null); // Error di form
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    // --- AKHIR STATE BARU ---

    useEffect(() => {
        const fetchBooking = async () => {
            // --- PERBAIKAN: Tambah state loading/error ---
            try {
                setLoading(true);
                setError(null);
                const response = await apiClient.get(
                    `/api/super-admin/booking-management/${id}`
                );
                setBooking(response.data);
            } catch (error) {
                console.error("Gagal load detail:", error);
                setError("Gagal memuat detail pesanan.");
            } finally {
                setLoading(false);
            }
            // --- AKHIR PERBAIKAN ---
        };
        fetchBooking();
    }, [id]);

    // --- FUNGSI HELPER BARU ---
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch (e) {
            return "Invalid Date";
        }
    };
    const formatRupiah = (number) => {
        if (typeof number !== "number") return "-";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number);
    };
    // --- AKHIR FUNGSI HELPER BARU ---

    // --- FUNGSI AKSI BARU ---
    const handleApprove = async () => {
        if (
            !window.confirm(
                "Apakah Anda yakin ingin menyetujui pembayaran ini? Status akan diubah menjadi 'Dijadwalkan'."
            )
        )
            return;

        setIsSubmitting(true);
        setActionError(null);
        try {
            await apiClient.post(
                `/api/super-admin/booking-management/${id}/approve-payment`
            );
            alert("Pembayaran berhasil disetujui!");
            navigate("/admin/booking-management"); // Kembali ke daftar
        } catch (err) {
            console.error("Error approving payment:", err);
            setActionError(
                err.response?.data?.message || "Gagal menyetujui pembayaran."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async (reason) => {
        setIsSubmitting(true);
        setActionError(null);
        try {
            await apiClient.post(
                `/api/super-admin/booking-management/${id}/reject-payment`,
                { reason } // Kirim alasan ke backend
            );
            alert("Pembayaran berhasil ditolak.");
            setIsRejectModalOpen(false); // Tutup modal
            navigate("/admin/booking-management"); // Kembali ke daftar
        } catch (err) {
            console.error("Error rejecting payment:", err);
            setActionError(
                err.response?.data?.message || "Gagal menolak pembayaran."
            );
        } finally {
            setIsSubmitting(false);
        }
    };
    // --- AKHIR FUNGSI AKSI BARU ---

    // --- PERBAIKAN: State Loading/Error Utama ---
    if (loading) return <div className="p-6">Memuat detail pesanan...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    // --- AKHIR PERBAIKAN ---

    if (!booking) return <div className="p-6">Pesanan tidak ditemukan.</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <Link
                    to="/admin/booking-management"
                    className="flex items-center gap-3 text-gray-600 hover:text-gray-900"
                >
                    <BackIcon />{" "}
                    <h1 className="text-2xl font-bold">Detail Pesanan</h1>
                </Link>
            </div>
            <div className="bg-white rounded-lg shadow-md p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Kolom Kiri */}
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-xl font-bold text-gray-800">{`#${String(
                            booking.id
                        ).padStart(5, "0")}`}</span>
                        {/* --- PERBAIKAN: Gunakan StatusBadge --- */}
                        <StatusBadge status={booking.status_pesanan} />
                        {/* --- AKHIR PERBAIKAN --- */}
                    </div>

                    <h3 className="text-lg font-semibold mb-3">
                        Informasi Pelanggan
                    </h3>
                    <DetailField
                        label="Nama Lengkap"
                        value={booking.customer?.name}
                    />
                    <DetailField
                        label="Email"
                        value={booking.customer?.email}
                    />
                    <DetailField
                        label="Nomor Telepon"
                        value={
                            booking.customer?.phone ||
                            booking.customer?.nomor_telepon
                        }
                    />

                    <h3 className="text-lg font-semibold mt-6 mb-3">
                        Informasi Konselor
                    </h3>
                    <DetailField
                        label="Nama Lengkap"
                        value={booking.konselor?.name}
                    />
                    <DetailField
                        label="Email"
                        value={booking.konselor?.email}
                    />
                    <DetailField
                        label="Nomor Telepon"
                        value={
                            booking.konselor?.phone ||
                            booking.konselor?.nomor_telepon
                        }
                    />
                </div>

                {/* Kolom Kanan */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">
                        Informasi Pesanan
                    </h3>
                    <DetailField
                        label="Tanggal Order"
                        value={formatDate(booking.created_at)}
                    />
                    <DetailField
                        label="Jenis Konsultasi"
                        value={booking.jenis_konseling?.jenis_konseling}
                    />
                    {/* --- PERBAIKAN: Un-comment --- */}
                    <DetailField
                        label="Durasi Konseling"
                        value={`${
                            booking.durasi_konseling?.durasi_menit || "N/A"
                        } Menit`}
                    />
                    {/* --- AKHIR PERBAIKAN --- */}
                    <DetailField
                        label="Tanggal Konseling"
                        value={formatDate(booking.tanggal_konsultasi)}
                    />
                    <DetailField
                        label="Waktu Konseling"
                        value={booking.jam_konsultasi}
                    />
                    <DetailField
                        label="Metode Konsultasi"
                        value={booking.metode_konsultasi}
                    />
                    {/* --- PERBAIKAN: Un-comment --- */}
                    <DetailField
                        label="Tempat Konseling"
                        value={booking.tempat_konseling?.nama_tempat}
                    />
                    {/* --- AKHIR PERBAIKAN --- */}
                    <DetailField
                        label="Total Harga"
                        value={formatRupiah(booking.total_harga)}
                    />
                    {/* --- PERBAIKAN: Tampilkan alasan penolakan jika ada --- */}
                    {booking.status_pesanan === "Pembayaran Ditolak" && (
                        <DetailField
                            label="Alasan Penolakan"
                            value={booking.catatan_pembatalan}
                        />
                    )}
                    {/* --- AKHIR PERBAIKAN --- */}
                </div>

                {/* --- BLOK VERIFIKASI BARU (Tampil jika ada bukti) --- */}
                {booking.payment_proof_image_url && (
                    <div className="md:col-span-2 mt-6 pt-6 border-t">
                        <h3 className="text-lg font-semibold mb-3">
                            Bukti Pembayaran
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Kiri: Gambar Bukti */}
                            <div>
                                <a
                                    href={booking.payment_proof_image_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src={booking.payment_proof_image_url}
                                        alt="Bukti Pembayaran"
                                        className="w-full max-w-sm h-auto rounded-lg border shadow-sm object-contain"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                                "https://placehold.co/400x400/FFF/333?text=Gambar+Rusak";
                                        }}
                                    />
                                </a>
                            </div>
                            {/* Kanan: Catatan & Aksi */}
                            <div>
                                <DetailField
                                    label="Catatan dari Customer"
                                    value={booking.payment_proof_notes}
                                />

                                {/* Tampilkan Tombol Aksi HANYA jika status = Menunggu Verifikasi */}
                                {booking.status_pesanan ===
                                    "Menunggu Verifikasi" && (
                                    <div className="mt-6">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                                            Aksi Verifikasi
                                        </h4>
                                        {actionError && (
                                            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm mb-4">
                                                {actionError}
                                            </div>
                                        )}
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() =>
                                                    setIsRejectModalOpen(true)
                                                }
                                                disabled={isSubmitting}
                                                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:bg-gray-400"
                                            >
                                                {isSubmitting
                                                    ? "Loading..."
                                                    : "Tolak Pembayaran"}
                                            </button>
                                            <button
                                                onClick={handleApprove}
                                                disabled={isSubmitting}
                                                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:bg-gray-400"
                                            >
                                                {isSubmitting
                                                    ? "Loading..."
                                                    : "Setujui Pembayaran"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {/* --- AKHIR BLOK VERIFIKASI BARU --- */}
            </div>

            {/* Render Modal Penolakan */}
            <RejectModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                onSubmit={handleReject}
                loading={isSubmitting}
            />
        </div>
    );
};

export default BookingDetailPage;
