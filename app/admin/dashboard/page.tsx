"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { loadHistory } from "./history-data";
import styles from "./Dashboard.module.css";
import { categories, dayKey, period, trend, validPeriod, type HistoryItem, type Kind, type Preset } from "./history";

const pageSize = 10;
const inputClass = "w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C07055]/40";
const buttonClass = "rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed";
const columns: Record<Kind, string[]> = {
  reports: ["วันที่แจ้ง", "ประเภทสัตว์", "สถานที่", "ศูนย์ที่รับเรื่อง", "สถานะปัจจุบัน"],
  matches: ["วันที่เริ่ม", "ผู้ดูแล", "สัตว์", "ศูนย์พักพิง", "สถานะปัจจุบัน"],
  care: ["วันที่บันทึก", "สัตว์", "ผู้ดูแล", "ประเภทกิจกรรม", "รายละเอียด", "รูปภาพ"],
};

function dateLabel(value: string) {
  const day = dayKey(value);
  return day ? new Date(`${day}T00:00:00+07:00`).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" }) : "—";
}

function cells(item: HistoryItem): string[] {
  if (item.kind === "reports") return [dateLabel(item.date), item.species, item.location, item.shelter, item.status];
  if (item.kind === "matches") return [dateLabel(item.date), item.caregiver, item.animal, item.shelter, item.status];
  return [dateLabel(item.date), item.animal, item.caregiver, item.activity, item.description];
}

