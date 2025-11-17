import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../../api/axios";
import DeleteModal from "./modals/DeleteModal";

// --- Komponen Ikon (Ikon Lama) ---
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
        className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
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
        className="text-red-500 hover:text-red-700 transition-colors duration-200"
    >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);
const ChevronDownIconMini = () => (
    <svg
        className="w-4 h-4 ml-1 inline-block text-gray-600 group-hover:text-gray-800"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
        />
    </svg>
);

// --- TAMBAHAN IKON BARU UNTUK METODE ---
const VideoIcon = () => (
    <svg
        className="w-4 h-4 text-blue-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z"
        />
    </svg>
);
const PhoneIcon = () => (
    <svg
        className="w-4 h-4 text-green-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.211-.99-.553-1.348l-3.04-3.04c-.34-.34-.832-.553-1.348-.553h-1.372a2.25 2.25 0 0 0-2.25 2.25v1.372c0 .516.211.99.553 1.348l3.04 3.04c.34.34.832.553 1.348.553h1.372c.621 0 1.125-.504 1.125-1.125V19.5a.75.75 0 0 0-.75-.75h-2.25C6.75 18.75 2.25 14.284 2.25 6.75Z"
        />
    </svg>
);
const ChatIcon = () => (
    <svg
        className="w-4 h-4 text-purple-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-3.694 8.25-8.25 8.25a8.25 8.25 0 0 1-8.25-8.25c0-4.556 3.694-8.25 8.25-8.25a8.25 8.25 0 0 1 8.25 8.25Z"
        />
    </svg>
);
// --- AKHIR IKON BARU ---

