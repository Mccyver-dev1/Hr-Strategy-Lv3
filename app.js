let profile = null, idx = 0, answers = [];
let startTime = null, durationSeconds = 0;

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

  if(!liffId){
    showError("ตั้งค่าไม่สมบูรณ์", "ไม่พบค่า LIFF_ID ใน config.js");
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
  try{
    if(!liff.isLoggedIn()){
      liff.login({redirectUri: typeof LIFF_ENDPOINT_URL !== "undefined" ? LIFF_ENDPOINT_URL : window.location.href});
    }else{
      await start();
    }
  }catch(e){
    $("loginBtn").disabled = false;
    showError("เข้าสู่ระบบ LINE ไม่สำเร็จ", e && e.message ? e.message : "Unknown error");
  }
}

async function start(){
  try{
    profile = await liff.getProfile();
    $("name").textContent = profile.displayName;
    $("avatar").src = profile.pictureUrl || "";
    startTime = new Date(); // เริ่มจับเวลา
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
  const endTime = new Date();
  durationSeconds = Math.floor((endTime - startTime) / 1000);
  
  let rightCount = 0;
  const gridContainer = $("gridOverview");
  gridContainer.innerHTML = "";

  questions.forEach((q, i) => {
    const isCorrect = answers[i] === q.c;
    if(isCorrect) rightCount++;

    const item = document.createElement("div");
    item.className = `grid-item ${isCorrect ? 'correct' : 'wrong'}`;
    item.textContent = i + 1;
    gridContainer.appendChild(item);
  });

  const total = questions.length;
  const wrongCount = total - rightCount;
  const percent = Math.round((rightCount / total) * 100);

  window.finalResult = {
    score: rightCount,
    total: total,
    percent: percent,
    durationStr: formatDuration(durationSeconds)
  };

  // อัปเดต UI หน้า Result
  $("scoreBanner").textContent = `${rightCount}/${total}`;
  $("rightAnswers").textContent = `${rightCount}/${total}`;
  $("wrongAnswers").textContent = `${wrongCount}/${total}`;
  $("overviewPercent").textContent = `${percent}%`;
  $("durationTime").textContent = formatDuration(durationSeconds);
  $("resultProgressBar").style.width = `${percent}%`;

  const passStatus = $("passStatus");
  if(percent >= 60) {
    passStatus.textContent = "PASSED";
    passStatus.className = "pass-tag";
    $("statusIcon").textContent = "👍";
  } else {
    passStatus.textContent = "FAILED";
    passStatus.className = "pass-tag failed";
    $("statusIcon").textContent = "👎";
  }

  show("result");
}

function formatDuration(sec) {
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;
  return `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
}

async function sendResult() {
  const statusEl = $("sendStatus");
  const sendBtn = $("sendBtn");
  
  if (sendBtn) sendBtn.disabled = true;
  if (statusEl) statusEl.innerText = "กำลังส่งผลเข้าแชท...";

  try {
    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    const res = window.finalResult;
    const displayName = profile ? profile.displayName : "ผู้สอบ";

    const textMessage = 
`ผลการทดสอบวิชาชีพทรัพยากรบุคคล ระดับ 3 (50 ข้อ)

ชื่อผู้สอบ: ${displayName}
สถานะ: ${res.percent >= 60 ? 'PASSED (ผ่าน)' : 'FAILED (ไม่ผ่าน)'}
คะแนนที่ได้: ${res.score}/${res.total}
คิดเป็น: ${res.percent}%
เวลาที่ใช้: ${res.durationStr}
วันที่: ${new Intl.DateTimeFormat("th-TH", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Bangkok" }).format(new Date())}`;

    const msgPayload = [{ type: "text", text: textMessage }];

    try {
      await liff.sendMessages(msgPayload);
      if (statusEl) statusEl.innerText = "ส่งผลเข้าแชทเรียบร้อยแล้ว!";
      alert("ส่งผลเข้าแชท LINE เรียบร้อยแล้ว!");
      if (liff.isInClient()) liff.closeWindow();
      return;
    } catch (e) { console.log("sendMessages fallback to shareTargetPicker", e); }

    if (liff.shareTargetPicker) {
      const shareRes = await liff.shareTargetPicker(msgPayload);
      if (shareRes) {
        if (statusEl) statusEl.innerText = "ส่งผลเข้าแชทเรียบร้อยแล้ว!";
        alert("ส่งผลเข้าแชทเรียบร้อยแล้ว!");
        if (liff.isInClient()) liff.closeWindow();
      } else {
        if (statusEl) statusEl.innerText = "ยกเลิกการส่งข้อความ";
      }
    }
  } catch (error) {
    if (statusEl) statusEl.innerText = "ส่งไม่สำเร็จ: " + error.message;
  } finally {
    if (sendBtn) sendBtn.disabled = false;
  }
}

$("loginBtn").onclick = login;
$("nextBtn").onclick = () => { if(idx < questions.length - 1){ idx++; render(); } else finish(); };
if($("sendBtn")) $("sendBtn").onclick = sendResult;
if($("closeBtn")) $("closeBtn").onclick = () => { if(liff.isInClient()) liff.closeWindow(); };

init();