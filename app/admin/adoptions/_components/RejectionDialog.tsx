"use client";

import { useEffect, useRef, useState } from "react";
import { button, input } from "./shared";

export default function RejectionDialog({ name, saving, error, onClose, onConfirm }: { name: string; saving: boolean; error: string; onClose: () => void; onConfirm: (reason: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState("");
  useEffect(() => {
    const element = dialog.current;
    const focus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    const ownsScrollLock = !document.querySelector("dialog[open]");
    element?.showModal();
    if (ownsScrollLock) document.body.style.overflow = "hidden";
    return () => { element?.close(); if (ownsScrollLock) document.body.style.overflow = overflow; focus?.focus(); };
  }, []);
  return <dialog ref={dialog} aria-labelledby="reject-title" onCancel={(e) => { e.preventDefault(); if (!saving) onClose(); }} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[560px] overflow-hidden rounded-[34px] border border-[#EADFD9] bg-[#FCFAF8] p-0 font-prompt text-stone-700 shadow-xl backdrop:bg-stone-900/50 backdrop:backdrop-blur-[3px]"><form className="flex max-h-[calc(100dvh-2rem)] flex-col" onSubmit={(e) => { e.preventDefault(); onConfirm(reason.trim()); }} aria-busy={saving}><header className="shrink-0 px-6 pt-7 sm:px-8 sm:pt-8"><h2 id="reject-title" className="font-mali text-xl font-bold sm:text-2xl"><span aria-hidden="true" className="mr-2 text-[#F16583]">✕</span>ปฏิเสธคำขอรับเลี้ยง</h2><p className="mt-2 break-words text-sm text-stone-500">ผู้สมัคร: {name}</p></header><div className="min-h-0 overflow-y-auto px-6 py-5 sm:px-8"><label htmlFor="reject-reason" className="text-sm font-medium">เหตุผลที่ปฏิเสธ (ไม่บังคับ)</label><textarea id="reject-reason" value={reason} disabled={saving} onChange={(e) => setReason(e.target.value)} className={`${input} mt-2 min-h-28 resize-y !rounded-[20px] !border-[#E2E5EB]`} placeholder="ขอบคุณที่สนใจน้องนะคะ ขณะนี้น้องได้รับการดูแลจากครอบครัวอื่นแล้ว" /><p className="mt-2 text-xs leading-6 text-stone-500">หากระบุเหตุผล ผู้สมัครจะเห็นข้อความนี้ในหน้าสถานะคำขอ</p>{error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}</div><footer className="grid shrink-0 grid-cols-2 gap-3 px-6 pb-7 sm:px-8 sm:pb-8"><button type="button" className={button + " !rounded-full !border-transparent !bg-[#F3F4F6] !text-[#596373]"} disabled={saving} onClick={onClose}>ยกเลิก</button><button type="submit" disabled={saving} className="min-h-12 rounded-full bg-[#D98082] px-4 py-2 text-sm font-medium text-white hover:bg-[#C96C70] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D98082] focus-visible:ring-offset-2 disabled:opacity-50">{saving ? "กำลังบันทึก…" : "ยืนยันปฏิเสธ"}</button></footer></form></dialog>;
}
