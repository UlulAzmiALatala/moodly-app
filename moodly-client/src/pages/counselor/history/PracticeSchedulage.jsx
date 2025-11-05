import React from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, CalendarDays, Plus } from "lucide-react";

const MobileLayout = ({ children }) => (
  <div className="flex justify-center min-h-screen bg-white">
    <div className="w-full max-w-md min-h-screen bg-white flex flex-col">
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

export default function JadwalPraktikPage() {
  const navigate = useNavigate();

  const jadwalList = [
    {
      title: "Jadwal Berdasarkan Hari",
      hari: "Senin, Selasa, Rabu, Kamis",
      jam: "09.00 WIB - 10.00 WIB",
      metode: "Voice Call, Video Call",
    },
    {
      title: "Jadwal Berdasarkan Hari",
      hari: "Jum’at, Sabtu",
      jam: "13.00 WIB - 14.00 WIB",
      metode: "Voice Call, Tatap Muka",
    },
    {
      title: "Jadwal Berdasarkan Tanggal",
      hari: "1 September 2025",
      jam: "13.00 WIB - 14.00 WIB",
      metode: "Chat",
    },
  ];

  return (
    <MobileLayout>
      <div className="flex flex-col h-full w-full bg-white relative">
        {/* HEADER */}
        <header className="w-full p-5 pt-10 sticky top-0 z-20 bg-[#00D1FF] relative flex items-center justify-center shadow-md">
          {/* Tombol Kembali di Kiri */}
          <button
            className="absolute left-4 text-white"
            onClick={() => navigate(-1)}
            aria-label="Kembali"
          >
            <BackArrowIcon />
          </button>

          {/* Judul di Tengah */}
          <h1 className="font-bold text-white text-lg text-center">
            Jadwal Praktik Saya
          </h1>
        </header>

        {/* ISI */}
        <div className="flex-1 p-5 space-y-4 pb-20">
          {jadwalList.map((jadwal, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col gap-2"
            >
              <div className="flex items-start gap-3">
                <CalendarDays className="text-[#00B2FF] w-6 h-6 mt-1" />
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-800 text-sm">
                    {jadwal.title}
                  </h2>
                  <p className="text-sm text-gray-700">{jadwal.hari}</p>
                  <p className="text-sm text-gray-800 font-medium">
                    {jadwal.jam}
                  </p>
                  <p className="text-sm text-gray-400 italic">{jadwal.metode}</p>
                </div>

                {/* Tombol Aksi (Edit & Delete sejajar) */}
                <div className="flex items-center gap-3 ml-2">
                  <button className="text-[#00B2FF] hover:text-[#0095D9] transition">
                    <Pencil size={18} />
                  </button>
                  <button className="text-red-500 hover:text-red-600 transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FLOATING BUTTON */}
        <button
          className="fixed bottom-8 right-8 bg-[#00B2FF] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:opacity-90 transition"
          onClick={() => alert('Tambah Jadwal')}
        >
          <Plus size={28} />
        </button>
      </div>
    </MobileLayout>
  );
}
