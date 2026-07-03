/**
 * BimbingIn Backend - Google Apps Script
 * Frontend: GitHub Pages. Database: Google Sheets. Storage: Google Drive. Calendar: Google Calendar.
 * Isi CONFIG sebelum menjalankan setupBimbingIn().
 */
const CONFIG = {
  SPREADSHEET_ID: '1HR_ARbuPO3PYo22v9FT4A_27_2PJolBk',
  ROOT_FOLDER_ID: '1tf4PUNeXTjpe5E7BOZZIjp1p4ViU6R0F',
  CALENDAR_ID: 'primary',
  APP_NAME: 'BimbingIn',
  TIMEZONE: 'Asia/Makassar',
  MAX_SUPPORTING_FILE_MB: 100,
  PUBLIC_TEMPLATE_ACCESS: true
};

const SHEETS = {
  Users: ['userId','username','passwordHash','role','isAdmin','linkedId','name','email','status','mustChangePassword','createdAt','updatedAt'],
  Students: ['studentId','userId','name','nim','email','whatsapp','program','cohort','currentStage','progress','reviewStatus','studentStatus','thesisTitle','researchTopic','lecturerId','folderName','folderRootId','folderRootUrl','folderProposalId','folderHasilId','folderSkripsiId','folderArtikelId','folderPendukungId','folderLainnyaId','createdAt','updatedAt'],
  Lecturers: ['lecturerId','userId','name','nidn','email','whatsapp','program','department','expertise','guidanceTopics','officeRoom','consultationHours','onlineLink','note','createdAt','updatedAt'],
  LecturerStatus: ['lecturerId','name','availabilityStatus','consultationHours','offlineLocation','onlineLink','note','validUntil','updatedAt'],
  Files: ['fileId','studentId','folderType','driveFileId','fileName','fileUrl','mimeType','sizeBytes','status','locked','note','uploadedBy','uploadedAt','updatedAt'],
  Submissions: ['submissionId','studentId','folderType','fileId','driveFileId','fileName','fileUrl','version','status','studentNote','lecturerReview','reviewFileId','reviewFileUrl','reviewedBy','submittedAt','reviewedAt','updatedAt'],
  GuidanceRequests: ['requestId','studentId','lecturerId','mode','topic','preferredStart','preferredEnd','relatedFileId','status','calendarEventId','lecturerNote','createdAt','updatedAt'],
  ExamRequests: ['examRequestId','studentId','lecturerId','examType','preferredDateTime','finalSubmissionId','checklistStatus','status','lecturerNote','calendarEventId','createdAt','updatedAt'],
  Messages: ['messageId','senderId','receiverId','studentId','subject','message','status','createdAt','updatedAt'],
  Templates: ['templateId','category','title','description','driveFileId','fileName','fileUrl','version','status','uploadedBy','uploadedAt','updatedAt'],
  ActivityLog: ['logId','actorId','role','action','targetType','targetId','description','createdAt'],
  Settings: ['key','value','updatedAt']
};

