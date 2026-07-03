const CFG = window.BIMBINGIN_CONFIG || {};
const API_URL = CFG.API_URL || "";
let session = JSON.parse(localStorage.getItem("bimbingin_session") || "null");
let cache = { publicData:null, dashboard:null };

const $ = (id) => document.getElementById(id);
const toast = (msg) => { const el=$("appToast"); $("toastBody").textContent=msg; bootstrap.Toast.getOrCreateInstance(el).show(); };
const esc = (s="") => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const badge = (status="") => { const s=String(status); let c="status-muted"; if(/menunggu|diajukan/i.test(s)) c="status-wait"; if(/setuju|final|aktif|lulus|selesai|layak/i.test(s)) c="status-ok"; if(/revisi|tolak|tidak/i.test(s)) c="status-rev"; if(/jadwal|review|online|offline/i.test(s)) c="status-info"; return `<span class="status-pill ${c}">${esc(s||'-')}</span>`; };
const fmtDate = (v) => v ? new Date(v).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'}) : '-';
const normalizeWa = (v="") => { let n=String(v).replace(/[^0-9]/g,""); if(n.startsWith("0")) n="62"+n.slice(1); return n; };

async function api(action, payload={}){
  if(!API_URL || API_URL.includes("PASTE_")){
    if(CFG.DEMO_MODE_WHEN_API_EMPTY) return demoApi(action,payload);
    throw new Error("API_URL belum diisi pada assets/js/config.js");
  }
  const res = await fetch(API_URL, { method:"POST", mode:"cors", body: JSON.stringify({ action, token: session?.token, ...payload }) });
  const json = await res.json();
  if(!json.ok) throw new Error(json.message || "Terjadi kesalahan API");
  return json;
}
async function fileToBase64(file){ return new Promise((resolve,reject)=>{ const r=new FileReader(); r.onload=()=>resolve({ name:file.name, mimeType:file.type || 'application/octet-stream', data:String(r.result).split(',')[1] }); r.onerror=reject; r.readAsDataURL(file); }); }

