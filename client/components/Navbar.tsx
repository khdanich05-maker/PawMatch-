"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. ดึงข้อมูล User จาก Session ปัจจุบัน
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  // 2. ปิด Dropdown เมื่อคลิกนอกพื้นที่
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. ฟังก์ชัน Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setIsDropdownOpen(false);
      setIsMenuOpen(false);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // ล็อกการเลื่อนหน้าจอเวลาเปิดเมนูมือถือ
  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [isMenuOpen]);

  return (
    <>
      <nav className="w-full px-6 py-4 flex justify-between items-center bg-transparent relative z-20">
        <Link href="/" className="flex items-center gap-2 font-mali font-semibold text-2xl text-stone-800 hover:text-[#C07055] transition">
          <i className="fa-solid fa-paw text-[#C07055]"></i> GoHome
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex gap-8 items-center text-[15px] font-prompt text-stone-600">
          <Link href="/" className="hover:text-[#C07055] transition duration-200">หน้าหลัก</Link>
          <Link href="/cases" className="hover:text-[#C07055] transition duration-200">เคสที่ต้องการความช่วยเหลือ</Link>
          <Link href="/report" className="hover:text-[#C07055] transition duration-200">แจ้งพบเจอสัตว์</Link>
          <Link href="/about" className="hover:text-[#C07055] transition duration-200">เกี่ยวกับเรา</Link>
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex gap-4 items-center font-prompt">
          {user ? (
            // แสดงโปรไฟล์ผู้ใช้เมื่อล็อกอินแล้ว
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-3 pr-2 rounded-full border border-stone-200 hover:border-[#E29578] bg-white shadow-sm transition"
              >
                <div className="w-8 h-8 rounded-full bg-[#FDF0EB] text-[#C07055] flex items-center justify-center font-bold text-sm border border-[#E29578]/30">
                  {user.name ? user.name.slice(0, 1).toUpperCase() : "🐾"}
                </div>
                <span className="text-xs font-semibold text-stone-700 max-w-[120px] truncate">
                  {user.name || "ผู้ใช้งาน"}
                </span>
                <span className="text-[10px] text-stone-400">▼</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 text-xs text-stone-700">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="font-semibold text-stone-800 truncate">{user.name}</p>
                    <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    href={user.role === "admin" || user.role === "shelter" ? "/admin/dashboard" : "/dashboard"}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-[#FDF0EB]/50 transition"
                  >
                    <span>📊</span> แดชบอร์ดติดตามสถานะ
                  </Link>
                  <div className="border-t border-stone-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 hover:bg-red-50 text-red-500 font-medium transition"
                  >
                    <span>🚪</span> ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          ) : (
            // แสดงปุ่ม Guest เมื่อยังไม่ล็อกอิน
            <>
              <Link href="/login" className="font-mali font-semibold hover:text-[#C07055] transition duration-200 text-stone-700">
                เข้าสู่ระบบ
              </Link>
              <Link href="/register" className="font-mali font-semibold bg-[#E29578] hover:bg-[#C07055] text-white px-6 py-2 rounded-full transition duration-300 shadow-sm">
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-2xl text-stone-700 hover:text-[#C07055] transition">
          <i className="fa-solid fa-bars"></i>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${isMenuOpen ? "opacity-100 block" : "opacity-0 hidden"}`}
        onClick={() => setIsMenuOpen(false)}
      ></div>

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 right-0 w-72 h-full bg-white z-50 transform transition-transform duration-300 shadow-2xl flex flex-col ${isMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 flex justify-between items-center border-b border-stone-100">
          <span className="font-mali font-bold text-stone-800">เมนู</span>
          <button onClick={() => setIsMenuOpen(false)} className="text-xl text-stone-500 hover:text-[#C07055] transition">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-5 px-6 pt-6 text-[15px] font-prompt text-stone-700">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="hover:text-[#C07055] transition flex items-center gap-3">
            <i className="fa-solid fa-house w-5 text-stone-400"></i> หน้าหลัก
          </Link>
          <Link href="/cases" onClick={() => setIsMenuOpen(false)} className="hover:text-[#C07055] transition flex items-center gap-3">
            <i className="fa-solid fa-hand-holding-heart w-5 text-stone-400"></i> เคสที่ต้องการช่วยเหลือ
          </Link>
          <Link href="/report" onClick={() => setIsMenuOpen(false)} className="hover:text-[#C07055] transition flex items-center gap-3">
            <i className="fa-solid fa-map-location-dot w-5 text-stone-400"></i> แจ้งพบเจอสัตว์
          </Link>
          <Link href="/about" onClick={() => setIsMenuOpen(false)} className="hover:text-[#C07055] transition flex items-center gap-3">
            <i className="fa-solid fa-circle-info w-5 text-stone-400"></i> เกี่ยวกับเรา
          </Link>
        </div>

        {/* Mobile Bottom Section */}
        <div className="mt-auto p-6 border-t border-stone-100 font-prompt">
          {user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-[#FDF0EB] text-[#C07055] flex items-center justify-center font-bold text-sm border border-[#E29578]/30">
                  {user.name ? user.name.slice(0, 1).toUpperCase() : "🐾"}
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-xs text-stone-800 truncate">{user.name}</p>
                  <p className="text-[10px] text-stone-400 truncate">{user.email}</p>
                </div>
              </div>
              <Link
                href={user.role === "admin" || user.role === "shelter" ? "/admin/dashboard" : "/dashboard"}
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
              >
                ไปที่แดชบอร์ด
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-center py-2.5 rounded-xl bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="font-mali font-semibold text-center border-2 border-[#E29578] text-[#C07055] py-2.5 rounded-full hover:bg-[#FDF0EB] transition text-sm">
                เข้าสู่ระบบ
              </Link>
              <Link href="/register" onClick={() => setIsMenuOpen(false)} className="font-mali font-semibold text-center bg-[#E29578] hover:bg-[#C07055] text-white py-2.5 rounded-full transition shadow-sm text-sm">
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}