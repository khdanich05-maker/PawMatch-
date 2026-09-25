"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AdoptionRequest, AnimalPhoto, button, date, input, Pagination } from "./_components/shared";

export default function AdminAdoptionsPage() {
  return <Suspense fallback={<p role="status" className="p-8 text-center">กำลังโหลดเคส…</p>}><AdoptionsRoute /></Suspense>;
}

function AdoptionsRoute() {
  const searchParams = useSearchParams();
  const value = searchParams.get("status") || "รออนุมัติ";
  const status = ["รออนุมัติ", "กำลังดูแล", "ปฏิเสธ", "ทั้งหมด"].includes(value) ? value : "รออนุมัติ";
  return <AdoptionsContent key={status} initialStatus={status} />;
}

function AdoptionsContent({ initialStatus }: { initialStatus: string }) {
  const [items, setItems] = useState<AdoptionRequest[]>([]);
  const [filter, setFilter] = useState(initialStatus);
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const refresh = () => fetch("/api/admin/adoptions", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "โหลดรายการไม่สำเร็จ");
        if (!controller.signal.aborted) { setItems(data.requests); setError(""); }
      })
      .catch((e: Error) => { if (!controller.signal.aborted) setError(e.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    void refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("adoptions-reviewed", refresh);
    window.addEventListener("pageshow", refresh);
    return () => { controller.abort(); window.removeEventListener("focus", refresh); window.removeEventListener("adoptions-reviewed", refresh); window.removeEventListener("pageshow", refresh); };
  }, [attempt]);

  const grouped = new Map<string, AdoptionRequest[]>();
  for (const item of items) {
    const group = grouped.get(item.animal_id);
    if (group) group.push(item); else grouped.set(item.animal_id, [item]);
  }
  const cases = [...grouped.entries()].map(([id, requests]) => ({
    id, animal: requests[0].animals, total: requests.length,
    matching: requests.filter((r) => filter === "ทั้งหมด" || r.match_status === filter).length,
    updated: Math.max(...requests.map((r) => Math.max(Date.parse(r.start_date), Date.parse(r.reviewed_at || r.start_date)))),
    oldest: Math.min(...requests.filter((r) => filter === "ทั้งหมด" || r.match_status === filter).map((r) => Date.parse(r.start_date))),
  })).filter((item) => item.matching > 0);
  cases.sort((a, b) => sort === "oldest" ? a.oldest - b.oldest : sort === "count" ? b.total - a.total || b.updated - a.updated : b.updated - a.updated);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(cases.length / 12)));
  const summary = [
    { status: "รออนุมัติ", title: "รอพิจารณา", count: items.filter((r) => r.match_status === "รออนุมัติ").length, unit: "คำขอ", icon: "fa-hourglass-half", color: "bg-amber-50 text-amber-600" },
    { status: "กำลังดูแล", title: "อนุมัติแล้ว", count: items.filter((r) => r.match_status === "กำลังดูแล").length, unit: "คำขอ", icon: "fa-circle-check", color: "bg-emerald-50 text-emerald-600" },
    { status: "ปฏิเสธ", title: "ปฏิเสธแล้ว", count: items.filter((r) => r.match_status === "ปฏิเสธ").length, unit: "คำขอ", icon: "fa-circle-xmark", color: "bg-rose-50 text-rose-500" },
  ];
  return <main className="min-h-screen bg-[#FCFAF8] px-4 py-6 font-prompt text-stone-700 sm:px-6 sm:py-5"><div className="mx-auto max-w-6xl">
    <header className="mb-5"><h1 className="font-mali text-2xl font-semibold sm:text-3xl">ตรวจสอบคำขอรับเลี้ยง</h1><p className="mt-2 text-sm text-stone-500">เลือกเคสเพื่อเปรียบเทียบผู้สมัคร</p></header>
    <div className="grid gap-3 sm:grid-cols-3">{summary.map((item) => <button type="button" key={item.title} aria-pressed={filter === item.status} onClick={() => { setFilter(item.status); setPage(1); }} className={`flex items-center gap-4 rounded-3xl border bg-white p-5 text-left shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E58A70] ${filter === item.status ? "border-[#E58A70] ring-1 ring-[#E58A70]/30" : "border-[#EBE5E1] hover:border-[#E58A70]"}`}><span aria-hidden="true" className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-xl ${item.color}`}><i className={`fa-solid ${item.icon}`} /></span><div><h2 className="text-sm text-stone-500">{item.title}</h2><p className="mt-1 flex items-baseline gap-2"><b className="text-3xl font-semibold tabular-nums">{loading || error ? "—" : item.count}</b><span className="text-xs text-stone-500">{item.unit}</span></p></div></button>)}</div>
    <div className="mb-4 mt-5 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><h2 className="font-mali text-lg font-semibold">{filter === "รออนุมัติ" ? "เคสที่รอการพิจารณา" : "เคสคำขอรับเลี้ยง"}</h2><button className="rounded-full border border-[#EBE5E1] bg-white px-3 py-1.5 text-xs hover:border-[#E58A70]" aria-pressed={filter === "ทั้งหมด"} onClick={() => { setFilter("ทั้งหมด"); setPage(1); }}>ทั้งหมด</button></div><label className="flex items-center gap-2 text-xs text-stone-500">เรียงตาม<select className={`${input} !min-h-10 !w-auto !rounded-full !py-2`} value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}><option value="latest">ล่าสุดก่อน</option><option value="oldest">เก่าที่สุดก่อน</option><option value="count">จำนวนคำขอมากสุด</option></select></label></div>
    {loading ? <p role="status" className="py-10 text-center text-sm text-stone-500">กำลังโหลดเคส…</p> : error ? <div role="alert" className="rounded-2xl border border-rose-200 bg-white p-5"><p>{error}</p><button className={`${button} mt-3`} onClick={() => { setError(""); setLoading(true); setAttempt((v) => v + 1); }}>ลองอีกครั้ง</button></div> : cases.length === 0 ? <div className="rounded-3xl border border-dashed border-[#E4D8D0] bg-white p-8 text-center"><p className="font-medium">ไม่มีเคสในสถานะที่เลือก</p><p className="mt-2 text-sm text-stone-500">เลือกทั้งหมดเพื่อดูเคสสถานะอื่น</p></div> : <div className="space-y-3">{cases.slice((currentPage - 1) * 12, currentPage * 12).map((item) => <Link key={item.id} href={`/admin/adoptions/${encodeURIComponent(item.id)}?status=${encodeURIComponent(filter)}`} className="group flex flex-wrap items-center gap-4 rounded-3xl border border-[#EBE5E1] bg-white p-4 shadow-sm transition hover:border-[#E58A70] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E58A70] sm:p-5">
      <AnimalPhoto animal={item.animal} className="h-16 w-16 shrink-0 rounded-2xl sm:h-20 sm:w-20" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="break-words font-mali text-lg font-semibold text-[#B96C56]">{item.animal?.name || "ไม่ระบุชื่อ"}</h3><span className="rounded-full bg-stone-100 px-2 py-1 text-xs text-stone-600">{item.animal?.species || "ไม่ระบุประเภท"}</span></div><p className="mt-2 text-xs leading-6 text-stone-500">อัปเดตคำขอล่าสุด {date(new Date(item.updated).toISOString())}</p></div><span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-amber-400" />{filter === "ทั้งหมด" ? "ทั้งหมด" : filter === "กำลังดูแล" ? "อนุมัติ" : filter === "ปฏิเสธ" ? "ปฏิเสธ" : "รอพิจารณา"} {item.matching} คำขอ</span><span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full bg-[#FFF0EB] text-xl text-[#D97860]">›</span>
    </Link>)}</div>}
    {!loading && !error && <Pagination page={currentPage} total={cases.length} size={12} onChange={setPage} />}
  </div></main>;
}