function demoApi(action,payload){
  const now = new Date();
  const demo = {
    lecturer:{ name:"Dr. Mahardika Inra Takaendengan", email:"mahardika@unsrat.ac.id", whatsapp:"081244000000", availabilityStatus:"Available Online & Offline", consultationHours:"Senin-Jumat 10.00-14.00", offlineLocation:"Ruang Dosen", onlineLink:"https://meet.google.com/xxx-yyyy-zzz", note:"Prioritas untuk mahasiswa yang mengajukan review final."},
    students:[
      {studentId:"S001", userId:"U_MHS1", name:"Andi Setiawan", nim:"202201001", program:"S1 Sistem Informasi", cohort:"2022", currentStage:"Proposal", progress:35, reviewStatus:"Menunggu Review", studentStatus:"Aktif Bimbingan", thesisTitle:"Sistem Informasi Monitoring Skripsi", folderUrl:"#", updatedAt:now.toISOString()},
      {studentId:"S002", userId:"U_MHS2", name:"Maria Lestari", nim:"202201002", program:"S1 Sistem Informasi", cohort:"2022", currentStage:"Seminar Hasil", progress:70, reviewStatus:"Revisi Minor", studentStatus:"Aktif Bimbingan", thesisTitle:"Dashboard Tracer Study", folderUrl:"#", updatedAt:now.toISOString()},
      {studentId:"S003", userId:"U_MHS3", name:"Riko Pratama", nim:"202201003", program:"S1 Sistem Informasi", cohort:"2022", currentStage:"Skripsi", progress:90, reviewStatus:"Disetujui", studentStatus:"Siap Sidang", thesisTitle:"Analisis Sentimen Layanan Akademik", folderUrl:"#", updatedAt:now.toISOString()}
    ],
    events:[{title:"[BIMBINGAN-ONLINE] Maria - Revisi Artikel", startTime:now.toISOString(), endTime:new Date(now.getTime()+3600000).toISOString(), mode:"Online", location:"Google Meet"},{title:"[UJIAN-SKRIPSI] Riko Pratama", startTime:new Date(now.getTime()+86400000).toISOString(), endTime:new Date(now.getTime()+90000000).toISOString(), mode:"Offline", location:"Ruang Sidang"}],
    templates:[{templateId:"T1", category:"Proposal", title:"Template Proposal Skripsi 2026", description:"Format proposal resmi", version:"v1.0", fileUrl:"#"},{templateId:"T2", category:"Skripsi", title:"Template Skripsi Final", description:"Format naskah akhir", version:"v1.0", fileUrl:"#"}],
    files:[{fileId:"F1", studentId:"S001", folderType:"Proposal", fileName:"Proposal_202201001_260703-120000.docx", fileUrl:"#", status:"Diajukan Review", sharingStatus:"NotRequested", uploadedAt:now.toISOString()},{fileId:"F2", studentId:"S001", folderType:"Skripsi", fileName:"Skripsi_202201001_260703-130000.pdf", fileUrl:"#", status:"Final", sharingStatus:"Pending", shareTitle:"Contoh Skripsi Sistem Informasi Monitoring", shareCategory:"Skripsi", shareTopic:"Sistem Informasi", shareYear:"2026", uploadedAt:now.toISOString()}],
    submissions:[{submissionId:"SUB1", studentId:"S001", studentName:"Andi Setiawan", nim:"202201001", folderType:"Proposal", fileName:"Proposal_202201001_260703-120000.docx", fileUrl:"#", status:"Menunggu Review", studentNote:"BAB 1 sudah diperbaiki.", submittedAt:now.toISOString()}],
    sharedReferences:[{sharedId:"SH1", title:"Contoh Proposal Sistem Informasi Berbasis Web", category:"Proposal", topic:"Sistem Informasi", year:"2026", ownerDisplayName:"Mahasiswa Sistem Informasi Angkatan 2022", description:"Contoh struktur proposal yang sudah disetujui.", fileType:"PDF", fileUrl:"#", status:"Shared"},{sharedId:"SH2", title:"Draft Artikel Ilmiah Terstruktur", category:"Artikel Ilmiah", topic:"Academic Writing", year:"2025", ownerDisplayName:"Mahasiswa Alumni Bimbingan", description:"Contoh artikel untuk referensi struktur IMRaD.", fileType:"DOCX", fileUrl:"#", status:"Shared"}]
  };
  if(action==="getPublicData") return Promise.resolve({ok:true, ...demo, summary:{activeStudents:3,pendingReviews:1,todayGuidance:1,examEvents:1}, newStudents: demo.students.slice(0,2)});
  if(action==="login"){
    if(payload.username==="dosen" && payload.password==="dosen123") return Promise.resolve({ok:true, token:"demo-dosen", user:{userId:"U_DOSEN", role:"dosen", isAdmin:true, name:demo.lecturer.name, email:demo.lecturer.email}});
    if(payload.username==="202201001" && payload.password==="mhs123") return Promise.resolve({ok:true, token:"demo-mhs", user:{userId:"U_MHS1", role:"mahasiswa", linkedId:"S001", name:"Andi Setiawan", email:"andi@mail.test"}});
    return Promise.resolve({ok:false, message:"Akun demo tidak cocok"});
  }
  if(action==="getDashboard"){
    if(session?.user?.role==="dosen") return Promise.resolve({ok:true, user:session.user, lecturer:demo.lecturer, students:demo.students, files:demo.files, submissions:demo.submissions, guidanceRequests:[], examRequests:[], sharedReferences:demo.sharedReferences, shareRequests:demo.files.filter(f=>f.sharingStatus==="Pending")});
    return Promise.resolve({ok:true, user:session.user, student:demo.students[0], lecturer:demo.lecturer, files:demo.files, submissions:demo.submissions, guidanceRequests:[], examRequests:[], sharedReferences:demo.sharedReferences});
  }
  return Promise.resolve({ok:true, message:"Demo mode: aksi disimulasikan."});
}

