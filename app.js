const questions = [
 {q:"องค์กรพบว่าพนักงานใหม่มีอัตราการลาออกสูงภายใน 6 เดือนแรก ฝ่าย HR ต้องการหาสาเหตุเชิงระบบก่อนกำหนดมาตรการแก้ไข วิธีใดเหมาะสมที่สุด",
  a:["วิเคราะห์ข้อมูลการลาออกร่วมกับผลสัมภาษณ์พนักงานและข้อมูลการเริ่มงาน","เพิ่มค่าตอบแทนพนักงานใหม่ทุกตำแหน่งทันที","กำหนดให้หัวหน้างานประเมินพนักงานใหม่ทุกสัปดาห์","ลดระยะเวลาทดลองงานเพื่อให้พนักงานผ่านการประเมินเร็วขึ้น"],c:0},
 {q:"ในการคัดเลือกผู้สมัคร ฝ่าย HR ต้องการลดความลำเอียงจากการสัมภาษณ์ระหว่างผู้สมัครหลายคน วิธีใดเป็นแนวปฏิบัติที่เหมาะสมที่สุด",
  a:["ให้ผู้สัมภาษณ์แต่ละคนถามคำถามตามความสนใจของตนเอง","ใช้คำถามและเกณฑ์การให้คะแนนที่กำหนดไว้ล่วงหน้าสำหรับผู้สมัครทุกคน","ให้ผู้บริหารเลือกผู้สมัครจากความประทับใจหลังสัมภาษณ์","เลือกผู้สมัครที่มีประสบการณ์ทำงานมากที่สุดเสมอ"],c:1},
 {q:"หัวหน้างานแจ้งว่า พนักงานคนหนึ่งมีผลงานต่ำกว่าเป้าหมายอย่างต่อเนื่อง HR ควรดำเนินการใดก่อนเป็นลำดับสำคัญ",
  a:["พิจารณาปรับลดค่าตอบแทนทันที","ตรวจสอบเป้าหมาย หลักฐานผลงาน และปัจจัยที่ส่งผลต่อการปฏิบัติงาน","ย้ายพนักงานไปแผนกอื่นโดยไม่ต้องประเมินเพิ่มเติม","จัดอบรมทักษะเพิ่มเติมทันทีโดยไม่วิเคราะห์สาเหตุ"],c:1},
 {q:"องค์กรต้องการประเมินประสิทธิผลของโครงการฝึกอบรมด้านการบริการลูกค้า ตัวชี้วัดใดสะท้อนการนำความรู้ไปใช้ในการทำงานได้ดีกว่าการวัดเพียงจำนวนผู้เข้าอบรม",
  a:["จำนวนพนักงานที่ลงทะเบียนเข้าร่วมอบรม","จำนวนชั่วโมงที่วิทยากรใช้ในการสอน","ผลการประเมินพฤติกรรมการให้บริการหลังนำความรู้ไปใช้","จำนวนเอกสารประกอบการอบรมที่แจกให้พนักงาน"],c:2},
 {q:"ฝ่าย HR ต้องการวางแผนอัตรากำลังสำหรับปีถัดไป โดยหน่วยงานธุรกิจคาดว่าจะเพิ่มปริมาณงานอย่างมีนัยสำคัญ ขั้นตอนใดควรเป็นพื้นฐานสำคัญของการวางแผน",
  a:["เพิ่มจำนวนพนักงานตามจำนวนที่หน่วยงานร้องขอทั้งหมด","วิเคราะห์ปริมาณงาน ความต้องการกำลังคน และกำลังคนที่มีอยู่","หยุดการรับพนักงานใหม่จนกว่าจะเห็นปริมาณงานจริง","ใช้จำนวนพนักงานของปีที่ผ่านมาเป็นเป้าหมายของปีถัดไป"],c:1}
];

let profile=null,idx=0,answers=[];

