// components/care-tracking/CareLogForm.tsx
"use client";

import React, { useRef } from "react";
import { CareLogFormData } from "@/types/careLog";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || submitting) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-100 font-prompt">
      {/* ส่วนหัวฟอร์ม */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold font-mali text-stone-800 mb-1.5">
          เพิ่มบันทึกใหม่
        </h2>
        <p className="text-xs sm:text-sm text-stone-400">
          กรอกข้อมูลและแนบรูปภาพเพื่อให้เจ้าหน้าที่ทราบความเป็นอยู่ของน้อง
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* แถวที่ 1: ประเภทกิจกรรม + วันที่อัปเดต */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              ประเภทกิจกรรม <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.activity_type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, activity_type: e.target.value }))
                }
                disabled={disabled || submitting}
                className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-none focus:border-[#E29578] focus:bg-white transition"
                required
              >
                <option value="อัปเดตอาการถ่ายรูปทุกเดือน">อัปเดตอาการถ่ายรูปทุกเดือน</option>
                <option value="พาไปหาหมอ (วัคซีน)">พาไปหาหมอ (วัคซีน)</option>
                <option value="พาไปหาหมอ (ตรวจสุขภาพ/รักษา)">พาไปหาหมอ (ตรวจสุขภาพ/รักษา)</option>
                <option value="การปรับตัวและพฤติกรรม">การปรับตัวและพฤติกรรม</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              วันที่อัปเดต <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.log_date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, log_date: e.target.value }))
              }
              disabled={disabled || submitting}
              className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 focus:outline-none focus:border-[#E29578] focus:bg-white transition"
              required
            />
          </div>
        </div>

        {/* แถวที่ 2: รายละเอียดความเป็นอยู่ */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
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
            className="w-full text-xs sm:text-sm px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#E29578] focus:bg-white transition resize-none"
            required
          />
        </div>

        {/* แถวที่ 3: กล่องอัปโหลดรูปภาพ */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            อัปโหลดรูปภาพของน้อง
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleImageChange(e.target.files[0]);
              }
            }}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
            disabled={disabled || submitting}
          />

          {formData.image_preview ? (
            /* พรีวิวรูปภาพที่เลือก */
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 max-h-56 bg-stone-100 flex items-center justify-center group">
              <img
                src={formData.image_preview}
                alt="Preview"
                className="w-full h-56 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-white text-stone-800 rounded-full text-xs font-medium shadow-sm hover:bg-stone-100 transition"
                >
                  <i className="fa-solid fa-arrows-rotate mr-1"></i> เปลี่ยนรูปภาพ
                </button>
                <button
                  type="button"
                  onClick={() => handleImageChange(null)}
                  className="px-3.5 py-1.5 bg-red-500 text-white rounded-full text-xs font-medium shadow-sm hover:bg-red-600 transition"
                >
                  <i className="fa-solid fa-trash mr-1"></i> ลบรูป
                </button>
              </div>
            </div>
          ) : (
            /* กล่อง Drag & Drop อัปโหลดตาม Mockup */
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#E29578]/40 hover:border-[#E29578] bg-[#FDF0EB]/40 hover:bg-[#FDF0EB]/70 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-xs text-[#E29578] group-hover:text-[#C07055] group-hover:scale-110 flex items-center justify-center transition">
                <i className="fa-solid fa-cloud-arrow-up text-xl"></i>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-stone-700">
                คลิกเพื่ออัปโหลด <span className="font-normal text-stone-500">หรือลากไฟล์มาวาง</span>
              </p>
              <p className="text-[11px] text-stone-400">
                รองรับ JPG, PNG (สูงสุด 5MB)
              </p>
            </div>
          )}
        </div>

        {/* ปุ่มบันทึกข้อมูล */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={disabled || submitting}
            className="w-full bg-[#E29578] hover:bg-[#C07055] text-white py-3.5 sm:py-4 rounded-2xl font-mali font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.99]"
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
      </form>
    </div>
  );
}
