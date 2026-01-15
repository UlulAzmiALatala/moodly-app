import React, { useState, useEffect } from "react";
// --- TAMBAHKAN IMPORT INI ---
import { useAuth } from "../../../context/AuthContext.jsx";

// --- FUNGSI MOCK useAuth DI BAWAH INI SUDAH DIHAPUS ---
// const useAuth = () => ({
//  loginAdmin: async ...
// });

export default function LoginPage() {
    // Sekarang 'useAuth()' memanggil AuthContext asli kita
    const { loginAdmin } = useAuth();
    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = "auto");
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrors(null);
        setIsSubmitting(true);

        if (!email || !pwd) {
            setErrors({ message: "Harap isi semua kolom." });
            setIsSubmitting(false);
            return;
        }

        try {
            // Ini sekarang akan memanggil fungsi loginAdmin di AuthContext,
            // yang akan memanggil API Laravel
            await loginAdmin({ email, password: pwd });

            // Jika sukses, AuthContext akan menangani navigasi
        } catch (error) {
            // Tangani error dari API
            if (error.response && error.response.status === 422) {
                setErrors({
                    message:
                        error.response.data.message ||
                        "Email atau password salah.",
                });
            } else if (error.response && error.response.status === 403) {
                // Ini error jika Customer/Konselor mencoba login di sini
                setErrors({
                    message:
                        error.response.data.message ||
                        "Anda tidak memiliki hak akses Admin.",
                });
            } else {
                setErrors({ message: "Login gagal. Silakan coba lagi." });
            }
            console.error("Login error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full h-screen flex bg-white overflow-hidden">
            {/* ============================
                BAGIAN KIRI - CARD PREMIUM
               ============================ */}
            <div className="hidden md:flex h-full w-1/2 lg:w-[45%] xl:w-[40%] items-center justify-center">
                <div
                    className="
                        w-[85%] h-[88%]
                        rounded-[28px]
                        bg-[#0BAEFF]
                        shadow-[0_18px_35px_rgba(0,0,0,0.18)]
                        relative overflow-hidden
                        flex flex-col items-center justify-center
                        transition-all duration-300
                    "
                >
                    {/* GLASS SHEEN HIGHLIGHT */}
                    <div
                        className="
                            absolute top-0 left-0 w-full h-1/4
                            bg-white/20
                            blur-xl
                        "
                    />

                    {/* IMAGE */}
                    <img
                        src="/images/3.png" // Mengubah dari /public/images/3.png
                        alt="moodly"
                        className="
                            w-[55%] h-auto object-contain
                            drop-shadow-xl
          Ganti ini             transition-all duration-500
                            hover:scale-[1.04]
                        "
                    />

                    {/* MOODLY TEXT */}
                    <p className="mt-6 text-white text-2xl font-bold tracking-[0.12em] drop-shadow">
                        MOODLY
                    </p>
                </div>
            </div>

            {/* ============================
                BAGIAN KANAN - FORM LOGIN
               ============================ */}
            <div className="w-full md:w-1/2 h-full flex items-center justify-center px-10 md:px-20">
                <div className="w-full max-w-lg">
                    <h2 className="text-4xl font-bold text-gray-800 mb-2 tracking-tight">
                        Welcome Back !
                    </h2>

                    <p className="mb-8 text-gray-600">
                        <span className="font-semibold text-sky-500 cursor-pointer hover:underline">
                            Log in
                        </span>{" "}
                        untuk melanjutkan ke curhat
                    </p>

                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* EMAIL */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                                placeholder="Masukkan Email"
                                className="
                                    w-full px-4 py-3 rounded-lg
                                    border border-gray-300
                                    shadow-inner
                                    focus:ring-2 focus:ring-sky-400
                                    focus:outline-none
                                    transition-all duration-200
                                "
                            />
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={pwd}
                                onChange={(e) => setPwd(e.target.value)}
                                disabled={isSubmitting}
                                placeholder="Masukkan Password"
                                className="
                                    w-full px-4 py-3 rounded-lg
        _Ganti ini                     border border-gray-300
                                    shadow-inner
                                    focus:ring-2 focus:ring-sky-400
                                    focus:outline-none
                                    transition-all duration-200
                                "
                            />
                        </div>

                        {/* REMEMBER / LUPA */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) =>
                                        setRememberMe(e.target.checked)
                                    }
                                    className="w-4 h-4 accent-sky-500"
                                />
                                <span className="text-gray-600 text-sm">
                                    Remember me
                                </span>
                            </div>

                            <span className="text-sm text-sky-500 font-semibold cursor-pointer hover:underline">
                                Lupa Password?
                            </span>
                        </div>

                        {/* BUTTON */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="
                                w-full py-3 rounded-full
                                bg-gradient-to-r from-sky-500 to-sky-600
Ganti ini                             text-white font-semibold
                                transition-all duration-300
Ganti ini                             hover:scale-[1.02] hover:shadow-lg
                                disabled:bg-sky-300 disabled:scale-100
                            "
                        >
                            {isSubmitting ? "Memproses..." : "Log In"}
                        </button>

                        {/* ERROR */}
                        {errors && (
                            <p className="text-center text-sm text-red-600">
                                {errors.message}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
