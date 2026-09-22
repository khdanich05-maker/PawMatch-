"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Animal } from "@/types/animal";
import { getAnimalImages } from "@/lib/animalImageHelper";

export default function UrgentCasesSection() {
  const [urgentAnimals, setUrgentAnimals] = useState<Animal[]>([]);
  const [loadingAnimals, setLoadingAnimals] = useState(true);

  const getDaysInShelter = (dateString?: string) => {
    if (!dateString) return 0;
    const diffTime = Math.abs(new Date().getTime() - new Date(dateString).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    async function fetchUrgentAnimals() {
      try {
        const { data, error } = await supabase
          .from("animals")
          .select("*, shelters(shelter_name, province)")
          .eq("status", "รอคนดูแล")
          .order("created_at", { ascending: true })
          .limit(4);

        if (error) {
          console.error("Error fetching urgent animals:", error.message);
        } else if (data) {
          setUrgentAnimals(data as Animal[]);
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20">
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-semibold text-primary font-mali">ต้องการความรักด่วนที่สุด</span>
          </div>
          <h2 className="font-mali font-semibold text-2xl sm:text-3xl text-textMain">
            น้องๆ ที่รอคอยบ้านมาแสนนาน 🐾
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5 font-prompt">
            เปิดใจมอบพื้นที่เล็กๆ ให้กับเพื่อนสี่ขาที่เฝ้ารอความรักจากครอบครัวใหม่
          </p>
        </div>
        <Link
          href="/cases"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold font-mali text-primary hover:text-primaryHover transition bg-primary/10 hover:bg-primary/20 px-3.5 py-1.5 rounded-full"
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
            const days = getDaysInShelter(animal.created_at);
            const coverImg = getAnimalImages(animal.image_url)[0];

            return (
              <div
                key={animal.animal_id}
                className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition duration-300 border border-gray-100 flex flex-col group"
              >
                <div className="relative w-full aspect-[4/3] bg-bgAccent overflow-hidden flex items-center justify-center">
                  <img
                    src={coverImg}
                    alt={animal.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-medium shadow-xs flex items-center gap-1 font-prompt z-10">
                    <i className="fa-regular fa-clock text-[9px] sm:text-[10px] text-amber-400"></i>
                    รอมาแล้ว {days} วัน
                  </span>
                </div>

                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-itim text-lg sm:text-xl text-textMain truncate pr-1 group-hover:text-primary transition">
                        {animal.name}
                      </h3>
                      <span
                        className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] ${
                          animal.gender === "ตัวเมีย"
                            ? "bg-pink-50 text-pink-500"
                            : "bg-blue-50 text-blue-500"
                        }`}
                        title={animal.gender}
                      >
                        <i className={`fa-solid ${animal.gender === "ตัวเมีย" ? "fa-venus" : "fa-mars"}`}></i>
                      </span>
                    </div>

                    <p className="text-[10px] sm:text-[11px] text-gray-400 truncate mb-2.5 sm:mb-3 flex items-center gap-1 font-prompt">
                      <i className="fa-solid fa-location-dot text-primary/70 shrink-0"></i>
                      <span>
                        {animal.shelters?.shelter_name || "ศูนย์พักพิง"}
                        {animal.shelters?.province ? ` (${animal.shelters.province})` : ""}
                      </span>
                    </p>
                  </div>

                  <Link
                    href="/cases"
                    className="w-full font-mali font-semibold bg-primary hover:bg-primaryHover text-white py-1.5 rounded-xl transition duration-200 text-center block text-[11px] sm:text-xs shadow-xs"
                  >
                    ดูรายละเอียดน้อง
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

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