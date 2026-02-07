let gymWatermark = null;

// ---- Tests order (Static for the Report, Dynamic for the UI) ----
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
  insurance: "", // New: فضي, ذهبي, بلاتيني
  doctorName: "د. سنمار بدر",
  doctorExtras: [],
  doctorPrinted: "",
  doctorSigMode: "none",
  doctorSigTyped: "",
  doctorSigScale: 1.0,
  doctorSigImage: null,
  doctorSigDataUrl: null,
  tests: TESTS.map(() => 0),
  uiOrder: [...Array(TESTS.length).keys()], // For drag and drop tracking
};

const $ = (id) => document.getElementById(id);
const canvas = $("report");
const ctx = canvas.getContext("2d");

const inputs = {
  name: $("name"),
  testNo: $("testNo"),
  nid: $("nid"),
  insurance: $("insuranceType"),
  doctorNameM: $("doctorNameM"),
  doctorPrintedM: $("doctorPrintedM"),
  doctorSigModeM: $("doctorSigModeM"),
  doctorSigTypedM: $("doctorSigTypedM"),
  doctorSigUploadM: $("doctorSigUploadM"),
  doctorSigScaleM: $("doctorSigScaleM")
};

// ---- UI Functions ----

function mountTests() {
  const container = $("testsList");
  container.innerHTML = "";
  
  state.uiOrder.forEach((originalIndex, currentPos) => {
    const name = TESTS[originalIndex];
    const pct = state.tests[originalIndex];
    
    const row = document.createElement("div");
    row.className = "testRow";
    row.draggable = true;
    row.dataset.index = originalIndex;
    
    row.innerHTML = `
      <div class="testTop">
        <div class="testName">☰ ${name}</div>
        <div class="testPct">${pct}%</div>
      </div>
      <div class="testCtl">
        <input type="range" min="0" max="100" value="${pct}">
        <button class="btn btn100" style="height:30px; padding:0 8px; font-size:11px">100%</button>
      </div>
    `;

    // Events
    const rng = row.querySelector("input");
    rng.oninput = () => {
      state.tests[originalIndex] = parseInt(rng.value);
      row.querySelector(".testPct").textContent = rng.value + "%";
      render();
    };
    
    row.querySelector(".btn100").onclick = () => {
      state.tests[originalIndex] = 100;
      rng.value = 100;
      row.querySelector(".testPct").textContent = "100%";
      render();
    };

    // Drag and Drop Logic
    row.addEventListener("dragstart", (e) => {
      row.classList.add("dragging");
      e.dataTransfer.setData("text/plain", currentPos);
    });
    row.addEventListener("dragend", () => row.classList.remove("dragging"));
    row.addEventListener("dragover", (e) => e.preventDefault());
    row.addEventListener("drop", (e) => {
      e.preventDefault();
      const fromPos = parseInt(e.dataTransfer.getData("text/plain"));
      const toPos = currentPos;
      
      const movedItem = state.uiOrder.splice(fromPos, 1)[0];
      state.uiOrder.splice(toPos, 0, movedItem);
      mountTests();
    });

    container.appendChild(row);
  });
}

// ---- Patch Notes Logic ----
function checkPatchNotes() {
  const skip = $("skipIntro");
  skip.onclick = () => {
    $("intro").setAttribute("aria-hidden", "true");
    if(!localStorage.getItem("patch_v1_seen")) {
      $("patchNotes").style.display = "grid";
    }
  };
  
  $("closePatch").onclick = () => {
    $("patchNotes").style.display = "none";
    localStorage.setItem("patch_v1_seen", "true");
  };
}

