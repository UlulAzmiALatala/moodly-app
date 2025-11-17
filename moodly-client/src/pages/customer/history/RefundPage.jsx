import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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

const LoadingSpinner = () => (
  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
    <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
  </div>
);

const ErrorMessage = ({ message, onClose }) => (
  <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm mb-4 relative">
    <p>{message}</p>
    <button
      onClick={onClose}
      className="absolute top-1 right-2 text-red-700 font-bold"
    >
      X
    </button>
  </div>
);

export default function RefundPage() {
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [jenisBank, setJenisBank] = useState("");
  const [customBank, setCustomBank] = useState("");
  const [noRekening, setNoRekening] = useState("");
  const [gambar, setGambar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Ukuran gambar maksimal adalah 2MB.");
        e.target.value = null;
        return;
      }
      setGambar(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nama || !noRekening || !gambar || (!jenisBank && !customBank)) {
      setError("Semua kolom wajib diisi dan bukti harus diunggah.");
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      setLoading(false);
      alert("Pengajuan pengembalian dana berhasil dikirim!");
      navigate(-1);
    }, 1500);
  };

  return (
    <MobileLayout>
      {loading && <LoadingSpinner />}

      <div className="flex flex-col h-full w-full bg-[#00D1FF] relative">
        {/* Header */}
        <header className="w-full p-4 pt-8 sticky top-0 z-20 bg-[#00D1FF]">
          <div className="flex items-center gap-4">
            <button
              className="text-white"
              onClick={() => navigate(-1)}
              aria-label="Kembali"
            >
              <BackArrowIcon />
            </button>
            <h1 className="text-white font-semibold text-lg">Pengembalian Dana</h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white rounded-t-[2.5rem] overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-between flex-1 p-6 mt-8 space-y-7"
          >
            <div className="space-y-7">
              {error && (
                <ErrorMessage message={error} onClose={() => setError(null)} />
              )}

              {/* Atas Nama */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Atas Nama
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Masukkan nama pemilik rekening"
                  className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none"
                />
              </div>

              {/* Jenis Bank */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Jenis Bank
                </label>
                <select
                  value={jenisBank}
                  onChange={(e) => setJenisBank(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none"
                >
                  <option value="">Pilih Bank</option>
                  <option value="BNI">BNI</option>
                  <option value="BCA">BCA</option>
                  <option value="BRI">BRI</option>
                  <option value="MANDIRI">Mandiri</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>

                {jenisBank === "LAINNYA" && (
                  <input
                    type="text"
                    value={customBank}
                    onChange={(e) => setCustomBank(e.target.value)}
                    placeholder="Masukkan nama bank lain"
                    className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none mt-3"
                  />
                )}
              </div>

              {/* Nomor Rekening */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  value={noRekening}
                  onChange={(e) => setNoRekening(e.target.value)}
                  placeholder="Masukkan nomor rekening"
                  className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none"
                />
              </div>

              {/* Upload Gambar */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Upload Bukti Pengembalian Dana (Max 2MB)
                </label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-xl py-7 bg-gray-50">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-40 h-40 object-cover rounded-xl border border-gray-300"
                    />
                  ) : (
                    <p className="text-gray-500 text-sm">Belum ada gambar</p>
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                    className="mt-3 text-sm"
                  />
                </div>
              </div>

              {/* Keterangan Tambahan */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Keterangan Tambahan
                </label>
                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Tulis alasan atau keterangan tambahan"
                  className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Tombol Kirim */}
            <div className="pt-8 pb-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00D1FF] text-white font-semibold py-3 rounded-xl border-2 border-black hover:bg-[#00bde6] transition disabled:bg-gray-400"
              >
                {loading ? "Mengirim..." : "Kirim Pengajuan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MobileLayout>
  );
}
