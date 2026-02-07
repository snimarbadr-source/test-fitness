let gymWatermark = null;

// ---- Tests order (as requested) ----
const TESTS = [
  "تمرين الجري",
  "تمرين الباي دمبل",
  "تمرين الصدر بار",
  "تمرين اكتاف",
  "تمرين الضغط",
  "تمرين بوكسينق",
  "تمرين الباي بار",
  "تمرين الجلوس",
  "تمرين الصدر دمبل",
  "تمرين رفع الى اعلى"
];

const state = {
  name: "",
  testNo: "",
  nid: "",
  doctorName: "د. سنمار بدر",
  doctorExtras: [],          // up to 3
  doctorPrinted: "",
  doctorSigMode: "none",     // none | typed | upload
  doctorSigTyped: "",
  doctorSigScale: 1.0,
  doctorSigImage: null,
  doctorSigDataUrl: null,
  tests: TESTS.map(() => 0),
};

// ---- DOM ----
const $ = (id) => document.getElementById(id);
const canvas = $("report");
const ctx = canvas.getContext("2d");

const inputs = {
  name: $("name"),
  testNo: $("testNo"),
  nid: $("nid"),
  doctorName: $("doctorName"),
  doctorPrinted: $("doctorPrinted"),
  doctorSigMode: $("doctorSigMode"),
  doctorSigTyped: $("doctorSigTyped"),
  doctorSigUpload: $("doctorSigUpload"),
  doctorDrop: $("doctorDrop"),
  doctorDropMeta: $("doctorDropMeta"),
  doctorSigTypedWrap: $("doctorSigTypedWrap"),
  doctorSigUploadWrap: $("doctorSigUploadWrap"),
  doctorExtrasWrap: $("doctorExtras"),
  addDoctorExtra: $("addDoctorExtra"),

  // Doctor modal
  doctorBtn: $("doctorBtn"),
  doctorPanelBtn: $("doctorPanelBtn"),
  doctorModal: $("doctorModal"),
  doctorBackdrop: $("doctorBackdrop"),
  doctorClose: $("doctorClose"),
  doctorCancel: $("doctorCancel"),
  doctorSave: $("doctorSave"),
  doctorNameM: $("doctorNameM"),
  doctorExtrasM: $("doctorExtrasM"),
  addDoctorExtraM: $("addDoctorExtraM"),
  doctorPrintedM: $("doctorPrintedM"),
  doctorSigModeM: $("doctorSigModeM"),
  doctorSigTypedWrapM: $("doctorSigTypedWrapM"),
  doctorSigTypedM: $("doctorSigTypedM"),
  doctorSigUploadWrapM: $("doctorSigUploadWrapM"),
  doctorSigUploadM: $("doctorSigUploadM"),
  doctorDropM: $("doctorDropM"),
  doctorDropMetaM: $("doctorDropMetaM"),
  doctorSigScaleWrapM: $("doctorSigScaleWrapM"),
  doctorSigScaleM: $("doctorSigScaleM"),
  doctorSigScaleValM: $("doctorSigScaleValM"),
};

// Intro
window.addEventListener("DOMContentLoaded", () => {
  const intro = $("intro");
  const skipBtn = $("skipIntro");
  function hideIntro(){
    if(!intro) return;
    intro.style.display = "none";
    intro.setAttribute("aria-hidden","true");
  }
  if(skipBtn) skipBtn.addEventListener("click", hideIntro);
  setTimeout(hideIntro, 4000);
});

// Buttons
$("downloadBtn")?.addEventListener("click", downloadPNG);
$("copyBtn").addEventListener("click", copyToClipboard);
$("copyMsgBtn").addEventListener("click", copyDiscordMessage);
$("printBtn")?.addEventListener("click", printPDF);

// ---- Helpers ----
function loadImage(src){
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}


function readFileAsDataURL(file){
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result));
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}
// ---- Assets ----
let IMG_EMS=null, IMG_EMBLEM=null, IMG_RESP_SIG=null;
async function loadAssets(){
  try { gymWatermark = await loadImage("assets/gym-watermark.png"); } catch(e){}
  try { IMG_EMS = await loadImage("assets/ems.webp"); } catch(e){}
  try { IMG_EMBLEM = await loadImage("assets/emblem.png"); }
  catch(e){
    try { IMG_EMBLEM = await loadImage("assets/emblem_alt.webp"); } catch(e2){}
  }
  try { IMG_RESP_SIG = await loadImage("assets/responsible-signature.png"); } catch(e){}
}

// ---- Tests UI ----
const testsList = $("testsList");
function makeTestRow(i, name){
  const wrap = document.createElement("div");
  wrap.className = "testRow";

  const top = document.createElement("div");
  top.className = "testTop";

  const n = document.createElement("div");
  n.className = "testName";
  n.textContent = name;

  const pct = document.createElement("div");
  pct.className = "testPct";
  pct.id = `pct_${i}`;
  pct.textContent = `${state.tests[i]}%`;

  top.appendChild(n);
  top.appendChild(pct);

  const ctl = document.createElement("div");
  ctl.className = "testCtl";

  const range = document.createElement("input");
  range.type = "range";
  range.min = "0";
  range.max = "100";
  range.value = String(state.tests[i]);
  range.addEventListener("input", () => {
    state.tests[i] = Number(range.value);
    pct.textContent = `${state.tests[i]}%`;
    save();
  });

  const btn = document.createElement("button");
  btn.className = "btn testBtn";
  btn.type = "button";
  btn.textContent = "100%";
  btn.addEventListener("click", () => {
    state.tests[i] = 100;
    range.value = "100";
    pct.textContent = "100%";
    save();
  });

  ctl.appendChild(range);
  ctl.appendChild(btn);

  wrap.appendChild(top);
  wrap.appendChild(ctl);

  return wrap;
}

function mountTests(){
  testsList.innerHTML = "";
  TESTS.forEach((t, i) => testsList.appendChild(makeTestRow(i, t)));
}

// ---- Doctor Extras UI (max 3) ----
function renderDoctorExtras(){
  inputs.doctorExtrasWrap.innerHTML = "";
  state.doctorExtras.forEach((val, idx) => {
    const row = document.createElement("div");
    row.className = "extraRow";

    const inp = document.createElement("input");
    inp.type = "text";
    inp.value = val;
    inp.placeholder = `طبيب إضافي ${idx+1}`;
    inp.addEventListener("input", () => {
      state.doctorExtras[idx] = inp.value;
      save();
    });

    const del = document.createElement("button");
    del.type = "button";
    del.className = "btn";
    del.textContent = "حذف";
    del.addEventListener("click", () => {
      state.doctorExtras.splice(idx, 1);
      renderDoctorExtras();
      save();
    });

    row.appendChild(inp);
    row.appendChild(del);
    inputs.doctorExtrasWrap.appendChild(row);
  });

  inputs.addDoctorExtra.disabled = state.doctorExtras.length >= 3;
  inputs.addDoctorExtra.style.opacity = state.doctorExtras.length >= 3 ? 0.5 : 1;
}

