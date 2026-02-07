// الترتيب الثابت للتقرير الورقي (لا يتغير أبداً)
const STATIC_ORDER = [
  "تمرين الجري", "تمرين الباي دمبل", "تمرين الصدر بار", "تمرين اكتاف", "تمرين الضغط",
  "تمرين بوكسينق", "تمرين الباي بار", "تمرين الجلوس", "تمرين الصدر دمبل", "تمرين رفع الى اعلى"
];

const state = {
  name: "", testNo: "", nid: "", insurance: "",
  testValues: STATIC_ORDER.reduce((acc, name) => ({ ...acc, [name]: 0 }), {}),
  userOrder: [...STATIC_ORDER], // الترتيب اللي يظهر للمستخدم في اللوحة
  doctorName: "د. سنمار بدر"
};

const $ = (id) => document.getElementById(id);
const canvas = $("report");
const ctx = canvas.getContext("2d");

// ---- نظام الـ Patch Notes ----
window.addEventListener("load", () => {
  const skip = $("skipIntro");
  const patch = $("patchModal");
  
  const showPatch = () => {
    if (!localStorage.getItem("patch_seen_v1")) {
      patch.style.display = "flex";
    }
  };

  skip.onclick = () => {
    $("intro").style.display = "none";
    showPatch();
  };

  $("closePatch").onclick = () => {
    patch.style.display = "none";
    localStorage.setItem("patch_seen_v1", "true");
  };
});

// ---- نظام السحب والإفلات وتوليد القائمة ----
function mountTests() {
  const container = $("testsList");
  container.innerHTML = "";
  
  state.userOrder.forEach((name, index) => {
    const row = document.createElement("div");
    row.className = "testRow";
    row.draggable = true;
    const val = state.testValues[name];

    row.innerHTML = `
      <div class="testTop">
        <div class="testName">☰ ${name}</div>
        <div class="testPct">${val}%</div>
      </div>
      <div class="testCtl">
        <input type="range" min="0" max="100" value="${val}">
      </div>
    `;

    // سحب وإفلات
    row.ondragstart = (e) => e.dataTransfer.setData("index", index);
    row.ondragover = (e) => e.preventDefault();
    row.ondrop = (e) => {
      const from = e.dataTransfer.getData("index");
      const item = state.userOrder.splice(from, 1)[0];
      state.userOrder.splice(index, 0, item);
      mountTests();
      save();
    };

    // تغيير القيم
    row.querySelector("input").oninput = (e) => {
      state.testValues[name] = e.target.value;
      row.querySelector(".testPct").textContent = e.target.value + "%";
      save();
    };

    container.appendChild(row);
  });
}

// ---- نسخ الرسالة المطور ----
$("copyMsgBtn").onclick = () => {
  const insText = state.insurance ? `\nنوغ التأمين : ${state.insurance}` : "";
  const msg = "```\n" +
              `الاسم : ${state.name || "غير محدد"}\n` +
              `الرقم الوطني : ${state.nid || "غير محدد"}\n` +
              `نوع التقرير: فحص لياقه${insText}\n` +
              "```";
  
  navigator.clipboard.writeText(msg).then(() => {
    const btn = $("copyMsgBtn");
    btn.textContent = "تم النسخ ✅";
    setTimeout(() => btn.textContent = "نسخ الرسالة", 1500);
  });
};

// ---- الرسم على الكانفاس (التقرير) ----
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // (هنا تضع دوال الرسم الأصلية drawBg, drawHeader إلخ...)
  
  // رسم الفحوصات حسب STATIC_ORDER لضمان عدم تغير شكل التقرير
  STATIC_ORDER.forEach((name, i) => {
    const val = state.testValues[name];
    // منطق الرسم الخاص بك هنا...
  });
}

// ربط مدخلات التأمين والبيانات
$("insurance").onchange = (e) => { state.insurance = e.target.value; save(); };
$("name").oninput = (e) => { state.name = e.target.value; save(); };
$("nid").oninput = (e) => { state.nid = e.target.value; save(); };

function save() { render(); }

// تشغيل البداية
mountTests();
