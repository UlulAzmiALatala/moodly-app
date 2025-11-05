import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function AdminLayout() {
    const { user } = useAuth();

    // Ambil role user dan ubah tampilannya biar rapi
    const roleDisplay = user?.role
        ? "Halaman " +
          user.role.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "Halaman Admin";

    return (
        <div className="flex bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 min-h-screen">
            {/* Sidebar tetap */}
            <Sidebar />

            {/* Konten utama */}
            <div className="flex-1 flex flex-col ml-64 relative overflow-hidden">
                {/* Efek background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.15),_transparent_60%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.15),_transparent_60%)]"></div>

                {/* Header */}
                <motion.header
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="backdrop-blur-md bg-white/70 border-b border-gray-200 shadow-sm p-4 flex justify-between items-center sticky top-0 z-10"
                >
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-wide">
                        {roleDisplay}
                    </h1>

                    {/* Pencarian */}
                    <div className="relative w-72">
                        <input
                            type="text"
                            placeholder="🔍  Cari sesuatu..."
                            className="w-full pl-4 pr-10 py-2 rounded-xl bg-white/50 border border-gray-300 shadow-inner 
                                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition duration-300"
                        />
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
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </motion.header>

                {/* Konten halaman */}
                <motion.main
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex-grow p-8 relative z-10"
                >
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-gray-100">
                        <Outlet />
                    </div>
                </motion.main>
            </div>
        </div>
    );
}