inputs.addDoctorExtra.addEventListener("click", () => {
  if(state.doctorExtras.length >= 3) return;
  state.doctorExtras.push("");
  renderDoctorExtras();
  save();
});

// ---- Persist ----
function save(){
  const payload = {
    name: state.name,
    testNo: state.testNo,
    nid: state.nid,
    doctorName: state.doctorName,
    doctorExtras: state.doctorExtras,
    doctorPrinted: state.doctorPrinted,
    doctorSigMode: state.doctorSigMode,
    doctorSigTyped: state.doctorSigTyped,
    doctorSigScale: state.doctorSigScale,
    doctorSigDataUrl: state.doctorSigDataUrl,
    tests: state.tests,
  };
  localStorage.setItem("fitness_v7_state", JSON.stringify(payload));
  render(performance.now());
}

function restore(){
  mountTests();
  const raw = localStorage.getItem("fitness_v7_state");
  if(raw){
    try{
      const p = JSON.parse(raw);
      Object.assign(state, p);
      if(typeof state.doctorSigScale !== "number") state.doctorSigScale = 1.0;
      if(!Array.isArray(state.doctorExtras)) state.doctorExtras = [];
      state.doctorExtras = state.doctorExtras.slice(0,3);
    }catch(e){}
  }
  inputs.name.value = state.name;
  inputs.testNo.value = state.testNo;
  inputs.nid.value = state.nid;
  inputs.doctorName.value = state.doctorName;
  inputs.doctorPrinted.value = state.doctorPrinted;
  inputs.doctorSigMode.value = state.doctorSigMode;
  inputs.doctorSigTyped.value = state.doctorSigTyped || "";
  toggleDoctorSigUI();
  renderDoctorExtras();
  if(state.doctorSigDataUrl){
    if(inputs.doctorDropMeta) inputs.doctorDropMeta.textContent = "تم اختيار صورة توقيع ✅";
    loadImage(state.doctorSigDataUrl).then(img=>{ state.doctorSigImage = img; render(performance.now()); }).catch(()=>{});
  }

  // update tests UI
  TESTS.forEach((_, i) => {
    const pct = document.getElementById(`pct_${i}`);
    if(pct) pct.textContent = `${state.tests[i]}%`;
    const row = testsList.children[i];
    if(row){
      const range = row.querySelector('input[type="range"]');
      if(range) range.value = String(state.tests[i]);
    }
  });

  render(performance.now());
}

function setupDropZone(dropEl, fileInputEl, metaEl, onFile){
  if(!dropEl || !fileInputEl) return;
  const openPicker = () => fileInputEl.click();
  dropEl.addEventListener("click", openPicker);
  dropEl.addEventListener("keydown", (e)=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); openPicker(); } });
  const prevent = (e)=>{ e.preventDefault(); e.stopPropagation(); };
  ["dragenter","dragover","dragleave","drop"].forEach(ev => dropEl.addEventListener(ev, prevent));
  dropEl.addEventListener("drop", async (e)=>{
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if(!f) return;
    if(metaEl) metaEl.textContent = "جارٍ تحميل الصورة...";
    await onFile(f);
  });
}

function toggleDoctorSigUI(){
  inputs.doctorSigTypedWrap.style.display = (state.doctorSigMode === "typed") ? "" : "none";
  inputs.doctorSigUploadWrap.style.display = (state.doctorSigMode === "upload") ? "" : "none";
  if(inputs.doctorDrop) inputs.doctorDrop.style.display = (state.doctorSigMode === "upload") ? "" : "none";
}

function toggleDoctorSigUIM(){
  if(!inputs.doctorSigModeM) return;
  const m = inputs.doctorSigModeM.value;
  inputs.doctorSigTypedWrapM.style.display = (m === "typed") ? "" : "none";
  inputs.doctorSigUploadWrapM.style.display = (m === "upload") ? "" : "none";
  if(inputs.doctorSigScaleWrapM) inputs.doctorSigScaleWrapM.style.display = (m === "typed" || m === "upload") ? "" : "none";
}

function closeDoctorModal(){
  if(!inputs.doctorModal) return;
  inputs.doctorModal.style.display = "none";
  inputs.doctorModal.setAttribute("aria-hidden","true");
  // If user closed without saving, restore original scale
  if(doctorDraft && typeof doctorDraft.initialSigScale === "number"){
    state.doctorSigScale = doctorDraft.initialSigScale;
    render(performance.now());
  }
  doctorDraft = null;
}

let doctorDraft = null;

function openDoctorModal(){
  if(!inputs.doctorModal) return;

  doctorDraft = {
    doctorName: state.doctorName || "",
    doctorPrinted: state.doctorPrinted || "",
    doctorExtras: (Array.isArray(state.doctorExtras) ? state.doctorExtras.slice(0,3) : []),
    doctorSigMode: state.doctorSigMode || "none",
    doctorSigTyped: state.doctorSigTyped || "",
    doctorSigScale: (typeof state.doctorSigScale === "number" ? state.doctorSigScale : 1.0),
    doctorSigDataUrl: state.doctorSigDataUrl || null,
  };

  inputs.doctorNameM.value = doctorDraft.doctorName;
  inputs.doctorPrintedM.value = doctorDraft.doctorPrinted;
  inputs.doctorSigModeM.value = doctorDraft.doctorSigMode;
  inputs.doctorSigTypedM.value = doctorDraft.doctorSigTyped;
  if(inputs.doctorDropMetaM) inputs.doctorDropMetaM.textContent = doctorDraft.doctorSigDataUrl ? "تم اختيار صورة توقيع ✅" : "";
  renderDoctorExtrasModal();
  toggleDoctorSigUIM();

  inputs.doctorModal.style.display = "";
  inputs.doctorModal.setAttribute("aria-hidden","false");
}

