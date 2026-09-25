"use client";

import Link from "next/link";
import Image from "next/image";
import { getAnimalImages } from "@/lib/animalImageHelper";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { accommodation, AdoptionRequest, AnimalSummary, button, careTime, date, input, Pagination } from "../_components/shared";

import ApplicantDialog from "../_components/ApplicantDialog";
import RejectionDialog from "../_components/RejectionDialog";

const criteria = [
  { id: "home", label: "บ้านส่วนตัว", hint: "บ้านของตัวเอง / ครอบครัว", icon: "fa-solid fa-house" },
  { id: "budget", label: "งบ ≥ 3,000 บาท", hint: "งบดูแลต่อเดือน", icon: "fa-solid fa-wallet" },
  { id: "time", label: "มีเวลาว่างมาก", hint: "ตั้งแต่ 4 ชั่วโมงต่อวัน", icon: "fa-regular fa-clock" },
  { id: "pets", label: "ไม่มีสัตว์เลี้ยงเดิม", hint: "สัตว์เลี้ยงปัจจุบัน 0 ตัว", icon: "fa-solid fa-paw" },
] as const;
type Criterion = (typeof criteria)[number]["id"];

export default function AnimalApplicantsPage() {
  return <Suspense fallback={<p role="status" className="p-8 text-center">กำลังโหลดผู้สมัคร…</p>}><ApplicantsRoute /></Suspense>;
}

function ApplicantsRoute() {
  const { animalId } = useParams<{ animalId: string }>();
  const searchParams = useSearchParams();
  const value = searchParams.get("status") || "รออนุมัติ";
  const status = ["รออนุมัติ", "กำลังดูแล", "ปฏิเสธ", "ทั้งหมด"].includes(value) ? value : "รออนุมัติ";
  return <ApplicantsContent key={animalId + status} animalId={animalId} status={status} />;
}

