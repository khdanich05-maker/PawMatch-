"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { getAnimalImages } from "@/lib/animalImageHelper";

type Status = "pending" | "approved" | "rejected";
type AnimalCase = { id: string; name: string; species: string; gender: string; image: string };
type Applicant = {
  id: string; animalId: string; name: string; phone: string; submittedAt: string;
  accommodation: string; ownHouse: boolean; budget: number; careTime: string;
  hasTime: boolean; petCount: number; familyMembers: number; reason: string;
  status: Status; rejectionReason?: string; address?: string; province?: string;
  petPermission?: boolean; residenceNote?: string;
};
type Filters = { ownHouse: boolean; budget: boolean; time: boolean; noPets: boolean };
const emptyFilters: Filters = { ownHouse: false, budget: false, time: false, noPets: false };
const statusLabels: Record<Status, string> = { pending: "รอพิจารณา", approved: "อนุมัติแล้ว", rejected: "ไม่อนุมัติ" };
const defaultAnimalCases: AnimalCase[] = [
  { id: "mali", name: "น้องมะลิ", species: "หมาพันธุ์ทาง", gender: "เพศเมีย", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80" },
  { id: "cola", name: "น้องโคล่า", species: "สุนัข", gender: "เพศผู้", image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=200&q=80" },
];
// ข้อมูลสมมติสำหรับทดสอบ UI ไม่มีการอ่านหรือเขียน Supabase
const initialApplicants: Applicant[] = [
  { id:"m1", animalId:"mali", name:"วิชัย ใจบุญ (ชัย)", phone:"080-000-0001", submittedAt:"2026-09-20T09:00:00+07:00", accommodation:"บ้านเช่า (เจ้าของอนุญาตให้เลี้ยงสัตว์)", ownHouse:false, budget:1500, careTime:"1–3 ชั่วโมง", hasTime:false, petCount:2, familyMembers:2, reason:"อยากรับน้องมาเป็นสมาชิกในครอบครัว และพร้อมแบ่งเวลาดูแลทุกวันครับ", status:"pending" },
  { id:"m2", animalId:"mali", name:"กัญญา รักสงบ (กัญ)", phone:"080-000-0002", submittedAt:"2026-09-20T15:00:00+07:00", accommodation:"บ้านส่วนตัว", ownHouse:true, budget:2500, careTime:"ตลอดเวลา", hasTime:true, petCount:0, familyMembers:3, reason:"อยู่บ้านเป็นประจำ พร้อมดูแลและพาไปพบสัตวแพทย์ค่ะ", status:"pending" },
  { id:"m3", animalId:"mali", name:"ก้อย รักสัตว์", phone:"080-000-0003", submittedAt:"2026-09-21T06:00:00+07:00", accommodation:"บ้านส่วนตัว", ownHouse:true, budget:3000, careTime:"เกือบตลอดเวลา", hasTime:true, petCount:1, familyMembers:2, reason:"มีประสบการณ์เลี้ยงสุนัข อยากให้น้องได้อยู่ในบ้านที่อบอุ่นค่ะ", status:"pending" },
  { id:"m4", animalId:"mali", name:"ใจดี รักสัตว์ (แอน)", phone:"080-000-0004", submittedAt:"2026-09-21T09:00:00+07:00", accommodation:"ทาวน์โฮมส่วนตัว", ownHouse:true, budget:2000, careTime:"4–8 ชั่วโมง", hasTime:false, petCount:0, familyMembers:4, reason:"ที่บ้านมีพื้นที่และทุกคนพร้อมต้อนรับน้องค่ะ", status:"pending" },
  { id:"m5", animalId:"mali", name:"สมชาย ปลอดภัย", phone:"080-000-0005", submittedAt:"2026-09-21T10:00:00+07:00", accommodation:"บ้านส่วนตัว", ownHouse:true, budget:4000, careTime:"ตลอดเวลา", hasTime:true, petCount:0, familyMembers:2, reason:"มีสนามหญ้าให้น้องวิ่งเล่น และเตรียมค่าใช้จ่ายไว้แล้วครับ", status:"pending" },
  { id:"m6", animalId:"mali", name:"มีนา พาเพลิน", phone:"080-000-0006", submittedAt:"2026-09-21T10:15:00+07:00", accommodation:"คอนโด (อนุญาตให้เลี้ยงสัตว์)", ownHouse:false, budget:2500, careTime:"3–5 ชั่วโมง", hasTime:false, petCount:1, familyMembers:1, reason:"พร้อมพาน้องเดินเล่นทุกวัน และจัดพื้นที่พักผ่อนให้น้องค่ะ", status:"pending" },
  { id:"m7", animalId:"mali", name:"อารีย์ ใจดี", phone:"080-000-0007", submittedAt:"2026-09-21T10:40:00+07:00", accommodation:"บ้านส่วนตัว", ownHouse:true, budget:3500, careTime:"ตลอดเวลา", hasTime:true, petCount:0, familyMembers:3, reason:"พร้อมต้อนรับสมาชิกใหม่ ทุกคนในครอบครัวเห็นด้วยค่ะ", status:"pending" },
  { id:"c1", animalId:"cola", name:"ธนา เมตตา", phone:"080-000-0008", submittedAt:"2026-09-21T11:00:00+07:00", accommodation:"บ้านส่วนตัว", ownHouse:true, budget:3500, careTime:"ตลอดเวลา", hasTime:true, petCount:0, familyMembers:2, reason:"อยากดูแลน้องระยะยาวและพร้อมติดตามสุขภาพอย่างสม่ำเสมอครับ", status:"pending" },
  { id:"c2", animalId:"cola", name:"พิมพ์ ใจอารี", phone:"080-000-0009", submittedAt:"2026-09-21T12:00:00+07:00", accommodation:"บ้านเช่า (เจ้าของอนุญาตให้เลี้ยงสัตว์)", ownHouse:false, budget:2000, careTime:"4–6 ชั่วโมง", hasTime:false, petCount:1, familyMembers:3, reason:"เคยดูแลสุนัขและอยากให้น้องมีเพื่อนเล่นที่บ้านค่ะ", status:"pending" },
  { id:"c3", animalId:"cola", name:"ณัฐ ดูแลดี", phone:"080-000-0010", submittedAt:"2026-09-21T13:00:00+07:00", accommodation:"บ้านส่วนตัว", ownHouse:true, budget:4000, careTime:"เกือบตลอดเวลา", hasTime:true, petCount:0, familyMembers:2, reason:"ทำงานที่บ้านและมีเวลาอยู่กับน้องครับ", status:"pending" },
];
const formatDate = (value: string) => new Intl.DateTimeFormat("th-TH", { dateStyle:"medium", timeStyle:"short", timeZone:"Asia/Bangkok" }).format(new Date(value));
const money = (value: number) => value.toLocaleString("th-TH");

function Photo({ animal }: { animal: AnimalCase }) {
  const [failed, setFailed] = useState(false);
  return <span className="review-photo">{failed ? <span aria-label={animal.species} role="img">🐾</span> :
    // eslint-disable-next-line @next/next/no-img-element
    <img src={animal.image} alt={animal.name} onError={() => setFailed(true)} />}</span>;
}

function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  return <dialog className="review-modal" ref={ref} aria-labelledby="review-modal-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <button type="button" className="modal-close" aria-label="ปิดหน้าต่าง" onClick={onClose}>×</button>
    {children}
  </dialog>;
}

export default function AdminAdoptionsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [animalCases, setAnimalCases] = useState<AnimalCase[]>([]);
  const [dataError, setDataError] = useState("");
  const [animalId, setAnimalId] = useState<string | null>(null);
  const [animalSearch, setAnimalSearch] = useState("");
  const [sort, setSort] = useState("oldest");
  const [dashboardStatus, setDashboardStatus] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"detail" | "approved" | "rejected">("detail");
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");
  const sectionRef = useRef<HTMLHeadingElement>(null);
  const activeAnimal = animalCases.find((animal) => animal.id === animalId);
  const selected = applicants.find((applicant) => applicant.id === selectedId);
  const selectedAnimal = animalCases.find((animal) => animal.id === selected?.animalId);
  const pendingCount = applicants.filter((applicant) => applicant.status === "pending").length;
  const approvedCount = applicants.filter((applicant) => applicant.status === "approved").length;
  const rejectedCount = applicants.filter((applicant) => applicant.status === "rejected").length;
  const approvedForAnimal = (id: string) => applicants.some((applicant) => applicant.animalId === id && applicant.status === "approved");
  const animalApplicants = applicants.filter((applicant) => applicant.animalId === animalId).sort((a,b) => Date.parse(a.submittedAt) - Date.parse(b.submittedAt));
  const oldestPendingId = animalApplicants.find((applicant) => applicant.status === "pending")?.id;
  const filteredApplicants = animalApplicants.filter((applicant) => {
    const query = search.trim().toLocaleLowerCase();
    const digits = query.replace(/\D/g, "");
    const matchesSearch = !query || applicant.name.toLocaleLowerCase().includes(query) || (digits.length > 0 && applicant.phone.replace(/\D/g, "").includes(digits));
    return matchesSearch && (statusFilter === "all" || applicant.status === statusFilter)
      && (!filters.ownHouse || applicant.ownHouse) && (!filters.budget || applicant.budget >= 3000)
      && (!filters.time || applicant.hasTime) && (!filters.noPets || applicant.petCount === 0);
  });
  const oldestRequest = (id: string) => {
    const entries = applicants.filter((applicant) => applicant.animalId === id && applicant.status === "pending");
    const source = entries.length ? entries : applicants.filter((applicant) => applicant.animalId === id);
    return Math.min(...source.map((applicant) => Date.parse(applicant.submittedAt)));
  };
  const visibleAnimals = animalCases
    .filter((animal) => animal.name.includes(animalSearch.trim()))
    .filter((animal) => dashboardStatus === "all" || applicants.some((applicant) => applicant.animalId === animal.id && applicant.status === dashboardStatus))
    .sort((a,b) => sort === "oldest" ? oldestRequest(a.id) - oldestRequest(b.id) : oldestRequest(b.id) - oldestRequest(a.id));

  useEffect(() => { sectionRef.current?.focus({ preventScroll: true }); }, [animalId]);
  useEffect(() => {
    fetch("/api/admin/adoptions").then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const requests = data.requests || [];
      const nextAnimals = new Map<string, AnimalCase>();
      const nextApplicants = requests.map((item: any) => {
        const animal = Array.isArray(item.animals) ? item.animals[0] : item.animals;
        const user = Array.isArray(item.users) ? item.users[0] : item.users;
        const image = getAnimalImages(animal?.image_url)[0];
        const careLabels: Record<string, string> = { under_2:"น้อยกว่า 2 ชั่วโมง", "2_4":"2–4 ชั่วโมง", "4_6":"4–6 ชั่วโมง", over_6:"มากกว่า 6 ชั่วโมง" };
        nextAnimals.set(item.animal_id, { id: item.animal_id, name: animal?.name || "สัตว์", species: animal?.species || "", gender: animal?.gender || "", image });
        return { id:item.match_id, animalId:item.animal_id, name:user?.full_name || user?.username || "ไม่ระบุชื่อ", phone:user?.phone || "-", submittedAt:item.start_date, accommodation:user?.accommodation_type || "-", ownHouse:Boolean(user?.pet_permission), budget:Number(item.monthly_budget || 0), careTime:careLabels[item.care_time] || item.care_time || "-", hasTime:["4_6", "over_6"].includes(item.care_time), petCount:Number(user?.animal_count || 0), familyMembers:Number(item.family_members || 0), reason:item.adoption_reason || "-", status:item.match_status === "อนุมัติ" ? "approved" : item.match_status === "ปฏิเสธ" ? "rejected" : "pending", rejectionReason:item.rejection_reason || undefined, address:user?.address || "-", province:user?.province || "-", petPermission:Boolean(user?.pet_permission), residenceNote:user?.residence_note || "-" } as Applicant;
      });
      setAnimalCases(Array.from(nextAnimals.values()));
      setApplicants(nextApplicants);
    }).catch((error: Error) => { setDataError(error.message || "ไม่สามารถอ่านคำขอได้"); setAnimalCases([]); setApplicants([]); });
  }, []);
  function openAnimal(id: string) { setAnimalId(id); resetFilters(); setNotice(""); }
  function resetFilters() { setSearch(""); setFilters(emptyFilters); setStatusFilter("pending"); }
  function openApplicant(id: string, nextMode: typeof mode) { setSelectedId(id); setMode(nextMode); setReason(""); }
  function closeModal() { setSelectedId(null); setReason(""); }
  async function confirmDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || selected.status !== "pending" || mode === "detail") return;
    if (mode === "approved" && approvedForAnimal(selected.animalId)) return;
    if (mode === "rejected" && !reason.trim()) return;
    const decision = mode;
    const response = await fetch("/api/admin/adoptions", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ matchId:selected.id, action:decision === "approved" ? "approve" : "reject", reason:reason.trim() }) });
    const data = await response.json();
    if (!response.ok) { setNotice(data.error || "บันทึกผลไม่สำเร็จ"); return; }
    setApplicants((previous) => previous.map((applicant) => {
      if (applicant.id === selected.id) return { ...applicant, status: decision, rejectionReason: decision === "rejected" ? reason.trim() : undefined };
      if (decision === "approved" && applicant.animalId === selected.animalId && applicant.status === "pending") return { ...applicant, status: "rejected", rejectionReason: "สัตว์ตัวนี้ได้รับการอนุมัติให้ผู้สมัครรายอื่นแล้ว" };
      return applicant;
    }));
    setNotice(`${decision === "approved" ? "อนุมัติ" : "ไม่อนุมัติ"}คำขอของ ${selected.name} แล้ว`);
    closeModal();
  }

  return <div className="adoption-review">
      <div className="review-content">
        <header className="page-heading">
          <Link href="/admin/profile" className="profile-link"><i className="fa-solid fa-arrow-left" aria-hidden="true" /> กลับโปรไฟล์แอดมิน</Link>
          <div className="title-row">
            <div>
              <h1>ตรวจสอบคำขอรับเลี้ยง</h1>
            </div>
            {activeAnimal && <button type="button" className="back-button" onClick={() => setAnimalId(null)}>← กลับรายการสัตว์</button>}
          </div>
        </header>
        {dataError && <div className="notice error-banner" role="alert"><span>{dataError}</span></div>}
        {notice && <p className="notice" role="status">{notice}</p>}
        {!activeAnimal ? <>
          <div className="summary-grid" aria-label="กรองรายการคำขอตามสถานะ">
            <button type="button" className={`summary-card ${dashboardStatus === "pending" ? "selected" : ""}`} aria-pressed={dashboardStatus === "pending"} onClick={() => setDashboardStatus((current) => current === "pending" ? "all" : "pending")}><span className="summary-icon amber"><i className="fa-solid fa-hourglass-half" aria-hidden="true" /></span><div><p>คำขอรอพิจารณา</p><strong>{pendingCount}</strong><small> คำขอ</small></div></button>
            <button type="button" className={`summary-card ${dashboardStatus === "approved" ? "selected" : ""}`} aria-pressed={dashboardStatus === "approved"} onClick={() => setDashboardStatus((current) => current === "approved" ? "all" : "approved")}><span className="summary-icon green"><i className="fa-solid fa-circle-check" aria-hidden="true" /></span><div><p>คำขอที่อนุมัติ</p><strong>{approvedCount}</strong><small> คำขอ</small></div></button>
            <button type="button" className={`summary-card ${dashboardStatus === "rejected" ? "selected" : ""}`} aria-pressed={dashboardStatus === "rejected"} onClick={() => setDashboardStatus((current) => current === "rejected" ? "all" : "rejected")}><span className="summary-icon rose"><i className="fa-solid fa-circle-xmark" aria-hidden="true" /></span><div><p>คำขอที่ปฏิเสธ</p><strong>{rejectedCount}</strong><small> คำขอ</small></div></button>
          </div>
          <div className="list-heading"><h2 ref={sectionRef} tabIndex={-1}>{dashboardStatus === "all" ? "รายการคำขอแยกตามสัตว์" : `รายการ${statusLabels[dashboardStatus]}แยกตามสัตว์`}</h2><div className="list-tools">{dashboardStatus !== "all" && <button type="button" className="clear-status" onClick={() => setDashboardStatus("all")}>แสดงทั้งหมด</button>}<input aria-label="ค้นหาชื่อสัตว์" placeholder="ค้นหาชื่อสัตว์..." value={animalSearch} onChange={(event) => setAnimalSearch(event.target.value)} /><select aria-label="เรียงรายการสัตว์ตามคำขอที่รอเก่าที่สุด" value={sort} onChange={(event) => setSort(event.target.value)}><option value="oldest">คำขอเก่าที่สุดขึ้นก่อน</option><option value="newest">คำขอเก่าที่สุดขึ้นท้าย</option></select></div></div>
          <div className="animal-list">
            {visibleAnimals.map((animal) => {
              const pending = applicants.filter((applicant) => applicant.animalId === animal.id && applicant.status === "pending").length;
              return <button type="button" className="animal-case" key={animal.id} onClick={() => openAnimal(animal.id)}>
                <span className="animal-info"><Photo animal={animal} /><span><span className="animal-name">{animal.name}<small>{animal.species}</small></span><span className="muted">{approvedForAnimal(animal.id) ? "มีคำขอที่อนุมัติแล้ว" : `คำขอแรก: ${formatDate(new Date(oldestRequest(animal.id)).toISOString())}`}</span></span></span>
                <span className="case-right"><span className={`badge ${pending ? "pending" : "neutral"}`}>{pending ? `รอพิจารณา ${pending} คำขอ` : "พิจารณาครบแล้ว"}</span><span className="round-arrow" aria-hidden="true">›</span></span>
              </button>;
            })}
            {visibleAnimals.length === 0 && <div className="empty-state"><h3>ไม่พบชื่อสัตว์ที่ค้นหา</h3><button type="button" className="back-button" onClick={() => setAnimalSearch("")}>ล้างการค้นหา</button></div>}
          </div>
        </> : <>
          <section className="animal-banner"><div className="animal-info"><Photo animal={activeAnimal} /><div><h1 ref={sectionRef} tabIndex={-1}>{activeAnimal.name}</h1><p className="muted">{activeAnimal.species} · {activeAnimal.gender}</p></div></div><span className="badge pending">ผู้ขอทั้งหมด {animalApplicants.length} คน · เก่าไปใหม่</span></section>
          {approvedForAnimal(activeAnimal.id) && <p className="notice">สัตว์ตัวนี้มีผู้ได้รับอนุมัติแล้ว จึงไม่สามารถอนุมัติซ้ำให้ผู้อื่นได้</p>}
          <section className="filter-panel" aria-label="ตัวกรองผู้สมัคร">
            <div className="filter-top"><h2><i className="fa-solid fa-filter" aria-hidden="true" /> คัดกรองปัจจัยสำคัญ <small>(เลือกผสมกันได้)</small></h2><input aria-label="ค้นหาชื่อผู้สมัครหรือเบอร์โทร" placeholder="ค้นหาชื่อผู้สมัคร, เบอร์โทร..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
            <div className="filter-chips">{([{ key:"ownHouse", label:"🏡 บ้านส่วนตัว" }, { key:"budget", label:"💰 งบ ≥ 3,000 บาท" }, { key:"time", label:"⏰ ว่างตลอด / เกือบตลอด" }, { key:"noPets", label:"🐾 ไม่มีสัตว์เลี้ยงเดิม" }] as const).map(({ key,label }) => <label className={`filter-chip ${filters[key] ? "checked" : ""}`} key={key}><span>{label}</span><input type="checkbox" checked={filters[key]} onChange={(event) => setFilters((previous) => ({ ...previous, [key]:event.target.checked }))} /></label>)}</div>
            <div className="filter-bottom"><label>สถานะ <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as Status | "all")}><option value="all">ทั้งหมด</option><option value="pending">รอพิจารณา</option><option value="approved">อนุมัติแล้ว</option><option value="rejected">ไม่อนุมัติ</option></select></label><button type="button" onClick={resetFilters}>ล้างตัวกรอง</button></div>
          </section>
          <section className="applicants-panel"><div className="list-heading"><h2>รายชื่อผู้ยื่นคำขอรับเลี้ยง</h2><span className="muted" role="status">แสดง {filteredApplicants.length} จาก {animalApplicants.length} คน</span></div>
            <div className="table-scroll" role="region" aria-label="ตารางผู้สมัคร เลื่อนแนวนอนได้" tabIndex={0}><table><thead><tr><th scope="col"># / ผู้สมัคร</th><th scope="col">ที่พัก / งบประมาณ / เวลาว่าง</th><th scope="col">เวลาที่ส่ง</th><th scope="col">จัดการ / สถานะ</th></tr></thead><tbody>
              {filteredApplicants.map((applicant) => <tr key={applicant.id}>
                <td><div className="applicant-name"><span className="rank">{animalApplicants.findIndex((item) => item.id === applicant.id) + 1}</span><div><strong>{applicant.name}</strong>{applicant.id === oldestPendingId && <span className="oldest">เก่าสุดที่รอ</span>}<small>{applicant.phone}</small></div></div></td>
                <td><p className="housing">ที่พัก: <span>{applicant.accommodation}</span></p><p className="muted">งบ: <b className="budget-number">{money(applicant.budget)} บ.</b> | ว่าง: {applicant.careTime}</p></td>
                <td className="date-cell">{formatDate(applicant.submittedAt)}</td>
                <td><div className="row-actions"><button type="button" className="view-button" aria-label={`ดูรายละเอียด ${applicant.name}`} onClick={() => openApplicant(applicant.id,"detail")}><i className="fa-solid fa-eye" aria-hidden="true" /></button>{applicant.status === "pending" ? <><button type="button" className="approve-button" disabled={approvedForAnimal(applicant.animalId)} onClick={() => openApplicant(applicant.id,"approved")}>อนุมัติ</button><button type="button" className="reject-button" onClick={() => openApplicant(applicant.id,"rejected")}>ไม่อนุมัติ</button></> : <span className={`badge ${applicant.status}`}>{statusLabels[applicant.status]}</span>}</div></td>
              </tr>)}
              {filteredApplicants.length === 0 && <tr><td colSpan={4}><div className="empty-state"><p>ไม่พบผู้สมัครที่ตรงกับเงื่อนไข</p><button type="button" className="back-button" onClick={resetFilters}>ล้างตัวกรอง</button></div></td></tr>}
            </tbody></table></div>
          </section>
        </>}
    </div>

    {selected && selectedAnimal && <Modal key={`${selected.id}-${mode}`} onClose={closeModal}>
      <h2 id="review-modal-title">{mode === "detail" ? "รายละเอียดคำขอรับเลี้ยง 🏡" : mode === "approved" ? "ยืนยันอนุมัติคำขอ 🧡" : "แจ้งเหตุผลที่ไม่อนุมัติ"}</h2>
      <p className="modal-subtitle">คำขอรับเลี้ยง{selectedAnimal.name} · ข้อมูลจาก Supabase</p>
      <div className="applicant-summary"><span className="user-icon"><i className="fa-solid fa-user" aria-hidden="true" /></span><div><h3>{selected.name}</h3><p>โทร: {selected.phone}</p><p>ส่งเมื่อ: {formatDate(selected.submittedAt)}</p></div></div>
      {mode === "detail" ? <>
        <div className="detail-grid">{[
          ["ประเภทที่พัก",selected.accommodation], ["งบดูแลต่อเดือน",`${money(selected.budget)} บาท`], ["เวลาว่างในการดูแลต่อวัน",selected.careTime], ["สัตว์เลี้ยงปัจจุบัน",`${selected.petCount} ตัว`], ["สมาชิกในครอบครัว",`${selected.familyMembers} คน`], ["สถานะคำขอ",statusLabels[selected.status]],
        ].map(([label,value]) => <div className="detail-item" key={label}><span>{label}</span><strong>{value}</strong></div>)}<div className="detail-item full"><span>ที่อยู่</span><p>{selected.address}{selected.province !== "-" ? ` · ${selected.province}` : ""}</p></div><div className="detail-item full"><span>การอนุญาตให้เลี้ยงสัตว์ / รายละเอียดที่พัก</span><p>{selected.petPermission ? "ได้รับอนุญาตให้เลี้ยงสัตว์" : "ยังไม่ได้ระบุการอนุญาต"}{selected.residenceNote !== "-" ? ` · ${selected.residenceNote}` : ""}</p></div><div className="detail-item full"><span>เหตุผลที่อยากรับน้องไปดูแล 💖</span><p>{selected.reason}</p></div>{selected.rejectionReason && <div className="detail-item full rejection"><span>เหตุผลที่ไม่อนุมัติ</span><p>{selected.rejectionReason}</p></div>}</div>
        {selected.status === "pending" && <div className="modal-actions"><button type="button" className="approve-button" disabled={approvedForAnimal(selected.animalId)} onClick={() => setMode("approved")}>✓ อนุมัติคำขอ</button><button type="button" className="reject-button" onClick={() => setMode("rejected")}>ไม่อนุมัติคำขอ</button></div>}
      </> : <form onSubmit={confirmDecision}>
        {mode === "approved" ? <p className="decision-copy">ยืนยันอนุมัติให้ <strong>{selected.name}</strong> รับเลี้ยง <strong>{selectedAnimal.name}</strong> ใช่ไหม? คำขอที่รอพิจารณารายอื่นของสัตว์ตัวนี้จะเปลี่ยนเป็นไม่อนุมัติโดยอัตโนมัติ</p> : <label className="reason-label" htmlFor="rejection-reason">เหตุผลที่ไม่อนุมัติ <span>*</span><textarea id="rejection-reason" required maxLength={1000} rows={4} placeholder="ระบุเหตุผลอย่างสุภาพและชัดเจน..." value={reason} onChange={(event) => setReason(event.target.value)} /></label>}
        <p className="test-copy">ผลการพิจารณาจะบันทึกใน Supabase และผู้สมัครจะเห็นสถานะในหน้าคำขอรับเลี้ยงของตน</p>
        <div className="modal-actions"><button type="button" className="back-button" onClick={() => { setMode("detail"); setReason(""); }}>ย้อนกลับ</button><button type="submit" className={mode === "approved" ? "approve-button" : "reject-button"} disabled={mode === "approved" ? approvedForAnimal(selected.animalId) : !reason.trim()}>ยืนยัน{mode === "approved" ? "อนุมัติ" : "ไม่อนุมัติ"}</button></div>
      </form>}
    </Modal>}
    <style jsx global>{`
      .adoption-review { min-height:70vh; background:#FCFAF8; color:#44403C; font-family:'Prompt',sans-serif; }
      .adoption-review *, .review-modal * { box-sizing:border-box; }
      .adoption-review button, .adoption-review input, .adoption-review select, .review-modal button, .review-modal textarea { font:inherit; }
      .adoption-review button, .review-modal button { cursor:pointer; }
      .adoption-review button:disabled, .review-modal button:disabled { opacity:.45; cursor:not-allowed; }
      .adoption-review a { text-decoration:none; }
      .review-content { max-width:1180px; margin:auto; padding:42px 28px 64px; }
      .page-heading { margin-bottom:30px; }
      .profile-link { display:inline-flex; align-items:center; gap:9px; color:#78716C; font-size:12px; margin-bottom:26px; }
      .profile-link:hover { color:#C07055; }
      .page-heading .eyebrow { color:#C07055; font-size:13px; margin:0 0 7px; }
      .title-row { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; }
      .title-row h1 { margin:0 0 8px; font:600 36px/1.45 'Mali',cursive; }
      .title-row p { margin:0; color:#78716C; font-size:13px; line-height:1.8; }
      .demo-banner { display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap; font-size:11px; line-height:1.8; color:#9C6A51; margin-bottom:22px; }
      .demo-banner a { color:#9C6A51; text-decoration:underline; text-underline-offset:3px; }
      .summary-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:22px; margin-bottom:30px; }
      .summary-card { display:flex; width:100%; align-items:center; gap:16px; padding:25px; background:#fff; border:1px solid #E5E7EB; border-radius:25px; box-shadow:0 2px 3px #44403C05; text-align:left; transition:border-color .2s,box-shadow .2s,transform .2s; }
      .summary-card:hover,.summary-card.selected { border-color:#E29578; box-shadow:0 7px 20px #E2957816; }.summary-card.selected { background:#FFF8F4; transform:translateY(-2px); }
      .summary-icon { width:55px; height:55px; display:grid; place-items:center; border-radius:18px; font-size:23px; flex-shrink:0; }
      .amber { background:#FFFBEB; color:#D18A12; }.green { background:#F0FDF4; color:#16A34A; }.rose { background:#FFF1F2; color:#BE4C58; }
      .summary-card p { color:#89909C; font-size:11px; margin:0 0 7px; line-height:1.6; }.summary-card strong { font:400 30px 'Itim',cursive; }.summary-card small { color:#6B7280; font-size:11px; }
      .list-heading { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:18px; flex-wrap:wrap; }
      .list-heading h2 { margin:0; font:600 21px/1.6 'Mali',cursive; outline:none; }
      .list-tools { display:flex; gap:10px; flex-wrap:wrap; }
      .adoption-review input:not([type=checkbox]), .adoption-review select { max-width:100%; min-width:0; background:#F9FAFB; border:1px solid #E5E7EB; border-radius:13px; padding:10px 12px; font-size:12px; color:#44403C; }
      .adoption-review input::placeholder { color:#9CA3AF; }.list-tools input { width:180px; }
      .clear-status { border:1px solid #E7C2AF; border-radius:13px; background:#FFF8F4; color:#C07055; padding:10px 12px; font-size:12px; white-space:nowrap; }
      .animal-list { display:grid; gap:18px; }
      .animal-case { display:flex; align-items:center; justify-content:space-between; gap:20px; padding:22px; border:1px solid #E5E7EB; border-radius:24px; background:#fff; text-align:left; width:100%; box-shadow:0 2px 3px #44403C05; transition:border-color .2s,box-shadow .2s; }
      .animal-case:hover { border-color:#E29578; box-shadow:0 6px 20px #E2957810; }
      .animal-info { display:flex; align-items:center; gap:18px; min-width:0; }
      .review-photo { display:flex; align-items:center; justify-content:center; width:66px; height:66px; border-radius:17px; border:2px solid #FDF0EB; overflow:hidden; flex-shrink:0; background:#FDF0EB; font-size:28px; }
      .review-photo img { width:100%; height:100%; object-fit:cover; }
      .animal-name { display:flex; align-items:center; gap:12px; flex-wrap:wrap; font:400 26px 'Itim',cursive; color:#E29578; margin-bottom:8px; }
      .animal-name small { border-radius:40px; background:#F3F4F6; color:#6B7280; padding:4px 10px; font:11px 'Prompt',sans-serif; }
      .muted { color:#89909C; font-size:11px; line-height:1.8; }.case-right { display:flex; align-items:center; gap:12px; flex-shrink:0; }
      .badge { display:inline-flex; align-items:center; gap:6px; border-radius:40px; padding:7px 13px; border:1px solid transparent; font-size:11px; line-height:1.5; }
      .badge.pending { color:#A76310; background:#FFF6CE; border-color:#FFDE82; }.badge.approved { color:#168246; background:#DCFCE7; }.badge.rejected { color:#BE4C58; background:#FFF1F2; }.badge.neutral { color:#6B7280; background:#F3F4F6; }
      .round-arrow { width:34px; height:34px; display:grid; place-items:center; border-radius:50%; color:#E29578; background:#FDF0EB; font-size:24px; }
      .animal-banner { display:flex; justify-content:space-between; gap:20px; align-items:center; background:white; border:1px solid #E5E7EB; border-radius:24px; padding:26px; margin-bottom:24px; }
      .animal-banner h1 { margin:0; font:400 30px 'Itim',cursive; color:#E29578; outline:none; }.animal-banner p { margin:6px 0 0; }
      .filter-panel,.applicants-panel { background:white; border:1px solid #E5E7EB; border-radius:24px; padding:24px; margin-bottom:24px; box-shadow:0 2px 3px #44403C05; }
      .filter-top { display:flex; align-items:center; justify-content:space-between; gap:16px; padding-bottom:16px; border-bottom:1px solid #F1F2F4; margin-bottom:16px; }.filter-top h2 { font:600 13px/1.7 'Mali',cursive; margin:0; }.filter-top h2 i { color:#E29578; }.filter-top small { font:inherit; }.filter-top > input { width:290px; }
      .filter-chips { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; }.filter-chip { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:14px 12px; border:1.5px solid #E5E7EB; border-radius:16px; font-size:11px; cursor:pointer; line-height:1.6; }.filter-chip.checked { border-color:#E29578; background:#FFF7F2; }.filter-chip input { width:18px; height:18px; accent-color:#C07055; flex-shrink:0; }
      .filter-bottom { margin-top:16px; display:flex; justify-content:space-between; gap:12px; align-items:center; }.filter-bottom label { font-size:12px; }.filter-bottom select { margin-left:8px; }.filter-bottom button { background:none; border:0; color:#C07055; text-decoration:underline; font-size:12px; }
      .table-scroll { overflow-x:auto; } .adoption-review table { width:100%; border-collapse:collapse; min-width:810px; text-align:left; }
      .adoption-review th { padding:13px 14px; background:#F9FAFB; color:#6B7280; font:600 12px 'Mali',cursive; border-bottom:1px solid #E5E7EB; }.adoption-review td { padding:17px 14px; border-bottom:1px solid #F1F2F4; font-size:12px; }.adoption-review tbody tr:hover { background:#FFFCFA; }.adoption-review tbody tr:last-child td { border-bottom:0; }
      .applicant-name { display:flex; align-items:center; gap:10px; }.rank { display:grid; place-items:center; width:25px; height:25px; flex-shrink:0; border-radius:50%; color:#C07055; background:#FDF0EB; font-size:12px; }.applicant-name strong { font:600 13px/1.7 'Mali',cursive; }.applicant-name small { display:block; color:#9CA3AF; font-size:11px; margin-top:4px; }.oldest { display:inline-block; color:#A76310; background:#FFF6CE; padding:3px 6px; font-size:9px; border-radius:30px; margin-left:6px; }.housing { margin:0 0 5px; font-size:11px; color:#6B7280; }.housing span { color:#44403C; background:#F5F5F4; padding:3px 6px; border-radius:6px; line-height:2; }.adoption-review td p.muted { margin:0; }.budget-number { color:#C07055; }.date-cell { color:#89909C; font-size:11px!important; }
      .row-actions { display:flex; justify-content:flex-end; align-items:center; gap:6px; }.row-actions button { white-space:nowrap; }
      .approve-button,.reject-button,.view-button,.back-button { border:0; border-radius:10px; padding:8px 10px; font-size:11px!important; line-height:1.6; }
      .approve-button { background:#DCFCE7; color:#15803D; }.approve-button:not(:disabled):hover { background:#BBF7D0; }.reject-button { background:#FFF1F2; color:#BE4C58; }.reject-button:not(:disabled):hover { background:#FFE4E6; }.view-button { background:#F3F4F6; color:#4B5563; }.back-button { background:#F9FAFB; border:1px solid #E5E7EB; color:#57534E; padding:9px 14px; }
      .notice { margin:0 0 20px; padding:13px 16px; border:1px solid #EDD4C7; background:#FFF5EE; border-radius:14px; color:#986247; font-size:12px; line-height:1.8; }.empty-state { text-align:center; padding:35px 16px; color:#89909C; font-size:13px; }.empty-state h3 { font:600 18px 'Mali',cursive; }
      .review-modal { margin:auto; padding:32px; width:calc(100% - 32px); max-width:640px; max-height:90dvh; overflow:auto; border:1px solid #F1D8CD; border-radius:28px; background:#FCFAF8; color:#44403C; font-family:'Prompt',sans-serif; box-shadow:0 24px 80px #0003; }
      .review-modal::backdrop { background:#0007; backdrop-filter:blur(4px); }.review-modal .modal-close { position:absolute; right:18px; top:18px; width:34px; height:34px; border:0; border-radius:50%; color:#57534E; background:#FDF0EB; font-size:24px; }.review-modal h2 { text-align:center; font:600 23px/1.6 'Mali',cursive; margin:12px 24px 4px; }.modal-subtitle { text-align:center; color:#C07055; font-size:12px; margin:0 0 24px; }.applicant-summary { display:flex; align-items:center; gap:14px; padding:16px; background:white; border:1px solid #E7E5E4; border-radius:16px; margin-bottom:20px; }.user-icon { width:45px; height:45px; flex-shrink:0; display:grid; place-items:center; border-radius:50%; color:#C07055; background:#FDF0EB; }.applicant-summary h3 { font:600 16px/1.7 'Mali',cursive; margin:0 0 4px; }.applicant-summary p { font-size:11px; line-height:1.7; color:#89909C; margin:0; }
      .detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }.detail-item { background:white; border:1px solid #E7E5E4; border-radius:13px; padding:14px; }.detail-item span { display:block; color:#89909C; font-size:11px; margin-bottom:7px; }.detail-item strong,.detail-item p { font-size:13px; line-height:1.8; font-weight:400; margin:0; overflow-wrap:anywhere; }.detail-item.full { grid-column:1/-1; }.detail-item.rejection { background:#FFF1F2; }.modal-actions { display:flex; gap:14px; margin-top:24px; }.modal-actions button { flex:1; border-radius:40px; padding:13px 16px; font:600 14px 'Mali',cursive!important; }.decision-copy { font-size:14px; line-height:2; }.test-copy { font-size:11px; color:#89909C; line-height:1.8; margin-top:18px; }.reason-label { display:block; font-size:14px; line-height:1.8; }.reason-label > span { color:#BE4C58; }.reason-label textarea { display:block; width:100%; resize:vertical; border:1px solid #E7E5E4; border-radius:14px; background:#fff; margin-top:10px; padding:14px; font-size:13px; }
      .adoption-review button:focus-visible,.adoption-review a:focus-visible,.adoption-review input:focus-visible,.adoption-review select:focus-visible,.adoption-review .table-scroll:focus-visible,.review-modal button:focus-visible,.review-modal textarea:focus-visible { outline:3px solid #C07055; outline-offset:3px; }
      @media(max-width:950px) { .review-content { padding:34px 22px 50px; }.summary-card { padding:20px 16px; gap:10px; }.summary-icon { width:44px; height:44px; }.filter-chips { grid-template-columns:repeat(2,minmax(0,1fr)); }.summary-grid { gap:12px; } }
      @media(max-width:640px) { .review-content { padding:26px 16px 40px; }.title-row { align-items:flex-start; flex-direction:column; }.title-row h1 { font-size:28px; }.summary-grid { grid-template-columns:1fr; gap:12px; }.summary-card { padding:18px 22px; }.summary-card p { margin-bottom:3px; }.summary-card strong { font-size:27px; }.animal-case,.animal-banner { align-items:flex-start; flex-direction:column; padding:20px; gap:16px; }.animal-case .case-right { width:100%; justify-content:space-between; }.animal-name { font-size:24px; }.filter-panel,.applicants-panel { padding:18px; }.filter-top { flex-direction:column; align-items:stretch; }.filter-top > input { width:100%; }.filter-chips { gap:8px; }.filter-chip { padding:10px; font-size:10px; }.filter-bottom { flex-wrap:wrap; }.list-tools { width:100%; }.list-tools input,.list-tools select { flex:1; width:100%; min-width:140px!important; }.list-heading h2 { font-size:19px; }.review-modal { padding:24px 18px; }.review-modal h2 { font-size:20px; }.detail-grid { grid-template-columns:1fr; }.modal-actions { gap:8px; }.modal-actions button { font-size:12px!important; padding:12px 10px; } }
      @media(prefers-reduced-motion:reduce) { .adoption-review * { transition:none!important; } }
    `}</style>
  </div>;
}
