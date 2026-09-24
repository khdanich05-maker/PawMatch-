// app/(public)/about/page.tsx
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-prompt">
      <div className="text-5xl mb-4">🐾</div>
      <h1 className="text-2xl font-bold font-mali text-stone-800 mb-2">เกี่ยวกับ GoHome </h1>
      <p className="text-stone-500 max-w-md mb-6 text-sm">
        เราคือแพลตฟอร์มสื่อกลางเพื่อเชื่อมโยงผู้ที่พร้อมอุปการะและช่วยเหลือสัตว์จรจัดเข้ากับศูนย์พักพิง
      </p>
      <Link href="/" className="px-5 py-2.5 rounded-full bg-[#E29578] text-white text-xs font-semibold hover:bg-[#C07055] transition">
        กลับหน้าหลัก
      </Link>
    </div>
  );
}