async function loadPublic(){
  try{ const data = await api("getPublicData"); cache.publicData=data; renderPublic(data); }
  catch(e){ toast(e.message); }
}
function renderPublic(data){
  $("statActiveStudents").textContent=data.summary?.activeStudents ?? 0; $("statPendingReviews").textContent=data.summary?.pendingReviews ?? 0; $("statTodayGuidance").textContent=data.summary?.todayGuidance ?? 0; $("statExamEvents").textContent=data.summary?.examEvents ?? 0;
  $("lecturerAvailability").textContent=`${data.lecturer?.name||'-'} - ${data.lecturer?.availabilityStatus||'-'}`; $("lecturerAvailabilityNote").textContent=[data.lecturer?.consultationHours,data.lecturer?.note].filter(Boolean).join(' • ');
  renderProgress();
  $("calendarCards").innerHTML=(data.events||[]).map(e=>`<div class="col-md-6 col-xl-4"><div class="card shadow-sm h-100"><div class="card-body"><div class="small text-muted">${esc(e.mode||'Calendar')}</div><h6 class="fw-bold">${esc(e.title)}</h6><div>${fmtDate(e.startTime)}</div><div class="small-muted">${esc(e.location||'')}</div></div></div></div>`).join('') || '<div class="col-12 text-muted">Belum ada jadwal.</div>';
  $("templateCards").innerHTML=(data.templates||[]).map(t=>`<div class="col-md-6 col-xl-3"><div class="card template-card"><div class="card-body"><span class="badge badge-soft mb-2">${esc(t.category)}</span><h6 class="fw-bold">${esc(t.title)}</h6><p class="small-muted">${esc(t.description||'')}</p><div class="d-flex justify-content-between align-items-center"><span class="small-muted">${esc(t.version||'')}</span><a class="btn btn-sm btn-primary" href="${esc(t.fileUrl||'#')}" target="_blank">Download</a></div></div></div></div>`).join('') || '<div class="col-12 text-muted">Belum ada template aktif.</div>';
  $("newStudentCards").innerHTML=(data.newStudents||[]).map(s=>`<div class="col-md-6 col-xl-3"><div class="card"><div class="card-body"><h6>${esc(s.name)}</h6><div class="small-muted">${esc(maskNim(s.nim))} • ${esc(s.currentStage||'Proposal')}</div>${badge(s.studentStatus||'Menunggu Verifikasi')}</div></div></div>`).join('') || '<div class="col-12 text-muted">Belum ada mahasiswa baru.</div>';
}
function maskNim(n=""){ const s=String(n); return s.length>4 ? s.slice(0,4)+"****"+s.slice(-2) : s; }
function renderProgress(){
  const q=($("publicSearch")?.value||"").toLowerCase(), st=$("publicStageFilter")?.value||""; const rows=(cache.publicData?.students||[]).filter(s=>(!st||s.currentStage===st) && (`${s.name} ${s.nim}`.toLowerCase().includes(q)));
  $("publicProgressBody").innerHTML=rows.map(s=>`<tr><td>${esc(s.name)}</td><td>${esc(maskNim(s.nim))}</td><td>${esc(s.currentStage)}</td><td><div class="progress" style="height:8px"><div class="progress-bar" style="width:${Number(s.progress||0)}%"></div></div><small>${Number(s.progress||0)}%</small></td><td>${badge(s.reviewStatus||s.studentStatus)}</td><td>${fmtDate(s.updatedAt)}</td></tr>`).join('') || '<tr><td colspan="6" class="text-center text-muted py-4">Data tidak ditemukan.</td></tr>';
}

async function login(e){
  e.preventDefault(); const fd=Object.fromEntries(new FormData(e.target).entries());
  try{ const res=await api("login",fd); if(!res.ok) throw new Error(res.message); session={token:res.token,user:res.user}; localStorage.setItem("bimbingin_session",JSON.stringify(session)); bootstrap.Modal.getInstance($("loginModal"))?.hide(); await loadDashboard(); toast("Login berhasil."); }
  catch(err){ toast(err.message); }
}
function logout(){ localStorage.removeItem("bimbingin_session"); session=null; $("dashboard").classList.add("d-none"); $("authButtons").classList.remove("d-none"); $("userBox").classList.add("d-none"); toast("Logout berhasil."); }