function renderDoctorExtrasModal(){
  if(!inputs.doctorExtrasM || !doctorDraft) return;
  inputs.doctorExtrasM.innerHTML = "";
  doctorDraft.doctorExtras = Array.isArray(doctorDraft.doctorExtras) ? doctorDraft.doctorExtras.slice(0,3) : [];

  doctorDraft.doctorExtras.forEach((val, idx) => {
    const row = document.createElement("div");
    row.className = "extraRow";

    const inp = document.createElement("input");
    inp.type = "text";
    inp.value = val || "";
    inp.placeholder = `طبيب إضافي ${idx+1}`;
    inp.addEventListener("input", () => {
      doctorDraft.doctorExtras[idx] = inp.value;
    });

    const del = document.createElement("button");
    del.type = "button";
    del.className = "btn";
    del.textContent = "حذف";
    del.addEventListener("click", () => {
      doctorDraft.doctorExtras.splice(idx, 1);
      renderDoctorExtrasModal();
    });

    row.appendChild(inp);
    row.appendChild(del);
    inputs.doctorExtrasM.appendChild(row);
  });

  if(inputs.addDoctorExtraM){
    inputs.addDoctorExtraM.disabled = doctorDraft.doctorExtras.length >= 3;
    inputs.addDoctorExtraM.style.opacity = doctorDraft.doctorExtras.length >= 3 ? 0.5 : 1;
  }
}

inputs.addDoctorExtraM?.addEventListener("click", () => {
  if(!doctorDraft) return;
  if(!Array.isArray(doctorDraft.doctorExtras)) doctorDraft.doctorExtras = [];
  if(doctorDraft.doctorExtras.length >= 3) return;
  doctorDraft.doctorExtras.push("");
  renderDoctorExtrasModal();
});

// Open modal buttons
inputs.doctorBtn?.addEventListener("click", openDoctorModal);
inputs.doctorPanelBtn?.addEventListener("click", openDoctorModal);
inputs.doctorBackdrop?.addEventListener("click", closeDoctorModal);
inputs.doctorClose?.addEventListener("click", closeDoctorModal);
inputs.doctorCancel?.addEventListener("click", closeDoctorModal);

// Modal signature picker (click or drop)
setupDropZone(inputs.doctorDropM, inputs.doctorSigUploadM, inputs.doctorDropMetaM, async (file)=>{
  if(!doctorDraft) return;
  const dataUrl = await readFileAsDataURL(file);
  doctorDraft.doctorSigDataUrl = dataUrl;
  if(inputs.doctorDropMetaM) inputs.doctorDropMetaM.textContent = "تم اختيار صورة توقيع ✅";
});

inputs.doctorSigUploadM?.addEventListener("change", async (e)=>{
  const file = e.target.files && e.target.files[0];
  if(!file || !doctorDraft) return;
  const dataUrl = await readFileAsDataURL(file);
  doctorDraft.doctorSigDataUrl = dataUrl;
  if(inputs.doctorDropMetaM) inputs.doctorDropMetaM.textContent = "تم اختيار صورة توقيع ✅";
});

inputs.doctorSigModeM?.addEventListener("change", ()=>{ toggleDoctorSigUIM(); });

inputs.doctorSigScaleM?.addEventListener("input", ()=>{
  if(!doctorDraft) return;
  const v = Math.max(70, Math.min(140, Number(inputs.doctorSigScaleM.value||100)));
  doctorDraft.doctorSigScale = v/100;
  if(inputs.doctorSigScaleValM) inputs.doctorSigScaleValM.textContent = v + "%";
  // LIVE PREVIEW (no save)
  state.doctorSigScale = doctorDraft.doctorSigScale;
  render(performance.now());
});

inputs.doctorSave?.addEventListener("click", ()=>{
  if(!doctorDraft) return;

  // pull latest values from modal fields
  doctorDraft.doctorName = inputs.doctorNameM.value;
  doctorDraft.doctorPrinted = inputs.doctorPrintedM.value;
  doctorDraft.doctorSigMode = inputs.doctorSigModeM.value;
  doctorDraft.doctorSigTyped = inputs.doctorSigTypedM.value;

  // Apply to main state
  state.doctorName = doctorDraft.doctorName;
  state.doctorPrinted = doctorDraft.doctorPrinted;
  state.doctorExtras = doctorDraft.doctorExtras.slice(0,3);
  state.doctorSigMode = doctorDraft.doctorSigMode;
  state.doctorSigTyped = doctorDraft.doctorSigTyped;
  state.doctorSigScale = (typeof doctorDraft.doctorSigScale === "number" ? doctorDraft.doctorSigScale : 1.0);

  if(state.doctorSigMode === "upload" && doctorDraft.doctorSigDataUrl){
    state.doctorSigDataUrl = doctorDraft.doctorSigDataUrl;
    loadImage(state.doctorSigDataUrl).then(img=>{ state.doctorSigImage = img; render(performance.now()); }).catch(()=>{});
  }else{
    state.doctorSigDataUrl = null;
    state.doctorSigImage = null;
  }

  // Sync panel fields
  inputs.doctorName.value = state.doctorName;
  inputs.doctorPrinted.value = state.doctorPrinted;
  inputs.doctorSigMode.value = state.doctorSigMode;
  inputs.doctorSigTyped.value = state.doctorSigTyped;
  toggleDoctorSigUI();
  renderDoctorExtras();

  if(inputs.doctorDropMeta) inputs.doctorDropMeta.textContent = state.doctorSigDataUrl ? "تم اختيار صورة توقيع ✅" : "";

  save();
  closeDoctorModal();
});

// Panel drop-zone
setupDropZone(inputs.doctorDrop, inputs.doctorSigUpload, inputs.doctorDropMeta, async (file)=>{
  const dataUrl = await readFileAsDataURL(file);
  state.doctorSigDataUrl = dataUrl;
  state.doctorSigImage = await loadImage(dataUrl);
  if(inputs.doctorDropMeta) inputs.doctorDropMeta.textContent = "تم اختيار صورة توقيع ✅";
  render(performance.now());
  save();
});

// Inputs listeners
inputs.name.addEventListener("input", (e)=>{ state.name = e.target.value; save(); });
inputs.testNo.addEventListener("input", (e)=>{ state.testNo = e.target.value; save(); });
inputs.nid.addEventListener("input", (e)=>{ state.nid = e.target.value; save(); });
inputs.doctorName.addEventListener("input", (e)=>{ state.doctorName = e.target.value; save(); });
inputs.doctorPrinted.addEventListener("input", (e)=>{ state.doctorPrinted = e.target.value; save(); });
inputs.doctorSigTyped.addEventListener("input", (e)=>{ state.doctorSigTyped = e.target.value; save(); });

inputs.doctorSigMode.addEventListener("change", (e)=>{
  state.doctorSigMode = e.target.value;
  toggleDoctorSigUI();
  save();
});

