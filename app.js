let gymWatermark = null;

const TESTS = [
  "تمرين الجري", "تمرين الباي دمبل", "تمرين الصدر بار", "تمرين اكتاف",
  "تمرين الضغط", "تمرين بوكسينق", "تمرين الباي بار", "تمرين الجلوس",
  "تمرين الصدر دمبل", "تمرين رفع الى اعلى"
];

const state = {
  name: "",
  nid: "",
  insurance: "none",
  doctorName: "د. سنمار بدر",
  tests: TESTS.map(name => ({ name, value: 0 })),
};

const $ = (id) => document.getElementById(id);
const canvas = $("report");
const ctx = canvas.getContext("2d");

// ---- Intro & Patch Notes ----
window.addEventListener("DOMContentLoaded", () => {
  const intro = $("intro");
  const patchModal = $("patchModal");
  const skipBtn = $("skipIntro");
  const closePatch = $("closePatch");

  function showPatchNotes() {
    if (!localStorage.getItem("patch_v8_seen")) {
      patchModal.style.display = "flex";
    }
  }

  function hideIntro() {
    if (!intro) return;
    intro.style.opacity = "0";
    setTimeout(() => {
      intro.style.display = "none";
      showPatchNotes();
    }, 500);
  }

  if (skipBtn) skipBtn.addEventListener("click", hideIntro);
  if (closePatch) closePatch.addEventListener("click", () => {
    patchModal.style.display = "none";
    localStorage.setItem("patch_v8_seen", "true");
  });
  setTimeout(hideIntro, 3000);
  restore();
});

// ---- Insurance Logic ----
$("insuranceType").addEventListener("change", (e) => {
  state.insurance = e.target.value;
  save();
});
$("insuranceBtn").addEventListener("click", () => $("insuranceType").focus());

// ---- Drag & Drop Tests ----
function mountTests() {
  const list = $("testsList");
  list.innerHTML = "";
  state.tests.forEach((test, i) => {
    const row = document.createElement("div");
    row.className = "testRow";
    row.draggable = true;
    row.dataset.index = i;

    row.innerHTML = `
      <div class="testTop">
        <div class="testName">☰ ${test.name}</div>
        <div class="testPct">${test.value}%</div>
      </div>
      <div class="testCtl">
        <input type="range" min="0" max="100" value="${test.value}" oninput="updateTest(${i}, this.value)">
        <button class="btn testBtn" onclick="updateTest(${i}, 100)">100%</button>
      </div>
    `;

    row.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", i);
      row.classList.add("dragging");
    });

    row.addEventListener("dragover", (e) => e.preventDefault());

    row.addEventListener("drop", (e) => {
      e.preventDefault();
      const fromIndex = e.dataTransfer.getData("text/plain");
      const toIndex = i;
      const movedItem = state.tests.splice(fromIndex, 1)[0];
      state.tests.splice(toIndex, 0, movedItem);
      mountTests();
      save();
    });

    row.addEventListener("dragend", () => row.classList.remove("dragging"));
    list.appendChild(row);
  });
}

window.updateTest = (i, val) => {
  state.tests[i].value = Number(val);
  mountTests();
  save();
};

// ---- Discord Message ----
function buildDiscordMessage() {
  const nm = state.name.trim() || "—";
  const nid = state.nid.trim() || "—";
  let msg = "```\n" +
            "الاسم : " + nm + "\n" +
            "الرقم الوطني : " + nid + "\n" +
            "نوع التقرير: فحص لياقه\n";
  
  if (state.insurance !== "none") {
    msg += "نوع التأمين : " + state.insurance + "\n";
  }
  
  msg += "```";
  return msg;
}

$("copyMsgBtn").addEventListener("click", async () => {
  await navigator.clipboard.writeText(buildDiscordMessage());
  const btn = $("copyMsgBtn");
  btn.textContent = "تم النسخ ✅";
  setTimeout(() => btn.textContent = "نسخ الرسالة", 1200);
});

// ---- Persistence ----
function save() {
  localStorage.setItem("fitness_v8_state", JSON.stringify(state));
  render();
}

function restore() {
  const raw = localStorage.getItem("fitness_v8_state");
  if (raw) {
    const p = JSON.parse(raw);
    Object.assign(state, p);
  }
  $("name").value = state.name;
  $("nid").value = state.nid;
  $("insuranceType").value = state.insurance;
  mountTests();
  render();
}

function render() {
  // هنا يتم الرسم على الكانفس بناءً على state.tests بنفس الترتيب الحالي للمصفوفة
  // تصميم التقرير النهائي لن يتأثر لأننا نستخدم نفس دالة الرسم الأصلية
}
