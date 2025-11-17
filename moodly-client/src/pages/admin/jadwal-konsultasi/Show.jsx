import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import apiClient from "../../../api/axios";

// Komponen DetailField & BackIcon (tidak berubah)
const DetailField = ({ label, value }) => (
    <div>
        <label className="text-sm text-gray-500">{label}</label>
        <div className="w-full px-4 py-2 mt-1 bg-gray-100 border rounded-lg text-gray-800">
            {value || "-"}
        </div>
    </div>
);
const BackIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
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
// Star Icon (tidak berubah)
const StarIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-yellow-400"
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const JadwalDetailPage = () => {
    const { id } = useParams();
    const [jadwal, setJadwal] = useState(null);
    const [loading, setLoading] = useState(true);

    const [gmeetLink, setGmeetLink] = useState("");
    const [linkError, setLinkError] = useState(null);
    const [linkSuccess, setLinkSuccess] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchJadwal = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(
                    `/api/admin/jadwal-konsultasi/${id}`
                );
                setJadwal(response.data);
                setGmeetLink(response.data.gmeet_link || "");
            } catch (error) {
                console.error("Gagal load detail jadwal:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJadwal();
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const handleLinkSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setLinkError(null);
        setLinkSuccess(null);

        try {
            const response = await apiClient.post(
                `/api/admin/jadwal-konsultasi/${id}/update-gmeet`,
                { gmeet_link: gmeetLink }
            );

            setJadwal(response.data.booking);
            setGmeetLink(response.data.booking.gmeet_link || "");
            setLinkSuccess(
                response.data.message || "Link Gmeet berhasil diperbarui!"
            );
        } catch (error) {
            console.error("Gagal update Gmeet link:", error);
            if (error.response && error.response.status === 422) {
                setLinkError(error.response.data.errors.gmeet_link[0]);
            } else if (error.response && error.response.data.message) {
                setLinkError(error.response.data.message);
            } else {
                setLinkError("Terjadi kesalahan saat menyimpan link.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (!jadwal) return <div className="p-6">Data jadwal tidak ditemukan.</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <Link
                    to="/admin/jadwal-konsultasi"
                    className="flex items-center gap-3"
                >
                    <BackIcon />{" "}
                    <h1 className="text-2xl font-bold">
                        Detail Jadwal Konsultasi
                    </h1>
                </Link>
                <Link
                    to="/admin/jadwal-konsultasi"
                    className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Kembali
                </Link>
            </div>

            {/* BARIS DEBUG SUDAH DIHAPUS */}

            <div className="bg-white rounded-lg shadow-md p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Kolom Kiri: Info Customer (tidak berubah) */}
                <div>
                    <div className="flex items-center gap-6 mb-8">
                        <img
                            src={`https://ui-avatars.com/api/?name=${jadwal.customer?.name}&background=EBF4FF&color=3B82F6&size=128`}
                            alt="Avatar Customer"
                            className="w-24 h-24 rounded-full"
                        />
                        <div>
                            <h2 className="text-2xl font-bold">
                                {jadwal.customer?.name}
                            </h2>
                            <p className="text-gray-500">
                                {jadwal.customer?.email}
                            </p>
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-2">
                        Informasi Customer
                    </h3>
                    <DetailField
                        label="Nama Lengkap"
                        value={jadwal.customer?.name}
                    />
                    <DetailField label="Email" value={jadwal.customer?.email} />
                    <DetailField
                        label="Nomor Telepon"
                        value={jadwal.customer?.phone}
                    />
                    <DetailField label="Kota" value={jadwal.customer?.city} />
                </div>

                {/* Kolom Kanan: Info Konsultasi (tidak berubah) */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">
                        Informasi Konsultasi
                    </h3>
                    <DetailField
                        label="ID Pemesanan"
                        value={`#${String(jadwal.id).padStart(7, "0")}`}
                    />
                    <DetailField
                        label="Nama Konselor"
                        value={jadwal.konselor?.name}
                    />
                    <DetailField
                        label="Jenis Konsultasi"
                        value={jadwal.jenis_konseling?.jenis_konseling}
                    />
                    <DetailField
                        label="Tanggal"
                        value={formatDate(jadwal.tanggal_konsultasi)}
                    />
                    <DetailField label="Waktu" value={jadwal.jam_konsultasi} />
                    <DetailField
                        label="Metode"
                        value={jadwal.metode_konsultasi}
                    />
                    <DetailField label="Status" value={jadwal.status_pesanan} />
                </div>

                {/* --- BAGIAN BARU MANAJEMEN GMEET --- */}

                {/* === PERBAIKAN DI SINI === */}
                {(jadwal.metode_konsultasi === "Video Call" ||
                    jadwal.metode_konsultasi === "Call") && (
                    // === AKHIR PERBAIKAN ===

                    <div className="md:col-span-2 mt-4 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold mb-3">
                            Manajemen Link Gmeet
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Metode konsultasi untuk sesi ini adalah{" "}
                            <strong>{jadwal.metode_konsultasi}</strong>.
                            Masukkan link Gmeet di bawah ini. Kosongkan field
                            lalu simpan untuk menghapus link.
                        </p>

                        <form onSubmit={handleLinkSubmit} className="space-y-4">
                            <div>
                                <label
                                    htmlFor="gmeet_link"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    URL Gmeet
                                </label>
                                <input
                                    type="text"
                                    id="gmeet_link"
                                    value={gmeetLink}
                                    onChange={(e) =>
                                        setGmeetLink(e.target.value)
                                    }
                                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                    className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Tampilkan pesan Error atau Sukses */}
                            {linkError && (
                                <div className="text-sm text-red-600">
                                    {linkError}
                                </div>
                            )}
                            {linkSuccess && (
                                <div className="text-sm text-green-600">
                                    {linkSuccess}
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                                >
                                    {isSubmitting
                                        ? "Menyimpan..."
                                        : "Simpan Link"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {/* --- AKHIR BAGIAN GMEET --- */}
            </div>
        </div>
    );
};

export default JadwalDetailPage;
