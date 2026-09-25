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
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-semibold">
              {viewingAnimal.status}
            </span>
            <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full font-semibold">
              สุขภาพ: {viewingAnimal.health_status}
            </span>
          </div>

          <h2 className="font-itim text-4xl text-textMain mb-4">{viewingAnimal.name}</h2>

          <p className="text-xs text-gray-500 mb-4 bg-gray-50 p-3 rounded-xl leading-relaxed">
            {viewingAnimal.description || "ไม่มีคำบรรยาย"}
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs mb-6">
            <div><span className="text-gray-400">ประเภท:</span> <span className="font-semibold">{viewingAnimal.species}</span></div>
            <div><span className="text-gray-400">เพศ:</span> <span className="font-semibold">{viewingAnimal.gender}</span></div>
            <div><span className="text-gray-400">อายุ:</span> <span className="font-semibold">{viewingAnimal.age}</span></div>
            <div><span className="text-gray-400">สี:</span> <span className="font-semibold">{viewingAnimal.color}</span></div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
            <button
              onClick={() => {
                const target = viewingAnimal;
                onClose();
                onEdit(target);
              }}
              className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-mali font-semibold hover:bg-primaryHover"
            >
              แก้ไขข้อมูลสัตว์ตัวนี้
            </button>
            <button
              onClick={() => onDelete(viewingAnimal.animal_id, viewingAnimal.name)}
              className="px-4 py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-mali font-semibold hover:bg-red-100"
            >
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}