import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx"; // Path 3x mundur
import apiClient from "../../../api/axios.js"; // Path 3x mundur

// --- Komponen Ikon ---
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
        className="text-white"
    >
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

// --- BARU: Komponen Kartu Rekening (dari file dummy Anda) ---
const BankLogo = ({ bankName }) => {
    const name = bankName || "N/A";
    let logoClass = "bg-gray-200 text-gray-700"; // Default
    if (name.toLowerCase().includes("bri"))
        logoClass = "bg-blue-600 text-white";
    if (name.toLowerCase().includes("bni"))
        logoClass = "bg-orange-500 text-white";
    if (name.toLowerCase().includes("bca"))
        logoClass = "bg-blue-800 text-white";

    return (
        <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${logoClass}`}
        >
            {name.substring(0, 3).toUpperCase()}
        </div>
    );
};

const BankAccountCard = ({ account }) => (
    <div className="flex items-center gap-4 p-4">
        <BankLogo bankName={account.bankName} />
        <div className="flex-grow">
            <h3 className="text-sm font-semibold text-gray-900">
                {account.accountHolder || "Belum Diatur"}
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
                {account.bankName || "Nama Bank"} .{" "}
                {account.accountNumber || "No. Rekening"}
            </p>
        </div>
    </div>
);
// --- AKHIR KOMPONEN BARU ---

// --- Helper Komponen Form ---
const InputField = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    error,
}) => (
    <div>
        <label
            htmlFor={name}
            className="block text-sm font-medium text-gray-700 mb-1"
        >
            {label}
        </label>
        <input
            type={type}
            id={name}
            name={name}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none"
        />
        {error && <small className="text-red-500 mt-1">{error[0]}</small>}
    </div>
);
// --- Akhir Helper Form ---

export default function ChangeBankAccountPage() {
    const navigate = useNavigate();
    const { user, getUser } = useAuth();

    const [formData, setFormData] = useState({
        bank_name: "",
        account_holder_name: "",
        account_number: "",
    });

    const [errors, setErrors] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Isi form saat data 'user' dari AuthContext tersedia
    useEffect(() => {
        if (user) {
            setFormData({
                bank_name: user.bank_name || "",
                account_holder_name: user.account_holder_name || "",
                account_number: user.account_number || "",
            });
        }
    }, [user]);

    const handleBack = () => {
        navigate(-1); // Kembali ke halaman /profile/edit
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors(null);
        setSuccessMessage("");

        try {
            // Panggil API (data bank ada di CounselorProfileController@update)
            await apiClient.post("/api/counselor/profile/update", formData);
            await getUser(); // Refresh data user global
            setSuccessMessage("Rekening bank berhasil diperbarui!");

            setTimeout(() => {
                navigate("/counselor/profile/edit");
            }, 1500);
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({
                    general: [err.message || "Gagal memperbarui rekening."],
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Data untuk kartu tampilan (read-only) ---
    const currentAccount = {
        bankName: user?.bank_name,
        accountHolder: user?.account_holder_name,
        accountNumber: user?.account_number,
    };

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Header Halaman */}
            <header className="bg-cyan-500 p-4 pt-6 flex items-center sticky top-0 z-20 text-white rounded-b-3xl shadow-lg">
                <button
                    onClick={handleBack}
                    className="p-2 -ml-2 mr-2 rounded-full hover:bg-cyan-600/50 group transition-colors"
                    aria-label="Kembali"
                >
                    <BackArrowIcon />
                </button>
                <h1 className="text-xl font-bold text-center flex-grow -translate-x-4">
                    Daftar Rekening
                </h1>
                <div className="w-8"></div>
            </header>

            {/* Konten Utama */}
            <main className="p-4 space-y-4">
                {/* --- BAGIAN 1: DAFTAR REKENING SAAT INI --- */}
                <h2 className="text-base font-semibold text-gray-800 px-1 pt-2">
                    Rekening Anda Saat Ini
                </h2>
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    {/* Kita hanya tampilkan satu kartu, karena DB hanya simpan satu */}
                    <BankAccountCard account={currentAccount} />
                </div>
                {/* --- AKHIR BAGIAN 1 --- */}

                {/* --- BAGIAN 2: FORM EDIT/TAMBAH --- */}
                <h2 className="text-base font-semibold text-gray-800 px-1 pt-4">
                    Ubah Rekening
                </h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
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

                    <InputField
                        label="Nama Bank"
                        name="bank_name"
                        value={formData.bank_name}
                        onChange={handleChange}
                        error={errors?.bank_name}
                        placeholder="Contoh: BCA, BRI, BNI"
                    />
                    <InputField
                        label="Nama Pemilik Rekening"
                        name="account_holder_name"
                        value={formData.account_holder_name}
                        onChange={handleChange}
                        error={errors?.account_holder_name}
                        placeholder="Masukkan nama sesuai di buku tabungan"
                    />
                    <InputField
                        label="Nomor Rekening"
                        name="account_number"
                        type="number"
                        value={formData.account_number}
                        onChange={handleChange}
                        error={errors?.account_number}
                        placeholder="Masukkan nomor rekening"
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-6 bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg shadow hover:bg-cyan-600 transition-colors active:scale-95 disabled:bg-gray-400"
                    >
                        {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </form>
                {/* --- AKHIR BAGIAN 2 --- */}
            </main>
        </div>
    );
}