function getCurrentUser(){ return session?.user || null; }
function collectProfileForm(){ const form=$("profileInlineForm"); return form ? Object.fromEntries(new FormData(form).entries()) : {}; }
async function saveProfile(){
  const user=getCurrentUser();
  if(!user){ toast('Silakan login terlebih dahulu.'); return; }
  const role=String(user.role||'').toLowerCase();
  if(role==='mahasiswa' || role==='student') return saveStudentProfile();
  if(role==='dosen' || role==='lecturer' || role==='admin' || role==='dosen_admin') return saveLecturerProfile();
  toast('Role pengguna tidak dikenali: '+role);
}
async function saveStudentProfile(){
  try{ await api('saveStudentProfile',{profile:collectProfileForm()}); toast('Profil mahasiswa berhasil disimpan.'); await loadDashboard(); await loadPublic(); }
  catch(err){ toast(err.message); }
}
async function saveLecturerProfile(){
  try{ await api('saveLecturerProfile',{profile:collectProfileForm()}); toast('Profil dosen berhasil disimpan.'); await loadDashboard(); await loadPublic(); }
  catch(err){ toast(err.message); }
}
window.saveProfile=saveProfile;
window.saveStudentProfile=saveStudentProfile;
window.saveLecturerProfile=saveLecturerProfile;
async function loadDashboard(){
  if(!session) return; $("authButtons").classList.add("d-none"); $("userBox").classList.remove("d-none"); $("userBox").classList.add("d-flex"); $("userLabel").textContent=`${session.user.name} (${session.user.role})`;
  const data=await api("getDashboard"); cache.dashboard=data; $("dashboard").classList.remove("d-none");
  if(session.user.role==="dosen") renderLecturer(data); else renderStudent(data); location.hash="#dashboard";
}
function renderProfile(data){
  const isDosen=session.user.role==="dosen", p=isDosen?data.lecturer:data.student;
  $("profileRoleBadge").textContent=isDosen?"Profil Dosen":"Profil Mahasiswa";
  $("profileName").textContent=p?.name||session.user.name;
  $("profileMeta").textContent=isDosen?`${p?.email||''} • ${p?.expertise||''}`:`${p?.nim||''} • ${p?.program||''} • ${p?.currentStage||''}`;
  $("profileFolder").innerHTML=p?.folderRootUrl||p?.folderUrl?`<a href="${esc(p.folderRootUrl||p.folderUrl)}" target="_blank">Buka Folder Drive</a>`:"";
  if(isDosen){
    $("profileFormArea").innerHTML = `
      <form id="profileInlineForm" class="row g-3">
        <div class="col-md-6"><label class="form-label">Nama Dosen</label><input id="profileNameInput" name="name" class="form-control" value="${esc(p?.name||session.user.name)}"></div>
        <div class="col-md-6"><label class="form-label">Email</label><input id="profileEmailInput" name="email" type="email" class="form-control" value="${esc(p?.email||'')}"></div>
        <div class="col-md-4"><label class="form-label">WhatsApp</label><input id="profileWhatsappInput" name="whatsapp" class="form-control" value="${esc(p?.whatsapp||'')}"></div>
        <div class="col-md-4"><label class="form-label">Program Studi</label><input id="profileProgramInput" name="program" class="form-control" value="${esc(p?.program||'')}"></div>
        <div class="col-md-4"><label class="form-label">Ruangan</label><input id="profileOfficeInput" name="officeRoom" class="form-control" value="${esc(p?.officeRoom||'')}"></div>
        <div class="col-md-6"><label class="form-label">Keahlian</label><input id="profileExpertiseInput" name="expertise" class="form-control" value="${esc(p?.expertise||'')}"></div>
        <div class="col-md-6"><label class="form-label">Jam Konsultasi</label><input id="profileConsultationInput" name="consultationHours" class="form-control" value="${esc(p?.consultationHours||'')}"></div>
        <div class="col-12"><label class="form-label">Catatan</label><textarea id="profileNoteInput" name="note" class="form-control" rows="2">${esc(p?.note||'')}</textarea></div>
        <div class="col-12"><button type="button" class="btn btn-primary" onclick="saveProfile()">Simpan Profil</button></div>
      </form>`;
  } else {
    $("profileFormArea").innerHTML = `
      <form id="profileInlineForm" class="row g-3">
        <div class="col-md-6"><label class="form-label">Nama Mahasiswa</label><input id="profileNameInput" name="name" class="form-control" value="${esc(p?.name||session.user.name)}"></div>
        <div class="col-md-3"><label class="form-label">NIM</label><input id="profileNimInput" name="nim" class="form-control" value="${esc(p?.nim||'')}" readonly></div>
        <div class="col-md-3"><label class="form-label">Angkatan</label><input id="profileCohortInput" name="cohort" class="form-control" value="${esc(p?.cohort||'')}"></div>
        <div class="col-md-4"><label class="form-label">Email</label><input id="profileEmailInput" name="email" type="email" class="form-control" value="${esc(p?.email||'')}"></div>
        <div class="col-md-4"><label class="form-label">WhatsApp</label><input id="profileWhatsappInput" name="whatsapp" class="form-control" value="${esc(p?.whatsapp||'')}"></div>
        <div class="col-md-4"><label class="form-label">Program Studi</label><input id="profileProgramInput" name="program" class="form-control" value="${esc(p?.program||'')}"></div>
        <div class="col-md-6"><label class="form-label">Judul Skripsi</label><input id="profileTitleInput" name="thesisTitle" class="form-control" value="${esc(p?.thesisTitle||'')}"></div>
        <div class="col-md-6"><label class="form-label">Topik/Bidang Riset</label><input id="profileTopicInput" name="researchTopic" class="form-control" value="${esc(p?.researchTopic||'')}"></div>
        <div class="col-12"><button type="button" class="btn btn-primary" onclick="saveProfile()">Simpan Profil</button></div>
      </form>`;
  }
}
function renderStudent(data){
  renderProfile(data); $("studentDashboard").classList.remove("d-none"); $("lecturerDashboard").classList.add("d-none"); $("dashboardTitle").textContent="Dashboard Mahasiswa";
  const s=data.student||{}; $("studentSummaryCards").innerHTML=[['Status',s.studentStatus],['Tahap',s.currentStage],['Review',s.reviewStatus],['Progress',(s.progress||0)+'%']].map(x=>`<div class="col-md-3"><div class="mini-stat"><span>${x[0]}</span><strong class="fs-5">${x[1]||'-'}</strong></div></div>`).join('');
  renderStudentFiles(data.files||[]); renderSharedReferences(data.sharedReferences||[]); $("studentReviewsBox").innerHTML=(data.submissions||[]).map(r=>`<div class="mb-2"><b>${esc(r.fileName)}</b><br>${badge(r.status)}<div>${esc(r.lecturerReview||r.studentNote||'Belum ada catatan.')}</div></div>`).join('')||'Belum ada review.';
  const l=data.lecturer||{}; const wa=normalizeWa(l.whatsapp); $("studentContactBox").innerHTML=`<button class="btn btn-outline-secondary" id="internalMsgBtn">Kirim Pesan</button>${wa?`<a class="btn btn-success" target="_blank" href="https://wa.me/${wa}?text=${encodeURIComponent('Selamat siang Pak, saya '+(s.name||'')+' ('+(s.nim||'')+'). Saya ingin berkonsultasi terkait bimbingan skripsi. Terima kasih.')}">WhatsApp Dosen</a>`:''}${l.email?`<a class="btn btn-outline-primary" href="mailto:${esc(l.email)}?subject=${encodeURIComponent('Bimbingan Skripsi - '+(s.name||'')+' - '+(s.nim||''))}">Email Dosen</a>`:''}`;
}
function renderStudentFiles(files){
  $("studentFilesBody").innerHTML=files.map(f=>`<tr><td>${esc(f.folderType)}</td><td><a class="file-link" href="${esc(f.fileUrl||'#')}" target="_blank">${esc(f.fileName)}</a></td><td>${badge(f.status||'Aktif')}</td><td class="action-grid"><button class="btn btn-sm btn-outline-primary" data-file-submit="${esc(f.fileId)}">Review</button><button class="btn btn-sm btn-outline-success" data-file-share="${esc(f.fileId)}">Sharing</button><button class="btn btn-sm btn-outline-danger" data-file-delete="${esc(f.fileId)}">Hapus</button></td></tr>`).join('')||'<tr><td colspan="4" class="text-muted">Belum ada file.</td></tr>';
  $("submitReviewFileSelect").innerHTML=files.map(f=>`<option value="${esc(f.fileId)}">${esc(f.folderType)} - ${esc(f.fileName)}</option>`).join('');
  if($("studentShareFileSelect")) $("studentShareFileSelect").innerHTML=files.filter(f=>!/Data Lainnya/i.test(f.folderType||'')).map(f=>`<option value="${esc(f.fileId)}">${esc(f.folderType)} - ${esc(f.fileName)} (${esc(f.sharingStatus||'NotRequested')})</option>`).join('');
}
function renderSharedReferences(items){
  const q=($('sharedSearch')?.value||'').toLowerCase(), cat=$('sharedCategoryFilter')?.value||'';
  const rows=(items||[]).filter(x=>(!cat||x.category===cat) && (`${x.title} ${x.topic} ${x.year} ${x.description}`.toLowerCase().includes(q)));
  if($('sharedReferencesBody')) $('sharedReferencesBody').innerHTML=rows.map(x=>`<tr><td><b>${esc(x.title)}</b><br><span class="small-muted">${esc(x.description||'')}</span></td><td>${esc(x.category||'-')}</td><td>${esc(x.topic||'-')}<br><span class="small-muted">${esc(x.year||'')}</span></td><td>${esc(x.ownerDisplayName||'Anonim')}</td><td><a class="btn btn-sm btn-primary" target="_blank" href="${esc(x.fileUrl||'#')}">Lihat</a></td></tr>`).join('') || '<tr><td colspan="5" class="text-muted">Belum ada referensi sharing.</td></tr>';
}

