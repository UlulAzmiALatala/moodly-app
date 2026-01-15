import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

// --- Helper Komponen Form (Tema Cyan) ---
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-none transition-all"
        />
        {error && <small className="text-red-500 mt-1">{error[0]}</small>}
    </div>
);

export default function ChangeAddressPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, getUser } = useAuth();

    // Menentukan mode:
    // 'full' -> Mode Lokasi (Provinsi, Kota, dll) - Sesuai EditPage Customer sebelumnya
    // 'street_only' -> Mode Jalan
    const mode = location.state?.mode || "full";

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

    // Isi form saat data 'user' tersedia
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
        navigate(-1);
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

        // Filter data berdasarkan mode agar tidak menimpa field lain dengan string kosong jika tidak dirender
        let dataToSubmit = {};

        if (mode === "street_only") {
            // Hanya kirim alamat jalan
            dataToSubmit = { street_address: formData.street_address };
        } else {
            // Mode 'full' (Lokasi) -> Kirim data geografis
            dataToSubmit = {
                province: formData.province,
                city: formData.city,
                district: formData.district,
                postal_code: formData.postal_code,
            };
        }

        try {
            await apiClient.post("/api/profile/update", dataToSubmit);

            await getUser(); // Refresh data user global
            setSuccessMessage("Alamat berhasil diperbarui!");

            setTimeout(() => {
                navigate("/profile/edit"); // Kembali ke halaman edit profile
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
            {/* Header */}
            <header className="bg-white p-4 flex items-center sticky top-0 z-10 border-b border-gray-200 shadow-sm">
                <button
                    onClick={handleBack}
                    className="p-2 -ml-2 mr-2 rounded-full hover:bg-gray-100 group transition-colors"
                    aria-label="Kembali"
                >
                    <BackArrowIcon />
                </button>
                <h1 className="text-lg font-bold text-gray-900 text-center flex-grow -translate-x-4">
                    {mode === "street_only"
                        ? "Ubah Alamat Jalan"
                        : "Ubah Lokasi"}
                </h1>
                <div className="w-8"></div>
            </header>

            <main className="p-5 pt-6">
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {successMessage && (
                        <div className="p-3 text-center text-sm text-green-700 bg-green-100 rounded-lg border border-green-200">
                            {successMessage}
                        </div>
                    )}
                    {errors?.general && (
                        <div className="p-3 text-center text-sm text-red-700 bg-red-100 rounded-lg border border-red-200">
                            {errors.general[0]}
                        </div>
                    )}

                    {/* TAMPILAN KONDISIONAL BERDASARKAN MODE */}

                    {/* Mode LOKASI (Provinsi, Kota, Kecamatan, Kode Pos) */}
                    {mode === "full" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <InputField
                                label="Provinsi"
                                name="province"
                                value={formData.province}
                                onChange={handleChange}
                                error={errors?.province}
                                placeholder="Contoh: Jawa Barat"
                            />
                            <InputField
                                label="Kota / Kabupaten"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                error={errors?.city}
                                placeholder="Contoh: Bandung"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="Kecamatan"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    error={errors?.district}
                                    placeholder="Kecamatan"
                                />
                                <InputField
                                    label="Kode Pos"
                                    name="postal_code"
                                    type="number"
                                    value={formData.postal_code}
                                    onChange={handleChange}
                                    error={errors?.postal_code}
                                    placeholder="40111"
                                />
                            </div>
                        </div>
                    )}

                    {/* Mode JALAN (Hanya Text Area) */}
                    {mode === "street_only" && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <TextAreaField
                                label="Nama Jalan, Nomor Rumah"
                                name="street_address"
                                value={formData.street_address}
                                onChange={handleChange}
                                error={errors?.street_address}
                                placeholder="Masukkan nama jalan, nomor rumah, RT/RW..."
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-6 bg-cyan-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:bg-cyan-700 transition-all active:scale-95 disabled:bg-gray-400 disabled:scale-100"
                    >
                        {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </form>
            </main>
        </div>
    );
}