// ---- Copy Message Logic ----
function copyDiscordMessage() {
  const nm = state.name.trim() || "سنمار";
  const nid = state.nid.trim() || "5775";
  const reportType = "فحص لياقه";
  const insurance = state.insurance ? `\nنوغ التأمين : ${state.insurance}` : "";

  const text = "```\n" +
               `الاسم : ${nm}\n` +
               `الرقم الوطني : ${nid}\n` +
               `نوع التقرير: ${reportType}${insurance}\n` +
               "```";

  navigator.clipboard.writeText(text).then(() => {
    const btn = $("copyMsgBtn");
    btn.textContent = "تم النسخ ✅";
    setTimeout(() => btn.textContent = "نسخ الرسالة", 1500);
  });
}

// ---- Canvas Drawing (Keep Original Exactly) ----

function drawBg(t){
  ctx.fillStyle = "#fff";
  ctx.fillRect(0,0, canvas.width, canvas.height);

  // Subtle grid
  ctx.strokeStyle = "rgba(0,0,0,0.03)";
  ctx.lineWidth = 1;
  for(let i=0; i<canvas.width; i+=40){
    ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke();
  }
  for(let j=0; j<canvas.height; j+=40){
    ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(canvas.width,j); ctx.stroke();
  }
}

function drawHeader(){
  // Hospital Title / Logo Area
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.roundRect(60, 60, 1294, 240, 30);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.font = "900 64px system-ui";
  ctx.textAlign = "right";
  ctx.fillText("مستشفى ريسبكت", 1300, 160);

  ctx.font = "500 28px system-ui";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillText("Respect Hospital - Medical Center", 1300, 210);

  // Badge
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.beginPath();
  ctx.roundRect(80, 110, 320, 140, 20);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "900 38px system-ui";
  ctx.fillText("فحص لياقة", 240, 175);
  ctx.font = "700 20px system-ui";
  ctx.fillText("FITNESS REPORT", 240, 215);
}

function drawTestsCanvas(){
  const startY = 380;
  const colWidth = 630;
  const rowHeight = 110;
  const gap = 34;

  TESTS.forEach((name, i) => {
    const col = i < 5 ? 0 : 1;
    const row = i % 5;
    const x = 60 + (col * (colWidth + gap));
    const y = startY + (row * (rowHeight + gap));
    const pct = state.tests[i];

    // Card shadow
    ctx.shadowColor = "rgba(0,0,0,0.06)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(x, y, colWidth, rowHeight, 20);
    ctx.fill();
    ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    // Border
    ctx.strokeStyle = "rgba(0,0,0,0.05)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icon circle
    ctx.fillStyle = pct === 100 ? "#25f2a2" : "#f1f3f9";
    ctx.beginPath();
    ctx.arc(x + colWidth - 55, y + 55, 30, 0, Math.PI*2);
    ctx.fill();

    // Test name
    ctx.fillStyle = "#1a1a1a";
    ctx.textAlign = "right";
    ctx.font = "900 28px system-ui";
    ctx.fillText(name, x + colWidth - 110, y + 65);

    // Percentage
    ctx.fillStyle = pct === 100 ? "#009e66" : "#667";
    ctx.textAlign = "left";
    ctx.font = "900 32px system-ui";
    ctx.fillText(pct + "%", x + 40, y + 65);
  });
}

function drawInfo(){
  const y = 1150;
  ctx.fillStyle = "#f8f9fc";
  ctx.beginPath();
  ctx.roundRect(60, y, 1294, 300, 30);
  ctx.fill();

  ctx.fillStyle = "#1a1a1a";
  ctx.textAlign = "right";
  ctx.font = "900 24px system-ui";
  
  ctx.fillText("بيانات المفحوص", 1300, y + 60);
  
  ctx.font = "700 28px system-ui";
  ctx.fillText("الاسـم : " + (state.name || "ــــــــــــــــــــــــــــــــــــــــ"), 1300, y + 130);
  ctx.fillText("الرقم الوطني : " + (state.nid || "ــــــــــــــــــــ"), 1300, y + 200);
  ctx.fillText("رقم الفحص : " + (state.testNo || "ــــــــ"), 1300, y + 255);

  // Status Stamp
  ctx.save();
  ctx.translate(280, y + 150);
  ctx.rotate(-0.1);
  ctx.strokeStyle = "#009e66";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(-150, -60, 300, 120, 15);
  ctx.stroke();
  ctx.fillStyle = "#009e66";
  ctx.font = "900 48px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("لائــــق", 0, 18);
  ctx.restore();
}

