// Cloudflare Worker
// Secrets ที่ต้องตั้งใน Worker:
// LINE_CHANNEL_ACCESS_TOKEN
// LINE_CHANNEL_SECRET
//
// API นี้รับผลสอบจากหน้าเว็บ ตรวจสอบ LINE ID Token
// และส่งผลเข้า LINE แบบ push message ถึง Official Account/ผู้ใช้ที่กำหนด
//
// สำคัญ: LINE Messaging API ไม่สามารถส่ง push message ไปยัง "ชื่อบัญชี"
// โดยตรงได้ ต้องใช้ userId ของผู้รับ หรือกลุ่ม/ห้องที่ LINE API รองรับ
//
// สำหรับแชทส่วนตัว: ให้ผู้สอบเพิ่ม Official Account เป็นเพื่อน
// แล้ว backend จะส่งผลกลับไปยัง userId ของผู้สอบเอง

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null,{headers:cors()});
    }
    if (request.method !== "POST") return json({error:"Method not allowed"},405);

    try {
      const body=await request.json();
      if(!body.idToken || !body.score || !body.total || !body.userId)
        return json({error:"ข้อมูลไม่ครบ"},400);

      // ตรวจสอบ ID Token กับ LINE
      const verify=new URLSearchParams();
      verify.set("id_token",body.idToken);
      verify.set("client_id",env.LINE_CHANNEL_ID);

      const vr=await fetch("https://api.line.me/oauth2/v2.1/verify",{
        method:"POST",
        headers:{"Content-Type":"application/x-www-form-urlencoded"},
        body:verify
      });
      const v=await vr.json();
      if(!vr.ok || v.sub!==body.userId) return json({error:"LINE token ไม่ถูกต้อง"},401);

      const text=
`ผลการทดสอบวิชาชีพทรัพยากรบุคคล ระดับ 3

ชื่อผู้สอบ: ${body.displayName}
คะแนน: ${body.score}/${body.total}
คิดเป็น: ${Math.round(body.score/body.total*100)}%
วันที่: ${new Intl.DateTimeFormat("th-TH",{dateStyle:"long",timeStyle:"short",timeZone:"Asia/Bangkok"}).format(new Date())}`;

      const msg=await fetch("https://api.line.me/v2/bot/message/push",{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":"Bearer "+env.LINE_CHANNEL_ACCESS_TOKEN
        },
        body:JSON.stringify({to:body.userId,messages:[{type:"text",text}]})
      });
      if(!msg.ok) return json({error:"LINE ส่งข้อความไม่สำเร็จ"},502);

      return json({ok:true,message:"ส่งผลเข้าห้องแชท LINE เรียบร้อยแล้ว"});
    }catch(e){
      return json({error:e.message||"Server error"},500);
    }
  }
};

function cors(){return {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"POST,OPTIONS"}}
function json(x,status=200){return new Response(JSON.stringify(x),{status,headers:{"Content-Type":"application/json",...cors()}})}