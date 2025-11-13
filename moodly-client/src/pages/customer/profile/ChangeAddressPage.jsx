import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // <-- Import useLocation
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axios";

// --- Komponen Ikon ---
const BackArrowIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-700 group-hover:text-gray-900"
    >
        {" "}
        <line x1="19" y1="12" x2="5" y2="12"></line>{" "}
        <polyline points="12 19 5 12 12 5"></polyline>{" "}
    </svg>
);
// --- Akhir Komponen Ikon ---

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
const TextAreaField = ({
    label,
    name,
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
        <textarea
            rows="3"
            id={name}
            name={name}
            placeholder={placeholder}
            value={value || ""}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
        />
        {error && <small className="text-red-500 mt-1">{error[0]}</small>}
    </div>
);
// --- Akhir Helper Form ---

export default function ChangeAddressPage() {
    const navigate = useNavigate();
    const location = useLocation(); // <-- Ambil location
    const { user, getUser } = useAuth();

    // --- PERBAIKAN: Tentukan mode berdasarkan state ---
    // Default ke 'full' jika tidak ada state (meskipun seharusnya ada)
    const mode = location.state?.mode || "full"; // 'full' atau 'street_only'
    // --- AKHIR PERBAIKAN ---

    const [formData, setFormData] = useState({
        province: "",
        city: "",
        district: "",
        postal_code: "",
        street_address: "",
    });

    const [errors, setErrors] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // Isi form saat data 'user' dari AuthContext tersedia
    useEffect(() => {
        if (user) {
            setFormData({
                province: user.province || "",
                city: user.city || "",
                district: user.district || "",
                postal_code: user.postal_code || "",
                street_address: user.street_address || "",
            });
        }
    }, [user]);

    const handleBack = () => {
        navigate(-1); // Kembali ke halaman /profile/edit
    };

    // Handler universal untuk semua input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors(null);
        setSuccessMessage("");

        // Tentukan data apa yang akan dikirim berdasarkan mode
        let dataToSubmit = {};
        if (mode === "street_only") {
            dataToSubmit = { street_address: formData.street_address };
        } else {
            // Mode 'full' mengirim semuanya
            dataToSubmit = formData;
        }

        try {
            // Panggil API update profil HANYA dengan data yang relevan
            const response = await apiClient.post(
                "/api/profile/update",
                dataToSubmit
            );

            await getUser(); // Refresh data user global
            setSuccessMessage("Alamat berhasil diperbarui!");

            setTimeout(() => {
                navigate("/profile/edit"); // Kembali ke menu edit
            }, 1500);
        } catch (err) {
            if (err.response && err.response.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({
                    general: [err.message || "Gagal memperbarui profil."],
                });
            }
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white min-h-full font-sans">
            <header className="bg-white p-4 flex items-center sticky top-0 z-10 border-b border-gray-200">
                <button
                    onClick={handleBack}
                    className="p-2 -ml-2 mr-2 rounded-full hover:bg-gray-100 group transition-colors"
                    aria-label="Kembali"
                >
                    <BackArrowIcon />
                </button>
                <h1 className="text-lg font-bold text-gray-800 text-center flex-grow">
                    Ubah Alamat
                </h1>
                <div className="w-8"></div>
            </header>

            <main className="p-4">
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

                    {/* --- PERBAIKAN: Tampilkan bidang secara kondisional --- */}
                    {mode === "full" && (
                        <>
                            <InputField
                                label="Provinsi"
                                name="province"
                                value={formData.province}
                                onChange={handleChange}
                                error={errors?.province}
                                placeholder="Masukkan provinsi"
                            />
                            <InputField
                                label="Kota"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                error={errors?.city}
                                placeholder="Masukkan kota"
                            />
                            <InputField
                                label="Kecamatan"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                error={errors?.district}
                                placeholder="Masukkan kecamatan"
                            />
                            <InputField
                                label="Kode Pos"
                                name="postal_code"
                                type="number"
                                value={formData.postal_code}
                                onChange={handleChange}
                                error={errors?.postal_code}
                                placeholder="Masukkan kode pos"
                            />
                        </>
                    )}

                    {/* Bidang 'street_address' selalu tampil untuk kedua mode */}
                    <TextAreaField
                        label="Nama Jalan, No Rumah"
                        name="street_address"
                        value={formData.street_address}
                        onChange={handleChange}
                        error={errors?.street_address}
                        placeholder="Masukkan detail alamat jalan, nomor rumah, RT/RW..."
                    />
                    {/* --- AKHIR PERBAIKAN --- */}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-6 bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg shadow hover:bg-cyan-600 transition-colors active:scale-95 disabled:bg-gray-400"
                    >
                        {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </form>
            </main>
        </div>
    );
}
