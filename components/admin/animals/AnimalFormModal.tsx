"use client";

import { ShelterOption } from "@/types/shelter";
import { AnimalFormData } from "@/hooks/useAnimalsAdmin";
import { VACCINE_OPTIONS } from "@/constants/vaccines";

interface Props {
  isOpen: boolean;
  isEditing: boolean;
  formData: AnimalFormData;
  setFormData: React.Dispatch<React.SetStateAction<AnimalFormData>>;
  shelters: ShelterOption[];
  uploading: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onVaccineToggle: (vaccine: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AnimalFormModal({
  isOpen,
  isEditing,
  formData,
  setFormData,
  shelters,
  uploading,
  onFileUpload,
  onRemoveImage,
  onVaccineToggle,
  onClose,
  onSubmit,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-7 relative shadow-2xl">        <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>

        <h2 className="font-mali font-semibold text-2xl mb-6 text-textMain flex items-center gap-2">
          <i className={`fa-solid ${isEditing ? "fa-pen-to-square text-primary" : "fa-circle-plus text-primary"}`}></i>
          {isEditing ? "แก้ไขข้อมูลสัตว์" : "เพิ่มข้อมูลสัตว์ใหม่เข้าสู่ระบบ"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">ชื่อสัตว์ *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary"
                placeholder="เช่น ทองเอก"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ศูนย์พักพิงที่สังกัด *
              </label>
              <select
                value={formData.shelter_id || ""}
                onChange={(e) => setFormData({ ...formData, shelter_id: e.target.value })}
                className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-xl p-2.5 outline-none focus:border-primary transition"
                required
              >
                <option value="">-- เลือกศูนย์พักพิง --</option>
                {shelters.map((s) => (
                  <option key={s.shelter_id} value={s.shelter_id}>
                    {s.shelter_name} {s.province ? `(${s.province})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">ประเภทสัตว์</label>
              <select
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="สุนัข">สุนัข</option>
                <option value="แมว">แมว</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">เพศ</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="ตัวผู้">ตัวผู้</option>
                <option value="ตัวเมีย">ตัวเมีย</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">ช่วงอายุ</label>
              <select
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="เด็ก (0-1 ปี)">เด็ก (0-1 ปี)</option>
                <option value="โตเต็มวัย (1-7 ปี)">โตเต็มวัย (1-7 ปี)</option>
                <option value="สูงอายุ (7 ปีขึ้นไป)">สูงอายุ (7 ปีขึ้นไป)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">สีหลัก *</label>
              <select
                value={formData.color || "ขาว"}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-xl p-2.5 outline-none focus:border-primary"
                required
              >
                <option value="ขาว">ขาว</option>
                <option value="ดำ">ดำ</option>
                <option value="น้ำตาล">น้ำตาล</option>
                <option value="ส้ม">ส้ม</option>
                <option value="เทา">เทา</option>
                <option value="ครีม">ครีม</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">สถานะสุขภาพ</label>
              <select
                value={formData.health_status}
                onChange={(e) => setFormData({ ...formData, health_status: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="ปกติ">ปกติ</option>
                <option value="ป่วย">ป่วย</option>
                <option value="บาดเจ็บ">บาดเจ็บ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">สถานะหาบ้าน</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="รอคนดูแล">รอคนดูแล</option>
                <option value="รอการอนุมัติ">รอการอนุมัติ</option>
                <option value="ได้บ้านแล้ว">ได้บ้านแล้ว</option>
              </select>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                ประวัติวัคซีน (เลือกได้หลายรายการ)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 p-3 bg-gray-50 rounded-2xl border border-gray-100">  {VACCINE_OPTIONS.map((vaccineName) => {
                const currentList = formData.vaccine
                  ? formData.vaccine.split(",").map((v) => v.trim())
                  : [];
                const isChecked = currentList.includes(vaccineName);

                return (
                  <label
                    key={vaccineName}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs cursor-pointer border transition ${isChecked
                      ? "bg-primary/10 border-primary text-primary font-semibold"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onVaccineToggle(vaccineName)}
                      className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    />
                    <span>{vaccineName}</span>
                  </label>
                );
              })}
              </div>
            </div>
          </div>

          {/* ส่วนจัดการรูปภาพ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-700">
                รูปภาพสัตว์ (รูปแรกสุดจะเป็นรูปหน้าปก)
              </label>

              <label
                className={`cursor-pointer text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${uploading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
              >
                <i className={`fa-solid ${uploading ? "fa-spinner fa-spin" : "fa-cloud-arrow-up"}`}></i>
                <span>{uploading ? "กำลังอัปโหลด..." : "+ อัปโหลดรูปภาพ"}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={onFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 sm:gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 min-h-[96px] items-center">
              {formData.image_urls &&
                formData.image_urls.filter((url) => url && typeof url === "string" && url.trim() !== "").length > 0 ? (
                formData.image_urls
                  .filter((url) => url && typeof url === "string" && url.trim() !== "")
                  .map((url, idx) => (
                    <div
                      key={idx}
                      className="relative group w-full aspect-square rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm"
                    >
                      <img
                        src={url}
                        alt={`preview-${idx}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                          หน้าปก
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs transition shadow"
                        title="ลบรูปนี้"
                      >
                        ✕
                      </button>
                    </div>
                  ))
              ) : (
                <p className="text-xs text-gray-400 text-center col-span-full py-4">
                  {uploading ? "กำลังบันทึกรูปภาพขึ้นระบบ..." : "ยังไม่มีรูปภาพ กรุณากดปุ่ม + อัปโหลดรูปภาพ"}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">รายละเอียดสุขภาพ / กายภาพเพิ่มเติม</label>
            <input
              type="text"
              value={formData.health_description}
              onChange={(e) => setFormData({ ...formData, health_description: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary"
              placeholder="เช่น มีแผลเป็นที่ขาหลังซ้าย หายสนิทแล้ว"
            />
          </div>

          <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <input
              type="checkbox"
              id="is_neutered"
              checked={Boolean(formData.is_neutered)}
              onChange={(e) => setFormData({ ...formData, is_neutered: e.target.checked })}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
            />
            <label htmlFor="is_neutered" className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
              ทำหมันแล้ว (ติ๊กถูกเมื่อสัตว์ได้รับการทำหมันแล้ว)
            </label>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">เรื่องราวและลักษณะนิสัย</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary"
              placeholder="เช่น ขี้เล่น ร่าเริง ชอบนอนหงายให้อ้อนพุง..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-mali hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-mali font-semibold hover:bg-primaryHover shadow-sm"
            >
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}