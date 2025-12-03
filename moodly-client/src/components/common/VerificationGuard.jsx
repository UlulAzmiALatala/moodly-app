import React from "react";
import { Lock, Clock, XCircle, ShieldAlert } from "lucide-react";

export default function VerificationGuard({ status, userRole, reason }) {
    // Daftar status yang diizinkan masuk (Aman)
    // Sesuaikan dengan string di database Anda
    const allowedStatuses = ["Terverifikasi", "Active", "Online", "Offline"];

    // Jika status aman, jangan render apa-apa (null)
    if (allowedStatuses.includes(status)) return null;

    // Konten berdasarkan status
    let content = null;

    if (status === "Verifikasi" || status === "Menunggu Verifikasi") {
        content = (
            <div className="text-center p-8 max-w-sm bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Clock size={40} />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
                    Menunggu Verifikasi
                </h2>
                <p className="text-gray-600 leading-relaxed">
                    Halo! Akun Anda sedang ditinjau oleh Admin. Mohon tunggu
                    sebentar, halaman ini akan terbuka otomatis setelah
                    disetujui.
                </p>
                <div className="mt-6 py-2 px-4 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-700 font-medium inline-block">
                    Status: Dalam Peninjauan
                </div>
            </div>
        );
    } else if (status === "Ditolak") {
        content = (
            <div className="text-center p-8 max-w-sm bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-red-100 animate-in slide-in-from-bottom-10 duration-500">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle size={40} />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
                    Verifikasi Ditolak
                </h2>
                <p className="text-gray-600 mb-4">
                    Maaf, pendaftaran Anda belum dapat kami setujui.
                </p>
                {reason && (
                    <div className="bg-red-50 p-4 rounded-xl text-left mb-6 border border-red-100">
                        <p className="text-xs font-bold text-red-500 uppercase mb-1">
                            Alasan:
                        </p>
                        <p className="text-sm text-red-800 italic">
                            "{reason}"
                        </p>
                    </div>
                )}
                <button
                    onClick={() => (window.location.href = "/login")} // Atau logika logout
                    className="w-full py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition"
                >
                    Hubungi Admin / Logout
                </button>
            </div>
        );
    } else if (status === "Banned") {
        content = (
            <div className="text-center p-8 max-w-sm bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200">
                <div className="w-20 h-20 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert size={40} />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
                    Akun Dibekukan
                </h2>
                <p className="text-gray-600">
                    Akun Anda telah dinonaktifkan karena pelanggaran kebijakan.
                </p>
            </div>
        );
    }

    return (
        // Overlay ini menutupi SELURUH layar (z-index sangat tinggi)
        <div className="fixed inset-0 z-[9999] bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4">
            {/* Background animasi agar tidak bosan */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            </div>

            {content}
        </div>
    );
}
