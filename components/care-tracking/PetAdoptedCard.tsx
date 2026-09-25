// components/care-tracking/PetAdoptedCard.tsx
"use client";

import React from "react";
import { AdoptedPetMatch } from "@/types/careLog";
import { getAnimalImages } from "@/lib/animalImageHelper";

interface Props {
  selectedMatch: AdoptedPetMatch | null;
  adoptedPets: AdoptedPetMatch[];
  onSelectMatch: (match: AdoptedPetMatch) => void;
}

export default function PetAdoptedCard({
  selectedMatch,
  adoptedPets,
  onSelectMatch,
}: Props) {
  if (!selectedMatch) return null;

  const animal = selectedMatch.animal;
  const images = getAnimalImages(animal?.image_url);
  const displayImage = images[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1";

  // แปลงวันที่รับเลี้ยงเป็นฟอร์แมตภาษาไทย
  const formatThaiDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 flex flex-col items-center text-center relative overflow-hidden">
      {/* ถ้ามีสัตว์หลายตัว แสดงตัวสลับสัตว์เลี้ยง */}
      {adoptedPets.length > 1 && (
        <div className="w-full mb-4 pb-3 border-b border-stone-100">
          <label className="block text-xs font-prompt text-stone-400 mb-1.5 text-left">
            เลือกสัตว์เลี้ยงที่ต้องการอัปเดต:
          </label>
          <select
            value={selectedMatch.match_id}
            onChange={(e) => {
              const found = adoptedPets.find((p) => p.match_id === e.target.value);
              if (found) onSelectMatch(found);
            }}
            className="w-full text-xs font-prompt px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 focus:outline-none focus:border-primary"
          >
            {adoptedPets.map((p) => (
              <option key={p.match_id} value={p.match_id}>
                {p.animal.name || "สัตว์จรจัด"} ({p.animal.species})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* รูปภาพสัตว์เลี้ยงทรงกลม */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-[#FDF0EB] shadow-md mb-4 bg-stone-100 group">
        <img
          src={displayImage}
          alt={animal?.name || "สัตว์เลี้ยง"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* ชื่อและสายพันธุ์ */}
      <h2 className="text-2xl font-bold font-mali text-stone-800 mb-1">
        {animal?.name || "น้องไม่มีชื่อ"}
      </h2>
      <p className="text-xs sm:text-sm font-prompt text-stone-500 mb-6">
        {animal?.species || "สัตว์เลี้ยง"} {animal?.color ? `• สี${animal.color}` : ""} {animal?.gender ? `• ${animal.gender}` : ""}
      </p>

      {/* รายละเอียดสถานะและวันที่รับเลี้ยง */}
      <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-stone-100 font-prompt text-left">
        <div>
          <span className="text-[11px] text-stone-400 block mb-0.5">สถานะการดูแล:</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {selectedMatch.match_status || "กำลังดูแล"}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-stone-400 block mb-0.5">รับเลี้ยงเมื่อ:</span>
          <span className="text-xs font-semibold text-stone-700 block mt-1">
            {formatThaiDate(selectedMatch.start_date)}
          </span>
        </div>
      </div>
    </div>
  );
}
