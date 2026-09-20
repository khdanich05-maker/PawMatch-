"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { createAdoptionRequest } from "@/lib/adoptions/repository";
import type { AdoptionFormData } from "@/lib/adoptions/types";

const inputClass = "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-orange-100";

function RequestForm() {
  const params = useSearchParams();
  const animalId = params.get("animalId") || "tofu";
  const animalName = params.get("animalName") || "เต้าหู้";
  const animalType = params.get("animalType") || "สุนัข";
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const values = new FormData(event.currentTarget);
    const form: AdoptionFormData = {
      animal_id: animalId,
      animal_name: animalName,
      animal_type: animalType,
      applicant_name: String(values.get("applicant_name") || ""),
      phone: String(values.get("phone") || ""),
      address: String(values.get("address") || ""),
      occupation: String(values.get("occupation") || ""),
      housing_type: String(values.get("housing_type") || ""),
      has_fence: values.get("has_fence") === "yes",
      has_other_pets: values.get("has_other_pets") === "yes",
      experience: String(values.get("experience") || ""),
      reason: String(values.get("reason") || ""),
    };
    try {
      await createAdoptionRequest(form);
      setSuccess(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "ส่งคำขอไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-emerald-100 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">✓</div>
        <h1 className="font-mali text-3xl font-semibold">ส่งคำขอสำเร็จ</h1>
        <p className="mt-3 text-gray-500">เจ้าหน้าที่จะตรวจสอบข้อมูลของคุณสำหรับการรับเลี้ยง {animalName}</p>
        <Link href="/adoptions/my-requests" className="mt-7 inline-flex rounded-full bg-primary px-7 py-3 font-mali font-semibold text-white hover:bg-primaryHover">ดูสถานะคำขอ</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div className="bg-bgAccent p-6 md:p-8">
        <p className="text-sm font-semibold text-primary">แบบฟอร์มขอรับเลี้ยง</p>
        <h1 className="mt-1 font-mali text-3xl font-semibold">ขอรับเลี้ยง “{animalName}”</h1>
        <p className="mt-2 text-sm text-gray-600">กรุณายืนยันข้อมูลให้ครบถ้วน ข้อมูลนี้ใช้ประกอบการพิจารณาของเจ้าหน้าที่</p>
      </div>
      <div className="space-y-8 p-6 md:p-8">
        <section>
          <h2 className="mb-4 font-mali text-xl font-semibold">ข้อมูลผู้ขอรับเลี้ยง</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <label>ชื่อ-นามสกุล<input required name="applicant_name" autoComplete="name" className={inputClass} /></label>
            <label>เบอร์โทรศัพท์<input required name="phone" inputMode="tel" pattern="[0-9+ -]{9,15}" autoComplete="tel" className={inputClass} /></label>
            <label>อาชีพ<input required name="occupation" className={inputClass} /></label>
            <label>ลักษณะที่อยู่อาศัย<select required name="housing_type" className={inputClass} defaultValue=""><option value="" disabled>เลือกประเภทที่พัก</option><option>บ้านเดี่ยว</option><option>ทาวน์เฮาส์</option><option>คอนโด/อพาร์ตเมนต์</option><option>หอพัก</option><option>อื่น ๆ</option></select></label>
            <label className="md:col-span-2">ที่อยู่ปัจจุบัน<textarea required name="address" rows={3} autoComplete="street-address" className={inputClass} /></label>
          </div>
        </section>
        <section className="border-t border-gray-100 pt-7">
          <h2 className="mb-4 font-mali text-xl font-semibold">ความพร้อมในการดูแล</h2>
          <div className="grid gap-5 md:grid-cols-2">
            <label>ที่พักมีรั้วหรือพื้นที่ปลอดภัยหรือไม่<select required name="has_fence" className={inputClass}><option value="yes">มี</option><option value="no">ไม่มี</option></select></label>
            <label>ปัจจุบันมีสัตว์เลี้ยงตัวอื่นหรือไม่<select required name="has_other_pets" className={inputClass}><option value="no">ไม่มี</option><option value="yes">มี</option></select></label>
            <label className="md:col-span-2">ประสบการณ์ดูแลสัตว์<textarea required name="experience" rows={3} className={inputClass} /></label>
            <label className="md:col-span-2">เหตุผลที่ต้องการรับเลี้ยง<textarea required name="reason" minLength={20} rows={4} className={inputClass} /></label>
          </div>
        </section>
        {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}
        <label className="flex items-start gap-3 text-sm text-gray-600"><input required type="checkbox" className="mt-1 accent-[#E29578]" /><span>ฉันยืนยันว่าข้อมูลเป็นจริง และยินยอมให้เจ้าหน้าที่ติดต่อเพื่อนัดหมายสัมภาษณ์หรือเยี่ยมบ้าน</span></label>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/cases" className="rounded-xl border border-gray-200 px-6 py-3 text-center font-semibold text-gray-600 hover:bg-gray-50">ยกเลิก</Link>
          <button disabled={submitting} className="rounded-xl bg-primary px-7 py-3 font-mali font-semibold text-white hover:bg-primaryHover disabled:opacity-60">{submitting ? "กำลังส่ง..." : "ส่งคำขอรับเลี้ยง"}</button>
        </div>
      </div>
    </form>
  );
}

export default function AdoptionRequestPage() {
  return <main className="min-h-screen px-5 py-10"><Suspense fallback={<p className="text-center">กำลังโหลด...</p>}><RequestForm /></Suspense></main>;
}

