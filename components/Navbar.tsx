"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  name?: string;
  username?: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);

  // 1. ตรวจสอบ Session ทุกครั้งที่เปลี่ยนหน้า
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };
    checkAuth();
  }, [pathname]);

  // 2. ปิด Drawer และออกจากระบบ
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setIsLeftDrawerOpen(false);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // ล็อกการเลื่อนหน้าจอเวลา Drawer เปิด
  useEffect(() => {
    if (isLeftDrawerOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [isLeftDrawerOpen]);

  const displayName = user?.name || user?.username || "ผู้ใช้งาน";
  const avatarLetter = displayName.slice(0, 1).toUpperCase();

  return (
    <>
      {/* แถบ Navbar หลัก */}
      <nav className="w-full px-6 py-4 flex justify-between items-center bg-transparent relative z-20">
        {/* โลโก้ */}
        <Link href="/" className="flex items-center gap-2 font-mali font-semibold text-2xl text-stone-800 hover:text-[#C07055] transition">
          <i className="fa-solid fa-paw text-[#C07055]"></i> GoHome
        </Link>

        {/* เมนูกลาง (ตัดคำว่าจัดการข้อมูลสัตว์ Admin ออกตามที่แจ้ง) */}
        <div className="hidden md:flex gap-8 items-center text-[15px] font-prompt text-stone-600">
          <Link href="/" className="hover:text-[#C07055] transition duration-200">หน้าหลัก</Link>
          <Link href="/cases" className="hover:text-[#C07055] transition duration-200">เคสที่ต้องการความช่วยเหลือ</Link>
          <Link href="/report" className="hover:text-[#C07055] transition duration-200">แจ้งพบเจอสัตว์</Link>
          <Link href="/about" className="hover:text-[#C07055] transition duration-200">เกี่ยวกับเรา</Link>
        </div>

        {/* ฝั่งขวา Navbar */}
        <div className="flex items-center gap-3 font-prompt">
          {user ? (
            <div className="flex items-center gap-3">
              {/* ปุ่ม Avatar: มีพื้นหลังชัดเจน กดแล้วเปิดเมนูซ้าย */}
              <button
                type="button"
                onClick={() => setIsLeftDrawerOpen(true)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#FDF0EB] border border-[#E29578]/40 hover:bg-[#fae2d9] transition shadow-xs cursor-pointer group"
                title="คลิกเพื่อเปิดเมนูผู้ใช้"
              >
                <div className="w-7 h-7 rounded-full bg-[#E29578] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    avatarLetter
                  )}
                </div>
                <span className="text-xs font-semibold text-stone-700 group-hover:text-[#C07055] transition">
                  {displayName}
                </span>
                <i className="fa-solid fa-bars text-stone-400 text-xs"></i>
              </button>

              {/* ปุ่ม Logout ไอคอนออกจากระบบ */}
              <button
                type="button"
                onClick={handleLogout}
                className="text-stone-600 hover:text-red-500 transition p-1.5 text-base cursor-pointer"
                title="ออกจากระบบ"
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i>
              </button>
            </div>
          ) : (
            /* ปุ่มเมื่อยังไม่ล็อกอิน */
            <div className="flex items-center gap-4">
              <Link href="/login" className="font-mali font-semibold hover:text-[#C07055] transition duration-200 text-stone-700 text-sm">
                เข้าสู่ระบบ
              </Link>
              <Link href="/register" className="font-mali font-semibold bg-[#E29578] hover:bg-[#C07055] text-white px-5 py-2 rounded-full transition duration-300 shadow-sm text-sm">
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ========================================================= */}
      {/* เมนูด้านข้างที่เลื่อนออกมาจาก "ฝั่งซ้ายของจอ" (Left Side Drawer) */}
      {/* ========================================================= */}
      {/* ฉากหลังสีดำทึบ (Backdrop Overlay) */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${isLeftDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsLeftDrawerOpen(false)}
      ></div>

      {/* กล่องเมนูจากซ้าย */}
      <aside
        className={`fixed top-0 left-0 w-80 max-w-[85vw] h-full bg-white z-50 transform transition-transform duration-300 ease-out shadow-2xl flex flex-col ${isLeftDrawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* หัวข้อ Drawer ด้านบน */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#FDF0EB] border border-[#E29578]/50 text-[#C07055] flex items-center justify-center font-bold text-base shadow-xs">
              {avatarLetter}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm text-stone-800 truncate">{displayName}</p>
              <p className="text-[11px] text-stone-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsLeftDrawerOpen(false)}
            className="w-8 h-8 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 flex items-center justify-center transition"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* รายการเมนูทางลัด */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 font-prompt text-sm text-stone-700">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-3 mb-2">
            ข้อมูลและการจัดการ
          </p>

          <Link
            href="/user/edit"
            onClick={() => setIsLeftDrawerOpen(false)}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#FDF0EB]/70 hover:text-[#C07055] transition"
          >
            <i className="fa-solid fa-id-card text-stone-400 w-5 text-center"></i>
            <span className="font-medium">จัดการโปรไฟล์</span>
          </Link>


          <Link
            href="/"
            onClick={() => setIsLeftDrawerOpen(false)}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#FDF0EB]/70 hover:text-[#C07055] transition"
          >
            <i className="fa-solid fa-id-card text-stone-400 w-5 text-center"></i>
            <span className="font-medium">หน้าหลัก</span>
          </Link>


          <Link
            href="/cases"
            onClick={() => setIsLeftDrawerOpen(false)}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#FDF0EB]/70 hover:text-[#C07055] transition"
          >
            <i className="fa-solid fa-id-card text-stone-400 w-5 text-center"></i>
            <span className="font-medium">เคสที่ต้องการความช่วยเหลือ</span>
          </Link>



          <Link
            href="/report"
            onClick={() => setIsLeftDrawerOpen(false)}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#FDF0EB]/70 hover:text-[#C07055] transition"
          >
            <i className="fa-solid fa-map-location-dot text-stone-400 w-5 text-center"></i>
            <span>แจ้งพบเจอสัตว์</span>
          </Link>


          <Link
            href="/my-reports"
            onClick={() => setIsLeftDrawerOpen(false)}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#FDF0EB]/70 hover:text-[#C07055] transition"
          >
            <i className="fa-solid fa-clipboard-list text-stone-400 w-5 text-center"></i>
            <span>ประวัติการแจ้งพบสัตว์</span>
          </Link>


          <Link
            href="/about"
            onClick={() => setIsLeftDrawerOpen(false)}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#FDF0EB]/70 hover:text-[#C07055] transition"
          >
            <i className="fa-solid fa-circle-info text-stone-400 w-5 text-center"></i>
            <span>เกี่ยวกับเรา</span>
          </Link>



          {/* เมนูจัดการสัตว์สำหรับ Admin */}
          {user?.role === "admin" && (
            <div className="pt-3 mt-3 border-t border-stone-100">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-3 mb-2">
                ผู้ดูแลระบบ (Admin)
              </p>
              <Link
                href="/admin/animals"
                onClick={() => setIsLeftDrawerOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-[#FDF0EB] text-[#C07055] font-semibold hover:bg-[#fae2d9] transition"
              >
                <i className="fa-solid fa-shield-cat w-5 text-center text-[#C07055]"></i>
                <span>จัดการข้อมูลสัตว์ (Admin)</span>
              </Link>

              <Link
                href="/admin/shelter-management"
                onClick={() => setIsLeftDrawerOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#FDF0EB]/70 hover:text-[#C07055] transition"
              >
                <i className="fa-solid fa-house-medical text-stone-400 w-5 text-center"></i>
                <span className="font-medium">จัดการศูนย์พักพิง</span>
              </Link>


              <Link
                href="/admin/reports"
                onClick={() => setIsLeftDrawerOpen(false)}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#FDF0EB]/70 hover:text-[#C07055] transition"
              >
                <i className="fa-solid fa-clipboard-check text-stone-400 w-5 text-center"></i>
                <span className="font-medium">ตรวจสอบการแจ้งพบสัตว์</span>
              </Link>









            </div>
          )}
        </div>

        {/* ปุ่มออกจากระบบด้านล่าง Drawer */}
        <div className="p-4 border-t border-stone-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-500 font-semibold text-xs hover:bg-red-100 transition"
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </>
  );
}
