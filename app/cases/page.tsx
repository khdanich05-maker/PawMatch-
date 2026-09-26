"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Animal } from "@/types/animal";
import { THAI_PROVINCES } from "@/constants/provinces";
import { getAnimalImages } from "@/lib/animalImageHelper";
import AnimalDetailModal from "@/components/cases/AnimalDetailModal";

export default function CasesPage() {
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // State ตัวกรองและการดึงข้อมูล
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterSpecies, setFilterSpecies] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterAge, setFilterAge] = useState("all");
  const [filterProvince, setFilterProvince] = useState("all");
  const [filterColor, setFilterColor] = useState("all");

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user || null);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    }
    checkAuth();
  }, []);

  const fetchAnimals = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("animals")
        .select(`*, shelters (shelter_name, province, address, contact_phone)`)
        .order("created_at", { ascending: false });

      if (filterSpecies !== "all") query = query.eq("species", filterSpecies);
      if (filterGender !== "all") query = query.eq("gender", filterGender);
      if (filterAge !== "all") query = query.eq("age", filterAge);
      if (filterColor !== "all") query = query.eq("color", filterColor);

      const { data, error } = await query;
      if (!error && data) {
        let result = (data as Animal[]).filter((item) => item.status !== "ได้บ้านแล้ว");
        if (filterProvince !== "all") {
          result = result.filter((item) => item.shelters?.province === filterProvince);
        }
        setAnimals(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, [filterSpecies, filterGender, filterAge, filterProvince, filterColor]);

  const handleResetFilter = () => {
    setFilterSpecies("all");
    setFilterGender("all");
    setFilterAge("all");
    setFilterProvince("all");
    setFilterColor("all");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 sm:pt-4 pb-12 min-h-screen">
      {/* ลด mb-8 เหลือ mb-4 หรือ mb-5 */}
      <div className="mb-4 sm:mb-6">
        <h1 className="font-mali font-semibold text-2xl sm:text-3xl text-textMain">
          เพื่อนสี่ขาที่รอคอยบ้าน 🐾
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
          ค้นหาเพื่อนซี้สี่ขาที่ตรงใจคุณจากฐานข้อมูลระบบ
        </p>
      </div>

      {/* กล่อง Filter */}
      <div className="bg-white p-4 sm:px-6 sm:py-3 rounded-2xl shadow-sm border border-gray-100 mb-4 sm:mb-4">
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

        <div className={`mt-4 sm:mt-2 ${isFilterOpen ? "block" : "hidden sm:block"}`}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <label className="block text-[11px] sm:text-xs text-gray-500 mb-1 pl-1">ประเภทสัตว์</label>
              <select
                value={filterSpecies}
                onChange={(e) => setFilterSpecies(e.target.value)}
                className="w-full bg-bgMain border border-gray-200 text-textMain text-xs sm:text-xs rounded-xl p-2.5 sm:py-1.5 sm:px-2.5 font-prompt outline-none "
              >
                <option value="all">🐾 ทั้งหมด</option>
                <option value="สุนัข">🐶 สุนัข</option>
                <option value="แมว">🐱 แมว</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs text-gray-500 mb-1 pl-1">เพศ</label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full bg-bgMain border border-gray-200 text-textMain text-xs sm:text-xs rounded-xl p-2.5 sm:py-1.5 sm:px-2.5 font-prompt outline-none"
              >
                <option value="all">⚥ ทั้งหมด</option>
                <option value="ตัวผู้">♂ ตัวผู้</option>
                <option value="ตัวเมีย">♀ ตัวเมีย</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs text-gray-500 mb-1 pl-1">ช่วงอายุ</label>
              <select
                value={filterAge}
                onChange={(e) => setFilterAge(e.target.value)}
                className="w-full bg-bgMain border border-gray-200 text-textMain text-xs sm:text-xs rounded-xl p-2.5 sm:py-1.5 sm:px-2.5 font-prompt outline-none"
              >
                <option value="all">⏳ ทุกช่วงวัย</option>
                <option value="เด็ก (0-1 ปี)">เด็ก (0-1 ปี)</option>
                <option value="โตเต็มวัย (1-7 ปี)">โตเต็มวัย (1-7 ปี)</option>
                <option value="สูงอายุ (7 ปีขึ้นไป)">สูงอายุ (7 ปีขึ้นไป)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs text-gray-500 mb-1 pl-1">สีหลัก</label>
              <select
                value={filterColor}
                onChange={(e) => setFilterColor(e.target.value)}
                className="w-full bg-bgMain border border-gray-200 text-textMain text-xs sm:text-xs rounded-xl p-2.5 sm:py-1.5 sm:px-2.5 font-prompt outline-none"
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
              <label className="block text-[11px] sm:text-xs text-gray-500 mb-1 pl-1">พื้นที่ / จังหวัด</label>
              <select
                value={filterProvince}
                onChange={(e) => setFilterProvince(e.target.value)}
                className="w-full bg-bgMain border border-gray-200 text-textMain text-xs sm:text-xs rounded-xl p-2.5 sm:py-1.5 sm:px-2.5 font-prompt outline-none focus:border-primary transition"
              >
                <option value="all">📍 ทุกพื้นที่ (ทั่วประเทศ)</option>
                {THAI_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-2 mt-2">
            <button
              type="button"
              onClick={handleResetFilter}
              className="font-mali font-medium text-xs sm:text-sm text-gray-500 hover:text-textMain bg-gray-100 hover:bg-gray-200 px-4 py-1.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <i className="fa-solid fa-rotate-left text-xs"></i> ล้างค่า
            </button>
          </div>
        </div>
      </div>

      {/* Grid การ์ดสัตว์ */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 font-mali text-lg">
          <i className="fa-solid fa-spinner fa-spin text-3xl text-primary mb-3 block"></i>
          กำลังดึงข้อมูลจาก Supabase...
        </div>
      ) : animals.length === 0 ? (
        <div className="text-center py-20 text-gray-400 font-mali text-lg bg-white rounded-2xl border border-gray-100">
          <i className="fa-solid fa-box-open text-4xl mb-3 text-gray-300 block"></i>
          ไม่พบข้อมูลสัตว์ที่ตรงกับเงื่อนไข
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {animals.map((animal) => (
            <div
              key={animal.animal_id}
              className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition duration-300 border border-gray-100 flex flex-col h-full group"
            >
              <div
                onClick={() => setSelectedAnimal(animal)}
                className="relative w-full aspect-[4/3] bg-bgAccent flex items-center justify-center text-primaryHover overflow-hidden cursor-pointer"
              >
                {animal.image_url ? (
                  <img
                    src={getAnimalImages(animal.image_url)[0]}
                    alt={animal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <i className={`fa-solid ${animal.species === "แมว" ? "fa-cat" : "fa-dog"} text-4xl sm:text-5xl`}></i>
                )}

                <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-white/90 backdrop-blur-xs text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-semibold shadow-xs flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${animal.status === "รอคนดูแล" ? "bg-green-500 animate-pulse" : "bg-orange-400"
                      }`}
                  ></span>
                  <span className={animal.status === "รอคนดูแล" ? "text-green-600" : "text-orange-500"}>
                    {animal.status}
                  </span>
                </span>
              </div>

              <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                    <h3 className="font-itim text-lg sm:text-xl text-textMain truncate pr-1">
                      {animal.name || "ไม่ระบุชื่อ"}
                    </h3>
                    <span
                      className={`w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-full flex items-center justify-center text-xs ${animal.gender === "ตัวเมีย" ? "bg-pink-50 text-pink-500" : "bg-blue-50 text-blue-500"
                        }`}
                    >
                      <i className={`fa-solid ${animal.gender === "ตัวเมีย" ? "fa-venus" : "fa-mars"}`}></i>
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-[11px] sm:text-xs text-gray-500 mb-3 sm:mb-4">
                    <p className="flex items-center gap-1.5 truncate">
                      <i className="fa-solid fa-paw text-primary text-[10px] sm:text-xs shrink-0"></i>
                      <span>{animal.species}</span>
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <i className="fa-solid fa-location-dot text-primary text-[10px] sm:text-xs shrink-0"></i>
                      <span className="truncate">{animal.shelters?.shelter_name || "ศูนย์พักพิง"}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAnimal(animal)}
                  className="w-full font-mali font-semibold border border-primary text-primary hover:bg-bgAccent py-1.5 sm:py-2 rounded-xl transition duration-300 flex justify-center items-center gap-1.5 text-xs cursor-pointer"
                >
                  <i className="fa-solid fa-eye text-[11px]"></i> ดูรายละเอียด
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* เรียกใช้งาน AnimalDetailModal ตัวแยก */}
      <AnimalDetailModal
        selectedAnimal={selectedAnimal}
        currentUser={currentUser}
        onClose={() => setSelectedAnimal(null)}
        onSuccess={() => {
          setSelectedAnimal(null);
          fetchAnimals();
        }}
      />
    </main>
  );
}