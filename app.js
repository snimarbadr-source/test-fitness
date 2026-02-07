let gymWatermark = null;

const TESTS = [
  "تمرين الجري", "تمرين الباي دمبل", "تمرين الصدر بار", "تمرين اكتاف", "تمرين الضغط",
  "تمرين بوكسينق", "تمرين الباي بار", "تمرين الجلوس", "تمرين الصدر دمبل", "تمرين رفع الى اعلى"
];

const state = {
  name: "", testNo: "", nid: "", insurance: "",
  doctorName: "د. سنمار بدر", doctorPrinted: "",
  doctorSigMode: "none", doctorSigTyped: "", doctorSigScale: 1.0,
  doctorSigImage: null,
  tests: TESTS.map(() => 0),
  uiOrder: [...Array(TESTS.length).keys()] // نظام ترتيب الواجهة
};

const $ = (id) => document.getElementById(id);
const canvas = $("report");
const ctx = canvas.getContext("2d");

// ---- نظام الترتيب والسحب (تحديث مباشر) ----
function mountTests() {
    const container = $("testsList");
    container.innerHTML = "";
    state.uiOrder.forEach((originalIdx, currentPos) => {
        const name = TESTS[originalIdx];
        const val = state.tests[originalIdx];
        const row = document.createElement("div");
        row.className = "testRow";
        row.draggable = true;
        row.innerHTML = `
            <div class="testTop"><span>☰ ${name}</span><b class="pctText">${val}%</b></div>
            <div class="testCtl"><input type="range" min="0" max="100" value="${val}" style="width:100%"></div>
        `;

        const input = row.querySelector("input");
        input.oninput = (e) => {
            state.tests[originalIdx] = parseInt(e.target.value);
            row.querySelector(".pctText").textContent = e.target.value + "%";
            render(); // تحديث فوري للكانفاس
        };

        row.ondragstart = (e) => { e.dataTransfer.setData("idx", currentPos); row.style.opacity = "0.4"; };
        row.ondragend = () => { row.style.opacity = "1"; };
        row.ondragover = (e) => e.preventDefault();
        row.ondrop = (e) => {
            const from = e.dataTransfer.getData("idx");
            const moved = state.uiOrder.splice(from, 1)[0];
            state.uiOrder.splice(currentPos, 0, moved);
            mountTests();
        };
        container.appendChild(row);
    });
}

// ---- دوال الرسم الأصلية (لإرجاع الشكل الاحترافي) ----
function drawBg() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // رسم الشبكة الخفيفة
    ctx.strokeStyle = "rgba(0,0,0,0.03)";
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=40){ ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke(); }
    for(let j=0; j<canvas.height; j+=40){ ctx.beginPath(); ctx.moveTo(0,j); ctx.lineTo(canvas.width,j); ctx.stroke(); }
}

function drawHeader() {
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath(); ctx.roundRect(60, 60, 1294, 240, 30); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "900 64px system-ui"; ctx.textAlign = "right";
    ctx.fillText("مستشفى ريسبكت", 1300, 160);
    ctx.font = "500 28px system-ui"; ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText("Respect Hospital - Medical Center", 1300, 210);
    // العلامة الجانبية
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath(); ctx.roundRect(80, 110, 320, 140, 20); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.textAlign = "center";
    ctx.font = "900 38px system-ui"; ctx.fillText("فحص لياقة", 240, 175);
}

function drawTestsCanvas() {
    TESTS.forEach((name, i) => {
        const val = state.tests[i];
        const col = i < 5 ? 0 : 1;
        const row = i % 5;
        const x = 60 + (col * 664);
        const y = 380 + (row * 144);

        ctx.shadowColor = "rgba(0,0,0,0.05)"; ctx.shadowBlur = 15;
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.roundRect(x, y, 630, 110, 20); ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = "rgba(0,0,0,0.05)"; ctx.stroke();
        ctx.fillStyle = "#1a1a1a"; ctx.textAlign = "right"; ctx.font = "900 28px system-ui";
        ctx.fillText(name, x + 580, y + 65);
        
        ctx.fillStyle = val === 100 ? "#009e66" : "#667"; ctx.textAlign = "left";
        ctx.font = "900 32px system-ui"; ctx.fillText(val + "%", x + 40, y + 65);
    });
}

function drawInfo() {
    const y = 1150;
    ctx.fillStyle = "#f8f9fc"; ctx.beginPath(); ctx.roundRect(60, y, 1294, 300, 30); ctx.fill();
    ctx.fillStyle = "#1a1a1a"; ctx.textAlign = "right"; ctx.font = "900 24px system-ui";
    ctx.fillText("بيانات المفحوص", 1300, y + 60);
    ctx.font = "700 28px system-ui";
    ctx.fillText("الاسـم : " + (state.name || "ــــــــــــــــــــــــــــــــ"), 1300, y + 130);
    ctx.fillText("الرقم الوطني : " + (state.nid || "ــــــــــــــــــــ"), 1300, y + 200);
    
    // الختم الأخضر "لائق"
    ctx.save(); ctx.translate(280, y + 150); ctx.rotate(-0.1);
    ctx.strokeStyle = "#009e66"; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.roundRect(-150, -60, 300, 120, 15); ctx.stroke();
    ctx.fillStyle = "#009e66"; ctx.font = "900 48px system-ui"; ctx.textAlign = "center";
    ctx.fillText("لائــــق", 0, 18); ctx.restore();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBg();
    drawHeader();
    drawTestsCanvas();
    drawInfo();
    // رسم اسم الطبيب
    ctx.fillStyle = "#1a1a1a"; ctx.textAlign = "right"; ctx.font = "900 32px system-ui";
    ctx.fillText("الطبيب المعالج: " + state.doctorName, 1300, 1600);
    // Footer
    ctx.textAlign = "center"; ctx.font = "900 30px Arial"; ctx.fillText("311", canvas.width/2, 1920);
}

// ---- Boot & Listeners ----
function init() {
    mountTests();
    $("skipIntro").onclick = () => { 
        $("intro").style.display = "none"; 
        if(!localStorage.getItem("p_seen")) { $("patchNotes").style.display = "grid"; }
    };
    $("closePatch").onclick = () => { $("patchNotes").style.display = "none"; localStorage.setItem("p_seen", "true"); };
    
    $("name").oninput = (e) => { state.name = e.target.value; render(); };
    $("nid").oninput = (e) => { state.nid = e.target.value; render(); };
    $("insuranceType").onchange = (e) => { state.insurance = e.target.value; };
    
    $("copyMsgBtn").onclick = () => {
        const ins = state.insurance ? `\nنوع التأمين : ${state.insurance}` : "";
        const text = "```\n" + `الاسم : ${state.name || "سنمار"}\nالرقم الوطني : ${state.nid || "5775"}\nنوع التقرير: فحص لياقه${ins}\n` + "```";
        navigator.clipboard.writeText(text);
        $("copyMsgBtn").textContent = "تم النسخ ✅";
        setTimeout(() => $("copyMsgBtn").textContent = "نسخ الرسالة", 1500);
    };

    $("doctorBtn").onclick = () => { $("doctorModal").style.display = "grid"; };
    $("doctorSave").onclick = () => { 
        state.doctorName = $("doctorNameM").value || state.doctorName;
        $("doctorModal").style.display = "none"; render(); 
    };

    render();
}

init();
