// التكوين الأصلي
const TESTS = [
  "تمرين الجري", "تمرين الباي دمبل", "تمرين الصدر بار", "تمرين اكتاف", "تمرين الضغط",
  "تمرين بوكسينق", "تمرين الباي بار", "تمرين الجلوس", "تمرين الصدر دمبل", "تمرين رفع الى اعلى"
];

const state = {
  name: "", testNo: "", nid: "", insurance: "",
  doctorName: "د. سنمار بدر",
  tests: TESTS.map(() => 0),
  uiOrder: [...Array(TESTS.length).keys()]
};

const $ = (id) => document.getElementById(id);
const canvas = $("report");
const ctx = canvas.getContext("2d");

// ---- وظيفة ترتيب الفحوصات (تحديث مباشر) ----
function mountTests() {
  const container = $("testsList");
  container.innerHTML = "";
  state.uiOrder.forEach((idx, pos) => {
    const row = document.createElement("div");
    row.className = "testRow";
    row.draggable = true;
    row.innerHTML = `
      <div class="testTop"><span>☰ ${TESTS[idx]}</span><b class="pct">${state.tests[idx]}%</b></div>
      <div class="testCtl"><input type="range" min="0" max="100" value="${state.tests[idx]}"></div>
    `;
    
    const rng = row.querySelector("input");
    rng.oninput = (e) => {
      state.tests[idx] = parseInt(e.target.value);
      row.querySelector(".pct").textContent = e.target.value + "%";
      render(); // تحديث فوري للصورة النهائية
    };

    // منطق السحب والإفلات
    row.ondragstart = (e) => { e.dataTransfer.setData("pos", pos); row.classList.add("dragging"); };
    row.ondragover = (e) => e.preventDefault();
    row.ondrop = (e) => {
      const from = e.dataTransfer.getData("pos");
      const moved = state.uiOrder.splice(from, 1)[0];
      state.uiOrder.splice(pos, 0, moved);
      mountTests();
    };
    row.ondragend = () => row.classList.remove("dragging");
    container.appendChild(row);
  });
}

// ---- محرك الرسم الأصلي (التصميم النهائي) ----
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 1. الخلفية
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. الهيدر الأسود
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath(); ctx.roundRect(60, 60, 1294, 240, 30); ctx.fill();
  
  ctx.fillStyle = "#fff";
  ctx.font = "900 64px system-ui"; ctx.textAlign = "right";
  ctx.fillText("مستشفى ريسبكت", 1300, 160);
  ctx.font = "500 28px system-ui"; ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillText("Respect Hospital - Medical Center", 1300, 210);

  // 3. رسم الفحوصات (بنفس التنسيق الأصلي للصورة)
  TESTS.forEach((name, i) => {
    const val = state.tests[i];
    const col = i < 5 ? 0 : 1;
    const row = i % 5;
    const x = 60 + (col * 664);
    const y = 380 + (row * 144);

    ctx.fillStyle = "#f8f9fc";
    ctx.beginPath(); ctx.roundRect(x, y, 630, 110, 20); ctx.fill();
    ctx.fillStyle = "#1a1a1a"; ctx.textAlign = "right"; ctx.font = "900 28px system-ui";
    ctx.fillText(name, x + 580, y + 65);
    ctx.fillStyle = val === 100 ? "#009e66" : "#667"; ctx.textAlign = "left";
    ctx.font = "900 32px system-ui";
    ctx.fillText(val + "%", x + 40, y + 65);
  });

  // 4. بيانات الشخص والختم
  const infoY = 1150;
  ctx.fillStyle = "#f8f9fc"; ctx.beginPath(); ctx.roundRect(60, infoY, 1294, 300, 30); ctx.fill();
  ctx.fillStyle = "#1a1a1a"; ctx.textAlign = "right"; ctx.font = "700 28px system-ui";
  ctx.fillText("الاسـم : " + (state.name || "ــــــــــــــــ"), 1300, infoY + 130);
  ctx.fillText("الرقم الوطني : " + (state.nid || "ــــــــــــــــ"), 1300, infoY + 200);

  // رسم ختم "لائق" (الأصلي)
  ctx.save(); ctx.translate(280, infoY + 150); ctx.rotate(-0.1);
  ctx.strokeStyle = "#009e66"; ctx.lineWidth = 6;
  ctx.strokeRect(-150, -60, 300, 120);
  ctx.fillStyle = "#009e66"; ctx.font = "900 48px system-ui"; ctx.textAlign = "center";
  ctx.fillText("لائــــق", 0, 18); ctx.restore();

  // الطبيب
  ctx.fillStyle = "#1a1a1a"; ctx.textAlign = "right"; ctx.font = "900 32px system-ui";
  ctx.fillText(state.doctorName, 1300, 1650);
}

// ---- إدارة الأزرار والإنترو ----
function boot() {
  mountTests();
  
  $("skipIntro").onclick = () => { $("intro").style.display = "none"; };
  $("name").oninput = (e) => { state.name = e.target.value; render(); };
  $("nid").oninput = (e) => { state.nid = e.target.value; render(); };
  $("insuranceType").onchange = (e) => { state.insurance = e.target.value; };
  
  $("doctorBtn").onclick = () => $("doctorModal").style.display = "grid";
  $("doctorSave").onclick = () => {
    state.doctorName = $("doctorNameM").value || state.doctorName;
    $("doctorModal").style.display = "none";
    render();
  };

  // نسخ الرسالة مع التأمين
  $("copyMsgBtn").onclick = () => {
    const ins = state.insurance ? `\nنوع التأمين : ${state.insurance}` : "";
    const text = "```\n" + `الاسم : ${state.name || "سنمار"}\nالرقم الوطني : ${state.nid || "5775"}\nنوع التقرير: فحص لياقه${ins}\n` + "```";
    navigator.clipboard.writeText(text);
    $("copyMsgBtn").textContent = "تم النسخ ✅";
    setTimeout(() => $("copyMsgBtn").textContent = "نسخ الرسالة", 1500);
  };

  // حفظ الصورة
  $("copyBtn").onclick = () => {
    const link = document.createElement('a');
    link.download = `تقرير_${state.name || 'ليااقة'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  render();
}

boot();
