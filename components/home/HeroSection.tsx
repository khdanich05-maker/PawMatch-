"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const HERO_BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?q=80&w=1600&auto=format&fit=crop",
];

export default function HeroSection() {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % HERO_BACKGROUND_IMAGES.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 mb-8 sm:mb-8 mt-0">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[600px] sm:min-h-[680px] flex items-center">
        {HERO_BACKGROUND_IMAGES.map((imgUrl, index) => (
          <img
            key={index}
            src={imgUrl}
            alt={`GoHome Hero Background ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover object-right md:object-center transition-opacity duration-1000 ease-in-out ${currentBgIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/85 via-black/50 to-transparent z-[1]"></div>

        <div className="relative z-10 p-8 sm:p-14 md:p-16 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-6 font-mali border border-white/20 shadow-sm">
            <i className="fa-solid fa-paw text-[#F39C12]"></i> GoHome - เชื่อมรัก ส่งต่อบ้านใหม่อบอุ่น
          </div>

          <h1 className="font-mali font-semibold text-4xl sm:text-5xl lg:text-6xl leading-[1.25] mb-6 text-white drop-shadow-md">
            เพราะทุกชีวิต <br />
            สมควรมี<span className="text-orange-400">บ้าน</span>
          </h1>

          <p className="text-xs sm:text-base md:text-lg mb-8 leading-relaxed text-gray-200 font-prompt drop-shadow-sm max-w-xl [text-wrap:balance]">
            พื้นที่ส่งต่อความรักและการช่วยเหลือ ร่วมเป็นส่วนหนึ่งในการมอบโอกาส <br className="hidden sm:inline" />
            และบ้านหลังใหม่ที่ปลอดภัยให้กับสัตว์ไร้บ้าน
          </p>



          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/report"
              className="font-mali font-semibold bg-primary hover:bg-primaryHover text-white px-7 py-3.5 rounded-2xl transition duration-300 shadow-lg text-center flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
            >
              <i className="fa-solid fa-wand-magic-sparkles"></i> แจ้งพบสัตว์จรจัด
            </Link>
            <Link
              href="/cases"
              className="font-mali font-semibold bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/40 px-7 py-3.5 rounded-2xl transition duration-300 text-center flex items-center justify-center gap-2"
            >
              ตามหาสัตว์เลี้ยง <i className="fa-solid fa-arrow-right text-xs"></i>
            </Link>
          </div>

          <div className="flex gap-2 mt-8">
            {HERO_BACKGROUND_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBgIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${currentBgIndex === idx ? "w-8 bg-orange-400" : "w-2 bg-white/40"
                  }`}
                aria-label={`ไปยังรูปที่ ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}