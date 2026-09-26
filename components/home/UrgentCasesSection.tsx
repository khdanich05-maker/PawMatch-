"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Animal } from "@/types/animal";
import { getAnimalImages } from "@/lib/animalImageHelper";

export default function UrgentCasesSection() {
  const [urgentAnimals, setUrgentAnimals] = useState<Animal[]>([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true);

  useEffect(() => {
    async function fetchUrgentAnimals() {
      try {
        const { data, error } = await supabase
          .from("animals")
          .select("*, shelters(shelter_name, province)")
          .eq("status", "รอคนดูแล")
          .limit(20);

        if (error) {
          console.error("Error fetching urgent animals:", error.message);
        } else if (data && data.length > 0) {
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          setUrgentAnimals(shuffled.slice(0, 4) as Animal[]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAnimals(false);
      }
    }

    fetchUrgentAnimals();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-9">
      {/* Header ของ Section */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-semibold text-primary font-mali">มอบโอกาสครั้งใหม่</span>
          </div>
          <h2 className="font-mali font-semibold text-xl sm:text-3xl text-textMain leading-[1.4]">
            เปลี่ยนชีวิตน้องๆ ด้วยบ้านที่อบอุ่น 🐾
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 font-prompt leading-relaxed">
            เปิดใจมอบพื้นที่เล็กๆ ให้กับเพื่อนสี่ขาที่พร้อมมอบความรักและความซื่อสัตย์ให้คุณ
          </p>
        </div>
        <Link
          href="/cases"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold font-mali text-primary hover:text-primaryHover transition bg-primary/10 hover:bg-primary/20 px-3.5 py-1.5 rounded-full shrink-0"
        >
          ดูทั้งหมด <i className="fa-solid fa-arrow-right text-[10px]"></i>
        </Link>
      </div>

      {loadingAnimals ? (
        <div className="text-center py-16 text-gray-400 font-mali text-sm">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-primary mb-2 block"></i>
          กำลังค้นหาเคสน้องๆ...
        </div>
      ) : urgentAnimals.length === 0 ? (
        <div className="text-center py-14 text-gray-400 font-mali text-sm bg-white rounded-2xl border border-gray-100 shadow-xs">
          ขณะนี้ยังไม่มีเคสที่รอคอยบ้านในระบบ
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {urgentAnimals.map((animal) => {
            const coverImg = getAnimalImages(animal.image_url)[0];

            return (
              <div
                key={animal.animal_id}
                className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition duration-300 border border-gray-100 flex flex-col h-full group"
              >
                {/* รูปภาพการ์ด */}
                <div className="relative w-full aspect-[4/3] bg-bgAccent overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={coverImg}
                    alt={animal.name || "สัตว์จรจัด"}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
                  />
                </div>

                {/* รายละเอียดการ์ด: แยกสัดส่วนด้วย flex flex-col justify-between */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                  <div className="w-full min-w-0">
                    {/* แถบชื่อ + สัญลักษณ์เพศ */}
                    <div className="flex justify-between items-center gap-2 mb-1.5">
                      <h3 className="font-itim text-lg sm:text-xl text-textMain truncate leading-tight group-hover:text-primary transition">
                        {animal.name || "ไม่ระบุชื่อ"}
                      </h3>
                      <span
                        className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs ${
                          animal.gender === "ตัวเมีย"
                            ? "bg-pink-50 text-pink-500"
                            : "bg-blue-50 text-blue-500"
                        }`}
                        title={animal.gender || "ไม่ระบุเพศ"}
                      >
                        <i className={`fa-solid ${animal.gender === "ตัวเมีย" ? "fa-venus text"  : "fa-mars"}`}></i>
                      </span>
                    </div>

                    {/* ที่อยู่ / ศูนย์พักพิง: ตัดคำด้วย truncate ป้องกันตัวอักษรตกบรรทัดมาชนปุ่ม */}
                    <div className="text-xs text-gray-400 flex items-center gap-1.5 font-prompt min-w-0 mb-3">
                      <i className="fa-solid fa-location-dot text-primary/70 shrink-0 text-xs"></i>
                      <p className="truncate leading-normal">
                        {animal.shelters?.shelter_name || "ศูนย์พักพิง"}
                        {animal.shelters?.province ? ` (${animal.shelters.province})` : ""}
                      </p>
                    </div>
                  </div>

                  {/* ปุ่มกดดูรายละเอียด: ตรึงติดขอบล่างเสมอด้วย mt-auto */}
                  <div className="pt-1 mt-auto">
                    <Link
                      href="/cases"
                      className="w-full font-mali font-semibold bg-primary hover:bg-primaryHover text-white py-2 rounded-xl transition duration-200 text-center block text-xs shadow-xs"
                    >
                      ดูรายละเอียดน้อง
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ปุ่มดูทั้งหมดสำหรับจอมือถือ */}
      <div className="mt-6 text-center sm:hidden">
        <Link
          href="/cases"
          className="font-mali font-semibold text-primary hover:text-primaryHover transition inline-flex items-center gap-1 text-xs"
        >
          ดูทั้งหมด <i className="fa-solid fa-arrow-right text-[10px]"></i>
        </Link>
      </div>
    </section>
  );
}