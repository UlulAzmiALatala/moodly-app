import React, { useState, useEffect } from "react";

// --- Komponen Ikon (untuk tombol mata) ---
const EyeIcon = () => (
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
        className="text-gray-500 hover:text-gray-800"
    >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const EyeOffIcon = () => (
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
        className="text-gray-500 hover:text-gray-800"
    >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
);
// --- Akhir Ikon ---

export default function CreateNewPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Efek untuk mengunci scroll body (dari layout contoh)
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = "auto");
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors(null);
        setIsSubmitting(true);

        // --- Validasi ---
        if (!password || !confirmPassword) {
            setErrors({ message: "Harap isi semua kolom." });
            setIsSubmitting(false);
            return;
        }
        if (password.length < 8) {
            setErrors({ message: "Kata sandi minimal harus 8 karakter." });
            setIsSubmitting(false);
            return;
        }
        if (password !== confirmPassword) {
            setErrors({
                message: "Kata sandi yang Anda masukkan tidak cocok.",
            });
            setIsSubmitting(false);
            return;
        }
        // --- Akhir Validasi ---

        try {
            // Simulasi panggilan API untuk reset password
            console.log("Mengirim data reset password...", { password });
            await new Promise((res) => setTimeout(res, 1500));
            console.log("Password berhasil diatur ulang!");
            // Di aplikasi nyata, Anda mungkin akan redirect ke halaman login
            // atau dashboard
        } catch (error) {
            setErrors({
                message: error.message || "Gagal mengatur ulang kata sandi.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full h-screen flex bg-white overflow-hidden font-sans">
            {/* ============================
            BAGIAN KIRI - CARD BIRU
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
                    {/* Efek kilap kaca */}
                    <div
                        className="
                absolute top-0 left-0 w-full h-1/4
                bg-white/20
                blur-xl
              "
                    />

                    {/* ILUSTRASI (GANTI DENGAN GAMBAR ANDA) */}
                    <img
                        src="/public/images/8-pass.png" // <-- GANTI PATH INI
                        alt="Ilustrasi Reset Password"
                        className="
                w-[60%] h-auto object-contain 
                drop-shadow-xl 
                transition-all duration-500 
                hover:scale-[1.04]
            " // Anda bisa sesuaikan 'w-[60%]' ini
                    />

                    {/* MOODLY TEXT */}
                    <p className="mt-6 text-white text-2xl font-bold tracking-[0.12em] drop-shadow">
                        MOODLY
                    </p>
                </div>
            </div>

            {/* ============================
            BAGIAN KANAN - FORM
            ============================ */}
            <div className="w-full md:w-1/2 h-full flex items-center justify-center px-10 md:px-20">
                <div className="w-full max-w-lg">
                    <h2 className="text-3xl font-bold text-gray-800 mb-3 tracking-tight">
                        Buat Kata Sandi Baru
                    </h2>

                    <p className="mb-8 text-gray-600 text-sm">
                        Kata sandi Anda harus delapan karakter dan berisi
                        kombinasi angka, huruf, dan karakter khusus (#?!) agar
                        aman.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* KATA SANDI BARU */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                                Masukkan kata sandi baru
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    disabled={isSubmitting}
                                    placeholder="kata sandi baru"
                                    className="
                      w-full px-4 py-3 rounded-lg
                      border border-gray-300
                      focus:ring-2 focus:ring-sky-400
                      focus:outline-none
                      transition-all duration-200
                      disabled:bg-gray-100
                    "
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    aria-label="Tampilkan kata sandi"
                                >
                                    {showPassword ? (
                                        <EyeOffIcon />
                                    ) : (
                                        <EyeIcon />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* ULANGI KATA SANDI */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
                                Masukkan ulang kata sandi
                            </label>
                            <div className="relative">
                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    disabled={isSubmitting}
                                    placeholder="masukkan ulang kata sandi"
                                    className="
                      w-full px-4 py-3 rounded-lg
                      border border-gray-300
                      focus:ring-2 focus:ring-sky-400
                      focus:outline-none
                      transition-all duration-200
                      disabled:bg-gray-100
                    "
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                    aria-label="Tampilkan kata sandi"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOffIcon />
                                    ) : (
                                        <EyeIcon />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* ERROR */}
                        {errors && (
                            <p className="text-center text-sm text-red-600">
                                {errors.message}
                            </p>
                        )}

                        {/* BUTTON SUBMIT */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="
                  w-full py-3 rounded-full
                  bg-sky-500
                  text-white font-semibold
                  transition-all duration-300
                  hover:bg-sky-600 hover:shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-sky-500/50
                  disabled:bg-sky-300 disabled:scale-100
                "
                        >
                            {isSubmitting
                                ? "Memproses..."
                                : "Atur Ulang Kata Sandi"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
