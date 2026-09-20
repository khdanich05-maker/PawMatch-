"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import StatusBadge from "@/components/adoptions/StatusBadge";
import { getAllAdoptionRequests, reviewAdoptionRequest } from "@/lib/adoptions/repository";
import type { AdoptionRequest, AdoptionStatus } from "@/lib/adoptions/types";

export default function AdminAdoptionsPage() {
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [filter, setFilter] = useState<AdoptionStatus | "all">("pending");
  const [selected, setSelected] = useState<AdoptionRequest | null>(null);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(() => getAllAdoptionRequests().then(setRequests).catch((cause) => setMessage(cause instanceof Error ? cause.message : "โหลดข้อมูลไม่สำเร็จ")), []);
  useEffect(() => { void load(); }, [load]);
  const visible = useMemo(() => filter === "all" ? requests : requests.filter((item) => item.status === filter), [filter, requests]);

  async function review(status: "approved" | "rejected") {
    if (!selected) return;
    try {
      await reviewAdoptionRequest(selected.id, status, note);
      setMessage(status === "approved" ? "อนุมัติคำขอเรียบร้อยแล้ว" : "บันทึกการไม่อนุมัติแล้ว");
      setSelected(null); setNote(""); await load();
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "บันทึกผลไม่สำเร็จ"); }
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-10">
      <div className="mb-8"><p className="text-sm font-semibold text-primary">ADMIN APPROVAL</p><h1 className="font-mali text-4xl font-semibold">อนุมัติคำขอรับเลี้ยง</h1><p className="mt-2 text-gray-500">ตรวจสอบความพร้อมของผู้สมัครก่อนตัดสินใจจับคู่</p></div>
      {message && <button onClick={() => setMessage("")} className="mb-5 w-full rounded-xl bg-bgAccent p-4 text-left text-sm text-primary">{message} <span className="float-right">×</span></button>}
      <div className="mb-5 flex flex-wrap gap-2">{(["pending", "approved", "rejected", "all"] as const).map((value) => <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === value ? "bg-primary text-white" : "bg-white text-gray-600"}`}>{value === "all" ? "ทั้งหมด" : value === "pending" ? "รอพิจารณา" : value === "approved" ? "อนุมัติแล้ว" : "ไม่อนุมัติ"}</button>)}</div>
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm"><thead className="bg-gray-50 text-gray-500"><tr><th className="p-4">สัตว์</th><th className="p-4">ผู้ขอรับเลี้ยง</th><th className="p-4">ที่พัก</th><th className="p-4">วันที่ส่ง</th><th className="p-4">สถานะ</th><th className="p-4"></th></tr></thead>
          <tbody>{visible.map((request) => <tr key={request.id} className="border-t border-gray-100"><td className="p-4"><strong className="font-itim text-xl">{request.animal_name}</strong><br/><span className="text-gray-400">{request.animal_type}</span></td><td className="p-4">{request.applicant_name}<br/><span className="text-gray-400">{request.phone}</span></td><td className="p-4">{request.housing_type}<br/><span className="text-gray-400">{request.has_fence ? "มีพื้นที่ปลอดภัย" : "ไม่มีรั้ว"}</span></td><td className="p-4">{new Date(request.created_at).toLocaleDateString("th-TH")}</td><td className="p-4"><StatusBadge status={request.status}/></td><td className="p-4"><button onClick={() => { setSelected(request); setNote(request.admin_note || ""); }} className="font-semibold text-primary hover:text-primaryHover">ดูรายละเอียด</button></td></tr>)}</tbody>
        </table>
        {visible.length === 0 && <p className="p-10 text-center text-gray-400">ไม่มีคำขอในสถานะนี้</p>}
      </div>
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><div role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl"><div className="flex justify-between gap-4"><div><p className="text-sm text-primary">คำขอรับเลี้ยง {selected.animal_name}</p><h2 className="font-mali text-3xl font-semibold">{selected.applicant_name}</h2></div><button onClick={() => setSelected(null)} aria-label="ปิด" className="h-10 w-10 rounded-full bg-gray-100 text-xl">×</button></div>
        <div className="mt-6 grid gap-4 rounded-2xl bg-gray-50 p-5 sm:grid-cols-2"><p><span className="block text-xs text-gray-400">อาชีพ</span>{selected.occupation}</p><p><span className="block text-xs text-gray-400">ลักษณะที่พัก</span>{selected.housing_type}</p><p className="sm:col-span-2"><span className="block text-xs text-gray-400">ที่อยู่</span>{selected.address}</p><p><span className="block text-xs text-gray-400">พื้นที่ปลอดภัย</span>{selected.has_fence ? "มี" : "ไม่มี"}</p><p><span className="block text-xs text-gray-400">มีสัตว์เลี้ยงอื่น</span>{selected.has_other_pets ? "มี" : "ไม่มี"}</p></div>
        <div className="mt-5 space-y-4 text-sm"><p><strong>ประสบการณ์:</strong> {selected.experience}</p><p><strong>เหตุผล:</strong> {selected.reason}</p><label className="block font-semibold">หมายเหตุถึงผู้สมัคร<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-gray-200 p-3 font-normal outline-none focus:border-primary" /></label></div>
        {selected.status === "pending" && <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button onClick={() => void review("rejected")} className="rounded-xl border border-rose-200 px-5 py-3 font-semibold text-rose-600 hover:bg-rose-50">ไม่อนุมัติ</button><button onClick={() => void review("approved")} className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700">อนุมัติและจับคู่</button></div>}</div></div>}
    </main>
  );
}

