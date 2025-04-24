# Proyek Database BSIP

Sistem informasi untuk mengelola dan menampilkan data iklim dari berbagai stasiun meteorologi. Aplikasi ini mendukung import data dari file Excel, pencarian data, dan visualisasi data iklim.

## Fitur Utama

- Import data iklim dari file Excel
- Pencarian data berdasarkan stasiun dan periode
- Visualisasi data dalam bentuk tabel
- Sistem autentikasi pengguna
- Manajemen data stasiun meteorologi

## Cara Instalasi

1. Clone repository ini
2. Install dependencies:

   ```bash
   # Install backend dependencies
   cd ProjectBSIP/backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Setup MongoDB:
   - Pastikan MongoDB sudah terinstall dan berjalan
   - Buat file `.env` di folder backend dengan isi:
     ```
     MONGO_URI=mongodb://localhost:27017/bsip
     JWT_SECRET=your_secret_key
     ```

## Menjalankan Aplikasi

1. Jalankan backend:

   ```bash
   cd ProjectBSIP/backend
   npm start
   ```

2. Jalankan frontend:

   ```bash
   cd ProjectBSIP/frontend
   npm run dev
   ```

3. Akses aplikasi di browser:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## Panduan Import Data

### Format File Excel

File Excel harus memiliki kolom berikut:

- TANGGAL (format: DD-MM-YYYY)
- TN (Temperatur minimum)
- TX (Temperatur maksimum)
- TAVG (Temperatur rata-rata)
- RH_AVG (Kelembaban relatif rata-rata)
- RR (Curah hujan)
- SS (Lama penyinaran matahari)
- FF_X (Kecepatan angin maksimum)
- DDD_X (Arah angin saat kecepatan maksimum)
- FF_AVG (Kecepatan angin rata-rata)
- DDD_CAR (Arah angin terbanyak)

### Cara Import Data

1. Letakkan file Excel di folder:

   ```
   ProjectBSIP/backend/file/
   ```

2. Ada dua cara import:

   a. Import Data Baru (Menambah):

   ```bash
   cd ProjectBSIP/backend
   node importExcel.js
   ```

   - Menambahkan data baru ke database
   - Data lama tetap ada
   - PENTING: Pindahkan file lama ke folder lain untuk menghindari duplikasi

   b. Reset & Import Ulang:

   ```bash
   cd ProjectBSIP/backend
   node clearAndImport.js
   ```

   - Menghapus SEMUA data lama
   - Mengimpor ulang SEMUA file di folder file
   - Gunakan jika ingin reset database

### Tips Import Data

1. Buat folder backup untuk menyimpan file yang sudah diimpor
2. Selalu periksa format tanggal di Excel (DD-MM-YYYY)
3. Nama file akan digunakan sebagai nama stasiun
4. Monitor terminal saat import untuk melihat progress

## Struktur Proyek

```
ProjectBSIP/
├── backend/
│   ├── controllers/     # Logic aplikasi
│   ├── models/         # Schema database
│   ├── routes/         # API routes
│   ├── file/          # Folder untuk file Excel
│   └── app.js         # Entry point backend
└── frontend/
    ├── src/
    │   ├── components/ # React components
    │   └── App.jsx    # Root component
    └── public/        # Asset statis
```

## Default Login

Username: admin  
Password: admin123

## Bantuan

Jika mengalami masalah:

1. Pastikan MongoDB berjalan
2. Cek format file Excel sesuai ketentuan
3. Periksa log di terminal untuk detail error
4. Pastikan semua dependencies terinstall

## Penggunaan Memori

- Import data dilakukan dalam chunk (100 baris per chunk)
- Hindari import file terlalu besar sekaligus
- Monitor penggunaan memori saat import data banyak
