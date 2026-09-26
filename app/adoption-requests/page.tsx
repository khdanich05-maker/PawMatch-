"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getAnimalImages } from "@/lib/animalImageHelper";

const careTimeLabels: Record<string, string> = { under_2: "น้อยกว่า 2 ชั่วโมง", "2_4": "2–4 ชั่วโมง", "4_6": "4–6 ชั่วโมง", over_6: "มากกว่า 6 ชั่วโมง" };

type Status = "รออนุมัติ" | "กำลังดูแล" | "สิ้นสุดการดูแล" | "ปฏิเสธ";
type Request = { match_id: string; match_status: Status | "อนุมัติ"; start_date: string; monthly_budget: number | null; family_members: number | null; care_time: string | null; adoption_reason: string | null; rejection_reason: string | null; animals: { name: string; species: string; image_url: string | string[] | null } | null };
const tabs: ("ทั้งหมด" | Status)[] = ["ทั้งหมด", "รออนุมัติ", "กำลังดูแล", "ปฏิเสธ"];
const label = (status: Status) => status === "รออนุมัติ" ? "รอพิจารณา" : status === "กำลังดูแล" ? "อนุมัติ" : status === "ปฏิเสธ" ? "ปฏิเสธ" : status;

export default function AdoptionRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]); const [tab, setTab] = useState<(typeof tabs)[number]>("ทั้งหมด"); const [message, setMessage] = useState("กำลังโหลดคำขอ…");
  const [dialog, setDialog] = useState<{ request: Request; mode: "cancel" | "details" } | null>(null);
  const load = () => fetch("/api/adoptions").then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setRequests((data.requests as Request[]).map((request) => ({ ...request, match_status: request.match_status === "อนุมัติ" ? "กำลังดูแล" : request.match_status }))); setMessage(""); }).catch((error: Error) => setMessage(error.message || "โหลดคำขอไม่สำเร็จ"));
  useEffect(() => { load(); }, []); const visible = tab === "ทั้งหมด" ? requests : requests.filter((item) => item.match_status === tab);
  return (
    <main className="min-h-screen bg-[#FCFAF9] px-4 py-6 font-prompt text-[#484441] sm:px-8 sm:py-9">
      <div className="mx-auto max-w-[1120px]">
        <header className="mb-8 flex items-center gap-4 sm:mb-10 sm:gap-5">
          <Link href="/cases" aria-label="กลับไปดูสัตว์ทั้งหมด" title="กลับไปดูสัตว์ทั้งหมด" className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#E2E5EB] bg-white text-xl shadow-sm transition hover:bg-[#FFF1EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9957D]">←</Link>
          <h1 className="font-mali text-2xl font-bold leading-relaxed sm:text-4xl">สถานะคำขอรับเลี้ยง <span aria-hidden="true" className="ml-1 inline-block text-2xl sm:ml-3 sm:text-3xl">📝</span></h1>
        </header>
        <nav aria-label="เลือกหมวดสถานะคำขอ" className="mb-6 flex flex-wrap gap-2 sm:gap-3">
          {tabs.map((item) => {
            const count = item === "ทั้งหมด" ? requests.length : requests.filter((request) => request.match_status === item).length;
            const active = tab === item;
            return <button key={item} type="button" aria-pressed={active} aria-controls="adoption-request-results" onClick={() => setTab(item)} className={"inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C77C62] focus-visible:ring-offset-2 sm:px-5 " + (active ? "border-[#C77C62] bg-[#C77C62] text-white shadow-sm" : "border-[#E5E7EB] bg-white text-[#677386] hover:border-[#E6B29E] hover:bg-[#FFF6F1]")}>
              {item === "ทั้งหมด" ? item : label(item)}
              <span className={"inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs tabular-nums " + (active ? "bg-white/20 text-white" : "bg-[#F3F4F6] text-[#788497]")}>{count}<span className="sr-only"> คำขอ</span></span>
            </button>;
          })}
        </nav>
        <section id="adoption-request-results" aria-label="รายการคำขอรับเลี้ยง">
          {message ? <div role="status" className="rounded-[28px] border border-[#E9EBEF] bg-white px-6 py-12 text-center text-sm leading-7 text-[#788497]">{message}</div> : visible.length === 0 ? <div className="rounded-[28px] border border-dashed border-[#E3D7CF] bg-white px-6 py-14 text-center"><span aria-hidden="true" className="text-4xl">🏡</span><h2 className="mt-5 font-mali text-xl font-semibold">ยังไม่มีคำขอในหมวดนี้</h2><p className="mt-2 text-sm leading-7 text-[#788497]">เลือกดูสถานะอื่น หรือทำความรู้จักน้องที่กำลังรอบ้านใหม่</p><Link href="/cases" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#C77C62] px-6 py-3 text-sm font-medium text-white hover:bg-[#AC654D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C77C62] focus-visible:ring-offset-2">พบกับน้องที่รอบ้าน</Link></div> : <div className="space-y-4">
            {visible.map((request) => {
              const approved = request.match_status === "กำลังดูแล";
              const rejected = request.match_status === "ปฏิเสธ";
              const pending = request.match_status === "รออนุมัติ";
              const photo = request.animals?.image_url ? getAnimalImages(request.animals.image_url)[0] : null;
              const statusText = approved ? "อนุมัติแล้ว! การจับคู่สำเร็จ" : rejected ? "ขออภัย คำขอถูกปฏิเสธ" : pending ? "กำลังรอเจ้าหน้าที่พิจารณา" : request.match_status === "สิ้นสุดการดูแล" ? "สิ้นสุดการดูแล" : "ไม่ทราบสถานะคำขอ";
              return <article key={request.match_id} className={"flex min-w-0 flex-wrap items-center gap-4 rounded-[22px] border p-4 shadow-[0_2px_3px_rgba(40,35,30,0.035)] sm:flex-nowrap sm:gap-5 sm:px-6 sm:py-5 " + (approved ? "border-[#A7F3C1] bg-[#FAFFFB]" : "border-[#EFF0F3] bg-white")}>
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#EEE9E3] bg-[#FFF1EB] sm:h-[88px] sm:w-[88px]">{photo ? <Image src={photo} alt={request.animals?.name || "สัตว์ที่ยื่นคำขอ"} width={88} height={88} unoptimized className="h-full w-full object-cover" /> : <span aria-hidden="true" className="grid h-full place-items-center text-3xl text-[#D9977E]">🐾</span>}</div>
                <div className="min-w-0 flex-1 basis-48">
                  <h2 className={"break-words font-mali text-lg font-bold leading-relaxed sm:text-xl " + (rejected ? "text-[#696461]" : "text-[#484441]")}>{request.animals?.name || "สัตว์ที่ไม่ระบุชื่อ"}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs leading-5 text-[#788497]"><p><i aria-hidden="true" className="fa-regular fa-calendar mr-2" />ส่งเมื่อ: <time dateTime={request.start_date}>{new Date(request.start_date).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}</time></p>{request.animals?.species && <p><i aria-hidden="true" className="fa-solid fa-paw mr-2" />{request.animals.species}</p>}</div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className={"inline-flex min-h-8 items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium leading-5 " + (approved ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]" : rejected ? "border-[#FFE1E5] bg-[#FFF4F5] text-[#E45260]" : pending ? "border-[#FFEDD5] bg-[#FFF8EE] text-[#EA650C]" : "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]")}><i aria-hidden="true" className={approved ? "fa-solid fa-circle-check" : rejected ? "fa-solid fa-circle-xmark" : pending ? "fa-solid fa-hourglass-half" : "fa-solid fa-flag-checkered"} /><span>{approved && <span aria-hidden="true">🎉 </span>}{statusText}</span></span>
                    {request.rejection_reason && <p className="min-w-0 max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] sm:max-w-[320px] rounded-xl border border-[#FFE9EC] bg-[#FFF8F8] px-3 py-2 text-xs leading-5 text-[#E45260]"><span className="font-semibold">เหตุผล: </span>{request.rejection_reason}</p>}
                  </div>
                </div>
                <div className="ml-auto flex shrink-0 flex-col items-end gap-1"><button type="button" onClick={() => setDialog({ request, mode: "details" })} className="min-h-11 rounded-xl border border-[#E8D9D1] bg-white px-4 text-sm text-[#A4654E] hover:bg-[#FFF6F1] focus-visible:ring-2 focus-visible:ring-[#C77C62]">ดูข้อมูลคำขอ</button>{pending && <button type="button" onClick={() => setDialog({ request, mode: "cancel" })} className="ml-auto min-h-11 shrink-0 rounded-lg px-2 text-sm text-[#8C95A5] underline decoration-[#BDC3CD] underline-offset-4 transition hover:text-[#D36A70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9957D]">ยกเลิกคำขอ<span className="sr-only"> สำหรับ {request.animals?.name || "สัตว์ที่ไม่ระบุชื่อ"}</span></button>}</div>
              </article>;
            })}
          </div>}
        </section>
      </div>
      {dialog && <RequestDialog request={dialog.request} mode={dialog.mode} onClose={() => setDialog(null)} onCancelled={() => { setRequests((current) => current.filter((request) => request.match_id !== dialog.request.match_id)); setDialog(null); }} />}
    </main>
  );
}

