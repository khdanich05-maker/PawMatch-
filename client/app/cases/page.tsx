"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Animal } from "@/types/animal";
import { THAI_PROVINCES } from "@/constants/provinces";
import AdoptionRequestModal from "@/components/adoptions/AdoptionRequestModal";

export default function CasesPage() {

  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [adoptionAnimal, setAdoptionAnimal] = useState<Animal | null>(null);
  // ย้ายมาวางไว้ตรงนี้
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // ค่าตัวกรอง
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterSpecies, setFilterSpecies] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterAge, setFilterAge] = useState("all");
  const [filterProvince, setFilterProvince] = useState("all");
  const [filterColor, setFilterColor] = useState("all");
  // วางฟังก์ชันนี้ไว้ภายใน CasesPage ก่อนคำสั่ง return (...)
  const getAnimalImages = (imageUrl: any): string[] => {
    if (!imageUrl) return ["https://images.unsplash.com/photo-1543466835-00a7907e9de1"];

    // กรณีเป็น Array อยู่แล้ว
    if (Array.isArray(imageUrl)) {
      return imageUrl.filter((url) => typeof url === "string" && url.trim() !== "");
    }

    // กรณีเป็น String ก้อนเดียว หรือ String คั่นด้วยจุลภาค/ปีกกาจาก Postgres
    if (typeof imageUrl === "string") {
      try {
        if (imageUrl.startsWith("[") && imageUrl.endsWith("]")) {
          const parsed = JSON.parse(imageUrl);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) { }

      const cleanStr = imageUrl.replace(/^\{|\}$/g, "").replace(/["']/g, "");
      const list = cleanStr.split(",").map((url) => url.trim()).filter(Boolean);
      return list.length > 0 ? list : ["https://images.unsplash.com/photo-1543466835-00a7907e9de1"];
    }

    return ["https://images.unsplash.com/photo-1543466835-00a7907e9de1"];
  };

  const fetchAnimals = async () => {
    setLoading(true);
    try {
      // 1. ดึงข้อมูลสัตว์พร้อมข้อมูลศูนย์พักพิงที่เชื่อมโยงอยู่
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
        .order("created_at", { ascending: false });

      // 2. กรองข้อมูลตาม Dropdown เฉพาะตัวที่ไม่ใช่ 'all'
      if (filterSpecies !== "all") query = query.eq("species", filterSpecies);
      if (filterGender !== "all") query = query.eq("gender", filterGender);
      if (filterAge !== "all") query = query.eq("age", filterAge);
      if (filterColor !== "all") query = query.eq("color", filterColor);

      const { data, error } = await query;

      if (error) {
        console.error("Supabase Error:", error.message);
        setAnimals([]);
      } else {
        let result = (data as Animal[]) || [];

        // คัดกรองตัวที่ได้บ้านแล้วออก (ถ้าเป็นหน้าค้นหาหาบ้านสำหรับผู้ใช้ทั่วไป)
        result = result.filter((item) => item.status !== "ได้บ้านแล้ว");

        // กรองจังหวัดฝั่ง Client ป้องกันปัญหา Join ข้ามตารางหลุด[cite: 8]
        if (filterProvince !== "all") {
          result = result.filter((item) => item.shelters?.province === filterProvince);
        }

        setAnimals(result);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setAnimals([]);
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
    setCurrentImageIndex(0); // 👈 เพิ่มบรรทัดนี้เพื่อเริ่มที่รูปแรกเสมอ
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedAnimal(null);
    document.body.style.overflow = "auto";
  };

  const getDaysInShelter = (dateString?: string) => {
    if (!dateString) return 0;
    const diffTime = Math.abs(new Date().getTime() - new Date(dateString).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 min-h-screen">
      {/* หัวข้อหน้า (ปรับ font-size ให้พอดีบนมือถือ) */}
      <div className="mb-6 sm:mb-8">
        <h1 className="font-mali font-semibold text-2xl sm:text-4xl mb-1 sm:mb-2 text-textMain">
          เพื่อนสี่ขาที่รอคอยบ้าน 🐾
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">ค้นหาเพื่อนซี้สี่ขาที่ตรงใจคุณจากฐานข้อมูลระบบ</p>
      </div>

      {/* กล่อง Filter */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 sm:mb-10">
        {/* ส่วนหัวตัวกรอง: ทำหน้าที่เป็นปุ่มกด ย่อ/ขยาย บนมือถือ */}
        <div
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center justify-between font-mali font-semibold text-primary text-base sm:text-lg cursor-pointer sm:cursor-default select-none"
        >
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-filter"></i> ตัวกรองการค้นหา
          </div>

          {/* ปุ่มกดสลับสถานะ (แสดงเฉพาะจอมือถือ ซ่อนบนจอ sm ขึ้นไป) */}
          <button
            type="button"
            className="sm:hidden text-xs bg-bgAccent px-3 py-1.5 rounded-full text-primary flex items-center gap-1.5 transition"
          >
            {isFilterOpen ? "ย่อตัวกรอง" : "เปิดตัวกรอง"}
            <i className={`fa-solid fa-chevron-${isFilterOpen ? "up" : "down"} text-[10px]`}></i>
          </button>
        </div>

        {/* บล็อกตัวกรอง: พับซ่อนบนมือถือถ้า isFilterOpen = false แต่แสดงเสมอเมื่อจอคอม (sm:block) */}
        <div className={`mt-4 ${isFilterOpen ? "block" : "hidden sm:block"}`}>
          {/* จัด 2 คอลัมน์บนมือถือเพื่อประหยัดพื้นที่แนวตั้ง ไม่กินหน้าจอ */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
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

            {/* 3. อายุ */}
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

            {/* 4. สี */}
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

            {/* 5. จังหวัด (ให้กว้าง 2 ช่องเต็มบรรทัดบนมือถือ เพื่ออ่านชื่อจังหวัดได้ชัดเจน) */}
            <div className="col-span-2 sm:col-span-1">
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
          </div>

          {/* ปุ่มล้างค่า */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={handleResetFilter}
              className="font-mali font-semibold text-xs sm:text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl transition duration-200 flex items-center gap-2"
            >
              <i className="fa-solid fa-rotate-left"></i> ล้างค่า
            </button>
          </div>
        </div>
      </div>

      {/* ถัดจากนี้เป็นการ์ด Grid แสดงสัตว์ตามปกติ */}



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


        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {animals.map((animal) => (
            <div
              key={animal.animal_id}
              className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition duration-300 border border-gray-100 flex flex-col h-full group"
            >
              {/* 1. ล็อกอัตราส่วนรูปเป็น 4:3 ไม่ให้สูงเรียวยาว */}
              <div
                onClick={() => openModal(animal)}
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

                {/* ป้ายสถานะ (ย่อขนาดบนมือถือ) */}
                <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-white/90 backdrop-blur-xs text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-semibold shadow-xs flex items-center gap-1">
                  <span
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${animal.status === "รอคนดูแล"
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

              {/* 2. ลด Padding และช่องว่างด้านล่างเพื่อไม่ให้การ์ดยืด */}
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

                {/* 3. ปรับขนาดปุ่มกดให้กะทัดรัดลง */}
                <button
                  type="button"
                  onClick={() => openModal(animal)}
                  className="w-full font-mali font-semibold border border-primary text-primary hover:bg-bgAccent py-1.5 sm:py-2 rounded-xl transition duration-300 flex justify-center items-center gap-1.5 text-xs"
                >
                  <i className="fa-solid fa-eye text-[11px]"></i> ดูรายละเอียด
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
            {/* ฝั่งซ้าย: ปรับให้ flex-1 เพื่อให้รูปหลักขยายตัวเต็มพื้นที่ ไม่เหลือช่องว่าง */}
            <div className="lg:w-1/2 bg-gray-50/50 p-6 flex flex-col justify-start gap-4 border-b lg:border-b-0 lg:border-r border-gray-100">
              {(() => {
                // ✅ แก้จุดนี้: เรียกใช้ getAnimalImages เพื่อแยกและล้างค่า { } จาก Supabase
                const images = getAnimalImages(selectedAnimal.image_url);

                return (
                  <>
                    {/* 1. รูปภาพหลัก: ใส่ flex-1 และ min-h-[320px] เพื่อยืดเต็มความสูงฝั่งซ้าย */}
                    <div className="relative w-full flex-1 min-h-[320px] max-h-[440px] bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center group">
                      <img
                        src={images[currentImageIndex] || images[0]}
                        alt={selectedAnimal.name}
                        className="w-full h-full object-cover select-none transition-all duration-300"
                      />

                      {/* ปุ่มเลื่อน ซ้าย - ขวา */}
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

                    {/* 2. แถบรูปย่อยด้านล่าง (Thumbnails) ติดอยู่ใต้รูปหลักพอดี */}
                    {images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2 shrink-0">
                        {images.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer ${currentImageIndex === idx
                              ? "border-primary scale-95 shadow-sm"
                              : "border-transparent opacity-60 hover:opacity-100"
                              }`}
                          >
                            <img src={imgUrl} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* รายละเอียด */}
            <div className="lg:w-1/2 p-8 lg:p-10 flex flex-col overflow-y-auto border-l border-gray-100">
              {/* แถบสถานะ + ระยะเวลาที่รอคอยบ้าน */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                  สถานะ: {selectedAnimal.status}
                </span>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${selectedAnimal.health_status === "ปกติ"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-orange-100 text-orange-700"
                    }`}
                >
                  สุขภาพ: {selectedAnimal.health_status}
                </span>
                {/* 1. ระยะเวลาที่รอคอยบ้าน */}
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                  <i className="fa-regular fa-clock text-amber-600"></i> รอคอยบ้านมาแล้ว {getDaysInShelter(selectedAnimal.created_at)} วัน
                </span>
              </div>

              <h2 className="font-itim text-5xl text-textMain mb-4 flex items-center gap-4">
                {selectedAnimal.name}
                <i
                  className={`fa-solid ${selectedAnimal.gender === "ตัวเมีย" ? "fa-venus text-pink-400" : "fa-mars text-blue-400"
                    } text-3xl`}
                ></i>
              </h2>

              {/* 2. รายละเอียดอาการสุขภาพ (โทนสีส้มอ่อน/อำพัน ไม่ดูตื่นตระหนก) */}
              {selectedAnimal.health_status !== "ปกติ" && selectedAnimal.health_description && (
                <div className="mb-4 p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                  <i className="fa-solid fa-notes-medical mt-0.5 text-base text-amber-600 shrink-0"></i>
                  <div className="leading-relaxed">
                    <span className="font-semibold text-amber-800">ข้อมูลสุขภาพ/กายภาพเพิ่มเติม: </span>
                    {selectedAnimal.health_description}
                  </div>
                </div>
              )}

              {/* 3. คำบรรยายลักษณะนิสัย / เรื่องราวความเป็นมา */}
              <div className="mb-5 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-400 font-semibold mb-1 flex items-center gap-1.5">
                  <i className="fa-solid fa-quote-left text-primary"></i> เรื่องราวและลักษณะนิสัย
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedAnimal.description || "น้องเป็นมิตร ร่าเริง สุขภาพพร้อมย้ายเข้าบ้านใหม่และต้องการความรักจากครอบครัวที่อบอุ่น"}
                </p>
              </div>

              {/* สเปกทางกายภาพเดิม */}
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