const $=id=>document.getElementById(id);
function show(id){["login","quiz","result"].forEach(x=>$(x).classList.toggle("hidden",x!==id));}
function showError(title, detail){
  const box=$("errorBox");
  box.innerHTML=`<strong>${escapeHtml(title)}</strong>${escapeHtml(detail)}`;
  box.classList.remove("hidden");
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

async function init(){
  $("liffIdText").textContent=LIFF_ID;
  if(typeof liff==="undefined"){
    showError("โหลด LINE LIFF ไม่สำเร็จ","ไม่พบ LIFF SDK กรุณาตรวจสอบอินเทอร์เน็ตหรือการโหลด https://static.line-scdn.net/liff/edge/2/sdk.js");
    return;
  }
  try{
    await liff.init({liffId:LIFF_ID});
    if(liff.isLoggedIn()) await start();
  }catch(e){
    console.error("LIFF init error",e);
    showError("เกิดข้อผิดพลาดในการเชื่อมต่อ LINE",
      (e&&e.message?e.message:"Unknown error")+
      " | ตรวจสอบ LIFF Endpoint URL ใน LINE Developers ให้ตรงกับ URL เว็บไซต์นี้ทุกตัวอักษร");
  }
}

async function login(){
  $("loginBtn").disabled=true;
  $("errorBox").classList.add("hidden");
  try{
    if(!liff.isLoggedIn()){
      liff.login({redirectUri:LIFF_ENDPOINT_URL});
    }else{
      await start();
    }
  }catch(e){
    console.error("LIFF login error",e);
    $("loginBtn").disabled=false;
    showError("เข้าสู่ระบบ LINE ไม่สำเร็จ",e&&e.message?e.message:"Unknown error");
  }
}
async function start(){
  try{
    profile=await liff.getProfile();
    $("name").textContent=profile.displayName;
    $("avatar").src=profile.pictureUrl||"";
    show("quiz");render();
  }catch(e){
    show("login");
    showError("อ่านข้อมูลบัญชี LINE ไม่สำเร็จ",e&&e.message?e.message:"Unknown error");
  }
}
function render(){
  const x=questions[idx];
  $("progressText").textContent=`ข้อ ${idx+1} / ${questions.length}`;
  $("progressBar").style.width=((idx+1)/questions.length*100)+"%";
  $("question").textContent=x.q;
  $("choices").innerHTML="";
  $("nextBtn").disabled=answers[idx]===undefined;
  $("nextBtn").textContent=idx===questions.length-1?"ส่งคำตอบ":"ข้อต่อไป";
  x.a.forEach((t,i)=>{
    const b=document.createElement("button");
    b.className="choice"+(answers[idx]===i?" selected":"");
    b.textContent=`${String.fromCharCode(65+i)}. ${t}`;
    b.onclick=()=>{answers[idx]=i;render();};
    $("choices").appendChild(b);
  });
}
function finish(){
  const score=answers.reduce((s,v,i)=>s+(v===questions[i].c?1:0),0);
  window.finalScore=score;
  $("score").textContent=`${score} / ${questions.length}`;
  $("resultDetail").textContent=`คิดเป็น ${Math.round(score/questions.length*100)}%`;
  show("result");
}
async function sendResultToLineChat() {
  const statusEl = document.getElementById("status-message"); // ตัวแสดงข้อความ error/status

  try {
    // 1. ตรวจสอบว่าเปิดผ่าน LIFF และ Logged in หรือไม่
    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    // 2. ตรวจสอบว่า LIFF มีสิทธิ์ส่งข้อความหรือไม่
    if (!liff.isApiAvailable("sendMessages")) {
      alert("เบราว์เซอร์นี้ไม่รองรับการส่งข้อความเข้าแชทโดยตรง กรุณาเปิดผ่านแชท LINE");
      return;
    }

    // 3. ข้อความที่ต้องการส่งเข้าแชท
    const textMessage = 
`ผลการทดสอบวิชาชีพทรัพยากรบุคคล ระดับ 3

คะแนน: ${score}/${totalScore}
คิดเป็น: ${Math.round((score / totalScore) * 100)}%
วันที่: ${new Intl.DateTimeFormat("th-TH", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Bangkok" }).format(new Date())}`;

    // 4. ส่งข้อความเข้าแชทที่เปิดอยู่ทันทีผ่าน LIFF SDK (ไม่ต้องผ่าน Worker)
    await liff.sendMessages([
      {
        type: "text",
        text: textMessage
      }
    ]);

    alert("ส่งผลเข้าแชทเรียบร้อยแล้ว!");
    liff.closeWindow(); // ปิดหน้า LIFF อัตโนมัติหลังส่งเสร็จ

  } catch (error) {
    console.error("LINE Send Error:", error);
    if (statusEl) {
      statusEl.innerText = "ส่งไม่สำเร็จ: " + error.message;
    }
  }
}
$("loginBtn").onclick=login;
$("nextBtn").onclick=()=>{if(idx<questions.length-1){idx++;render();}else finish();};
$("sendBtn").onclick=sendResult;
$("closeBtn").onclick=()=>{if(liff.isInClient())liff.closeWindow();};
init();
