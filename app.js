const testsOrderFinal = [
"ضغط الدم",
"النظر",
"السمع",
"السكر",
"اللياقة"
];

let testsState = [...testsOrderFinal];
let insurance = "لا يوجد";

const testsDiv = document.getElementById("tests");

function renderTests(){
  testsDiv.innerHTML="";
  testsState.forEach(t=>{
    const d=document.createElement("div");
    d.className="test";
    d.innerHTML=`${t} <input type="number" value="0">`;
    testsDiv.appendChild(d);
  });
}

renderTests();

/* التأمين */
function openInsurance(){
  document.getElementById("insuranceModal").classList.remove("hidden");
}

function saveInsurance(){
  insurance=document.getElementById("insuranceSelect").value;
  document.getElementById("insuranceModal").classList.add("hidden");
}

/* نسخ الرسالة */
function copyMsg(){
  const name=document.getElementById("name").value;
  const nid=document.getElementById("nid").value;

  const msg=
`⁨\`\`\`
الاسم : ${name}
الرقم الوطني : ${nid}
نوع التقرير: فحص لياقه
نوع التأمين : ${insurance}
\`\`\``;

  navigator.clipboard.writeText(msg);
  alert("تم النسخ ✅");
}

/* Patch Notes مرة واحدة */
window.onload=()=>{
  if(!localStorage.getItem("patchShown")){
    setTimeout(()=>{
      document.getElementById("patchNotes").classList.remove("hidden");
      localStorage.setItem("patchShown","1");
    },2000);
  }
}

function closePatch(){
  document.getElementById("patchNotes").classList.add("hidden");
}
