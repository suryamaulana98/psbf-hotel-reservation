# GrandNusa Hotel Reservation System

Sistem Reservasi Hotel berbasis web (Full-Stack) yang dibangun menggunakan React (Frontend), Node.js & Express (Backend), serta MySQL (Database). Proyek ini dirancang untuk memudahkan proses pemesanan kamar hotel oleh tamu dan mempermudah administrasi hotel dalam mengelola data kamar, pengguna, hingga memantau laporan keuangan.

## 🌟 Fitur Utama

### Pengguna (Guest / User)
- **Autentikasi**: Registrasi dan Login akun.
- **Pencarian Kamar**: Melihat daftar hotel dan tipe kamar yang tersedia.
- **Pemesanan (Booking)**: Memesan kamar pada tanggal tertentu.
- **Validasi Cerdas**: Sistem mencegah pemesanan pada kamar dan tanggal yang sudah dipesan orang lain.
- **Upload Bukti Pembayaran**: Mendukung unggah gambar (QRIS/Transfer) sebagai bukti transaksi.
- **Riwayat Pesanan**: Memantau status pesanan (Pending, Confirmed, Completed, Rejected).

### Administrator (Admin)
- **Manajemen Hotel**: Menambah, mengubah, atau menghapus data properti hotel.
- **Manajemen Kamar**: Menambah, mengubah, atau menghapus tipe kamar beserta harganya.
- **Manajemen Reservasi**: Menerima/Mengkonfirmasi, Menyelesaikan, atau Menolak pesanan tamu.
- **Lihat Bukti Transfer**: Validasi bukti pembayaran tamu secara langsung melalui *Pop-up Modal* gambar.
- **Dasbor Analitik**: Memantau total omzet, pesanan, dan pengguna melalui kartu statistik dan grafik visual interaktif (Area Chart).
- **Laporan Keuangan**: Tabel pelaporan transaksi masuk, dilengkapi dengan filter rentang tanggal.
- **Cetak Laporan**: Ekspor data laporan keuangan langsung ke format `.csv` (Microsoft Excel).

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React.js (Vite), React Router DOM, Axios, Recharts (untuk grafik analitik).
- **Backend**: Node.js, Express.js, Multer (untuk *file upload*), JWT (JSON Web Token), Bcryptjs.
- **Database**: MySQL.

---

## ⚙️ Persyaratan Sistem (Prerequisites)

Sebelum menjalankan aplikasi, pastikan Anda telah menginstal:
1. **Node.js** (Minimal versi 16.x atau lebih baru)
2. **MySQL Server** (Atau bisa menggunakan XAMPP / MAMP)
3. **Git** (Opsional)

---

## 🚀 Cara Menjalankan Proyek (Instalasi)

Proyek ini terbagi menjadi dua bagian: `backend` (Server API) dan `frontend` (Antarmuka Pengguna). Anda harus menjalankan keduanya secara bersamaan di terminal yang berbeda.

### 1. Persiapan Database
1. Buka aplikasi MySQL klien Anda (misalnya: phpMyAdmin melalui XAMPP).
2. Buat sebuah database baru dengan nama `hotel_reservation_db`.
3. Buka tab **SQL** atau menu *Import*.
4. *Import* atau *Copy-Paste* seluruh isi dari berkas `database.sql` yang ada di direktori utama (*root*) proyek ini, lalu jalankan (Execute). Database beserta struktur tabel akan otomatis terbuat.

### 2. Konfigurasi dan Menjalankan Backend
1. Buka terminal/Command Prompt, lalu arahkan (*cd*) ke dalam folder `backend`:
   ```bash
   cd backend
   ```
2. Instal semua dependensi Node.js:
   ```bash
   npm install
   ```
3. *(Opsional)* Jika Anda menggunakan *password* pada root MySQL, silakan buka file `backend/config/db.js` dan sesuaikan kredensialnya.
4. Jalankan server backend:
   ```bash
   node server.js
   ```
   > Server backend akan berjalan secara default di `http://localhost:5000`.

### 3. Konfigurasi dan Menjalankan Frontend
1. Buka terminal *baru*, lalu arahkan (*cd*) ke dalam folder `frontend`:
   ```bash
   cd frontend
   ```
2. Instal semua dependensi Node.js (termasuk Recharts untuk Dasbor):
   ```bash
   npm install
   ```
3. Jalankan server *development* frontend:
   ```bash
   npm run dev
   ```
   > Aplikasi React akan berjalan di alamat `http://localhost:5173`. Silakan klik atau buka alamat tersebut di *browser* Anda.

---

## 🔑 Kredensial Uji Coba

Gunakan akun berikut untuk menguji coba fitur sesuai peran:

**Akun Administrator:**
- **Email:** `admin@gmail.com`
- **Password:** `admin123`

**Akun User Biasa:**
- **Email:** `user@gmail.com`
- **Password:** `user123`

*(Catatan: Anda juga bisa membuat akun user baru melalui menu Register).*

---

## 📂 Struktur Direktori Utama

```text
/
├── backend/                  # Server Express API, Koneksi Database, File Upload (Images)
│   ├── config/               # Pengaturan koneksi MySQL
│   ├── controllers/          # Logika pemrosesan API (Hotel, Kamar, Booking, Auth)
│   ├── middlewares/          # Autentikasi JWT & Verifikasi Admin
│   ├── public/uploads/       # Direktori tempat foto/bukti transfer disimpan
│   ├── routes/               # Definisi Endpoint API (URL)
│   └── server.js             # Entry point backend
│
├── frontend/                 # Aplikasi Web React
│   ├── public/               # Asset statis, gambar, icon
│   └── src/
│       ├── components/       # Komponen pendukung dan Layout (Navbar)
│       ├── context/          # Context API untuk Manajemen State Global (Auth)
│       ├── pages/            # Halaman utama aplikasi (Home, Login, Dashboard, dll)
│       ├── services/         # Konfigurasi Axios untuk memanggil endpoint Backend
│       ├── App.jsx           # Entry point React & Routing
│       └── index.css         # Styling global aplikasi
│
├── database.sql              # Skema awal / Backup tabel Database
└── README.md                 # Dokumentasi Proyek
```

---
*Dibuat untuk keperluan Ujian Akhir Semester (UAS).*
