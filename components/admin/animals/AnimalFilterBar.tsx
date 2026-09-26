"use client";

import { THAI_PROVINCES } from "@/constants/provinces";
import { ShelterOption } from "@/types/shelter";

interface Props {
  isFilterOpen: boolean;
  setIsFilterOpen: (v: boolean) => void;
  filterSpecies: string;
  setFilterSpecies: (v: string) => void;
  filterGender: string;
  setFilterGender: (v: string) => void;
  filterAge: string;
  setFilterAge: (v: string) => void;
  filterColor: string;
  setFilterColor: (v: string) => void;
  filterProvince: string;
  setFilterProvince: (v: string) => void;
  shelters: ShelterOption[];
  filterShelter: string;
  setFilterShelter: (v: string) => void;
  onResetFilter?: () => void;
}

export default function AnimalFilterBar({
  isFilterOpen,
  setIsFilterOpen,
  filterSpecies,
  setFilterSpecies,
  filterGender,
  setFilterGender,
  filterAge,
  setFilterAge,
  filterColor,
  setFilterColor,
  filterProvince,
  setFilterProvince,
  shelters,
  filterShelter,
  setFilterShelter,
  onResetFilter,
}: Props) {
  return (
    <div className="bg-white px-4 pt-3 pb-2 sm:px-6 sm:pt-3 sm:pb-3 rounded-2xl shadow-sm border border-gray-100 mb-4 sm:mb-5">      {/* ส่วนหัวตัวกรอง */}
      <div
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="flex items-center justify-between font-mali font-semibold text-primary text-base sm:text-lg cursor-pointer sm:cursor-default select-none"
      >
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-filter"></i> ตัวกรองการค้นหา
        </div>
        <button
          type="button"
          className="sm:hidden text-xs bg-bgAccent px-3 py-1.5 rounded-full text-primary flex items-center gap-1.5 transition"
        >
          {isFilterOpen ? "ย่อตัวกรอง" : "เปิดตัวกรอง"}
          <i className={`fa-solid fa-chevron-${isFilterOpen ? "up" : "down"} text-[10px]`}></i>
        </button>
      </div>

      {/* บล็อกตัวกรอง */}
      <div className={`mt-4 ${isFilterOpen ? "block" : "hidden sm:block"}`}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-1.5 sm:mb-2">
          {/* 1. สปีชีส์ */}
          <div>
            <label className="block text-[11px] sm:text-xs text-gray-500 mb-1 pl-1">ประเภทสัตว์</label>
            <select
              value={filterSpecies}
              onChange={(e) => setFilterSpecies(e.target.value)}
              className="w-full bg-bgMain border border-gray-200 text-textMain text-xs sm:text-sm rounded-xl p-2.5 sm:p-3 font-prompt outline-none"
            >
              <option value="all">🐾 ทั้งหมด</option>
              <option value="สุนัข">🐶 สุนัข</option>
              <option value="แมว">🐱 แมว</option>
            </select>
          </div>

          {/* 2. เพศ */}
          <div>
            <label className="block text-[11px] sm:text-xs text-gray-500 mb-1 pl-1">เพศ</label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full bg-bgMain border border-gray-200 text-textMain text-xs sm:text-sm rounded-xl p-2.5 sm:p-3 font-prompt outline-none"
            >
              <option value="all">⚥ ทั้งหมด</option>
              <option value="ตัวผู้">♂ ตัวผู้</option>
              <option value="ตัวเมีย">♀ ตัวเมีย</option>
            </select>
          </div>

          {/* 3. ช่วงอายุ */}
          <div>
            <label className="block text-[11px] sm:text-xs text-gray-500 mb-1 pl-1">ช่วงอายุ</label>
            <select
              value={filterAge}
              onChange={(e) => setFilterAge(e.target.value)}
              className="w-full bg-bgMain border border-gray-200 text-textMain text-xs sm:text-sm rounded-xl p-2.5 sm:p-3 font-prompt outline-none"
            >
              <option value="all">⏳ ทุกช่วงวัย</option>
              <option value="เด็ก (0-1 ปี)">เด็ก (0-1 ปี)</option>
              <option value="โตเต็มวัย (1-7 ปี)">โตเต็มวัย (1-7 ปี)</option>
              <option value="สูงอายุ (7 ปีขึ้นไป)">สูงอายุ (7 ปีขึ้นไป)</option>
            </select>
          </div>

          {/* 4. สีหลัก */}
          <div>
            <label className="block text-[11px] sm:text-xs text-gray-500 mb-1 pl-1">สีหลัก</label>
            <select
              value={filterColor}
              onChange={(e) => setFilterColor(e.target.value)}
              className="w-full bg-bgMain border border-gray-200 text-textMain text-xs sm:text-sm rounded-xl p-2.5 sm:p-3 font-prompt outline-none"
            >
              <option value="all">🎨 ทุกสี</option>
              <option value="ขาว">ขาว</option>
              <option value="ดำ">ดำ</option>
              <option value="น้ำตาล">น้ำตาล</option>
              <option value="ส้ม">ส้ม</option>
              <option value="เทา">เทา</option>
              <option value="ครีม">ครีม</option>
            </select>
          </div>

          {/* 5. พื้นที่ / จังหวัด */}
          <div>
            <label className="block text-[11px] sm:text-xs text-gray-500 mb-1 pl-1">พื้นที่ / จังหวัด</label>
            <select
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
              className="w-full bg-bgMain border border-gray-200 text-textMain text-xs sm:text-sm rounded-xl p-2.5 sm:p-3 font-prompt outline-none focus:border-primary transition"
            >
              <option value="all">📍 ทุกพื้นที่ (ทั่วประเทศ)</option>
              {THAI_PROVINCES.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          {/* 6. ศูนย์พักพิง (เพิ่มใหม่) */}
          <div>
            <label className="block text-[11px] sm:text-xs text-gray-500 mb-1 pl-1">ศูนย์พักพิง</label>
            <select
              value={filterShelter}
              onChange={(e) => setFilterShelter(e.target.value)}
              className="w-full bg-bgMain border border-gray-200 text-textMain text-xs sm:text-sm rounded-xl p-2.5 sm:p-3 font-prompt outline-none focus:border-primary transition"
            >
              <option value="all">🏠 ทุกศูนย์พักพิง</option>
              {shelters.map((shelter) => (
                <option key={shelter.shelter_id} value={shelter.shelter_id}>
                  {shelter.shelter_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ปุ่มล้างค่า */}
        {onResetFilter && (
          <div className="flex justify-end border-t border-gray-100 pt-1 mt-1">
            <button
              type="button"
              onClick={onResetFilter}
              className="font-mali font-medium text-xs sm:text-sm text-gray-500 hover:text-textMain bg-gray-100 hover:bg-gray-200 px-4 py-1.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <i className="fa-solid fa-rotate-left text-xs"></i> ล้างค่า
            </button>
          </div>
        )}
      </div>
    </div>
  );
}