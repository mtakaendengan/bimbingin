# Panduan Deployment BimbingIn ke GitHub Pages

## 1. Siapkan Google Spreadsheet

Buat Google Spreadsheet baru dengan nama misalnya:

```text
BimbingIn Database
```

Salin ID spreadsheet dari URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

## 2. Siapkan Google Drive

Buat folder utama di Google Drive:

```text
BimbingIn_ROOT
```

Salin ID folder dari URL:

```text
https://drive.google.com/drive/folders/ROOT_FOLDER_ID
```

Apps Script akan membuat struktur:

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
└── TEMPLATE
    ├── Proposal
    ├── Seminar Hasil
    ├── Skripsi
    ├── Artikel Ilmiah
    └── Administrasi
```

## 3. Buat Project Apps Script

1. Buka `https://script.google.com`.
2. Buat project baru dengan nama `BimbingIn Backend`.
3. Salin isi `apps-script/Code.gs` ke file `Code.gs`.
4. Buka pengaturan project, aktifkan editor manifest.
5. Salin isi `apps-script/appsscript.json` ke manifest.

## 4. Isi Konfigurasi

Pada bagian atas `Code.gs`, ganti:

```javascript
const CONFIG = {
  SPREADSHEET_ID: 'PASTE_SPREADSHEET_ID_HERE',
  ROOT_FOLDER_ID: 'PASTE_ROOT_DRIVE_FOLDER_ID_HERE',
  CALENDAR_ID: 'primary',
  APP_NAME: 'BimbingIn',
  TIMEZONE: 'Asia/Makassar',
  MAX_SUPPORTING_FILE_MB: 100,
  PUBLIC_TEMPLATE_ACCESS: true
};
```

## 5. Jalankan Setup

1. Pilih fungsi `setupBimbingIn`.
2. Klik Run.
3. Berikan izin akses Google Sheets, Drive, dan Calendar.
4. Pastikan semua sheet dibuat otomatis.

Sheet yang dibuat:

```text
Users
Students
Lecturers
LecturerStatus
Files
Submissions
GuidanceRequests
ExamRequests
Messages
Templates
ActivityLog
Settings
```

## 6. Deploy Apps Script sebagai Web App

1. Klik Deploy.
2. Pilih New deployment.
3. Pilih type: Web app.
4. Execute as: Me.
5. Who has access: Anyone.
6. Klik Deploy.
7. Salin Web App URL.

## 7. Hubungkan Frontend ke Apps Script

Buka file:

```text
assets/js/config.js
```

Ganti:

```javascript
API_URL: "PASTE_APPS_SCRIPT_WEB_APP_URL_HERE"
```

menjadi URL Web App Anda.

## 8. Upload ke GitHub Pages

1. Buat repository GitHub baru, misalnya `bimbingin`.
2. Upload semua isi folder `BimbingIn` ke repository.
3. Masuk ke Settings > Pages.
4. Source: Deploy from a branch.
5. Branch: `main` dan folder `/root`.
6. Simpan.
7. Buka URL GitHub Pages yang diberikan.

## 9. Uji Coba

Gunakan akun demo:

```text
Dosen: dosen / dosen123
Mahasiswa: 202201001 / mhs123
```

Uji alur berikut:

1. Buka halaman awal.
2. Lihat ringkasan, progress, jadwal, template.
3. Daftar mahasiswa baru.
4. Login dosen.
5. Verifikasi/tambah mahasiswa.
6. Login mahasiswa.
7. Upload file.
8. Ajukan review.
9. Login dosen dan beri review.
10. Ajukan bimbingan/sidang.

## 10. Catatan Penting

- Jika upload file besar gagal di Apps Script, ukuran request web app mungkin menjadi pembatas. Untuk file sangat besar, solusi produksi yang lebih kuat adalah memakai Google Picker atau direct upload ke Drive API.
- GitHub Pages tidak mendukung PHP server-side.
- Folder `php/` hanya contoh opsional untuk hosting berbeda.
- Jangan menyimpan informasi sensitif di frontend.
