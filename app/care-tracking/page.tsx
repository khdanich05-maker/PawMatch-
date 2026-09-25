// app/care-tracking/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useCareTracking } from "@/hooks/useCareTracking";
import PetAdoptedCard from "@/components/care-tracking/PetAdoptedCard";
import CareHistoryList from "@/components/care-tracking/CareHistoryList";
import CareLogForm from "@/components/care-tracking/CareLogForm";

export default function CareTrackingPage() {
  const {
    checkingAuth,
    loading,
    logsLoading,
    submitting,
    adoptedPets,
    selectedMatch,
    setSelectedMatch,
    careLogs,
    formData,
    setFormData,
    handleImageChange,
    handleSubmit,
    toast,
  } = useCareTracking();

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-prompt text-stone-500">
        <i className="fa-solid fa-spinner fa-spin text-3xl text-[#E29578] mb-3"></i>
        <p className="text-sm">กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-bgMain pb-16 font-prompt">
      {/* Toast Alert แจ้งเตือน */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-bounce-once">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-medium border ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : toast.type === "error"
                ? "bg-red-50 border-red-300 text-red-800"
                : "bg-blue-50 border-blue-300 text-blue-800"
            }`}
          >
            <i
              className={`text-base ${
                toast.type === "success"
                  ? "fa-solid fa-circle-check text-emerald-500"
                  : toast.type === "error"
                  ? "fa-solid fa-triangle-exclamation text-red-500"
                  : "fa-solid fa-circle-info text-blue-500"
              }`}
            ></i>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation ตาม Mockup */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-stone-400 font-prompt">
          <Link href="/" className="hover:text-[#C07055] transition">
            หน้าแรก
          </Link>
          <span>/</span>
          <Link href="/about" className="hover:text-[#C07055] transition">
            เกี่ยวกับเรา
          </Link>
          <span>/</span>
          <Link href="/cases" className="hover:text-[#C07055] transition">
            เคสที่ต้องการความช่วยเหลือ
          </Link>
          <span>/</span>
          <span className="text-[#C07055] font-semibold">อัปเดตสถานะการเลี้ยง</span>
        </nav>
      </div>

      {/* Header หัวข้อหน้า */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center">
        <h1 className="text-2xl sm:text-4xl font-bold font-mali text-stone-800 mb-2 sm:mb-3">
          อัปเดตสถานะการเลี้ยง 🐾
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-stone-500 max-w-2xl mx-auto leading-relaxed">
          บันทึกความคืบหน้าและส่งรูปภาพเพื่อเป็นข้อมูลให้เจ้าหน้าที่ทราบความเป็นอยู่ของน้อง
          เพื่อให้การดูแลสัตว์จรจัดเป็นไปด้วยดี และสร้างความไว้วางใจร่วมกัน
        </p>
      </section>

      {/* ส่วนเนื้อหาหลัก */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-stone-400">
            <i className="fa-solid fa-paw fa-bounce text-4xl text-[#E29578] mb-4"></i>
            <p className="text-sm">กำลังค้นหาข้อมูลสัตว์ที่คุณรับเลี้ยง...</p>
          </div>
        ) : adoptedPets.length === 0 ? (
          /* กรณีที่ User ยังไม่มีสัตว์ที่รับเลี้ยง */
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-12 text-center shadow-sm border border-stone-100 my-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#FDF0EB] text-[#E29578] flex items-center justify-center text-3xl mb-4">
              <i className="fa-solid fa-heart"></i>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-mali text-stone-800 mb-2">
              คุณยังไม่มีสัตว์ที่อยู่ในความดูแล
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed mb-6">
              ระบบนี้มีไว้สำหรับผู้ที่ได้รับการอนุมัติรับเลี้ยงสัตว์จรจัด
              เพื่อส่งบันทึกการเป็นอยู่และรูปภาพรายเดือน หากคุณกำลังมองหาสัตว์เลี้ยงที่ต้องการบ้าน
              สามารถเข้าไปเลือกดูน้องๆ ได้เลย
            </p>
            <Link
              href="/cases"
              className="inline-flex items-center gap-2 bg-[#E29578] hover:bg-[#C07055] text-white px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition shadow-sm"
            >
              <i className="fa-solid fa-paw"></i> ดูสัตว์ที่รอคอยบ้าน
            </Link>
          </div>
        ) : (
          /* Layout 2 คอลัมน์ ตาม Mockup */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* คอลัมน์ซ้าย: ข้อมูลสัตว์ + ประวัติการอัปเดต */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
              <PetAdoptedCard
                selectedMatch={selectedMatch}
                adoptedPets={adoptedPets}
                onSelectMatch={setSelectedMatch}
              />
              <CareHistoryList
                careLogs={careLogs}
                loading={logsLoading}
              />
            </div>

            {/* คอลัมน์ขวา: ฟอร์มเพิ่มบันทึกใหม่ */}
            <div className="lg:col-span-7 xl:col-span-8">
              <CareLogForm
                formData={formData}
                setFormData={setFormData}
                handleImageChange={handleImageChange}
                handleSubmit={handleSubmit}
                submitting={submitting}
                disabled={!selectedMatch}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
