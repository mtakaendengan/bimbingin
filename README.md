# BimbingIn

**BimbingIn** adalah website pembimbingan skripsi berbasis **GitHub Pages + Google Apps Script** untuk membantu dosen dan mahasiswa mengelola proses bimbingan dari proposal, seminar hasil, skripsi, artikel ilmiah, sampai arsip setelah lulus.

GitHub Pages menjalankan frontend statis, sedangkan Google Apps Script menjadi backend/API untuk Google Sheets, Google Drive, dan Google Calendar.

## Fitur utama

### Halaman awal

- Ringkasan hari ini.
- Update mahasiswa dan progres.
- Jadwal bimbingan dan ujian dari Google Calendar.
- Status ketersediaan dosen.
- Daftar mahasiswa bimbingan baru.
- Template akademik publik tanpa login.
- Tombol login dan daftar mahasiswa baru.

### Mahasiswa

- Daftar sebagai mahasiswa bimbingan baru.
- Login menggunakan username berbasis NIM.
- Melengkapi profil mahasiswa.
- Upload file ke folder Proposal, Seminar Hasil, Skripsi, Artikel Ilmiah, Data Pendukung, dan Data Lainnya.
- Penamaan otomatis file Proposal/Hasil/Skripsi/Artikel.
- Ajukan file terakhir untuk review.
- Menerima hasil review dosen.
- Mengisi catatan perbaikan/klarifikasi.
- Ajukan jadwal bimbingan.
- Ajukan jadwal sidang proposal/hasil/skripsi.
- Menghubungi dosen melalui WhatsApp/email.
- Mengakses akun dalam mode arsip setelah lulus.
- Mengakses **Ruang Sharing Akademik** untuk melihat referensi pekerjaan mahasiswa lain yang sudah disetujui dosen.
- Mengajukan file miliknya sendiri untuk masuk ke Ruang Sharing.

### Dosen/Admin

- Login sebagai dosen/admin.
- Melihat ringkasan mahasiswa, review, jadwal, dan pengajuan.
- Mengatur status bimbingan online/offline.
- Menambah atau memverifikasi mahasiswa.
- Review dokumen mahasiswa.
- Upload file review dosen.
- Proses pengajuan bimbingan dan sidang.
- Upload template akademik publik.
- Kelola **Ruang Sharing Akademik**.
- Menyetujui file mahasiswa untuk disalin ke folder `SHARING`.
- Print report.

## Struktur Google Drive

Saat `setupBimbingIn()` dijalankan, sistem membuat struktur:

```text
BimbingIn_ROOT
├── MAHASISWA
│   └── NIM_NAMA
│       ├── Proposal
│       ├── Seminar Hasil
│       ├── Skripsi
│       ├── Artikel Ilmiah
│       ├── Data Pendukung
│       └── Data Lainnya
├── TEMPLATE
│   ├── Proposal
│   ├── Seminar Hasil
│   ├── Skripsi
│   ├── Artikel Ilmiah
│   └── Administrasi
└── SHARING
    ├── Proposal
    ├── Seminar Hasil
    ├── Skripsi
    ├── Artikel Ilmiah
    ├── Slide Presentasi
    └── Referensi Lainnya
```

Folder mahasiswa bersifat private. File yang masuk Ruang Sharing adalah **salinan** di folder `SHARING`, bukan file asli dari folder mahasiswa.

## Ruang Sharing Akademik

Prinsipnya:

- Semua file mahasiswa private secara default.
- Mahasiswa lain tidak dapat melihat folder asli mahasiswa.
- Mahasiswa dapat browse referensi hanya dari file yang sudah disetujui dosen.
- File yang disetujui disalin ke folder `SHARING`.
- Data yudisium, data pribadi, catatan review dosen, dan data sensitif tidak boleh dishare.
- Identitas pemilik file dapat disamarkan atau ditampilkan sesuai keputusan dosen.

Alur:

```text
Mahasiswa upload file
↓
Mahasiswa ajukan review atau ajukan sharing
↓
Dosen memeriksa file
↓
Dosen setujui sharing
↓
Sistem menyalin file ke folder SHARING
↓
File tampil pada Ruang Sharing Akademik untuk pengguna login
```

## File penting

```text
index.html
assets/css/style.css
assets/js/config.js
assets/js/app.js
apps-script/Code.gs
apps-script/appsscript.json
docs/DEPLOYMENT.md
docs/SHEETS_STRUCTURE.md
sample-data/
php/
```

## Akun demo setelah setup

```text
Dosen
username: dosen
password: dosen123

Mahasiswa
username: 202201001
password: mhs123
```

## Catatan penting

GitHub Pages tidak menjalankan PHP server-side. Folder `php/` hanya contoh opsional untuk hosting yang mendukung PHP seperti WAMP/cPanel. Untuk GitHub Pages gunakan `index.html`, `assets/`, dan backend Google Apps Script.

## Update Profil Terbaru

Versi ini menambahkan alias umum `saveProfile()` pada frontend. Tombol Simpan Profil dapat memanggil satu fungsi yang sama:

- Jika role login adalah `mahasiswa`, `saveProfile()` otomatis meneruskan ke `saveStudentProfile()`.
- Jika role login adalah `dosen`, `saveProfile()` otomatis meneruskan ke `saveLecturerProfile()`.

Backend Apps Script juga mendukung action `saveProfile`, `saveStudentProfile`, dan `saveLecturerProfile`.
