import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto pt-12 pb-8 text-sm">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <Link href="/" className="flex items-center gap-2 font-mali font-semibold text-xl text-textMain mb-4">
            <i className="fa-solid fa-paw text-primary"></i> PawMatch
          </Link>
          <p className="text-gray-500 mb-4">ระบบจับคู่อาสาสมัครดูแลสัตว์จรจัด<br />เปลี่ยนชีวิตพวกเขาทีละตัว</p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-primary text-lg transition"><i className="fa-brands fa-facebook"></i></a>
            <a href="#" className="text-gray-400 hover:text-primary text-lg transition"><i className="fa-brands fa-instagram"></i></a>
            <a href="#" className="text-gray-400 hover:text-primary text-lg transition"><i className="fa-brands fa-twitter"></i></a>
          </div>
        </div>
        <div>
          <h4 className="font-mali font-semibold text-lg mb-4">เมนูหลัก</h4>
          <ul className="space-y-2 text-gray-500">
            <li><Link href="/report" className="hover:text-primary transition">แจ้งพบสัตว์จรจัด</Link></li>
            <li><Link href="/register" className="hover:text-primary transition">สมัครเป็นอาสาสมัคร</Link></li>
            <li><Link href="/shelters" className="hover:text-primary transition">รายชื่อศูนย์พักพิง</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-mali font-semibold text-lg mb-4">ติดต่อเรา</h4>
          <ul className="space-y-2 text-gray-500">
            <li><i className="fa-regular fa-envelope mr-2 text-primary"></i> contact@pawmatch.com</li>
            <li><i className="fa-solid fa-phone mr-2 text-primary"></i> 02-XXX-XXXX</li>
          </ul>
        </div>
      </div>
      <div className="text-center text-gray-400 border-t border-gray-100 pt-8">
        &copy; 2026 PawMatch Project. All rights reserved.
      </div>
    </footer>
  );
}