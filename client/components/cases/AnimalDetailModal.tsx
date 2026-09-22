"use client";

import { Animal } from "@/types/animal";
import { getAnimalImages } from "@/lib/animalImageHelper";

interface Props {
  selectedAnimal: Animal | null;
  currentImageIndex: number;
  setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
}

export default function AnimalDetailModal({
  selectedAnimal,
  currentImageIndex,
  setCurrentImageIndex,
  onClose,
}: Props) {
  if (!selectedAnimal) return null;

  const images = getAnimalImages(selectedAnimal.image_url);

  const getDaysInShelter = (dateString?: string) => {
    if (!dateString) return 0;
    const diffTime = Math.abs(new Date().getTime() - new Date(dateString).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur text-gray-500 hover:text-primary hover:bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm z-20 transition"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        {/* ฝั่งซ้าย: รูปภาพและแกลเลอรี */}
        <div className="lg:w-1/2 bg-gray-50/50 p-6 flex flex-col justify-start gap-4 border-b lg:border-b-0 lg:border-r border-gray-100">
          <div className="relative w-full flex-1 min-h-[320px] max-h-[440px] bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center group">
            <img
              src={images[currentImageIndex] || images[0]}
              alt={selectedAnimal.name}
              className="w-full h-full object-cover select-none transition-all duration-300"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md cursor-pointer transition"
                >
                  <i className="fa-solid fa-chevron-left text-sm"></i>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md cursor-pointer transition"
                >
                  <i className="fa-solid fa-chevron-right text-sm"></i>
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 shrink-0">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                    currentImageIndex === idx
                      ? "border-primary scale-95 shadow-sm"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={imgUrl} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ฝั่งขวา: รายละเอียดสัตว์ */}
        <div className="lg:w-1/2 p-8 lg:p-10 flex flex-col overflow-y-auto border-l border-gray-100">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
              สถานะ: {selectedAnimal.status}
            </span>
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${
                selectedAnimal.health_status === "ปกติ"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              สุขภาพ: {selectedAnimal.health_status}
            </span>
            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <i className="fa-regular fa-clock text-amber-600"></i> รอคอยบ้านมาแล้ว {getDaysInShelter(selectedAnimal.created_at)} วัน
            </span>
          </div>

          <h2 className="font-itim text-5xl text-textMain mb-4 flex items-center gap-4">
            {selectedAnimal.name}
            <i
              className={`fa-solid ${
                selectedAnimal.gender === "ตัวเมีย" ? "fa-venus text-pink-400" : "fa-mars text-blue-400"
              } text-3xl`}
            ></i>
          </h2>

          {selectedAnimal.health_status !== "ปกติ" && selectedAnimal.health_description && (
            <div className="mb-4 p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
              <i className="fa-solid fa-notes-medical mt-0.5 text-base text-amber-600 shrink-0"></i>
              <div className="leading-relaxed">
                <span className="font-semibold text-amber-800">ข้อมูลสุขภาพ/กายภาพเพิ่มเติม: </span>
                {selectedAnimal.health_description}
              </div>
            </div>
          )}

          <div className="mb-5 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
            <p className="text-xs text-gray-400 font-semibold mb-1 flex items-center gap-1.5">
              <i className="fa-solid fa-quote-left text-primary"></i> เรื่องราวและลักษณะนิสัย
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {selectedAnimal.description || "น้องเป็นมิตร ร่าเริง สุขภาพพร้อมย้ายเข้าบ้านใหม่และต้องการความรักจากครอบครัวที่อบอุ่น"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-4 mb-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">ประเภท</p>
              <p className="font-semibold text-textMain">{selectedAnimal.species}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">ช่วงอายุ</p>
              <p className="font-semibold text-textMain">{selectedAnimal.age}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">สีหลัก</p>
              <p className="font-semibold text-textMain">{selectedAnimal.color}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">การทำหมัน</p>
              <p className="font-semibold text-textMain">{selectedAnimal.is_neutered ? "ทำหมันแล้ว" : "ยังไม่ทำหมัน"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-400 mb-1">ประวัติวัคซีน</p>
              <p className="font-semibold text-textMain">{selectedAnimal.vaccine || "ยังไม่ได้รับวัคซีน"}</p>
            </div>
          </div>

          <div className="mb-6 border-t border-gray-100 pt-4">
            <h4 className="font-mali font-semibold text-base mb-2">📍 ศูนย์ที่ดูแล</h4>
            <div className="bg-bgMain p-3 rounded-xl text-sm">
              <p className="font-semibold text-textMain">{selectedAnimal.shelters?.shelter_name}</p>
              <p className="text-gray-500">{selectedAnimal.shelters?.address}</p>
              <p className="text-gray-500">โทร: {selectedAnimal.shelters?.contact_phone}</p>
            </div>
          </div>

          <div className="mt-auto pt-2">
            <button
              className="w-full font-mali font-semibold bg-gray-200 text-gray-500 py-3 rounded-xl cursor-not-allowed flex justify-center items-center gap-2"
              title="กรุณาเข้าสู่ระบบก่อนทำรายการ"
            >
              <i className="fa-solid fa-lock"></i> เข้าสู่ระบบเพื่อขอรับเลี้ยง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}