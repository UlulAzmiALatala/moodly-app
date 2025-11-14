import React from "react";

// Ini adalah halaman placeholder untuk Super Admin Dashboard
// Anda bisa menggantinya dengan komponen dashboard Anda yang sebenarnya nanti
export default function SuperAdminDashboardPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Selamat Datang, Super Admin!
            </h1>
            <p className="text-gray-700">
                Ini adalah halaman Dashboard Super Admin. Anda bisa mulai
                menambahkan statistik atau data manajemen di sini.
            </p>

            {/* TODO: Tambahkan komponen statistik, grafik, dll. */}
        </div>
    );
}
