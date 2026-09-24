import Link from "next/link";

export default function ReportCtaSection() {
  return (
    <section className="max-w-5xl mx-auto px-6 mb-20">
      <div className="bg-bgAccent rounded-3xl p-10 md:p-14 text-center relative overflow-hidden shadow-sm border border-orange-100">
        <i className="fa-solid fa-paw absolute -top-10 -left-10 text-9xl text-white opacity-60"></i>
        <i className="fa-solid fa-paw absolute -bottom-10 -right-10 text-9xl text-white opacity-60"></i>

        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="font-mali font-semibold text-2xl md:text-3xl text-textMain mb-4">
            พบเห็นสัตว์จรจัดบาดเจ็บหรือต้องการความช่วยเหลือ?
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed text-sm md:text-base font-prompt">
            คุณสามารถช่วยชีวิตเพื่อนสี่ขาได้ทันทีโดยไม่ต้องเป็นสมาชิก! เพียงถ่ายรูปและปักหมุดพิกัดลงบนแผนที่ ข้อมูลจะถูกส่งตรงไปยังศูนย์พักพิงที่ใกล้ที่สุดทันที
          </p>
          <Link
            href="/report"
            className="inline-flex items-center gap-2 font-mali font-semibold bg-primary hover:bg-primaryHover text-white text-base px-8 py-3.5 rounded-2xl transition duration-300 shadow-md hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-location-dot"></i> แจ้งพบสัตว์จรจัดด่วน
          </Link>
        </div>
      </div>
    </section>
  );
}