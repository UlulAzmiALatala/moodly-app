import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios.js"; // Path 3x mundur
import { useAuth } from "../../../context/AuthContext.jsx"; // Path 3x mundur

// --- Komponen Ikon ---
const BackArrowIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
    >
        {" "}
        <line x1="19" y1="12" x2="5" y2="12"></line>{" "}
        <polyline points="12 19 5 12 12 5"></polyline>{" "}
    </svg>
);
const ChevronUpIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
    >
        {" "}
        <polyline points="18 15 12 9 6 15"></polyline>{" "}
    </svg>
);
const PlusIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-cyan-600"
    >
        {" "}
        <line x1="12" y1="5" x2="12" y2="19"></line>{" "}
        <line x1="5" y1="12" x2="19" y2="12"></line>{" "}
    </svg>
);
const CalendarCheckIcon = () => (
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
        className="mr-2"
    >
        {" "}
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>{" "}
        <line x1="16" y1="2" x2="16" y2="6"></line>{" "}
        <line x1="8" y1="2" x2="8" y2="6"></line>{" "}
        <line x1="3" y1="10" x2="21" y2="10"></line>{" "}
        <path d="M9 16l2 2 4-4"></path>{" "}
    </svg>
);
const TrashIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-red-500"
    >
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);
// --- Akhir Komponen Ikon ---

// --- Komponen Input Jam ---
const TimePickerInput = ({ value, onChange, max }) => {
    const increment = () => {
        const num = parseInt(value, 10);
        const newValue = (num + 1) % (max + 1);
        onChange(newValue.toString().padStart(2, "0"));
    };
    const decrement = () => {
        const num = parseInt(value, 10);
        const newValue = (num - 1 + (max + 1)) % (max + 1);
        onChange(newValue.toString().padStart(2, "0"));
    };
    return (
        <div className="flex flex-col items-center">
            <button
                onClick={increment}
                type="button"
                className="bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 p-2 rounded-t-lg transition-colors"
            >
                <ChevronUpIcon />
            </button>
            <input
                type="text"
                value={value}
                readOnly
                className="w-16 text-center text-lg font-bold py-2 bg-gray-100 border-t-0 border-b-0 border-x-0 outline-none text-gray-800"
            />
            <button
                onClick={decrement}
                type="button"
                className="bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 p-2 rounded-b-lg transition-colors"
            >
                <ChevronUpIcon className="rotate-180" />
            </button>
        </div>
    );
};

// --- [BARU] Komponen Checkbox Metode ---
const MethodCheckbox = ({ label, name, checked, onChange, disabled }) => (
    <label className="flex items-center space-x-2">
        <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="h-5 w-5 text-cyan-600 rounded focus:ring-cyan-500 border-gray-300"
        />
        <span className="text-sm text-gray-700">{label}</span>
    </label>
);

// --- Fungsi untuk mendapatkan tanggal hari ini format YYYY-MM-DD ---
const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

