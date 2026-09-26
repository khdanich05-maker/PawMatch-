// app/(public)/about/page.tsx
import Link from "next/link";

const TEAM_MEMBERS = [
  {
    name: "เดนิช",
    role: "Feature 1 · Auth & User Profile",
    desc: "ระบบล็อกอิน สมัครสมาชิก และจัดการโปรไฟล์ผู้ใช้",
    icon: "fa-solid fa-user-shield",
    color: "from-blue-100 to-blue-50",
    iconColor: "text-blue-500",
  },
  {
    name: "ฝั่งข้า",
    role: "Feature 2 · Animal Registry",
    desc: "ระบบทะเบียนสัตว์ จัดการข้อมูลและบันทึกประวัติในศูนย์พักพิง",
    icon: "fa-solid fa-paw",
    color: "from-orange-100 to-orange-50",
    iconColor: "text-[#E29578]",
  },
  {
    name: "ฝั่งข้า",
    role: "Feature 3 · Stray Reporting",
    desc: "ระบบแจ้งพบสัตว์จรจัด ปักหมุดพิกัด และอัพโหลดรูปภาพ",
    icon: "fa-solid fa-location-dot",
    color: "from-green-100 to-green-50",
    iconColor: "text-green-500",
  },
  {
    name: "ทีมงาน",
    role: "Feature 4 · Adoption Request",
    desc: "ระบบขอรับเลี้ยงสัตว์ ยื่นใบสมัคร และตรวจสอบสถานะการอนุมัติ",
    icon: "fa-solid fa-hand-holding-heart",
    color: "from-pink-100 to-pink-50",
    iconColor: "text-pink-500",
  },
  {
    name: "ทีมงาน",
    role: "Feature 5 · Care Tracking",
    desc: "ระบบบันทึก Care Log ติดตามการดูแลสุขภาพและพัฒนาการของสัตว์",
    icon: "fa-solid fa-clipboard-list",
    color: "from-purple-100 to-purple-50",
    iconColor: "text-purple-500",
  },
  {
    name: "ทีมงาน",
    role: "Feature 6 · Shelter Management",
    desc: "ระบบจัดการศูนย์พักพิงและ Dashboard สถิติภาพรวมของ Admin",
    icon: "fa-solid fa-building-columns",
    color: "from-teal-100 to-teal-50",
    iconColor: "text-teal-500",
  },
];

const CORE_VALUES = [
  {
    icon: "fa-solid fa-heart",
    title: "ความใส่ใจ",
    desc: "ทุกฟีเจอร์ถูกออกแบบด้วยความใส่ใจในชีวิตของสัตว์ทุกตัว",
  },
  {
    icon: "fa-solid fa-handshake",
    title: "ความร่วมมือ",
    desc: "เชื่อมโยงพลเมือง อาสาสมัคร และศูนย์พักพิงให้ทำงานร่วมกัน",
  },
  {
    icon: "fa-solid fa-shield-halved",
    title: "ความน่าเชื่อถือ",
    desc: "ระบบโปร่งใส ข้อมูลครบถ้วน ตรวจสอบได้ทุกขั้นตอน",
  },
  {
    icon: "fa-solid fa-leaf",
    title: "ความยั่งยืน",
    desc: "สร้างชุมชนผู้รักสัตว์ที่เติบโตและช่วยเหลือกันอย่างต่อเนื่อง",
  },
];

