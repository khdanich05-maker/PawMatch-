const profileMenus = [
  {
    icon: "fa-user-pen",
    title: "แก้ไขโปรไฟล์",
    description: "จัดการข้อมูลส่วนตัว เบอร์โทรศัพท์ และที่พักของคุณ",
  },
  {
    icon: "fa-paw",
    title: "อัปเดตข้อมูลสัตว์เลี้ยง",
    description: "บันทึกการดูแล สุขภาพ และรูปภาพสัตว์ที่คุณรับเลี้ยง",
  },
  {
    icon: "fa-heart",
    title: "สถานะคำขอรับเลี้ยง",
    description: "ติดตามคำขอรับเลี้ยงและผลการพิจารณาจากเจ้าหน้าที่",
  },
  {
    icon: "fa-location-dot",
    title: "สถานะแจ้งพบสัตว์จร",
    description: "ติดตามความคืบหน้าของรายงานที่คุณแจ้งไว้",
  },
];

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#FCFAF8] px-5 py-10 text-[#44403C] sm:py-14">
      <div className="mx-auto max-w-4xl">
        {/* ส่วนหัวหน้า */}
        <header className="mb-8">
          <p className="mb-2 text-sm font-medium text-[#C07055]">
            บัญชีของฉัน
          </p>
          <h1 className="font-mali text-3xl font-semibold sm:text-4xl">
            โปรไฟล์ของฉัน
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#78716C]">
            จัดการข้อมูลส่วนตัวและติดตามการช่วยเหลือสัตว์ของคุณ
          </p>
        </header>

        {/* ข้อมูลผู้ใช้ตัวอย่าง */}
        <section
          aria-label="ข้อมูลผู้ใช้"
          className="mb-8 flex items-center gap-5 rounded-3xl border
            border-[#F1DDD3] bg-white p-6 shadow-sm sm:p-8"
        >
          <div
            aria-hidden="true"
            className="flex h-20 w-20 shrink-0 items-center justify-center
              rounded-full bg-[#FDF0EB] text-3xl text-[#C07055]"
          >
            <i className="fa-solid fa-user" />
          </div>

          <div className="min-w-0">
            <h2 className="font-mali text-xl font-semibold sm:text-2xl">
              ชื่อผู้ใช้งาน
            </h2>
            <p className="mt-1 text-sm text-[#78716C]">
              ข้อมูลตัวอย่างสำหรับออกแบบหน้าโปรไฟล์
            </p>
            <span
              className="mt-3 inline-block rounded-full bg-[#FDF0EB]
                px-3 py-1 text-xs text-[#9B513A]"
            >
              ผู้ใช้งานทั่วไป
            </span>
          </div>
        </section>

        {/* เมนูของผู้ใช้ */}
        <section aria-labelledby="profile-menu-heading">
          <h2
            id="profile-menu-heading"
            className="mb-4 font-mali text-xl font-semibold"
          >
            เมนูของฉัน
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {profileMenus.map((menu) => (
              <article
                key={menu.title}
                className="flex flex-col rounded-3xl border
                  border-[#E7E5E4] bg-white p-6 shadow-sm"
              >
                <div
                  aria-hidden="true"
                  className="mb-5 flex h-12 w-12 items-center justify-center
                    rounded-2xl bg-[#FDF0EB] text-xl text-[#C07055]"
                >
                  <i className={`fa-solid ${menu.icon}`} />
                </div>

                <h3 className="font-mali text-xl font-semibold">
                  {menu.title}
                </h3>
                <p className="mb-6 mt-2 text-sm leading-7 text-[#78716C]">
                  {menu.description}
                </p>

                <button
                  type="button"
                  disabled
                  className="mt-auto w-full cursor-not-allowed rounded-xl
                    bg-[#F5F5F4] px-4 py-3 text-sm text-[#78716C]"
                >
                  เร็ว ๆ นี้
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}