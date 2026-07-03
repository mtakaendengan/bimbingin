# Panduan Deployment BimbingIn ke GitHub Pages + Google Apps Script

Panduan ini memakai arsitektur:

```text
GitHub Pages = frontend
Google Apps Script = backend/API
Google Sheets = database
Google Drive = file storage
Google Calendar = jadwal bimbingan dan ujian
```

## 1. Siapkan Google Spreadsheet

1. Buka Google Sheets.
2. Buat spreadsheet baru, misalnya `BimbingIn Database`.
3. Salin `SPREADSHEET_ID` dari URL.

Contoh URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

## 2. Siapkan Google Drive Root

1. Buka Google Drive.
2. Buat folder utama, misalnya `BimbingIn_ROOT`.
3. Salin `ROOT_FOLDER_ID` dari URL folder.

Contoh URL:

```text
https://drive.google.com/drive/folders/ROOT_FOLDER_ID
```

## 3. Siapkan Google Calendar

Gunakan calendar utama dengan:

```text
CALENDAR_ID = primary
```

Atau gunakan Calendar khusus dengan mengambil Calendar ID dari Google Calendar Settings.

## 4. Pasang Apps Script

1. Buka `script.google.com`.
2. Buat project baru dengan nama `BimbingIn Backend`.
3. Salin isi file:

```text
apps-script/Code.gs
```

ke file `Code.gs` di Apps Script.

4. Salin isi file:

```text
apps-script/appsscript.json
```

ke manifest Apps Script jika diperlukan.

5. Isi konfigurasi di bagian atas `Code.gs`:

```javascript
const CONFIG = {
  SPREADSHEET_ID: 'ISI_ID_SPREADSHEET',
  ROOT_FOLDER_ID: 'ISI_ID_FOLDER_DRIVE_ROOT',
  CALENDAR_ID: 'primary',
  APP_NAME: 'BimbingIn',
  TIMEZONE: 'Asia/Makassar',
  MAX_SUPPORTING_FILE_MB: 100,
  PUBLIC_TEMPLATE_ACCESS: true
};
```

## 5. Jalankan setup

Di Apps Script, pilih fungsi:

```text
setupBimbingIn
```

Lalu klik **Run**.

Berikan izin akses untuk:

- Google Sheets
- Google Drive
- Google Calendar

Setelah berhasil, Apps Script akan membuat sheet:

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
SharedReferences
ActivityLog
Settings
```

Dan membuat folder Drive:

```text
MAHASISWA
TEMPLATE
SHARING
```

## 6. Deploy Apps Script sebagai Web App

1. Klik **Deploy**.
2. Pilih **New deployment**.
3. Type: **Web app**.
4. Execute as: **Me**.
5. Who has access: **Anyone**.
6. Klik **Deploy**.
7. Salin URL Web App.

## 7. Isi URL API di frontend

Buka file:

```text
assets/js/config.js
```

Isi dengan URL Web App:

```javascript
window.BIMBINGIN_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/XXXX/exec',
  DEMO_MODE_WHEN_API_EMPTY: true
};
```

## 8. Upload ke GitHub Pages

1. Buat repository GitHub baru, misalnya `bimbingin`.
2. Upload isi folder `BimbingIn`, bukan file zip-nya.
3. Buka repository settings.
4. Masuk ke **Pages**.
5. Source: branch `main` dan folder `/root`.
6. Simpan.
7. Buka URL GitHub Pages.

## 9. Tes login

Setelah `setupBimbingIn()`:

```text
Dosen:
username: dosen
password: dosen123

Mahasiswa:
username: 202201001
password: mhs123
```

## 10. Tes Ruang Sharing Akademik

Alur tes:

1. Login sebagai mahasiswa.
2. Upload file ke folder Proposal/Seminar Hasil/Skripsi/Artikel Ilmiah.
3. Klik tombol **Sharing** pada file.
4. Isi judul publik, kategori, topik, tahun, dan mode identitas.
5. Logout.
6. Login sebagai dosen.
7. Lihat bagian **Permintaan Ruang Sharing**.
8. Klik **Setujui Sharing**.
9. Sistem menyalin file ke folder Drive `SHARING`.
10. Login kembali sebagai mahasiswa.
11. Lihat file pada **Ruang Sharing Akademik**.

## 11. Catatan keamanan

- Folder asli mahasiswa tidak dibuka ke mahasiswa lain.
- File sharing adalah salinan.
- Data pribadi/yudisium tidak boleh dibagikan.
- Ruang Sharing hanya untuk user yang login.
- Template dosen tetap dapat diakses dari halaman awal tanpa login.

## Catatan Update Profil

Jika sebelumnya muncul error `saveProfile is not defined`, gunakan versi ini. Fungsi `saveProfile()` sudah disediakan sebagai router umum:

```text
mahasiswa -> saveStudentProfile
Dosen/Admin -> saveLecturerProfile
```

Setelah mengganti file, commit ulang `assets/js/app.js` dan `apps-script/Code.gs`, lalu deploy ulang Apps Script sebagai Web App.
