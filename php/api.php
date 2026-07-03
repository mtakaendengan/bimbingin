<?php
// Adapter PHP opsional untuk hosting yang mendukung PHP.
// Pada GitHub Pages, backend utama adalah Google Apps Script.
header('Content-Type: application/json');
echo json_encode([
  'ok' => false,
  'message' => 'Gunakan Google Apps Script Web App sebagai backend BimbingIn. File ini hanya placeholder opsional.'
]);
