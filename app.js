let gymWatermark = null;

const TESTS = [
  "تمرين الجري", "تمرين الباي دمبل", "تمرين الصدر بار", "تمرين اكتاف", "تمرين الضغط",
  "تمرين بوكسينق", "تمرين الباي بار", "تمرين الجلوس", "تمرين الصدر دمبل", "تمرين رفع الى اعلى"
];

const state = {
  name: "", testNo: "", nid: "", insurance: "",
  doctorName: "د. سنمار بدر", doctorExtras: [], doctorSigMode: "none",
  tests: TESTS.map(() => 0),
  userOrder: [...Array(TESTS.length).keys()]
};

const $ = (id) => document.getElementById(id);
const canvas = $("report");
const ctx = canvas.getContext("2d");

// ---- Boot & Patch Notes ----
window.addEventListener("DOMContentLoaded", () => {
    $("skipIntro").onclick = () => {
        $("intro").style.display = "none";
        if (!localStorage.getItem("patch_v1_seen")) {
            $("patchModal").style.display = "flex";
        }
    };
    $("closePatch").onclick = () => {
        $("patchModal").style.display = "none";
        localStorage.setItem("patch_v1_seen", "true");
    };
    init();
});

// ---- نظام الترتيب والترميم ----
function mountTests() {
    const container = $("testsList");
    container.innerHTML = "";
    state.userOrder.forEach((originalIdx, currentPos) => {
        const name = TESTS[originalIdx];
        const val = state.tests[originalIdx];
        const row = document.createElement("div");
        row.className = "testRow";
        row.draggable = true;
        row.innerHTML = `<div class="testTop"><span>☰ ${name}</span><b>${val}%</b></div>
                         <input type="range" min="0" max="100" value="${val}" style="width:100%">`;
        
        row.ondragstart = (e) => e.dataTransfer.setData("idx", currentPos);
        row.ondragover = (e) => e.preventDefault();
        row.ondrop = (e) => {
            const from = e.dataTransfer.getData("idx");
            const item = state.userOrder.splice(from, 1)[0];
            state.userOrder.splice(currentPos, 0, item);
            mountTests();
            render();
        };
        row.querySelector("input").oninput = (e) => {
            state.tests[originalIdx] = e.target.value;
            row.querySelector("b").textContent = e.target.value + "%";
            render();
        };
        container.appendChild(row);
    });
}

// ---- نسخ الرسالة ----
$("copyMsgBtn").onclick = () => {
    const ins = state.insurance ? `\nنوع التأمين : ${state.insurance}` : "";
    const msg = "```\n" + `الاسم : ${state.name || "—"}\nالرقم الوطني : ${state.nid || "—"}\nنوع التقرير: فحص لياقه${ins}\n` + "```";
    navigator.clipboard.writeText(msg);
    $("copyMsgBtn").textContent = "تم النسخ ✅";
    setTimeout(() => $("copyMsgBtn").textContent = "نسخ الرسالة", 1500);
};

$("insuranceSelect").onchange = (e) => { state.insurance = e.target.value; render(); };

// ---- الرسم (التقرير يظل ثابتاً برغم الترتيب) ----
function drawTests() {
    TESTS.forEach((name, i) => {
        const val = state.tests[i];
        const x = i < 5 ? 90 : 724;
        const y = 370 + (i % 5) * 125;
        // رسم المربعات والنسب كما في ملفك الأصلي
        ctx.fillStyle = "#f8f9fa";
        ctx.roundRect(x, y, 600, 100, 15);
        ctx.fill();
        ctx.fillStyle = "#000";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "right";
        ctx.fillText(name, x + 570, y + 60);
        ctx.textAlign = "left";
        ctx.fillText(val + "%", x + 30, y + 60);
    });
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // استدعاء دوال الرسم الأصلية (drawBg, drawHeader, إلخ)
    drawTests(); 
}

function init() {
    mountTests();
    render();
}
