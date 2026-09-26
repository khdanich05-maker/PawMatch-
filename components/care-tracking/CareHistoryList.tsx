// components/care-tracking/CareHistoryList.tsx
"use client";

import React, { useState } from "react";
import { CareLog } from "@/types/careLog";
import { formatThaiDateBE } from "@/lib/dateHelper";

interface Props {
  careLogs: CareLog[];
  loading: boolean;
}

export default function CareHistoryList({ careLogs, loading }: Props) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // เลือกไอคอนตามประเภทกิจกรรม
  const getActivityIcon = (type: string) => {
    if (type.includes("หมอ") || type.includes("วัคซีน") || type.includes("สุขภาพ")) {
      return {
        icon: "fa-solid fa-stethoscope",
        bgColor: "bg-blue-50",
        textColor: "text-blue-500",
        borderColor: "border-blue-200",
      };
    }
    if (type.includes("รูป") || type.includes("เดือน")) {
      return {
        icon: "fa-solid fa-camera",
        bgColor: "bg-amber-50",
        textColor: "text-amber-500",
        borderColor: "border-amber-200",
      };
    }
    return {
      icon: "fa-solid fa-paw",
      bgColor: "bg-[#FDF0EB]",
      textColor: "text-[#C07055]",
      borderColor: "border-[#E29578]/30",
    };
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 flex flex-col font-prompt">
      {/* ส่วนหัวการ์ด */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-stone-100">
        <div className="w-8 h-8 rounded-full bg-[#FDF0EB] text-[#C07055] flex items-center justify-center text-sm">
          <i className="fa-solid fa-clock-rotate-left"></i>
        </div>
        <h3 className="font-mali font-bold text-lg text-stone-800">
          ประวัติการอัปเดต
        </h3>
        <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full ml-auto">
          {careLogs.length} รายการ
        </span>
      </div>

      {/* รายการประวัติ Timeline */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-stone-400">
          <i className="fa-solid fa-spinner fa-spin text-2xl mb-2 text-[#E29578]"></i>
          <p className="text-xs">กำลังโหลดประวัติการดูแล...</p>
        </div>
      ) : careLogs.length === 0 ? (
        <div className="py-10 px-4 text-center text-stone-400 bg-stone-50/60 rounded-2xl border border-dashed border-stone-200">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-300 text-xl mb-3">
            <i className="fa-solid fa-file-pen"></i>
          </div>
          <p className="text-sm font-medium text-stone-600 mb-1">ยังไม่มีประวัติการอัปเดต</p>
          <p className="text-xs text-stone-400">
            เริ่มบันทึกความคืบหน้าและการเป็นอยู่ของน้องได้จากฟอร์มด้านข้าง
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
          {careLogs.map((log) => {
            const style = getActivityIcon(log.activity_type);

            return (
              <div key={log.log_id} className="relative group">
                {/* จุดกลม Timeline */}
                <div
                  className={`absolute -left-[29px] top-0.5 w-6 h-6 rounded-full border ${style.borderColor} ${style.bgColor} ${style.textColor} flex items-center justify-center text-[10px] shadow-xs`}
                >
                  <i className={style.icon}></i>
                </div>

                {/* เนื้อหาบันทึก */}
                <div className="bg-stone-50/70 group-hover:bg-stone-50 p-4 rounded-2xl border border-stone-100 transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-stone-800 font-mali">
                      {log.activity_type}
                    </span>
                    <span className="text-[11px] text-stone-400 shrink-0">
                      {formatThaiDateBE(log.log_date)}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line mb-3">
                    {log.description}
                  </p>

                  {/* รูปภาพแนบ (ถ้ามี) */}
                  {log.image_url && (
                    <div className="mt-2">
                      <div
                        onClick={() => setPreviewImage(log.image_url || null)}
                        className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden cursor-pointer border border-stone-200 shadow-2xs group/img"
                        title="คลิกเพื่อดูรูปภาพขนาดใหญ่"
                      >
                        <img
                          src={log.image_url}
                          alt="Care update"
                          className="w-full h-full object-cover transition duration-300 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-xs transition">
                          <i className="fa-solid fa-magnifying-glass-plus"></i>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal ดูรูปขยาย */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={previewImage}
              alt="Care Log Preview"
              className="max-w-full max-h-[85vh] object-contain"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
