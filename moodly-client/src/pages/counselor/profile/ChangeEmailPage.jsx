import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/axios.js"; // Path 3x mundur + .js
import { useAuth } from "../../../context/AuthContext.jsx"; // Path 3x mundur + .jsx

// --- Komponen Ikon ---
const BackArrowIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
        />
    </svg>
);

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

// --- Komponen Layout (Menghapus 'App' di bawah) ---
const MobileLayout = ({ children }) => (
    <div className="flex justify-center min-h-screen bg-white font-['Poppins']">
        <div className="w-full max-w-md min-h-screen bg-white flex flex-col">
            {children}
        </div>
    </div>
);

// --- Komponen Halaman (Sekarang 'default export') ---
export default function CounselorChangeEmailPage() {
    const navigate = useNavigate();
    const { user, getUser } = useAuth(); // Ambil data user dan fungsi refresh

    const [email, setEmail] = useState("");
    const [current_password, setCurrentPassword] = useState(""); // <-- WAJIB untuk keamanan

    const [showPwd, setShowPwd] = useState(false);
    const [errors, setErrors] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Isi email saat ini saat komponen dimuat
    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors(null);
        setSuccessMessage("");

        try {
            // Panggil API yang sudah kita buat di CounselorProfileController
            const response = await apiClient.post(
                "/api/counselor/profile/change-email",
                {
                    email,
                    current_password,
                }
            );

            setSuccessMessage(
                response.data.message ||
                    "Email berhasil diubah! Silakan verifikasi email baru Anda."
            );

            // Refresh data user di context (agar menampilkan email baru)
            await getUser();

            // Kembali ke halaman profil setelah 2 detik
            setTimeout(() => {
                navigate("/counselor/profile/edit");
            }, 2000);
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
            setIsSubmitting(false);
        }
    };

    return (
        <MobileLayout>
            <div className="flex flex-col h-full w-full bg-[#00D1FF] relative overflow-hidden">
                {/* Latar gradasi di atas (Disederhanakan) */}
                <div className="absolute top-0 left-0 w-full h-56 bg-gradient-to-b from-[#00D1FF] to-white" />

                {/* Header */}
                <header className="relative z-10 flex items-center px-4 pt-10 pb-4">
                    <button
                        onClick={() => navigate(-1)} // <-- Gunakan navigate
                        aria-label="Kembali"
                    >
                        <BackArrowIcon />
                    </button>
                    {/* Judul dihapus agar sesuai desain */}
                </header>

                {/* Konten putih full tinggi */}
                <div className="relative z-20 bg-white mt-8 rounded-t-[2.5rem] flex-1 flex flex-col justify-between p-6 shadow-md">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 mt-4 flex-1"
                    >
                        {/* Tampilkan Pesan Sukses atau Error */}
                        {successMessage && (
                            <div className="p-3 text-center text-sm text-green-700 bg-green-100 rounded-lg">
                                {successMessage}
                            </div>
                        )}
                        {errors?.general && (
                            <div className="p-3 text-center text-sm text-red-700 bg-red-100 rounded-lg">
                                {errors.general[0]}
                            </div>
                        )}

                        <div>
                            <h1 className="text-2xl font-bold text-black tracking-tight">
                                Masukan email baru
                            </h1>
                            <p className="text-gray-600 mt-2 text-sm">
                                Ubah email akun Anda. Pastikan email baru aktif
                                dan bisa menerima verifikasi.
                            </p>

                            {/* Input Email Baru */}
                            <div className="mt-8">
                                <label className="text-sm text-gray-800 font-bold tracking-wide">
                                    Email Baru
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full mt-2 border-2 border-black rounded-xl px-4 py-3 text-sm focus:outline-none"
                                    placeholder="mail@contoh.com"
                                />
                                {errors?.email && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.email[0]}
                                    </p>
                                )}
                            </div>

                            {/* Input Password Saat Ini (WAJIB) */}
                            <div className="mt-4">
                                <label className="text-sm text-gray-800 font-bold tracking-wide">
                                    Masukkan Password Anda
                                </label>
                                <div className="relative mt-2">
                                    <input
                                        type={showPwd ? "text" : "password"}
                                        name="current_password"
                                        value={current_password}
                                        onChange={(e) =>
                                            setCurrentPassword(e.target.value)
                                        }
                                        className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm focus:outline-none"
                                        placeholder="Konfirmasi password Anda"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd((p) => !p)}
                                        className="absolute right-4 top-3 text-gray-600"
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
                        </div>

                        <div className="mb-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-black text-white py-3 rounded-full text-base font-semibold active:scale-95 transition-transform disabled:bg-gray-400"
                            >
                                {isSubmitting ? "Menyimpan..." : "Simpan Email"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </MobileLayout>
    );
}
