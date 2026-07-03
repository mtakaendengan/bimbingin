# BimbingIn

**BimbingIn** adalah website pembimbingan skripsi berbasis GitHub Pages dan Google Apps Script untuk proses Proposal, Seminar Hasil, Skripsi, Artikel Ilmiah, dan data pendukung mahasiswa.

## Arsitektur

GitHub Pages tidak menjalankan PHP server-side. Karena itu, BimbingIn menggunakan arsitektur berikut:

```text
GitHub Pages          : HTML, CSS, JavaScript
Google Apps Script   : Backend/API
Google Sheets        : Database
Google Drive         : Penyimpanan file dan template
Google Calendar      : Jadwal bimbingan dan sidang
```

Folder `php/` hanya adapter opsional untuk WAMP/cPanel, bukan untuk GitHub Pages.

## Fitur Halaman Awal

- Ringkasan hari ini.
- Data update mahasiswa dan progress.
- Jadwal ujian dan bimbingan dari Google Calendar.
- Status dosen: Available Online, Offline, Online & Offline, By Appointment, Tidak Tersedia.
- Daftar mahasiswa bimbingan baru.
- Template Proposal, Seminar Hasil, Skripsi, Artikel Ilmiah, dan Administrasi yang bisa diakses tanpa login.
- Tombol Login dan Daftar Mahasiswa Baru.

## Fitur Mahasiswa

- Daftar sebagai mahasiswa bimbingan baru.
- Username menggunakan NIM.
- Setelah diverifikasi dosen, sistem membuat folder Drive utama dengan format:

```text
NIM_NAMA
```

Contoh:

```text
202201001_ANDI_SETIAWAN
```

- Subfolder otomatis:

```text
Proposal
Seminar Hasil
Skripsi
Artikel Ilmiah
Data Pendukung
Data Lainnya
```

- Upload file sesuai folder.
- Penamaan otomatis:

```text
Proposal_NIM_yyMMdd-HHmmss.ext
Hasil_NIM_yyMMdd-HHmmss.ext
Skripsi_NIM_yyMMdd-HHmmss.ext
Artikel_NIM_yyMMdd-HHmmss.ext
DataPendukung_NIM_yyMMdd-HHmmss.ext
DataLainnya_NIM_yyMMdd-HHmmss.ext
```

- Folder Proposal, Seminar Hasil, Skripsi, dan Artikel Ilmiah hanya menerima `.doc`, `.docx`, `.ppt`, `.pptx`, `.pdf`.
- Folder Data Pendukung dan Data Lainnya menerima file pendukung sampai 100 MB per file.
- Mahasiswa dapat melihat, menambahkan, dan menghapus file sendiri selama belum dikunci/diajukan review.
- Mahasiswa dapat memilih file terakhir untuk diajukan review.
- Mahasiswa menerima hasil review dan dapat memberi catatan perbaikan/klarifikasi.
- Mahasiswa dapat mengajukan review artikel ilmiah.
- Mahasiswa dapat mengajukan jadwal bimbingan.
- Mahasiswa dapat mengajukan jadwal sidang Proposal, Seminar Hasil, atau Skripsi.
- Mahasiswa dapat menghubungi dosen melalui pesan internal, WhatsApp, dan email.
- Mahasiswa lulus tetap dapat login sebagai arsip.

## Fitur Dosen/Admin

- Dashboard ringkasan mahasiswa, review, dan jadwal.
- Profil dosen dan status ketersediaan bimbingan.
- Verifikasi mahasiswa baru.
- Tambah mahasiswa manual.
- Manajemen mahasiswa bimbingan.
- Review dokumen Proposal, Seminar Hasil, Skripsi, dan Artikel Ilmiah.
- Upload file hasil review dosen.
- Approval/revisi/tolak/final dokumen.
- Proses pengajuan bimbingan dan sidang.
- Pembuatan event Google Calendar setelah disetujui.
- Upload template akademik publik.
- Print report.

## Struktur Project

```text
BimbingIn/
├── index.html
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── config.js
│       └── app.js
├── apps-script/
│   ├── Code.gs
│   └── appsscript.json
├── docs/
│   ├── DEPLOYMENT.md
│   └── SHEETS_STRUCTURE.md
├── sample-data/
│   ├── Users.csv
│   ├── Students.csv
│   ├── Lecturers.csv
│   └── Templates.csv
└── php/
    ├── index.php
    ├── api.php
    └── config/users.php
```

## Cara Cepat

1. Buat Google Spreadsheet baru.
2. Buat folder Google Drive utama, misalnya `BimbingIn_ROOT`.
3. Buka Apps Script.
4. Salin isi `apps-script/Code.gs`.
5. Salin manifest dari `apps-script/appsscript.json`.
6. Isi konfigurasi:

```javascript
SPREADSHEET_ID: 'ID_SPREADSHEET_ANDA'
ROOT_FOLDER_ID: 'ID_FOLDER_DRIVE_ANDA'
CALENDAR_ID: 'primary'
```

7. Jalankan fungsi:

```text
setupBimbingIn
```

8. Deploy sebagai Web App.
9. Salin URL Web App ke:

```text
assets/js/config.js
```

10. Upload isi folder BimbingIn ke repository GitHub Pages.

## Akun Demo Setelah Setup

```text
Dosen
Username: dosen
Password: dosen123

Mahasiswa
Username: 202201001
Password: mhs123
```

## Catatan Keamanan

- Password disimpan dalam bentuk SHA-256 hash di Google Sheets.
- Untuk produksi skala besar, disarankan memakai Google OAuth.
- Jangan menampilkan link Drive mahasiswa di halaman publik.
- Template publik hanya berasal dari sheet `Templates` dengan status `Aktif`.
- File yang sudah diajukan review atau disetujui akan dikunci agar tidak dihapus mahasiswa.
