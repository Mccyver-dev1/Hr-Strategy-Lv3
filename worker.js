// Cloudflare Worker (worker.js)
// Secrets/Variables ที่ต้องตั้งค่าใน Cloudflare Worker Dashboard:
// 1. LINE_CHANNEL_ID
// 2. LINE_CHANNEL_ACCESS_TOKEN
// 3. LINE_CHANNEL_SECRET (ถ้ามี)

export default {
  async fetch(request, env) {
    // 1. จัดการ CORS Preflight Request (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, { 
        status: 204, 
        headers: getCorsHeaders() 
      });
    }

    // 2. กรองเฉพาะ POST Method
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    try {
      const body = await request.json();

      // ตรวจสอบความถูกต้องของข้อมูลที่ส่งมาจาก Frontend
      if (!body.idToken || !body.score || !body.total || !body.userId) {
        return jsonResponse({ error: "ข้อมูลไม่ครบถ้วน" }, 400);
      }

      // 3. ตรวจสอบ LINE ID Token
      const verifyParams = new URLSearchParams();
      verifyParams.set("id_token", body.idToken);
      verifyParams.set("client_id", env.LINE_CHANNEL_ID);

      const verifyRes = await fetch("https://api.line.me/oauth2/v2.1/verify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: verifyParams
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || verifyData.sub !== body.userId) {
        return jsonResponse({ error: "LINE ID Token ไม่ถูกต้องหรือหมดอายุ" }, 401);
      }

      // 4. เตรียมข้อความแจ้งผลการทดสอบ
      const textMessage = 
`ผลการทดสอบวิชาชีพทรัพยากรบุคคล ระดับ 3

ชื่อผู้สอบ: ${body.displayName || "ไม่ระบุชื่อ"}
คะแนน: ${body.score}/${body.total}
คิดเป็น: ${Math.round((body.score / body.total) * 100)}%
วันที่: ${new Intl.DateTimeFormat("th-TH", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Bangkok" }).format(new Date())}`;

      // 5. ส่ง Push Message กลับหาผู้ใช้ผ่าน LINE Messaging API
      const linePushRes = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          to: body.userId,
          messages: [{ type: "text", text: textMessage }]
        })
      });

      if (!linePushRes.ok) {
        const lineErr = await linePushRes.json();
        return jsonResponse({ error: "LINE Messaging API ส่งข้อความไม่สำเร็จ", details: lineErr }, 502);
      }

      return jsonResponse({ ok: true, message: "ส่งผลเข้าห้องแชท LINE เรียบร้อยแล้ว" }, 200);

    } catch (e) {
      return jsonResponse({ error: e.message || "Internal Server Error" }, 500);
    }
  }
};

// Helper function สำหรับสร้าง CORS Headers
function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

// Helper function สำหรับตอบกลับ JSON พร้อม CORS
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...getCorsHeaders()
    }
  });
}
