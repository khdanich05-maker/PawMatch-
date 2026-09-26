"use client";

import { useEffect, useRef } from "react";
import { accommodation, AdoptionRequest, Badge, button, careTime, date, money } from "./shared";

export default function ApplicantDialog({ request, onClose, onApprove, onReject, saving, error }: { request: AdoptionRequest; onClose: () => void; onApprove: () => void; onReject: () => void; saving: boolean; error: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const focus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    element?.showModal(); document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = overflow; focus?.focus(); };
  }, []);
  const user = request.users;
  const birth = user?.date_of_birth ? new Date(user.date_of_birth) : null;
  const today = new Date();
  const age = birth && Number.isFinite(birth.getTime()) ? today.getFullYear() - birth.getFullYear() - (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate()) ? 1 : 0) : null;
  const details = [
    ["ประเภทที่พัก", accommodation(user?.accommodation_type ?? null)],
    ["สมาชิกครอบครัว", request.family_members == null ? null : `${request.family_members} คน`],
    ["สัตว์เลี้ยงเดิม", user?.animal_count == null ? null : `${user.animal_count} ตัว`],
    ["เวลาดูแลต่อวัน", careTime(request.care_time)],
    ["งบประมาณต่อเดือน", money(request.monthly_budget)],
    ["การอนุญาตให้เลี้ยงสัตว์", user?.pet_permission == null ? null : user.pet_permission ? "อนุญาตแล้ว" : "ยังไม่แน่ใจ"],
    ["จังหวัด", user?.province], ["วันเกิด", date(user?.date_of_birth ?? null)],
  ];
  return <dialog ref={dialog} onCancel={(e) => { e.preventDefault(); if (!saving) onClose(); }} aria-labelledby="applicant-title" className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[840px] overflow-hidden rounded-[34px] border border-[#EADFD9] bg-[#FCFAF8] p-0 font-prompt text-stone-700 shadow-xl backdrop:bg-stone-900/50 backdrop:backdrop-blur-[3px]">
    <div className="flex max-h-[calc(100dvh-2rem)] flex-col" aria-busy={saving}>
      <header className="relative shrink-0 px-6 pb-3 pt-8 text-center sm:px-10 sm:pt-10"><h2 id="applicant-title" className="px-8 font-mali text-xl font-bold sm:text-3xl">รายละเอียดคำขอรับเลี้ยง <span aria-hidden="true">🏡</span></h2><p className="mt-2 text-sm text-[#E88F77]">ตรวจสอบข้อมูลความพร้อมของผู้สมัคร</p><button type="button" className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full border border-[#EBE5E1] bg-[#FFF1EB] text-xl shadow-sm hover:bg-[#FAEAE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9957D] disabled:opacity-50 sm:right-7 sm:top-7" disabled={saving} onClick={onClose} aria-label="ปิดรายละเอียด">×</button></header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 [scrollbar-gutter:stable] sm:px-10 sm:py-7"><div className="mb-7 flex items-center gap-4 rounded-[22px] border border-[#FFE1CA] bg-[#FFF7F2] p-5 shadow-sm"><span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#FAE7DF] text-xl text-[#E88F77]"><i className="fa-solid fa-file-lines" /></span><div className="min-w-0"><h3 className="break-words font-mali text-xl font-bold sm:text-2xl">{user?.full_name || "ไม่ระบุชื่อ"}</h3><p className="mt-1 text-sm text-[#788497]">โทร: <span className="text-stone-700">{user?.phone || "ไม่ระบุ"}</span> | อายุ: <span className="text-stone-700">{age != null && age >= 0 ? age + " ปี" : "ไม่ระบุ"}</span></p></div></div><div className="mb-4"><Badge status={request.match_status} /></div><dl className="grid gap-x-5 gap-y-5 sm:grid-cols-2">{details.map(([title, value]) => <div key={title} className="min-w-0"><dt className="mb-2 text-sm font-medium">{title}</dt><dd className="min-h-14 break-words rounded-2xl border border-[#E5E3E1] bg-white px-5 py-3.5 text-sm leading-6 shadow-sm">{value || "ไม่ระบุ"}</dd></div>)}</dl>{[["ที่อยู่", user?.address], ["รายละเอียดที่พัก", user?.residence_note], ["เหตุผลที่อยากรับเลี้ยง", request.adoption_reason], ...(request.rejection_reason ? [["เหตุผลที่ปฏิเสธ", request.rejection_reason]] : [])].map(([title, value]) => <section key={title} className="mt-5"><h3 className="mb-2 text-sm font-medium">{title}</h3><p className="whitespace-pre-wrap break-words rounded-2xl border border-[#E5E3E1] bg-white px-5 py-4 text-sm leading-7 shadow-sm">{value || "ไม่ระบุ"}</p></section>)}</div>
      <footer className="shrink-0 bg-[#FCFAF8] px-5 pb-6 pt-3 sm:px-10 sm:pb-9">{error && <p role="alert" className="mb-3 max-h-20 overflow-auto text-sm text-rose-700">{error}</p>}<p role="status" className="mb-3 text-center text-xs text-[#788497]">{saving ? "กำลังบันทึก…" : "ยื่นเมื่อ " + date(request.start_date)}</p><div className="grid gap-3 sm:grid-cols-2">{request.match_status === "รออนุมัติ" ? <><button type="button" disabled={saving} className="flex min-h-14 items-center justify-center gap-2 rounded-full border border-[#86EFAC] bg-[#DCFCE7] px-5 py-3 font-semibold text-[#15803D] shadow-sm transition hover:bg-[#BBF7D0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 disabled:opacity-50 sm:min-h-16" onClick={onApprove}><i aria-hidden="true" className="fa-solid fa-check" />อนุมัติคำขอ</button><button type="button" disabled={saving} className="flex min-h-14 items-center justify-center gap-2 rounded-full border-2 border-[#E58084] bg-white px-5 py-3 font-semibold text-[#D8757A] shadow-sm transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:opacity-50 sm:min-h-16" onClick={onReject}><i aria-hidden="true" className="fa-solid fa-xmark" />ปฏิเสธคำขอ</button></> : <button className={button} onClick={onClose}>ปิดรายละเอียด</button>}</div></footer>
    </div>
  </dialog>;
}
