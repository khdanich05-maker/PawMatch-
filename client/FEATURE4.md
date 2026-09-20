# Feature 4 - Volunteer Matching System

ฟีเจอร์นี้ครอบคลุม 3 use cases ตามเอกสารโครงการ:

1. `Request Adoption` - `/adoptions/request`
2. `My Requests` - `/adoptions/my-requests`
3. `Approve Adoption` - `/admin/adoptions`

## ทดลองใช้งาน

```bash
npm install
npm run dev
```

หากยังไม่ตั้งค่า Supabase ระบบจะใช้ข้อมูลสาธิตใน `localStorage` ทำให้ทดสอบ flow ทั้งหมดได้ใน browser เดียวกัน

## เชื่อม Supabase

1. เปิด SQL Editor ใน Supabase แล้วรันไฟล์ `supabase/migrations/202609200001_feature4_adoption_requests.sql`
2. สร้าง `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. ผู้ใช้ทั่วไปต้องเข้าสู่ระบบผ่าน Supabase Auth ก่อนส่งคำขอ
4. บัญชี Admin ต้องมี `app_metadata.role` เป็น `admin` เพื่ออ่านและอนุมัติคำขอทั้งหมด

## ลำดับการทำงาน

- ผู้ใช้เปิดรายละเอียดสัตว์และกดขอรับเลี้ยง
- กรอก/ยืนยันข้อมูลส่วนตัวและความพร้อม
- ระบบสร้างคำขอสถานะ `pending`
- Admin ตรวจรายละเอียดแล้วเลือก `approved` หรือ `rejected` พร้อมหมายเหตุ
- ผู้ใช้เห็นสถานะล่าสุดในหน้า My Requests

เมื่อ Feature 5 พร้อมใช้งาน จุดเชื่อมต่อที่เหมาะสมคือ database trigger หลังสถานะเปลี่ยนเป็น `approved` เพื่อสร้าง care assignment/log เริ่มต้นเพียงครั้งเดียว
