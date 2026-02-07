let gymWatermark = null;

const TESTS = [
  "تمرين الجري", "تمرين الباي دمبل", "تمرين الصدر بار", "تمرين اكتاف", "تمرين الضغط",
  "تمرين بوكسينق", "تمرين الباي بار", "تمرين الجلوس", "تمرين الصدر دمبل", "تمرين رفع الى اعلى"
];

const state = {
  name: "", testNo: "", nid: "", insurance: "",
  doctorName: "د. سنمار بدر", doctorExtras: [], doctorPrinted: "",
  doctorSigMode: "none", doctorSigTyped: "", doctorSigScale: 1.0,
  doctorSigImage: null,
  tests: TESTS.map(() => 0),
  uiOrder: [...Array(TESTS.length).keys()]
};

const $ = (id) => document.getElementById(id);
const canvas = $("report");
const ctx = canvas.getContext("2d");

// ---- نظام الـ Intro والباتش نوت ----
function setupIntro() {
  const skipBtn = $("skipIntro");
  if (skipBtn) {
    skipBtn.onclick = () => {
      $("intro").setAttribute("aria-hidden", "true");
      // إظهار نافذة التحديثات إذا لم يراها المستخدم من قبل
      if (!localStorage.getItem("patch_v2_seen")) {
        const patch = $("patchNotes");
        if(patch) patch.style.display = "grid";
      }
    };
  }
  
  const closePatch = $("closePatch");
  if (closePatch) {
    closePatch.onclick = () => {
      $("patchNotes").style.display = "none";
      localStorage.setItem("patch_v2_seen", "true");
    };
  }
}

// ---- إنشاء قائمة الفحوصات الجانبية ----
function mountTests() {
  const container = $("testsList");
  if (!container) return;
  container.innerHTML = "";
  
  state.uiOrder.forEach((originalIndex, currentPos) => {
    const name = TESTS[originalIndex];
    const pct = state.tests[originalIndex];
    
    const row = document.createElement("div");
    row.className = "testRow";
    row.draggable = true;
    
    row.innerHTML = `
      <div class="testTop">
        <div class="testName">☰ ${name}</div>
        <div class="testPct">${pct}%</div>
      </div>
      <div class="testCtl">
        <input type="range" min="0" max="100" value="${pct}">
      </div>
    `;

    const rng = row.querySelector("input");
    rng.oninput = (e) => {
      state.tests[originalIndex] = parseInt(e.target.value);
      row.querySelector(".testPct").textContent = e.target.value + "%";
      render(); // تحديث التقرير فوراً
    };

    // السحب والإفلات
    row.ondragstart = (e) => {
      row.classList.add("dragging");
      e.dataTransfer.setData("text/plain", currentPos);
    };
    row.ondragend = () => row.classList.remove("dragging");
    row.ondragover = (e) => e.preventDefault();
    row.ondrop = (e) => {
      const fromPos = parseInt(e.dataTransfer.getData("text/plain"));
      const movedItem = state.uiOrder.splice(fromPos, 1)[0];
      state.uiOrder.splice(currentPos, 0, movedItem);
      mountTests();
    };

    container.appendChild(row);
  });
}

// ---- وظائف النسخ والحفظ ----
function copyDiscordMessage() {
  const nm = state.name.trim() || "سنمار";
  const nid = state.nid.trim() || "5775";
  const ins = state.insurance ? `\nنوع التأمين : ${state.insurance}` : "";
  const text = "```\n" + `الاسم : ${nm}\nالرقم الوطني : ${nid}\nنوع التقرير: فحص لياقه${ins}\n` + "```";

  navigator.clipboard.writeText(text).then(() => {
    $("copyMsgBtn").textContent = "تم النسخ ✅";
    setTimeout(() => $("copyMsgBtn").textContent = "نسخ الرسالة", 1500);
  });
}

// ---- محرك الرسم (الكانفاس الأصلي) ----
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // خلفية بيضاء
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // رسم الهيدر (المستطيل الأسود)
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.roundRect(60, 60, 1294, 240, 30);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.font = "900 64px Arial";
  ctx.textAlign = "right";
  ctx.fillText("مستشفى ريسبكت", 1300, 160);

  // رسم الفحوصات (تظل مرتبة رسمياً)
  TESTS.forEach((name, i) => {
    const val = state.tests[i];
    const col = i < 5 ? 0 : 1;
    const row = i % 5;
    const x = 60 + (col * 664);
    const y = 380 + (row * 144);

    ctx.fillStyle = "#f8f9fc";
    ctx.beginPath();
    ctx.roundRect(x, y, 630, 110, 20);
    ctx.fill();
    
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "right";
    ctx.fillText(name, x + 580, y + 65);
    
    ctx.fillStyle = val === 100 ? "#009e66" : "#667";
    ctx.textAlign = "left";
    ctx.font = "900 32px Arial";
    ctx.fillText(val + "%", x + 40, y + 65);
  });

  // بيانات الشخص
  const infoY = 1150;
  ctx.fillStyle = "#f8f9fc";
  ctx.beginPath();
  ctx.roundRect(60, infoY, 1294, 300, 30);
  ctx.fill();
  ctx.fillStyle = "#1a1a1a";
  ctx.textAlign = "right";
  ctx.fillText("الاسم: " + (state.name || "ــــــــــــــــ"), 1300, infoY + 130);
  ctx.fillText("الرقم الوطني: " + (state.nid || "ــــــــــــــــ"), 1300, infoY + 200);

  // الطبيب
  ctx.fillText(state.doctorName, 1300, 1650);
}

// ---- تشغيل كل شيء عند البدء ----
function init() {
  setupIntro();
  mountTests();
  
  // ربط المدخلات
  $("name").oninput = (e) => { state.name = e.target.value; render(); };
  $("nid").oninput = (e) => { state.nid = e.target.value; render(); };
  const insType = $("insuranceType");
  if(insType) insType.onchange = (e) => { state.insurance = e.target.value; };

  // ربط الأزرار
  $("copyMsgBtn").onclick = copyDiscordMessage;
  $("doctorBtn").onclick = () => { $("doctorModal").style.display = "grid"; };
  $("doctorClose").onclick = $("doctorCancel").onclick = () => { $("doctorModal").style.display = "none"; };
  
  $("doctorSave").onclick = () => {
    state.doctorName = $("doctorNameM").value || state.doctorName;
    $("doctorModal").style.display = "none";
    render();
  };

  $("copyBtn").onclick = () => {
    canvas.toBlob(blob => {
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]);
      $("copyBtn").textContent = "تم النسخ ✅";
      setTimeout(() => $("copyBtn").textContent = "حفظ للمحفظة", 1200);
    });
  };

  render();
}

init();