export default function AboutPage() {
  return (
    <div className="w-full font-prompt">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-[#FDF0EB] via-[#FCFAF8] to-white py-20 px-6 text-center overflow-hidden">
        <i className="fa-solid fa-paw absolute -top-8 -left-8 text-[180px] text-[#E29578]/10 select-none" />
        <i className="fa-solid fa-paw absolute -bottom-8 -right-8 text-[180px] text-[#E29578]/10 select-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E29578]/15 text-[#C07055] text-xs font-semibold mb-6 font-mali border border-[#E29578]/30">
            <i className="fa-solid fa-paw" /> GoHome — จับคู่ใจ เพื่อสัตว์จร
          </div>

          <h1 className="font-mali font-bold text-4xl md:text-5xl text-stone-800 mb-5 leading-snug">
            เกี่ยวกับ{" "}
            <span className="text-[#E29578]">GoHome</span>
          </h1>
          <p className="text-stone-500 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            เราคือแพลตฟอร์มสื่อกลางที่เชื่อมโยงผู้มีจิตอาสา ศูนย์พักพิง และสัตว์จรจัดเข้าหากัน
            เพื่อให้ทุกชีวิตสมควรได้มีบ้านที่อบอุ่น
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-mali font-semibold text-3xl text-stone-800 mb-4">
              พันธกิจของเรา
            </h2>
            <p className="text-stone-500 leading-relaxed mb-4">
              ในประเทศไทยมีสัตว์จรจัดนับล้านตัวที่รอคอยบ้านและความรัก แต่กระบวนการช่วยเหลือยังขาดระบบที่เชื่อมโยงกัน
              ทำให้ข้อมูลกระจัดกระจาย การติดตามผลทำได้ยาก
            </p>
            <p className="text-stone-500 leading-relaxed mb-6">
              <strong className="text-stone-700">GoHome</strong> ถูกสร้างขึ้นเพื่อแก้ปัญหานี้ — ด้วยระบบที่ครอบคลุมตั้งแต่การแจ้งพบสัตว์
              การรับเข้าศูนย์ ไปจนถึงการจับคู่และติดตามหลังรับเลี้ยง ในที่เดียว
            </p>
            <Link
              href="/cases"
              className="inline-flex items-center gap-2 font-mali font-semibold bg-[#E29578] hover:bg-[#C07055] text-white px-6 py-3 rounded-2xl transition duration-300 shadow-md hover:-translate-y-0.5 text-sm"
            >
              <i className="fa-solid fa-arrow-right" /> ดูเคสสัตว์ที่รอบ้าน
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {CORE_VALUES.map((val) => (
              <div
                key={val.title}
                className="bg-[#FCFAF8] rounded-2xl p-5 border border-orange-100 hover:shadow-sm transition"
              >
                <div className="w-10 h-10 bg-[#FDF0EB] rounded-full flex items-center justify-center mb-3">
                  <i className={`${val.icon} text-[#E29578]`} />
                </div>
                <h4 className="font-mali font-semibold text-stone-800 mb-1 text-sm">
                  {val.title}
                </h4>
                <p className="text-stone-500 text-xs leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-6 bg-[#FCFAF8]">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="font-mali font-semibold text-3xl text-stone-800 mb-2">
            ระบบ GoHome ทำงานอย่างไร?
          </h2>
          <p className="text-stone-500 text-sm">
            4 ขั้นตอนที่เชื่อมทุกฝ่ายเข้าด้วยกันอย่างราบรื่น
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              step: "1",
              icon: "fa-solid fa-map-location-dot",
              title: "แจ้งพบสัตว์จร",
              desc: "ปักหมุดพิกัดและถ่ายรูปส่งตรงไปยังศูนย์ใกล้บ้าน",
            },
            {
              step: "2",
              icon: "fa-solid fa-hospital-user",
              title: "รับเข้าศูนย์",
              desc: "ตรวจสุขภาพ ทำหมัน และลงทะเบียนเข้าสู่ระบบ",
            },
            {
              step: "3",
              icon: "fa-solid fa-wand-magic-sparkles",
              title: "จับคู่ใจ",
              desc: "ทำแบบประเมินเพื่อหาน้องที่ตรงกับไลฟ์สไตล์คุณ",
            },
            {
              step: "4",
              icon: "fa-solid fa-heart",
              title: "ส่งมอบ & ดูแล",
              desc: "ส่งมอบน้องสู่บ้านใหม่พร้อมบันทึก Care Log ต่อเนื่อง",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center hover:shadow-md transition"
            >
              <div className="w-14 h-14 bg-[#FDF0EB] rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <i className={`${item.icon} text-[#E29578] text-xl`} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E29578] text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mali">
                  {item.step}
                </span>
              </div>
              <h4 className="font-mali font-semibold text-stone-800 mb-2 text-sm">
                {item.title}
              </h4>
              <p className="text-stone-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-mali font-semibold text-3xl text-stone-800 mb-2">
              ฟีเจอร์ทั้งหมดในระบบ
            </h2>
            <p className="text-stone-500 text-sm">
              6 โมดูลหลักที่ทีมพัฒนาร่วมกันสร้างขึ้น
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.role}
                className={`bg-gradient-to-br ${member.color} rounded-2xl p-6 border border-white/80 hover:shadow-md transition`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <i className={`${member.icon} ${member.iconColor} text-lg`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-0.5">
                      {member.role}
                    </p>
                    <p className="text-stone-600 text-xs leading-relaxed">{member.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-[#FCFAF8]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-[#FDF0EB] to-[#FCFAF8] rounded-3xl p-12 border border-orange-100 shadow-sm relative overflow-hidden">
            <i className="fa-solid fa-paw absolute -top-8 -left-8 text-[120px] text-[#E29578]/10 select-none" />
            <i className="fa-solid fa-paw absolute -bottom-8 -right-8 text-[120px] text-[#E29578]/10 select-none" />

            <div className="relative z-10">
              <div className="text-5xl mb-4">🐾</div>
              <h2 className="font-mali font-bold text-2xl md:text-3xl text-stone-800 mb-4">
                พร้อมช่วยให้สัตว์ได้กลับบ้านแล้วหรือยัง?
              </h2>
              <p className="text-stone-500 mb-8 text-sm md:text-base leading-relaxed">
                ร่วมเป็นส่วนหนึ่งของชุมชนที่รักสัตว์ — แจ้งพบสัตว์จรจัด หรือเปิดใจรับน้องสักตัวมาเป็นเพื่อน
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/cases"
                  className="inline-flex items-center justify-center gap-2 font-mali font-semibold bg-[#E29578] hover:bg-[#C07055] text-white px-7 py-3.5 rounded-2xl transition duration-300 shadow-md hover:-translate-y-0.5 text-sm"
                >
                  <i className="fa-solid fa-paw" /> ดูสัตว์ที่รอบ้าน
                </Link>
                <Link
                  href="/report"
                  className="inline-flex items-center justify-center gap-2 font-mali font-semibold bg-white hover:bg-[#FDF0EB] text-[#C07055] border border-[#E29578]/40 px-7 py-3.5 rounded-2xl transition duration-300 text-sm"
                >
                  <i className="fa-solid fa-location-dot" /> แจ้งพบสัตว์จรจัด
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-10 px-6 bg-white border-t border-gray-100 text-center">
        <p className="text-stone-400 text-sm font-prompt">
          <i className="fa-regular fa-envelope mr-2 text-[#E29578]" />
          contact@gohomematch.com
          <span className="mx-4 text-stone-200">|</span>
          <i className="fa-solid fa-phone mr-2 text-[#E29578]" />
          02-XXX-XXXX
        </p>
        <p className="text-stone-300 text-xs mt-2">© 2026 GoHome Project. All rights reserved.</p>
      </section>
    </div>
  );
}