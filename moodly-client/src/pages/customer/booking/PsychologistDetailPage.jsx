import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import apiClient from "../../../api/axios";
// Pastikan path ini sesuai dengan lokasi file NotificationModal yang baru Anda buat
import NotificationModal from "../../../components/common/NotificationModal";

// --- Komponen Ikon (Tidak Berubah) ---
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
        className="text-white group-hover:text-gray-100"
    >
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);
const StarIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-yellow-400"
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);
const EducationIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-cyan-600 flex-shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.998.998 0 011.07 0l3.078 1.539a1 1 0 00.99-.001l3.078-1.538a1 1 0 011.07 0L19 6.92a1 1 0 000-1.84l-7-3zM3 9.38l-.62-.31a1 1 0 000 1.84l7 3.5a1 1 0 00.99 0l7-3.5a1 1 0 000-1.84L17 9.38v3.13a1 1 0 00.52.87l1.17.59a1 1 0 010 1.74l-8 4a1 1 0 01-.98 0l-8-4a1 1 0 010-1.74l1.17-.59A1 1 0 003 12.51V9.38z" />
    </svg>
);
const LicenseIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-cyan-600 flex-shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path
            fillRule="evenodd"
            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
        />
    </svg>
);
const VoiceCallIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-1.5"
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
);
const ChatIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-1.5"
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path
            fillRule="evenodd"
            d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
            clipRule="evenodd"
        />
    </svg>
);
const VideoCallIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-1.5"
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A.5.5 0 0014 7.5v5a.5.5 0 00.553.494l2-1A.5.5 0 0017 11.5v-3a.5.5 0 00-.447-.494l-2-1z" />
    </svg>
);
const ClockIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-cyan-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    </svg>
);
const CalendarIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-cyan-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
    </svg>
);
const ChevronDownIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

// Map Ikon Global
const mediaIconMap = {
    "Voice Call": <VoiceCallIcon />,
    "Video Call": <VideoCallIcon />,
    Chat: <ChatIcon />,
};

