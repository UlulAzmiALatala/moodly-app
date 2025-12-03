import React, { useState } from 'react';
import { X, Loader2, CheckCircle } from 'lucide-react'; 

// --- Komponen Layout & Ikon berdasarkan contoh Anda ---

// Ikon panah kembali yang bisa digunakan ulang
const BackArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

// Komponen Layout Mobile yang Diadaptasi
const MobileLayout = ({ children, headerTitle, onBack }) => {
    // Warna biru terang yang mendekati gambar Anda untuk header simulasi
    const appBlue = '#00aaff'; 

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 font-['Poppins']">
      <div className="w-full max-w-md min-h-screen bg-white flex flex-col shadow-lg">

        {/* Header Biru Kustom - Dibuat lebih tinggi dengan pt-8 pb-6 */}
        <header 
            style={{ backgroundColor: appBlue }} 
            className="relative z-10 flex items-center px-4 pt-8 pb-6 shadow-md text-white"
        >
            <button
                onClick={onBack}
                aria-label="Kembali"
                className="p-1 -ml-1 absolute top-7 left-4"
            >
                <BackArrowIcon />
            </button> 
            <h1 className="flex-1 text-center text-xl font-bold tracking-tight">{headerTitle}</h1>
        </header>

        {children}
        
      </div>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        `}
      </style>
    </div>
  );
};

// --- Komponen Utama Aplikasi (Konfirmasi Pembatalan) ---
const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Warna Primer: Biru untuk tombol konfirmasi
  const primaryColor = '#00aaff'; 
  // Warna Sekunder: Hitam untuk tombol kembali
  const secondaryColor = '#000000'; 
  
  // Fungsi yang dipanggil saat pengguna mengkonfirmasi pembatalan sesi
  const handleConfirmCancel = () => {
    setIsProcessing(true);
    
    // Simulasikan proses asynchronous (memanggil API Laravel untuk MEMBATALKAN SESI)
    setTimeout(() => {
      setIsProcessing(false);
      // Di sini akan terjadi pemanggilan API ke backend yang mengurus pembatalan & pengembalian 50%.
      
      // Setelah berhasil, tampilkan modal sukses
      setIsModalOpen(true);
      // Di dunia nyata, di sini akan ada navigasi ke halaman refund:
      // navigate('/refund-form'); 
    }, 2000); 
  };

  // Fungsi yang dipanggil saat pengguna memutuskan tidak jadi batal
  const handleGoBack = () => {
    console.log("Navigasi kembali ke halaman sebelumnya (tidak jadi batal).");
  };

  return (
    <MobileLayout headerTitle="Konfirmasi Pembatalan" onBack={handleGoBack}>
      
      {/* Konten Konfirmasi Utama - Mengambil sisa ruang dengan flex-1 */}
      <main className="flex-1 px-6 flex flex-col items-center justify-start pt-10">
        
        <div className="w-full text-center"> 

          {/* Ikon Peringatan Pembatalan - Silang Merah Pekat */}
          <div className="mx-auto w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-10">
            {/* Menggunakan X putih di latar belakang merah pekat */}
            <X strokeWidth={3} className="w-14 h-14 text-white" />
          </div>
          
          {/* Judul Konfirmasi - Diubah dari text-3xl menjadi text-2xl */}
          <h2 className="text-2xl font-extrabold text-gray-800 mb-5 tracking-tight">
            YAKIN BATALKAN SESI INI?
          </h2>

          {/* Pesan Kebijakan Pembatalan yang Jelas dalam bentuk Poin-Poin */}
          <div className="text-left w-full mb-6">
            <ol className="list-decimal list-inside space-y-3 text-gray-700 text-base font-medium">
              <li>
                <span className="font-extrabold text-red-600">Kebijakan Pengembalian Dana:</span> Pembatalan sesi saat ini hanya akan mengembalikan **50%** dari total biaya yang telah Anda bayarkan.
              </li>
              <li>
                <span className="font-extrabold text-red-600">Dana Tidak Kembali Penuh:</span> Sisa 50% akan dianggap sebagai biaya administrasi dan pembatalan mendadak.
              </li>
              <li>
                <span className="font-extrabold text-red-600">Langkah Selanjutnya:</span> Setelah mengkonfirmasi pembatalan, Anda akan diarahkan ke halaman *refund* untuk mengisi data pengembalian dana.
              </li>
              <li>
                <span className="font-extrabold text-red-600">Proses Otomatis:</span> Setelah Anda mengirimkan formulir pengembalian dana, uang Anda akan secara otomatis diproses ke rekening Anda dalam waktu 1x24 Jam Kerja.
              </li>
            </ol>
          </div>
          
          {/* Badge Pengembalian Dana dengan Glow Oranye (Menarik perhatian pada kebijakan 50%) */}
          <div 
            style={{ 
                backgroundColor: '#ffe0b2', // Warna Oranye Muda/Krem
                color: '#e65100', // Warna Oranye Gelap
                boxShadow: `0 0 10px rgba(255, 165, 0, 0.5)`, // Glow oranye
            }}
            className="inline-block px-8 py-3 rounded-xl font-bold mb-10 text-base"
          >
            Pengembalian Dana: 50%
          </div>

          <p className="text-gray-500 text-sm mt-4">
             Proses pengembalian dana akan dimulai setelah konfirmasi pembatalan.
          </p>

        </div>
      </main>

      {/* Kontainer Tombol Bawah - Tidak sticky, ikut di-scroll */}
      <footer className="w-full bg-white p-6 shadow-t-xl border-t border-gray-100">
          
          {/* Tombol Aksi Konfirmasi (Warna Biru) */}
          <button 
            onClick={handleConfirmCancel} 
            disabled={isProcessing}
            style={{ backgroundColor: isProcessing ? '#80c8ff' : primaryColor }}
            className="w-full py-3 px-4 text-white font-bold rounded-full shadow-lg transition duration-300 active:scale-[0.98] focus:outline-none"
          >
            {isProcessing ? (
                <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses Pembatalan...
                </span>
            ) : (
                'Ya, Batalkan Sesi & Lanjut ke Refund'
            )}
          </button>

          {/* Tombol Kembali/Batal (Warna Hitam) */}
          <button 
            onClick={handleGoBack}
            style={{ backgroundColor: secondaryColor }}
            className="mt-3 w-full py-3 px-4 text-white font-bold rounded-full shadow-lg hover:bg-gray-800 transition duration-300 active:scale-[0.98] focus:outline-none text-base"
          >
            Tidak, Kembali
          </button>
      </footer>

      {/* Modal Notifikasi / Proses */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full text-center transform transition-all duration-300">
            {isProcessing ? (
                <>
                    <Loader2 className="mx-auto h-10 w-10 text-yellow-500 animate-spin mb-4" />
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Sedang Membatalkan Sesi...</h3>
                    <p className="text-sm text-gray-500">Mohon tunggu sebentar saat kami memproses pembatalan dan pengembalian dana Anda.</p>
                </>
            ) : (
                <>
                    {/* Setelah selesai memproses */}
                    <CheckCircle className="mx-auto h-10 w-10 text-green-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Pembatalan Berhasil!</h3>
                    <p className="text-gray-600 mb-6 text-sm">Sesi Anda telah dibatalkan. Anda akan diarahkan ke halaman refund.</p>
                    <button 
                        onClick={() => setIsModalOpen(false)} 
                        className="py-2 px-6 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition active:scale-95"
                    >
                        Lanjut ke Halaman Refund
                    </button>
                </>
            )}
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default App;