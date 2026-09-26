"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdoptionRequestForm from "@/components/adoptions/AdoptionRequestForm";
import { supabase } from "@/lib/supabase";
import type { Animal } from "@/types/animal";

function FormPage() {
  const router = useRouter();
  const { animalId } = useParams<{ animalId: string }>();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [message, setMessage] = useState("กำลังเตรียมแบบฟอร์ม…");

  useEffect(() => {
    let active = true;
    async function load() {
      const session = await fetch("/api/auth/me").then((response) => response.ok ? response.json() : { user: null });
      if (!session.user) { router.replace(`/login?next=/adoption-requests/new/${animalId}`); return; }

      // ✅ อนุญาตให้ทั้ง user และ admin เข้าไปกรอกแบบฟอร์มได้
      if (session.user.role !== "user" && session.user.role !== "admin") {
        setMessage("เฉพาะบัญชีผู้ใช้งานทั่วไปเท่านั้นที่ส่งคำขอรับเลี้ยงได้");
        return;
      }

      const { data, error } = await supabase.from("animals").select("*, shelters (shelter_name, province, address, contact_phone)").eq("animal_id", animalId).maybeSingle();
      if (!active) return;
      if (error || !data || data.status !== "รอคนดูแล") { setMessage("ไม่พบสัตว์ที่พร้อมรับคำขอแล้ว"); return; }
      setAnimal(data as Animal);
    }
    void load(); return () => { active = false; };
  }, [animalId, router]);

  if (!animal) return (
    <main className="min-h-screen bg-[#FCFAF8] px-4 py-12 font-prompt sm:px-6 sm:py-20">
      <section aria-labelledby="adoption-status-title" className="mx-auto max-w-lg rounded-[28px] border border-[#F1D8CD] bg-white px-6 py-10 text-center shadow-sm sm:p-10">
        <span aria-hidden="true" className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#FFF0EB] text-2xl">🐾</span>
        <h1 id="adoption-status-title" className="mt-5 font-mali text-2xl font-semibold leading-relaxed text-stone-700">ฟอร์มขอรับเลี้ยง</h1>
        <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 text-sm leading-7 text-stone-600">{message}</p>
        {message !== "กำลังเตรียมแบบฟอร์ม…" && (
          <Link href="/cases" className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#D6B5A6] bg-[#FFF8F5] px-5 py-3 text-sm font-medium text-[#88432F] transition-colors hover:bg-[#FFF0EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A65343] focus-visible:ring-offset-4">
            <span aria-hidden="true">←</span> กลับไปหน้ารายการสัตว์
          </Link>
        )}
      </section>
    </main>
  );
  return (
    <main className="min-h-screen bg-[#FCFAF8] px-4 py-6 font-prompt sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <nav aria-label="กลับไปหน้ารายการสัตว์" className="mb-6 sm:mb-8">
          <Link href="/cases" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#E8D9D1] bg-white px-4 py-2 text-sm font-medium text-[#88432F] transition-colors hover:border-[#D6B5A6] hover:bg-[#FFF0EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A65343] focus-visible:ring-offset-4">
            <span aria-hidden="true">←</span> กลับไปดูสัตว์ทั้งหมด
          </Link>
        </nav>
        <header className="mb-6 flex items-start gap-4 sm:mb-8 sm:gap-5">
          <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#F1D8CD] bg-[#FFF0EB] text-2xl sm:h-14 sm:w-14">🏡</span>
          <div className="min-w-0">
            <h1 className="font-mali text-2xl font-semibold leading-relaxed text-stone-700 sm:text-3xl">ฟอร์มขอรับเลี้ยง</h1>
          </div>
        </header>
        <AdoptionRequestForm animal={animal} onSubmitted={() => router.push("/adoption-requests")} />
      </div>
    </main>
  );
}

export default function NewAdoptionRequestPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#FCFAF8] px-4 py-12 font-prompt sm:px-6 sm:py-20">
        <section aria-labelledby="adoption-loading-title" className="mx-auto max-w-lg rounded-[28px] border border-[#F1D8CD] bg-white px-6 py-10 text-center shadow-sm sm:p-10">
          <span aria-hidden="true" className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#FFF0EB] text-2xl">🐾</span>
          <h1 id="adoption-loading-title" className="mt-5 font-mali text-2xl font-semibold leading-relaxed text-stone-700">ฟอร์มขอรับเลี้ยง</h1>
          <p role="status" aria-live="polite" className="mt-3 text-sm leading-7 text-stone-600">กำลังเตรียมแบบฟอร์ม…</p>
        </section>
      </main>
    }>
      <FormPage />
    </Suspense>
  );
}
