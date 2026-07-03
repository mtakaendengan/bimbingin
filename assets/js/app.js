/* BimbingIn Frontend App
 * GitHub Pages frontend + Google Apps Script backend.
 * Versi ini memperbaiki error: saveProfile is not defined.
 */
(function () {
  'use strict';

  const CFG = window.BIMBINGIN_CONFIG || {};
  const API_URL = CFG.API_URL || '';
  let session = readJSON('bimbingin_session', null);
  let cache = { publicData: null, dashboard: null };

  const $ = (id) => document.getElementById(id);
  const exists = (id) => Boolean($(id));

  function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; }
    catch (_) { return fallback; }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function esc(value = '') {
    return String(value).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function toast(message) {
    const body = $('toastBody');
    const el = $('appToast');
    if (body) body.textContent = message;
    if (el && window.bootstrap) bootstrap.Toast.getOrCreateInstance(el).show();
    else alert(message);
  }

  function badge(status = '') {
    const s = String(status || '-');
    let c = 'status-muted';
    if (/menunggu|diajukan|pending/i.test(s)) c = 'status-wait';
    if (/setuju|final|aktif|lulus|selesai|layak|shared/i.test(s)) c = 'status-ok';
    if (/revisi|tolak|tidak|reject/i.test(s)) c = 'status-rev';
    if (/jadwal|review|online|offline|proposal|hasil|skripsi/i.test(s)) c = 'status-info';
    return `<span class="status-pill ${c}">${esc(s)}</span>`;
  }

  function fmtDate(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return esc(value);
    return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  }

  function maskNim(nim = '') {
    const s = String(nim || '');
    return s.length > 4 ? `${s.slice(0, 4)}****${s.slice(-2)}` : s;
  }

  function normalizeWa(value = '') {
    let n = String(value || '').replace(/[^0-9]/g, '');
    if (n.startsWith('0')) n = `62${n.slice(1)}`;
    return n;
  }

  function closeModal(id) {
    const el = $(id);
    if (el && window.bootstrap) bootstrap.Modal.getInstance(el)?.hide();
  }

  async function api(action, payload = {}) {
    if (!API_URL || API_URL.includes('PASTE_')) {
      if (CFG.DEMO_MODE_WHEN_API_EMPTY !== false) return demoApi(action, payload);
      throw new Error('API_URL belum diisi pada assets/js/config.js');
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify({ action, token: session?.token, ...payload })
    });

    let json;
    try { json = await response.json(); }
    catch (_) { throw new Error('Respons API tidak valid. Periksa deployment Apps Script.'); }

    if (!json.ok) throw new Error(json.message || 'Terjadi kesalahan API');
    return json;
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.size) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        data: String(reader.result).split(',')[1]
      });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function demoData() {
    const now = new Date();
    return {
      lecturer: {
        lecturerId: 'L001', userId: 'U_DOSEN',
        name: 'Dr. Mahardika Inra Takaendengan',
        email: 'mahardika@unsrat.ac.id', whatsapp: '081244000000',
        availabilityStatus: 'Available Online & Offline',
        consultationHours: 'Senin-Jumat 10.00-14.00',
        offlineLocation: 'Ruang Dosen', onlineLink: 'https://meet.google.com/xxx-yyyy-zzz',
        note: 'Prioritas untuk mahasiswa yang mengajukan review final.',
        program: 'S1 Sistem Informasi', department: 'FMIPA/Program Studi',
        expertise: 'Sistem Informasi, Rekayasa Perangkat Lunak, Data Analytics',
        guidanceTopics: 'Aplikasi web, sistem informasi, data analytics'
      },
      students: [
        { studentId: 'S001', userId: 'U_MHS1', name: 'Andi Setiawan', nim: '202201001', email: 'andi@mail.test', whatsapp: '081234567890', program: 'S1 Sistem Informasi', cohort: '2022', currentStage: 'Proposal', progress: 35, reviewStatus: 'Menunggu Review', studentStatus: 'Aktif Bimbingan', thesisTitle: 'Sistem Informasi Monitoring Skripsi', researchTopic: 'Sistem Informasi', folderUrl: '#', folderRootUrl: '#', updatedAt: now.toISOString() },
        { studentId: 'S002', userId: 'U_MHS2', name: 'Maria Lestari', nim: '202201002', email: 'maria@mail.test', whatsapp: '081234567891', program: 'S1 Sistem Informasi', cohort: '2022', currentStage: 'Seminar Hasil', progress: 70, reviewStatus: 'Revisi Minor', studentStatus: 'Aktif Bimbingan', thesisTitle: 'Dashboard Tracer Study', researchTopic: 'Data Visualization', folderUrl: '#', folderRootUrl: '#', updatedAt: now.toISOString() },
        { studentId: 'S003', userId: 'U_MHS3', name: 'Riko Pratama', nim: '202201003', email: 'riko@mail.test', whatsapp: '081234567892', program: 'S1 Sistem Informasi', cohort: '2022', currentStage: 'Skripsi', progress: 90, reviewStatus: 'Disetujui', studentStatus: 'Siap Sidang', thesisTitle: 'Analisis Sentimen Layanan Akademik', researchTopic: 'Text Mining', folderUrl: '#', folderRootUrl: '#', updatedAt: now.toISOString() }
      ],
      events: [
        { title: '[BIMBINGAN-ONLINE] Maria - Revisi Artikel', startTime: now.toISOString(), endTime: new Date(now.getTime() + 3600000).toISOString(), mode: 'Online', location: 'Google Meet' },
        { title: '[UJIAN-SKRIPSI] Riko Pratama', startTime: new Date(now.getTime() + 86400000).toISOString(), endTime: new Date(now.getTime() + 90000000).toISOString(), mode: 'Offline', location: 'Ruang Sidang' }
      ],
      templates: [
        { templateId: 'T1', category: 'Proposal', title: 'Template Proposal Skripsi 2026', description: 'Format proposal resmi', version: 'v1.0', fileUrl: '#' },
        { templateId: 'T2', category: 'Skripsi', title: 'Template Skripsi Final', description: 'Format naskah akhir', version: 'v1.0', fileUrl: '#' }
      ],
      files: [
        { fileId: 'F1', studentId: 'S001', folderType: 'Proposal', fileName: 'Proposal_202201001_260703-120000.docx', fileUrl: '#', status: 'Diajukan Review', sharingStatus: 'NotRequested', uploadedAt: now.toISOString() },
        { fileId: 'F2', studentId: 'S001', folderType: 'Skripsi', fileName: 'Skripsi_202201001_260703-130000.pdf', fileUrl: '#', status: 'Final', sharingStatus: 'Pending', shareTitle: 'Contoh Skripsi Sistem Informasi Monitoring', shareCategory: 'Skripsi', shareTopic: 'Sistem Informasi', shareYear: '2026', uploadedAt: now.toISOString() }
      ],
      submissions: [
        { submissionId: 'SUB1', studentId: 'S001', studentName: 'Andi Setiawan', nim: '202201001', folderType: 'Proposal', fileName: 'Proposal_202201001_260703-120000.docx', fileUrl: '#', status: 'Menunggu Review', studentNote: 'BAB 1 sudah diperbaiki.', submittedAt: now.toISOString() }
      ],
      guidanceRequests: [],
      examRequests: [],
      sharedReferences: [
        { sharedId: 'SH1', title: 'Contoh Proposal Sistem Informasi Berbasis Web', category: 'Proposal', topic: 'Sistem Informasi', year: '2026', ownerDisplayName: 'Mahasiswa Sistem Informasi Angkatan 2022', description: 'Contoh struktur proposal yang sudah disetujui.', fileType: 'PDF', fileUrl: '#', status: 'Shared' },
        { sharedId: 'SH2', title: 'Draft Artikel Ilmiah Terstruktur', category: 'Artikel Ilmiah', topic: 'Academic Writing', year: '2025', ownerDisplayName: 'Mahasiswa Alumni Bimbingan', description: 'Contoh artikel untuk referensi struktur IMRaD.', fileType: 'DOCX', fileUrl: '#', status: 'Shared' }
      ]
    };
  }

  function demoApi(action, payload) {
    const demo = demoData();

    if (action === 'getPublicData') {
      return Promise.resolve({
        ok: true,
        ...demo,
        summary: { activeStudents: 3, pendingReviews: 1, todayGuidance: 1, examEvents: 1 },
        newStudents: demo.students.slice(0, 2)
      });
    }

    if (action === 'login') {
      if (payload.username === 'dosen' && payload.password === 'dosen123') {
        return Promise.resolve({ ok: true, token: 'demo-dosen', user: { userId: 'U_DOSEN', role: 'dosen', isAdmin: true, linkedId: 'L001', name: demo.lecturer.name, email: demo.lecturer.email } });
      }
      if (payload.username === '202201001' && payload.password === 'mhs123') {
        return Promise.resolve({ ok: true, token: 'demo-mhs', user: { userId: 'U_MHS1', role: 'mahasiswa', isAdmin: false, linkedId: 'S001', name: 'Andi Setiawan', email: 'andi@mail.test' } });
      }
      return Promise.resolve({ ok: false, message: 'Akun demo tidak cocok' });
    }

    if (action === 'getDashboard') {
      const localProfile = readJSON(`bimbingin_profile_${session?.user?.userId || 'demo'}`, null);
      if (session?.user?.role === 'dosen') {
        const lecturer = { ...demo.lecturer, ...(localProfile || {}) };
        return Promise.resolve({ ok: true, user: session.user, lecturer, students: demo.students, files: demo.files, submissions: demo.submissions, guidanceRequests: [], examRequests: [], sharedReferences: demo.sharedReferences, shareRequests: demo.files.filter((f) => f.sharingStatus === 'Pending') });
      }
      const student = { ...demo.students[0], ...(localProfile || {}) };
      return Promise.resolve({ ok: true, user: session.user, student, lecturer: demo.lecturer, files: demo.files, submissions: demo.submissions, guidanceRequests: [], examRequests: [], sharedReferences: demo.sharedReferences });
    }

    if (action === 'saveProfile') {
      writeJSON(`bimbingin_profile_${session?.user?.userId || 'demo'}`, payload.profile || {});
      return Promise.resolve({ ok: true, message: 'Demo mode: profil tersimpan di browser.' });
    }

    return Promise.resolve({ ok: true, message: 'Demo mode: aksi disimulasikan.' });
  }

  async function loadPublic() {
    try {
      const data = await api('getPublicData');
      cache.publicData = data;
      renderPublic(data);
    } catch (err) {
      toast(err.message);
    }
  }

  function renderPublic(data) {
    if (exists('statActiveStudents')) $('statActiveStudents').textContent = data.summary?.activeStudents ?? 0;
    if (exists('statPendingReviews')) $('statPendingReviews').textContent = data.summary?.pendingReviews ?? 0;
    if (exists('statTodayGuidance')) $('statTodayGuidance').textContent = data.summary?.todayGuidance ?? 0;
    if (exists('statExamEvents')) $('statExamEvents').textContent = data.summary?.examEvents ?? 0;

    if (exists('lecturerAvailability')) $('lecturerAvailability').textContent = `${data.lecturer?.name || '-'} - ${data.lecturer?.availabilityStatus || '-'}`;
    if (exists('lecturerAvailabilityNote')) $('lecturerAvailabilityNote').textContent = [data.lecturer?.consultationHours, data.lecturer?.note].filter(Boolean).join(' • ');

    renderProgress();

    if (exists('calendarCards')) {
      const events = data.events || [];
      $('calendarCards').innerHTML = events.map((e) => `
        <div class="col-md-6 col-xl-4"><div class="card shadow-sm h-100"><div class="card-body">
          <div class="small text-muted">${esc(e.mode || 'Calendar')}</div>
          <h6 class="fw-bold">${esc(e.title)}</h6>
          <div>${fmtDate(e.startTime)}</div>
          <div class="small-muted">${esc(e.location || '')}</div>
        </div></div></div>
      `).join('') || '<div class="col-12 text-muted">Belum ada jadwal.</div>';
    }

    if (exists('templateCards')) {
      const templates = data.templates || [];
      $('templateCards').innerHTML = templates.map((t) => `
        <div class="col-md-6 col-xl-3"><div class="card template-card h-100"><div class="card-body">
          <span class="badge badge-soft mb-2">${esc(t.category)}</span>
          <h6 class="fw-bold">${esc(t.title)}</h6>
          <p class="small-muted">${esc(t.description || '')}</p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="small-muted">${esc(t.version || '')}</span>
            <a class="btn btn-sm btn-primary" href="${esc(t.fileUrl || '#')}" target="_blank" rel="noopener">Download</a>
          </div>
        </div></div></div>
      `).join('') || '<div class="col-12 text-muted">Belum ada template aktif.</div>';
    }

    if (exists('newStudentCards')) {
      const newStudents = data.newStudents || [];
      $('newStudentCards').innerHTML = newStudents.map((s) => `
        <div class="col-md-6 col-xl-3"><div class="card h-100"><div class="card-body">
          <h6>${esc(s.name)}</h6>
          <div class="small-muted">${esc(maskNim(s.nim))} • ${esc(s.currentStage || 'Proposal')}</div>
          ${badge(s.studentStatus || 'Menunggu Verifikasi')}
        </div></div></div>
      `).join('') || '<div class="col-12 text-muted">Belum ada mahasiswa baru.</div>';
    }
  }

  function renderProgress() {
    if (!exists('publicProgressBody')) return;
    const q = ($('publicSearch')?.value || '').toLowerCase();
    const stage = $('publicStageFilter')?.value || '';
    const rows = (cache.publicData?.students || []).filter((s) => {
      const haystack = `${s.name || ''} ${s.nim || ''} ${s.thesisTitle || ''}`.toLowerCase();
      return (!stage || s.currentStage === stage) && haystack.includes(q);
    });

    $('publicProgressBody').innerHTML = rows.map((s) => `
      <tr>
        <td>${esc(s.name)}</td>
        <td>${esc(maskNim(s.nim))}</td>
        <td>${esc(s.currentStage || '-')}</td>
        <td><div class="progress" style="height:8px"><div class="progress-bar" style="width:${Number(s.progress || 0)}%"></div></div><span class="small-muted">${esc(s.progress || 0)}%</span></td>
        <td>${badge(s.reviewStatus || s.studentStatus || '-')}</td>
        <td>${fmtDate(s.updatedAt || s.createdAt)}</td>
      </tr>
    `).join('') || '<tr><td colspan="6" class="text-center text-muted py-4">Data tidak ditemukan.</td></tr>';
  }

  async function login(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    try {
      const result = await api('login', data);
      if (!result.ok) throw new Error(result.message || 'Login gagal.');
      session = { token: result.token, user: result.user };
      writeJSON('bimbingin_session', session);
      closeModal('loginModal');
      event.target.reset();
      toast('Login berhasil.');
      await loadDashboard();
    } catch (err) {
      toast(err.message);
    }
  }

  function logout() {
    localStorage.removeItem('bimbingin_session');
    session = null;
    cache.dashboard = null;
    if (exists('dashboard')) $('dashboard').classList.add('d-none');
    if (exists('authButtons')) $('authButtons').classList.remove('d-none');
    if (exists('userBox')) $('userBox').classList.add('d-none');
    toast('Logout berhasil.');
  }

  async function loadDashboard() {
    if (!session) return;
    try {
      const data = await api('getDashboard');
      cache.dashboard = data;
      if (exists('dashboard')) $('dashboard').classList.remove('d-none');
      if (exists('authButtons')) $('authButtons').classList.add('d-none');
      if (exists('userBox')) $('userBox').classList.remove('d-none');
      if (exists('userLabel')) $('userLabel').textContent = `${session.user.name || session.user.username || 'User'} (${session.user.role})`;
      if (session.user.role === 'dosen') renderLecturer(data);
      else renderStudent(data);
    } catch (err) {
      toast(err.message);
      if (/sesi|token|login/i.test(err.message)) logout();
    }
  }

  function renderProfile(data) {
    const isDosen = session?.user?.role === 'dosen';
    const p = isDosen ? (data.lecturer || {}) : (data.student || {});

    if (exists('profileRoleBadge')) $('profileRoleBadge').textContent = isDosen ? 'Profil Dosen' : 'Profil Mahasiswa';
    if (exists('profileName')) $('profileName').textContent = p.name || session?.user?.name || '-';
    if (exists('profileMeta')) {
      $('profileMeta').textContent = isDosen
        ? [p.program, p.department, p.expertise].filter(Boolean).join(' • ') || '-'
        : [p.nim, p.program, p.currentStage].filter(Boolean).join(' • ') || '-';
    }
    if (exists('profileFolder')) {
      const folderUrl = p.folderRootUrl || p.folderUrl || '';
      $('profileFolder').innerHTML = folderUrl ? `<a href="${esc(folderUrl)}" target="_blank" rel="noopener">Buka Folder Drive</a>` : '';
    }

    if (!exists('profileFormArea')) return;
    $('profileFormArea').innerHTML = isDosen ? lecturerProfileForm(p) : studentProfileForm(p);

    const profileForm = $('profileForm');
    if (profileForm) profileForm.addEventListener('submit', saveProfile);
  }

  function field(name, label, value = '', type = 'text', extra = '') {
    return `<div class="col-md-6"><label class="form-label small text-muted">${esc(label)}</label><input class="form-control" type="${esc(type)}" name="${esc(name)}" data-profile-field="${esc(name)}" value="${esc(value || '')}" ${extra}></div>`;
  }

  function textArea(name, label, value = '', rows = 2) {
    return `<div class="col-12"><label class="form-label small text-muted">${esc(label)}</label><textarea class="form-control" name="${esc(name)}" data-profile-field="${esc(name)}" rows="${rows}">${esc(value || '')}</textarea></div>`;
  }

  function studentProfileForm(p) {
    return `
      <form id="profileForm" class="row g-2">
        ${field('name', 'Nama Lengkap', p.name)}
        ${field('nim', 'NIM', p.nim, 'text', 'readonly')}
        ${field('email', 'Email', p.email, 'email')}
        ${field('whatsapp', 'WhatsApp', p.whatsapp)}
        ${field('program', 'Program Studi', p.program)}
        ${field('cohort', 'Angkatan', p.cohort)}
        ${field('currentStage', 'Tahap Saat Ini', p.currentStage)}
        ${field('researchTopic', 'Topik/Bidang Penelitian', p.researchTopic)}
        ${textArea('thesisTitle', 'Judul Skripsi', p.thesisTitle, 2)}
        ${textArea('profileNote', 'Catatan Profil', p.profileNote || p.note || '', 2)}
        <div class="col-12 d-flex gap-2 mt-2">
          <button class="btn btn-primary btn-sm" type="submit">Simpan Profil</button>
          <span class="small text-muted align-self-center">Perubahan disimpan ke Google Sheets jika API sudah aktif.</span>
        </div>
      </form>`;
  }

  function lecturerProfileForm(p) {
    return `
      <form id="profileForm" class="row g-2">
        ${field('name', 'Nama Dosen', p.name)}
        ${field('nidn', 'NIP/NIDN', p.nidn)}
        ${field('email', 'Email', p.email, 'email')}
        ${field('whatsapp', 'WhatsApp', p.whatsapp)}
        ${field('program', 'Program Studi', p.program)}
        ${field('department', 'Departemen/Fakultas', p.department)}
        ${field('officeRoom', 'Ruang Kerja', p.officeRoom || p.offlineLocation)}
        ${field('consultationHours', 'Jam Konsultasi', p.consultationHours)}
        ${field('onlineLink', 'Link Meeting Default', p.onlineLink, 'url')}
        ${textArea('expertise', 'Bidang Keahlian', p.expertise, 2)}
        ${textArea('guidanceTopics', 'Topik Bimbingan', p.guidanceTopics, 2)}
        ${textArea('note', 'Catatan Bimbingan', p.note, 2)}
        <div class="col-12 d-flex gap-2 mt-2">
          <button class="btn btn-primary btn-sm" type="submit">Simpan Profil</button>
          <span class="small text-muted align-self-center">Profil ini dipakai pada halaman awal dan dashboard.</span>
        </div>
      </form>`;
  }

  async function saveProfile(event) {
    if (event) event.preventDefault();

    if (!session || !session.user) {
      toast('Sesi login tidak ditemukan. Silakan login ulang.');
      return;
    }

    const form = $('profileForm');
    if (!form) {
      toast('Form profil tidak ditemukan.');
      return;
    }

    const profile = Object.fromEntries(new FormData(form).entries());

    try {
      await api('saveProfile', {
        userId: session.user.userId,
        role: session.user.role,
        linkedId: session.user.linkedId,
        profile
      });
      toast('Profil berhasil disimpan.');
      await loadDashboard();
      await loadPublic();
    } catch (err) {
      // Fallback supaya tombol tetap tidak error walaupun backend Code.gs belum memiliki fungsi saveProfile.
      writeJSON(`bimbingin_profile_${session.user.userId}`, profile);
      toast(`Profil disimpan sementara di browser. Catatan: ${err.message}`);
      await loadDashboard();
    }
  }

  function renderStudent(data) {
    renderProfile(data);
    if (exists('studentDashboard')) $('studentDashboard').classList.remove('d-none');
    if (exists('lecturerDashboard')) $('lecturerDashboard').classList.add('d-none');
    if (exists('dashboardTitle')) $('dashboardTitle').textContent = 'Dashboard Mahasiswa';

    const s = data.student || {};
    if (exists('studentSummaryCards')) {
      $('studentSummaryCards').innerHTML = [
        ['Status', s.studentStatus], ['Tahap', s.currentStage], ['Review', s.reviewStatus], ['Progress', `${s.progress || 0}%`]
      ].map((x) => `<div class="col-md-3"><div class="mini-stat"><span>${esc(x[0])}</span><strong class="fs-5">${esc(x[1] || '-')}</strong></div></div>`).join('');
    }

    renderStudentFiles(data.files || []);
    renderSharedReferences(data.sharedReferences || []);

    if (exists('studentReviewsBox')) {
      const subs = data.submissions || [];
      $('studentReviewsBox').innerHTML = subs.map((r) => `
        <div class="border rounded-3 p-2 mb-2">
          <b>${esc(r.folderType || 'Review')}</b> ${badge(r.status)}<br>
          <a href="${esc(r.fileUrl || '#')}" target="_blank" rel="noopener">${esc(r.fileName || 'Buka file')}</a>
          <div class="small-muted mt-1">Catatan Dosen: ${esc(r.lecturerReview || '-')}</div>
        </div>
      `).join('') || 'Belum ada review.';
    }

    if (exists('studentContactBox')) {
      const l = data.lecturer || {};
      const wa = normalizeWa(l.whatsapp || '');
      $('studentContactBox').innerHTML = `
        <div class="card shadow-sm"><div class="card-body">
          <h5>Kontak Dosen</h5>
          <p class="mb-1"><b>${esc(l.name || '-')}</b></p>
          <p class="small-muted">${esc(l.email || '')}</p>
          <div class="d-flex flex-wrap gap-2">
            ${wa ? `<a class="btn btn-success btn-sm" href="https://wa.me/${wa}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
            ${l.email ? `<a class="btn btn-outline-primary btn-sm" href="mailto:${esc(l.email)}">Email</a>` : ''}
          </div>
        </div></div>`;
    }
  }

  function renderStudentFiles(files) {
    if (exists('studentFilesBody')) {
      $('studentFilesBody').innerHTML = files.map((f) => `
        <tr>
          <td>${esc(f.folderType || '-')}</td>
          <td><a href="${esc(f.fileUrl || '#')}" target="_blank" rel="noopener">${esc(f.fileName || '-')}</a></td>
          <td>${badge(f.status || f.sharingStatus || '-')}</td>
          <td class="action-grid">
            <button class="btn btn-sm btn-outline-success" data-file-share="${esc(f.fileId)}">Sharing</button>
            <button class="btn btn-sm btn-outline-danger" data-file-delete="${esc(f.fileId)}">Hapus</button>
          </td>
        </tr>
      `).join('') || '<tr><td colspan="4" class="text-muted">Belum ada file.</td></tr>';
    }

    if (exists('submitReviewFileSelect')) {
      $('submitReviewFileSelect').innerHTML = files.map((f) => `<option value="${esc(f.fileId)}">${esc(f.folderType)} - ${esc(f.fileName)}</option>`).join('');
    }

    if (exists('studentShareFileSelect')) {
      $('studentShareFileSelect').innerHTML = files
        .filter((f) => !/Data Lainnya/i.test(f.folderType || ''))
        .map((f) => `<option value="${esc(f.fileId)}">${esc(f.folderType)} - ${esc(f.fileName)} (${esc(f.sharingStatus || 'NotRequested')})</option>`).join('');
    }
  }

  function renderSharedReferences(items) {
    if (!exists('sharedReferencesBody')) return;
    const q = ($('sharedSearch')?.value || '').toLowerCase();
    const cat = $('sharedCategoryFilter')?.value || '';
    const rows = (items || []).filter((x) => {
      const haystack = `${x.title || ''} ${x.topic || ''} ${x.year || ''} ${x.description || ''}`.toLowerCase();
      return (!cat || x.category === cat) && haystack.includes(q);
    });

    $('sharedReferencesBody').innerHTML = rows.map((x) => `
      <tr>
        <td><b>${esc(x.title)}</b><br><span class="small-muted">${esc(x.description || '')}</span></td>
        <td>${esc(x.category || '-')}</td>
        <td>${esc(x.topic || '-')}<br><span class="small-muted">${esc(x.year || '')}</span></td>
        <td>${esc(x.ownerDisplayName || 'Anonim')}</td>
        <td><a class="btn btn-sm btn-primary" target="_blank" rel="noopener" href="${esc(x.fileUrl || '#')}">Lihat</a></td>
      </tr>
    `).join('') || '<tr><td colspan="5" class="text-muted">Belum ada referensi sharing.</td></tr>';
  }

  function renderLecturer(data) {
    renderProfile(data);
    if (exists('lecturerDashboard')) $('lecturerDashboard').classList.remove('d-none');
    if (exists('studentDashboard')) $('studentDashboard').classList.add('d-none');
    if (exists('dashboardTitle')) $('dashboardTitle').textContent = 'Dashboard Dosen/Admin';

    const students = data.students || [];
    const submissions = data.submissions || [];

    if (exists('lecturerStats')) {
      $('lecturerStats').innerHTML = [
        ['Mahasiswa', students.length],
        ['Menunggu Review', submissions.filter((x) => /menunggu/i.test(x.status || '')).length],
        ['Pengajuan Bimbingan', (data.guidanceRequests || []).length],
        ['Pengajuan Sidang', (data.examRequests || []).length]
      ].map((x) => `<div class="col-md-3"><div class="mini-stat"><span>${esc(x[0])}</span><strong>${esc(x[1])}</strong></div></div>`).join('');
    }

    if (exists('lecturerStudentsBody')) {
      $('lecturerStudentsBody').innerHTML = students.map((s) => `
        <tr>
          <td><b>${esc(s.name)}</b><br><span class="small-muted">${esc(s.nim)}</span></td>
          <td>${esc(s.currentStage || '-')}</td>
          <td>${badge(s.studentStatus || '-')}</td>
          <td>${badge(s.reviewStatus || '-')}</td>
          <td class="action-grid">
            <button class="btn btn-sm btn-outline-primary" data-student-detail="${esc(s.studentId)}">Detail</button>
            <a class="btn btn-sm btn-outline-success" target="_blank" rel="noopener" href="https://wa.me/${normalizeWa(s.whatsapp || '')}">WA</a>
          </td>
        </tr>
      `).join('') || '<tr><td colspan="5" class="text-muted">Belum ada mahasiswa.</td></tr>';
    }

    if (exists('pendingReviewsList')) {
      $('pendingReviewsList').innerHTML = submissions.map((r) => `
        <div class="border rounded-3 p-2 mb-2">
          <b>${esc(r.studentName || r.studentId)}</b><br>
          <a href="${esc(r.fileUrl || '#')}" target="_blank" rel="noopener">${esc(r.fileName)}</a>
          <div>${badge(r.status)}</div>
          <button class="btn btn-sm btn-primary mt-2" data-review-submission="${esc(r.submissionId)}">Review</button>
        </div>
      `).join('') || '<div class="text-muted">Tidak ada review menunggu.</div>';
    }

    if (exists('pendingSchedulesList')) {
      const schedules = [...(data.guidanceRequests || []), ...(data.examRequests || [])];
      $('pendingSchedulesList').innerHTML = schedules.map((r) => `
        <div class="border rounded-3 p-2 mb-2">
          <b>${esc(r.topic || r.examType || 'Pengajuan')}</b><br>
          <span class="small-muted">${fmtDate(r.preferredStart || r.preferredDateTime)}</span>
          <div>${badge(r.status)}</div>
        </div>
      `).join('') || '<div class="text-muted">Tidak ada pengajuan jadwal.</div>';
    }

    renderLecturerSharing(data);
  }

  function renderLecturerSharing(data) {
    const requests = data.shareRequests || [];
    const refs = data.sharedReferences || [];

    if (exists('shareRequestsList')) {
      $('shareRequestsList').innerHTML = requests.map((f) => `
        <div class="border rounded-3 p-2 mb-2">
          <b>${esc(f.shareTitle || f.fileName)}</b><br>
          <a target="_blank" rel="noopener" href="${esc(f.fileUrl || '#')}">${esc(f.fileName)}</a>
          <div>${badge(f.sharingStatus || 'Pending')}</div>
          <button class="btn btn-sm btn-primary mt-2" data-approve-share="${esc(f.fileId)}">Setujui Sharing</button>
        </div>
      `).join('') || '<div class="text-muted">Tidak ada permintaan sharing.</div>';
    }

    if (exists('lecturerSharedList')) {
      $('lecturerSharedList').innerHTML = refs.map((r) => `
        <div class="border rounded-3 p-2 mb-2">
          <b>${esc(r.title)}</b><br>
          <span class="small-muted">${esc(r.category)} • ${esc(r.topic || '')} • ${esc(r.year || '')}</span>
          <div class="mt-1"><a target="_blank" rel="noopener" href="${esc(r.fileUrl || '#')}">Buka file</a></div>
        </div>
      `).join('') || '<div class="text-muted">Belum ada referensi aktif.</div>';
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target).entries());
    if (data.password !== data.confirmPassword) return toast('Konfirmasi password tidak cocok.');
    try {
      await api('registerStudent', { student: data });
      closeModal('registerModal');
      event.target.reset();
      toast('Pendaftaran terkirim. Tunggu verifikasi dosen.');
      loadPublic();
    } catch (err) { toast(err.message); }
  }

  async function handleUpload(event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    const file = fd.get('file');
    try {
      const b64 = await fileToBase64(file);
      await api('uploadFile', { folderType: fd.get('folderType'), note: fd.get('note'), file: b64 });
      toast('File berhasil diunggah.');
      event.target.reset();
      loadDashboard();
    } catch (err) { toast(err.message); }
  }

  async function simpleForm(event, action) {
    event.preventDefault();
    try {
      await api(action, Object.fromEntries(new FormData(event.target).entries()));
      toast('Data berhasil diproses.');
      event.target.reset();
      loadDashboard();
      loadPublic();
    } catch (err) { toast(err.message); }
  }

  function bind() {
    if (exists('loginForm')) $('loginForm').addEventListener('submit', login);
    if (exists('logoutBtn')) $('logoutBtn').addEventListener('click', logout);
    if (exists('refreshPublicBtn')) $('refreshPublicBtn').addEventListener('click', loadPublic);
    if (exists('publicSearch')) $('publicSearch').addEventListener('input', renderProgress);
    if (exists('publicStageFilter')) $('publicStageFilter').addEventListener('change', renderProgress);
    if (exists('registerForm')) $('registerForm').addEventListener('submit', handleRegister);
    if (exists('printReportBtn')) $('printReportBtn').addEventListener('click', () => window.print());
    if (exists('uploadForm')) $('uploadForm').addEventListener('submit', handleUpload);
    if (exists('submitReviewForm')) $('submitReviewForm').addEventListener('submit', (e) => simpleForm(e, 'submitReview'));
    if (exists('guidanceForm')) $('guidanceForm').addEventListener('submit', (e) => simpleForm(e, 'requestGuidance'));
    if (exists('examForm')) $('examForm').addEventListener('submit', (e) => simpleForm(e, 'requestExam'));
    if (exists('lecturerStatusForm')) $('lecturerStatusForm').addEventListener('submit', (e) => simpleForm(e, 'setLecturerStatus'));
    if (exists('addStudentForm')) $('addStudentForm').addEventListener('submit', (e) => simpleForm(e, 'addStudent'));
    if (exists('shareRequestForm')) $('shareRequestForm').addEventListener('submit', (e) => simpleForm(e, 'requestShareFile'));
    if (exists('approveShareForm')) $('approveShareForm').addEventListener('submit', (e) => simpleForm(e, 'approveShareReference'));
    if (exists('sharedSearch')) $('sharedSearch').addEventListener('input', () => renderSharedReferences(cache.dashboard?.sharedReferences || []));
    if (exists('sharedCategoryFilter')) $('sharedCategoryFilter').addEventListener('change', () => renderSharedReferences(cache.dashboard?.sharedReferences || []));

    if (exists('templateForm')) {
      $('templateForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const fd = new FormData(event.target);
        try {
          const b64 = await fileToBase64(fd.get('file'));
          await api('uploadTemplate', { category: fd.get('category'), title: fd.get('title'), description: fd.get('description'), file: b64 });
          toast('Template berhasil diunggah.');
          event.target.reset();
          loadDashboard();
          loadPublic();
        } catch (err) { toast(err.message); }
      });
    }

    if (exists('reviewForm')) {
      $('reviewForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const fd = new FormData(event.target);
        const reviewFile = fd.get('reviewFile');
        const payload = Object.fromEntries(fd.entries());
        delete payload.reviewFile;
        try {
          if (reviewFile && reviewFile.size) payload.reviewFile = await fileToBase64(reviewFile);
          await api('reviewSubmission', payload);
          closeModal('reviewModal');
          toast('Review tersimpan.');
          loadDashboard();
          loadPublic();
        } catch (err) { toast(err.message); }
      });
    }

    document.body.addEventListener('click', async (event) => {
      const detail = event.target.closest('[data-student-detail]');
      if (detail) {
        const id = detail.dataset.studentDetail;
        const s = (cache.dashboard?.students || []).find((x) => x.studentId === id);
        if (exists('studentDetailTitle')) $('studentDetailTitle').textContent = s?.name || 'Detail Mahasiswa';
        if (exists('studentDetailBody')) $('studentDetailBody').innerHTML = `<pre class="bg-light p-3 rounded">${esc(JSON.stringify(s || {}, null, 2))}</pre>`;
        if (exists('studentDetailModal') && window.bootstrap) bootstrap.Modal.getOrCreateInstance($('studentDetailModal')).show();
      }

      const review = event.target.closest('[data-review-submission]');
      if (review) {
        const sub = (cache.dashboard?.submissions || []).find((x) => x.submissionId === review.dataset.reviewSubmission);
        if (exists('reviewForm')) $('reviewForm').submissionId.value = sub?.submissionId || '';
        if (exists('reviewSubmissionInfo')) {
          $('reviewSubmissionInfo').innerHTML = `<b>${esc(sub?.studentName || '')}</b><br><a target="_blank" rel="noopener" href="${esc(sub?.fileUrl || '#')}">${esc(sub?.fileName || '')}</a><div class="small-muted">Catatan mahasiswa: ${esc(sub?.studentNote || '-')}</div>`;
        }
        if (exists('reviewModal') && window.bootstrap) bootstrap.Modal.getOrCreateInstance($('reviewModal')).show();
      }

      const share = event.target.closest('[data-file-share]');
      if (share) {
        if (exists('studentShareFileSelect')) $('studentShareFileSelect').value = share.dataset.fileShare;
        if (exists('shareRequestModal') && window.bootstrap) bootstrap.Modal.getOrCreateInstance($('shareRequestModal')).show();
      }

      const del = event.target.closest('[data-file-delete]');
      if (del) {
        if (!confirm('Hapus file ini dari daftar BimbingIn?')) return;
        try {
          await api('deleteFile', { fileId: del.dataset.fileDelete });
          toast('File berhasil dihapus.');
          loadDashboard();
        } catch (err) { toast(err.message); }
      }

      const approve = event.target.closest('[data-approve-share]');
      if (approve) {
        const f = (cache.dashboard?.shareRequests || []).find((x) => x.fileId === approve.dataset.approveShare)
          || (cache.dashboard?.files || []).find((x) => x.fileId === approve.dataset.approveShare);
        if (f && exists('approveShareForm')) {
          const form = $('approveShareForm');
          form.fileId.value = f.fileId;
          form.title.value = f.shareTitle || f.fileName || '';
          form.category.value = f.shareCategory || f.folderType || 'Proposal';
          form.topic.value = f.shareTopic || '';
          form.year.value = f.shareYear || new Date().getFullYear();
          form.description.value = f.shareDescription || '';
          form.ownerDisplayMode.value = f.ownerDisplayMode || 'Anonymous';
          if (exists('approveShareInfo')) $('approveShareInfo').innerHTML = `<a target="_blank" rel="noopener" href="${esc(f.fileUrl || '#')}">${esc(f.fileName || '')}</a><br>${badge(f.status || '')}`;
          if (exists('approveShareModal') && window.bootstrap) bootstrap.Modal.getOrCreateInstance($('approveShareModal')).show();
        }
      }
    });
  }

  // Global exports untuk tombol inline atau debugging dari console.
  window.BimbingIn = { loadPublic, loadDashboard, saveProfile, logout, api };
  window.saveProfile = saveProfile;

  document.addEventListener('DOMContentLoaded', () => {
    bind();
    loadPublic();
    if (session) loadDashboard();
  });
}());