function RequestDialog({ request, mode, onClose, onCancelled }: { request: Request; mode: "cancel" | "details"; onClose: () => void; onCancelled: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const busy = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const element = ref.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    element?.showModal(); document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = overflow; previousFocus?.focus(); };
  }, []);
  async function confirmCancel() {
    if (busy.current) return;
    busy.current = true; setSaving(true); setError("");
    try {
      const response = await fetch("/api/adoptions?requestId=" + encodeURIComponent(request.match_id), { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ยกเลิกคำขอไม่สำเร็จ");
      onCancelled();
    } catch (error) { setError(error instanceof Error ? error.message : "เชื่อมต่อระบบไม่สำเร็จ กรุณาลองอีกครั้ง"); }
    finally { busy.current = false; setSaving(false); }
  }
  const button = "min-h-11 rounded-full px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C77C62] disabled:opacity-50";
  return <dialog ref={ref} aria-labelledby="request-dialog-title" aria-busy={saving} onCancel={(event) => { event.preventDefault(); if (!busy.current) onClose(); }} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-[28px] border border-[#EADFD9] bg-[#FCFAF9] p-6 font-prompt text-[#484441] shadow-xl backdrop:bg-stone-900/45 backdrop:backdrop-blur-sm sm:p-8">
    <h2 id="request-dialog-title" className="mb-5 font-mali text-xl font-bold">{mode === "cancel" ? "ยืนยันยกเลิกคำขอ" : "ข้อมูลคำขอรับเลี้ยง"}</h2>
    <p className="mb-5 rounded-2xl bg-[#FFF5EF] p-4 font-medium">{request.animals?.name || "สัตว์ที่ไม่ระบุชื่อ"}</p>
    {mode === "cancel" ? <><p className="text-sm leading-7 text-[#677386]">ต้องการยกเลิกคำขอรับเลี้ยงนี้ใช่ไหม? คำขอจะถูกลบออกจากรายการ</p>{error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}<div className="mt-6 grid grid-cols-2 gap-3"><button type="button" autoFocus disabled={saving} onClick={onClose} className={button + " bg-[#F3F4F6] text-[#596579]"}>เก็บคำขอไว้</button><button type="button" disabled={saving} onClick={() => void confirmCancel()} className={button + " bg-[#D98082] font-medium text-white hover:bg-[#C96C70]"}>{saving ? "กำลังยกเลิก…" : "ยืนยันยกเลิก"}</button></div></> : <>
      <dl className="grid gap-4 sm:grid-cols-2">{[
        ["วันที่ส่งคำขอ", new Date(request.start_date).toLocaleDateString("th-TH")],
        ["สถานะ", request.match_status === "อนุมัติ" ? "อนุมัติ" : label(request.match_status)],
        ["เวลาดูแลต่อวัน", request.care_time ? careTimeLabels[request.care_time] || request.care_time : "ไม่ระบุ"],
        ["สมาชิกในครอบครัว", request.family_members == null ? "ไม่ระบุ" : request.family_members + " คน"],
        ["งบดูแลต่อเดือน", request.monthly_budget == null ? "ไม่ระบุ" : request.monthly_budget.toLocaleString("th-TH") + " บาท"],
      ].map(([title, value]) => <div key={title}><dt className="mb-2 text-xs text-[#788497]">{title}</dt><dd className="rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm">{value}</dd></div>)}</dl>
      <h3 className="mb-2 mt-5 text-xs text-[#788497]">เหตุผลที่อยากรับเลี้ยง</h3><p className="whitespace-pre-wrap break-words rounded-xl border border-[#E5E7EB] p-4 text-sm leading-7">{request.adoption_reason || "ไม่ระบุ"}</p>
      {request.rejection_reason && <p className="mt-4 whitespace-pre-wrap break-words rounded-xl bg-rose-50 p-4 text-sm leading-7 text-rose-700">เหตุผลที่ปฏิเสธ: {request.rejection_reason}</p>}
      <button type="button" onClick={onClose} className={button + " mt-6 w-full bg-[#F3F4F6] text-[#596579]"}>ปิดรายละเอียด</button>
    </>}
  </dialog>;
}
