# HR Quiz LINE

แบบทดสอบความรู้วิชาชีพทรัพยากรบุคคล ระดับ 3 สำหรับ LIFF + GitHub Pages

## 1. LINE Developers

สร้าง/เลือก LIFF App และใช้ LIFF ID:

`2011229964-KAqHHQG8`

กำหนด Endpoint URL เป็น URL GitHub Pages ของ repository

ตัวอย่าง:
`https://YOUR_GITHUB_USERNAME.github.io/hr-quiz-line/`

## 2. LINE Official Account

Official Account ที่ใช้ต้องมี Messaging API และผู้สอบต้องเพิ่ม Official Account เป็นเพื่อนก่อน จึงจะรับ push message ในแชทส่วนตัวได้

> ชื่อ `Siam_hrbp` ใช้ระบุบัญชี แต่ LINE Messaging API ใช้ userId ในการส่งข้อความ ไม่สามารถใช้ชื่อบัญชีเป็นปลายทาง API โดยตรง

## 3. Cloudflare Worker

Deploy `worker.js` แล้วตั้ง Variables/Secrets:

- `LINE_CHANNEL_ID`
- `LINE_CHANNEL_ACCESS_TOKEN`

จากนั้นนำ Worker URL ไปใส่ใน `config.js`:

`const API_URL = "https://YOUR-WORKER.workers.dev";`

## 4. GitHub Pages

อัปโหลด:
- logo.png
- index.html
- style.css
- config.js
- app.js

เปิด Settings > Pages > Deploy from branch > main

## 5. ข้อควรระวัง

ห้ามใส่ Channel Secret หรือ Channel Access Token ใน GitHub Pages เพราะ repository และ JavaScript ฝั่งผู้ใช้สามารถถูกเปิดดูได้

ระบบตัวอย่างนี้ส่งผลกลับไปยัง userId ของผู้สอบเองผ่าน Official Account เมื่อผู้สอบเพิ่ม Official Account เป็นเพื่อนแล้ว