// --- Komponen Status Dropdown (Tidak Berubah) ---
const StatusDropdown = ({ currentStatus, bookingId, onStatusChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const statuses = [
        "Menunggu Konfirmasi",
        "Dijadwalkan",
        "Berlangsung",
        "Selesai",
        "Batal",
    ];
    const statusStyles = {
        Selesai: "bg-green-100 text-green-700 border-green-200",
        Batal: "bg-red-100 text-red-700 border-red-200",
        Proses: "bg-yellow-100 text-yellow-700 border-yellow-200",
        Dijadwalkan: "bg-blue-100 text-blue-700 border-blue-200",
        Berlangsung: "bg-purple-100 text-purple-700 border-purple-200",
        "Menunggu Konfirmasi": "bg-gray-100 text-gray-700 border-gray-200",
    };
    const hoverStyles = {
        Selesai: "hover:bg-green-200",
        Batal: "hover:bg-red-200",
        Proses: "hover:bg-yellow-200",
        Dijadwalkan: "hover:bg-blue-200",
        Berlangsung: "hover:bg-purple-200",
        "Menunggu Konfirmasi": "hover:bg-gray-200",
    };

    const handleChange = (newStatus) => {
        if (newStatus !== currentStatus) {
            onStatusChange(bookingId, newStatus);
        }
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && !event.target.closest(`.dropdown-${bookingId}`)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, bookingId]);

    return (
        <div
            className={`relative inline-block text-left dropdown-${bookingId}`}
        >
            <div>
                <button
                    type="button"
                    className={`inline-flex items-center justify-center w-full rounded-full border shadow-sm px-3 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-indigo-500 group transition-colors duration-150 ${
                        statusStyles[currentStatus] ||
                        statusStyles["Menunggu Konfirmasi"]
                    }`}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                >
                    {currentStatus}
                    <ChevronDownIconMini />
                </button>
            </div>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                    <div
                        className="py-1"
                        role="menu"
                        aria-orientation="vertical"
                    >
                        {statuses.map((status) => (
                            <button
                                key={status}
                                onClick={() => handleChange(status)}
                                disabled={status === currentStatus}
                                className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-150 
                                        ${
                                            statusStyles[status] ||
                                            statusStyles["Menunggu Konfirmasi"]
                                        } 
                                        ${
                                            status !== currentStatus
                                                ? `${hoverStyles[status]} text-gray-900`
                                                : "opacity-50 cursor-not-allowed"
                                        }
                                      `}
                                role="menuitem"
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Komponen Utama Halaman ---
const JadwalKonsultasiPage = () => {
    const [jadwalList, setJadwalList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState("");
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedJadwal, setSelectedJadwal] = useState(null);

    // --- Fungsi Fetch Data (Tidak Berubah) ---
    const fetchData = async () => {
        try {
            setLoading(true);
            const params = filterStatus ? { status: filterStatus } : {};
            const response = await apiClient.get(
                "/api/admin/jadwal-konsultasi",
                { params }
            );
            setJadwalList(response.data);
            setError(null);
        } catch (err) {
            setError("Gagal memuat jadwal konsultasi.");
            console.error("Fetch Jadwal Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filterStatus]);

    // --- Fungsi Hapus (Tidak Berubah) ---
    const handleDelete = async () => {
        if (!selectedJadwal) return;
        try {
            await apiClient.delete(
                `/api/admin/jadwal-konsultasi/${selectedJadwal.id}`
            );
            setDeleteModalOpen(false);
            setSelectedJadwal(null);
            fetchData();
        } catch (err) {
            console.error("Gagal menghapus jadwal:", err);
        }
    };

    const openModal = (setter, jadwal = null) => {
        setSelectedJadwal(jadwal);
        setter(true);
    };

    // --- Fungsi Format Tanggal (Tidak Berubah) ---
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return date
                .toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                })
                .replace(/ /g, "-");
        } catch (e) {
            console.error("Format date error:", e);
            return "Invalid Date";
        }
    };

    // --- Fungsi Update Status (Tidak Berubah) ---
    const handleStatusChange = async (bookingId, newStatus) => {
        const oldJadwalList = [...jadwalList];
        try {
            setJadwalList((prevList) =>
                prevList.map((jadwal) =>
                    jadwal.id === bookingId
                        ? { ...jadwal, status_pesanan: newStatus }
                        : jadwal
                )
            );

            await apiClient.patch(
                `/api/admin/jadwal-konsultasi/${bookingId}/status`,
                {
                    status_pesanan: newStatus,
                }
            );
        } catch (err) {
            console.error("Gagal mengubah status jadwal:", err);
            setJadwalList(oldJadwalList);
            alert(`Gagal mengubah status: ${err.message}`);
        }
    };

    const filterOptions = [
        "Semua Status",
        "Menunggu Konfirmasi",
        "Dijadwalkan",
        "Berlangsung",
        "Selesai",
        "Batal",
    ];

    // --- Render JSX ---
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Jadwal Konsultasi {filterStatus && `(${filterStatus})`}
                </h1>
                {/* Dropdown Filter Status (Tidak Berubah) */}
                <div className="relative">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="appearance-none w-48 px-4 py-2 pr-8 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700"
                    >
                        {filterOptions.map((option) => (
                            <option
                                key={option}
                                value={option === "Semua Status" ? "" : option}
                            >
                                {option}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg
                            className="fill-current h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* --- PERBAIKAN TAMPILAN TABEL --- */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left text-sm">
                    {/* Header Tabel Lebih Rapi */}
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="p-3">ID Pemesanan</th>
                            <th className="p-3">Tanggal</th>
                            <th className="p-3">Jam</th>
                            <th className="p-3">Jenis Konsultasi</th>
                            <th className="p-3">Nama Customer</th>
                            <th className="p-3">Metode</th>{" "}
                            {/* <-- KOLOM BARU */}
                            <th className="p-3">Status</th>
                            <th className="p-3">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {loading ? (
                            <tr>
                                {/* --- COLSPAN DIPERBARUI --- */}
                                <td colSpan="8" className="p-4 text-center">
                                    Memuat jadwal...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                {/* --- COLSPAN DIPERBARUI --- */}
                                <td
                                    colSpan="8"
                                    className="p-4 text-center text-red-500"
                                >
                                    {error}
                                </td>
                            </tr>
                        ) : jadwalList.length > 0 ? (
                            jadwalList.map((jadwal) => (
                                <tr
                                    key={jadwal.id}
                                    className="border-t hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <td className="p-3 font-mono text-gray-500">{`#${String(
                                        jadwal.id
                                    ).padStart(7, "0")}`}</td>
                                    <td className="p-3">
                                        {formatDate(jadwal.tanggal_konsultasi)}
                                    </td>
                                    <td className="p-3">
                                        {jadwal.jam_konsultasi}
                                    </td>
                                    <td className="p-3">
                                        {jadwal.jenis_konseling
                                            ?.jenis_konseling || "N/A"}
                                    </td>

                                    {/* --- AVATAR CUSTOMER DITAMBAHKAN --- */}
                                    <td className="p-3 font-medium text-gray-800">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${jadwal.customer?.name}&background=EBF4FF&color=3B82F6&size=32&rounded=true`}
                                                alt="Avatar"
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <span>
                                                {jadwal.customer?.name || "N/A"}
                                            </span>
                                        </div>
                                    </td>

                                    {/* --- KOLOM METODE BARU DENGAN IKON --- */}
                                    <td className="p-3">
                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium">
                                            {jadwal.metode_konsultasi ===
                                                "Video Call" && <VideoIcon />}
                                            {jadwal.metode_konsultasi ===
                                                "Call" && <PhoneIcon />}
                                            {jadwal.metode_konsultasi ===
                                                "Chat" && <ChatIcon />}
                                            {jadwal.metode_konsultasi}
                                        </span>
                                    </td>

                                    <td className="p-3">
                                        <StatusDropdown
                                            currentStatus={
                                                jadwal.status_pesanan
                                            }
                                            bookingId={jadwal.id}
                                            onStatusChange={handleStatusChange}
                                        />
                                    </td>
                                    <td className="p-3 flex gap-2 items-center">
                                        <Link
                                            to={`/admin/jadwal-konsultasi/${jadwal.id}`}
                                            title="Lihat Detail"
                                            className="p-1 rounded hover:bg-blue-100"
                                        >
                                            <DetailIcon />
                                        </Link>
                                        <button
                                            onClick={() =>
                                                openModal(
                                                    setDeleteModalOpen,
                                                    jadwal
                                                )
                                            }
                                            title="Hapus Jadwal"
                                            className="p-1 rounded hover:bg-red-100"
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                {/* --- COLSPAN DIPERBARUI --- */}
                                <td
                                    colSpan="8"
                                    className="p-4 text-center text-gray-500"
                                >
                                    Tidak ada jadwal konsultasi{" "}
                                    {filterStatus &&
                                        `dengan status "${filterStatus}"`}
                                    .
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
                bookingId={selectedJadwal?.id}
            />
        </div>
    );
};

export default JadwalKonsultasiPage;