inputs.doctorSigUpload.addEventListener("change", async (e) => {
  const file = e.target.files && e.target.files[0];
  if(!file) return;
  try{
    const dataUrl = await readFileAsDataURL(file);
    state.doctorSigDataUrl = dataUrl;
    state.doctorSigImage = await loadImage(dataUrl);
    if(inputs.doctorDropMeta) inputs.doctorDropMeta.textContent = "تم اختيار صورة توقيع ✅";
    render(performance.now());
    save();
  }catch(err){
    alert("تعذر قراءة صورة التوقيع.");
  }
});

// ---- Discord message copy ----
function buildDiscordMessage(){
  const nm = (state.name && String(state.name).trim()) ? state.name.trim() : "—";
  const nid = (state.nid && String(state.nid).trim()) ? state.nid.trim() : "—";
  return "```\n" +
         "الاسم : " + nm + "\n" +
         "الرقم الوطني : " + nid + "\n" +
         "نوع التقرير: فحص لياقه\n" +
         "```";
}
async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    return true;
  }catch(e){
    try{
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "0";
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    }catch(e2){
      return false;
    }
  }
}
async function copyDiscordMessage(){
  const ok = await copyText(buildDiscordMessage());
  const btn = $("copyMsgBtn");
  if(ok){
    btn.textContent = "تم النسخ ✅";
    setTimeout(()=>btn.textContent="نسخ الرسالة", 1200);
  }else{
    alert("تعذر النسخ. جرّب HTTPS (Vercel/GitHub Pages) أو انسخ يدويًا.");
  }
}

