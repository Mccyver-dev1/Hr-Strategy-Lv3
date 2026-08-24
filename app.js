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

let profile=null, idx=0, answers=[];

const $=id=>document.getElementById(id);
function show(id){["login","quiz","result"].forEach(x=>$(x).classList.toggle("hidden",x!==id));}

async function init(){
  try{
    await liff.init({liffId:LIFF_ID});
    if(!liff.isLoggedIn()) return;
    await start();
  }catch(e){console.error(e); alert("ไม่สามารถเริ่มระบบ LINE ได้: "+e.message);}
}
async function start(){
  profile=await liff.getProfile();
  $("name").textContent=profile.displayName;
  $("avatar").src=profile.pictureUrl||"";
  show("quiz"); render();
}
function render(){
  const x=questions[idx];
  $("progressText").textContent=`ข้อ ${idx+1} / ${questions.length}`;
  $("progressBar").style.width=((idx+1)/questions.length*100)+"%";
  $("question").textContent=x.q;
  $("choices").innerHTML="";
  $("nextBtn").disabled=answers[idx]===undefined;
  x.a.forEach((t,i)=>{
    const b=document.createElement("button");
    b.className="choice"+(answers[idx]===i?" selected":"");
    b.textContent=`${String.fromCharCode(65+i)}. ${t}`;
    b.onclick=()=>{answers[idx]=i;render();};
    $("choices").appendChild(b);
  });
  $("nextBtn").textContent=idx===questions.length-1?"ส่งคำตอบ":"ข้อต่อไป";
}
function finish(){
  const score=answers.reduce((s,v,i)=>s+(v===questions[i].c?1:0),0);
  $("score").textContent=`${score} / ${questions.length}`;
  $("resultDetail").textContent=`คิดเป็น ${Math.round(score/questions.length*100)}%`;
  show("result");
  window.finalScore=score;
}
async function sendResult(){
  const score=window.finalScore;
  const payload={idToken:await liff.getIDToken(),userId:profile.userId,displayName:profile.displayName,score,total:questions.length,answers};
  $("sendBtn").disabled=true;
  $("sendStatus").textContent="กำลังส่งผล...";
  try{
    const r=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const data=await r.json();
    if(!r.ok) throw new Error(data.error||"ส่งผลไม่สำเร็จ");
    $("sendStatus").textContent=data.message||"ส่งผลเรียบร้อยแล้ว";
    if(liff.isInClient()) setTimeout(()=>liff.closeWindow(),1200);
  }catch(e){
    console.error(e); $("sendBtn").disabled=false;
    $("sendStatus").textContent="ส่งไม่สำเร็จ: "+e.message;
  }
}
$("loginBtn").onclick=()=>liff.login();
$("nextBtn").onclick=()=>{if(idx<questions.length-1){idx++;render();}else finish();};
$("sendBtn").onclick=sendResult;
$("closeBtn").onclick=()=>{if(liff.isInClient())liff.closeWindow();};
init();