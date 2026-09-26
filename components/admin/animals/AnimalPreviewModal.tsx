"use client";

import { Animal } from "@/types/animal";
import { getAnimalImages } from "@/lib/animalImageHelper";

interface Props {
  viewingAnimal: Animal | null;
  currentImageIndex: number;
  setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
  onEdit: (animal: Animal) => void;
  onDelete: (id: string, name: string) => void;
}

export default function AnimalPreviewModal({
  viewingAnimal,
  currentImageIndex,
  setCurrentImageIndex,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  if (!viewingAnimal) return null;

  const images = getAnimalImages(viewingAnimal.image_url);

  // ฟังก์ชันสลับสีสถานะสุขภาพ
  const getHealthBadgeStyle = (health?: string) => {
    switch (health) {
      case "ปกติ":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "ป่วย":
        return "bg-amber-100 text-amber-700 border-amber-200"; // เหลืองส้ม
      case "บาดเจ็บ":
        return "bg-rose-100 text-rose-700 border-rose-200"; // แดง
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur text-gray-500 hover:text-primary hover:bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm z-20 transition"
        >
          <i className="fa-solid fa-xmark text-xl"></i>
        </button>

        {/* แกลเลอรีรูปภาพ */}
        <div className="w-full lg:w-1/2 bg-gray-50/50 p-4 sm:p-6 flex flex-col justify-start gap-4 border-b lg:border-b-0 lg:border-r border-gray-100 shrink-0">
          <div className="relative w-full flex-1 min-h-[300px] max-h-[420px] bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center group">
            <img
              src={images[currentImageIndex] || images[0]}
              alt={viewingAnimal.name}
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow"
                >
                  <i className="fa-solid fa-chevron-left text-xs"></i>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow"
                >
                  <i className="fa-solid fa-chevron-right text-xs"></i>
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`h-16 rounded-xl overflow-hidden border-2 ${currentImageIndex === idx ? "border-primary" : "border-transparent opacity-60"
                    }`}
                >
                  <img src={url} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* รายละเอียด */}
        <div className="w-full lg:w-1/2 p-5 sm:p-6 lg:p-8 flex flex-col overflow-y-visible lg:overflow-y-auto flex-1">
          {/* ป้ายสถานะ & ป้ายสุขภาพ */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-semibold">
              สถานะ: {viewingAnimal.status || "รอคนดูแล"}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${getHealthBadgeStyle(
                viewingAnimal.health_status
              )}`}
            >
              สุขภาพ: {viewingAnimal.health_status || "ปกติ"}
            </span>
          </div>

          {/* ชื่อสัตว์ และ ไอคอนเพศ */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="font-itim text-3xl sm:text-4xl text-textMain">
              {viewingAnimal.name}
            </h2>
            <span
              className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm ${viewingAnimal.gender === "ตัวเมีย"
                ? "bg-pink-50 text-pink-500"
                : "bg-blue-50 text-blue-500"
                }`}
            >
              <i
                className={`fa-solid ${viewingAnimal.gender === "ตัวเมีย" ? "fa-venus" : "fa-mars"
                  }`}
              ></i>
            </span>
          </div>

          {/* เรื่องราวและลักษณะนิสัย */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-rose-500 mb-1 flex items-center gap-1.5">
              <i className="fa-solid fa-quote-left text-[10px]"></i> เรื่องราวและลักษณะนิสัย
            </p>
            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/80 p-3 rounded-xl border border-gray-100">
              {viewingAnimal.description || "ไม่มีคำบรรยายเพิ่มเติม"}
            </p>
          </div>

          {/* สเปกรายละเอียดสัตว์ */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs mb-5">
            <div>
              <span className="text-gray-400 block mb-0.5">ประเภท</span>
              <span className="font-semibold text-gray-700">{viewingAnimal.species || "-"}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">ช่วงอายุ</span>
              <span className="font-semibold text-gray-700">{viewingAnimal.age || "-"}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">สีหลัก</span>
              <span className="font-semibold text-gray-700">{viewingAnimal.color || "-"}</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">การทำหมัน</span>
              <span className="font-semibold text-gray-700">
                {viewingAnimal.is_neutered ? "ทำหมันแล้ว" : "ยังไม่ทำหมัน"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400 block mb-0.5">ประวัติวัคซีน</span>
              <span className="font-semibold text-gray-700">
                {Boolean((viewingAnimal as any).vaccine)
                  ? (viewingAnimal as any).vaccine
                  : "ยังไม่ได้รับวัคซีน"}
              </span>
            </div>
          </div>

          {/* ศูนย์ที่ดูแล */}
          {viewingAnimal.shelters && (
            <div className="border-t border-gray-100 pt-3 mb-6">
              <p className="text-xs font-semibold text-rose-500 mb-1 flex items-center gap-1">
                <i className="fa-solid fa-location-dot"></i> ศูนย์ที่ดูแล
              </p>
              <p className="text-xs font-bold text-gray-800">
                {viewingAnimal.shelters.shelter_name}
              </p>
              {viewingAnimal.shelters.address && (
                <p className="text-[11px] text-gray-500">{viewingAnimal.shelters.address}</p>
              )}

            </div>
          )}

          {/* ปุ่ม Action สำหรับแอดมิน */}
          <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
            <button
              onClick={() => {
                const target = viewingAnimal;
                onClose();
                onEdit(target);
              }}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-mali font-semibold hover:bg-primaryHover transition shadow-sm"
            >
              แก้ไขข้อมูลสัตว์ตัวนี้
            </button>
            <button
              onClick={() => onDelete(viewingAnimal.animal_id, viewingAnimal.name)}
              className="px-4 py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-mali font-semibold hover:bg-red-100 transition"
            >
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}