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

let profile = null, idx = 0, answers = [];

const $ = id => document.getElementById(id);
function show(id){ ["login","quiz","result"].forEach(x => $(x).classList.toggle("hidden", x !== id)); }
function showError(title, detail){
  const box = $("errorBox");
  if(box){
    box.innerHTML = `<strong>${escapeHtml(title)}</strong><br>${escapeHtml(detail)}`;
    box.classList.remove("hidden");
  }
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }

async function init(){
  const liffId = (typeof LIFF_ID !== "undefined") ? LIFF_ID : "";
  if($("liffIdText")) $("liffIdText").textContent = liffId;

  if(!liffId || liffId.includes("YOUR_LIFF_ID")){
    showError("ตั้งค่าไม่สมบูรณ์", "ไม่พบค่า LIFF_ID ใน config.js");
    return;
  }
  if(typeof liff === "undefined"){
    showError("โหลด LINE LIFF ไม่สำเร็จ", "ไม่พบ LIFF SDK กรุณาตรวจสอบอินเทอร์เน็ต");
    return;
  }
  try{
    await liff.init({liffId: liffId});
    if(liff.isLoggedIn()) await start();
  }catch(e){
    console.error("LIFF init error", e);
    showError("เกิดข้อผิดพลาดในการเชื่อมต่อ LINE", (e && e.message ? e.message : "Unknown error"));
  }
}

async function login(){
  $("loginBtn").disabled = true;
  if($("errorBox")) $("errorBox").classList.add("hidden");
  try{
    if(!liff.isLoggedIn()){
      liff.login({redirectUri: typeof LIFF_ENDPOINT_URL !== "undefined" ? LIFF_ENDPOINT_URL : window.location.href});
    }else{
      await start();
    }
  }catch(e){
    console.error("LIFF login error", e);
    $("loginBtn").disabled = false;
    showError("เข้าสู่ระบบ LINE ไม่สำเร็จ", e && e.message ? e.message : "Unknown error");
  }
}

async function start(){
  try{
    profile = await liff.getProfile();
    $("name").textContent = profile.displayName;
    $("avatar").src = profile.pictureUrl || "";
    show("quiz");
    render();
  }catch(e){
    show("login");
    showError("อ่านข้อมูลบัญชี LINE ไม่สำเร็จ", e && e.message ? e.message : "Unknown error");
  }
}

function render(){
  const x = questions[idx];
  $("progressText").textContent = `ข้อ ${idx+1} / ${questions.length}`;
  $("progressBar").style.width = ((idx+1)/questions.length*100) + "%";
  $("question").textContent = x.q;
  $("choices").innerHTML = "";
  $("nextBtn").disabled = answers[idx] === undefined;
  $("nextBtn").textContent = idx === questions.length - 1 ? "ส่งคำตอบ" : "ข้อต่อไป";
  x.a.forEach((t, i) => {
    const b = document.createElement("button");
    b.className = "choice" + (answers[idx] === i ? " selected" : "");
    b.textContent = `${String.fromCharCode(65+i)}. ${t}`;
    b.onclick = () => { answers[idx] = i; render(); };
    $("choices").appendChild(b);
  });
}

function finish(){
  const score = answers.reduce((s, v, i) => s + (v === questions[i].c ? 1 : 0), 0);
  window.finalScore = score;
  $("score").textContent = `${score} / ${questions.length}`;
  $("resultDetail").textContent = `คิดเป็น ${Math.round(score/questions.length*100)}%`;
  show("result");
}

async function sendResult() {
  const statusEl = $("sendStatus") || $("errorBox");
  const sendBtn = $("sendBtn");
  
  if (sendBtn) sendBtn.disabled = true;
  if (statusEl) statusEl.innerText = "กำลังส่งผลเข้าแชท...";

  try {
    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    const score = window.finalScore || 0;
    const totalScore = questions.length;
    const displayName = profile ? profile.displayName : "ผู้สอบ";

    const textMessage = 
`ผลการทดสอบวิชาชีพทรัพยากรบุคคล ระดับ 3

ชื่อผู้สอบ: ${displayName}
คะแนน: ${score}/${totalScore}
คิดเป็น: ${Math.round((score / totalScore) * 100)}%
วันที่: ${new Intl.DateTimeFormat("th-TH", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Bangkok" }).format(new Date())}`;

    const msgPayload = [{ type: "text", text: textMessage }];

    // 1. พยายามยิงเข้าแชทปัจจุบันก่อน
    try {
      await liff.sendMessages(msgPayload);
      if (statusEl) statusEl.innerText = "ส่งผลเข้าแชทเรียบร้อยแล้ว!";
      alert("ส่งผลเข้าแชท LINE เรียบร้อยแล้ว!");
      if (liff.isInClient()) liff.closeWindow();
      return;
    } catch (sendErr) {
      console.log("sendMessages ไม่ผ่าน ลองใช้ shareTargetPicker", sendErr);
    }

    // 2. ถ้าส่งตรงไม่ได้ (เช่น เปิดนอกแชท) ให้เด้งหน้าเลือกเพื่อน/ห้องแชท
    if (liff.shareTargetPicker) {
      const res = await liff.shareTargetPicker(msgPayload);
      if (res) {
        if (statusEl) statusEl.innerText = "ส่งผลเข้าแชทเรียบร้อยแล้ว!";
        alert("ส่งผลเข้าแชทเรียบร้อยแล้ว!");
        if (liff.isInClient()) liff.closeWindow();
      } else {
        if (statusEl) statusEl.innerText = "ยกเลิกการส่งข้อความ";
      }
    } else {
      throw new Error("อุปกรณ์หรือเบราว์เซอร์นี้ไม่รองรับการส่งข้อความ");
    }

  } catch (error) {
    console.error("LINE Send Error:", error);
    if (statusEl) {
      let msg = error.message || "เกิดข้อผิดพลาดในการส่ง";
      if (msg.includes("user declined")) msg = "ผู้ใช้ยกเลิกการส่งข้อความ";
      statusEl.innerText = "ส่งไม่สำเร็จ: " + msg;
      statusEl.classList.remove("hidden");
    }
  } finally {
    if (sendBtn) sendBtn.disabled = false;
  }
}

// Event Listeners
$("loginBtn").onclick = login;
$("nextBtn").onclick = () => { if(idx < questions.length - 1){ idx++; render(); } else finish(); };
if($("sendBtn")) $("sendBtn").onclick = sendResult;
if($("closeBtn")) $("closeBtn").onclick = () => { if(liff.isInClient()) liff.closeWindow(); };

init();
