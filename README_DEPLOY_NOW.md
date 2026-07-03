# Deploy BimbingIn ke GitHub Pages

Upload isi folder ini langsung ke root repository GitHub Pages.

Struktur yang benar:

```text
repository-root/
├── index.html
├── assets/
│   ├── css/style.css
│   └── js/
│       ├── app.js
│       └── config.js
├── .nojekyll
├── LOGIN_AWAL.md
└── README_DEPLOY_NOW.md
```

Jangan upload sebagai folder di dalam repository, misalnya `repository-root/BimbingIn/index.html`.

Setelah upload:

1. Commit changes.
2. Tunggu GitHub Pages deploy selesai.
3. Buka situs dengan Incognito atau tekan Ctrl + F5.
4. Buka DevTools Console dan cek:

```javascript
typeof saveProfile
window.BIMBINGIN_BUILD
window.BIMBINGIN_CONFIG
```

Hasil yang benar:

```text
'function'
'20260703-04'
```

Jika `API_URL` masih kosong, website akan memakai demo fallback. Setelah Google Apps Script siap, isi URL di `assets/js/config.js`.
