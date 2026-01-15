<!DOCTYPE html>
<html>
<head>
    <title>Verifikasi Ditolak</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #ef4444;">Status Verifikasi Akun</h2>
        <p>Halo {{ $user->name }},</p>
        <p>Terima kasih telah mendaftar di Moodly. Setelah melakukan peninjauan data, kami mohon maaf karena akun Anda <strong>belum dapat kami setujui</strong> saat ini.</p>
        
        <div style="background-color: #fff1f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <strong>Alasan Penolakan:</strong><br>
            {{ $reason }}
        </div>

        <p>Silakan perbaiki data Anda atau hubungi admin jika Anda merasa ini adalah kesalahan.</p>
        <p>Salam hangat,<br>Tim Moodly</p>
    </div>
</body>
</html>