function drawDoctor(){
  const y = 1550;
  ctx.fillStyle = "#1a1a1a";
  ctx.textAlign = "right";
  ctx.font = "900 32px system-ui";
  ctx.fillText("الطبيب المعالج", 1300, y);

  ctx.font = "700 28px system-ui";
  ctx.fillText(state.doctorName, 1300, y + 60);

  // Signature
  if(state.doctorSigMode === 'typed' && state.doctorSigTyped){
    ctx.font = "italic 700 48px 'Brush Script MT', cursive";
    ctx.fillStyle = "#161b2e";
    ctx.fillText(state.doctorSigTyped, 1300, y + 140);
  } else if(state.doctorSigMode === 'upload' && state.doctorSigImage){
    const sw = state.doctorSigImage.width * (state.doctorSigScale / 100);
    const sh = state.doctorSigImage.height * (state.doctorSigScale / 100);
    ctx.drawImage(state.doctorSigImage, 1300 - sw, y + 80, sw, sh);
  }

  ctx.font = "500 22px system-ui";
  ctx.fillStyle = "#667";
  ctx.fillText(state.doctorPrinted, 1300, y + 210);
}

function drawFooter(){
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "900 40px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("311", canvas.width/2, 1920);
  
  ctx.font = "500 18px system-ui";
  ctx.fillStyle = "#aeb7df";
  ctx.fillText("RESPECT HOSPITAL SYSTEMS v2.0", canvas.width/2, 1960);
}

function render(){
  drawBg();
  drawHeader();
  drawTestsCanvas();
  drawInfo();
  drawDoctor();
  drawFooter();
}

// ---- Boot Logic ----

function init(){
  mountTests();
  checkPatchNotes();
  
  // Inputs listeners
  inputs.name.oninput = (e) => { state.name = e.target.value; render(); };
  inputs.testNo.oninput = (e) => { state.testNo = e.target.value; render(); };
  inputs.nid.oninput = (e) => { state.nid = e.target.value; render(); };
  inputs.insurance.onchange = (e) => { state.insurance = e.target.value; };
  
  // Buttons
  $("copyMsgBtn").onclick = copyDiscordMessage;
  $("copyBtn").onclick = () => {
    canvas.toBlob(blob => {
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]);
      $("copyBtn").textContent = "تم النسخ ✅";
      setTimeout(() => $("copyBtn").textContent = "حفظ للمحفظة", 1200);
    });
  };

  // Doctor Modal logic (Keep yours)
  $("doctorBtn").onclick = () => { $("doctorModal").style.display = "grid"; };
  $("doctorCancel").onclick = $("doctorClose").onclick = () => { $("doctorModal").style.display = "none"; };
  
  $("doctorSigModeM").onchange = (e) => {
    $("doctorSigTypedWrapM").style.display = e.target.value === 'typed' ? 'block' : 'none';
    $("doctorSigUploadWrapM").style.display = e.target.value === 'upload' ? 'block' : 'none';
  };

  $("doctorSave").onclick = () => {
    state.doctorName = $("doctorNameM").value || state.doctorName;
    state.doctorPrinted = $("doctorPrintedM").value;
    state.doctorSigMode = $("doctorSigModeM").value;
    state.doctorSigTyped = $("doctorSigTypedM").value;
    
    if(state.doctorSigMode === 'upload' && inputs.doctorSigUploadM.files[0]){
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          state.doctorSigImage = img;
          render();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(inputs.doctorSigUploadM.files[0]);
    }
    
    $("doctorModal").style.display = "none";
    render();
  };

  render();
}

init();
