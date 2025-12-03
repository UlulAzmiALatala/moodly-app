import React from "react";
import { User, MessageCircle } from "lucide-react";

export default function EmptyState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC] p-6 text-center h-full">
            <div className="relative mb-6 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                    <MessageCircle className="w-14 h-14 text-[#00D1FF]" />
                </div>
                <div className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full border-4 border-white">
                    <User className="w-4 h-4 text-white" />
                </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Pusat Bantuan Admin
            </h3>
            <p className="text-gray-500 max-w-sm leading-relaxed">
                Silakan pilih percakapan di menu sebelah kiri untuk melihat
                detail pesan dan membalas customer.
            </p>

            <div className="mt-8 flex gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-xs font-medium text-gray-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Sistem Real-time Aktif
                </div>
            </div>
        </div>
    );
}
