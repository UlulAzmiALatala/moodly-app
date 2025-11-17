import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios.js"; // <-- Path 3x mundur + .js
import { useAuth } from "../../../context/AuthContext.jsx"; // <-- Import useAuth + .jsx

// --- Komponen Ikon ---
const BackArrowIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="currentColor"
        className="text-gray-800 group-hover:text-black"
        viewBox="0 0 16 16"
    >
        <path
            fillRule="evenodd"
            d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
        />
    </svg>
);
// --- BARU: Ikon Mata ---
const EyeIcon = ({ open }) =>
    open ? (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3l18 18M10.584 10.587A3 3 0 0112 9c1.657 0 3 1.343 3 3a3 3 0 01-.587 1.416M9.88 9.879L5.122 5.122M2.458 12C3.732 7.943 7.522 5 12 5c1.662 0 3.218.43 4.573 1.175M17.94 17.94C16.677 18.574 14.908 19 12 19c-4.478 0-8.268-2.943-9.542-7"
            />
        </svg>
    ) : (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M1.5 12C3.12 7.943 7.522 5 12 5s8.88 2.943 10.5 7c-1.62 4.057-6.022 7-10.5 7S3.12 16.057 1.5 12z"
            />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
// --- Akhir Komponen Ikon ---

export default function CounselorChangePhoneNumberPage() {
    // <-- Nama diubah
    const navigate = useNavigate();
    const { user, getUser } = useAuth(); // Ambil user dan fungsi refresh

    const [oldPhoneNumber, setOldPhoneNumber] = useState("");
    const [newPhoneNumber, setNewPhoneNumber] = useState("");
    const [current_password, setCurrentPassword] = useState(""); // <-- WAJIB
    const [showPwd, setShowPwd] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState(null); // Ubah ke null
    const [successMessage, setSuccessMessage] = useState(null);

    // Isi nomor telepon lama dari context
    useEffect(() => {
        if (user?.phone) {
            setOldPhoneNumber(user.phone);
        }
    }, [user]);

    const handleBack = () => navigate(-1); // Kembali ke halaman sebelumnya

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors(null);
        setSuccessMessage(null);

        // Validasi frontend
        if (!newPhoneNumber || !current_password) {
            setErrors({
                general: ["Harap isi nomor telepon baru dan password Anda."],
            });
            setIsLoading(false);
            return;
        }
        if (newPhoneNumber === oldPhoneNumber) {
            setErrors({
                phone: [
                    "Nomor telepon baru tidak boleh sama dengan nomor lama.",
                ],
            });
            setIsLoading(false);
            return;
        }

        try {
            // Panggil API baru kita
            // (Kita asumsikan API ini sama dengan customer)
            const response = await apiClient.post(
                "/api/counselor/profile/update",
                {
                    phone: newPhoneNumber,
                    current_password: current_password,
                }
            );

            // Perbarui data user di AuthContext
            await getUser();

            setSuccessMessage(
                response.data.message || "Nomor telepon berhasil diubah."
            );

            // Kembali ke halaman profil edit setelah 1.5 detik
            setTimeout(() => {
                navigate("/counselor/profile/edit");
            }, 1500);
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({
                    general: [
                        err.response?.data?.message || "Terjadi kesalahan.",
                    ],
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="font-sans bg-white min-h-screen max-w-md mx-auto">
            {/* 1. Header */}
            <header className="flex items-center p-4 bg-white shadow-sm sticky top-0 z-10">
                <button onClick={handleBack} className="p-1 -ml-1 mr-2 group">
                    <BackArrowIcon />
                </button>
                <h1 className="text-lg font-bold m-0 flex-1 text-gray-800">
                    Ubah Nomor Telepon
                </h1>
            </header>

            {/* 2. Konten Form */}
            <main className="p-6">
                <p className="text-sm text-gray-600 mb-6">
                    Ubah nomor telepon anda dengan nomor telepon baru
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {successMessage && (
                        <p className="text-sm text-green-600 p-3 bg-green-50 rounded-lg">
                            {successMessage}
                        </p>
                    )}
                    {errors?.general && (
                        <p className="text-sm text-red-600 p-3 bg-red-50 rounded-lg">
                            {errors.general[0]}
                        </p>
                    )}

                    <div>
                        <label
                            htmlFor="oldPhoneNumber"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            No. Telepon lama
                        </label>
                        <input
                            type="tel"
                            id="oldPhoneNumber"
                            value={oldPhoneNumber}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 focus:outline-none sm:text-sm"
                            placeholder="Nomor telepon lama"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="newPhoneNumber"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            No. Telepon baru
                        </label>
                        <input
                            type="tel"
                            id="newPhoneNumber"
                            name="phone"
                            value={newPhoneNumber}
                            onChange={(e) => setNewPhoneNumber(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                            placeholder="Masukkan nomor telepon baru"
                            required
                        />
                        {errors?.phone && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.phone[0]}
                            </p>
                        )}
                    </div>

                    {/* --- BARU: Input Password --- */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1">
                            Masukkan Password Anda
                        </label>
                        <div className="relative mt-1">
                            <input
                                type={showPwd ? "text" : "password"}
                                name="current_password"
                                value={current_password}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                                placeholder="Konfirmasi password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPwd((p) => !p)}
                                className="absolute right-3 top-2 text-gray-500"
                            >
                                <EyeIcon open={showPwd} />
                            </button>
                        </div>
                        {errors?.current_password && (
                            <p className="text-xs text-red-500 mt-1">
                                {errors.current_password[0]}
                            </p>
                        )}
                    </div>
                    {/* --- AKHIR BARU --- */}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white ${
                                isLoading
                                    ? "bg-gray-400"
                                    : "bg-black hover:bg-gray-800"
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors`}
                        >
                            {isLoading ? "Memproses..." : "Ubah No Telepon"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
