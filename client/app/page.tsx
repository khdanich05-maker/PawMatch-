import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20 max-w-7xl mx-auto px-6 mt-12">
        <div className="flex-1">
          <h1 className="font-mali font-semibold text-5xl leading-[1.4] mb-6">
            เพราะทุกชีวิต <br />
            สมควรมี<span className="text-primary">บ้าน</span>
          </h1>
          <p className="text-lg mb-8 max-w-lg leading-relaxed">
            จับคู่อาสาสมัครกับสัตว์จรที่ต้องการความช่วยเหลือ ตามพื้นที่ เวลา และความพร้อมของคุณ
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* สลับปุ่มตามสถานะผู้ใช้ */}
            {user ? (
              <Link 
                href="/cases" 
                className="font-mali font-semibold bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-full transition duration-300 shadow-md text-center flex items-center justify-center"
              >
                <i className="fa-solid fa-paw mr-2"></i>ดูเคสช่วยเหลือสัตว์
              </Link>
            ) : (
              <Link 
                href="/register" 
                className="font-mali font-semibold bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-full transition duration-300 shadow-md text-center flex items-center justify-center"
              >
                <i className="fa-solid fa-heart mr-2"></i>เริ่มเป็นอาสาสมัคร
              </Link>
            )}

            <Link href="/cases" className="font-mali font-semibold border-2 border-primary text-primary hover:bg-bgAccent px-6 py-3 rounded-full transition duration-300 text-center flex items-center justify-center">
              ดูเคสที่ต้องการความช่วยเหลือ <i className="fa-solid fa-magnifying-glass ml-2"></i>
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center w-full">
          <div className="w-full max-w-md h-80 bg-bgAccent rounded-3xl flex items-center justify-center text-primaryHover font-mali font-semibold shadow-inner overflow-hidden">
            <img src="https://img.magnific.com/free-photo/front-view-adorable-shiba-inu-dog_23-2149457807.jpg?semt=ais_hybrid&w=740&q=80" alt="รูปภาพสัตว์จรจัด" className="w-full h-full object-cover rounded-3xl" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row justify-around items-center gap-8">
          <div className="text-center">
            <div className="font-mali font-semibold text-4xl text-primary mb-1">128</div>
            <div className="text-sm text-gray-600">สัตว์ที่ได้รับการช่วยเหลือ</div>
          </div>
          <div className="text-center">
            <div className="font-mali font-semibold text-4xl text-primary mb-1">86</div>
            <div className="text-sm text-gray-600">อาสาสมัครในระบบ</div>
          </div>
          <div className="text-center">
            <div className="font-mali font-semibold text-4xl text-primary mb-1">20</div>
            <div className="text-sm text-gray-600">จำนวนศูนย์พักพิง</div>
          </div>
        </div>
      </section>

      {/* Urgent Cases Section */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-mali font-semibold text-3xl text-textMain mb-2">น้องๆ ที่รอคอยบ้านมาแสนนาน 🐾</h2>
            <p className="text-gray-500">เปิดใจมอบพื้นที่เล็กๆ ให้กับชีวิตที่รอคอยความรักและการช่วยเหลือ</p>
          </div>
          <Link href="/cases" className="hidden sm:flex font-mali font-semibold text-primary hover:text-primaryHover transition items-center gap-1">
            ดูทั้งหมด <i className="fa-solid fa-arrow-right text-sm"></i>
          </Link>
        </div>

        {/* Grid 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300 border border-gray-100 flex flex-col">
            <div className="h-48 bg-bgAccent flex items-center justify-center text-primaryHover relative">
              <i className="fa-solid fa-dog text-4xl"></i>
              <span className="absolute top-3 left-3 bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full font-semibold shadow-sm">รอนานกว่า 30 วัน</span>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-itim text-2xl mb-1 text-textMain">หมูปิ้ง</h3>
              <p className="text-xs text-gray-400 mb-4"><i className="fa-solid fa-clock text-primary mr-1"></i> โพสต์เมื่อ 12 ส.ค. 2026</p>
              <Link href="/cases" className="mt-auto w-full font-mali font-semibold bg-primary hover:bg-primaryHover text-white py-2 rounded-xl transition duration-300 text-center block">
                ขอดูรายละเอียด
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300 border border-gray-100 flex flex-col">
            <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400 relative">
              <i className="fa-solid fa-cat text-4xl"></i>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-itim text-2xl mb-1 text-textMain">ชาเย็น</h3>
              <p className="text-xs text-gray-400 mb-4"><i className="fa-solid fa-clock text-primary mr-1"></i> โพสต์เมื่อ 15 ส.ค. 2026</p>
              <Link href="/cases" className="mt-auto w-full font-mali font-semibold bg-primary hover:bg-primaryHover text-white py-2 rounded-xl transition duration-300 text-center block">
                ขอดูรายละเอียด
              </Link>
            </div>
          </div>

          {/* Placeholder Cards */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col opacity-50">
            <div className="h-48 bg-bgAccent"></div>
            <div className="p-5"><h3 className="bg-gray-200 h-6 w-1/2 rounded mb-4"></h3><div className="mt-auto w-full bg-gray-200 h-10 rounded-xl"></div></div>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col opacity-50">
            <div className="h-48 bg-bgAccent"></div>
            <div className="p-5"><h3 className="bg-gray-200 h-6 w-1/2 rounded mb-4"></h3><div className="mt-auto w-full bg-gray-200 h-10 rounded-xl"></div></div>
          </div>
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link href="/cases" className="font-mali font-semibold text-primary hover:text-primaryHover transition inline-flex items-center gap-1">
            ดูทั้งหมด <i className="fa-solid fa-arrow-right text-sm"></i>
          </Link>
        </div>
      </section>

      {/* How it works Section */}
      <section className="mb-24 py-16 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-mali font-semibold text-3xl text-textMain mb-2">ระบบของเราทำงานอย่างไร?</h2>
            <p className="text-gray-500">4 ขั้นตอนง่ายๆ ในการเปลี่ยนชีวิตสัตว์จรจัด</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start text-center gap-10 relative">
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-0.5 bg-gray-200 -z-10 w-3/4 mx-auto"></div>

            <div className="flex-1 flex flex-col items-center bg-white z-10 px-2 w-full">
              <div className="w-20 h-20 bg-bgAccent rounded-full flex items-center justify-center text-primary text-3xl mb-4 shadow-sm border-4 border-white">
                <i className="fa-solid fa-map-location-dot"></i>
              </div>
              <h4 className="font-mali font-semibold text-lg mb-2">1. แจ้งพบ</h4>
              <p className="text-sm text-gray-500 max-w-[200px]">ปักหมุด เพื่อให้เจ้าหน้าที่ไปรับสัตว์มาศูนย์พักพิง</p>
            </div>

            <div className="flex-1 flex flex-col items-center bg-white z-10 px-2 w-full">
              <div className="w-20 h-20 bg-bgAccent rounded-full flex items-center justify-center text-primary text-3xl mb-4 shadow-sm border-4 border-white">
                <i className="fa-solid fa-clipboard-check"></i>
              </div>
              <h4 className="font-mali font-semibold text-lg mb-2">2. อนุมัติ</h4>
              <p className="text-sm text-gray-500 max-w-[200px]">เจ้าหน้าที่ตรวจสอบและนำสัตว์เข้าสู่ระบบทะเบียน</p>
            </div>

            <div className="flex-1 flex flex-col items-center bg-white z-10 px-2 w-full">
              <div className="w-20 h-20 bg-bgAccent rounded-full flex items-center justify-center text-primary text-3xl mb-4 shadow-sm border-4 border-white">
                <i className="fa-solid fa-handshake-angle"></i>
              </div>
              <h4 className="font-mali font-semibold text-lg mb-2">3. จับคู่</h4>
              <p className="text-sm text-gray-500 max-w-[200px]">อาสาสมัครลงทะเบียนขอรับดูแลตามพื้นที่และความสามารถ</p>
            </div>

            <div className="flex-1 flex flex-col items-center bg-white z-10 px-2 w-full">
              <div className="w-20 h-20 bg-bgAccent rounded-full flex items-center justify-center text-primary text-3xl mb-4 shadow-sm border-4 border-white">
                <i className="fa-solid fa-stethoscope"></i>
              </div>
              <h4 className="font-mali font-semibold text-lg mb-2">4. ดูแลและติดตาม</h4>
              <p className="text-sm text-gray-500 max-w-[200px]">อัปเดตสถานะและประวัติการดูแลผ่านระบบ Care Log</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Stray Report */}
      <section className="max-w-5xl mx-auto px-6 mb-20">
        <div className="bg-bgAccent rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-sm">
          <i className="fa-solid fa-paw absolute -top-10 -left-10 text-9xl text-white opacity-60"></i>
          <i className="fa-solid fa-paw absolute -bottom-10 -right-10 text-9xl text-white opacity-60"></i>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-mali font-semibold text-3xl md:text-4xl text-textMain mb-4">พบเห็นสัตว์จรจัดที่ต้องการความช่วยเหลือ?</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              ไม่จำเป็นต้องเป็นสมาชิกก็สามารถแจ้งเหตุได้! เพีกยงแค่ถ่ายรูปและปักหมุดพิกัดลงบนแผนที่ ระบบของเราจะส่งข้อมูลให้ศูนย์พักพิงที่ใกล้ที่สุดทันที
            </p>
            <Link href="/report" className="inline-flex items-center font-mali font-semibold bg-primary hover:bg-primaryHover text-white text-lg px-8 py-4 rounded-full transition duration-300 shadow-lg transform hover:-translate-y-1">
              <i className="fa-solid fa-location-dot mr-2"></i> แจ้งพบสัตว์จรจัดด่วน
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}