function renderLecturer(data){
  renderProfile(data); $("lecturerDashboard").classList.remove("d-none"); $("studentDashboard").classList.add("d-none"); $("dashboardTitle").textContent="Dashboard Dosen/Admin";
  const students=data.students||[], subs=data.submissions||[]; $("lecturerStats").innerHTML=[['Mahasiswa',students.length],['Menunggu Review',subs.filter(x=>/menunggu/i.test(x.status)).length],['Pengajuan Bimbingan',(data.guidanceRequests||[]).length],['Pengajuan Sidang',(data.examRequests||[]).length]].map(x=>`<div class="col-md-3"><div class="mini-stat"><span>${x[0]}</span><strong>${x[1]}</strong></div></div>`).join('');
  $("lecturerStudentsBody").innerHTML=students.map(s=>`<tr><td><b>${esc(s.name)}</b><br><span class="small-muted">${esc(s.nim)}</span></td><td>${esc(s.currentStage||'-')}</td><td>${badge(s.studentStatus||'-')}</td><td>${badge(s.reviewStatus||'-')}</td><td class="action-grid"><button class="btn btn-sm btn-outline-primary" data-student-detail="${esc(s.studentId)}">Detail</button><a class="btn btn-sm btn-outline-success" target="_blank" href="https://wa.me/${normalizeWa(s.whatsapp||'')}">WA</a></td></tr>`).join('')||'<tr><td colspan="5" class="text-muted">Belum ada mahasiswa.</td></tr>';
  $("pendingReviewsList").innerHTML=subs.map(r=>`<div class="border rounded-3 p-2 mb-2"><b>${esc(r.studentName||r.studentId)}</b><br><a href="${esc(r.fileUrl||'#')}" target="_blank">${esc(r.fileName)}</a><div>${badge(r.status)}</div><button class="btn btn-sm btn-primary mt-2" data-review-submission="${esc(r.submissionId)}">Review</button></div>`).join('')||'<div class="text-muted">Tidak ada review menunggu.</div>';
  const schedules=[...(data.guidanceRequests||[]),...(data.examRequests||[])]; $("pendingSchedulesList").innerHTML=schedules.map(r=>`<div class="border rounded-3 p-2 mb-2"><b>${esc(r.topic||r.examType||'Pengajuan')}</b><br><span class="small-muted">${fmtDate(r.preferredStart||r.preferredDateTime)}</span><div>${badge(r.status)}</div></div>`).join('')||'<div class="text-muted">Tidak ada pengajuan jadwal.</div>';
  renderLecturerSharing(data);
}
function renderLecturerSharing(data){
  const reqs=data.shareRequests||[]; const refs=data.sharedReferences||[];
  if($("shareRequestsList")) $("shareRequestsList").innerHTML=reqs.map(f=>`<div class="border rounded-3 p-2 mb-2"><b>${esc(f.shareTitle||f.fileName)}</b><br><a target="_blank" href="${esc(f.fileUrl||'#')}">${esc(f.fileName)}</a><div>${badge(f.sharingStatus||'Pending')}</div><button class="btn btn-sm btn-primary mt-2" data-approve-share="${esc(f.fileId)}">Setujui Sharing</button></div>`).join('')||'<div class="text-muted">Tidak ada permintaan sharing.</div>';
  if($("lecturerSharedList")) $("lecturerSharedList").innerHTML=refs.map(r=>`<div class="border rounded-3 p-2 mb-2"><b>${esc(r.title)}</b><br><span class="small-muted">${esc(r.category)} • ${esc(r.topic||'')} • ${esc(r.year||'')}</span><div class="mt-1"><a target="_blank" href="${esc(r.fileUrl||'#')}">Buka file</a></div></div>`).join('')||'<div class="text-muted">Belum ada referensi aktif.</div>';
}

