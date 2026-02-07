const $=id=>document.getElementById(id);

const TESTS=[
"ضغط الدم",
"النظر",
"السمع",
"السكر",
"اللياقة"
];

/* إنشاء الفحوصات */
const list=$("testsList");
TESTS.forEach(t=>{
 const d=document.createElement("div");
 d.className="testItem";
 d.innerHTML=`<span>${t}</span><input type="number" min=0 max=100 value=0>`;
 list.appendChild(d);
});

/* التأمين */
const levels=["لا يوجد","فضي","ذهبي","بلاتيني"];
let idx=0;

$("insuranceBtn").onclick=()=>{
 idx=(idx+1)%levels.length;
 $("insuranceBtn").textContent="تأمين صحي: "+levels[idx];
};

/* نسخ الرسالة */
$("copyBtn").onclick=()=>{
 const name=$("name").value;
 const nid=$("nid").value;

 let msg=
"```\n"+
"الاسم : "+name+"\n"+
"الرقم الوطني : "+nid+"\n"+
"نوع التقرير: فحص لياقه\n";

 if(levels[idx]!=="لا يوجد")
  msg+="نوع التأمين : "+levels[idx]+"\n";

 msg+="```";

 navigator.clipboard.writeText(msg);
 alert("تم النسخ ✅");
};

/* Patch Notes مرة واحدة */
const patch=$("patchModal");

if(!localStorage.patch){
 patch.style.display="flex";
}

$("closePatch").onclick=()=>{
 patch.style.display="none";
 localStorage.patch=1;
};
