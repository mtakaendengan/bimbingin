# Struktur Google Sheets BimbingIn

## Users
Menyimpan akun login mahasiswa dan dosen.

Kolom: `userId, username, passwordHash, role, isAdmin, linkedId, name, email, status, mustChangePassword, createdAt, updatedAt`

## Students
Menyimpan profil akademik mahasiswa, tahap, status, dan folder Drive.

Kolom: `studentId, userId, name, nim, email, whatsapp, program, cohort, currentStage, progress, reviewStatus, studentStatus, thesisTitle, researchTopic, lecturerId, folderName, folderRootId, folderRootUrl, folderProposalId, folderHasilId, folderSkripsiId, folderArtikelId, folderPendukungId, folderLainnyaId, createdAt, updatedAt`

## Lecturers
Menyimpan profil dosen.

## LecturerStatus
Menyimpan status ketersediaan dosen.

## Files
Metadata file Google Drive yang diunggah mahasiswa/dosen.

## Submissions
File yang diajukan untuk review.

## GuidanceRequests
Pengajuan jadwal bimbingan mahasiswa.

## ExamRequests
Pengajuan sidang proposal, seminar hasil, atau skripsi.

## Messages
Pesan internal mahasiswa dan dosen.

## Templates
Template publik yang dapat diakses dari halaman awal.

## ActivityLog
Riwayat aktivitas penting sistem.

## Settings
Konfigurasi internal, seperti ID folder `MAHASISWA` dan `TEMPLATE`.
