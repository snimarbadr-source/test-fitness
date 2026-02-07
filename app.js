const $=id=>document.getElementById(id);

const TESTS=[
"ضغط الدم",
"النظر",
"السمع",
"السكر",
"اللياقة"
];

let state={
 name:"",
 nid:"",
 insurance:"none",
 tests:[0,0,0,0,0]
};

/* إنشاء الفحوصات */
function renderTests(){
 const list=$("testsList");
 list.innerHTML="";

 TESTS.forEach((t,i)=>{
  const d=document.createElement("div");
  d.className="testItem";
  d.draggable=true;

  d.innerHTML=`
   <span>${t}</span>
   <input type="number" min=0 max=100 value="0">
  `;

  d.querySelector("input").oninput=e=>{
    state.tests[i]=+e.target.value;
  };

  d.ondragstart=()=>d.classList.add("dragging");
  d.ondragend=()=>d.classList.remove("dragging");

  list.appendChild(d);
 });

 /* سحب بدون تأثير على التقرير */
 list.ondragover=e=>{
  e.preventDefault();
  const drag=document.querySelector(".dragging");
  const after=[...list.children]
   .find(el=>e.clientY<=el.offsetTop+el.offsetHeight/2);

  if(after) list.insertBefore(drag,after);
  else list.appendChild(drag);
 };
}
renderTests();

/* مودال التأمين */
$("insuranceBtn").onclick=()=>{
 $("insuranceModal").classList.remove("hidden");
};

$("saveInsurance").onclick=()=>{
 state.insurance=$("insuranceSelect").value;
 $("insuranceModal").classList.add("hidden");
};

/* نظام تلقائي */
function autoInsurance(){
 const avg=state.tests.reduce((a,b)=>a+b,0)/state.tests.length;

 if(avg>=85) return "بلاتيني";
 if(avg>=60) return "ذهبي";
 if(avg>=30) return "فضي";
 return "لا يوجد";
}

/* نسخ الرسالة */
$("copyBtn").onclick=()=>{
 state.name=$("name").value;
 state.nid=$("nid").value;

 let ins=state.insurance;
 if(ins==="auto") ins=autoInsurance();

 let msg=
"```\n"+
"الاسم : "+state.name+"\n"+
"الرقم الوطني : "+state.nid+"\n"+
"نوع التقرير: فحص لياقه\n";

 if(ins!=="none" && ins!=="لا يوجد")
  msg+="نوع التأمين : "+ins+"\n";

 msg+="```";

 navigator.clipboard.writeText(msg);
 alert("تم النسخ ✅");
};

/* Patch Notes مرة واحدة */
if(!localStorage.patchShown){
 setTimeout(()=>{
  alert(`🚀 تحديثات جديدة

✨ التأمين الصحي
✨ نظام درجات تلقائي
✨ سحب الفحوصات
✨ تحسينات سينمائية`);

  localStorage.patchShown=1;
 },800);
}