export default function ChangeSchedulePage() {
    const navigate = useNavigate();
    const { user, getUser } = useAuth(); // <-- Ambil getUser

    // --- State Dinamis ---
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- State untuk Form Baru ---
    const [tanggal_konsultasi, setSelectedDate] = useState(getTodayString()); // <-- Sesuai permintaan Anda
    const [startTime, setStartTime] = useState("09");
    const [startMinute, setStartMinute] = useState("00");
    const [endTime, setEndTime] = useState("17");
    const [endMinute, setEndMinute] = useState("00");

    // --- [BARU] State untuk Metode Konseling ---
    const [metode, setMetode] = useState({
        Chat: false,
        "Video Call": false,
        "Voice Call": false,
        "Tatap Muka": false,
    });
    const [isSavingMethods, setIsSavingMethods] = useState(false);
    // --- AKHIR BARU ---

    // --- 1. Fetch data ketersediaan ---
    const fetchAvailabilities = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const response = await apiClient.get("/api/counselor/availability"); // <-- Panggil API baru
            setAvailabilities(response.data);
        } catch (err) {
            console.error("Gagal mengambil jadwal:", err);
            setError("Gagal memuat jadwal.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAvailabilities();

            // --- [BARU] Isi checkbox metode dari data user ---
            if (user.metode_layanan) {
                const initialMethods = { ...metode };
                user.metode_layanan.forEach((methodName) => {
                    if (methodName in initialMethods) {
                        initialMethods[methodName] = true;
                    }
                });
                setMetode(initialMethods);
            }
            // --- AKHIR BARU ---
        }
    }, [user]); // Jalankan saat user tersedia

    const handleBack = () => {
        navigate(-1);
    };

    // --- 2. Handle Simpan Jadwal BARU ---
    const handleSaveSchedule = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const dataToSend = {
            tanggal_konsultasi, // <-- Kirim TANGGAL
            start_time: `${startTime}:${startMinute}`,
            end_time: `${endTime}:${endMinute}`,
        };

        try {
            const response = await apiClient.post(
                "/api/counselor/availability",
                dataToSend
            );
            setAvailabilities((prev) =>
                [...prev, response.data].sort(
                    (a, b) =>
                        new Date(a.tanggal_konsultasi) -
                        new Date(b.tanggal_konsultasi)
                )
            );
        } catch (err) {
            console.error("Gagal menyimpan jadwal:", err);
            setError(err.response?.data?.message || "Gagal menyimpan jadwal.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- 3. Handle Hapus Jadwal ---
    const handleDeleteSchedule = async (id) => {
        if (!window.confirm("Anda yakin ingin menghapus jadwal ini?")) return;
        try {
            await apiClient.delete(`/api/counselor/availability/${id}`);
            setAvailabilities((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            console.error("Gagal menghapus jadwal:", err);
            setError("Gagal menghapus jadwal.");
        }
    };

    // --- [BARU] 4. Handler untuk Metode Konseling ---
    const handleMediaChange = (e) => {
        const { name, checked } = e.target;
        setMetode((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSaveMethods = async () => {
        setIsSavingMethods(true);
        setError(null);

        const selectedMethods = Object.keys(metode).filter(
            (key) => metode[key]
        );

        try {
            // Panggil API update profil
            await apiClient.post("/api/counselor/profile/update", {
                metode_layanan: selectedMethods,
            });
            await getUser(); // Refresh data
            alert("Metode konseling berhasil diperbarui!");
        } catch (error) {
            console.error("Gagal update metode:", error);
            setError("Gagal menyimpan metode.");
        } finally {
            setIsSavingMethods(false);
        }
    };
    // --- AKHIR BARU ---

    // --- Helper untuk format tampilan ---
    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    const formatTime = (time) => (time ? time.substring(0, 5) : "00:00");

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Header Halaman */}
            <header className="bg-cyan-500 p-4 pt-6 flex items-center sticky top-0 z-20 text-white rounded-b-3xl shadow-lg">
                <button
                    onClick={handleBack}
                    className="p-2 -ml-2 mr-2 rounded-full hover:bg-cyan-600/50 group transition-colors"
                    aria-label="Kembali"
                >
                    <BackArrowIcon />
                </button>
                <h1 className="text-xl font-bold text-center flex-grow -translate-x-4">
                    Atur Jadwal & Layanan
                </h1>
                <div className="w-8"></div> {/* Spacer */}
            </header>

            {/* Konten Utama */}
            <main className="p-6 space-y-6 pb-28">
                {error && (
                    <div className="p-3 text-center text-sm text-red-700 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}

                {/* --- Bagian Metode Konseling --- */}
                <div className="p-4 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Metode Konseling Tersedia
                    </label>
                    <div className="space-y-3">
                        <MethodCheckbox
                            label="Chat"
                            name="Chat"
                            checked={metode.Chat}
                            onChange={handleMediaChange}
                            disabled={isSavingMethods}
                        />
                        <MethodCheckbox
                            label="Video Call"
                            name="Video Call"
                            checked={metode["Video Call"]}
                            onChange={handleMediaChange}
                            disabled={isSavingMethods}
                        />
                        <MethodCheckbox
                            label="Voice Call"
                            name="Voice Call"
                            checked={metode["Voice Call"]}
                            onChange={handleMediaChange}
                            disabled={isSavingMethods}
                        />
                        <MethodCheckbox
                            label="Tatap Muka"
                            name="Tatap Muka"
                            checked={metode["Tatap Muka"]}
                            onChange={handleMediaChange}
                            disabled={isSavingMethods}
                        />
                        <button
                            onClick={handleSaveMethods}
                            disabled={isSavingMethods}
                            type="button" // Pastikan type="button"
                            className="w-full mt-3 bg-cyan-500 text-white text-sm font-bold py-2 px-4 rounded-lg shadow hover:bg-cyan-600 transition-colors active:scale-95 disabled:bg-gray-400"
                        >
                            {isSavingMethods ? "Menyimpan..." : "Simpan Metode"}
                        </button>
                    </div>
                </div>

                {/* --- Bagian Atur Ketersediaan --- */}
                <form onSubmit={handleSaveSchedule} className="space-y-6">
                    <hr />
                    <h2 className="text-lg font-bold text-gray-800">
                        Tambah Ketersediaan Jadwal
                    </h2>
                    {/* Pilihan Tanggal */}
                    <div>
                        <label
                            htmlFor="schedule-date"
                            className="block text-sm font-semibold text-gray-800 mb-2"
                        >
                            Pilih Tanggal
                        </label>
                        <input
                            type="date"
                            id="schedule-date"
                            value={tanggal_konsultasi}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="block w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-700"
                            min={getTodayString()}
                        />
                    </div>

                    {/* Jam Mulai & Selesai */}
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-800 mb-2 text-center">
                                Jam Mulai
                            </label>
                            <div className="flex items-center gap-2 justify-center">
                                <TimePickerInput
                                    value={startTime}
                                    onChange={setStartTime}
                                    max={23}
                                />
                                <span className="text-2xl font-bold text-gray-700">
                                    :
                                </span>
                                <TimePickerInput
                                    value={startMinute}
                                    onChange={setStartMinute}
                                    max={59}
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-800 mb-2 text-center">
                                Jam Selesai
                            </label>
                            <div className="flex items-center gap-2 justify-center">
                                <TimePickerInput
                                    value={endTime}
                                    onChange={setEndTime}
                                    max={23}
                                />
                                <span className="text-2xl font-bold text-gray-700">
                                    :
                                </span>
                                <TimePickerInput
                                    value={endMinute}
                                    onChange={setEndMinute}
                                    max={59}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tombol Tambah */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-full text-sm font-medium hover:bg-cyan-100 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <PlusIcon />{" "}
                        {isSubmitting ? "Menyimpan..." : "Tambah Jadwal Hari"}
                    </button>
                </form>

                {/* --- Daftar Jadwal Saat Ini --- */}
                <div className="pt-4">
                    <h2 className="text-base font-bold text-gray-800 mb-3">
                        Jadwal Ketersediaan Anda
                    </h2>
                    <div className="space-y-2">
                        {loading ? (
                            <p className="text-sm text-gray-500 text-center">
                                Memuat jadwal...
                            </p>
                        ) : availabilities.length > 0 ? (
                            availabilities.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between bg-gray-100 p-3 rounded-lg"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                                        <span className="font-bold text-cyan-600 w-full sm:w-40">
                                            {formatDate(
                                                item.tanggal_konsultasi
                                            )}
                                        </span>
                                        <span className="text-sm text-gray-700">
                                            {formatTime(item.start_time)} -{" "}
                                            {formatTime(item.end_time)}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDeleteSchedule(item.id)
                                        }
                                        className="p-1 hover:bg-red-100 rounded-full"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center">
                                Belum ada jadwal ketersediaan.
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
