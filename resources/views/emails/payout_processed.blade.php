<!DOCTYPE html>
<html>
<head>
    <title>Payout Berhasil</title>
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f5; padding: 20px;">
    
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px;">
            <h2 style="color: #10b981; margin: 0; font-size: 24px;">Dana Telah Dicairkan! 💸</h2>
            <p style="color: #6b7280; margin-top: 5px;">Pembayaran untuk sesi konseling Anda berhasil diproses.</p>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Nomor Order:</td>
                    <td style="padding: 8px 0; font-weight: bold; text-align: right;">#{{ $booking->id }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Tanggal Sesi:</td>
                    <td style="padding: 8px 0; font-weight: bold; text-align: right;">
                        {{ \Carbon\Carbon::parse($booking->tanggal_konsultasi)->format('d M Y') }}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Nama Customer:</td>
                    <td style="padding: 8px 0; font-weight: bold; text-align: right;">{{ $booking->customer->name }}</td>
                </tr>
                <tr>
                    <td style="padding: 15px 0 0 0; border-top: 1px dashed #d1d5db; font-size: 16px; font-weight: bold; color: #111;">Total Ditransfer:</td>
                    <td style="padding: 15px 0 0 0; border-top: 1px dashed #d1d5db; font-size: 18px; font-weight: bold; color: #10b981; text-align: right;">
                        Rp {{ number_format($booking->total_harga - ($booking->total_harga * 0.1), 0, ',', '.') }}
                        </td>
                </tr>
            </table>
        </div>

        <div style="margin-top: 25px; text-align: center;">
            <p style="margin-bottom: 5px;">Dana akan masuk ke rekening terdaftar Anda dalam waktu <strong>1x24 jam</strong> (tergantung bank).</p>
            <p style="font-size: 13px; color: #9ca3af;">
                Rekening Tujuan: 
                <strong>{{ $booking->konselor->bank_name ?? 'Bank Utama' }} - {{ $booking->konselor->account_number ?? 'xxxx-xxxx' }}</strong>
            </p>
        </div>

        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #eee; padding-top: 20px;">
            <p>&copy; {{ date('Y') }} Moodly. Semua hak dilindungi.</p>
        </div>
    </div>

</body>
</html>