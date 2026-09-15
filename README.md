# 1. ขั้นตอนการดึงโค้ดไปรันและเริ่มทำงานส่ง

### 1 โคลนโปรเจกต์ลงเครื่อง:ให้เพื่อนเปิด Terminal ในโฟลเดอร์ที่ต้องการเก็บงาน แล้วรัน:

    Bashgit clone https://github.com/khdanich05-maker/PawMatch-.git
    cd PawMatch-

### ** 2 ติดตั้ง Dependencies (node_modules) **:

**_เพราะเราตัด node_modules ออกจาก Git เพื่อนต้องสั่งติดตั้ง library ลงในเครื่องตัวเองก่อน_**

    ติดตั้งฝั่ง Client:
    cd client
    npm install

    ติดตั้งฝั่ง Server (ถ้าโฟลเดอร์ server มี package.json ให้เข้าไปลงด้วย):
    cd server
    npm install

### 3 ตั้งค่า Environment Variables (ถ้ามี):หากโปรเจกต์มีไฟล์ .env หรือ .env.local (เช่น Database URL หรือ API Key) ที่ถูก ignore ไว้ ต้องส่งค่าเหล่านั้นให้เพื่อน แล้วให้เพื่อนสร้างไฟล์ .env.local ขึ้นมาในโฟลเดอร์ client/

### 4 รัน Development Server:

    เข้าไปที่โฟลเดอร์ client แล้วสั่งรันหน้าเว็บ:
    cd client
    npm run dev

**_เปิดเบราว์เซอร์ที่ http://localhost:3000 เริ่มทดสอบและเขียนโค้ด_**

# 2. แนวทางปฏิบัติเมื่อทำงานร่วมกัน (Best Practice)

### ก่อนเริ่มเขียนโค้ด ให้ดึงโค้ดล่าสุดลงมาก่อนเสมอด้วยคำสั่ง:

    git pull origin main

### แยก Branch ทำงาน: แนะนำให้สร้าง Branch ใหม่สำหรับฟีเจอร์ของตัวเอง แทนที่จะ push เข้า main โดยตรง:

**_ตัวอย่าง_**

    git checkout -b feature/login-page หรือ git checkout -b fix/navbar-bug

### เขียนโค้ดได้ตามปกติ...

    git add .
    git commit -m "feat: add login page UI"
    git push origin feature/login-page
