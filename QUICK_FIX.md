# Quick Fix BimbingIn

Perbaikan ini mengatasi error `saveProfile is not defined` dan cache app.js lama.

## Cara pakai
1. Upload/replace `assets/js/app.js` di repo GitHub dengan file versi ini.
2. Upload/replace `index.html` versi ini. File ini sudah memakai `assets/js/app.js?v=20260703-02` agar browser tidak memakai cache lama.
3. Pastikan `assets/js/config.js` berisi URL Apps Script yang benar, atau kosongkan API_URL untuk demo mode.
4. Commit changes.
5. Tunggu GitHub Pages selesai deploy.
6. Buka halaman dengan Ctrl+F5 atau Incognito.

## Cek cepat
Buka DevTools Console lalu ketik:

```js
typeof saveProfile
```

Hasil yang benar: `function`.