function doGet(e){ return json({ok:true, app:CONFIG.APP_NAME, message:'BimbingIn API aktif. Gunakan POST dari frontend.'}); }
function doPost(e){
  try{
    const req = JSON.parse(e.postData.contents || '{}');
    const action = req.action;
    const publicActions = ['getPublicData','login','registerStudent'];
    let session = null;
    if (publicActions.indexOf(action) === -1) session = requireSession(req.token);
    const map = {
      getPublicData, login, registerStudent, getDashboard, saveProfile, uploadFile, listFiles, deleteFile,
      submitReview, reviewSubmission, requestGuidance, processGuidance, requestExam, processExam,
      sendMessage, addStudent, verifyStudent, setLecturerStatus, uploadTemplate
    };
    if(!map[action]) throw new Error('Action tidak dikenal: ' + action);
    return json(map[action](req, session));
  } catch(err){ return json({ok:false, message:err.message, stack:String(err.stack||'')}); }
}
function json(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function setupBimbingIn(){
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  Object.keys(SHEETS).forEach(name => ensureSheet(ss, name, SHEETS[name]));
  const root = DriveApp.getFolderById(CONFIG.ROOT_FOLDER_ID);
  const mahasiswaRoot = getOrCreateFolder(root, 'MAHASISWA');
  const templateRoot = getOrCreateFolder(root, 'TEMPLATE');
  ['Proposal','Seminar Hasil','Skripsi','Artikel Ilmiah','Administrasi'].forEach(n => getOrCreateFolder(templateRoot, n));
  setSetting('mahasiswaRootId', mahasiswaRoot.getId());
  setSetting('templateRootId', templateRoot.getId());

  const lecturerId = 'L-' + Utilities.getUuid();
  const lecturerUserId = 'U-' + Utilities.getUuid();
  if(!findRow('Users','username','dosen')){
    appendObj('Users',{userId:lecturerUserId,username:'dosen',passwordHash:hashPassword('dosen123'),role:'dosen',isAdmin:'TRUE',linkedId:lecturerId,name:'Dr. Mahardika Inra Takaendengan',email:'mahardika@unsrat.ac.id',status:'aktif',mustChangePassword:'FALSE',createdAt:now(),updatedAt:now()});
    appendObj('Lecturers',{lecturerId,userId:lecturerUserId,name:'Dr. Mahardika Inra Takaendengan',email:'mahardika@unsrat.ac.id',whatsapp:'081244000000',program:'S1 Sistem Informasi',department:'FMIPA/Program Studi',expertise:'Sistem Informasi, Rekayasa Perangkat Lunak, Data',guidanceTopics:'Sistem informasi, aplikasi web, data analytics',officeRoom:'Ruang Dosen',consultationHours:'Senin-Jumat 10.00-14.00',onlineLink:'',note:'Silakan ajukan jadwal melalui BimbingIn.',createdAt:now(),updatedAt:now()});
    appendObj('LecturerStatus',{lecturerId,name:'Dr. Mahardika Inra Takaendengan',availabilityStatus:'Available Online & Offline',consultationHours:'Senin-Jumat 10.00-14.00',offlineLocation:'Ruang Dosen',onlineLink:'',note:'Prioritas untuk mahasiswa yang sudah upload file review.',updatedAt:now()});
  }
  if(!findRow('Students','nim','202201001')){
    addStudent({student:{name:'Andi Setiawan',nim:'202201001',email:'andi@example.com',whatsapp:'081234567890',program:'S1 Sistem Informasi',cohort:'2022',thesisTitle:'Sistem Informasi Monitoring Skripsi',researchTopic:'Sistem Informasi',password:'mhs123'}}, {user:{userId:lecturerUserId,role:'dosen',linkedId:lecturerId,isAdmin:true}});
  }
  return {ok:true, message:'Setup BimbingIn selesai.'};
}
function ensureSheet(ss,name,headers){ let sh=ss.getSheetByName(name); if(!sh) sh=ss.insertSheet(name); const current=sh.getRange(1,1,1,Math.max(headers.length, sh.getLastColumn()||1)).getValues()[0]; if(current.filter(String).length===0){ sh.getRange(1,1,1,headers.length).setValues([headers]); sh.setFrozenRows(1); } return sh; }

function getPublicData(req){
  const students = getAll('Students').filter(s => s.studentStatus !== 'Ditolak').slice(-50).reverse();
  const lecturer = getAll('Lecturers')[0] || {};
  const lecturerStatus = getAll('LecturerStatus')[0] || {};
  const events = getCalendarEvents(30);
  const templates = getAll('Templates').filter(t => t.status === 'Aktif').slice(-20).reverse();
  const submissions = getAll('Submissions');
  const today = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd');
  return {ok:true, students, lecturer:Object.assign({}, lecturer, lecturerStatus), events, templates, newStudents:students.filter(s => /Menunggu|Diterima|Aktif/i.test(s.studentStatus||'')).slice(0,8), summary:{activeStudents:students.filter(s=>/Aktif|Siap|Lulus/i.test(s.studentStatus||'')).length, pendingReviews:submissions.filter(s=>/Menunggu/i.test(s.status||'')).length, todayGuidance:events.filter(e=>String(e.startTime).slice(0,10)===today && /BIMBINGAN/i.test(e.title)).length, examEvents:events.filter(e=>/UJIAN|SEMINAR/i.test(e.title)).length}};
}
function login(req){
  const row = findRow('Users','username',req.username);
  if(!row || row.status !== 'aktif') throw new Error('Username tidak ditemukan atau akun belum aktif.');
  if(row.passwordHash !== hashPassword(req.password)) throw new Error('Password salah.');
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put('token:' + token, JSON.stringify({userId:row.userId, role:row.role, isAdmin:String(row.isAdmin)==='TRUE', linkedId:row.linkedId, name:row.name, email:row.email}), 21600);
  return {ok:true, token, user:{userId:row.userId, role:row.role, isAdmin:String(row.isAdmin)==='TRUE', linkedId:row.linkedId, name:row.name, email:row.email, mustChangePassword:row.mustChangePassword}};
}
function requireSession(token){ if(!token) throw new Error('Sesi tidak valid. Silakan login.'); const raw=CacheService.getScriptCache().get('token:' + token); if(!raw) throw new Error('Sesi habis. Silakan login ulang.'); return {user:JSON.parse(raw)}; }

function registerStudent(req){
  const s = req.student || {};
  if(!s.name || !s.nim || !s.email || !s.password) throw new Error('Nama, NIM, email, dan password wajib diisi.');
  if(findRow('Students','nim',s.nim) || findRow('Users','username',s.nim)) throw new Error('NIM sudah terdaftar.');
  const studentId = 'S-' + Utilities.getUuid();
  const userId = 'U-' + Utilities.getUuid();
  appendObj('Users',{userId,username:s.nim,passwordHash:hashPassword(s.password),role:'mahasiswa',isAdmin:'FALSE',linkedId:studentId,name:s.name,email:s.email,status:'pending',mustChangePassword:'FALSE',createdAt:now(),updatedAt:now()});
  appendObj('Students',{studentId,userId,name:s.name,nim:s.nim,email:s.email,whatsapp:s.whatsapp,program:s.program,cohort:s.cohort,currentStage:'Proposal',progress:0,reviewStatus:'Belum Upload',studentStatus:'Menunggu Verifikasi',thesisTitle:s.thesisTitle,researchTopic:s.researchTopic,createdAt:now(),updatedAt:now()});
  logActivity(userId,'mahasiswa','registerStudent','Students',studentId,'Mahasiswa mendaftar sebagai bimbingan baru.');
  return {ok:true, message:'Pendaftaran berhasil. Tunggu verifikasi dosen.'};
}
function addStudent(req, session){
  assertDosen(session);
  const s=req.student || req;
  if(!s.name || !s.nim || !s.email) throw new Error('Nama, NIM, dan email wajib diisi.');
  if(findRow('Students','nim',s.nim) || findRow('Users','username',s.nim)) throw new Error('NIM sudah terdaftar.');
  const lecturerId=session.user.linkedId;
  const ids=createStudentFolders(s.nim, s.name);
  const studentId='S-' + Utilities.getUuid(), userId='U-' + Utilities.getUuid();
  appendObj('Users',{userId,username:s.nim,passwordHash:hashPassword(s.password || 'mhs123'),role:'mahasiswa',isAdmin:'FALSE',linkedId:studentId,name:s.name,email:s.email,status:'aktif',mustChangePassword:'TRUE',createdAt:now(),updatedAt:now()});
  appendObj('Students',Object.assign({studentId,userId,name:s.name,nim:s.nim,email:s.email,whatsapp:s.whatsapp,program:s.program||'S1 Sistem Informasi',cohort:s.cohort,currentStage:'Proposal',progress:0,reviewStatus:'Belum Upload',studentStatus:'Aktif Bimbingan',thesisTitle:s.thesisTitle,researchTopic:s.researchTopic,lecturerId,createdAt:now(),updatedAt:now()}, ids));
  logActivity(session.user.userId,'dosen','addStudent','Students',studentId,'Dosen menambahkan mahasiswa dan membuat folder Drive.');
  return {ok:true, message:'Mahasiswa berhasil dibuat.', username:s.nim, initialPassword:s.password || 'mhs123', folderUrl:ids.folderRootUrl};
}
function verifyStudent(req, session){
  assertDosen(session);
  const s=findRow('Students','studentId',req.studentId); if(!s) throw new Error('Mahasiswa tidak ditemukan.');
  let patch={studentStatus:req.status || 'Aktif Bimbingan', lecturerId:session.user.linkedId, updatedAt:now()};
  if((req.status||'').match(/Aktif|Diterima/i) && !s.folderRootId){ patch=Object.assign(patch, createStudentFolders(s.nim, s.name)); updateRowByKey('Users','userId',s.userId,{status:'aktif',updatedAt:now()}); }
  updateRowByKey('Students','studentId',req.studentId,patch);
  return {ok:true, message:'Status mahasiswa diperbarui.'};
}
function createStudentFolders(nim, name){
  const root = DriveApp.getFolderById(getSetting('mahasiswaRootId') || CONFIG.ROOT_FOLDER_ID);
  const folderName = safeName(nim + '_' + name);
  const main = getOrCreateFolder(root, folderName);
  const props = {folderName, folderRootId:main.getId(), folderRootUrl:main.getUrl()};
  props.folderProposalId = getOrCreateFolder(main,'Proposal').getId();
  props.folderHasilId = getOrCreateFolder(main,'Seminar Hasil').getId();
  props.folderSkripsiId = getOrCreateFolder(main,'Skripsi').getId();
  props.folderArtikelId = getOrCreateFolder(main,'Artikel Ilmiah').getId();
  props.folderPendukungId = getOrCreateFolder(main,'Data Pendukung').getId();
  props.folderLainnyaId = getOrCreateFolder(main,'Data Lainnya').getId();
  return props;
}

function getDashboard(req, session){
  if(session.user.role === 'dosen'){
    const lecturer = findRow('Lecturers','lecturerId',session.user.linkedId) || {};
    const lecturerStatus = findRow('LecturerStatus','lecturerId',session.user.linkedId) || {};
    return {ok:true, user:session.user, lecturer:Object.assign({}, lecturer, lecturerStatus), students:getAll('Students').filter(s => !s.lecturerId || s.lecturerId === session.user.linkedId), files:getAll('Files'), submissions:hydrateSubmissions(getAll('Submissions')), guidanceRequests:getAll('GuidanceRequests').filter(x=>/Diajukan|Menunggu/i.test(x.status||'')), examRequests:getAll('ExamRequests').filter(x=>/Diajukan|Menunggu/i.test(x.status||''))};
  }
  const student = findRow('Students','studentId',session.user.linkedId); if(!student) throw new Error('Data mahasiswa tidak ditemukan.');
  const lecturer = findRow('Lecturers','lecturerId',student.lecturerId) || getAll('Lecturers')[0] || {};
  return {ok:true, user:session.user, student, lecturer, files:getAll('Files').filter(f=>f.studentId===student.studentId), submissions:getAll('Submissions').filter(s=>s.studentId===student.studentId).reverse(), guidanceRequests:getAll('GuidanceRequests').filter(x=>x.studentId===student.studentId), examRequests:getAll('ExamRequests').filter(x=>x.studentId===student.studentId)};
}
function hydrateSubmissions(rows){ const students=getAll('Students'); return rows.map(r=>{ const s=students.find(x=>x.studentId===r.studentId)||{}; r.studentName=s.name; r.nim=s.nim; return r; }).reverse(); }

function uploadFile(req, session){
  const student = getStudentForUpload(req, session);
  const f = req.file; if(!f || !f.data || !f.name) throw new Error('File tidak valid.');
  validateFile(req.folderType, f);
  const folderId = folderIdByType(student, req.folderType);
  if(!folderId) throw new Error('Folder tujuan belum tersedia.');
  const ext = getExt(f.name);
  const fileName = buildUploadName(req.folderType, student.nim, f.name);
  const blob = Utilities.newBlob(Utilities.base64Decode(f.data), f.mimeType || MimeType.PLAIN_TEXT, fileName);
  const file = DriveApp.getFolderById(folderId).createFile(blob);
  const id='F-' + Utilities.getUuid();
  appendObj('Files',{fileId:id,studentId:student.studentId,folderType:req.folderType,driveFileId:file.getId(),fileName:file.getName(),fileUrl:file.getUrl(),mimeType:f.mimeType,sizeBytes:blob.getBytes().length,status:'Aktif',locked:'FALSE',note:req.note,uploadedBy:session.user.userId,uploadedAt:now(),updatedAt:now()});
  updateRowByKey('Students','studentId',student.studentId,{reviewStatus:'Draft',updatedAt:now()});
  logActivity(session.user.userId,session.user.role,'uploadFile','Files',id,'Upload file ' + file.getName());
  return {ok:true, fileId:id, fileUrl:file.getUrl(), fileName:file.getName()};
}
function getStudentForUpload(req, session){ if(session.user.role==='mahasiswa') return findRow('Students','studentId',session.user.linkedId); assertDosen(session); return findRow('Students','studentId',req.studentId); }
function folderIdByType(s,type){ return ({'Proposal':s.folderProposalId,'Seminar Hasil':s.folderHasilId,'Skripsi':s.folderSkripsiId,'Artikel Ilmiah':s.folderArtikelId,'Data Pendukung':s.folderPendukungId,'Data Lainnya':s.folderLainnyaId})[type]; }
function validateFile(type, f){
  const ext=getExt(f.name).toLowerCase();
  const core=['doc','docx','ppt','pptx','pdf'];
  if(['Proposal','Seminar Hasil','Skripsi','Artikel Ilmiah'].indexOf(type)>=0 && core.indexOf(ext)<0) throw new Error('Folder '+type+' hanya menerima doc, docx, ppt, pptx, atau pdf.');
  if(['Data Pendukung','Data Lainnya'].indexOf(type)>=0){ const approx = Utilities.base64Decode(f.data).length; if(approx > CONFIG.MAX_SUPPORTING_FILE_MB*1024*1024) throw new Error('File maksimal '+CONFIG.MAX_SUPPORTING_FILE_MB+' MB.'); }
}
function buildUploadName(type,nim,original){ const ext=getExt(original); const stamp=Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyMMdd-HHmmss'); const prefix=({'Proposal':'Proposal','Seminar Hasil':'Hasil','Skripsi':'Skripsi','Artikel Ilmiah':'Artikel','Data Pendukung':'DataPendukung','Data Lainnya':'DataLainnya'})[type] || 'File'; return prefix + '_' + nim + '_' + stamp + (ext?'.'+ext:''); }
function listFiles(req, session){ const studentId=session.user.role==='mahasiswa'?session.user.linkedId:req.studentId; return {ok:true, files:getAll('Files').filter(f=>f.studentId===studentId)}; }
function deleteFile(req, session){ const f=findRow('Files','fileId',req.fileId); if(!f) throw new Error('File tidak ditemukan.'); if(session.user.role==='mahasiswa' && f.studentId!==session.user.linkedId) throw new Error('Tidak boleh menghapus file mahasiswa lain.'); if(String(f.locked)==='TRUE' || /Review|Final|Disetujui/i.test(f.status)) throw new Error('File sudah dikunci atau diajukan review.'); DriveApp.getFileById(f.driveFileId).setTrashed(true); updateRowByKey('Files','fileId',req.fileId,{status:'Dihapus',updatedAt:now()}); return {ok:true, message:'File dipindahkan ke Trash.'}; }

function submitReview(req, session){
  if(session.user.role !== 'mahasiswa') throw new Error('Hanya mahasiswa yang dapat mengajukan review.');
  const f=findRow('Files','fileId',req.fileId); if(!f || f.studentId!==session.user.linkedId) throw new Error('File tidak valid.');
  const version = getAll('Submissions').filter(s=>s.studentId===f.studentId && s.folderType===f.folderType).length + 1;
  const id='SUB-' + Utilities.getUuid();
  appendObj('Submissions',{submissionId:id,studentId:f.studentId,folderType:f.folderType,fileId:f.fileId,driveFileId:f.driveFileId,fileName:f.fileName,fileUrl:f.fileUrl,version,status:'Menunggu Review',studentNote:req.studentNote,submittedAt:now(),updatedAt:now()});
  updateRowByKey('Files','fileId',f.fileId,{status:'Diajukan Review',locked:'TRUE',updatedAt:now()});
  updateRowByKey('Students','studentId',f.studentId,{reviewStatus:'Menunggu Review',updatedAt:now()});
  return {ok:true, message:'File diajukan untuk review.'};
}
function reviewSubmission(req, session){
  assertDosen(session);
  const sub=findRow('Submissions','submissionId',req.submissionId); if(!sub) throw new Error('Submission tidak ditemukan.');
  let reviewFileId='', reviewFileUrl='';
  if(req.reviewFile && req.reviewFile.data){
    const student=findRow('Students','studentId',sub.studentId); const folderId=folderIdByType(student, sub.folderType);
    const name='Review_' + buildUploadName(sub.folderType, student.nim, req.reviewFile.name);
    const blob=Utilities.newBlob(Utilities.base64Decode(req.reviewFile.data), req.reviewFile.mimeType || MimeType.PLAIN_TEXT, name);
    const file=DriveApp.getFolderById(folderId).createFile(blob); reviewFileId=file.getId(); reviewFileUrl=file.getUrl();
  }
  updateRowByKey('Submissions','submissionId',req.submissionId,{status:req.status,lecturerReview:req.lecturerReview,reviewFileId,reviewFileUrl,reviewedBy:session.user.userId,reviewedAt:now(),updatedAt:now()});
  updateRowByKey('Students','studentId',sub.studentId,{reviewStatus:req.status,progress:progressByStatus(req.status, sub.folderType),updatedAt:now()});
  if(/Disetujui|Final/i.test(req.status)) updateRowByKey('Files','fileId',sub.fileId,{status:req.status,locked:'TRUE',updatedAt:now()});
  return {ok:true, message:'Review berhasil disimpan.'};
}
function progressByStatus(status,type){ const base=({'Proposal':30,'Seminar Hasil':65,'Skripsi':88,'Artikel Ilmiah':80})[type]||20; if(/Disetujui|Final/i.test(status)) return Math.min(100,base+10); if(/Revisi/i.test(status)) return base; return Math.max(5,base-10); }

function requestGuidance(req, session){ if(session.user.role!=='mahasiswa') throw new Error('Hanya mahasiswa.'); const s=findRow('Students','studentId',session.user.linkedId); const start=new Date(req.preferredStart); const end=new Date(start.getTime()+45*60000); const id='G-' + Utilities.getUuid(); appendObj('GuidanceRequests',{requestId:id,studentId:s.studentId,lecturerId:s.lecturerId,mode:req.mode,topic:req.topic,preferredStart:start.toISOString(),preferredEnd:end.toISOString(),relatedFileId:req.relatedFileId,status:'Diajukan',createdAt:now(),updatedAt:now()}); return {ok:true,message:'Pengajuan bimbingan dikirim.'}; }
function processGuidance(req, session){ assertDosen(session); const gr=findRow('GuidanceRequests','requestId',req.requestId); if(!gr) throw new Error('Pengajuan tidak ditemukan.'); let eventId=gr.calendarEventId; if(/Setujui|Disetujui/i.test(req.status)){ const s=findRow('Students','studentId',gr.studentId); eventId=createCalendarEvent(`[BIMBINGAN-${gr.mode}] ${s.name} - ${s.nim} - ${gr.topic}`, gr.preferredStart, gr.preferredEnd, req.location || gr.mode, req.note || ''); } updateRowByKey('GuidanceRequests','requestId',req.requestId,{status:req.status,calendarEventId:eventId,lecturerNote:req.note,updatedAt:now()}); return {ok:true,message:'Pengajuan bimbingan diproses.'}; }
function requestExam(req, session){ if(session.user.role!=='mahasiswa') throw new Error('Hanya mahasiswa.'); const s=findRow('Students','studentId',session.user.linkedId); const id='EX-' + Utilities.getUuid(); appendObj('ExamRequests',{examRequestId:id,studentId:s.studentId,lecturerId:s.lecturerId,examType:req.examType,preferredDateTime:req.preferredDateTime,checklistStatus:'Belum Dicek',status:'Diajukan',lecturerNote:req.note,createdAt:now(),updatedAt:now()}); return {ok:true,message:'Pengajuan sidang dikirim.'}; }
function processExam(req, session){ assertDosen(session); const er=findRow('ExamRequests','examRequestId',req.examRequestId); if(!er) throw new Error('Pengajuan sidang tidak ditemukan.'); let eventId=er.calendarEventId; if(/Setujui|Disetujui|Terjadwal/i.test(req.status)){ const s=findRow('Students','studentId',er.studentId); const start=new Date(er.preferredDateTime); const end=new Date(start.getTime()+120*60000); const prefix=er.examType==='Proposal'?'[UJIAN-PROPOSAL]':er.examType==='Seminar Hasil'?'[SEMINAR-HASIL]':'[UJIAN-SKRIPSI]'; eventId=createCalendarEvent(`${prefix} ${s.name} - ${s.nim}`, start, end, req.location||'Ruang Sidang', req.note||''); }
  updateRowByKey('ExamRequests','examRequestId',req.examRequestId,{status:req.status,calendarEventId:eventId,lecturerNote:req.note,checklistStatus:req.checklistStatus||'Dicek',updatedAt:now()}); return {ok:true,message:'Pengajuan sidang diproses.'}; }
function createCalendarEvent(title,start,end,location,description){ const cal=CalendarApp.getCalendarById(CONFIG.CALENDAR_ID); const ev=cal.createEvent(title,new Date(start),new Date(end),{location,description}); return ev.getId(); }
function getCalendarEvents(days){ try{ const cal=CalendarApp.getCalendarById(CONFIG.CALENDAR_ID); const start=new Date(); const end=new Date(start.getTime()+days*86400000); return cal.getEvents(start,end).filter(e=>/BIMBINGAN|UJIAN|SEMINAR/i.test(e.getTitle())).map(e=>({eventId:e.getId(),title:e.getTitle(),startTime:e.getStartTime().toISOString(),endTime:e.getEndTime().toISOString(),location:e.getLocation(),mode:/ONLINE/i.test(e.getTitle())?'Online':/OFFLINE/i.test(e.getTitle())?'Offline':''})); } catch(e){ return []; } }

function sendMessage(req, session){ const id='M-' + Utilities.getUuid(); appendObj('Messages',{messageId:id,senderId:session.user.userId,receiverId:req.receiverId,studentId:req.studentId,subject:req.subject,message:req.message,status:'Terkirim',createdAt:now(),updatedAt:now()}); return {ok:true,message:'Pesan terkirim.'}; }
function setLecturerStatus(req, session){ assertDosen(session); const existing=findRow('LecturerStatus','lecturerId',session.user.linkedId); const obj={lecturerId:session.user.linkedId,name:session.user.name,availabilityStatus:req.availabilityStatus,consultationHours:req.consultationHours,offlineLocation:req.offlineLocation,onlineLink:req.onlineLink,note:req.note,validUntil:req.validUntil,updatedAt:now()}; if(existing) updateRowByKey('LecturerStatus','lecturerId',session.user.linkedId,obj); else appendObj('LecturerStatus',obj); return {ok:true,message:'Status dosen diperbarui.'}; }
function uploadTemplate(req, session){ assertDosen(session); const f=req.file; validateTemplateFile(f); const root=DriveApp.getFolderById(getSetting('templateRootId') || CONFIG.ROOT_FOLDER_ID); const folder=getOrCreateFolder(root, req.category || 'Administrasi'); const ext=getExt(f.name); const stamp=Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyMMdd-HHmmss'); const name=safeName('Template_' + (req.category||'Administrasi') + '_' + stamp + (ext?'.'+ext:'')); const blob=Utilities.newBlob(Utilities.base64Decode(f.data), f.mimeType||MimeType.PLAIN_TEXT, name); const file=folder.createFile(blob); if(CONFIG.PUBLIC_TEMPLATE_ACCESS) file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); const id='T-' + Utilities.getUuid(); appendObj('Templates',{templateId:id,category:req.category,title:req.title,description:req.description,driveFileId:file.getId(),fileName:file.getName(),fileUrl:file.getUrl(),version:req.version||'v1.0',status:'Aktif',uploadedBy:session.user.userId,uploadedAt:now(),updatedAt:now()}); return {ok:true,message:'Template berhasil diupload.',fileUrl:file.getUrl()}; }
function validateTemplateFile(f){ if(!f || !f.data) throw new Error('File template tidak valid.'); const ext=getExt(f.name).toLowerCase(); if(['doc','docx','ppt','pptx','pdf','xls','xlsx'].indexOf(ext)<0) throw new Error('Template hanya menerima doc, docx, ppt, pptx, pdf, xls, atau xlsx.'); }

function assertDosen(session){ if(!session || session.user.role!=='dosen') throw new Error('Akses dosen/admin diperlukan.'); }
function ss(){ return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID); }
function sheet(name){ return ss().getSheetByName(name); }
function getAll(name){ const sh=sheet(name); if(!sh || sh.getLastRow()<2) return []; const vals=sh.getDataRange().getValues(); const headers=vals.shift(); return vals.filter(r=>r.join('')!=='').map(r=>{ const o={}; headers.forEach((h,i)=>o[h]=r[i]); return o; }); }
function appendObj(name,obj){ const sh=sheet(name); const headers=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0]; sh.appendRow(headers.map(h=>obj[h]!==undefined?obj[h]:'')); }
function findRow(name,key,value){ return getAll(name).find(r=>String(r[key])===String(value)); }
function updateRowByKey(name,key,value,patch){ const sh=sheet(name); const vals=sh.getDataRange().getValues(); const headers=vals[0]; const keyIdx=headers.indexOf(key); for(let r=1;r<vals.length;r++){ if(String(vals[r][keyIdx])===String(value)){ Object.keys(patch).forEach(k=>{ const i=headers.indexOf(k); if(i>=0) sh.getRange(r+1,i+1).setValue(patch[k]); }); return true; } } return false; }
function getOrCreateFolder(parent,name){ const it=parent.getFoldersByName(name); return it.hasNext()?it.next():parent.createFolder(name); }
function getExt(name){ const m=String(name).match(/\.([^.]+)$/); return m?m[1]:''; }
function safeName(s){ return String(s).trim().replace(/\s+/g,'_').replace(/[\\/:*?"<>|#%{}~&]/g,'_').toUpperCase(); }
function now(){ return new Date().toISOString(); }
function hashPassword(p){ return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(p))); }
function setSetting(key,value){ const old=findRow('Settings','key',key); old?updateRowByKey('Settings','key',key,{value,updatedAt:now()}):appendObj('Settings',{key,value,updatedAt:now()}); }
function getSetting(key){ const r=findRow('Settings','key',key); return r?r.value:''; }
function logActivity(actorId,role,action,targetType,targetId,description){ appendObj('ActivityLog',{logId:'LOG-' + Utilities.getUuid(),actorId,role,action,targetType,targetId,description,createdAt:now()}); }
