/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            // 1. Definisi Gerakan Animasi (Keyframes)
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                scaleIn: {
                    "0%": { transform: "scale(0.95)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
            },
            // 2. Mendaftarkan Nama Class Animasi
            animation: {
                fadeIn: "fadeIn 0.2s ease-out",
                scaleIn: "scaleIn 0.2s ease-out forwards",
            },
            // 3. Menambahkan Warna Brand (Opsional, agar konsisten)
            colors: {
                cyan: {
                    50: "#ecfeff",
                    100: "#cffafe",
                    200: "#a5f3fc",
                    300: "#67e8f9",
                    400: "#22d3ee",
                    500: "#06b6d4", // Brand Primary Moodly
                    600: "#0891b2",
                    700: "#0e7490",
                    800: "#155e75",
                    900: "#164e63",
                },
            },
        },
    },
    plugins: [
        // 4. Plugin Custom untuk menyembunyikan Scrollbar
        // (Agar class 'scrollbar-hide' di pemilihan tanggal berfungsi)
        function ({ addUtilities }) {
            addUtilities({
                ".scrollbar-hide": {
                    /* IE and Edge */
                    "-ms-overflow-style": "none",
                    /* Firefox */
                    "scrollbar-width": "none",
                    /* Safari and Chrome */
                    "&::-webkit-scrollbar": {
                        display: "none",
                    },
                },
            });
        },
    ],
};
