import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";

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

export default function GantiJadwalPage() {
  const navigate = useNavigate();
  const [selectedHari, setSelectedHari] = useState(null);
  const scrollRef = useRef(null);

  const currentMonth = new Date().toLocaleString("en-US", {
    month: "short",
  });

  const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  // === LOGIKA DRAG SCROLL ===
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };
  const handleMouseLeave = () => (isDragging.current = false);
  const handleMouseUp = () => (isDragging.current = false);
  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  return (
    <MobileLayout>
      <div className="flex flex-col h-full w-full bg-[#00D1FF] relative">
        {/* HEADER */}
        <header className="w-full pt-10 pb-16 px-4 relative bg-[#00D1FF] z-20">
          <button
            className="absolute left-4 top-10 text-white"
            onClick={() => navigate(-1)}
            aria-label="Kembali"
          >
            <BackArrowIcon />
          </button>
          <h1 className="text-center text-white font-bold text-xl">
            Ganti Jadwal
          </h1>
        </header>

        {/* BAGIAN PUTIH */}
        <div className="flex-1 bg-white rounded-t-[2.5rem] -mt-6 z-30 relative p-6 pt-10 flex flex-col justify-between">
          {/* === KONTEN UTAMA === */}
          <div>
            <h2 className="font-semibold text-gray-800 mb-4">Agustus 2025</h2>

            {/* BAR HARI */}
            <div className="relative mb-6 flex items-center">
              <div
                ref={scrollRef}
                className="flex items-center space-x-3 overflow-hidden pr-20 cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
              >
                {hariList.map((hari) => (
                  <button
                    key={hari}
                    onClick={() => setSelectedHari(hari)}
                    className={`min-w-[70px] h-[70px] rounded-xl border flex flex-col items-center justify-center text-sm font-semibold transition duration-200 ${
                      selectedHari === hari
                        ? "bg-[#00D1FF] text-white border-[#00B2FF]"
                        : "bg-[#E5F8FF] text-[#00B2FF] border-[#B8EAFF]"
                    }`}
                  >
                    {hari}
                  </button>
                ))}
              </div>

              {/* Tombol Kalender */}
              <div className="absolute right-0 top-0">
                <button
                  onClick={() => setSelectedHari("Kalender")}
                  className={`w-[70px] h-[70px] rounded-xl flex flex-col items-center justify-center border transition duration-200 ${
                    selectedHari === "Kalender"
                      ? "bg-[#00D1FF] text-white border-[#00B2FF]"
                      : "bg-[#E5F8FF] text-[#00B2FF] border-[#B8EAFF]"
                  }`}
                >
                  <span className="text-sm font-semibold leading-tight">
                    {currentMonth}
                  </span>
                  <CalendarDays className="w-5 h-5 mt-1" />
                </button>
              </div>
            </div>

            {/* JAM MULAI & SELESAI */}
            <div className="grid grid-cols-2 gap-4 mb-10 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Jam Mulai
                </label>
                <select className="w-full border border-black rounded-md p-2 text-gray-700 font-medium focus:outline-none">
                  <option>09.00 WIB</option>
                  <option>10.00 WIB</option>
                  <option>11.00 WIB</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Jam Selesai
                </label>
                <select className="w-full border border-black rounded-md p-2 text-gray-700 font-medium focus:outline-none">
                  <option>10.00 WIB</option>
                  <option>11.00 WIB</option>
                  <option>12.00 WIB</option>
                </select>
              </div>
            </div>
          </div>

          {/* === TOMBOL FIXED DI BAWAH === */}
          <div className="w-full pb-4">
            <button className="w-full bg-[#00B2FF] text-white font-semibold py-3 rounded-lg hover:opacity-90 transition">
              Ganti Jadwal
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
