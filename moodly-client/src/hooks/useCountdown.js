import { useState, useEffect, useMemo } from "react";

// Hook ini akan menghitung mundur ke tanggal & jam target
const useCountdown = (targetDate, targetTime) => {
    // Gabungkan tanggal dan waktu dari backend
    const targetDateTime = useMemo(() => {
        if (!targetDate || !targetTime) return new Date();
        return new Date(`${targetDate}T${targetTime}`);
    }, [targetDate, targetTime]);

    const [now, setNow] = useState(new Date());

    // Hitung sisa waktu
    const timeRemaining = useMemo(
        () => targetDateTime - now,
        [targetDateTime, now]
    );

    // Update 'now' setiap detik
    useEffect(() => {
        if (timeRemaining <= 0) {
            // Jika waktu sudah habis, hentikan interval
            return;
        }

        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000); // 1000ms = 1 detik

        return () => clearInterval(interval); // Cleanup
    }, [timeRemaining]);

    if (timeRemaining <= 0) {
        return { isReady: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
        isReady: false, // Waktu belum tiba
        days: Math.floor(timeRemaining / (1000 * 60 * 60 * 24)),
        hours: Math.floor((timeRemaining / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((timeRemaining / 1000 / 60) % 60),
        seconds: Math.floor((timeRemaining / 1000) % 60),
    };
};

export default useCountdown;