// --- Komponen Jadwal ---
const ScheduleTabContent = ({
    method,
    scheduleOptions,
    loadingSchedule,
    errorSchedule,
    selectedTimeOfDay,
    setSelectedTimeOfDay,
    selectedDurationId,
    setSelectedDurationId,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    selectedMedia,
    setSelectedMedia,
    availableMethods,
}) => {
    const getAvailableTimesForSelectedDate = () => {
        const dateData = scheduleOptions.availableDates.find(
            (d) => d.date === selectedDate
        );
        return dateData?.availableTimes?.[selectedTimeOfDay] || [];
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedTime("");
    };

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
    };

    const handleMediaSelect = (media) => {
        if (method !== "Offline") {
            setSelectedMedia(media);
        }
    };

    if (loadingSchedule)
        return <div className="text-center p-4">Memuat jadwal...</div>;
    if (errorSchedule)
        return (
            <div className="text-center p-4 text-red-500">{errorSchedule}</div>
        );

    const availableTimes = getAvailableTimesForSelectedDate();

    const formatCurrencySimple = (amount) => {
        if (typeof amount !== "number") return "";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-5 bg-white p-4 rounded-xl shadow">
            {/* Waktu & Durasi */}
            <div className="grid grid-cols-2 gap-3">
                {/* Waktu */}
                <div className="relative">
                    <label className="text-xs text-gray-500 mb-1 block">
                        Waktu
                    </label>
                    <div className="flex items-center justify-between p-2.5 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-1.5">
                            <ClockIcon />
                            <select
                                value={selectedTimeOfDay}
                                onChange={(e) => {
                                    setSelectedTimeOfDay(e.target.value);
                                    setSelectedTime("");
                                }}
                                className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none appearance-none pr-4"
                            >
                                <option value="Pagi">Pagi</option>
                                <option value="Siang">Siang</option>
                                <option value="Sore">Sore</option>
                                <option value="Malam">Malam</option>
                            </select>
                        </div>
                        <ChevronDownIcon />
                    </div>
                </div>
                {/* Durasi */}
                <div className="relative">
                    <label className="text-xs text-gray-500 mb-1 block">
                        Durasi
                    </label>
                    <div className="flex items-center justify-between p-2.5 border border-gray-300 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-1.5">
                            <ClockIcon />
                            <select
                                value={selectedDurationId}
                                onChange={(e) =>
                                    setSelectedDurationId(e.target.value)
                                }
                                className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none appearance-none pr-4"
                            >
                                <option value="" disabled>
                                    Pilih durasi
                                </option>
                                {scheduleOptions.durations.map((dur) => (
                                    <option key={dur.id} value={dur.id}>
                                        {dur.durasi_menit} (
                                        {formatCurrencySimple(dur.harga)})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <ChevronDownIcon />
                    </div>
                </div>
            </div>

            {/* Pilih Tanggal */}
            <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">
                    Pilih Tanggal dan waktu konseling
                </h4>
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                    {scheduleOptions.availableDates.map((dateInfo) => (
                        <button
                            key={dateInfo.date}
                            onClick={() => handleDateSelect(dateInfo.date)}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-lg border w-16 h-16 flex-shrink-0 transition-colors ${
                                selectedDate === dateInfo.date
                                    ? "bg-cyan-500 text-white border-cyan-600 shadow"
                                    : "bg-white text-gray-600 border-gray-300 hover:bg-cyan-50"
                            }`}
                        >
                            <span className="text-[10px] uppercase">
                                {dateInfo.monthName}
                            </span>
                            <span className="text-lg font-bold">
                                {dateInfo.dayOfMonth}
                            </span>
                            <span className="text-[10px]">
                                {dateInfo.dayName.substring(0, 3)}
                            </span>{" "}
                        </button>
                    ))}
                    <button className="flex flex-col items-center justify-center p-2.5 rounded-lg border w-16 h-16 flex-shrink-0 bg-white text-cyan-600 border-cyan-300 hover:bg-cyan-50">
                        <CalendarIcon className="w-6 h-6 mb-1" />
                        <span className="text-[10px] uppercase">Lain</span>
                    </button>
                </div>
            </div>

            {/* Jadwal Tersedia */}
            <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-2">
                    Jadwal {selectedTimeOfDay}
                </h4>
                <div className="flex flex-wrap gap-2">
                    {availableTimes.length > 0 ? (
                        availableTimes.map((time, index) => (
                            <button
                                key={index}
                                onClick={() => handleTimeSelect(time)}
                                className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                                    selectedTime === time
                                        ? "bg-cyan-500 text-white border-cyan-600"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-cyan-50"
                                }`}
                            >
                                {time} WIB
                            </button>
                        ))
                    ) : (
                        <p className="text-xs text-gray-400">
                            Tidak ada jadwal tersedia.
                        </p>
                    )}
                </div>
            </div>

            {/* Tampilkan Media Konseling secara kondisional & DINAMIS */}
            {method !== "Offline" && (
                <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">
                        Pilihan Media Konseling
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {availableMethods.length > 0 ? (
                            availableMethods.map((media, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleMediaSelect(media)}
                                    className={`flex items-center px-4 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                                        selectedMedia === media
                                            ? "bg-cyan-500 text-white border-cyan-600"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-cyan-50"
                                    }`}
                                >
                                    {mediaIconMap[media]}
                                    {media}
                                </button>
                            ))
                        ) : (
                            <p className="text-xs text-gray-400">
                                Konselor ini belum mengatur metode layanan
                                online.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function PsychologistDetailPage() {
    const navigate = useNavigate();
    const { id: counselorId } = useParams();
    const location = useLocation();

    const {
        serviceId,
        serviceName,
        tempatId,
        tempatName,
        method = "Online",
    } = location.state || {};

    const [activeTab, setActiveTab] = useState("Profile Psikolog");
    const [psychologistData, setPsychologistData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [scheduleOptions, setScheduleOptions] = useState({
        durations: [],
        availableDates: [],
    });
    const [loadingSchedule, setLoadingSchedule] = useState(true);
    const [errorSchedule, setErrorSchedule] = useState(null);

    const [selectedTimeOfDay, setSelectedTimeOfDay] = useState("Siang");
    const [selectedDurationId, setSelectedDurationId] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedMedia, setSelectedMedia] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- STATE MODAL NOTIFIKASI ---
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: "error",
        title: "",
        message: "",
    });

    const closeModal = () => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
    };

    const showNotification = (title, message, type = "error") => {
        setModalState({
            isOpen: true,
            title,
            message,
            type,
        });
    };
    // --- AKHIR STATE MODAL ---

    // Fetch detail psikolog
    useEffect(() => {
        const fetchPsychologistDetail = async () => {
            if (!counselorId) {
                setError("ID Konselor tidak valid.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await apiClient.get(
                    `/api/booking/counselors/${counselorId}`
                );
                setPsychologistData(response.data);
                setError(null);
            } catch (err) {
                setError("Gagal memuat detail psikolog.");
                console.error("Fetch detail error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPsychologistDetail();
    }, [counselorId]);

    // useEffect untuk fetch jadwal
    useEffect(() => {
        const fetchSchedule = async () => {
            if (!counselorId) return;
            try {
                setLoadingSchedule(true);
                const response = await apiClient.get(
                    `/api/booking/counselors/${counselorId}/schedule-options`
                );
                setScheduleOptions(response.data);

                if (
                    response.data.availableDates &&
                    response.data.availableDates.length > 0 &&
                    !selectedDate
                ) {
                    setSelectedDate(response.data.availableDates[0].date);
                }
                setErrorSchedule(null);
            } catch (err) {
                console.error("Gagal mengambil opsi jadwal:", err);
                setErrorSchedule("Gagal memuat jadwal.");
            } finally {
                setLoadingSchedule(false);
            }
        };
        fetchSchedule();
    }, [counselorId]);

    const handleBack = () => navigate(-1);

    const handleStartCounseling = async () => {
        if (activeTab === "Profile Psikolog") {
            setActiveTab("Jadwal");
            return;
        }

        // 1. Validasi Input (Gunakan showNotification)
        if (!selectedDurationId || !selectedDate || !selectedTime) {
            showNotification(
                "Jadwal Belum Lengkap",
                "Harap lengkapi pilihan jadwal (Durasi, Tanggal, dan Jam) sebelum melanjutkan.",
                "error"
            );
            return;
        }

        // Tentukan metode final
        const finalMethod = method === "Offline" ? "Tatap Muka" : selectedMedia;

        if (method !== "Offline" && !finalMethod) {
            showNotification(
                "Media Belum Dipilih",
                "Harap pilih media konseling (Chat, Video Call, atau Voice Call).",
                "error"
            );
            return;
        }

        // 2. Dapatkan Data Pendukung
        const selectedDurationData = scheduleOptions.durations.find(
            (d) => d.id == selectedDurationId
        );

        if (!selectedDurationData) {
            showNotification("Error", "Data durasi tidak ditemukan.", "error");
            return;
        }

        // 3. Siapkan Payload API
        const apiPayload = {
            counselorId: parseInt(counselorId),
            jenisKonselingId: serviceId ?? 1, // --- SAFETY: Gunakan nilai default jika null (misal 1) ---
            durationId: parseInt(selectedDurationId),
            tempatId: tempatId || null,
            date: selectedDate,
            time: selectedTime,
            method: finalMethod,
        };

        // 4. Panggil API
        setIsSubmitting(true);
        try {
            const response = await apiClient.post(
                "/api/booking/create",
                apiPayload
            );

            const newBooking = response.data.booking;

            const confirmationPageRoute =
                method === "Offline"
                    ? "/booking/payment-offline"
                    : "/booking/payment-online";

            navigate(confirmationPageRoute, {
                state: {
                    booking: newBooking,
                    displayData: {
                        counselorName: psychologistData?.name,
                        serviceName: serviceName,
                        tempatName: tempatName || null,
                        scheduleDateDisplay: newBooking.tanggal_konsultasi,
                        scheduleTime: newBooking.jam_konsultasi,
                        method: newBooking.metode_konsultasi,
                        durationText: selectedDurationData.durasi_menit,
                        consultationFee: selectedDurationData.harga,
                        serviceFee:
                            newBooking.total_harga - selectedDurationData.harga,
                    },
                },
            });
        } catch (err) {
            console.error("Gagal membuat booking:", err);
            // Tampilkan error spesifik dari backend jika ada (terutama debug_error dari controller baru)
            const errorMessage =
                err.response?.data?.debug_error ||
                err.response?.data?.message ||
                "Gagal membuat booking. Silakan coba lagi.";

            // GANTI ALERT dengan MODAL NOTIFIKASI
            showNotification("Gagal Membuat Jadwal", errorMessage, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading)
        return <div className="p-4 text-center">Memuat detail psikolog...</div>;
    if (error)
        return <div className="p-4 text-center text-red-500">{error}</div>;
    if (!psychologistData)
        return (
            <div className="p-4 text-center">
                Data psikolog tidak ditemukan.
            </div>
        );

    const ratingValue = psychologistData.rating
        ? Number(psychologistData.rating)
        : null;
    const ratingDisplay = ratingValue !== null ? ratingValue.toFixed(1) : "N/A";
    const firstName = psychologistData.name?.split(",")[0];

    const specs = Array.isArray(psychologistData.spesialisasi)
        ? psychologistData.spesialisasi.map(String)
        : [];
    const specializationTags = specs.slice(0, 4);
    if (specs.length > 4) {
        specializationTags[3] = `${specs.length - 3}+ lainnya`;
    }

    // --- LOGIKA UTAMA: FILTER METODE ---
    const rawMethods = psychologistData.metode_layanan || [];
    // Filter "Tatap Muka" karena ini halaman Online
    const onlineMethods = rawMethods.filter((m) => m !== "Tatap Muka");

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* Header Dinamis */}
            {activeTab === "Profile Psikolog" ? (
                <div className="relative pb-16">
                    <div className="bg-gradient-to-b from-cyan-400 to-cyan-200 h-36 rounded-b-3xl absolute top-0 left-0 right-0 z-0">
                        <button
                            onClick={handleBack}
                            className="absolute top-6 left-4 p-2 rounded-full text-white hover:bg-cyan-500/50 group transition-colors z-10"
                        >
                            <BackArrowIcon />
                        </button>
                        <h1 className="absolute top-6 left-1/2 -translate-x-1/2 text-lg font-bold text-white z-10">
                            Psikolog {firstName}
                        </h1>
                    </div>
                    <div className="relative flex justify-center pt-20 z-10">
                        <img
                            src={
                                psychologistData.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    psychologistData.name
                                )}&background=EBF4FF&color=3B82F6&bold=true&size=128`
                            }
                            alt={psychologistData.name}
                            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    psychologistData.name
                                )}&background=EBF4FF&color=3B82F6&bold=true&size=128`;
                            }}
                        />
                    </div>
                    <div className="text-center mt-2 px-4">
                        <h2 className="font-bold text-lg text-gray-800">
                            {psychologistData.name}
                        </h2>
                        <div className="flex items-center justify-center mt-1">
                            <StarIcon />
                            <span className="text-sm font-semibold text-yellow-500 ml-1">
                                {ratingDisplay}
                            </span>
                            <span className="text-xs text-gray-400 ml-1.5">
                                {psychologistData.reviews || "(0 ulasan)"}
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                <header className="bg-gradient-to-b from-cyan-400 to-cyan-200 p-4 pt-6 flex items-start sticky top-0 z-20 text-white rounded-b-3xl shadow-lg">
                    <button
                        onClick={handleBack}
                        className="p-2 -ml-2 mr-2 rounded-full hover:bg-cyan-500/50 group transition-colors flex-shrink-0"
                    >
                        <BackArrowIcon />
                    </button>
                    <img
                        src={
                            psychologistData.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                psychologistData.name
                            )}&background=EBF4FF&color=3B82F6&bold=true&size=64`
                        }
                        alt={psychologistData.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md mr-3 flex-shrink-0"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                psychologistData.name
                            )}&background=EBF4FF&color=3B82F6&bold=true&size=64`;
                        }}
                    />
                    <div className="flex-grow pt-1">
                        <h1 className="text-base font-bold leading-tight">
                            {psychologistData.name}
                        </h1>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {specializationTags.map((tag, index) => (
                                <span
                                    key={index}
                                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                                        tag.includes("+")
                                            ? "bg-white/30 text-white border border-white/50"
                                            : "bg-white text-cyan-600"
                                    }`}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </header>
            )}

            {/* Konten Utama */}
            <main className="relative p-4 pb-24">
                <div className="flex justify-around bg-gray-100 rounded-lg p-1 mb-5">
                    <button
                        onClick={() => setActiveTab("Profile Psikolog")}
                        className={`w-full py-2 px-3 text-sm font-semibold rounded-md transition-colors ${
                            activeTab === "Profile Psikolog"
                                ? "bg-white text-cyan-600 shadow"
                                : "text-gray-500 hover:bg-gray-200"
                        }`}
                    >
                        Profile Psikolog
                    </button>
                    <button
                        onClick={() => setActiveTab("Jadwal")}
                        className={`w-full py-2 px-3 text-sm font-semibold rounded-md transition-colors ${
                            activeTab === "Jadwal"
                                ? "bg-white text-cyan-600 shadow"
                                : "text-gray-500 hover:bg-gray-200"
                        }`}
                    >
                        Jadwal
                    </button>
                </div>

                {activeTab === "Profile Psikolog" ? (
                    <div className="space-y-5">
                        <div className="bg-white p-4 rounded-xl shadow">
                            <h3 className="font-bold text-gray-700 text-base mb-2">
                                Keahlian
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {specs.length > 0 ? (
                                    specs.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-100 text-cyan-700"
                                        >
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-400">
                                        Belum ada data keahlian.
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow space-y-3">
                            <h3 className="font-bold text-gray-700 text-base">
                                Tentang {firstName}
                            </h3>
                            {psychologistData.universitas && (
                                <div className="flex items-start gap-1.5">
                                    <EducationIcon />
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-600 mb-0.5">
                                            Pendidikan
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                            {psychologistData.universitas}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {psychologistData.surat_izin_praktik && (
                                <div className="flex items-start gap-1.5">
                                    <LicenseIcon />
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-600 mb-0.5">
                                            Nomor Izin Praktek
                                        </h4>
                                        <p className="text-xs text-gray-500">
                                            {
                                                psychologistData.surat_izin_praktik
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                            {!psychologistData.universitas &&
                                !psychologistData.surat_izin_praktik && (
                                    <p className="text-xs text-gray-400">
                                        Informasi pendidikan dan lisensi belum
                                        tersedia.
                                    </p>
                                )}
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow">
                            <h3 className="font-bold text-gray-700 text-base mb-2">
                                Melayani via:
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {/* Gunakan onlineMethods agar 'Tatap Muka' tidak muncul jika kita sepakat ini halaman online */}
                                {onlineMethods.length > 0 ? (
                                    onlineMethods.map((method, index) => (
                                        <span
                                            key={index}
                                            className="flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600"
                                        >
                                            {mediaIconMap[method]}
                                            {method}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-400">
                                        Metode layanan belum ditentukan.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Render Komponen Jadwal dengan Props yang sudah difilter
                    <ScheduleTabContent
                        method={method}
                        scheduleOptions={scheduleOptions}
                        loadingSchedule={loadingSchedule}
                        errorSchedule={errorSchedule}
                        selectedTimeOfDay={selectedTimeOfDay}
                        setSelectedTimeOfDay={setSelectedTimeOfDay}
                        selectedDurationId={selectedDurationId}
                        setSelectedDurationId={setSelectedDurationId}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        selectedTime={selectedTime}
                        setSelectedTime={setSelectedTime}
                        selectedMedia={selectedMedia}
                        setSelectedMedia={setSelectedMedia}
                        // KIRIM DATA YANG SUDAH DI-FILTER DI SINI
                        availableMethods={onlineMethods}
                    />
                )}
            </main>

            {/* Tombol Mulai Konseling */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t border-gray-200 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] z-20">
                <button
                    onClick={handleStartCounseling}
                    className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg shadow hover:bg-cyan-600 transition-colors active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={
                        isSubmitting ||
                        (activeTab === "Jadwal" &&
                            (!selectedDurationId ||
                                !selectedDate ||
                                !selectedTime ||
                                (method !== "Offline" && !selectedMedia)))
                    }
                >
                    {isSubmitting
                        ? "Memproses..."
                        : activeTab === "Profile Psikolog"
                        ? "Pilih Jadwal"
                        : `Mulai konseling dengan ${firstName}`}
                </button>
            </div>

            {/* --- MODAL NOTIFIKASI (RENDER) --- */}
            <NotificationModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                title={modalState.title}
                message={modalState.message}
                type={modalState.type}
            />
        </div>
    );
}
