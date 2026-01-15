<!DOCTYPE html>
<html>
<head>
    <title>Akun Diverifikasi</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #10b981;">Selamat, {{ $user->name }}! 🎉</h2>
        <p>Kami punya kabar baik untuk Anda.</p>
        <p>Akun <strong>Moodly</strong> Anda telah berhasil diverifikasi oleh tim Admin kami. Sekarang Anda sudah dapat mengakses seluruh fitur aplikasi, termasuk melakukan konseling.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}/login" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Masuk ke Aplikasi</a>
        </div>

        <p>Terima kasih telah bergabung bersama kami.</p>
        <p>Salam hangat,<br>Tim Moodly</p>
    </div>
</body>
</html>