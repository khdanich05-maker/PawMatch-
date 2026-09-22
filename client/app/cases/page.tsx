"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Animal } from "@/types/animal";
import { THAI_PROVINCES } from "@/constants/provinces";
import AdoptionRequestModal from "@/components/adoptions/AdoptionRequestModal";

export default function CasesPage() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  const [adoptionAnimal, setAdoptionAnimal] = useState<Animal | null>(null);

  // ค่าตัวกรอง
  const [filterSpecies, setFilterSpecies] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterAge, setFilterAge] = useState("all");
  const [filterProvince, setFilterProvince] = useState("all");
  const [filterColor, setFilterColor] = useState("all");

  const fetchAnimals = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("animals")
        .select(`
          *,
          shelters (
            shelter_name,
            province,
            address,
            contact_phone
          )
        `)
        // กรองเอาเฉพาะตัวที่ยังไม่ได้บ้าน (ไม่เอา 'ได้บ้านแล้ว')
        .neq("status", "ได้บ้านแล้ว");

      if (filterSpecies !== "all") query = query.eq("species", filterSpecies);
      if (filterGender !== "all") query = query.eq("gender", filterGender);
      if (filterAge !== "all") query = query.eq("age", filterAge);
      if (filterColor !== "all") query = query.eq("color", filterColor);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching animals:", error.message);
      } else {
        let result = data as Animal[];
        if (filterProvince !== "all") {
          result = result.filter((item) => item.shelters?.province === filterProvince);
        }
        setAnimals(result || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
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

  const openModal = (animal: Animal) => {
    setSelectedAnimal(animal);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedAnimal(null);
    document.body.style.overflow = "auto";
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
      <div className="mb-8">
        <h1 className="font-mali font-semibold text-4xl mb-2 text-textMain">เพื่อนสี่ขาที่รอคอยบ้าน 🐾</h1>
        <p className="text-gray-500">ค้นหาเพื่อนซี้สี่ขาที่ตรงใจคุณจากฐานข้อมูลระบบ</p>
      </div>

      {/* กล่อง Filter 5 ช่อง */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10">
        <div className="flex items-center gap-2 font-mali font-semibold text-primary mb-4 text-lg">
          <i className="fa-solid fa-filter"></i> ตัวกรองการค้นหา
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {/* 1. สปีชีส์ */}
          <div>
            <label className="block text-xs text-gray-500 mb-1 pl-1">ประเภทสัตว์</label>
            <select
              value={filterSpecies}
              onChange={(e) => setFilterSpecies(e.target.value)}
              className="w-full bg-bgMain border border-gray-200 text-textMain text-sm rounded-xl p-3 font-prompt outline-none"
            >
              <option value="all">🐾 ทั้งหมด</option>
              <option value="สุนัข">🐶 สุนัข</option>
              <option value="แมว">🐱 แมว</option>
            </select>
          </div>

          {/* 2. เพศ */}
          <div>
            <label className="block text-xs text-gray-500 mb-1 pl-1">เพศ</label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full bg-bgMain border border-gray-200 text-textMain text-sm rounded-xl p-3 font-prompt outline-none"
            >
              <option value="all">⚥ ทั้งหมด</option>
              <option value="ตัวผู้">♂ ตัวผู้</option>
              <option value="ตัวเมีย">♀ ตัวเมีย</option>
            </select>
          </div>

          {/* 3. อายุ */}
          <div>
            <label className="block text-xs text-gray-500 mb-1 pl-1">ช่วงอายุ</label>
            <select
              value={filterAge}
              onChange={(e) => setFilterAge(e.target.value)}
              className="w-full bg-bgMain border border-gray-200 text-textMain text-sm rounded-xl p-3 font-prompt outline-none"
            >
              <option value="all">⏳ ทุกช่วงวัย</option>
              <option value="เด็ก (0-1 ปี)">เด็ก (0-1 ปี)</option>
              <option value="โตเต็มวัย (1-7 ปี)">โตเต็มวัย (1-7 ปี)</option>
              <option value="สูงอายุ (7 ปีขึ้นไป)">สูงอายุ (7 ปีขึ้นไป)</option>
            </select>
          </div>

          {/* 4. จังหวัด (77 จังหวัด) */}
          <div>
            <label className="block text-xs text-gray-500 mb-1 pl-1">พื้นที่ / จังหวัด</label>
            <select
              value={filterProvince}
              onChange={(e) => setFilterProvince(e.target.value)}
              className="w-full bg-bgMain border border-gray-200 text-textMain text-sm rounded-xl p-3 font-prompt outline-none focus:border-primary transition"
            >
              <option value="all">📍 ทุกพื้นที่ (ทั่วประเทศ)</option>
              {THAI_PROVINCES.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          {/* 5. สี */}
          <div>
            <label className="block text-xs text-gray-500 mb-1 pl-1">สีหลัก</label>
            <select
              value={filterColor}
              onChange={(e) => setFilterColor(e.target.value)}
              className="w-full bg-bgMain border border-gray-200 text-textMain text-sm rounded-xl p-3 font-prompt outline-none"
            >
              <option value="all">🎨 ทุกสี</option>
              <option value="ขาว">ขาว</option>
              <option value="น้ำตาล / ส้ม">น้ำตาล / ส้ม</option>
              <option value="สามสี / ลายสลิด">สามสี / ลายสลิด</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            onClick={handleResetFilter}
            className="font-mali font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 px-6 py-2.5 rounded-xl transition duration-200 flex items-center gap-2"
          >
            <i className="fa-solid fa-rotate-left"></i> ล้างค่า
          </button>
        </div>
      </div>

      {/* รายการแสดงผล Card สัตว์ */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {animals.map((animal) => (
            <div
              key={animal.animal_id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 border border-gray-100 flex flex-col h-full group"
            >
              <div
                onClick={() => openModal(animal)}
                className="h-56 bg-bgAccent flex items-center justify-center text-primaryHover relative overflow-hidden cursor-pointer"
              >
                {animal.image_url ? (
                  <img
                    src={animal.image_url}
                    alt={animal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <i className={`fa-solid ${animal.species === "แมว" ? "fa-cat" : "fa-dog"} text-6xl`}></i>
                )}

                {/* Badge สถานะ */}
                <span className="absolute top-3 left-3 bg-white/90 text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${animal.status === "รอคนดูแล"
                        ? "bg-green-500 animate-pulse"
                        : animal.status === "รอการอนุมัติ"
                          ? "bg-orange-400"
                          : "bg-gray-400"
                      }`}
                  ></span>
                  <span className={animal.status === "รอคนดูแล" ? "text-green-600" : "text-orange-500"}>
                    {animal.status}
                  </span>
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-itim text-2xl text-textMain">{animal.name || "ไม่ระบุชื่อ"}</h3>
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${animal.gender === "ตัวเมีย" ? "bg-pink-50 text-pink-500" : "bg-blue-50 text-blue-500"
                      }`}
                  >
                    <i className={`fa-solid ${animal.gender === "ตัวเมีย" ? "fa-venus" : "fa-mars"}`}></i>
                  </span>
                </div>

                <div className="flex flex-col gap-2 text-sm text-gray-500 mb-6 flex-1">
                  <p className="flex items-center gap-2">
                    <i className="fa-solid fa-paw w-4 text-primary"></i> {animal.species}
                  </p>
                  <p className="flex items-center gap-2">
                    <i className="fa-solid fa-location-dot w-4 text-primary"></i> {animal.shelters?.shelter_name || "ศูนย์พักพิง"}
                  </p>
                </div>

                <button
                  onClick={() => openModal(animal)}
                  className="w-full font-mali font-semibold border-2 border-primary text-primary hover:bg-bgAccent py-2.5 rounded-xl transition duration-300 flex justify-center items-center gap-2"
                >
                  <i className="fa-solid fa-eye"></i> ดูรายละเอียด
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal รายละเอียดสัตว์ */}
      {selectedAnimal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row relative shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-white/80 backdrop-blur text-gray-500 hover:text-primary hover:bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm z-20 transition"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>

            {/* รูปภาพ */}
            <div className="lg:w-1/2 bg-bgMain p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="w-full h-80 bg-bgAccent rounded-2xl flex items-center justify-center text-primaryHover shadow-inner relative overflow-hidden">
                {selectedAnimal.image_url ? (
                  <img src={selectedAnimal.image_url} alt={selectedAnimal.name} className="w-full h-full object-cover" />
                ) : (
                  <i className={`fa-solid ${selectedAnimal.species === "แมว" ? "fa-cat" : "fa-dog"} text-9xl`}></i>
                )}
              </div>
            </div>

            {/* รายละเอียด */}
            <div className="lg:w-1/2 p-8 lg:p-10 flex flex-col overflow-y-auto border-l border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                  สถานะ: {selectedAnimal.status}
                </span>
                <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-semibold">
                  สุขภาพ: {selectedAnimal.health_status}
                </span>
              </div>

              <h2 className="font-itim text-5xl text-textMain mb-4 flex items-center gap-4">
                {selectedAnimal.name}
                <i
                  className={`fa-solid ${selectedAnimal.gender === "ตัวเมีย" ? "fa-venus text-pink-400" : "fa-mars text-blue-400"
                    } text-3xl`}
                ></i>
              </h2>

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

              {/* ข้อมูลศูนย์พักพิง */}
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
                  type="button"
                  onClick={() => {
                    const animal = selectedAnimal;
                    closeModal();
                    setAdoptionAnimal(animal);
                  }}
                  className="w-full font-mali font-semibold bg-primary text-white hover:bg-primaryHover py-3 rounded-xl transition flex justify-center items-center gap-2"
                >
                  <i className="fa-solid fa-heart" aria-hidden="true"></i>
                  ทดลองกรอกคำขอรับเลี้ยง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {adoptionAnimal && (
        <AdoptionRequestModal
          animal={adoptionAnimal}
          onClose={() => setAdoptionAnimal(null)}
        />
      )}
    </main>
  );
}