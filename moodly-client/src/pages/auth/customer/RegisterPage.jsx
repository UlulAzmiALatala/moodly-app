import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// --- Komponen Ikon (dari file lama Anda) ---
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    );
}
function PhoneIcon() {
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
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
    );
}
function MailIcon() {
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
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
    );
}
function AddressIcon() {
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
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
        </svg>
    );
}
function GenderIcon() {
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    );
}
function CalendarIcon() {
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
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
    );
}
// --- Akhir Komponen Ikon ---

// --- Helper Komponen Form (Agar Bersih) ---
const InputField = ({
    name,
    icon,
    value,
    onChange,
    type = "text",
    placeholder,
    error,
}) => (
    <div>
        <div className="relative">
            {icon && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {icon}
                </span>
            )}
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required
                className={`w-full ${
                    icon ? "pl-10" : "px-4"
                } pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none`}
            />
        </div>
        {error && <small className="text-red-500 mt-1">{error}</small>}
    </div>
);
const SelectField = ({ name, icon, value, onChange, error, children }) => (
    <div className="relative">
        {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {icon}
            </span>
        )}
        <select
            name={name}
            value={value}
            onChange={onChange}
            required
            className={`w-full ${
                icon ? "pl-10" : "px-4"
            } pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none appearance-none bg-white ${
                value ? "text-gray-800" : "text-gray-400"
            }`}
            style={{
                backgroundImage:
                    "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.25em 1.25em",
            }}
        >
            {children}
        </select>
        {error && <small className="text-red-500 mt-1">{error}</small>}
    </div>
);
// --- Akhir Helper Form ---

export default function CustomerRegisterPage() {
    const navigate = useNavigate();
    const location = useLocation(); // Untuk menerima data kembali dari AddressPage

    // State untuk data di halaman ini
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [gender, setGender] = useState("");
    const [tanggal_lahir, setTanggalLahir] = useState("");

    // State untuk data dari AddressPage
    const [addressData, setAddressData] = useState(null);
    const [addressDisplay, setAddressDisplay] = useState(""); // Teks yg ditampilkan di tombol

    const [error, setError] = useState("");

    // --- EFEK UNTUK MENERIMA DATA KEMBALI DARI ADDRESSPAGE ---
    useEffect(() => {
        // Cek apakah ada 'state' yang dikirim dari AddressPage
        if (location.state?.addressData) {
            const { address, ...basicData } = location.state.addressData;

            // 1. Simpan data alamat lengkap
            setAddressData(address);

            // 2. Format tampilan alamat sesuai permintaan Anda:
            // "nama jalan, kecamatan, kota, provinsi, kode pos"
            setAddressDisplay(
                `${address.street_address}, ${address.district}, ${address.city}, ${address.province}, ${address.postal_code}`
            );

            // 3. Isi kembali data dasar (jika user menekan 'back' dari AddressPage)
            if (basicData.name) setName(basicData.name);
            if (basicData.phone) setPhone(basicData.phone);
            if (basicData.email) setEmail(basicData.email);
            if (basicData.gender) setGender(basicData.gender);
            if (basicData.tanggal_lahir)
                setTanggalLahir(basicData.tanggal_lahir);
        }
    }, [location.state]); // Dijalankan setiap kali 'state' navigasi berubah

    // --- FUNGSI UNTUK PINDAH KE HALAMAN ALAMAT ---
    const goToAddressPage = () => {
        // Kumpulkan semua data saat ini
        const currentData = { name, phone, email, gender, tanggal_lahir };

        // Kirim data saat ini ke AddressPage, agar bisa dikirim kembali
        navigate("/address", { state: { currentData, addressData } });
    };

    // --- FUNGSI SUBMIT (LANJUTKAN KE CREATE PASSWORD) ---
    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        // Validasi
        if (!name || !phone || !email || !gender || !tanggal_lahir) {
            setError("Harap isi semua data diri.");
            return;
        }
        if (!addressData) {
            setError("Harap isi alamat Anda.");
            return;
        }

        // Kumpulkan SEMUA data (dari halaman ini + dari AddressPage)
        const finalData = {
            name,
            phone,
            email,
            gender,
            tanggal_lahir,
            ...addressData, // Gabungkan data alamat (province, city, dll)
        };

        // Arahkan ke halaman Create Password dengan membawa semua data
        navigate("/create-password", { state: finalData });
    };

    const headerWaveColor = "#00A9E0";

    return (
        <>
            {/* Header (Salin dari RegisterPage lama Anda) */}
            <header className="relative h-64 flex-shrink-0">
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
                            fill={headerWaveColor}
                        />
                    </svg>
                </div>
                <div className="relative z-10 flex justify-center items-start h-full pt-6">
                    <img
                        src={"/images/3.png"}
                        alt="Ilustrasi"
                        className="w-32 h-auto object-contain"
                        onError={(e) => {
                            e.currentTarget.src =
                                "https://placehold.co/128x128/FFFFFF/00A9E0?text=Gambar";
                            e.currentTarget.onerror = null;
                        }}
                    />
                </div>
            </header>

            {/* MAIN CONTENT (FORM) */}
            <main className="flex-grow flex flex-col justify-center p-8">
                <div className="w-full">
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
                        Daftar Akun
                    </h1>
                    <form
                        className="space-y-4"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        {/* Nama */}
                        <InputField
                            label="Nama Lengkap"
                            name="name"
                            icon={<UserIcon />}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nama lengkap Anda"
                        />

                        {/* Telepon */}
                        <InputField
                            label="No. Telepon"
                            name="phone"
                            icon={<PhoneIcon />}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="08xxxxxxxxxx"
                            type="tel"
                        />

                        {/* Email */}
                        <InputField
                            label="Email"
                            name="email"
                            icon={<MailIcon />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@anda.com"
                            type="email"
                        />

                        {/* Jenis Kelamin (BARU) */}
                        <SelectField
                            label="Jenis Kelamin"
                            name="gender"
                            icon={<GenderIcon />}
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                        >
                            <option value="" disabled>
                                Pilih Jenis Kelamin
                            </option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </SelectField>

                        {/* Tanggal Lahir (BARU) */}
                        <InputField
                            label="Tanggal Lahir"
                            name="tanggal_lahir"
                            icon={<CalendarIcon />}
                            value={tanggal_lahir}
                            onChange={(e) => setTanggalLahir(e.target.value)}
                            type="date"
                        />

                        {/* Alamat (Tombol Link) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Alamat
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <AddressIcon />
                                </span>
                                <button
                                    type="button"
                                    onClick={goToAddressPage}
                                    className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-left bg-white truncate ${
                                        addressDisplay
                                            ? "text-gray-800"
                                            : "text-gray-400"
                                    }`}
                                >
                                    {addressDisplay ||
                                        "Masukkan alamat lengkap Anda"}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 text-xs mt-2 text-center p-2 bg-red-50 rounded-md">
                                {error}
                            </div>
                        )}

                        {/* Tombol Lanjutkan */}
                        <button
                            type="submit"
                            className="w-full py-3 !mt-6 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Lanjutkan
                        </button>
                    </form>

                    <div className="text-center text-sm text-gray-600 mt-4">
                        Sudah punya akun?{" "}
                        <Link
                            to="/login" // Link ke login customer
                            className="text-sky-500 font-semibold hover:underline"
                        >
                            Masuk
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
