import React from "react";
// Impor ini tidak digunakan di halaman loading, tapi dipertahankan untuk konsistensi layout
// import { useNavigate } from "react-router-dom"; 

// --- Mock useNavigate hook ---
const useNavigate = () => {
  return (path) => {
    console.log(`Navigasi ke: ${path}`);
  };
};
// -----------------------------

const MobileLayout = ({ children }) => (
  // Menggunakan Tailwind CSS untuk layout mobile
  <div className="flex justify-center min-h-screen bg-[#FFF9F8]">
    <div className="w-full max-w-md min-h-screen bg-[#00B0FF] flex flex-col">
      {children}
    </div>
  </div>
);

// CSS Animasi untuk Pengiriman Uang (Transisi Mengalir)
const styles = `
/* Keyframes untuk Uang yang Mengalir (Menggantikan coin-drop) */
@keyframes coin-flow {
  /* Mulai dari luar kiri atas, kecil, dan transparan */
  0% { transform: translate(-40px, -20px) scale(0.8); opacity: 0; }
  /* Muncul dan bergerak ke tengah */
  20% { transform: translate(0px, 0px) scale(1); opacity: 1; }
  /* Bergerak menuju target admin (sekitar 50, 60 di viewBox) */
  80% { transform: translate(0px, 40px) scale(1); opacity: 1; }
  /* Masuk ke dalam target dan menghilang di posisi target */
  100% { transform: translate(0px, 60px) scale(0.6); opacity: 0; }
}

/* Keyframes untuk target penerima yang berdenyut (pulse) */
@keyframes pulse-target {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); } /* Sedikit membesar di tengah */
}

/* Styling untuk koin/uang yang dikirim (Animasi Aliran) */
.coin-flow-animation {
  animation: coin-flow 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite; /* Kurva gerak yang halus */
  animation-delay: 0.2s; /* Tambahkan delay sedikit */
}

/* Styling untuk target penerima yang berdenyut */
.pulse-target-animation {
  animation: pulse-target 1s ease-in-out infinite;
  transform-origin: center bottom;
}

/* Kontainer utama animasi */
.money-animation-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150px; /* Ukuran animasi */
  height: 150px;
}
`;

const SendingMoneyIcon = () => (
  // Ikon Animasi Pengiriman Uang (SVG)
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 100" 
    className="w-full h-full relative"
    fill="none"
  >
    {/* 1. Target Penerima (Kotak atau Dompet Admin) - Berdenyut */}
    {/* Diterjemahkan untuk mereplikasi posisi dompet di bagian bawah SVG */}
    <g id="receiver-target" className="pulse-target-animation" transform="translate(0, 5)">
        {/* Body Dompet/Vault (Hijau) */}
        <rect x="20" y="60" width="60" height="25" rx="5" fill="#4CAF50" stroke="#388E3C" strokeWidth="2"/>
        {/* Lipatan Atas Dompet/Target */}
        <path d="M20 60 L50 55 L80 60 Z" fill="#388E3C"/>
        {/* Slot Masuk Uang */}
        <rect x="40" y="56" width="20" height="3" fill="#2E7D32" rx="1.5"/>
        {/* Ikon User/Admin kecil di Tengah Dompet */}
        <circle cx="50" cy="70" r="5" fill="#FFFFFF"/>
        <path d="M40 75 C40 80, 60 80, 60 75 Z" fill="#FFFFFF"/>
    </g>

    {/* 2. Uang/Koin yang Mengalir/Dikirim - Animasi Aliran */}
    {/* Posisi Awal Koin diatur oleh keyframes 'coin-flow' */}
    <g id="animated-coin" className="coin-flow-animation">
      {/* Koin (Emas) */}
      <circle cx="50" cy="20" r="12" fill="#FFD700" stroke="#DAA520" strokeWidth="2"/>
      {/* Simbol Mata Uang (menggunakan simbol universal '$' sebagai representasi) */}
      <text x="50" y="24" textAnchor="middle" fontSize="10" fill="#DAA520" fontWeight="bold">
        $
      </text>
    </g>
    
    {/* Opsi: Tambahkan partikel kecil untuk efek aliran */}
    <g id="flow-particle-1" className="coin-flow-animation" style={{ animationDelay: '0.0s' }}>
        <circle cx="50" cy="20" r="3" fill="#FFD700" opacity="0.6"/>
    </g>
    <g id="flow-particle-2" className="coin-flow-animation" style={{ animationDelay: '0.4s' }}>
        <circle cx="50" cy="20" r="3" fill="#FFD700" opacity="0.6"/>
    </g>

  </svg>
);


export default function LoadingPage() {
  // Mock useNavigate agar tidak ada error, meskipun tidak digunakan
  const navigate = useNavigate(); 

  return (
    <MobileLayout>
      {/* Memasukkan style animasi ke dalam DOM */}
      <style>{styles}</style>

      {/* Konten Halaman Tunggu */}
      <div className="flex flex-col items-center justify-center flex-1 text-white p-8 bg-[#00B0FF] min-h-screen">
        
        {/* Kontainer Animasi Pengiriman Uang */}
        <div className="money-animation-container mb-12">
          <SendingMoneyIcon />
        </div>

        {/* Teks "Mohon Tunggu..." */}
        <h1 className="text-3xl font-semibold italic mb-2 text-shadow">
          Mohon Tunggu...
        </h1>
        
        {/* Status Transaksi */}
        <p className="text-lg font-light mb-4">
          Transaksi sedang diproses mohon tunggu 1x24jam
        </p>

        {/* Animasi Loader Teks */}
        <div className="text-4xl font-extrabold tracking-widest animate-pulse">
          . . .
        </div>
      </div>
    </MobileLayout>
  );
}