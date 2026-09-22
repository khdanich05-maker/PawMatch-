"use client";

import { THAI_PROVINCES } from "@/constants/provinces";

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
}: Props) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <div
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="flex items-center justify-between font-mali font-semibold text-primary text-base sm:text-lg cursor-pointer sm:cursor-default"
      >
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-filter"></i> ตัวกรองการค้นหา
        </div>
        <button type="button" className="sm:hidden text-xs bg-bgAccent px-3 py-1.5 rounded-full text-primary">
          {isFilterOpen ? "ย่อตัวกรอง" : "เปิดตัวกรอง"}
        </button>
      </div>

      <div className={`mt-4 ${isFilterOpen ? "block" : "hidden sm:block"}`}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">ประเภทสัตว์</label>
            <select
              value={filterSpecies}
              onChange={(e) => setFilterSpecies(e.target.value)}
              className="w-full bg-bgMain border border-gray-200 text-sm rounded-xl p-2.5 outline-none"
            >
              <option value="all">🐾 ทั้งหมด</option>
              <option value="สุนัข">🐶 สุนัข</option>
              <option value="แมว">🐱 แมว</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">เพศ</label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full bg-bgMain border border-gray-200 text-sm rounded-xl p-2.5 outline-none"
            >
              <option value="all">⚥ ทั้งหมด</option>
              <option value="ตัวผู้">♂ ตัวผู้</option>
              <option value="ตัวเมีย">♀ ตัวเมีย</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">ช่วงอายุ</label>
            <select
              value={filterAge}
              onChange={(e) => setFilterAge(e.target.value)}
              className="w-full bg-bgMain border border-gray-200 text-sm rounded-xl p-2.5 outline-none"
            >
              <option value="all">⏳ ทุกช่วงวัย</option>
              <option value="เด็ก (0-1 ปี)">เด็ก (0-1 ปี)</option>
              <option value="โตเต็มวัย (1-7 ปี)">โตเต็มวัย (1-7 ปี)</option>
              <option value="สูงอายุ (7 ปีขึ้นไป)">สูงอายุ (7 ปีขึ้นไป)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">สีหลัก</label>
            <select
              value={filterColor}
              onChange={(e) => setFilterColor(e.target.value)}
              className="w-full bg-bgMain border border-gray-200 text-sm rounded-xl p-2.5 outline-none"
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
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs text-gray-500 mb-1">พื้นที่ / จังหวัด</label>
            <select
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
              className="w-full bg-bgMain border border-gray-200 text-sm rounded-xl p-2.5 outline-none"
            >
              <option value="all">📍 ทั่วประเทศ</option>
              {THAI_PROVINCES.map((prov) => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}