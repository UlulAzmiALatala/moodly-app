import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; // Path 3x mundur

// --- Komponen Ikon (Disederhanakan) ---
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>{" "}
            <circle cx="12" cy="7" r="4"></circle>
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
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>{" "}
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
    );
}
// --- Akhir Ikon ---

export default function AdminLoginPage() {
    // --- PERBAIKAN: Panggil 'loginAdmin' ---
    const { loginAdmin } = useAuth();
    // --- AKHIR PERBAIKAN ---

    const [email, setEmail] = useState("");
    const [pwd, setPwd] = useState("");
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
            // --- PERBAIKAN: Panggil 'loginAdmin' ---
            await loginAdmin({ email, password: pwd });
            // Guard di router akan menangani redirect ke /admin/dashboard
        } catch (error) {
            // Tangkap error (termasuk "Akun ini bukan akun admin.")
            setErrors({ message: error.message || "Login gagal." });
            setIsSubmitting(false); // <-- Stop loading
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    Admin Moodly
                </h1>

                <form className="space-y-4" onSubmit={onSubmit} noValidate>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <UserIcon />
                        </span>
                        <input
                            type="email"
                            placeholder="Email"
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
                            type="password"
                            placeholder="Kata sandi"
                            value={pwd}
                            onChange={(e) => setPwd(e.target.value)}
                            required
                            disabled={isSubmitting} // <-- Disable saat loading
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
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
                    <Link
                        to="/"
                        className="text-sky-500 font-semibold hover:underline"
                    >
                        Kembali ke Halaman Utama
                    </Link>
                </div>
            </div>
        </div>
    );
}
