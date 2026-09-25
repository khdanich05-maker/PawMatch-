"use client";
import { getAnimalImages } from "@/lib/animalImageHelper";

export const statuses = ["รออนุมัติ", "กำลังดูแล", "สิ้นสุดการดูแล", "ปฏิเสธ"] as const;
export type Status = (typeof statuses)[number];
export type Filter = "ทั้งหมด" | Status;
export type AnimalSummary = { animal_id: string; name: string; species: string; gender: string; image_url: string | string[] | null; status: string };
export type Applicant = {
  full_name: string | null; phone: string | null; date_of_birth: string | null;
  accommodation_type: string | null; address: string | null; province: string | null;
  animal_count: number | null; pet_permission: boolean | null; residence_note: string | null;
};
export type AdoptionRequest = {
  match_id: string; animal_id: string; match_status: Status; start_date: string; reviewed_at?: string | null;
  monthly_budget: number | null; family_members: number | null; care_time: string | null;
  adoption_reason: string | null; rejection_reason: string | null;
  users: Applicant | null; animals: AnimalSummary | null;
};
export const labels: Record<Status, string> = { "รออนุมัติ": "รอพิจารณา", "กำลังดูแล": "อนุมัติ", "สิ้นสุดการดูแล": "สิ้นสุดการดูแล", "ปฏิเสธ": "ปฏิเสธ" };
const colors: Record<Status, string> = { "รออนุมัติ": "bg-amber-50 text-amber-800", "กำลังดูแล": "bg-emerald-50 text-emerald-800", "สิ้นสุดการดูแล": "bg-stone-100 text-stone-700", "ปฏิเสธ": "bg-rose-50 text-rose-800" };
export const button = "inline-flex min-h-11 items-center justify-center rounded-xl border border-[#E8D9D1] bg-white px-4 py-2 text-sm font-medium text-[#88432F] transition hover:bg-[#FFF0EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E58A70] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
export const primaryButton = "inline-flex min-h-11 items-center justify-center rounded-xl bg-[#E58A70] shadow-md shadow-[#E58A70]/20 px-4 py-2 text-sm font-medium text-white hover:bg-[#D97860] active:bg-[#C96852] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E58A70] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
export const input = "min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#E58A70] focus:ring-2 focus:ring-[#E58A70]/20";
export const date = (value: string | null) => value ? new Date(value).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }) : "ไม่ระบุ";
export const money = (value: number | null) => value == null ? "ไม่ระบุ" : `${value.toLocaleString("th-TH")} บาท/เดือน`;
export function accommodation(value: string | null) {
  const names: Record<string, string> = { house_owned: "บ้านเดี่ยว (ของตัวเอง / ครอบครัว)", house_rented: "บ้านเช่า (เจ้าของอนุญาตแล้ว)", townhome_owned: "ทาวน์โฮม / ตึกแถว (ของตัวเอง / ครอบครัว)", townhome_rented: "ทาวน์โฮม / ตึกแถวเช่า", condo: "คอนโด / หอพัก (อนุญาตให้เลี้ยงสัตว์)" };
  return value ? names[value] || value : "ไม่ระบุ";
}
export function careTime(value: string | null) {
  const names: Record<string, string> = { under_2: "น้อยกว่า 2 ชั่วโมง", "2_4": "2–4 ชั่วโมง", "4_6": "4–6 ชั่วโมง", over_6: "มากกว่า 6 ชั่วโมง" };
  return value ? names[value] || value : "ไม่ระบุ";
}
export function Badge({ status }: { status: Status }) {
  return <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${colors[status]}`}>{labels[status]}</span>;
}
export function AnimalPhoto({ animal, className = "" }: { animal: AnimalSummary | null; className?: string }) {
  const src = animal?.image_url ? getAnimalImages(animal.image_url)[0] : null;
  return <div className={`overflow-hidden bg-[#FFF0EB] ${className}`}>{src ? <img src={src} alt={animal?.name || "สัตว์รอบ้าน"} className="h-full w-full object-cover" /> : <span aria-hidden="true" className="grid h-full min-h-16 place-items-center text-4xl">🐾</span>}</div>;
}
export function Filters({ search, status, onSearch, onStatus, searchLabel, options = statuses.filter((s) => s !== "สิ้นสุดการดูแล") }: { options?: readonly Status[]; search: string; status: Filter; onSearch: (value: string) => void; onStatus: (value: Filter) => void; searchLabel: string }) {
  return <div className="my-4 grid gap-3 rounded-2xl border border-[#F2D9CF] bg-white p-4 sm:grid-cols-[1fr_15rem] sm:p-4">
    <label className="text-sm font-medium text-stone-700">{searchLabel}<input type="search" className={`${input} mt-2`} placeholder={searchLabel} value={search} onChange={(e) => onSearch(e.target.value)} /></label>
    <label className="text-sm font-medium text-stone-700">สถานะคำขอ<select className={`${input} mt-2`} value={status} onChange={(e) => onStatus(e.target.value as Filter)}><option value="ทั้งหมด">ทั้งหมด</option>{options.map((s) => <option key={s} value={s}>{labels[s]}</option>)}</select></label>
  </div>;
}
export function Pagination({ page, total, size, onChange }: { page: number; total: number; size: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / size));
  if (total <= size) return null;
  return <nav aria-label="แบ่งหน้ารายการ" className="mt-6 flex flex-wrap items-center justify-center gap-3"><button className={button} disabled={page <= 1} onClick={() => onChange(page - 1)}>← ก่อนหน้า</button><span aria-live="polite" className="text-sm text-stone-600">หน้า {page} / {pages}</span><button className={button} disabled={page >= pages} onClick={() => onChange(page + 1)}>ถัดไป →</button></nav>;
}
export function EmptyState({ filtered }: { filtered: boolean }) {
  return <div className="rounded-3xl border border-dashed border-[#D6B5A6] bg-white px-6 py-16 text-center"><span aria-hidden="true" className="text-4xl">🐾</span><h2 className="mt-4 font-mali text-xl font-semibold text-stone-700">{filtered ? "ไม่พบรายการที่ตรงกับการค้นหา" : "ยังไม่มีคำขอรับเลี้ยง"}</h2><p className="mt-2 text-sm leading-7 text-stone-500">{filtered ? "ลองเปลี่ยนคำค้นหาหรือเลือกสถานะทั้งหมด" : "เมื่อมีผู้ยื่นคำขอ รายการจะปรากฏที่นี่เพื่อให้คุณพิจารณา"}</p></div>;
}
