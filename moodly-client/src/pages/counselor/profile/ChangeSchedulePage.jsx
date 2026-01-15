import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    Calendar,
    Clock,
    Video,
    Phone,
    MessageSquare,
    Users,
    History,
    Save,
    Loader2,
} from "lucide-react";

// 1. Import Hook Toast (Optional: jika ada)
// import { useToast } from "../../../context/ToastContext";

// --- Helper: Format Tanggal & Waktu ---
const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const formatTime = (time) => (time ? time.substring(0, 5) : "00:00");

const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

// --- KOMPONEN PAGINASI ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-gray-600">
                Halaman {currentPage} dari {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

// --- KOMPONEN INPUT WAKTU MANUAL ---
const TimeInput = ({ value, onChange, max, placeholder }) => {
    const handleChange = (e) => {
        let val = e.target.value.replace(/\D/g, ""); // Hanya angka
        if (val.length > 2) val = val.slice(0, 2); // Max 2 digit

        const numVal = parseInt(val, 10);
        if (!isNaN(numVal)) {
            if (numVal > max) val = max.toString(); // Batasi max (23 atau 59)
        }

        onChange(val);
    };

    const handleBlur = () => {
        // Auto padding 0 jika cuma 1 digit (misal "9" jadi "09")
        if (value.length === 1) {
            onChange(value.padStart(2, "0"));
        }
    };

    return (
        <input
            type="text"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-16 text-center px-2 py-2 bg-white border border-gray-300 rounded-lg text-lg font-bold text-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
        />
    );
};

// --- KOMPONEN CHECKBOX METODE ---
const MethodCheckbox = ({
    label,
    name,
    checked,
    onChange,
    icon: Icon,
    disabled,
}) => (
    <label
        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
            checked
                ? "bg-cyan-50 border-cyan-200 shadow-sm"
                : "bg-white border-gray-200 hover:bg-gray-50"
        }`}
    >
        <div className="flex items-center gap-3">
            <div
                className={`p-2 rounded-full ${
                    checked
                        ? "bg-cyan-100 text-cyan-600"
                        : "bg-gray-100 text-gray-400"
                }`}
            >
                <Icon size={18} />
            </div>
            <span
                className={`text-sm font-medium ${
                    checked ? "text-cyan-900" : "text-gray-600"
                }`}
            >
                {label}
            </span>
        </div>
        <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="h-5 w-5 text-cyan-600 rounded focus:ring-cyan-500 border-gray-300 accent-cyan-600"
        />
    </label>
);

export default function ChangeSchedulePage() {
    const navigate = useNavigate();
    const { user, getUser } = useAuth();
    // const { addToast } = useToast(); // Aktifkan jika sudah setup Toast

    // --- State Data ---
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State Form Jadwal ---
    const [date, setDate] = useState(getTodayString());
    const [startHour, setStartHour] = useState("09");
    const [startMinute, setStartMinute] = useState("00");
    const [endHour, setEndHour] = useState("17");
    const [endMinute, setEndMinute] = useState("00");
    const [isSavingSchedule, setIsSavingSchedule] = useState(false);

    // --- State Metode ---
    const [metode, setMetode] = useState({
        Chat: false,
        "Video Call": false,
        "Voice Call": false,
        "Tatap Muka": false,
    });
    const [isSavingMethods, setIsSavingMethods] = useState(false);

    // --- State Tabs & Paginasi ---
    const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' | 'past'
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // --- 1. Fetch Data ---
    const fetchAvailabilities = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const response = await apiClient.get("/api/counselor/availability");
            setAvailabilities(response.data);
        } catch (err) {
            console.error("Gagal fetch jadwal:", err);
            setError("Gagal memuat jadwal.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAvailabilities();
            // Isi checkbox metode dari user data
            if (user.metode_layanan) {
                const initialMethods = { ...metode };
                user.metode_layanan.forEach((m) => {
                    if (m in initialMethods) initialMethods[m] = true;
                });
                setMetode(initialMethods);
            }
        }
    }, [user]);

    // --- Logic Filtering & Pagination ---
    const filteredSchedules = useMemo(() => {
        const now = new Date();
        // Reset jam agar perbandingan hari akurat (opsional, tergantung kebutuhan detail)
        now.setHours(0, 0, 0, 0);

        return availabilities
            .filter((item) => {
                const itemDate = new Date(item.tanggal_konsultasi);
                if (activeTab === "upcoming") {
                    return itemDate >= now;
                } else {
                    return itemDate < now;
                }
            })
            .sort((a, b) => {
                // Sort Ascending untuk upcoming, Descending untuk past
                const dateA = new Date(a.tanggal_konsultasi);
                const dateB = new Date(b.tanggal_konsultasi);
                return activeTab === "upcoming" ? dateA - dateB : dateB - dateA;
            });
    }, [availabilities, activeTab]);

    const totalPages = Math.ceil(filteredSchedules.length / ITEMS_PER_PAGE);
    const paginatedSchedules = filteredSchedules.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // --- Handlers ---
    const handleMediaChange = (e) => {
        const { name, checked } = e.target;
        setMetode((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSaveMethods = async () => {
        setIsSavingMethods(true);
        const selectedMethods = Object.keys(metode).filter(
            (key) => metode[key]
        );

        try {
            await apiClient.post("/api/counselor/profile/update", {
                metode_layanan: selectedMethods,
            });
            await getUser(); // Refresh context
            alert("Metode layanan berhasil diperbarui!"); // Ganti toast jika ada
        } catch (err) {
            console.error("Gagal simpan metode:", err);
            alert("Gagal menyimpan metode.");
        } finally {
            setIsSavingMethods(false);
        }
    };

    const handleSaveSchedule = async (e) => {
        e.preventDefault();
        setIsSavingSchedule(true);

        const dataToSend = {
            tanggal_konsultasi: date,
            start_time: `${startHour}:${startMinute}`,
            end_time: `${endHour}:${endMinute}`,
        };

        try {
            const response = await apiClient.post(
                "/api/counselor/availability",
                dataToSend
            );
            setAvailabilities((prev) => [...prev, response.data]);
            alert("Jadwal berhasil ditambahkan!");
            // Reset form defaults (opsional)
        } catch (err) {
            console.error("Gagal simpan jadwal:", err);
            alert(err.response?.data?.message || "Gagal menyimpan jadwal.");
        } finally {
            setIsSavingSchedule(false);
        }
    };

    const handleDeleteSchedule = async (id) => {
        if (!window.confirm("Hapus jadwal ini?")) return;
        try {
            await apiClient.delete(`/api/counselor/availability/${id}`);
            setAvailabilities((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            console.error("Gagal hapus:", err);
            alert("Gagal menghapus jadwal.");
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-20">
            {/* Header */}
            <header className="bg-white p-4 flex items-center sticky top-0 z-20 border-b border-gray-200 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 mr-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ChevronLeft className="text-gray-700" />
                </button>
                <h1 className="text-lg font-bold text-gray-800 text-center flex-grow -translate-x-4">
                    Atur Jadwal & Layanan
                </h1>
                <div className="w-8"></div>
            </header>

            <main className="p-4 max-w-lg mx-auto space-y-6">
                {/* 1. Metode Layanan Card */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-cyan-50/50">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <Users size={18} className="text-cyan-600" />
                            Metode Konseling
                        </h2>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <MethodCheckbox
                                label="Chat"
                                name="Chat"
                                icon={MessageSquare}
                                checked={metode.Chat}
                                onChange={handleMediaChange}
                                disabled={isSavingMethods}
                            />
                            <MethodCheckbox
                                label="Video Call"
                                name="Video Call"
                                icon={Video}
                                checked={metode["Video Call"]}
                                onChange={handleMediaChange}
                                disabled={isSavingMethods}
                            />
                            <MethodCheckbox
                                label="Voice Call"
                                name="Voice Call"
                                icon={Phone}
                                checked={metode["Voice Call"]}
                                onChange={handleMediaChange}
                                disabled={isSavingMethods}
                            />
                            <MethodCheckbox
                                label="Tatap Muka"
                                name="Tatap Muka"
                                icon={Users}
                                checked={metode["Tatap Muka"]}
                                onChange={handleMediaChange}
                                disabled={isSavingMethods}
                            />
                        </div>
                        <button
                            onClick={handleSaveMethods}
                            disabled={isSavingMethods}
                            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-70"
                        >
                            {isSavingMethods ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Simpan Metode
                        </button>
                    </div>
                </section>

                {/* 2. Form Tambah Jadwal */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-cyan-50/50">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <Calendar size={18} className="text-cyan-600" />
                            Tambah Jadwal Baru
                        </h2>
                    </div>
                    <form
                        onSubmit={handleSaveSchedule}
                        className="p-5 space-y-5"
                    >
                        {/* Input Tanggal */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                                Pilih Tanggal
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={getTodayString()}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
                                required
                            />
                        </div>

                        {/* Input Jam (Manual Type) */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-center">
                                    Jam Mulai
                                </label>
                                <div className="flex items-center justify-center gap-2">
                                    <TimeInput
                                        value={startHour}
                                        onChange={setStartHour}
                                        max={23}
                                    />
                                    <span className="text-xl font-bold text-gray-400">
                                        :
                                    </span>
                                    <TimeInput
                                        value={startMinute}
                                        onChange={setStartMinute}
                                        max={59}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 text-center">
                                    Jam Selesai
                                </label>
                                <div className="flex items-center justify-center gap-2">
                                    <TimeInput
                                        value={endHour}
                                        onChange={setEndHour}
                                        max={23}
                                    />
                                    <span className="text-xl font-bold text-gray-400">
                                        :
                                    </span>
                                    <TimeInput
                                        value={endMinute}
                                        onChange={setEndMinute}
                                        max={59}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSavingSchedule}
                            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-70"
                        >
                            {isSavingSchedule ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus size={18} />
                            )}
                            Tambahkan Jadwal
                        </button>
                    </form>
                </section>

                {/* 3. List Jadwal (Tabs & Pagination) */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-lg font-bold text-gray-800">
                            Daftar Jadwal
                        </h2>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-200 rounded-xl mb-5">
                        <button
                            onClick={() => {
                                setActiveTab("upcoming");
                                setCurrentPage(1);
                            }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                                activeTab === "upcoming"
                                    ? "bg-white text-cyan-700 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <Calendar size={14} /> Akan Datang
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab("past");
                                setCurrentPage(1);
                            }}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                                activeTab === "past"
                                    ? "bg-white text-cyan-700 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            <History size={14} /> Riwayat
                        </button>
                    </div>

                    {/* Content List */}
                    {loading ? (
                        <div className="py-10 text-center">
                            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">
                                Memuat jadwal...
                            </p>
                        </div>
                    ) : paginatedSchedules.length === 0 ? (
                        <div className="py-10 text-center bg-white rounded-2xl border border-gray-200 border-dashed">
                            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">
                                Tidak ada jadwal{" "}
                                {activeTab === "upcoming"
                                    ? "akan datang"
                                    : "riwayat"}
                                .
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {paginatedSchedules.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-row items-center justify-between hover:border-cyan-200 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`p-3 rounded-xl flex flex-col items-center justify-center min-w-[60px] ${
                                                activeTab === "upcoming"
                                                    ? "bg-cyan-50 text-cyan-700"
                                                    : "bg-gray-100 text-gray-500"
                                            }`}
                                        >
                                            <span className="text-xs font-bold uppercase">
                                                {new Date(
                                                    item.tanggal_konsultasi
                                                ).toLocaleDateString("id-ID", {
                                                    month: "short",
                                                })}
                                            </span>
                                            <span className="text-xl font-extrabold">
                                                {new Date(
                                                    item.tanggal_konsultasi
                                                ).getDate()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-gray-900 font-bold mb-1">
                                                {formatDate(
                                                    item.tanggal_konsultasi
                                                )}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-lg w-fit">
                                                <Clock
                                                    size={14}
                                                    className="text-cyan-600"
                                                />
                                                <span className="font-mono">
                                                    {formatTime(
                                                        item.start_time
                                                    )}{" "}
                                                    -{" "}
                                                    {formatTime(item.end_time)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {activeTab === "upcoming" && (
                                        <button
                                            onClick={() =>
                                                handleDeleteSchedule(item.id)
                                            }
                                            className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Hapus Jadwal"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination Control */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </section>
            </main>
        </div>
    );
}
