import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Komponen InputField (tidak diubah)
function InputField({ label, placeholder, value, onChange, type = "text" }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
        </div>
    );
}

// Komponen Ikon (viewBox diperbaiki)
function ArrowLeftIcon() {
    return (
        <svg
            xmlns="http://www.w.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
    );
}

export default function AddressPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const registrationData = location.state;

    const [province, setProvince] = useState("");
    const [city, setCity] = useState("");
    const [district, setDistrict] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [streetAddress, setStreetAddress] = useState(
        registrationData?.address || ""
    );
    const [error, setError] = useState("");

    useEffect(() => {
        if (!registrationData) {
            navigate("/register");
        }
    }, [registrationData, navigate]);

    // FUNGSI INI DIPERBAIKI
    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (!province || !city || !district || !postalCode || !streetAddress) {
            setError("Harap isi semua detail alamat.");
            return;
        }

        const finalData = {
            ...registrationData,
            province,
            city,
            district,
            postal_code: postalCode,
            street_address: streetAddress,
        };

        // Tidak lagi mengirim ke API, tapi meneruskan ke halaman selanjutnya
        navigate("/create-password", { state: finalData });
    };

    return (
        <>
            <header className="p-4 flex items-center border-b flex-shrink-0">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 mr-2 rounded-full hover:bg-gray-100"
                >
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-lg font-bold text-gray-800">Alamat Baru</h1>
            </header>
            <main className="flex-grow flex flex-col p-8 pt-6">
                <p className="text-sm text-gray-500 mb-6">
                    Silahkan masukan alamat baru anda.
                </p>
                <div className="w-full">
                    <form
                        className="space-y-4"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <InputField
                            label="Provinsi"
                            placeholder="Masukkan provinsi"
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                        />
                        <InputField
                            label="Kota"
                            placeholder="Masukkan kota"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                        <InputField
                            label="Kecamatan"
                            placeholder="Masukkan kecamatan"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                        />
                        <InputField
                            label="Kode Pos"
                            placeholder="Masukkan kode pos"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            type="number"
                        />
                        <InputField
                            label="Nama Jalan, Gedung, No. Rumah"
                            placeholder="Masukkan detail alamat"
                            value={streetAddress}
                            onChange={(e) => setStreetAddress(e.target.value)}
                        />
                        {error && (
                            <p className="text-sm text-center text-red-500">
                                {error}
                            </p>
                        )}
                        <div className="!mt-8">
                            <button
                                type="submit"
                                className="w-full py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
                            >
                                Lanjutkan
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
