import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; // Path 3x mundur
import apiClient from "../../../api/axios"; // Path 3x mundur

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

// --- Komponen Halaman (Hanya satu) ---
export default function ChangeEmailPage() {
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
            // Panggil API yang sudah kita buat di ProfileController
            const response = await apiClient.post("/api/profile/change-email", {
                email,
                current_password,
            });

            setSuccessMessage(
                response.data.message ||
                    "Email berhasil diubah! Silakan verifikasi email baru Anda."
            );

            // Refresh data user di context (agar menampilkan email baru)
            await getUser();

            // Kembali ke halaman profil setelah 2 detik
            setTimeout(() => {
                navigate("/profile/edit");
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
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <style>
                {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        `}
            </style>
            <div className="flex justify-center min-h-screen bg-white font-['Poppins']">
                <div className="w-full max-w-md flex flex-col min-h-screen bg-white relative overflow-hidden">
                    {/* Latar gradasi di atas */}
                    <div className="absolute top-0 left-0 w-full h-56 bg-gradient-to-b from-[#00D1FF] to-white" />

                    {/* Header */}
                    <header className="relative z-10 flex items-center gap-3 px-4 pt-10">
                        <button
                            onClick={() => navigate(-1)} // <-- Gunakan navigate
                            aria-label="Kembali"
                        >
                            <BackArrowIcon />
                        </button>
                        <h1 className="text-lg font-bold text-black">
                            Ubah Email
                        </h1>
                    </header>

                    {/* Konten putih full tinggi */}
                    <div className="relative z-20 bg-white mt-8 rounded-t-[2.5rem] flex-1 flex flex-col justify-between p-6 shadow-md">
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6 mt-4 flex-1"
                        >
                            {/* --- Tampilkan Pesan Sukses atau Error --- */}
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

                            {/* Input Email Baru */}
                            <div>
                                <label className="text-sm text-gray-800 font-bold tracking-wide">
                                    Masukan email baru
                                </label>
                                <div className="relative mt-2">
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        className="w-full border-2 border-black rounded-xl px-4 py-3 text-sm focus:outline-none"
                                        placeholder="mail@contoh.com"
                                    />
                                </div>
                                {errors?.email && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.email[0]}
                                    </p>
                                )}
                            </div>

                            {/* Input Password Saat Ini (WAJIB) */}
                            <div>
                                <label className="text-sm text-gray-800 font-bold tracking-wide">
                                    Masukkan password Anda
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
                                <p className="text-xs text-gray-500 mt-1">
                                    Demi keamanan, masukkan password Anda saat
                                    ini.
                                </p>
                                {errors?.current_password && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.current_password[0]}
                                    </p>
                                )}
                            </div>
                        </form>

                        {/* Tombol simpan di bawah */}
                        <div className="mt-8 mb-4">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full bg-black text-white py-3 rounded-full text-base font-semibold active:scale-95 transition-transform disabled:bg-gray-400"
                            >
                                {isSubmitting ? "Menyimpan..." : "Simpan Email"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
