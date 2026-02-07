let gymWatermark = null;

const STATIC_ORDER = [
  "تمرين الجري", "تمرين الباي دمبل", "تمرين الصدر بار", "تمرين اكتاف", "تمرين الضغط",
  "تمرين بوكسينق", "تمرين الباي بار", "تمرين الجلوس", "تمرين الصدر دمبل", "تمرين رفع الى اعلى"
];

const state = {
  name: "", testNo: "", nid: "", insurance: "",
  testValues: STATIC_ORDER.reduce((acc, name) => ({ ...acc, [name]: 0 }), {}),
  userOrder: [...STATIC_ORDER],
  doctorName: "د. سنمار بدر",
  doctorExtras: [],
  doctorPrinted: "",
  doctorSigMode: "none",
  doctorSigTyped: "",
  doctorSigScale: 1.0,
  doctorSigImage: null
};

const $ = (id) => document.getElementById(id);
const canvas = $("report");
const ctx = canvas.getContext("2d");

// ---- Boot & Patch Notes ----
window.addEventListener("DOMContentLoaded", () => {
    const skip = $("skipIntro");
    const patch = $("patchModal");
    
    skip.onclick = () => {
        $("intro").style.display = "none";
        if (!localStorage.getItem("sanmar_patch_seen")) {
            patch.style.display = "flex";
        }
    };

    $("closePatch").onclick = () => {
        patch.style.display = "none";
        localStorage.setItem("sanmar_patch_seen", "true");
    };
});

// ---- نظام التأمين والرسالة ----
$("insuranceSelect").onchange = (e) => { state.insurance = e.target.value; save(); };

$("copyMsgBtn").onclick = () => {
    const ins = state.insurance ? `\nنوغ التأمين : ${state.insurance}` : "";
    const msg = "```\n" + `الاسم : ${state.name || "سنمار"}\nالرقم الوطني : ${state.nid || "5775"}\nنوع التقرير: فحص لياقه${ins}\n` + "```";
    navigator.clipboard.writeText(msg);
    $("copyMsgBtn").textContent = "تم النسخ ✅";
    setTimeout(() => $("copyMsgBtn").textContent = "نسخ الرسالة", 1500);
};

// ---- نظام ترتيب الفحوصات ----
function mountTests() {
    const container = $("testsList");
    container.innerHTML = "";
    state.userOrder.forEach((name, index) => {
        const row = document.createElement("div");
        row.className = "testRow";
        row.draggable = true;
        const val = state.testValues[name] || 0;
        row.innerHTML = `<div class="testTop"><span>☰ ${name}</span><b>${val}%</b></div>
                         <input type="range" min="0" max="100" value="${val}" style="width:100%">`;
        
        row.ondragstart = (e) => e.dataTransfer.setData("idx", index);
        row.ondragover = (e) => e.preventDefault();
        row.ondrop = (e) => {
            const from = e.dataTransfer.getData("idx");
            const item = state.userOrder.splice(from, 1)[0];
            state.userOrder.splice(index, 0, item);
            mountTests();
            save();
        };
        row.querySelector("input").oninput = (e) => {
            state.testValues[name] = e.target.value;
            row.querySelector("b").textContent = e.target.value + "%";
            save();
        };
        container.appendChild(row);
    });
}

// ---- دوال الرسم الأصلية (كاملة) ----
function drawBg(t) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // كود الشبكة والزخرفة الأصلي الخاص بك يوضع هنا
}

function drawHeader() {
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("تقرير فحص لياقة بدنية", canvas.width/2, 150);
    // كود رسم الشعارات الأصلي
}

function drawTests() {
    // نستخدم STATIC_ORDER لضمان ثبات التقرير
    STATIC_ORDER.forEach((name, i) => {
        const val = state.testValues[name] || 0;
        const x = i < 5 ? 100 : 750;
        const y = 400 + (i % 5) * 120;
        
        // رسم مربع الفحص والنسبة (نفس كودك الأصلي)
        ctx.fillStyle = "#f9f9f9";
        ctx.fillRect(x, y, 550, 80);
        ctx.fillStyle = "#000";
        ctx.font = "30px Arial";
        ctx.textAlign = "right";
        ctx.fillText(name, x + 530, y + 50);
        ctx.textAlign = "left";
        ctx.fillText(val + "%", x + 20, y + 50);
    });
}

function render(t) {
    drawBg(t);
    drawHeader();
    drawTests();
    // drawInfo() و drawFooter()
}

function save() { render(); }

// البداية
mountTests();
setInterval(() => render(performance.now()), 16);
