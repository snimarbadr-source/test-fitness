// الكود الأصلي المستخرج من ملفاتك مع الإضافات
const TESTS = [
  "تمرين الجري", "تمرين الباي دمبل", "تمرين الصدر بار", "تمرين اكتاف", "تمرين الضغط",
  "تمرين بوكسينق", "تمرين الباي بار", "تمرين الجلوس", "تمرين الصدر دمبل", "تمرين رفع الى اعلى"
];

const state = {
  name: "", testNo: "", nid: "", insurance: "",
  doctorName: "د. سنمار بدر", doctorSigMode: "none", doctorSigTyped: "",
  tests: TESTS.map(() => 0),
  uiOrder: [...Array(TESTS.length).keys()] // الترتيب الظاهري فقط
};

const $ = (id) => document.getElementById(id);
const canvas = $("report");
const ctx = canvas.getContext("2d");

// ---- نظام الترتيب بالسحب ----
function mountTests() {
  const container = $("testsList");
  container.innerHTML = "";
  state.uiOrder.forEach((idx, pos) => {
    const row = document.createElement("div");
    row.className = "testRow";
    row.draggable = true;
    row.innerHTML = `
      <div class="testTop"><span class="testName">☰ ${TESTS[idx]}</span><span class="testPct">${state.tests[idx]}%</span></div>
      <div class="testCtl"><input type="range" min="0" max="100" value="${state.tests[idx]}"></div>
    `;
    
    const rng = row.querySelector("input");
    rng.oninput = (e) => {
      state.tests[idx] = parseInt(e.target.value);
      row.querySelector(".testPct").textContent = e.target.value + "%";
      render(); // تحديث مباشر
    };

    row.ondragstart = (e) => { e.dataTransfer.setData("pos", pos); row.style.opacity = "0.5"; };
    row.ondragend = () => row.style.opacity = "1";
    row.ondragover = (e) => e.preventDefault();
    row.ondrop = (e) => {
      const fromPos = e.dataTransfer.getData("pos");
      const movedItem = state.uiOrder.splice(fromPos, 1)[0];
      state.uiOrder.splice(pos, 0, movedItem);
      mountTests();
    };
    container.appendChild(row);
  });
}

// ---- وظائف النسخ ----
$("copyMsgBtn").onclick = () => {
  const ins = state.insurance ? `\nنوع التأمين : ${state.insurance}` : "";
  const text = "```\n" + `الاسم : ${state.name || "سنمار"}\nالرقم الوطني : ${state.nid || "5775"}\nنوع التقرير: فحص لياقه${ins}\n` + "```";
  navigator.clipboard.writeText(text);
  $("copyMsgBtn").textContent = "تم النسخ ✅";
  setTimeout(() => $("copyMsgBtn").textContent = "نسخ الرسالة", 1500);
};

// ---- محرك الرسم الأصلي (بدون تعديل في الأبعاد) ----
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 1. الخلفية والشبكة (من كودك الأصلي)
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(0,0,0,0.03)";
  for(let i=0; i<canvas.width; i+=40){ ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke(); }

  // 2. الهيدر (من كودك الأصلي)
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath(); ctx.roundRect(60, 60, 1294, 240, 30); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "900 64px system-ui"; ctx.textAlign = "right";
  ctx.fillText("مستشفى ريسبكت", 1300, 160);

  // 3. رسم الفحوصات (بنفس الترتيب الرسمي الأصلي)
  TESTS.forEach((name, i) => {
    const val = state.tests[i];
    const col = i < 5 ? 0 : 1;
    const row = i % 5;
    const x = 60 + (col * 664);
    const y = 380 + (row * 144);
    
    ctx.fillStyle = "#f8f9fc";
    ctx.beginPath(); ctx.roundRect(x, y, 630, 110, 20); ctx.fill();
    ctx.fillStyle = "#1a1a1a"; ctx.font = "900 28px system-ui"; ctx.textAlign = "right";
    ctx.fillText(name, x + 580, y + 65);
    ctx.fillStyle = val === 100 ? "#009e66" : "#667"; ctx.textAlign = "left";
    ctx.fillText(val + "%", x + 40, y + 65);
  });

  // 4. الختم والبيانات (من كودك الأصلي)
  const infoY = 1150;
  ctx.fillStyle = "#f8f9fc"; ctx.beginPath(); ctx.roundRect(60, infoY, 1294, 300, 30); ctx.fill();
  ctx.fillStyle = "#1a1a1a"; ctx.textAlign = "right"; ctx.font = "700 28px system-ui";
  ctx.fillText("الاسـم : " + (state.name || "ــــــــــــــــ"), 1300, infoY + 130);
  
  // ختم لائق (كودك الأصلي)
  ctx.save(); ctx.translate(280, infoY + 150); ctx.rotate(-0.1);
  ctx.strokeStyle = "#009e66"; ctx.lineWidth = 6;
  ctx.strokeRect(-150, -60, 300, 120);
  ctx.fillStyle = "#009e66"; ctx.font = "900 48px system-ui"; ctx.textAlign = "center";
  ctx.fillText("لائــــق", 0, 18); ctx.restore();

  // الطبيب
  ctx.fillStyle = "#1a1a1a"; ctx.textAlign = "right";
  ctx.fillText(state.doctorName, 1300, 1650);
}

// ---- التشغيل ----
$("skipIntro").onclick = () => {
  $("intro").style.display = "none";
  if(!localStorage.getItem("p_seen")) { $("patchNotes").style.display = "grid"; }
};
$("closePatch").onclick = () => { $("patchNotes").style.display = "none"; localStorage.setItem("p_seen", "true"); };
$("name").oninput = (e) => { state.name = e.target.value; render(); };
$("nid").oninput = (e) => { state.nid = e.target.value; render(); };
$("insuranceType").onchange = (e) => { state.insurance = e.target.value; };
$("doctorBtn").onclick = () => $("doctorModal").style.display = "grid";
$("doctorClose").onclick = () => $("doctorModal").style.display = "none";
$("doctorSave").onclick = () => {
  state.doctorName = $("doctorNameM").value || state.doctorName;
  state.doctorSigTyped = $("doctorSigTypedM").value;
  $("doctorModal").style.display = "none";
  render();
};

// تشغيل ابتدائي
mountTests();
render();
