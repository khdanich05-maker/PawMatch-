"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ล็อกการเลื่อนหน้าจอเวลาเปิดเมนูมือถือ
  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [isMenuOpen]);

  return (
    <>
      <nav className="w-full px-6 py-4 flex justify-between items-center bg-transparent relative z-20">
        <Link href="/" className="flex items-center gap-2 font-mali font-semibold text-2xl text-textMain hover:text-primary transition">
          <i className="fa-solid fa-paw text-primary"></i> PawMatch
        </Link>

        <div className="hidden md:flex gap-8 items-center text-[15px]">
          <Link href="/" className="hover:text-primary transition duration-200">หน้าหลัก</Link>
          <Link href="/cases" className="hover:text-primary transition duration-200">เคสที่ต้องการความช่วยเหลือ</Link>
          <Link href="/report" className="hover:text-primary transition duration-200">แจ้งพบเจอสัตว์</Link>
          <Link href="/about" className="hover:text-primary transition duration-200">เกี่ยวกับเรา</Link>
        </div>

        <div className="hidden md:flex gap-4 items-center">
          <Link href="/login" className="font-mali font-semibold hover:text-primary transition duration-200">เข้าสู่ระบบ</Link>
          <Link href="/register" className="font-mali font-semibold bg-primary hover:bg-primaryHover text-white px-6 py-2 rounded-full transition duration-300 shadow-sm">
            สมัครสมาชิก
          </Link>
        </div>

        <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-2xl text-textMain hover:text-primary transition">
          <i className="fa-solid fa-bars"></i>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isMenuOpen ? "opacity-100 block" : "opacity-0 hidden"}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 right-0 w-72 h-full bg-bgMain z-50 transform transition-transform duration-300 shadow-2xl flex flex-col ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 flex justify-end border-b border-gray-200">
          <button onClick={() => setIsMenuOpen(false)} className="text-2xl text-textMain hover:text-primary transition">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="flex flex-col gap-6 px-8 pt-8 text-[16px] font-prompt text-textMain">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition flex items-center gap-3"><i className="fa-solid fa-house w-5"></i> หน้าหลัก</Link>
          <Link href="/about" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition flex items-center gap-3"><i className="fa-solid fa-circle-info w-5"></i> เกี่ยวกับเรา</Link>
          <Link href="/cases" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition flex items-center gap-3"><i className="fa-solid fa-hand-holding-heart w-5"></i> เคสที่ต้องการช่วยเหลือ</Link>
          <Link href="/report" onClick={() => setIsMenuOpen(false)} className="hover:text-primary transition flex items-center gap-3"><i className="fa-solid fa-map-location-dot w-5"></i> แจ้งพบเจอสัตว์</Link>
        </div>
        <div className="mt-auto p-8 flex flex-col gap-4">
          <Link href="/login" onClick={() => setIsMenuOpen(false)} className="font-mali font-semibold text-center border-2 border-primary text-primary py-3 rounded-full hover:bg-bgAccent transition">เข้าสู่ระบบ</Link>
          <Link href="/register" onClick={() => setIsMenuOpen(false)} className="font-mali font-semibold text-center bg-primary hover:bg-primaryHover text-white py-3 rounded-full transition shadow-sm">สมัครสมาชิก</Link>
        </div>
      </div>
    </>
  );
}