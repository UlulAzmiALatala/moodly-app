import React from "react";

// Komponen Ikon Peringatan (dibuat dengan SVG agar presisi)
const WarningIcon = () => {
    const shadowStyle = {
        filter: "drop-shadow(0 4px 10px rgba(249, 115, 22, 0.3))",
    };

    return (
        <svg
            width="80"
            height="80"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            style={shadowStyle} // Terapkan bayangan oranye di sini
        >
            {/* Lingkaran border oranye luar */}
            <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#F97316"
                strokeWidth="6"
                fill="none"
            />
            {/* Lingkaran kuning di dalam */}
            <circle cx="50" cy="50" r="38" fill="#FDE047" />
            {/* Segitiga hitam/abu tua */}
            <polygon points="50,28 78,72 22,72" fill="#1F2937" />
            {/* Tanda seru (dibuat dengan warna kuning agar terlihat "bolong") */}
            <rect x="47" y="42" width="6" height="16" rx="3" fill="#FDE047" />
            <circle cx="50" cy="65" r="3" fill="#FDE047" />
        </svg>
    );
};

const NotificationSchedule = () => {
    // Styles object untuk kebersihan kode
    const styles = {
        // Container ini HANYA untuk konten, BUKAN untuk layout halaman
        container: {
            fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            backgroundColor: "#FFFFFF",
            minHeight: "calc(100vh - 60px)",
            padding: "16px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
        },

        // --- (Style header sudah dihapus, ini benar) ---

        greetingContainer: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #E5E7EB",
            paddingBottom: "12px",
            marginBottom: "32px",
        },
        greeting: {
            fontSize: "16px",
            fontWeight: "500",
        },
        date: {
            fontSize: "14px",
            color: "#6B7280",
        },

        // --- INI PERUBAHANNYA ---
        warningIconContainer: {
            // textAlign: "center", // Hapus ini
            display: "flex", // Tambah ini
            justifyContent: "center", // Tambah ini

            marginBottom: "24px",
            paddingTop: "16px",
        },
        // --- AKHIR PERUBAHAN ---

        mainHeading: {
            textAlign: "center", // Ini sudah benar
            fontSize: "22px",
            fontWeight: "bold",
            marginBottom: "12px",
        },
        subHeading: {
            textAlign: "center", // Ini sudah benar
            fontSize: "15px",
            color: "#4B5563",
            lineHeight: "1.5",
            marginBottom: "24px",
            maxWidth: "300px",
            margin: "0 auto 24px auto",
        },
        scheduleBox: {
            backgroundColor: "#FFFBEB",
            border: "1.5px solid #FDBA74",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px",
        },
        boxTitle: {
            fontSize: "17px",
            fontWeight: "bold",
            marginBottom: "4px",
        },
        boxSubtitle: {
            fontSize: "14px",
            color: "#6B7280",
            borderBottom: "1px solid #FDE68A",
            paddingBottom: "12px",
            marginBottom: "16px",
        },
        scheduleDetails: {
            display: "grid",
            gridTemplateColumns: "max-content 1fr",
            gap: "10px 16px",
            alignItems: "center",
        },
        label: {
            fontSize: "15px",
            color: "#4B5563",
        },
        value: {
            fontSize: "15px",
            fontWeight: "500",
            color: "#1F2937",
        },
        finalInstruction: {
            textAlign: "center",
            fontSize: "14px",
            color: "#4B5563",
            lineHeight: "1.6",
            marginBottom: "32px",
        },
        buttonContainer: {
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "auto", // Mendorong tombol ke bawah
        },
        baseButton: {
            padding: "16px",
            borderRadius: "12px",
            border: "none",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            width: "100%",
        },
        confirmButton: {
            backgroundColor: "#F97316",
        },
        declineButton: {
            backgroundColor: "#EF4444",
        },
    };

    return (
        <div style={styles.container}>
            {/* --- Greeting (Konten pertama di bawah header biru) --- */}
            <div style={styles.greetingContainer}>
                <span style={styles.greeting}>Hi Indira!</span>
                <span style={styles.date}>Dec 12, 2025</span>
            </div>

            {/* --- Warning Content (Sekarang pakai SVG) --- */}
            <div style={styles.warningIconContainer}>
                <WarningIcon />
            </div>

            <h2 style={styles.mainHeading}>Peringatan Penting!</h2>
            <p style={styles.subHeading}>
                Sesimu akan di ganti jadwal oleh psikolog segera konfirmasi
                sekarang
            </p>

            {/* --- Schedule Box --- */}
            <div style={styles.scheduleBox}>
                <h3 style={styles.boxTitle}>Perubahan Jadwal</h3>
                <p style={styles.boxSubtitle}>
                    Jadwal konseling Anda telah dibuah oleh psikolog
                </p>
                <div style={styles.scheduleDetails}>
                    <span style={styles.label}>Jadwal lama :</span>
                    <span style={styles.value}>Senin, 14:00 - 15:00</span>

                    <span style={styles.label}>Jadwal Baru :</span>
                    <span style={{ ...styles.value, fontWeight: "bold" }}>
                        Selasa, 10:00 - 11:00
                    </span>
                </div>
            </div>

            {/* --- Final Instruction --- */}
            <p style={styles.finalInstruction}>
                Mohon segera konfirmasi ketersediaan Anda untuk jadwal yang baru
                agar sesi konseling dapat berjalan dengan lancar.
            </p>

            {/* --- Action Buttons --- */}
            <div style={styles.buttonContainer}>
                <button
                    style={{ ...styles.baseButton, ...styles.confirmButton }}
                    onClick={() => alert("Konfirmasi diklik!")}
                >
                    Konfirmasi Sekarang
                </button>
                <button
                    style={{ ...styles.baseButton, ...styles.declineButton }}
                    onClick={() => alert("Tolak diklik!")}
                >
                    Tolak
                </button>
            </div>
        </div>
    );
};

export default NotificationSchedule;
