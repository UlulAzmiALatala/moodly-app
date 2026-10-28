<!-- 🎨 HEALTHTECH STARTUP BANNER -->
<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=rounded&color=0:7F52FF,100:00F7FF&height=180&text=Moodly%20Platform&fontSize=50&fontColor=FFFFFF&desc=Mental%20Health%20Care%20and%20Real-Time%20Management&descSize=18" width="100%" alt="Moodly Banner"/>
</div>

<br/>

> **Moodly** adalah platform layanan kesehatan mental digital (*HealthTech*) komprehensif yang dilengkapi dengan **Sistem Manajemen Operasional dan Keuangan Berbasis Real-Time**. Platform ini menghubungkan psikolog dengan klien sekaligus memberikan kendali administratif penuh melalui *dashboard* keuangan yang mutakhir.

<div align="left">
  <img src="https://img.shields.io/badge/Domain-HealthTech_Startup-FF69B4?style=flat-square&logo=health&logoColor=white" alt="HealthTech"/>
  <img src="https://img.shields.io/badge/Status-Thesis_Completed-7F52FF?style=flat-square&logo=git&logoColor=white" alt="Thesis"/>
  <img src="https://img.shields.io/badge/Laravel-FF2D20?style=flat-square&logo=laravel&logoColor=white" alt="Laravel"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Midtrans-005C84?style=flat-square&logo=paypal&logoColor=white" alt="Midtrans"/>
</div>

<!-- 🟣 GLOWING NEON DIVIDER -->
<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/purple.png" width="100%">

## 🧠 Sorotan Modul & Fitur (Core Architecture)

Berbeda dengan aplikasi reservasi biasa, arsitektur Moodly ditopang oleh modul administrator yang mengolah data operasional dan transaksi keuangan secara instan.

<table>
  <tr>
    <td width="50%" valign="top">
      <h4>💬 Konseling Real-Time</h4>
      <p>Integrasi fitur <i>live chat</i> interaktif untuk sesi konsultasi psikologis yang mulus antara klien dan tenaga ahli.</p>
    </td>
    <td width="50%" valign="top">
      <h4>💸 Keuangan & Payment Gateway</h4>
      <p>Otomatisasi pembayaran sesi menggunakan <b>Midtrans (QRIS & Virtual Account)</b> dengan pelacakan <i>webhook</i> dan notifikasi status <i>real-time</i>.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h4>📊 Dashboard Administrator Instan</h4>
      <p>Pemantauan arus kas pendapatan, jadwal sesi aktif, dan metrik operasional klinik tanpa perlu memuat ulang halaman (<i>real-time metrics</i>).</p>
    </td>
    <td width="50%" valign="top">
      <h4>🎨 Calm & Intuitive UI</h4>
      <p>Antarmuka pengguna (UI) dirancang menggunakan <i>Tailwind CSS</i> dengan pendekatan psikologi warna untuk pengalaman yang menenangkan.</p>
    </td>
  </tr>
</table>

<!-- 🟣 GLOWING NEON DIVIDER -->
<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/purple.png" width="100%">

## 🏗️ Topologi Teknologi (Tech Stack)

<div align="center">
  <p align="center">
    <a href="https://skillicons.dev">
      <img src="https://skillicons.dev/icons?i=laravel,php,js,tailwind,html,css,mysql,figma,vscode&perline=10&theme=dark" alt="Moodly Tech Stack Icons" />
    </a>
  </p>
</div>

<br/>

| Kategori | Teknologi Utama | Deskripsi Implementasi |
| :--- | :--- | :--- |
| **Backend & API Server** | `Laravel` `PHP 8+` | Arsitektur MVC, RESTful Routes, & Real-time Event Broadcasting. |
| **Frontend & Styling** | `JavaScript` `Tailwind CSS` | Komponen interaktif dengan Blade Templating. |
| **Database & Storage** | `MySQL / MariaDB` | Relasi entitas multi-role: Admin, Psikolog, Pasien. |
| **Third-Party Integration** | `Midtrans` | Layanan Payment Gateway untuk QRIS & Bank Transfer. |

<!-- 🟣 GLOWING NEON DIVIDER -->
<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/purple.png" width="100%">

## 🚀 Panduan Instalasi (Development Setup)

Sistem ini membutuhkan pengaturan *environment* lokal yang mencakup konfigurasi *database* dan kunci API (*API Keys*) Midtrans.

```bash
# 1. Clone Repositori
git clone [https://github.com/UlulAzmiALatala/moodly-app.git](https://github.com/UlulAzmiALatala/moodly-app.git)
cd moodly-app

# 2. Install dependensi Backend & Frontend
composer install
npm install

# 3. Konfigurasi Environment & Midtrans API
cp .env.example .env
php artisan key:generate
# Buka file .env dan masukkan MIDTRANS_SERVER_KEY & MIDTRANS_CLIENT_KEY Anda

# 4. Setup Database & Jalankan Migrasi
php artisan migrate --seed

# 5. Build Asset & Jalankan Server Lokal
npm run dev
php artisan serve
```

<!-- 🟣 GLOWING NEON DIVIDER -->
<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/purple.png" width="100%">

## 🖼️ Tampilan Platform (Application Preview)

<div align="center">
  <!-- GANTI LINK GAMBAR DI BAWAH INI DENGAN SCREENSHOT ASLI MOODLY KAMU -->
  <img src="https://via.placeholder.com/800x400/0D1117/7F52FF?text=Halaman+Konseling+%26+Booking+(Upload+Screenshot)" alt="Halaman Konseling Moodly" width="80%" />
  <br/>
  <br/>
  <img src="https://via.placeholder.com/800x400/0D1117/00F7FF?text=Dashboard+Keuangan+Real-Time+(Upload+Screenshot)" alt="Dashboard Keuangan Moodly" width="80%" />
</div>

<br/>

> **Catatan Pengembangan:**
> Proyek ini dikembangkan selama masa magang di **PT Seven Inc** (2025-2026) dan berhasil diselesaikan serta dipertahankan sebagai sistem utama dalam tugas akhir/skripsi jurusan Informatika dengan dosen pembimbing Bapak Rikie Kartadie. Hak cipta & Arsitektur Sistem &copy; 2026 **Ulul Azmi A. Latala**.
