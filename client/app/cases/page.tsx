"use client";

import { useState } from "react";

export default function CasesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      {/* หัวข้อหน้า */}
      <div className="mb-8">
        <h1 className="font-mali font-semibold text-4xl mb-2 text-textMain">เพื่อนสี่ขาที่รอคอยบ้าน 🐾</h1>
        <p className="text-gray-500">ค้นหาเพื่อนซี้สี่ขาที่ตรงใจคุณ</p>
      </div>

      {/* กล่อง Filter คัดกรองข้อมูล */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10">
        <div className="flex items-center gap-2 font-mali font-semibold text-primary mb-4 text-lg">
          <i className="fa-solid fa-filter"></i> ตัวกรองการค้นหา
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1 pl-1">ประเภทสัตว์</label>
            <select className="w-full bg-bgMain border border-gray-200 text-textMain text-sm rounded-xl focus:ring-primary focus:border-primary block p-3 font-prompt outline-none transition">
              <option value="all">🐾 ทั้งหมด</option>
              <option value="dog">🐶 สุนัข</option>
              <option value="cat">🐱 แมว</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1 pl-1">เพศ</label>
            <select className="w-full bg-bgMain border border-gray-200 text-textMain text-sm rounded-xl focus:ring-primary focus:border-primary block p-3 font-prompt outline-none transition">
              <option value="all">⚥ ทั้งหมด</option>
              <option value="male">♂ ตัวผู้</option>
              <option value="female">♀ ตัวเมีย</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1 pl-1">ช่วงอายุ</label>
            <select className="w-full bg-bgMain border border-gray-200 text-textMain text-sm rounded-xl focus:ring-primary focus:border-primary block p-3 font-prompt outline-none transition">
              <option value="all">⏳ ทุกช่วงวัย</option>
              <option value="baby">เด็ก (0-1 ปี)</option>
              <option value="adult">โตเต็มวัย (1-7 ปี)</option>
              <option value="senior">สูงอายุ (7 ปีขึ้นไป)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1 pl-1">พื้นที่ / จังหวัด</label>
            <select className="w-full bg-bgMain border border-gray-200 text-textMain text-sm rounded-xl focus:ring-primary focus:border-primary block p-3 font-prompt outline-none transition">
              <option value="all">📍 ทุกพื้นที่</option>
              <option value="phuket">ภูเก็ต</option>
              <option value="bkk">กรุงเทพมหานคร</option>
              <option value="chiangmai">เชียงใหม่</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1 pl-1">สีหลัก</label>
            <select className="w-full bg-bgMain border border-gray-200 text-textMain text-sm rounded-xl focus:ring-primary focus:border-primary block p-3 font-prompt outline-none transition">
              <option value="all">🎨 ทุกสี</option>
              <option value="black">ดำ</option>
              <option value="white">ขาว</option>
              <option value="brown">น้ำตาล / ส้ม</option>
              <option value="mixed">สามสี / ลายสลิด</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button className="font-mali font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 px-6 py-2.5 rounded-xl transition duration-200 flex items-center gap-2">
            <i className="fa-solid fa-rotate-left"></i> ล้างค่า
          </button>
          <button className="font-mali font-semibold bg-primary hover:bg-primaryHover text-white px-8 py-2.5 rounded-xl transition duration-300 shadow-sm flex items-center gap-2">
            <i className="fa-solid fa-magnifying-glass"></i> ค้นหา
          </button>
        </div>
      </div>

      {/* Grid Cards แสดงผลลัพธ์ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 border border-gray-100 flex flex-col h-full group">
          <div className="h-56 bg-bgAccent flex items-center justify-center text-primaryHover relative overflow-hidden">
            <i className="fa-solid fa-dog text-6xl group-hover:scale-110 transition duration-300"></i>
            <span className="absolute top-3 left-3 bg-white/90 text-green-600 text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span> ยังไม่มีคนรับเลี้ยง
            </span>
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-itim text-2xl text-textMain">เต้าหู้</h3>
              <span className="bg-pink-50 text-pink-500 w-8 h-8 rounded-full flex items-center justify-center text-lg" title="เพศเมีย">
                <i className="fa-solid fa-venus"></i>
              </span>
            </div>
            <div className="flex flex-col gap-2 text-sm text-gray-500 mb-6 flex-1">
              <p className="flex items-center gap-2"><i className="fa-solid fa-paw w-4 text-primary"></i> สุนัข</p>
              <p className="flex items-center gap-2"><i className="fa-solid fa-location-dot w-4 text-primary"></i> ศูนย์พักพิงสัตว์ภูเก็ต</p>
            </div>
            <button onClick={openModal} className="w-full font-mali font-semibold border-2 border-primary text-primary hover:bg-bgAccent py-2.5 rounded-xl transition duration-300 flex justify-center items-center gap-2">
              <i className="fa-solid fa-eye"></i> ดูรายละเอียด
            </button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 border border-gray-100 flex flex-col h-full group opacity-80">
          <div className="h-56 bg-gray-100 flex items-center justify-center text-gray-400 relative overflow-hidden">
            <i className="fa-solid fa-cat text-6xl group-hover:scale-110 transition duration-300"></i>
            <span className="absolute top-3 left-3 bg-white/90 text-orange-500 text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-orange-400 rounded-full"></span> กำลังอนุมัติ
            </span>
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-itim text-2xl text-textMain">ส้มซ่า</h3>
              <span className="bg-blue-50 text-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-lg" title="เพศผู้">
                <i className="fa-solid fa-mars"></i>
              </span>
            </div>
            <div className="flex flex-col gap-2 text-sm text-gray-500 mb-6 flex-1">
              <p className="flex items-center gap-2"><i className="fa-solid fa-paw w-4 text-gray-400"></i> แมว</p>
              <p className="flex items-center gap-2"><i className="fa-solid fa-location-dot w-4 text-gray-400"></i> คลินิกรักษาสัตว์ฉลอง</p>
            </div>
            <button className="w-full font-mali font-semibold border-2 border-gray-200 text-gray-500 hover:border-primary hover:text-primary py-2.5 rounded-xl transition duration-300 flex justify-center items-center gap-2">
              <i className="fa-solid fa-eye"></i> ดูรายละเอียด
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row relative shadow-2xl">
            <button onClick={closeModal} className="absolute top-4 right-4 bg-white/80 backdrop-blur text-gray-500 hover:text-primary hover:bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm z-20 transition">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>

            {/* ฝั่งซ้าย: รูปภาพ */}
            <div className="lg:w-1/2 bg-bgMain p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="w-full h-80 bg-bgAccent rounded-2xl flex items-center justify-center text-primaryHover shadow-inner relative">
                <i className="fa-solid fa-dog text-9xl"></i>
                <span className="absolute bottom-4 left-4 bg-white/80 px-3 py-1 rounded-lg text-sm font-semibold text-textMain">
                  <i className="fa-regular fa-image"></i> รูปหลัก
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="h-20 bg-bgAccent rounded-xl flex items-center justify-center text-primaryHover opacity-60 hover:opacity-100 cursor-pointer transition"><i className="fa-solid fa-camera"></i></div>
                <div className="h-20 bg-bgAccent rounded-xl flex items-center justify-center text-primaryHover opacity-60 hover:opacity-100 cursor-pointer transition"><i className="fa-solid fa-camera"></i></div>
                <div className="h-20 bg-bgAccent rounded-xl flex items-center justify-center text-primaryHover opacity-60 hover:opacity-100 cursor-pointer transition"><i className="fa-solid fa-camera"></i></div>
                <div className="h-20 bg-bgAccent rounded-xl flex items-center justify-center text-primaryHover opacity-60 hover:opacity-100 cursor-pointer transition"><i className="fa-solid fa-camera"></i></div>
              </div>
            </div>

            {/* ฝั่งขวา: ข้อมูล */}
            <div className="lg:w-1/2 p-8 lg:p-10 flex flex-col overflow-y-auto border-l border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span> ว่าง / ต้องการบ้าน
                </span>
              </div>

              <h2 className="font-itim text-5xl text-textMain mb-4 flex items-center gap-4">
                เต้าหู้ 
                <i className="fa-solid fa-venus text-pink-400 text-3xl" title="ตัวเมีย"></i>
              </h2>

              <p className="text-gray-600 mb-6 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                &quot;เต้าหู้เป็นสุนัขที่ถูกพบข้างถนนในสภาพผอมโซ ปัจจุบันได้รับการรักษาจนสุขภาพแข็งแรง ร่าเริง ขี้อ้อน เข้ากับเด็กและสัตว์อื่นๆ ได้ดีมาก ต้องการบ้านที่มีรั้วรอบขอบชิด&quot;
              </p>

              <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                <div>
                  <p className="text-xs text-gray-400 mb-1">สปีชีส์</p>
                  <p className="font-semibold text-textMain"><i className="fa-solid fa-dog text-primary mr-2"></i>สุนัข (พันธุ์ไทย)</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">อายุ</p>
                  <p className="font-semibold text-textMain"><i className="fa-solid fa-clock text-primary mr-2"></i>~ 2 ปี</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">สีหลัก</p>
                  <p className="font-semibold text-textMain"><i className="fa-solid fa-palette text-primary mr-2"></i>สีน้ำตาลอ่อน / ขาว</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">น้ำหนัก</p>
                  <p className="font-semibold text-textMain"><i className="fa-solid fa-weight-scale text-primary mr-2"></i>12 กิโลกรัม</p>
                </div>
              </div>

              <div className="mb-8 border-t border-gray-100 pt-6">
                <h4 className="font-mali font-semibold text-lg mb-3">📍 ข้อมูลสถานที่ดูแลปัจจุบัน</h4>
                <div className="flex items-start gap-3 bg-bgMain p-4 rounded-xl">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shrink-0 shadow-sm border border-gray-100">
                    <i className="fa-solid fa-house-medical text-xl"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-textMain text-lg">ศูนย์พักพิงสัตว์ภูเก็ต</p>
                    <p className="text-sm text-gray-500 mb-1"><i className="fa-solid fa-phone text-xs"></i> 076-XXX-XXXX</p>
                    <p className="text-sm text-gray-500">ต.รัษฎา อ.เมือง จ.ภูเก็ต (เปิดทำการ 09:00 - 17:00 น.)</p>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4">
                <button className="w-full font-mali font-semibold bg-gray-200 text-gray-500 py-4 rounded-xl cursor-not-allowed flex justify-center items-center gap-2 transition hover:bg-gray-300" title="กรุณาเข้าสู่ระบบ">
                  <i className="fa-solid fa-lock"></i> เข้าสู่ระบบเพื่อขอรับเลี้ยง
                </button>
                <p className="text-center text-xs text-primary mt-3 font-semibold">
                  * ต้องเป็นสมาชิกและยืนยันตัวตนก่อนเพื่อความปลอดภัยของสัตว์
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}