// ---- Canvas drawing ----
function rr(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
function shadow(b=30,a=.28){
  ctx.shadowColor = `rgba(0,0,0,${a})`;
  ctx.shadowBlur = b;
  ctx.shadowOffsetY = 10;
}
function noShadow(){  ctx.shadowOffsetY = 0;
}
function fitTextRight(text, x, y, maxWidth, baseSize, weight="900"){
  let size = baseSize;
  while(size >= 18){
    ctx.font = `${weight} ${size}px system-ui, Segoe UI, Tahoma`;
    if(ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  ctx.fillText(text, x, y);
  return size;
}

function drawBg(t){
  const W=canvas.width,H=canvas.height;
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,"#0a1020"); g.addColorStop(.55,"#070b14"); g.addColorStop(1,"#060813");
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

  const b1=ctx.createRadialGradient(W*.78,H*.16,0,W*.78,H*.16,540);
  b1.addColorStop(0,"rgba(124,108,255,.25)"); b1.addColorStop(1,"rgba(124,108,255,0)");
  ctx.fillStyle=b1; ctx.fillRect(0,0,W,H);

  const b2=ctx.createRadialGradient(W*.20,H*.82,0,W*.20,H*.82,600);
  b2.addColorStop(0,"rgba(37,242,162,.14)"); b2.addColorStop(1,"rgba(37,242,162,0)");
  ctx.fillStyle=b2; ctx.fillRect(0,0,W,H);

  // subtle grid
  ctx.globalAlpha=.06; ctx.strokeStyle="#fff"; ctx.lineWidth=1;
  const step=56; ctx.beginPath();
  for(let x=0;x<=W;x+=step){ ctx.moveTo(x,0); ctx.lineTo(x,H); }
  for(let y=0;y<=H;y+=step){ ctx.moveTo(0,y); ctx.lineTo(W,y); }
  ctx.stroke(); ctx.globalAlpha=1;

  // Gym/fitness themed watermark motifs (kept OUT of text panels)
  drawGymBackdrop(t);
}


function drawGymBackdrop(t){
  const W=canvas.width, H=canvas.height;
  const tt = t/1000;

  // Protected areas (avoid drawing over any text/panels)
  const pad=88, logoY=54, s=118;
  const tests = {x:90, y:370, w:W-180, h:660};
  const info  = {x:90, y:1060, w:W-180, h:720};

  ctx.save();


  // GYM_VECTOR_ICONS_V14: clear gym equipment icons (outline only) inside panels, no text obstruction
  function gymStroke(){
    const g = ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0, "rgba(179,140,255,.75)");
    g.addColorStop(.5, "rgba(124,108,255,.55)");
    g.addColorStop(1, "rgba(37,242,162,.40)");
    ctx.strokeStyle = g;
    ctx.fillStyle = "rgba(179,140,255,.10)";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  function drawKettlebell(x,y,scale,rot,alpha){
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(rot);
    ctx.scale(scale,scale);
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = "screen";
    gymStroke();
    ctx.lineWidth = 5;

    // body
    ctx.beginPath();
    ctx.moveTo(-54, 20);
    ctx.quadraticCurveTo(-70, -10, -36, -38);
    ctx.quadraticCurveTo(0, -70, 36, -38);
    ctx.quadraticCurveTo(70, -10, 54, 20);
    ctx.quadraticCurveTo(40, 74, 0, 82);
    ctx.quadraticCurveTo(-40, 74, -54, 20);
    ctx.closePath();
    ctx.stroke();

    // handle
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-26,-36);
    ctx.quadraticCurveTo(0,-78, 26,-36);
    ctx.quadraticCurveTo(12,-22, 0,-22);
    ctx.quadraticCurveTo(-12,-22, -26,-36);
    ctx.stroke();

    ctx.restore();
  }

  function drawDumbbell(x,y,scale,rot,alpha){
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(rot);
    ctx.scale(scale,scale);
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = "screen";
    gymStroke();
    ctx.lineWidth = 6;

    // plates
    ctx.beginPath();
    ctx.moveTo(-92,-26); ctx.lineTo(-92,26);
    ctx.moveTo(-74,-34); ctx.lineTo(-74,34);
    ctx.moveTo(92,-26);  ctx.lineTo(92,26);
    ctx.moveTo(74,-34);  ctx.lineTo(74,34);
    ctx.stroke();

    // rod
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(-64,0);
    ctx.lineTo(64,0);
    ctx.stroke();

    ctx.restore();
  }

  function drawPlateStack(x,y,scale,alpha){
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(scale,scale);
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = "screen";
    gymStroke();
    ctx.lineWidth = 4.5;

    for(let i=0;i<3;i++){
      const r = 44 + i*14;
      ctx.beginPath();
      ctx.arc(0,0,r,0,Math.PI*2);
      ctx.stroke();
    }
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0,0,16,0,Math.PI*2);
    ctx.stroke();

    ctx.restore();
  }

  function drawTreadmill(x,y,scale,rot,alpha){
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(rot);
    ctx.scale(scale,scale);
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = "screen";
    gymStroke();
    ctx.lineWidth = 4.5;

    // base belt
    ctx.beginPath();
    ctx.moveTo(-84, 38);
    ctx.quadraticCurveTo(-10, 66, 84, 38);
    ctx.lineTo(74, 56);
    ctx.quadraticCurveTo(-10, 86, -96, 56);
    ctx.closePath();
    ctx.stroke();

    // stand
    ctx.beginPath();
    ctx.moveTo(54, 30);
    ctx.lineTo(30, -54);
    ctx.lineTo(46, -62);
    ctx.lineTo(70, 22);
    ctx.stroke();

    // handle
    ctx.beginPath();
    ctx.moveTo(30, -54);
    ctx.quadraticCurveTo(8, -72, -16, -66);
    ctx.stroke();

    // runner (simple)
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(-10,-54,8,0,Math.PI*2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-10,-46);
    ctx.lineTo(-26,-20);
    ctx.lineTo(-8,-6);
    ctx.lineTo(14,-14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-18,-30);
    ctx.lineTo(-44,-18);
    ctx.stroke();

    ctx.restore();
  }

  function drawPanelIcons(rx,ry,rw,rh,variant){
    ctx.save();
    // clip to panel rect only (icons cannot escape)
    ctx.beginPath();
    ctx.rect(rx,ry,rw,rh);
    ctx.clip();

    // Keep icons near edges so list text stays perfectly readable
    const inset = 36;
    const left = rx + inset;
    const right = rx + rw - inset;
    const top = ry + inset;
    const bottom = ry + rh - inset;

    // Slight glow, but never a solid fill
    ctx.shadowColor = "rgba(179,140,255,.30)";
    ctx.shadowBlur = 18;

    if(variant==="tests"){
      drawKettlebell(left+70, top+70, 1.05, -0.25, 0.20);
      drawTreadmill(right-90, top+120, 0.90, 0.18, 0.18);
      drawPlateStack(left+90, bottom-90, 1.00, 0.16);
      drawDumbbell(right-110, bottom-90, 1.05, -0.18, 0.18);
    }else{
      drawPlateStack(left+80, top+90, 0.95, 0.15);
      drawDumbbell(right-120, top+110, 0.95, 0.22, 0.16);
      drawKettlebell(right-120, bottom-120, 0.85, 0.18, 0.15);
      drawTreadmill(left+95, bottom-110, 0.78, -0.12, 0.14);
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Draw inside both panels (behind glass, but visible)
  drawPanelIcons(tests.x+10, tests.y+10, tests.w-20, tests.h-20, "tests");
  drawPanelIcons(info.x+10,  info.y+10,  info.w-20,  info.h-20,  "info");

  // Vector silhouettes (dumbbell + barbell) very faint, inside panels only
  function vecDumbbell(cx,cy,scale,rot,alpha){
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(rot);
    ctx.scale(scale,scale);
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = "screen";
    const g = ctx.createLinearGradient(-220,0,220,0);
    g.addColorStop(0, "rgba(124,108,255,0)");
    g.addColorStop(0.5, "rgba(179,140,255,.75)");
    g.addColorStop(1, "rgba(37,242,162,0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 10;
    ctx.lineCap = "round";

    // plates
    ctx.beginPath();
    ctx.moveTo(-190,-40); ctx.lineTo(-190,40);
    ctx.moveTo(-160,-50); ctx.lineTo(-160,50);
    ctx.moveTo(190,-40);  ctx.lineTo(190,40);
    ctx.moveTo(160,-50);  ctx.lineTo(160,50);
    ctx.stroke();

    // rod
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(-140,0);
    ctx.lineTo(140,0);
    ctx.stroke();
    ctx.restore();
  }

  // Draw silhouettes centered in panels (still behind glass)
  vecDumbbell(tests.x + tests.w*0.50, tests.y + tests.h*0.36, 0.66, -0.30, 0.075);
  vecDumbbell(info.x  + info.w*0.52,  info.y  + info.h*0.46, 0.56,  0.22, 0.070);

  // Build "allowed" clip = whole canvas minus protected rects
  ctx.beginPath();
  ctx.rect(0,0,W,H);

  // Title block (keep clean)
  ctx.rect(0, 190, W, 190);

  // Logos areas (left & right)
  ctx.rect(pad-20, logoY-20, s+40, s+40);
  ctx.rect(W-pad-s-20, logoY-20, s+40, s+40);

  // Left chevrons area
  ctx.rect(60, 70, 170, 210);

  // Panels
  ctx.rect(tests.x, tests.y, tests.w, tests.h);
  ctx.rect(info.x, info.y, info.w, info.h);

  // Footer zone
  ctx.rect(0, 1820, W, 200);

  // Apply clip with even-odd fill rule when supported
  try{ ctx.clip("evenodd"); }catch(e){ ctx.clip(); }

  // ---- Motifs (subtle, in margins/empty spaces only) ----

  // Helper: draw a simple dumbbell silhouette
  function dumbbell(x,y,scale,rot,alpha,stroke){
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(rot);
    ctx.scale(scale,scale);
    ctx.globalAlpha=alpha;
    ctx.strokeStyle=stroke;
    ctx.lineWidth=4;
    ctx.lineCap="round";

    // plates
    ctx.beginPath();
    ctx.moveTo(-52,-18); ctx.lineTo(-52,18);
    ctx.moveTo(-42,-22); ctx.lineTo(-42,22);
    ctx.moveTo(52,-18);  ctx.lineTo(52,18);
    ctx.moveTo(42,-22);  ctx.lineTo(42,22);
    ctx.stroke();

    // rod
    ctx.beginPath();
    ctx.moveTo(-34,0);
    ctx.lineTo(34,0);
    ctx.stroke();
    ctx.restore();
  }

  // Helper: kettlebell outline
  function kettlebell(x,y,scale,rot,alpha,stroke){
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(rot);
    ctx.scale(scale,scale);
    ctx.globalAlpha=alpha;
    ctx.strokeStyle=stroke;
    ctx.lineWidth=3.6;
    ctx.lineJoin="round";

    // body
    ctx.beginPath();
    ctx.moveTo(-36,10);
    ctx.quadraticCurveTo(-44,-14,-22,-30);
    ctx.quadraticCurveTo(0,-46,22,-30);
    ctx.quadraticCurveTo(44,-14,36,10);
    ctx.quadraticCurveTo(24,44,0,48);
    ctx.quadraticCurveTo(-24,44,-36,10);
    ctx.closePath();
    ctx.stroke();

    // handle
    ctx.beginPath();
    ctx.moveTo(-18,-30);
    ctx.quadraticCurveTo(0,-54,18,-30);
    ctx.quadraticCurveTo(8,-22,0,-22);
    ctx.quadraticCurveTo(-8,-22,-18,-30);
    ctx.stroke();

    ctx.restore();
  }

  // Helper: running track arcs (stroke only)
  function trackArcs(x,y,scale,alpha){
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(scale,scale);
    ctx.globalAlpha=alpha;
    ctx.strokeStyle="rgba(37,242,162,.35)";
    ctx.lineWidth=3;
    ctx.setLineDash([7,11]);
    ctx.lineDashOffset = -tt*30;
    for(let k=0;k<4;k++){
      ctx.beginPath();
      ctx.arc(0,0, 72+k*22, -Math.PI*0.12, Math.PI*0.62);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Repeating micro icons in side margins (very faint)
  function microPattern(){
    ctx.save();
    ctx.globalAlpha=0.08;
    const leftX=34, rightX=W-34;
    const stepY=120;
    for(let y=420;y<1760;y+=stepY){
      const wob = 10*Math.sin(tt*0.8 + y*0.02);
      dumbbell(leftX, y + wob, 0.62, -0.15, 0.55, "rgba(179,140,255,.9)");
      dumbbell(rightX, y - wob, 0.62,  0.15, 0.45, "rgba(179,140,255,.9)");
    }
    ctx.restore();
  }

  microPattern();

  // Big watermark elements (corners only)
  kettlebell(190, 330, 1.25, -0.22 + 0.02*Math.sin(tt*0.7), 0.10, "rgba(238,241,255,.85)");
  dumbbell(W-170, 320, 1.35, 0.18 + 0.02*Math.cos(tt*0.6), 0.09, "rgba(238,241,255,.85)");

  // Bottom-left track watermark
  trackArcs(150, H-260, 1.35, 0.14);

  // Subtle diagonal barbell streak in the empty right side of header (clipped already)
  ctx.save();
  ctx.translate(W*0.78, 360);
  ctx.rotate(-0.55);
  ctx.globalAlpha=0.10;
  const g = ctx.createLinearGradient(-260,0,260,0);
  g.addColorStop(0, "rgba(124,108,255,0)");
  g.addColorStop(0.5, "rgba(179,140,255,.65)");
  g.addColorStop(1, "rgba(124,108,255,0)");
  ctx.strokeStyle=g;
  ctx.lineWidth=10;
  ctx.lineCap="round";
  ctx.beginPath();
  ctx.moveTo(-320,0);
  ctx.lineTo(320,0);
  ctx.stroke();
  ctx.restore();

  // Very faint "energy" streaks on top edges
  ctx.save();
  ctx.globalAlpha=0.06;
  ctx.strokeStyle="rgba(37,242,162,.55)";
  ctx.lineWidth=2;
  for(let i=0;i<6;i++){
    const yy = 26 + i*18;
    ctx.beginPath();
    ctx.moveTo(40, yy);
    ctx.lineTo(260 + 60*Math.sin(tt*0.6 + i), yy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W-40, yy);
    ctx.lineTo(W-260 + 60*Math.cos(tt*0.6 + i), yy);
    ctx.stroke();
  }
  ctx.restore();


  // --- WOW_MOTIFS_V9: premium athletic visuals in safe margins only ---
  // Neon corner brackets (very subtle)
  function cornerBrackets(x,y,w,h,alpha){
    ctx.save();
    ctx.globalAlpha = alpha;
    const g = ctx.createLinearGradient(x, y, x+w, y+h);
    g.addColorStop(0, "rgba(179,140,255,.85)");
    g.addColorStop(0.5, "rgba(124,108,255,.55)");
    g.addColorStop(1, "rgba(37,242,162,.55)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    const L = 28;
    // top-left
    ctx.beginPath();
    ctx.moveTo(x, y+L); ctx.lineTo(x, y); ctx.lineTo(x+L, y);
    ctx.stroke();
    // top-right
    ctx.beginPath();
    ctx.moveTo(x+w-L, y); ctx.lineTo(x+w, y); ctx.lineTo(x+w, y+L);
    ctx.stroke();
    // bottom-left
    ctx.beginPath();
    ctx.moveTo(x, y+h-L); ctx.lineTo(x, y+h); ctx.lineTo(x+L, y+h);
    ctx.stroke();
    // bottom-right
    ctx.beginPath();
    ctx.moveTo(x+w-L, y+h); ctx.lineTo(x+w, y+h); ctx.lineTo(x+w, y+h-L);
    ctx.stroke();

    ctx.restore();
  }

  // Hex honeycomb micro-pattern (only in empty margins)
  function hexPattern(x0,y0,x1,y1,alpha){
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = "rgba(238,241,255,.38)";
    ctx.lineWidth = 1;
    const r = 10;
    const dx = r*1.75;
    const dy = r*1.5;
    for(let y=y0; y<y1; y+=dy){
      const row = Math.floor((y-y0)/dy);
      const off = (row%2)*dx*0.5;
      for(let x=x0+off; x<x1; x+=dx){
        ctx.beginPath();
        for(let k=0;k<6;k++){
          const a = Math.PI/3*k + Math.PI/6;
          const px = x + r*Math.cos(a);
          const py = y + r*Math.sin(a);
          if(k===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Speed lines (athletic vibe) - kept at edges
  function speedLines(side){
    ctx.save();
    ctx.globalAlpha = 0.08 + 0.02*Math.sin(tt*0.9);
    ctx.strokeStyle = "rgba(179,140,255,.9)";
    ctx.lineWidth = 2;
    const count = 8;
    for(let i=0;i<count;i++){
      const yy = 260 + i*54;
      const len = 110 + 30*Math.sin(tt*0.7 + i);
      ctx.beginPath();
      if(side==="left"){
        ctx.moveTo(34, yy);
        ctx.lineTo(34+len, yy-10);
      }else{
        ctx.moveTo(W-34, yy);
        ctx.lineTo(W-34-len, yy-10);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // Apply: frame brackets around the whole page margins (not covering footer)
  cornerBrackets(22, 22, W-44, H-220, 0.10 + 0.02*Math.sin(tt*0.7));

  // Honeycomb clusters (top-right & bottom-right empty bands)
  hexPattern(W-260, 170, W-36, 310, 0.06);
  hexPattern(W-260, H-360, W-36, H-230, 0.05);

  // Speed lines on both sides
  speedLines("left");
  speedLines("right");

  ctx.restore();
}


function drawHeader(){
  const W=canvas.width;

  // Logos smaller & high
  const pad=88, y=54, s=118;
  if(IMG_EMS){
    ctx.save(); shadow(16,.18);
    ctx.drawImage(IMG_EMS, pad, y, s, s);
    noShadow(); ctx.restore();
  }
  if(IMG_EMBLEM){
    ctx.save(); shadow(16,.18);
    ctx.drawImage(IMG_EMBLEM, W - pad - s, y, s, s);
    noShadow(); ctx.restore();
  }

  // Title
  ctx.textAlign="right";
  ctx.fillStyle="#eef1ff";
  ctx.font="900 104px system-ui, Segoe UI, Tahoma";
  ctx.fillText("فحص للياقة", W-90, 270);

  ctx.font="700 34px system-ui, Segoe UI, Tahoma";
  ctx.fillStyle="rgba(238,241,255,.82)";
  ctx.fillText("مستشفى ريسبكت", W-92, 318);

  // Decorative chevrons (left)
  ctx.save();
  ctx.globalAlpha=.16;
  ctx.translate(110, 110);
  ctx.strokeStyle="#eef1ff";
  ctx.lineWidth=12;
  ctx.lineCap="round";
  for(let i=0;i<3;i++){
    ctx.beginPath();
    ctx.moveTo(0, i*54);
    ctx.lineTo(42, i*54 + 34);
    ctx.lineTo(0, i*54 + 68);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTests(t){
  const W=canvas.width;
  const x=90, y=370, w=W-180, h=660;

  ctx.save();
  shadow(26,.26);
  rr(x,y,w,h,34);
  ctx.fillStyle="rgba(255,255,255,.06)";
  ctx.fill();
  noShadow();
  ctx.strokeStyle="rgba(255,255,255,.14)";
  ctx.lineWidth=2;
  ctx.stroke();
  ctx.restore();

  ctx.textAlign="right";
  ctx.fillStyle="rgba(238,241,255,.92)";
  ctx.font="800 46px system-ui, Segoe UI, Tahoma";
  ctx.fillText("الفحوصات", x+w-40, y+78);

  const colGap=44;
  const colW=(w-colGap-80)/2;
  const startY=y+150;
  const rowH=92;

  // Continuous moving highlight (never stops)
  const phase = (t/1000) * 0.9;
  const band = 0.18;

  function movingGradient(x1, x2, yy, p01){
    // base track
    ctx.strokeStyle="rgba(255,255,255,.12)";
    ctx.lineWidth=4;
    ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(x1,yy); ctx.lineTo(x2,yy); ctx.stroke();

    const seg = (x2-x1) * p01;
    if(seg <= 2) return;

    const segStart = x2 - seg;
    const segEnd = x2;

    const g = ctx.createLinearGradient(segStart, yy, segEnd, yy);
    const a = (phase % 1);
    const s1 = Math.max(0, a - band);
    const s2 = a;
    const s3 = Math.min(1, a + band);

    g.addColorStop(0, "rgba(124,108,255,.35)");
    g.addColorStop(s1, "rgba(124,108,255,.35)");
    g.addColorStop(s2, "rgba(179,140,255,.95)");
    g.addColorStop(s3, "rgba(124,108,255,.35)");
    g.addColorStop(1, "rgba(124,108,255,.35)");

    ctx.strokeStyle=g;
    ctx.lineWidth=5;
    ctx.beginPath(); ctx.moveTo(segStart, yy); ctx.lineTo(segEnd, yy); ctx.stroke();

    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "rgba(124,108,255,.95)";
    ctx.fillRect(segStart, yy-12, seg, 7);
    ctx.globalAlpha = 1;
  }

  for(let i=0;i<TESTS.length;i++){
    const col=(i<5)?0:1;
    const row=(i<5)?i:i-5;
    const bx=x+40+(col?(colW+colGap):0);
    const by=startY+row*rowH;

    ctx.textAlign="right";
    ctx.fillStyle="rgba(238,241,255,.92)";
    ctx.font="700 30px system-ui, Segoe UI, Tahoma";
    ctx.fillText(TESTS[i], bx+colW, by);

    const p = Math.max(0, Math.min(100, Number(state.tests[i]||0)));
    ctx.textAlign="left";
    ctx.fillStyle="rgba(238,241,255,.74)";
    ctx.font="800 34px system-ui, Segoe UI, Tahoma";
    ctx.fillText(`${p}%`, bx, by);

    const yy = by + 32;
    movingGradient(bx, bx+colW, yy, p/100);
  }
}

function drawInfo(t){
  const W=canvas.width;
  const x=90, y=1060, w=W-180, h=720;

  ctx.save(); shadow(26,.26);
  rr(x,y,w,h,34);
  ctx.fillStyle="rgba(255,255,255,.05)";
  ctx.fill();
  noShadow();
  ctx.strokeStyle="rgba(255,255,255,.14)";
  ctx.lineWidth=2;
  ctx.stroke();
  ctx.restore();

  const pad=44;
  const rightX=x+w-pad;
  const topY=y+86;

  function kv(label, value, yy){
    ctx.textAlign="right";
    ctx.fillStyle="rgba(238,241,255,.74)";
    ctx.font="700 26px system-ui, Segoe UI, Tahoma";
    ctx.fillText(label + ":", rightX, yy);

    ctx.fillStyle="#eef1ff";
    const maxW = w - 120;
    fitTextRight((value && String(value).trim()) ? String(value) : "—", rightX, yy+54, maxW, 40, "900");
  }

  kv("الاسم", state.name, topY);
  kv("رقم الفحص", state.testNo, topY+150);
  kv("الرقم الوطني", state.nid, topY+300);

  // Signatures (no overlap)
  const cardTop = y + 470;
  const cardH = 230;
  const colW = (w - 120) / 2;
  const gap = 40;
  const leftColX = x + 60;
  const rightColX = x + 60 + colW + gap;

  function sigCard(cx, title, nameLines, sigImg, typed, printed, sigScale){
    rr(cx, cardTop, colW, cardH, 24);
    ctx.fillStyle="rgba(0,0,0,.18)";
    ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,.14)";
    ctx.lineWidth=2;
    ctx.stroke();

    ctx.textAlign="right";
    ctx.fillStyle="rgba(238,241,255,.78)";
    ctx.font="800 26px system-ui, Segoe UI, Tahoma";
    ctx.fillText(title + ":", cx+colW-18, cardTop+44);

    // Names
    let yCursor = cardTop + 82;
    ctx.fillStyle="#eef1ff";
    ctx.font="900 30px system-ui, Segoe UI, Tahoma";
    if(nameLines.length){
      ctx.fillText(nameLines[0] || "—", cx+colW-18, yCursor);
      yCursor += 28;
      ctx.font="800 22px system-ui, Segoe UI, Tahoma";
      for(let i=1;i<nameLines.length;i++){
        const line = nameLines[i];
        if(!line || !String(line).trim()) continue;
        ctx.fillStyle="rgba(238,241,255,.82)";
        ctx.fillText(line, cx+colW-18, yCursor);
        yCursor += 26;
      }
    } else {
      ctx.fillText("—", cx+colW-18, yCursor);
      yCursor += 28;
    }

    // Signature BELOW names
    const availW = colW - 44;
    const bottomPad = 40;
    const minY = yCursor + 8;
    const maxBottom = cardTop + cardH - bottomPad;
    const availH = Math.max(44, maxBottom - minY);
    const sc = Math.max(0.7, Math.min(1.4, Number(sigScale||1)));
    // Base box is intentionally smaller so scaling is visible for wide signatures too
    const baseW = availW * 0.64;
    const baseH = 66;
    const boxW = Math.min(availW, Math.round(baseW * sc));
    const boxH = Math.min(availH, Math.round(baseH * sc));
    // Center box in available region
    const sX = cx + (colW - boxW)/2;
    let sY = minY + (availH - boxH)/2;
    if(sY < minY) sY = minY;
    if(sY + boxH > maxBottom) sY = maxBottom - boxH;

    if(sigImg){
      const r = Math.min(boxW/sigImg.width, boxH/sigImg.height);
      const w2 = sigImg.width * r;
      const h2 = sigImg.height * r;
      ctx.globalAlpha = 0.95;
      ctx.drawImage(sigImg, sX + (boxW-w2)/2, sY + (boxH-h2)/2, w2, h2);
      ctx.globalAlpha = 1;
    } else if(typed && typed.trim()){
      ctx.textAlign="center";
      ctx.fillStyle="rgba(238,241,255,.92)";
      const f = Math.round(56 * Math.max(0.7, Math.min(1.4, Number(sigScale||1))));
      ctx.font=`700 ${f}px system-ui, Segoe UI, Tahoma`;
      ctx.fillText(typed, cx + colW/2, sY + Math.min(boxH-10, Math.max(44, f+6)));
    } else {
      // clean line instead of placeholder text (fix "النقطة/Signature")
      ctx.strokeStyle="rgba(238,241,255,.22)";
      ctx.lineWidth=3;
      ctx.lineCap="round";
      ctx.beginPath();
      ctx.moveTo(cx + 40, sY + 58);
      ctx.lineTo(cx + colW - 40, sY + 58);
      ctx.stroke();
    }

    if(printed && printed.trim()){
      ctx.textAlign="center";
      ctx.fillStyle="rgba(238,241,255,.78)";
      ctx.font="700 22px system-ui, Segoe UI, Tahoma";
      ctx.fillText(printed, cx + colW/2, cardTop + cardH - 16);
    }
  }

  const extras = (state.doctorExtras || []).slice(0,3).map(s => String(s||"").trim()).filter(Boolean);
  const docLines = [String(state.doctorName || "—").trim(), ...extras];

  let docSigImg = null, docTyped = null;
  if(state.doctorSigMode === "upload" && state.doctorSigImage) docSigImg = state.doctorSigImage;
  if(state.doctorSigMode === "typed") docTyped = state.doctorSigTyped;

  sigCard(rightColX, "الطبيب المعالج", docLines, docSigImg, docTyped, state.doctorPrinted, state.doctorSigScale);
  sigCard(leftColX, "توقيع المسؤول", ["د.بخيت مبخوت"], IMG_RESP_SIG, null, "", 1.0);
}

function drawFooter(){
  const W=canvas.width;
  const baseY = 1840;
  ctx.textAlign="center";
  ctx.fillStyle="rgba(238,241,255,.82)";
  ctx.font="700 28px system-ui, Segoe UI, Tahoma";
  ctx.fillText("مستشفى ريسبكت - شمال المدينة 7424", W/2, baseY);

  const bw=180, bh=66;
  const bx=W/2 - bw/2;
  const by=baseY + 18;
  rr(bx, by, bw, bh, 30);
  ctx.fillStyle="rgba(255,255,255,.92)";
  ctx.fill();
  ctx.fillStyle="#0b0f1d";
  ctx.font="900 34px system-ui, Segoe UI, Tahoma";
  ctx.fillText("311", W/2, by + 46);
}

function render(t=performance.now()){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawBg(t);
  drawHeader();
  drawTests(t);
  drawInfo(t);
  drawFooter();
}

// Keep animation running forever
let raf = null;
function startLoop(){
  cancelAnimationFrame(raf);
  const loop = (t) => { render(t); raf = requestAnimationFrame(loop); };
  raf = requestAnimationFrame(loop);
}

// ---- Export helpers ----
function canvasToBlob(){
  return new Promise((res)=>canvas.toBlob(res, "image/png", 0.95));
}
async function downloadPNG(){
  const blob = await canvasToBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fitness-report.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
async function copyToClipboard(){
  try{
    const blob = await canvasToBlob();
    if(!navigator.clipboard || !window.ClipboardItem) throw new Error("no-clipboard");
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    const btn = $("copyBtn");
    btn.textContent = "تم النسخ ✅";
    setTimeout(()=>btn.textContent="حفظ للمحفظة", 1200);
  }catch(e){
    alert("تعذر النسخ للمحفظة. افتح على HTTPS (Vercel/GitHub Pages) أو استخدم تحميل PNG.");
  }
}
async function printPDF(){
  const blob = await canvasToBlob();
  const url = URL.createObjectURL(blob);
  const w = window.open("", "_blank");
  if(!w) return;
  w.document.write(`
    <html><head><title>Print</title>
      <style>body{margin:0;display:grid;place-items:center}img{max-width:100%;height:auto}</style>
    </head><body>
      <img src="${url}" onload="window.print(); setTimeout(()=>window.close(), 200);"/>
    </body></html>
  `);
  w.document.close();
  setTimeout(()=>URL.revokeObjectURL(url), 1500);
}

// ---- Boot ----
function init(){
  toggleDoctorSigUI();
  renderDoctorExtras();
  if(state.doctorSigDataUrl){
    if(inputs.doctorDropMeta) inputs.doctorDropMeta.textContent = "تم اختيار صورة توقيع ✅";
    loadImage(state.doctorSigDataUrl).then(img=>{ state.doctorSigImage = img; render(performance.now()); }).catch(()=>{});
  }
  restore();
}
loadAssets().then(() => {
  init();
  startLoop();
});
