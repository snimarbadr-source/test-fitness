let gymWatermark = null;

// الترتيب الثابت للتقرير النهائي (لا يتأثر بسحب المستخدم)
const STATIC_ORDER = [
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
  insurance: "", // فضي، ذهبي، بلاتيني
  doctorName: "د. سنمار بدر",
  doctorExtras: [],
  doctorPrinted: "",
  doctorSigMode: "none",
  doctorSigTyped: "",
  doctorSigScale: 1.0,
  doctorSigImage: null,
  doctorSigDataUrl: null,
  // تخزين القيم بناءً على اسم التمرين لضمان عدم ضياعها عند تغيير الترتيب
  testValues: STATIC_ORDER.reduce((acc, name) => ({ ...acc, [name]: 0 }), {}),
  userTestOrder: [...STATIC_ORDER] // الترتيب القابل للتغيير في الواجهة
};

const $ = (id) => document.getElementById(id);
const canvas = $("report");
const ctx = canvas.getContext("2d");

const inputs = {
  name: $("name"),
  testNo: $("testNo"),
  nid: $("nid"),
  insurance: $("insuranceSelect"),
  doctorNameM: $("doctorNameM"),
  doctorPrintedM: $("doctorPrintedM"),
  doctorSigModeM: $("doctorSigModeM"),
  doctorSigTypedM: $("doctorSigTypedM"),
  testsList: $("testsList")
};

// ---- Boot & Patch Notes ----
window.addEventListener("DOMContentLoaded", () => {
  const intro = $("intro");
  const patchModal = $("patchModal");
  
  function showPatchNotes() {
    const seen = localStorage.getItem("patch_v8_seen");
    if (!seen) {
      patchModal.style.display = "flex";
    }
  }

  $("skipIntro")?.addEventListener("click", () => {
    intro.style.display = "none";
    showPatchNotes();
  });

  $("closePatch")?.addEventListener("click", () => {
    patchModal.style.display = "none";
    localStorage.setItem("patch_v8_seen", "true");
  });

  setTimeout(() => {
    if (intro.style.display !== "none") {
      intro.style.display = "none";
      showPatchNotes();
    }
  }, 4000);
});

// ---- Insurance Logic ----
inputs.insurance.addEventListener("change", (e) => {
  state.insurance = e.target.value;
  save();
});

// ---- Drag & Drop Logic for Tests ----
function mountTests() {
  inputs.testsList.innerHTML = "";
  state.userTestOrder.forEach((name, index) => {
    const row = makeTestRow(name);
    row.draggable = true;
    
    row.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', index);
      row.style.opacity = '0.5';
    });

    row.addEventListener('dragover', (e) => e.preventDefault());

    row.addEventListener('drop', (e) => {
      e.preventDefault();
      const fromIndex = e.dataTransfer.getData('text/plain');
      const toIndex = index;
      
      const movedItem = state.userTestOrder.splice(fromIndex, 1)[0];
      state.userTestOrder.splice(toIndex, 0, movedItem);
      
      mountTests();
      save();
    });

    row.addEventListener('dragend', () => row.style.opacity = '1');
    
    inputs.testsList.appendChild(row);
  });
}

function makeTestRow(name) {
  const wrap = document.createElement("div");
  wrap.className = "testRow";
  const val = state.testValues[name] || 0;

  wrap.innerHTML = `
    <div class="testTop">
      <div class="testName">☰ ${name}</div>
      <div class="testPct">${val}%</div>
    </div>
    <div class="testCtl">
      <input type="range" min="0" max="100" value="${val}">
      <button class="btn">100%</button>
    </div>
  `;

  const range = wrap.querySelector('input');
  const pctText = wrap.querySelector('.testPct');
  const btn100 = wrap.querySelector('button');

  range.addEventListener('input', () => {
    state.testValues[name] = Number(range.value);
    pctText.textContent = `${range.value}%`;
    save();
  });

  btn100.addEventListener('click', () => {
    state.testValues[name] = 100;
    range.value = 100;
    pctText.textContent = "100%";
    save();
  });

  return wrap;
}

// ---- Discord Message Builder ----
function buildDiscordMessage() {
  const nm = state.name.trim() || "—";
  const nid = state.nid.trim() || "—";
  const ins = state.insurance ? `\nنوع التأمين : ${state.insurance}` : "";
  
  return "```\n" +
         "الاسم : " + nm + "\n" +
         "الرقم الوطني : " + nid + "\n" +
         "نوع التقرير: فحص لياقه" + ins + "\n" +
         "```";
}

// ---- Canvas Drawing (Simplified for brevity, uses STATIC_ORDER) ----
function render(t = performance.now()) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBg(t); // تأكد من وجود دالة drawBg من الكود الأصلي
  drawHeader(); 

  // رسم الفحوصات بالترتيب الثابت دائماً
  const x = 90, y = 370, w = canvas.width - 180, h = 660;
  // ... (رسم خلفية الفحوصات)

  STATIC_ORDER.forEach((name, i) => {
    const col = (i < 5) ? 0 : 1;
    const row = (i < 5) ? i : i - 5;
    const val = state.testValues[name] || 0;
    // ارسم النص والنسبة هنا باستخدام إحداثيات col و row
    // هذا يضمن أن "تمرين الجري" دائماً أول واحد في الورقة مهما رتبه المستخدم في اللوحة
  });
  
  drawInfo(t);
  drawFooter();
}

// ---- Persistence ----
function save() {
  localStorage.setItem("fitness_v8_state", JSON.stringify({
    ...state,
    doctorSigImage: null // لا نخزن ملفات الصور مباشرة
  }));
  render();
}

function restore() {
  const raw = localStorage.getItem("fitness_v8_state");
  if (raw) {
    const p = JSON.parse(raw);
    Object.assign(state, p);
  }
  inputs.name.value = state.name || "";
  inputs.testNo.value = state.testNo || "";
  inputs.nid.value = state.nid || "";
  inputs.insurance.value = state.insurance || "";
  mountTests();
  render();
}

// باقي دوال الرسم (drawBg, drawHeader, drawInfo, drawFooter) 
// ودواد التحميل (downloadPNG, copyDiscordMessage) تبقى كما هي في ملفك الأصلي.

async function copyDiscordMessage() {
  const text = buildDiscordMessage();
  await navigator.clipboard.writeText(text);
  const btn = $("copyMsgBtn");
  btn.textContent = "تم النسخ ✅";
  setTimeout(() => btn.textContent = "نسخ الرسالة", 1500);
}

// تشغيل النظام
restore();
// استدعى Assets ثم ابدأ الـ Loop كما في كودك الأصلي.
