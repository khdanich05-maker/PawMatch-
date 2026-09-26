// components/care-tracking/PetAdoptedCard.tsx
"use client";

import React from "react";
import { AdoptedPetMatch } from "@/types/careLog";
import { getAnimalImages } from "@/lib/animalImageHelper";
import { formatThaiDateBE } from "@/lib/dateHelper";

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

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-100 flex flex-col items-center text-center relative overflow-hidden">
      {/* ถ้ามีสัตว์หลายตัว แสดงตัวสลับสัตว์เลี้ยง */}
      {adoptedPets.length > 1 && (
        <div className="w-full mb-4 pb-3 border-b border-stone-100">
          <label className="block text-xs font-semibold text-stone-600 mb-1.5 text-left flex items-center justify-between">
            <span>เลือกสัตว์เลี้ยงที่ต้องการอัปเดต:</span>
            <span className="text-[11px] font-normal text-stone-400">
              ({adoptedPets.length} ตัว)
            </span>
          </label>
          <div className="relative">
            <select
              value={selectedMatch.match_id}
              onChange={(e) => {
                const found = adoptedPets.find((p) => p.match_id === e.target.value);
                if (found) onSelectMatch(found);
              }}
              className="w-full min-h-[48px] h-12 text-sm font-prompt px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-700 focus:outline-none focus:border-[#E29578] focus:bg-white shadow-2xs transition appearance-none cursor-pointer"
            >
              {adoptedPets.map((p) => (
                <option key={p.match_id} value={p.match_id}>
                  🐾 {p.animal.name || "สัตว์จรจัด"} ({p.animal.species})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-stone-400">
              <i className="fa-solid fa-chevron-down text-xs"></i>
            </div>
          </div>
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
      <h2 className="text-xl sm:text-2xl font-bold font-mali text-stone-800 mb-1">
        {animal?.name || "น้องไม่มีชื่อ"}
      </h2>
      <p className="text-xs sm:text-sm font-prompt text-stone-500 mb-5">
        {animal?.species || "สัตว์เลี้ยง"} {animal?.color ? `• สี${animal.color}` : ""} {animal?.gender ? `• ${animal.gender}` : ""}
      </p>

      {/* รายละเอียดสถานะและวันที่รับเลี้ยง */}
      <div className="w-full grid grid-cols-2 gap-3 pt-4 border-t border-stone-100 font-prompt text-left">
        <div>
          <span className="text-[11px] text-stone-400 block mb-1">สถานะการดูแล:</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {selectedMatch.match_status || "กำลังดูแล"}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-stone-400 block mb-1">รับเลี้ยงเมื่อ (พ.ศ.):</span>
          <span className="text-xs font-semibold text-stone-700 block mt-0.5">
            {formatThaiDateBE(selectedMatch.start_date)}
          </span>
        </div>
      </div>
    </div>
  );
}
