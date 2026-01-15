import React, { useState, useEffect } from "react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false); // State untuk pesan sukses

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => (document.body.style.overflow = "auto");
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrors(null);
        setIsSuccess(false); // Reset status sukses
        setIsSubmitting(true);

        if (!email) {
            setErrors({ message: "Harap isi kolom email." });
            setIsSubmitting(false);
            return;
        }

        try {
            // Simulasi kirim email
            console.log("Mengirim link reset ke:", email);
            await new Promise((res) => setTimeout(res, 1500));
            console.log("Email terkirim!");
            setIsSuccess(true); // Tampilkan pesan sukses
        } catch (error) {
            setErrors({
                message: error.message || "Gagal mengirim email verifikasi.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full h-screen flex bg-white overflow-hidden font-sans">
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

                    {/* IMAGE (GANTI DENGAN GAMBAR ANDA) */}
                    <img
                        src="/public/images/3.png"
                        alt="Ilustrasi Forgot Password"
                        className="
                w-[55%] h-auto object-contain
                drop-shadow-xl
                transition-all duration-500
                hover:scale-[1.04]
            " // Sesuaikan 'w-[55%]' jika perlu
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
                        Kesulitan Log In ?
                    </h2>

                    <p className="mb-8 text-gray-600 text-sm leading-relaxed">
                        Masukkan email, nomor telepon, atau nama pengguna yang
                        terkait dengan akun Anda untuk mengubah kata sandinya.
                        melanjutkan ke curhat
                    </p>

                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* EMAIL */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">
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
                    focus:ring-2 focus:ring-sky-400
                    focus:outline-none
                    transition-all duration-200
                    disabled:bg-gray-100
                  "
                            />
                        </div>

                        {/* BUTTON */}
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
                            {isSubmitting ? "Mengirim..." : "Send"}
                        </button>

                        {/* ERROR */}
                        {errors && (
                            <p className="text-center text-sm text-red-600">
                                {errors.message}
                            </p>
                        )}

                        {/* SUKSES */}
                        {isSuccess && (
                            <p className="text-center text-sm text-green-600">
                                Email verifikasi telah terkirim! Silakan cek
                                inbox Anda.
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
