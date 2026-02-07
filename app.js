let gymWatermark = null;

const TESTS = [
  "تمرين الجري", "تمرين الباي دمبل", "تمرين الصدر بار", "تمرين اكتاف", "تمرين الضغط",
  "تمرين بوكسينق", "تمرين الباي بار", "تمرين الجلوس", "تمرين الصدر دمبل", "تمرين رفع الى اعلى"
];

const state = {
  name: "", testNo: "", nid: "", insurance: "",
  doctorName: "د. سنمار بدر", doctorSigMode: "none",
  tests: TESTS.map(() => 0),
  uiOrder: [...Array(TESTS.length).keys()]
};

const $ = (id) => document.getElementById(id);
const canvas = $("report");
const ctx = canvas.getContext("2d");

// ---- وظيفة السحب والترتيب (للواجهة فقط) ----
function mountTests() {
  const container = $("testsList");
  if (!container) return;
  container.innerHTML = "";
  
  state.uiOrder.forEach((idx, pos) => {
    const row = document.createElement("div");
    row.className = "testRow";
    row.draggable = true;
    row.innerHTML = `
      <div class="testTop">
        <div class="testName">☰ ${TESTS[idx]}</div>
        <div class="testPct">${state.tests[idx]}%</div>
      </div>
      <div class="testCtl">
        <input type="range" min="0" max="100" value="${state.tests[idx]}">
      </div>
    `;

    const rng = row.querySelector("input");
    rng.oninput = (e) => {
      state.tests[idx] = parseInt(e.target.value);
      row.querySelector(".testPct").textContent = e.target.value + "%";
      render(); // تحديث فوري للتقرير النهائي
    };

    row.ondragstart = (e) => { e.dataTransfer.setData("pos", pos); row.classList.add("dragging"); };
    row.ondragover = (e) => e.preventDefault();
    row.ondrop = (e) => {
      const fromPos = e.dataTransfer.getData("pos");
      const movedItem = state.uiOrder.splice(fromPos, 1)[0];
      state.uiOrder.splice(pos, 0, movedItem);
      mountTests();
    };
    row.ondragend = () => row.classList.remove("dragging");
    container.appendChild(row);
  });
}

// ---- محرك الرسم الأصلي (من ملفاتك بدون تعديل التصميم) ----
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // خلفية بيضاء و شبكة
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // رسم الهيدر (المستطيل الأسود)
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath(); ctx.roundRect(60, 60, 1294, 240, 30); ctx.fill();
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 64px system-ui"; ctx.textAlign = "right";
  ctx.fillText("مستشفى ريسبكت", 1300, 160);
  
  // رسم الفحوصات (بنفس التنسيق الأصلي)
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
    ctx.font = "900 32px system-ui";
    ctx.fillText(val + "%", x + 40, y + 65);
  });

  // منطقة البيانات والختم
  const infoY = 1150;
  ctx.fillStyle = "#f8f9fc"; ctx.beginPath(); ctx.roundRect(60, infoY, 1294, 300, 30); ctx.fill();
  ctx.fillStyle = "#1a1a1a"; ctx.textAlign = "right";
  ctx.fillText("الاسم: " + (state.name || "ــــــــــــــــ"), 1300, infoY + 130);
  ctx.fillText("الرقم الوطني: " + (state.nid || "ــــــــــــــــ"), 1300, infoY + 200);

  // اسم الطبيب
  ctx.font = "900 32px system-ui";
  ctx.fillText(state.doctorName, 1300, 1650);
}

// ---- إدارة المدخلات والإنترو ----
function init() {
  mountTests();
  
  $("skipIntro").onclick = () => { 
    $("intro").style.display = "none"; 
  };
  
  $("name").oninput = (e) => { state.name = e.target.value; render(); };
  $("nid").oninput = (e) => { state.nid = e.target.value; render(); };
  $("insuranceType").onchange = (e) => { state.insurance = e.target.value; };

  // نسخ الرسالة للديسكورد مع التأمين
  $("copyMsgBtn").onclick = () => {
    const ins = state.insurance ? `\nنوع التأمين : ${state.insurance}` : "";
    const text = "```\n" + `الاسم : ${state.name || "سنمار"}\nالرقم الوطني : ${state.nid || "5775"}\nنوع التقرير: فحص لياقه${ins}\n` + "```";
    navigator.clipboard.writeText(text).then(() => {
      $("copyMsgBtn").textContent = "تم النسخ ✅";
      setTimeout(() => $("copyMsgBtn").textContent = "نسخ الرسالة", 1500);
    });
  };

  render();
}

init();
