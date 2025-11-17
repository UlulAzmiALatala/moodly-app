import React from "react";
// import { useNavigate } from "react-router-dom";

// --- Mock useNavigate hook for demonstration ---
// Di aplikasi React sungguhan, Anda akan mengimpor dari 'react-router-dom'
const useNavigate = () => {
  return (path) => {
    if (path === -1) {
      console.log("Navigate back");
    } else {
      console.log(`Maps to: ${path}`);
    }
    // Dalam aplikasi nyata, ini akan mengubah URL
  };
};
// ----------------------------------------------

const MobileLayout = ({ children }) => (
  <div className="flex justify-center min-h-screen bg-[#FFF9F8]">
    <div className="w-full max-w-md min-h-screen bg-[#FFF9F8] flex flex-col">
      {children}
    </div>
  </div>
);

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

// --- IKON SHARE (EKSPOR) ---
const ShareIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-black"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
    />
  </svg>
);
// ------------------------------

export default function TransactionDetailPage() {
  const navigate = useNavigate();
  
  // Menggunakan elemen div untuk menampilkan pesan, bukan alert()
  const handleShare = () => {
    const messageBox = document.getElementById('message-box');
    if (messageBox) {
      messageBox.classList.remove('hidden');
      setTimeout(() => {
        messageBox.classList.add('hidden');
      }, 2000);
    }
  };
  
  // Fungsi untuk menutup pesan
  const closeMessage = () => {
    const messageBox = document.getElementById('message-box');
    if (messageBox) {
      messageBox.classList.add('hidden');
    }
  }

  return (
    <MobileLayout>
      {/* Background biru bagian atas dan bawah */}
      <div className="flex flex-col flex-1 bg-[#00B0FF] relative">
        {/* Header (Diubah untuk centering dan teks lebih besar/bold) */}
        <header className="w-full p-4 pt-8 flex items-center bg-[#00B0FF] relative">
          {/* Tombol kembali (absolute agar tidak mengganggu centering) */}
          <button onClick={() => navigate(-1)} className="text-white absolute left-4 top-1/2 -translate-y-1/2 mt-2">
            <BackArrowIcon />
          </button>
          {/* Teks Header: centered, lebih besar, dan tebal */}
          <h1 className="text-white font-extrabold text-xl w-full text-center">Detail Transaksi</h1>
        </header>

        {/* Card putih di tengah - Jarak atas ditingkatkan (mt-12) */}
        <div className="bg-white rounded-3xl mx-4 p-6 mt-12 shadow-xl overflow-y-auto mb-8 flex-1">
          {/* Status */}
          <div className="flex flex-col items-center mb-6 mt-4">
            {/* Centang Hijau (Success Icon) diperbesar: w-28 h-28 */}
            <div className="w-28 h-28 rounded-full bg-green-500 flex items-center justify-center mb-3"> 
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-14 w-14 text-white" /* Ikon di dalamnya juga diperbesar */
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Sukses</h2>
          </div>

          {/* Info transaksi */}
          <div className="text-sm text-gray-600 mb-4">
            <p className="mb-1">28 April 2025, 13:00</p>
            <div className="flex justify-between">
              <span>ID Transaksi</span>
              <span className="font-medium text-gray-800">11223344556677</span>
            </div>
          </div>

          {/* Garis pemisah */}
          <hr className="border-gray-300 my-4" />

          {/* Total Bayar */}
          <div className="flex justify-between items-center mb-4 text-sm">
            <span className="font-semibold text-gray-900">Total Bayar</span>
            <span className="font-semibold text-gray-900">Rp.105.000</span>
          </div>

          {/* Garis pemisah */}
          <hr className="border-gray-300 my-4" />

          {/* Detail Penerima */}
          <div className="mb-5 text-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Detail Penerima</h3>
            <div className="flex justify-between text-gray-700">
              <span>Nama</span>
              <span className="font-medium">Indira</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>No. rek</span>
              <span className="font-medium">4837247823743</span>
            </div>
          </div>

          {/* Garis pemisah */}
          <hr className="border-gray-300 my-4" />

          {/* Detail Transaksi */}
          <div className="mb-8 text-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Detail Transaksi</h3>
            <div className="flex justify-between text-gray-700">
              <span>Subtotal Pesanan</span>
              <span className="font-medium">Rp.100.000</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Biaya Admin</span>
              <span className="font-medium">Rp.5.000</span>
            </div>
            {/* Baris Total (dengan border-t) dihapus dari sini */}
          </div>

          {/* Tombol */}
          <div className="flex items-center justify-center gap-3 pb-6">
            <button
              className="flex-1 bg-[#3E68FF] text-white font-semibold py-3 rounded-xl hover:bg-[#3455cc] transition"
              onClick={() => navigate(-1)}
            >
              Selesai
            </button>
            <button
              onClick={handleShare}
              className="p-3 rounded-xl bg-white hover:bg-gray-100 transition shadow-md"
            >
              <ShareIcon />
            </button>
          </div>
        </div>
      </div>
      
      {/* Kotak pesan kustom pengganti alert() */}
      <div id="message-box" className="hidden fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-xl shadow-lg transition-all z-50">
        <span id="message-text">Fitur bagikan belum diimplementasikan.</span>
        <button onClick={closeMessage} className="ml-2 text-gray-300 hover:text-white">&times;</button>
      </div>
    </MobileLayout>
  );
}