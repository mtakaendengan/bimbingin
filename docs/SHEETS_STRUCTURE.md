# Struktur Google Sheets BimbingIn

Apps Script akan membuat sheet berikut melalui fungsi `setupBimbingIn()`.

## Users

Menyimpan akun login dosen dan mahasiswa.

```text
userId, username, passwordHash, role, isAdmin, linkedId, name, email, status, mustChangePassword, createdAt, updatedAt
```

## Students

Menyimpan profil mahasiswa dan folder Drive mahasiswa.

```text
studentId, userId, name, nim, email, whatsapp, program, cohort, currentStage, progress, reviewStatus, studentStatus, thesisTitle, researchTopic, lecturerId, folderName, folderRootId, folderRootUrl, folderProposalId, folderHasilId, folderSkripsiId, folderArtikelId, folderPendukungId, folderLainnyaId, createdAt, updatedAt
```

## Lecturers

Profil dosen.

```text
lecturerId, userId, name, nidn, email, whatsapp, program, department, expertise, guidanceTopics, officeRoom, consultationHours, onlineLink, note, createdAt, updatedAt
```

## LecturerStatus

Status bimbingan dosen.

```text
lecturerId, name, availabilityStatus, consultationHours, offlineLocation, onlineLink, note, validUntil, updatedAt
```

## Files

Metadata file mahasiswa. Kolom sharing ditambahkan untuk Ruang Sharing Akademik.

```text
fileId, studentId, folderType, driveFileId, fileName, fileUrl, mimeType, sizeBytes, status, locked, note, uploadedBy, uploadedAt, updatedAt, visibility, sharingStatus, sharedReferenceId, canBeShared, shareTitle, shareCategory, shareTopic, shareYear, shareDescription, ownerDisplayMode, approvedForSharingBy, approvedForSharingAt
```

## Submissions

File yang diajukan untuk review dosen.

```text
submissionId, studentId, folderType, fileId, driveFileId, fileName, fileUrl, version, status, studentNote, lecturerReview, reviewFileId, reviewFileUrl, reviewedBy, submittedAt, reviewedAt, updatedAt
```

## GuidanceRequests

Pengajuan bimbingan.

```text
requestId, studentId, lecturerId, mode, topic, preferredStart, preferredEnd, relatedFileId, status, calendarEventId, lecturerNote, createdAt, updatedAt
```

## ExamRequests

Pengajuan sidang proposal, seminar hasil, dan skripsi.

```text
examRequestId, studentId, lecturerId, examType, preferredDateTime, finalSubmissionId, checklistStatus, status, lecturerNote, calendarEventId, createdAt, updatedAt
```

## Messages

Pesan internal mahasiswa dan dosen.

```text
messageId, senderId, receiverId, studentId, subject, message, status, createdAt, updatedAt
```

## Templates

Template akademik publik dari dosen.

```text
templateId, category, title, description, driveFileId, fileName, fileUrl, version, status, uploadedBy, uploadedAt, updatedAt
```

## SharedReferences

Katalog Ruang Sharing Akademik. File yang tampil di sini adalah salinan dari file mahasiswa yang sudah disetujui dosen.

```text
sharedId, originalFileId, sharedFileId, studentId, ownerDisplayMode, ownerDisplayName, title, category, topic, year, description, fileType, fileUrl, visibility, status, approvedBy, approvedAt, createdAt, updatedAt
```

Status yang digunakan:

```text
Shared, Archived
```

Visibility yang disarankan:

```text
LoginOnly
```

## ActivityLog

Riwayat aktivitas sistem.

```text
logId, actorId, role, action, targetType, targetId, description, createdAt
```

## Settings

Konfigurasi internal seperti folder root.

```text
key, value, updatedAt
```
