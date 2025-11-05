import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../../api/axios";
import DeleteModal from "./modals/DeleteModal";

// Ikon
const DetailIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-blue-500 hover:text-blue-700"
    >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);
const DeleteIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-red-500 hover:text-red-700"
    >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

// Badge Status
const StatusBadge = ({ status }) => {
    // --- PERBAIKAN: Tambahkan style untuk status baru ---
    const styles = {
        Selesai: "bg-green-100 text-green-700",
        Batal: "bg-red-100 text-red-700",
        Proses: "bg-yellow-100 text-yellow-700",
        Dijadwalkan: "bg-blue-100 text-blue-700",
        "Menunggu Konfirmasi": "bg-gray-100 text-gray-700",
        // --- TAMBAHAN BARU ---
        "Menunggu Pembayaran": "bg-yellow-100 text-yellow-700", // Status dari DB
        "Menunggu Verifikasi": "bg-purple-100 text-purple-700 font-bold", // <-- BUTUH AKSI
        "Pembayaran Ditolak": "bg-red-100 text-red-700", // <-- SAMA SEPERTI BATAL
        // --- AKHIR TAMBAHAN BARU ---
    };
    // --- AKHIR PERBAIKAN ---

    return (
        <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${
                // --- PERBAIKAN: Default fallback yang lebih aman ---
                styles[status] || "bg-gray-100 text-gray-700"
                // --- AKHIR PERBAIKAN ---
            }`}
        >
            {status}
        </span>
    );
};

const BookingManagementPage = () => {
    const [bookings, setBookings] = useState([]); // State untuk menyimpan data
    // ... (sisa file tidak berubah) ...
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Fungsi Fetch Data (diperiksa ulang)
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(
                "/api/super-admin/booking-management"
            );
            setBookings(response.data); // Pastikan data disimpan ke state 'bookings'
            setError(null);
        } catch (err) {
            setError("Gagal memuat data pesanan.");
            console.error("Error fetching bookings:", err); // Log error lebih detail
        } finally {
            setLoading(false);
        }
    };

    // useEffect untuk memanggil fetchData saat komponen pertama kali dimuat
    useEffect(() => {
        fetchData();
    }, []); // Array dependensi kosong memastikan ini hanya berjalan sekali

    // Fungsi Delete (diperiksa ulang)
    const handleDelete = async () => {
        // ... (sisa file tidak berubah) ...
        if (!selectedBooking) return; // Pastikan ada booking yang dipilih
        try {
            await apiClient.delete(
                `/api/super-admin/booking-management/${selectedBooking.id}`
            );
            setDeleteModalOpen(false);
            setSelectedBooking(null); // Reset booking yang dipilih
            fetchData(); // Muat ulang data setelah hapus
        } catch (err) {
            console.error("Gagal menghapus pesanan:", err);
            // TODO: Tampilkan notifikasi error ke pengguna
        }
    };

    // Fungsi untuk membuka modal (diperiksa ulang)
    const openModal = (setter, booking = null) => {
        // ... (sisa file tidak berubah) ...
        setSelectedBooking(booking); // Set booking yang dipilih
        setter(true);
    };

    // Fungsi format tanggal (diperiksa ulang)
    const formatDate = (dateString) => {
        // ... (sisa file tidak berubah) ...
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return "Invalid Date";
        }
    };

    // Tampilan Loading dan Error
    // ... (sisa file tidak berubah) ...
    if (loading) return <div className="p-6">Memuat data pesanan...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Pesanan</h1>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-blue-100">
                        <tr>
                            <th className="p-4">No</th>
                            <th className="p-4">ID Pelanggan</th>
                            <th className="p-4">Tanggal</th>
                            <th className="p-4">Nama Pelanggan</th>
                            <th className="p-4">Pilihan Konsultasi</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Pastikan kita map state 'bookings' */}
                        {bookings.length > 0 ? (
                            bookings.map((booking, index) => (
                                <tr
                                    key={booking.id}
                                    className="border-t hover:bg-gray-50"
                                >
                                    <td className="p-4">{index + 1}</td>
                                    <td className="p-4">{`#${String(
                                        booking.customer_id
                                    ).padStart(5, "0")}`}</td>
                                    <td className="p-4">
                                        {formatDate(booking.tanggal_konsultasi)}
                                    </td>
                                    {/* Akses nama customer dari relasi */}
                                    <td className="p-4 font-medium">
                                        {booking.customer?.name || "N/A"}
                                    </td>
                                    <td className="p-4">
                                        {booking.metode_konsultasi}
                                    </td>
                                    <td className="p-4">
                                        <StatusBadge
                                            status={booking.status_pesanan}
                                        />
                                    </td>
                                    <td className="p-4 flex gap-3 items-center">
                                        <Link
                                            to={`/admin/booking-management/${booking.id}`}
                                            title="Lihat Detail"
                                        >
                                            <DetailIcon />
                                        </Link>
                                        <button
                                            onClick={() =>
                                                openModal(
                                                    setDeleteModalOpen,
                                                    booking
                                                )
                                            }
                                            title="Hapus"
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="p-4 text-center text-gray-500"
                                >
                                    Tidak ada data pesanan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                bookingId={selectedBooking?.id}
            />
        </div>
    );
};

export default BookingManagementPage;