function Photos({ urls }: { urls: string[] }) {
  if (!urls.length) return <span className="text-stone-400">ไม่มีรูปภาพ</span>;
  return <div className="flex flex-wrap gap-2">{urls.map((url, i) => (
    <a key={`${url}-${i}`} href={url} target="_blank" rel="noopener noreferrer" className="rounded-lg focus:ring-2 focus:ring-[#C07055]" aria-label={`เปิดรูปภาพที่ ${i + 1} ในแท็บใหม่`}>
      {/* User-uploaded image URLs can use different storage hosts. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={`รูปประกอบรายการที่ ${i + 1}`} loading="lazy" className="h-16 w-20 rounded-lg border border-stone-100 object-cover" />
    </a>
  ))}</div>;
}

export default function DashboardPage() {
  const [preset, setPreset] = useState<Preset>("month");
  const [range, setRange] = useState(() => period("month"));
  const [shelter, setShelter] = useState("");
  const [kind, setKind] = useState<Kind>("reports");
  const [completedOnly, setCompletedOnly] = useState(false);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [unit, setUnit] = useState<"day" | "month">("day");
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ key: string; items: HistoryItem[]; shelters: { id: string; name: string }[]; updated: string } | null>(null);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const valid = validPeriod(range.start, range.end);
  const requestKey = `${range.start}/${range.end}/${revision}`;
  const error = failure?.key === requestKey && result?.key !== requestKey ? failure.message : "";
  const ready = valid && result?.key === requestKey;
  const loading = valid && !ready && !error;

  useEffect(() => {
    if (!valid) return;
    const controller = new AbortController();
    loadHistory(range.start, range.end, controller.signal).then((data) => {
      if (!controller.signal.aborted) setResult({ ...data, key: requestKey, updated: new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }) });
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setFailure({ key: requestKey, message: cause instanceof Error ? cause.message : "เกิดข้อผิดพลาด กรุณาลองใหม่" });
    });
    return () => controller.abort();
  }, [range.start, range.end, requestKey, valid]);

  useEffect(() => {
    if (selected) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selected]);

  const scoped = useMemo(() => ready ? result.items.filter((item) => !shelter || item.shelterId === shelter) : [], [ready, result, shelter]);
  const activeItems = scoped.filter((item) => item.kind === kind
    && (!completedOnly || ["อนุมัติ", "ปฏิเสธ"].includes(item.status)));
  const statuses = [...new Set(activeItems.map((item) => item.status).filter(Boolean))].sort((a, b) => a.localeCompare(b, "th"));
  const filtered = activeItems.filter((item) => !status || (status === "__empty" ? !item.status : item.status === status));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const longPeriod = valid && Date.parse(range.end) - Date.parse(range.start) > 366 * 86400000;
  const chartUnit = longPeriod ? "month" : unit;
  const chart = useMemo(() => ready ? trend(scoped, range.start, range.end, chartUnit) : [], [scoped, range.start, range.end, chartUnit, ready]);
  const max = Math.max(2, ...chart.flatMap((bucket) => categories.map((category) => bucket[category.key])));
  const chartMax = Math.ceil(max / 2) * 2;
  const selectKind = (next: Kind | "completed") => {
    setKind(next === "completed" ? "matches" : next);
    setCompletedOnly(next === "completed");
    setStatus("");
    setPage(1);
  };
  const changeRange = (next: typeof range) => { setRange(next); setStatus(""); setPage(1); };

  return (
    <main className="mx-auto min-h-[75vh] max-w-7xl px-4 py-8 font-prompt text-stone-700 sm:px-6 sm:py-12">
      <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-widest text-[#98654f]">GOHOME / REPORTS & HISTORY</p>
          <h1 className="font-mali text-2xl font-semibold sm:text-3xl">รายงานและประวัติย้อนหลัง</h1>
          <p className="mt-2 text-sm text-stone-500">ติดตามการแจ้งพบสัตว์ การจับคู่ และการดูแลในช่วงเวลาที่คุณเลือก</p>
        </div>
        <button type="button" disabled={loading || !valid} onClick={() => { setRevision((value) => value + 1); setPage(1); }} className="rounded-xl bg-[#C07055] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#a85d44] disabled:opacity-50">{loading ? "กำลังโหลด..." : "โหลดข้อมูลใหม่"}</button>
      </header>

      <section aria-label="ตัวกรองประวัติ" className="mb-6 rounded-2xl border border-[#f1e4dc] bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-2 text-sm font-medium"><span>ช่วงเวลา</span>
            <select className={inputClass} value={preset} onChange={(event) => { const next = event.target.value as Preset; setPreset(next); if (next !== "custom") changeRange(period(next)); }}>
              <option value="today">วันนี้</option><option value="week">7 วันล่าสุด</option><option value="month">เดือนนี้</option><option value="year">ปีนี้</option><option value="custom">กำหนดวันเริ่ม–สิ้นสุด</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium"><span>ศูนย์พักพิง</span>
            <select className={inputClass} value={shelter} onChange={(event) => { setShelter(event.target.value); setStatus(""); setPage(1); }}>
              <option value="">ทุกศูนย์</option>{result?.shelters.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium"><span>ประเภทข้อมูล</span>
            <select className={inputClass} value={completedOnly ? "completed" : kind} onChange={(event) => selectKind(event.target.value as Kind | "completed")}>
              {categories.map((category) => <option key={category.key} value={category.key}>{category.label}</option>)}
              <option value="completed">คำขอที่เสร็จสิ้นแล้ว</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium"><span>สถานะปัจจุบัน</span>
            <select className={inputClass} value={status} disabled={!ready || !statuses.length} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
              <option value="">{kind === "care" ? "ไม่มีสถานะ" : ready && !statuses.length ? "ไม่มีสถานะในข้อมูลช่วงนี้" : "ทุกสถานะ"}</option>
              {statuses.map((value) => <option key={value} value={value}>{value}</option>)}
              {status && status !== "__empty" && !statuses.includes(status) && <option value={status}>{status} (ไม่พบรายการ)</option>}
              {activeItems.some((item) => !item.status) && <option value="__empty">ไม่ระบุสถานะ</option>}
            </select>
          </label>
        </div>
        {completedOnly && <p className="mt-4 text-sm text-stone-500">แสดงคำขอจับคู่ที่พิจารณาแล้ว (อนุมัติ / ปฏิเสธ) ตามวันที่เริ่มคำขอในช่วงที่เลือก ไม่ได้หมายถึงการดูแลสัตว์สิ้นสุดแล้ว</p>}
        {preset === "custom" && <div className="mt-4 grid max-w-xl gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm"><span>วันเริ่มต้น</span><input type="date" value={range.start} max={range.end || undefined} className={inputClass} onChange={(event) => changeRange({ ...range, start: event.target.value })} /></label>
          <label className="space-y-2 text-sm"><span>วันสิ้นสุด</span><input type="date" value={range.end} min={range.start || undefined} className={inputClass} onChange={(event) => changeRange({ ...range, end: event.target.value })} /></label>
        </div>}
        {!valid ? <p role="alert" className="mt-3 text-sm text-red-600">กรุณาระบุวันที่ให้ครบ โดยวันเริ่มต้นต้องไม่เกินวันสิ้นสุด</p>
          : <p className="mt-4 text-xs text-stone-500">{dateLabel(range.start)} – {dateLabel(range.end)} · รวมวันเริ่มต้นและวันสิ้นสุดตามเวลาไทย</p>}
      </section>

      <p className="mb-4 text-xs text-stone-500">การ์ดและกราฟสรุปทุกสถานะตามช่วงเวลาและศูนย์ที่เลือก · ประเภทข้อมูลและสถานะใช้กรองตารางประวัติ</p>
      <section aria-label="สรุปกิจกรรมในช่วงเวลาที่เลือก" aria-busy={loading} className={styles.summaryCards}>
        {categories.map((category) => <article key={category.key} className="rounded-2xl border border-[#f1e4dc] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-medium"><span className="h-2.5 w-2.5 rounded-full" style={{ background: category.color }} />{category.key === "matches" ? "รายการจับคู่" : category.key === "care" ? "บันทึกการดูแล" : category.label}</div>
          <strong className="font-mali text-4xl" style={{ color: category.color }}>{ready ? scoped.filter((item) => item.kind === category.key).length.toLocaleString("th-TH") : "—"}</strong>
          <span className="ml-2 text-xs text-stone-400">รายการ</span><p className="mt-3 text-xs text-stone-500">{category.note}</p>
        </article>)}
      </section>

      <div role="status" className="my-4 text-xs text-stone-500">{loading ? "กำลังโหลดข้อมูลประวัติ..." : ready ? `อัปเดตล่าสุด: ${result.updated} (เวลาไทย)` : ""}</div>
      {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p className="font-semibold">โหลดข้อมูลไม่สำเร็จ กรุณากดโหลดข้อมูลใหม่</p><p className="mt-1 break-words">{error}</p></div>}
      <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">สถานะที่แสดงคือสถานะปัจจุบันของรายการ ไม่ใช่สถานะ ณ วันที่เลือก เช่น รายงานที่แจ้งเดือนก่อนและอนุมัติวันนี้ จะปรากฏว่าอนุมัติแล้วเมื่อดูประวัติเดือนก่อน</p>

      <section className="overflow-hidden rounded-2xl border border-[#f1e4dc] bg-white shadow-sm" aria-label="ตารางประวัติ">
        <div id="history-panel" aria-busy={loading}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">ประวัติ{categories.find((category) => category.key === kind)?.label} เรียงใหม่สุดก่อน</caption>
              <thead className="bg-stone-50 text-xs text-stone-500"><tr>{[...columns[kind], "ดูรายละเอียด"].map((column) => <th key={column} scope="col" className="whitespace-nowrap px-5 py-4 font-medium">{column}</th>)}</tr></thead>
              <tbody className="divide-y divide-stone-100">
                {!ready || !visible.length ? <tr><td colSpan={columns[kind].length + 1} className="px-5 py-16 text-center text-stone-500">{!valid ? "กรุณาเลือกช่วงวันที่ที่ถูกต้อง" : loading ? "กำลังโหลดข้อมูล..." : error ? "ไม่สามารถแสดงประวัติได้ กรุณาลองโหลดข้อมูลใหม่" : status ? "ไม่พบข้อมูลในช่วงเวลาที่เลือกและสถานะนี้" : "ไม่พบข้อมูลในช่วงเวลาที่เลือก"}</td></tr>
                  : visible.map((item) => <tr key={item.id} className="align-top hover:bg-[#FDF0EB]/20">
                    {cells(item).map((value, i) => <td key={i} className="min-w-28 max-w-64 break-words px-5 py-4"><span className={kind === "care" && i === 4 ? "line-clamp-3" : ""}>{value || "—"}</span></td>)}
                    {kind === "care" && <td className="min-w-28 px-5 py-4"><Photos urls={item.images.slice(0, 1)} />{item.images.length > 1 && <span className="mt-1 block text-xs text-stone-400">ทั้งหมด {item.images.length} รูป</span>}</td>}
                    <td className="whitespace-nowrap px-5 py-4"><button type="button" onClick={() => setSelected(item)} className="font-medium text-[#A85D44] underline underline-offset-4" aria-label={`ดูรายละเอียดรายการ ${item.id}`}>ดูรายละเอียด</button></td>
                  </tr>)}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 p-4 text-xs text-stone-500">
            <p>{ready ? `ทั้งหมด ${filtered.length.toLocaleString("th-TH")} รายการ · หน้า ${currentPage} / ${pages} · ${pageSize} รายการต่อหน้า` : "—"}</p>
            <div className="flex gap-2"><button type="button" className={buttonClass} disabled={!ready || currentPage <= 1} onClick={() => setPage(currentPage - 1)}>ก่อนหน้า</button><button type="button" className={buttonClass} disabled={!ready || currentPage >= pages} onClick={() => setPage(currentPage + 1)}>ถัดไป</button></div>
          </div>
        </div>
      </section>

      <section aria-label="กราฟแนวโน้มกิจกรรม" className="mt-6 rounded-2xl border border-[#f1e4dc] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-mali text-lg font-semibold">แนวโน้มกิจกรรม</h2><label className="flex items-center gap-2 text-sm">แสดงเป็น<select aria-label="ความละเอียดของกราฟ" className={inputClass} value={chartUnit} disabled={longPeriod} onChange={(event) => setUnit(event.target.value as "day" | "month")}><option value="day">รายวัน</option><option value="month">รายเดือน</option></select></label></div>
        {longPeriod && <p className="mt-2 text-xs text-stone-500">ช่วงเวลามากกว่า 366 วัน แสดงเป็นรายเดือนเพื่อให้อ่านกราฟได้ชัดเจน</p>}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">{categories.map((category) => <span className="flex items-center gap-2" key={category.key}><span className="h-2.5 w-2.5 rounded-full" style={{ background: category.color }} />{category.label}</span>)}</div>
        {!ready ? <p className="py-12 text-center text-sm text-stone-500">{loading ? "กำลังโหลดกราฟ..." : "กราฟจะแสดงเมื่อโหลดข้อมูลสำเร็จและช่วงวันที่ถูกต้อง"}</p> : <>
          {!scoped.length && <p className="mt-6 text-center text-sm text-stone-500">ไม่พบข้อมูลในช่วงเวลาที่เลือก</p>}
          <div className="mt-5 overflow-x-auto">
            <svg viewBox="0 0 900 235" className="h-60 w-full min-w-[600px]" role="img" aria-label={`จำนวนกิจกรรม${chartUnit === "day" ? "รายวัน" : "รายเดือน"} ดูค่าตัวเลขได้ในตารางใต้กราฟ`}>
              {[0, 0.5, 1].map((fraction) => <g key={fraction}><line x1="45" x2="875" y1={195 - fraction * 170} y2={195 - fraction * 170} stroke="#eee9e5" /><text x="36" y={199 - fraction * 170} textAnchor="end" fontSize="11" fill="#78716c">{chartMax * fraction}</text></g>)}
              {categories.map((category) => <g key={category.key}>
                <polyline fill="none" stroke={category.color} strokeWidth="2" strokeDasharray={category.key === "care" ? "5 3" : undefined} points={chart.map((bucket, i) => `${45 + i * 830 / Math.max(1, chart.length - 1)},${195 - bucket[category.key] / chartMax * 170}`).join(" ")} />
                {chart.map((bucket, i) => <circle key={bucket.key} cx={45 + i * 830 / Math.max(1, chart.length - 1)} cy={195 - bucket[category.key] / chartMax * 170} r={chart.length > 60 ? 2 : 3} fill={category.color}><title>{bucket.key} · {category.label}: {bucket[category.key]} รายการ</title></circle>)}
              </g>)}
              {chart.filter((_, i) => i === 0 || i === chart.length - 1 || i % Math.max(1, Math.ceil(chart.length / 6)) === 0).map((bucket) => <text key={bucket.key} x={45 + chart.indexOf(bucket) * 830 / Math.max(1, chart.length - 1)} y="222" textAnchor="middle" fontSize="10" fill="#78716c">{bucket.key}</text>)}
            </svg>
          </div>
          <details className="mt-3 text-sm"><summary className="cursor-pointer text-[#A85D44]">ดูตัวเลขประกอบกราฟ</summary><div className="mt-3 max-h-64 overflow-auto"><table className="w-full text-left text-xs"><thead><tr><th className="p-2">{chartUnit === "day" ? "วันที่" : "เดือน"}</th>{categories.map((category) => <th className="p-2" key={category.key}>{category.label}</th>)}</tr></thead><tbody>{chart.map((bucket) => <tr key={bucket.key} className="border-t border-stone-100"><td className="p-2">{bucket.key}</td>{categories.map((category) => <td className="p-2" key={category.key}>{bucket[category.key]}</td>)}</tr>)}</tbody></table></div></details>
        </>}
      </section>

      <dialog ref={dialog} onClose={() => setSelected(null)} onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }} aria-labelledby="history-detail-title" className={`${styles.detailsDialog} rounded-2xl border border-stone-200 bg-white p-0 text-stone-700 shadow-xl backdrop:bg-black/40`}>
        {selected && <div className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4"><div><h2 id="history-detail-title" className="font-mali text-xl font-semibold">รายละเอียด{categories.find((category) => category.key === selected.kind)?.label}</h2><p className="mt-1 break-all text-xs text-stone-400">รหัสรายการ {selected.id}</p></div><button type="button" autoFocus onClick={() => setSelected(null)} className={buttonClass}>ปิด</button></div>
          <dl className="grid gap-4 sm:grid-cols-2">{[
            ["วันที่", dateLabel(selected.date)], ["ศูนย์พักพิง", selected.shelter],
            ...(selected.kind === "reports" ? [["ประเภทสัตว์", selected.species], ["สถานที่", selected.location]] : [["สัตว์", selected.animal], ["ผู้ดูแล", selected.caregiver]]),
            ...(selected.kind === "care" ? [["ประเภทกิจกรรม", selected.activity]] : [["สถานะปัจจุบัน", selected.status]]),
            ...selected.details,
          ].map(([label, value]) => <div key={label}><dt className="text-xs text-stone-500">{label}</dt><dd className="mt-1 break-words text-sm">{value || "—"}</dd></div>)}</dl>
          {selected.kind !== "reports" && <><h3 className="mb-2 mt-5 text-xs text-stone-500">{selected.kind === "matches" ? "เหตุผลที่ขอรับเลี้ยง" : "รายละเอียดเพิ่มเติม"}</h3><p className="whitespace-pre-wrap break-words text-sm">{selected.description || "ไม่มีรายละเอียดเพิ่มเติม"}</p></>}
          <h3 className="mb-2 mt-5 text-xs text-stone-500">รูปภาพ</h3><Photos urls={selected.images} />
        </div>}
      </dialog>
    </main>
  );
}
