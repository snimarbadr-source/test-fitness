/**
 * RESPECT HOSPITAL - FITNESS SYSTEM PRO
 * Version: 3.0 (X-Edition)
 * -----------------------------------------
 */

// 1. القائمة الأصلية للفحوصات
let TESTS_DATA = [
    { id: 1, name: "تمرين الجري", val: 0 },
    { id: 2, name: "تمرين الباي دمبل", val: 0 },
    { id: 3, name: "تمرين الصدر بار", val: 0 },
    { id: 4, name: "تمرين اكتاف", val: 0 },
    { id: 5, name: "تمرين الضغط", val: 0 },
    { id: 6, name: "تمرين بوكسينق", val: 0 },
    { id: 7, name: "تمرين الباي بار", val: 0 },
    { id: 8, name: "تمرين الجلوس", val: 0 },
    { id: 9, name: "تمرين الصدر دمبل", val: 0 },
    { id: 10, name: "تمرين رفع الى اعلى", val: 0 }
];

const $ = (id) => document.getElementById(id);
const canvas = $("report");
const ctx = canvas.getContext("2d");

// --- حل مشكلة الإنترو ---
function terminateIntro() {
    const intro = $("intro");
    if (intro) {
        intro.style.opacity = "0";
        setTimeout(() => {
            intro.style.display = "none";
            checkPatchNotes();
        }, 500);
    }
}

function checkPatchNotes() {
    if (!localStorage.getItem("respect_v3_patch")) {
        $("patchModal").style.display = "flex";
    }
}

// --- نظام السحب والإفلات (Drag & Drop) ---
function renderDraggableList() {
    const container = $("testsList");
    container.innerHTML = "";
    
    TESTS_DATA.forEach((test, index) => {
        const item = document.createElement("div");
        item.className = "dragItem";
        item.draggable = true;
        item.dataset.index = index;
        
        item.innerHTML = `
            <div class="dragHandle">☰</div>
            <div class="dragInfo">
                <span>${test.name}</span>
                <input type="range" min="0" max="100" value="${test.val}" oninput="updateScore(${index}, this.value)">
            </div>
            <div class="dragBadge">${test.val}%</div>
        `;

        // أحداث السحب
        item.ondragstart = (e) => { e.dataTransfer.setData("text/plain", index); item.classList.add("dragging"); };
        item.ondragover = (e) => e.preventDefault();
        item.ondrop = (e) => {
            const fromIndex = e.dataTransfer.getData("text/plain");
            const toIndex = index;
            const movedItem = TESTS_DATA.splice(fromIndex, 1)[0];
            TESTS_DATA.splice(toIndex, 0, movedItem);
            saveAndRefresh();
        };
        item.ondragend = () => item.classList.remove("dragging");
        
        container.appendChild(item);
    });
}

function updateScore(index, value) {
    TESTS_DATA[index].val = parseInt(value);
    saveAndRefresh();
}

function saveAndRefresh() {
    drawReport();
    localStorage.setItem("respect_app_data", JSON.stringify(TESTS_DATA));
}

// --- محرك الرسم (Canvas Engine) ---
async function drawReport() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. الخلفية (أبيض ملكي)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. الهيدر (استخدام تصميمك الأصلي المبهر)
    ctx.fillStyle = "#070b14";
    ctx.font = "bold 60px system-ui";
    ctx.textAlign = "right";
    ctx.fillText("تقرير فحص اللياقة البدنية", 1350, 150);

    // 3. رسم البيانات
    ctx.font = "35px system-ui";
    ctx.fillStyle = "#333";
    ctx.fillText(`الاسم: ${$("name").value}`, 1350, 250);
    ctx.fillText(`الرقم الوطني: ${$("nid").value}`, 1350, 310);
    
    const ins = $("insuranceType").value;
    if (ins !== "none") {
        ctx.fillStyle = "#7c6cff";
        ctx.fillText(`نوع التأمين: ${ins}`, 1350, 370);
    }

    // 4. رسم الفحوصات بالترتيب الجديد
    let y = 500;
    TESTS_DATA.forEach(test => {
        drawTestBar(test.name, test.val, y);
        y += 120;
    });

    // إضافة توقيع بخيت مبخوت الثابت كما في الأصل
    drawFixedSignature();
}

function drawTestBar(name, score, y) {
    ctx.fillStyle = "#555";
    ctx.font = "30px system-ui";
    ctx.textAlign = "right";
    ctx.fillText(name, 1350, y);

    // شريط التقدم
    const barWidth = 1000;
    ctx.fillStyle = "#f0f0f0";
    ctx.roundRect(100, y - 25, barWidth, 30, 15);
    ctx.fill();

    const progressWidth = (score / 100) * barWidth;
    const grad = ctx.createLinearGradient(100, 0, 1100, 0);
    grad.addColorStop(0, "#7c6cff");
    grad.addColorStop(1, "#25f2a2");
    
    ctx.fillStyle = grad;
    ctx.roundRect(100, y - 25, progressWidth, 30, 15);
    ctx.fill();
    
    ctx.fillStyle = "#333";
    ctx.textAlign = "left";
    ctx.fillText(score + "%", 1120, y);
}

function drawFixedSignature() {
    ctx.textAlign = "center";
    ctx.fillStyle = "#888";
    ctx.font = "25px system-ui";
    ctx.fillText("توقيع المسؤول: بخيت مبخوت", 300, 1850);
}

// --- رسالة الديسكورد ---
function copyMsg() {
    const ins = $("insuranceType").value !== "none" ? `نوع التأمين: ${$("insuranceType").value}\n` : "";
    const msg = "```\n" +
                "الاسم : " + $("name").value + "\n" +
                "الرقم الوطني : " + $("nid").value + "\n" +
                "نوع التقرير: فحص لياقه\n" +
                ins +
                "```";
    navigator.clipboard.writeText(msg);
    $("copyMsgBtn").textContent = "تم النسخ ✅";
    setTimeout(() => $("copyMsgBtn").textContent = "نسخ الرسالة", 1500);
}

// --- البدء التشغيلي (Boot) ---
window.onload = () => {
    renderDraggableList();
    drawReport();
    
    $("skipIntro").onclick = terminateIntro;
    $("closePatch").onclick = () => $("patchModal").style.display = "none";
    $("copyMsgBtn").onclick = copyMsg;
    
    // إخفاء الإنترو تلقائياً بعد 3 ثوانٍ كأمان إضافي
    setTimeout(terminateIntro, 3500);

    // تحديث الرسم عند أي مدخلات
    document.querySelectorAll('input, select').forEach(el => {
        el.oninput = drawReport;
    });
};

// Polyfill for roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}
