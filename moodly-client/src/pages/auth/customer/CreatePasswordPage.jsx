import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext"; // Path 3x mundur

// --- Komponen Ikon ---
function ArrowLeftIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
    );
}
function EyeIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}
function EyeOffIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 7 11 7a13.16 13.16 0 0 1-1.67 2.68"></path>
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 11 7a9.74 9.74 0 0 0 5.39-1.61"></path>
            <line x1="2" y1="22" x2="22" y2="2"></line>
        </svg>
    );
}
// --- Akhir Komponen Ikon ---

export default function CustomerCreatePasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Gunakan 'registerCustomer' dari AuthContext
    const { registerCustomer } = useAuth();

    // Menerima data gabungan dari RegisterPage
    const registrationData = location.state;

    const [password, setPassword] = useState("");
    const [password_confirmation, setPasswordConfirmation] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [errors, setErrors] = useState(null); // State untuk error backend
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Cek jika data KUNCI (misal: email atau alamat) tidak ada
        // Jika tidak, paksa kembali ke halaman register
        if (
            !registrationData ||
            !registrationData.email ||
            !registrationData.street_address
        ) {
            navigate("/register");
        }
    }, [registrationData, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors(null); // Bersihkan error lama
        setIsSubmitting(true);

        if (password.length < 8) {
            setErrors({ password: ["Password minimal 8 karakter."] });
            setIsSubmitting(false);
            return;
        }
        if (password !== password_confirmation) {
            setErrors({
                password_confirmation: ["Konfirmasi kata sandi tidak cocok."],
            });
            setIsSubmitting(false);
            return;
        }

        // Gabungkan semua data (Halaman 1, 2, dan 3)
        const finalData = {
            ...registrationData,
            password,
            password_confirmation,
        };

        try {
            // Panggil API register /api/register
            await registerCustomer(finalData);

            // AuthContext akan me-reload user, Guard akan mengarahkan
            // Kita bisa arahkan manual ke home
            navigate("/home");
        } catch (err) {
            if (err.response && err.response.status === 422) {
                // Tampilkan error validasi dari backend
                setErrors(err.response.data.errors);
            } else {
                // Tampilkan error umum
                setErrors({ general: [err.message || "Gagal mendaftar."] });
            }
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col">
            <header className="relative h-60 flex-shrink-0 bg-sky-400 text-white">
                <div className="absolute inset-0 px-6 py-8 z-10">
                    <button
                        onClick={() => navigate(-1)} // Kembali ke RegisterPage
                        className="p-1 rounded-full text-white"
                    >
                        <ArrowLeftIcon />
                    </button>
                    <h1 className="text-3xl font-bold mt-4">Buat Kata Sandi</h1>
                    <p className="text-base opacity-90 mt-1">
                        Buat kata sandi untuk keamanan akun Anda
                    </p>
                </div>
            </header>
            <main className="flex-grow w-full bg-white rounded-t-3xl shadow-lg p-6 -mt-10 z-20">
                <form
                    className="space-y-4 mt-4"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    {/* Input Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-2">
                            Kata Sandi
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Minimal 8 karakter"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:outline-none pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((p) => !p)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors?.password && (
                            <small className="text-red-500 mt-1">
                                {errors.password[0]}
                            </small>
                        )}
                    </div>

                    {/* Konfirmasi Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-800 mb-2">
                            Masukan ulang Kata sandi
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={password_confirmation}
                                onChange={(e) =>
                                    setPasswordConfirmation(e.target.value)
                                }
                                required
                                placeholder="Ulangi kata sandi"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-400 focus:outline-none pr-12"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword((p) => !p)
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showConfirmPassword ? (
                                    <EyeOffIcon />
                                ) : (
                                    <EyeIcon />
                                )}
                            </button>
                        </div>
                        {errors?.password_confirmation && (
                            <small className="text-red-500 mt-1">
                                {errors.password_confirmation[0]}
                            </small>
                        )}
                    </div>

                    {errors?.general && (
                        <p className="text-sm text-center text-red-600 bg-red-100 p-2 rounded-md">
                            {errors.general[0]}
                        </p>
                    )}

                    <div className="!mt-8">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 active:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400"
                        >
                            {isSubmitting
                                ? "Memproses..."
                                : "Simpan dan Daftar"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
