export default function HowItWorksSection() {
  return (
    <section className="mb-24 py-16 border-y border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-mali font-semibold text-3xl text-textMain mb-2">ระบบ GoHome ทำงานอย่างไร?</h2>
          <p className="text-gray-500 text-sm">4 ขั้นตอนง่ายๆ ในการเปลี่ยนชีวิตสัตว์จรจัดอย่างยั่งยืน</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start text-center gap-10 relative">
          <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-0.5 bg-gray-200 -z-10 w-3/4 mx-auto"></div>

          <div className="flex-1 flex flex-col items-center bg-white z-10 px-2 w-full">
            <div className="w-20 h-20 bg-bgAccent rounded-full flex items-center justify-center text-primary text-3xl mb-4 shadow-sm border-4 border-white">
              <i className="fa-solid fa-map-location-dot"></i>
            </div>
            <h4 className="font-mali font-semibold text-lg mb-2">1. แจ้งพบสัตว์จร</h4>
            <p className="text-xs text-gray-500 max-w-[210px] leading-relaxed">
              พลเมืองดีปักหมุดพิกัดและถ่ายรูปสัตว์จรจัดที่ต้องการความช่วยเหลือโดยไม่ต้องล็อกอิน
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center bg-white z-10 px-2 w-full">
            <div className="w-20 h-20 bg-bgAccent rounded-full flex items-center justify-center text-primary text-3xl mb-4 shadow-sm border-4 border-white">
              <i className="fa-solid fa-hospital-user"></i>
            </div>
            <h4 className="font-mali font-semibold text-lg mb-2">2. รับเข้าศูนย์ & บันทึกประวัติ</h4>
            <p className="text-xs text-gray-500 max-w-[210px] leading-relaxed">
              ศูนย์พักพิงตรวจสอบ ตรวจสุขภาพ ทำหมัน ฉีดวัคซีน และลงทะเบียนสัตว์เข้าสู่ระบบ
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center bg-white z-10 px-2 w-full">
            <div className="w-20 h-20 bg-bgAccent rounded-full flex items-center justify-center text-primary text-3xl mb-4 shadow-sm border-4 border-white">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <h4 className="font-mali font-semibold text-lg mb-2">3. ทำแบบประเมินจับคู่ใจ</h4>
            <p className="text-xs text-gray-500 max-w-[210px] leading-relaxed">
              ผู้รับเลี้ยงทำแบบประเมิน Matching Quiz เพื่อหาน้องสัตว์ที่ตรงกับสภาพแวดล้อมและนิสัย
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center bg-white z-10 px-2 w-full">
            <div className="w-20 h-20 bg-bgAccent rounded-full flex items-center justify-center text-primary text-3xl mb-4 shadow-sm border-4 border-white">
              <i className="fa-solid fa-house-chimney-heart"></i>
            </div>
            <h4 className="font-mali font-semibold text-lg mb-2">4. ส่งมอบ & บันทึก Care Log</h4>
            <p className="text-xs text-gray-500 max-w-[210px] leading-relaxed">
              ส่งมอบสู่บ้านใหม่ พร้อมบันทึกติดตามการเจริญเติบโตและสุขภาพผ่าน Care Log
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}