async function handleRegister(e){ e.preventDefault(); const fd=Object.fromEntries(new FormData(e.target).entries()); if(fd.password!==fd.confirmPassword) return toast('Konfirmasi password tidak cocok.'); try{ await api('registerStudent',{student:fd}); bootstrap.Modal.getInstance($("registerModal"))?.hide(); e.target.reset(); toast('Pendaftaran terkirim. Tunggu verifikasi dosen.'); loadPublic(); }catch(err){toast(err.message);} }
async function handleUpload(e){ e.preventDefault(); const fd=new FormData(e.target); const file=fd.get('file'); try{ const b64=await fileToBase64(file); await api('uploadFile',{folderType:fd.get('folderType'), note:fd.get('note'), file:b64}); toast('File berhasil diunggah.'); e.target.reset(); loadDashboard(); }catch(err){toast(err.message);} }
async function simpleForm(e, action){ e.preventDefault(); try{ await api(action,Object.fromEntries(new FormData(e.target).entries())); toast('Data berhasil diproses.'); e.target.reset(); loadDashboard(); loadPublic(); }catch(err){toast(err.message);} }

function bind(){
  $("loginForm").addEventListener('submit',login); $("logoutBtn").addEventListener('click',logout); $("refreshPublicBtn").addEventListener('click',loadPublic); $("publicSearch").addEventListener('input',renderProgress); $("publicStageFilter").addEventListener('change',renderProgress); $("registerForm").addEventListener('submit',handleRegister); $("printReportBtn").addEventListener('click',()=>window.print());
  $("uploadForm").addEventListener('submit',handleUpload); $("submitReviewForm").addEventListener('submit',e=>simpleForm(e,'submitReview')); $("guidanceForm").addEventListener('submit',e=>simpleForm(e,'requestGuidance')); $("examForm").addEventListener('submit',e=>simpleForm(e,'requestExam')); $("lecturerStatusForm").addEventListener('submit',e=>simpleForm(e,'setLecturerStatus')); $("addStudentForm").addEventListener('submit',e=>simpleForm(e,'addStudent'));
  $("templateForm").addEventListener('submit',async e=>{ e.preventDefault(); const fd=new FormData(e.target); try{ const b64=await fileToBase64(fd.get('file')); await api('uploadTemplate',{category:fd.get('category'),title:fd.get('title'),description:fd.get('description'),file:b64}); toast('Template berhasil diunggah.'); e.target.reset(); loadDashboard(); loadPublic(); }catch(err){toast(err.message);} });
  if($("shareRequestForm")) $("shareRequestForm").addEventListener('submit',e=>simpleForm(e,'requestShareFile'));
  if($("approveShareForm")) $("approveShareForm").addEventListener('submit',e=>simpleForm(e,'approveShareReference'));
  if($("sharedSearch")) $("sharedSearch").addEventListener('input',()=>renderSharedReferences(cache.dashboard?.sharedReferences||[]));
  if($("sharedCategoryFilter")) $("sharedCategoryFilter").addEventListener('change',()=>renderSharedReferences(cache.dashboard?.sharedReferences||[]));
  $("reviewForm").addEventListener('submit',async e=>{ e.preventDefault(); const fd=new FormData(e.target); const reviewFile=fd.get('reviewFile'); const payload=Object.fromEntries(fd.entries()); delete payload.reviewFile; if(reviewFile && reviewFile.size) payload.reviewFile=await fileToBase64(reviewFile); try{ await api('reviewSubmission',payload); bootstrap.Modal.getInstance($("reviewModal"))?.hide(); toast('Review tersimpan.'); loadDashboard(); loadPublic(); }catch(err){toast(err.message);} });
  document.body.addEventListener('click', async ev=>{
    const detail=ev.target.closest('[data-student-detail]'); if(detail){ const id=detail.dataset.studentDetail; const s=(cache.dashboard?.students||[]).find(x=>x.studentId===id); $("studentDetailTitle").textContent=s?.name||'Detail Mahasiswa'; $("studentDetailBody").innerHTML=`<pre class="bg-light p-3 rounded">${esc(JSON.stringify(s,null,2))}</pre>`; bootstrap.Modal.getOrCreateInstance($("studentDetailModal")).show(); }
    const rev=ev.target.closest('[data-review-submission]'); if(rev){ const sub=(cache.dashboard?.submissions||[]).find(x=>x.submissionId===rev.dataset.reviewSubmission); $("reviewForm").submissionId.value=sub?.submissionId||''; $("reviewSubmissionInfo").innerHTML=`<b>${esc(sub?.studentName||'')}</b><br><a target="_blank" href="${esc(sub?.fileUrl||'#')}">${esc(sub?.fileName||'')}</a><div class="small-muted">Catatan mahasiswa: ${esc(sub?.studentNote||'-')}</div>`; bootstrap.Modal.getOrCreateInstance($("reviewModal")).show(); }
    const sh=ev.target.closest('[data-file-share]'); if(sh){ if($("studentShareFileSelect")) $("studentShareFileSelect").value=sh.dataset.fileShare; bootstrap.Modal.getOrCreateInstance($("shareRequestModal")).show(); }
    const ap=ev.target.closest('[data-approve-share]'); if(ap){ const f=(cache.dashboard?.shareRequests||[]).find(x=>x.fileId===ap.dataset.approveShare) || (cache.dashboard?.files||[]).find(x=>x.fileId===ap.dataset.approveShare); if(f){ const form=$("approveShareForm"); form.fileId.value=f.fileId; form.title.value=f.shareTitle||f.fileName; form.category.value=f.shareCategory||f.folderType||'Proposal'; form.topic.value=f.shareTopic||''; form.year.value=f.shareYear||new Date().getFullYear(); form.description.value=f.shareDescription||''; form.ownerDisplayMode.value=f.ownerDisplayMode||'Anonymous'; $("approveShareInfo").innerHTML=`<a target="_blank" href="${esc(f.fileUrl||'#')}">${esc(f.fileName)}</a><br>${badge(f.status||'')}`; bootstrap.Modal.getOrCreateInstance($("approveShareModal")).show(); } }
  });
}

bind(); loadPublic(); if(session) loadDashboard();
