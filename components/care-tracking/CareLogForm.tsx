// components/care-tracking/CareLogForm.tsx
"use client";

import React, { useRef } from "react";
import { CareLogFormData } from "@/types/careLog";
import { formatThaiDateBE, getThaiYear } from "@/lib/dateHelper";

interface Props {
  formData: CareLogFormData;
  setFormData: React.Dispatch<React.SetStateAction<CareLogFormData>>;
  handleImageChange: (file: File | null) => void;
  handleSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  disabled?: boolean;
}

export default function CareLogForm({
  formData,
  setFormData,
  handleImageChange,
  handleSubmit,
  submitting,
  disabled = false,
}: Props) {
  // Input สำหรับเปิดกล้องมือถือโดยตรง (capture="environment")
  const cameraInputRef = useRef<HTMLInputElement>(null);
  // Input สำหรับเลือกรูปภาพจากเครื่อง/แกลเลอรี
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageChange(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-stone-100 font-prompt">
      {/* ส่วนหัวฟอร์ม */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold font-mali text-stone-800 mb-1.5 flex items-center gap-2">
          <span>เพิ่มบันทึกใหม่</span>
          <span className="text-xs bg-[#FDF0EB] text-[#C07055] font-prompt font-semibold px-2.5 py-0.5 rounded-full">
            แบบฟอร์ม
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-stone-400">
          กรอกข้อมูลและแนบรูปภาพเพื่อให้เจ้าหน้าที่ทราบความเป็นอยู่ของน้อง
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* แถวที่ 1: ประเภทกิจกรรม + วันที่อัปเดต (พ.ศ.) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ช่องเลือกประเภทกิจกรรม */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-stone-700 mb-1.5">
              ประเภทกิจกรรม <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.activity_type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, activity_type: e.target.value }))
                }
                disabled={disabled || submitting}
                className="w-full min-h-[48px] h-12 text-sm sm:text-base px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-none focus:border-[#E29578] focus:bg-white shadow-2xs transition appearance-none cursor-pointer"
                required
              >
                <option value="อัปเดตอาการถ่ายรูปทุกเดือน">อัปเดตอาการถ่ายรูปทุกเดือน</option>
                <option value="พาไปหาหมอ (วัคซีน)">พาไปหาหมอ (วัคซีน)</option>
                <option value="พาไปหาหมอ (ตรวจสุขภาพ/รักษา)">พาไปหาหมอ (ตรวจสุขภาพ/รักษา)</option>
                <option value="การปรับตัวและพฤติกรรม">การปรับตัวและพฤติกรรม</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-stone-400">
                <i className="fa-solid fa-chevron-down text-xs"></i>
              </div>
            </div>
          </div>

          {/* ช่องวันที่อัปเดต (พ.ศ.) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-semibold text-stone-700">
                วันที่อัปเดต (พ.ศ.) <span className="text-red-500">*</span>
              </label>
              {formData.log_date && (
                <span className="text-[11px] font-medium text-[#C07055] bg-[#FDF0EB] px-2 py-0.5 rounded-full">
                  พ.ศ. {getThaiYear(formData.log_date)}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="date"
                value={formData.log_date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, log_date: e.target.value }))
                }
                disabled={disabled || submitting}
                className="w-full min-h-[48px] h-12 text-sm sm:text-base px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-none focus:border-[#E29578] focus:bg-white shadow-2xs transition cursor-pointer"
                required
              />
            </div>
            {formData.log_date && (
              <p className="mt-1 text-[11px] sm:text-xs text-stone-400 flex items-center gap-1.5 pl-1">
                <i className="fa-regular fa-calendar-check text-[#E29578]"></i>
                <span>วันที่เลือก: {formatThaiDateBE(formData.log_date)}</span>
              </p>
            )}
          </div>
        </div>

        {/* แถวที่ 2: รายละเอียดความเป็นอยู่ */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-stone-700 mb-1.5">
            รายละเอียดความเป็นอยู่ <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            disabled={disabled || submitting}
            placeholder="เล่าความเป็นอยู่ของน้อง อาการ พฤติกรรม หรือความคืบหน้าต่างๆ เช่น การทานอาหาร การขับถ่าย หรือการเข้ากับคนในบ้าน..."
            className="w-full min-h-[120px] text-sm sm:text-base px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#E29578] focus:bg-white shadow-2xs transition resize-none leading-relaxed"
            required
          />
        </div>

        {/* แถวที่ 3: กล่องอัปโหลดรูปภาพ ปรับแต่งเพื่อการสัมผัส (Touch Experience) */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-stone-700 mb-1.5">
            อัปโหลดรูปภาพของน้อง
          </label>

          {/* Input เปิดกล้องมือถือทันที (capture="environment") */}
          <input
            type="file"
            ref={cameraInputRef}
            onChange={onFileInputChange}
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={disabled || submitting}
          />

          {/* Input เลือกรูปจากเครื่อง/แกลเลอรี */}
          <input
            type="file"
            ref={galleryInputRef}
            onChange={onFileInputChange}
            accept="image/*"
            className="hidden"
            disabled={disabled || submitting}
          />

          {formData.image_preview ? (
            /* พรีวิวรูปภาพที่เลือก พร้อมปุ่ม Touch ขนาดใหญ่ */
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 flex flex-col shadow-2xs">
              <img
                src={formData.image_preview}
                alt="Preview"
                className="w-full h-56 sm:h-64 object-cover"
              />
              <div className="p-3 bg-white border-t border-stone-100 flex items-center justify-between gap-2">
                <span className="text-xs text-stone-500 truncate pl-1 flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-check text-emerald-500"></i>
                  <span>เลือกรูปภาพแล้ว</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="min-h-[44px] h-11 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 rounded-xl text-xs sm:text-sm font-medium transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-arrows-rotate"></i>
                    <span>เปลี่ยนรูป</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleImageChange(null)}
                    className="min-h-[44px] h-11 px-3.5 py-2 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 rounded-xl text-xs sm:text-sm font-medium transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <i className="fa-solid fa-trash"></i>
                    <span>ลบรูป</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* กล่องแตะอัปโหลด / ถ่ายภาพ (Touch Target Design) */
            <div className="border-2 border-dashed border-[#E29578]/40 hover:border-[#E29578] bg-[#FDF0EB]/30 rounded-2xl p-5 sm:p-6 text-center transition">
              <div className="flex flex-col items-center justify-center gap-2 mb-4">
                <div className="w-14 h-14 rounded-full bg-white shadow-xs text-[#E29578] flex items-center justify-center text-2xl">
                  <i className="fa-solid fa-camera"></i>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-stone-800 font-mali">
                  ถ่ายภาพ / เลือกรูปจากเครื่อง
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-400 max-w-sm">
                  แตะเพื่อเปิดกล้องถ่ายภาพน้องทันที หรือเลือกไฟล์รูปจากอัลบั้ม (สูงสุด 5MB)
                </p>
              </div>

              {/* ปุ่มสัมผัส 2 ตัวเลือก สำหรับมือถือและจอสัมผัส (Touch Targets >= 48px) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={disabled || submitting}
                  className="w-full min-h-[48px] h-12 bg-white hover:bg-stone-50 active:bg-stone-100 border-2 border-[#E29578] text-[#C07055] rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  <i className="fa-solid fa-camera text-base"></i>
                  <span>ถ่ายภาพทันที (เปิดกล้อง)</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={disabled || submitting}
                  className="w-full min-h-[48px] h-12 bg-[#E29578] hover:bg-[#C07055] active:bg-[#A8583E] text-white rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  <i className="fa-solid fa-images text-base"></i>
                  <span>เลือกรูปจากเครื่อง</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ปุ่มบันทึกข้อมูลหลัก (แสดงในเนื้อหาฟอร์มบนจอ Desktop / Tablet) */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={disabled || submitting}
            className="w-full min-h-[48px] h-12 sm:h-14 bg-[#E29578] hover:bg-[#C07055] active:bg-[#A8583E] text-white py-3.5 sm:py-4 rounded-2xl font-mali font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.99]"
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>กำลังบันทึกข้อมูล...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk"></i>
                <span>บันทึกผลการดูแล</span>
              </>
            )}
          </button>
        </div>

        {/* ปุ่มบันทึกแบบ Sticky ตรึงขอบล่างหน้าจอบนมือถือ (Sticky Bottom Button) */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 p-3 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:hidden">
          <div className="max-w-md mx-auto">
            <button
              type="submit"
              disabled={disabled || submitting}
              className="w-full min-h-[48px] h-12 bg-[#E29578] active:bg-[#A8583E] text-white rounded-2xl font-mali font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>กำลังบันทึกข้อมูล...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk"></i>
                  <span>บันทึกผลการดูแล</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