function ApplicantsContent({ animalId, status }: { animalId: string; status: string }) {
  const statusLabel = status === "กำลังดูแล" ? "ผู้ได้รับอนุมัติรับเลี้ยง" : status === "ปฏิเสธ" ? "ผู้สมัครที่ถูกปฏิเสธ" : status === "ทั้งหมด" ? "ผู้สมัครทั้งหมด" : "ผู้ขอที่รอพิจารณา";
  const [items, setItems] = useState<AdoptionRequest[]>([]);
  const [animal, setAnimal] = useState<AnimalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Criterion[]>([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdoptionRequest | null>(null);
  const [rejecting, setRejecting] = useState<AdoptionRequest | null>(null);
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const load = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch(`/api/admin/adoptions?animalId=${encodeURIComponent(animalId)}&status=${encodeURIComponent(status)}`, { signal, cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "โหลดผู้สมัครไม่สำเร็จ");
    return data as { requests: AdoptionRequest[]; animal: AnimalSummary | null };
  }, [animalId, status]);
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then((data) => { if (!controller.signal.aborted) { setItems(data.requests); setAnimal(data.animal); setError(""); } }).catch((e: Error) => { if (!controller.signal.aborted) setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [load]);
  async function retry() {
    setLoading(true);
    try { const data = await load(); setItems(data.requests); setAnimal(data.animal); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "โหลดรายการไม่สำเร็จ"); }
    finally { setLoading(false); }
  }
  async function review(item: AdoptionRequest, status: "กำลังดูแล" | "ปฏิเสธ", reason = "") {
    if (busy.current || item.match_status !== "รออนุมัติ") return;
    busy.current = true; setSaving(true); setActionError(""); setSuccess("");
    try {
      const response = await fetch("/api/admin/adoptions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: item.match_id, status, rejectionReason: reason }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "บันทึกผลไม่สำเร็จ");
      setSuccess(status === "กำลังดูแล" ? `อนุมัติคำขอแล้ว และปิดคำขออื่น ${data.autoRejectedCount ?? 0} รายการ` : "ปฏิเสธคำขอเรียบร้อยแล้ว");
      window.dispatchEvent(new Event("adoptions-reviewed"));
      setItems((current) => status === "กำลังดูแล" ? current.filter((request) => request.animal_id !== item.animal_id) : current.filter((request) => request.match_id !== item.match_id));
      setRejecting(null); setSelected(null);
      try { const updated = await load(); setItems(updated.requests); setAnimal(updated.animal); }
      catch { setError("บันทึกผลแล้ว แต่โหลดรายการล่าสุดไม่สำเร็จ กรุณาโหลดอีกครั้ง"); }
    } catch (e) { setActionError(e instanceof Error ? e.message : "เชื่อมต่อระบบไม่สำเร็จ"); }
    finally { busy.current = false; setSaving(false); }
  }
  const statusItems = items.filter((item) => status === "ทั้งหมด" || item.match_status === status);
  const filtered = statusItems.filter((item) => {
    const query = search.trim().toLocaleLowerCase();
    const matchesSearch = (item.users?.full_name || "").toLocaleLowerCase().includes(query) || (item.users?.phone || "").replace(/\D/g, "").includes(query.replace(/[\s-]/g, ""));
    return matchesSearch && filters.every((key) => key === "home" ? ["house_owned", "townhome_owned"].includes(item.users?.accommodation_type || "") : key === "budget" ? item.monthly_budget != null && item.monthly_budget >= 3000 : key === "time" ? ["4_6", "over_6"].includes(item.care_time || "") : item.users?.animal_count === 0);
  }).sort((a, b) => Date.parse(a.start_date) - Date.parse(b.start_date));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / 10)));
  const visible = filtered.slice((currentPage - 1) * 10, currentPage * 10);
  const oldestId = [...statusItems].sort((a, b) => Date.parse(a.start_date) - Date.parse(b.start_date))[0]?.match_id;
  function actions(item: AdoptionRequest) {
    const actionClass = "inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-xl px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9957D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
    return <div className="flex flex-wrap items-center justify-end gap-2 lg:flex-nowrap">
      <button type="button" className={actionClass + " w-11 bg-[#F3F4F6] text-[#526072] hover:bg-[#E5E7EB]"} disabled={saving} title="ดูรายละเอียด" aria-label={"ดูรายละเอียด " + (item.users?.full_name || "ผู้สมัคร")} onClick={() => { setSelected(item); setActionError(""); }}><i aria-hidden="true" className="fa-solid fa-eye text-sm" /></button>
      {item.match_status === "รออนุมัติ" && <><button type="button" disabled={saving} className={actionClass + " bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]"} onClick={() => void review(item, "กำลังดูแล")}>อนุมัติ</button>
      <button type="button" disabled={saving} className={actionClass + " bg-[#FFF1F2] text-[#E45D6B] hover:bg-[#FFE4E6]"} onClick={() => { setRejecting(item); setActionError(""); }}>ปฏิเสธ</button></>}
    </div>;
  }
  function readiness(item: AdoptionRequest, field?: Criterion) {
    const home = item.users?.accommodation_type;
    const owned = ["house_owned", "townhome_owned"].includes(home || "");
    const homeLabel = owned ? "บ้านส่วนตัว" : home === "house_rented" ? "บ้านเช่า" : home === "townhome_rented" ? "ทาวน์โฮมเช่า" : home === "condo" ? "คอนโด / หอพัก" : home ? accommodation(home) : "ไม่ระบุ";
    const values = {
      home: <span title={accommodation(home ?? null)} className={"inline-flex rounded-lg px-2.5 py-1 text-xs leading-5 " + (owned ? "bg-[#ECFDF3] text-[#15803D]" : "bg-[#F3F4F6] text-[#64748B]")}>{homeLabel}</span>,
      budget: <div><p className={"font-semibold tabular-nums " + (item.monthly_budget == null ? "text-[#8A97AB]" : "text-[#C77C62]")}>{item.monthly_budget == null ? "ไม่ระบุ" : item.monthly_budget.toLocaleString("th-TH") + " บาท"}</p>{item.monthly_budget != null && <p className="mt-1 text-[11px] text-[#8A97AB]">ต่อเดือน</p>}</div>,
      time: <div><p className="text-[#596579]">{item.care_time ? careTime(item.care_time) : "ไม่ระบุ"}</p>{item.care_time && <p className="mt-1 text-[11px] text-[#8A97AB]">ต่อวัน</p>}</div>,
      pets: <span className={"inline-flex rounded-lg px-2.5 py-1 text-xs leading-5 " + (item.users?.animal_count === 0 ? "bg-[#ECFDF3] text-[#15803D]" : "bg-[#F3F4F6] text-[#64748B]")}>{item.users?.animal_count == null ? "ไม่ระบุ" : item.users.animal_count === 0 ? "ไม่มี" : item.users.animal_count + " ตัว"}</span>,
    };
    if (field) return values[field];
    return <dl className="grid grid-cols-2 gap-x-4 gap-y-5 text-xs leading-5">{criteria.map((criterion, index) => <div key={criterion.id} className="min-w-0"><dt className="mb-2 flex items-center gap-2 text-[#8A97AB]"><span aria-hidden="true">{["🏡", "💰", "⏰", "🐾"][index]}</span>{["บ้าน / ที่พัก", "งบประมาณ", "เวลาดูแล", "สัตว์เลี้ยงเดิม"][index]}</dt><dd className="break-words">{values[criterion.id]}</dd></div>)}</dl>;
  }
  function applicantName(item: AdoptionRequest, index: number) {
    return <div className="flex items-center gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FAEAE4] text-sm font-semibold text-[#E88F77]">{(currentPage - 1) * 10 + index + 1}</span>
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="break-words font-mali text-base font-semibold text-[#464340]">{item.users?.full_name || "ไม่ระบุชื่อ"}</h3>{status === "รออนุมัติ" && item.match_id === oldestId && <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF4C9] px-2 py-1 text-[10px] font-medium text-[#A66719]"><i aria-hidden="true" className="fa-regular fa-clock" />เก่าสุด</span>}</div><p className="mt-1 text-xs text-[#8A97AB]">{item.users?.phone || "ไม่ระบุเบอร์โทร"}</p><p className="mt-2 text-[11px] leading-5 text-[#8A97AB]"><i aria-hidden="true" className="fa-regular fa-clock mr-1.5" />ส่งเมื่อ {item.start_date ? <time dateTime={item.start_date}>{date(item.start_date)} · {new Date(item.start_date).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.</time> : "ไม่ระบุ"}</p></div>
    </div>;
  }
  return <main className="min-h-screen bg-[#FCFAF9] px-4 pb-12 pt-4 font-prompt text-[#494541] sm:px-7 lg:px-9">
    <div className="mx-auto max-w-[1500px]">
      <Link href={`/admin/adoptions?status=${encodeURIComponent(status)}`} className="mb-3 inline-flex min-h-11 items-center gap-2 rounded-lg text-xs text-[#7C8594] hover:text-[#C4775E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9957D]"><span aria-hidden="true">←</span> กลับหน้าตรวจสอบคำขอ</Link>
      <h1 className="mb-6 font-mali text-2xl font-bold leading-relaxed text-[#494541] sm:text-3xl">ตรวจสอบคำขอรับเลี้ยง</h1>
      {success && <div role="status" className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-2 text-sm text-green-800"><span>{success}</span><button type="button" aria-label="ปิดข้อความ" className="h-11 w-11 shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600" onClick={() => setSuccess("")}>✕</button></div>}
      {actionError && !selected && !rejecting && <p role="alert" className="mb-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{actionError}</p>}
      {saving && !selected && !rejecting && <p role="status" className="mb-4 text-sm text-[#7C8594]">กำลังบันทึกผลการพิจารณา…</p>}
      {loading ? <div role="status" className="rounded-[30px] border border-[#E2E5EB] bg-white p-8"><p className="text-sm text-[#788497]">กำลังโหลดผู้สมัคร…</p><div aria-hidden="true" className="mt-6 space-y-5 motion-safe:animate-pulse">{[1, 2, 3].map((row) => <div key={row} className="h-24 rounded-2xl bg-[#F5F6F8]" />)}</div></div> : error ? <div role="alert" className="rounded-3xl border border-rose-200 bg-white p-6"><p className="text-sm text-rose-700">{error}</p><button className={button + " mt-4"} onClick={() => void retry()}>โหลดอีกครั้ง</button></div> : <>
        <header className="flex flex-wrap items-center gap-5 rounded-[30px] border border-[#E2E5EB] bg-white p-5 shadow-sm sm:p-8">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[20px] border border-[#EAE4DC] bg-[#FAEAE4]">{animal?.image_url && getAnimalImages(animal.image_url)[0] ? <Image src={getAnimalImages(animal.image_url)[0]} alt={animal.name || "สัตว์ที่เลือก"} width={80} height={80} unoptimized className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-2xl text-[#E88F77]"><i aria-hidden="true" className="fa-solid fa-paw" /></span>}</div>
          <div className="min-w-0 flex-1"><h2 className="break-words font-mali text-2xl font-bold text-[#E98F77] sm:text-3xl">{animal?.name || "ไม่ระบุชื่อ"}</h2><p className="mt-2 text-sm text-[#788497]">{animal ? animal.species + " · " + animal.gender : "ไม่พบข้อมูลสัตว์"}</p></div>
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#F8DC77] bg-[#FFF5CB] px-5 py-2.5 text-xs font-semibold leading-6 text-[#A5570D]"><i aria-hidden="true" className="fa-solid fa-users" /><span>{statusLabel} {statusItems.length} คน (เรียงจากเก่าไปใหม่)</span></div>
        </header>
        {status !== "กำลังดูแล" && status !== "ปฏิเสธ" && <section aria-label="คัดกรองผู้สมัคร" className="my-6 rounded-[26px] border border-[#E2E5EB] bg-white p-4 shadow-sm sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 border-b border-[#F0F1F4] pb-4 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-sm font-medium"><i aria-hidden="true" className="fa-solid fa-filter mr-2 text-[#E9957D]" />คัดกรองปัจจัยสำคัญ (เลือกผสมกันได้):</h2>
            <label className="relative block w-full lg:w-[360px]"><span className="sr-only">ค้นหาชื่อผู้สมัครหรือเบอร์โทร</span><i aria-hidden="true" className="fa-solid fa-magnifying-glass pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#98A2B3]" /><input type="search" className={input + " !min-h-11 !rounded-2xl !border-[#E2E5EB] !bg-[#F9FAFB] !py-2 !pl-11 placeholder:text-[#98A2B3]"} placeholder="ค้นหาชื่อผู้สมัคร, เบอร์โทร..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></label>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">{criteria.map((criterion, index) => <button key={criterion.id} type="button" title={criterion.hint} aria-pressed={filters.includes(criterion.id)} className={"flex min-h-12 min-w-0 items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-xs xl:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9957D] focus-visible:ring-offset-2 " + (filters.includes(criterion.id) ? "border-[#E9957D] bg-[#FFF5EF]" : "border-[#E5E7EB] bg-white hover:border-[#EDBEAE]")} onClick={() => { setFilters((current) => current.includes(criterion.id) ? current.filter((v) => v !== criterion.id) : [...current, criterion.id]); setPage(1); }}><span aria-hidden="true">{["🏡", "💰", "⏰", "🐾"][index]}</span><span className="flex-1">{criterion.label}</span><span aria-hidden="true" className={"grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 " + (filters.includes(criterion.id) ? "border-[#E9957D] bg-[#E9957D] text-white" : "border-[#D1D6DF]")}>{filters.includes(criterion.id) && <i className="fa-solid fa-check text-xs" />}</span><span className="sr-only">{criterion.hint}</span></button>)}</div>
          {(search || filters.length > 0) && <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#788497]"><p role="status">พบ {filtered.length} จาก {statusItems.length} คน · ตรงกับทุกเงื่อนไขที่เลือก</p><button type="button" className="min-h-11 rounded-lg px-3 text-[#B46D54] hover:bg-[#FFF5EF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E9957D]" onClick={() => { setSearch(""); setFilters([]); setPage(1); }}>ล้างการค้นหาและตัวกรอง</button></div>}
        </section>}
        <section aria-labelledby="applicants-heading" className="mt-6 overflow-hidden rounded-[30px] border border-[#E2E5EB] bg-white p-5 shadow-sm sm:p-7 lg:p-8">
          <h2 id="applicants-heading" className="mb-6 font-mali text-xl font-bold sm:text-2xl">{status === "รออนุมัติ" ? "รายชื่อผู้ยื่นคำขอรับเลี้ยง" : statusLabel}</h2>
          {!visible.length ? <div className="px-4 py-12 text-center"><span aria-hidden="true" className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#FAEAE4] text-xl text-[#E9957D]"><i className={statusItems.length === 0 ? "fa-solid fa-check" : "fa-solid fa-magnifying-glass"} /></span><p className="font-medium">{statusItems.length === 0 ? "ไม่มีคำขอในสถานะนี้" : "ไม่พบผู้สมัครที่ตรงกับเงื่อนไข"}</p><p className="mt-2 text-sm text-[#788497]">{statusItems.length === 0 ? "รายชื่อจะแสดงตามสถานะที่เลือกจากหน้ารวม" : "ลองเปลี่ยนคำค้นหาหรือลดเงื่อนไขที่เลือก"}</p></div> : <>
            <div className="hidden lg:block">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="border-y border-[#E9ECF1] bg-[#F9FAFB] text-xs text-[#788497]">
                  <tr>
                    <th scope="col" className="rounded-tl-xl px-4 py-4 font-medium">ผู้สมัคร / เวลาที่ส่ง</th>
                    <th scope="col" className="w-[17%] px-3 py-4 font-medium"><span aria-hidden="true" className="mr-1.5">🏡</span>บ้าน / ที่พัก</th>
                    <th scope="col" className="w-[13%] px-3 py-4 font-medium"><span aria-hidden="true" className="mr-1.5">💰</span>งบประมาณ</th>
                    <th scope="col" className="w-[14%] px-3 py-4 font-medium"><span aria-hidden="true" className="mr-1.5">⏰</span>เวลาดูแล</th>
                    <th scope="col" className="w-[130px] whitespace-nowrap px-3 py-4 font-medium"><span aria-hidden="true" className="mr-1.5">🐾</span>สัตว์เลี้ยงเดิม</th>
                    <th scope="col" className="w-[250px] rounded-tr-xl pl-3 pr-8 py-4 text-right font-medium">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF0F4]">{visible.map((item, index) => <tr key={item.match_id} className="transition-colors hover:bg-[#FFFCFA]">
                  <td className="px-4 py-6">{applicantName(item, index)}</td>
                  {criteria.map((criterion) => <td key={criterion.id} className="break-words px-3 py-6 text-xs leading-5">{readiness(item, criterion.id)}</td>)}
                  <td className="pl-3 pr-8 py-6">{actions(item)}</td>
                </tr>)}</tbody>
              </table>
            </div>
            <div className="space-y-4 lg:hidden">{visible.map((item, index) => <article key={item.match_id} className="rounded-2xl border border-[#E5E7EB] p-4">{applicantName(item, index)}<div className="my-4 rounded-xl bg-[#F9FAFB] p-3">{readiness(item)}</div>{actions(item)}</article>)}</div>
          </>}
          <Pagination page={currentPage} total={filtered.length} size={10} onChange={setPage} />
        </section>
      </>}
      {selected && <ApplicantDialog key={selected.match_id} request={selected} saving={saving} error={rejecting ? "" : actionError} onClose={() => setSelected(null)} onApprove={() => void review(selected, "กำลังดูแล")} onReject={() => { setSelected(null); setRejecting(selected); setActionError(""); }} />}
      {rejecting && <RejectionDialog key={rejecting.match_id} name={rejecting.users?.full_name || "—"} saving={saving} error={actionError} onClose={() => { setRejecting(null); setActionError(""); }} onConfirm={(reason) => void review(rejecting, "ปฏิเสธ", reason)} />}
    </div>
  </main>;
}
