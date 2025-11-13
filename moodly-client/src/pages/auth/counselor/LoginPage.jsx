import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; // Path 3x mundur

// --- Komponen Ikon (Tidak diubah) ---
function UserIcon() {
    return (
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
        >
            {" "}
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>{" "}
            <circle cx="12" cy="7" r="4"></circle>{" "}
        </svg>
    );
}
function LockIcon() {
    return (
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
        >
            {" "}
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>{" "}
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>{" "}
        </svg>
    );
}
function EyeIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {" "}
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />{" "}
            <circle cx="12" cy="12" r="3" />{" "}
        </svg>
    );
}
function EyeOffIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {" "}
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />{" "}
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />{" "}
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />{" "}
            <line x1="2" x2="22" y1="2" y2="22" />{" "}
        </svg>
    );
}
// --- End of Icon Components ---

export default function CounselorLoginPage() {
    // --- PERBAIKAN: Panggil 'loginCounselor' ---
    const { loginCounselor } = useAuth();
    // --- AKHIR PERBAIKAN ---

    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [errors, setErrors] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // <-- Tambahkan state submitting

    const onSubmit = async (e) => {
        e.preventDefault();
        setErrors(null);
        setIsSubmitting(true); // <-- Set loading

        if (!email || !pwd) {
            setErrors({ message: "Harap isi semua kolom." });
            setIsSubmitting(false); // <-- Stop loading
            return;
        }

        try {
            // --- PERBAIKAN: Panggil 'loginCounselor' ---
            await loginCounselor({ email, password: pwd });
            // Navigasi akan diurus oleh router jika berhasil
        } catch (error) {
            // Tangkap error (baik dari validasi 422 atau error role)
            setErrors({ message: error.message || "Login gagal." });
            setIsSubmitting(false); // <-- Stop loading
        }
    };

    return (
        <>
            <header className="relative h-80 flex-shrink-0">
                <div className="absolute inset-x-0 top-0 w-full h-full">
                    <svg
                        viewBox="0 0 375 240"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M0 0H375V150C375 150 281.25 240 187.5 240C93.75 240 0 150 0 150V0Z"
                            fill="#00A9E0"
                        />
                    </svg>
                </div>
                <div className="relative z-10 flex justify-center items-start h-full pt-12">
                    <img
                        src="/images/3.png" // Pastikan path gambar ini benar
                        alt="Ilustrasi"
                        className="w-44 h-auto object-contain"
                    />
                </div>
            </header>

            <main className="flex-grow flex flex-col justify-center p-8">
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
                        Login Konselor
                    </h1>

                    <form className="space-y-4" onSubmit={onSubmit} noValidate>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <UserIcon />
                            </span>
                            <input
                                type="email"
                                placeholder="Email atau No. Telepon"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isSubmitting} // <-- Disable saat loading
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            />
                        </div>

                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <LockIcon />
                            </span>
                            <input
                                type={showPwd ? "text" : "password"}
                                placeholder="Kata sandi"
                                value={pwd}
                                onChange={(e) => setPwd(e.target.value)}
                                required
                                disabled={isSubmitting} // <-- Disable saat loading
                                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                onClick={() => setShowPwd((s) => !s)}
                                aria-label={
                                    showPwd
                                        ? "Sembunyikan kata sandi"
                                        : "Tampilkan kata sandi"
                                }
                            >
                                {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>

                        <div className="text-right">
                            <Link
                                to="/forgot-password" // TODO: Buat alur lupa password konselor
                                className="text-sm text-gray-500 hover:underline"
                            >
                                Lupa Kata sandi?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting} // <-- Disable saat loading
                            className="w-full py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-400"
                        >
                            {isSubmitting ? "Memproses..." : "Masuk"}
                        </button>
                    </form>

                    {errors && (
                        <div className="text-red-600 text-xs mt-3 text-center">
                            {/* --- PERBAIKAN: Tampilkan error dengan benar --- */}
                            {errors.message}
                        </div>
                    )}

                    <div className="text-center text-sm text-gray-600 mt-6">
                        Belum punya akun?{" "}
                        <Link
                            // --- PERBAIKAN: Arahkan ke registrasi konselor ---
                            to="/counselor/register"
                            className="text-sky-500 font-semibold hover:underline"
                        >
                            Daftar
                        </Link>
                    </div>

                    {/* --- PERBAIKAN: Hapus tombol Google ---
                    <button
                        type="button"
                        className="w-full py-3 mt-4 ..."
                    >
                        <GoogleIcon className="w-5 h-5 mr-2" />
                        <span className="font-medium">Masuk dengan Google</span>
                    </button>
                    */}
                </div>
            </main>
        </>
    );
}
