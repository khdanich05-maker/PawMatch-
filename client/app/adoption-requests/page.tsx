"use client";

import { useState } from "react";
import Link from "next/link";

type Status = "pending" | "approved" | "rejected";
type RequestItem = {
  id: string;
  name: string;
  species: string;
  image: string;
  date: string;
  shelter: string;
  status: Status;
  reason?: string;
};

// ข้อมูลตัวอย่างสำหรับตรวจหน้าตา UI เท่านั้น ยังไม่เชื่อม Supabase
const sampleRequests: RequestItem[] = [
  {
    id: "demo-1", name: "เจ้าส้ม", species: "แมว", date: "12 ก.ย. 2569",
    shelter: "ศูนย์พักพิงสัตว์ A", status: "pending",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "demo-2", name: "น้องมะลิ", species: "สุนัข", date: "1 ก.ย. 2569",
    shelter: "ศูนย์พักพิงสัตว์ B", status: "approved",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "demo-3", name: "บราวนี่", species: "สุนัข", date: "20 ส.ค. 2569",
    shelter: "ศูนย์พักพิงสัตว์ A", status: "rejected",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=300&q=80",
    reason: "มีผู้รับเลี้ยงน้องบราวนี่แล้ว ลองดูน้อง ๆ ตัวอื่นที่กำลังรอบ้านอยู่นะคะ 🐾",
  },
];
const statusInfo = {
  pending: { label: "รอการอนุมัติ", icon: "fa-hourglass-half", message: "กำลังรอเจ้าหน้าที่พิจารณา" },
  approved: { label: "อนุมัติแล้ว", icon: "fa-circle-check", message: "อนุมัติแล้ว! การจับคู่สำเร็จ 🎉" },
  rejected: { label: "ไม่อนุมัติ", icon: "fa-circle-xmark", message: "คำขอไม่ได้รับการอนุมัติ" },
};
const filters: { value: "all" | Status; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "pending", label: "รอการอนุมัติ" },
  { value: "approved", label: "อนุมัติแล้ว" },
  { value: "rejected", label: "ไม่อนุมัติ" },
];

function AnimalPhoto({ item }: { item: RequestItem }) {
  const [failed, setFailed] = useState(false);
  return <div className="request-photo">
    {failed ? <span role="img" aria-label={item.species}>🐾</span> :
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.image} alt={item.name} onError={() => setFailed(true)} />}
  </div>;
}

export default function AdoptionRequestsPage() {
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [requests, setRequests] = useState(sampleRequests);
  const [removed, setRemoved] = useState<RequestItem | null>(null);
  const visible = requests.filter((item) => filter === "all" || item.status === filter);

  function cancelRequest(item: RequestItem) {
    if (!window.confirm(`ทดลองยกเลิกคำขอของ${item.name}ไหม? การเปลี่ยนแปลงนี้มีผลเฉพาะหน้าตัวอย่างเท่านั้น`)) return;
    setRequests((previous) => previous.filter((request) => request.id !== item.id));
    setRemoved(item);
  }

  function undoCancel() {
    if (!removed) return;
    setRequests((previous) => sampleRequests.filter((item) => item.id === removed.id || previous.some((request) => request.id === item.id)));
    setRemoved(null);
  }

  return (
    <section className="paw-requests" aria-labelledby="requests-title">
      <Link href="/profile" className="back-link"><i className="fa-solid fa-arrow-left" aria-hidden="true" /> กลับไปโปรไฟล์ของฉัน</Link>
      <header className="page-heading">
        <p className="eyebrow">ทุกคำขอ คือโอกาสของบ้านหลังใหม่</p>
        <h1 id="requests-title">สถานะคำขอรับเลี้ยง 📝</h1>
        <p className="intro">ติดตามการเดินทางของคุณและน้อง ๆ ที่อยากรับไปดูแล</p>
      </header>

      <div className="demo-note"><i className="fa-regular fa-lightbulb" aria-hidden="true" /><p>ข้อมูลตัวอย่างสำหรับดูรูปแบบหน้าเว็บ ยังไม่ใช่คำขอจริงของคุณ</p></div>

      <div className="filter-row" role="group" aria-label="กรองสถานะคำขอ">
        {filters.map(({ value, label }) => {
          const count = requests.filter((item) => value === "all" || item.status === value).length;
          return <button key={value} type="button" aria-pressed={filter === value}
            className={`filter-button ${filter === value ? "selected" : ""}`} onClick={() => setFilter(value)}>
            {label}<span className="count">{count}</span>
          </button>;
        })}
      </div>
      <p className="result-count" role="status">แสดง {visible.length} คำขอ</p>
      {removed && <div className="undo-message" role="status"><span>ยกเลิกคำขอตัวอย่างของ{removed.name}แล้ว</span><button type="button" onClick={undoCancel}>เลิกทำ</button></div>}

      <div className="request-list">
        {visible.map((item) => {
          const info = statusInfo[item.status];
          return <article key={item.id} className={`request-card ${item.status}`} aria-labelledby={`name-${item.id}`}>
            <AnimalPhoto item={item} />
            <div className="request-body">
              <div className="name-row"><h2 id={`name-${item.id}`}>{item.name}</h2><span className="species">{item.species}</span></div>
              <div className="metadata"><span><i className="fa-regular fa-calendar" aria-hidden="true" /> ส่งเมื่อ: {item.date}</span><span><i className="fa-solid fa-location-dot" aria-hidden="true" /> {item.shelter}</span></div>
              <p className={`status-badge ${item.status}`}><i className={`fa-solid ${info.icon}`} aria-hidden="true" />{info.message}</p>
              {item.status === "approved" && <p className="next-step">ติดต่อศูนย์พักพิงเพื่อนัดหมายและสอบถามขั้นตอนรับน้องไปดูแล</p>}
              {item.reason && <p className="reason"><strong>เหตุผล: </strong>{item.reason}</p>}
            </div>
            {item.status === "pending" && <button type="button" className="cancel-button" onClick={() => cancelRequest(item)}>ยกเลิกคำขอ</button>}
          </article>;
        })}
        {visible.length === 0 && <div className="empty-state"><span aria-hidden="true">🐾</span><h2>ยังไม่มีคำขอในหมวดนี้</h2><p>เมื่อมีคำขอ สถานะจะแสดงอยู่ตรงนี้นะคะ</p><button type="button" onClick={() => setFilter("all")}>ดูคำขอทั้งหมด</button></div>}
      </div>
      <div className="bottom-note"><p>ยังมีน้อง ๆ อีกหลายตัวที่กำลังรอบ้านอบอุ่นอยู่ 🧡</p><Link href="/cases">พบกับน้อง ๆ ที่รอคนดูแล <span aria-hidden="true">→</span></Link></div>

      <style jsx global>{`
        .paw-requests { max-width:960px; margin:0 auto; padding:40px 24px 64px; color:#44403C; font-family:'Prompt',sans-serif; }
        .paw-requests * { box-sizing:border-box; }
        .paw-requests .back-link { display:inline-flex; align-items:center; gap:10px; color:#78716C; font-size:13px; text-decoration:none; margin-bottom:28px; }
        .paw-requests .back-link:hover { color:#C07055; }
        .paw-requests .eyebrow { margin:0 0 10px; font-size:13px; color:#C07055; }
        .paw-requests h1 { font:600 32px/1.5 'Mali',cursive; margin:0 0 10px; }
        .paw-requests .intro { margin:0; color:#78716C; font-size:14px; line-height:1.8; }
        .paw-requests .demo-note { display:flex; align-items:center; gap:10px; padding:12px 16px; margin:26px 0; border:1px solid #F3DACE; border-radius:14px; background:#FDF0EB; color:#915E4C; font-size:12px; line-height:1.7; }
        .paw-requests .demo-note p { margin:0; }
        .paw-requests .filter-row { display:flex; flex-wrap:wrap; gap:10px; }
        .paw-requests .filter-button { display:inline-flex; align-items:center; gap:9px; border:1px solid #E7E5E4; border-radius:50px; background:#fff; color:#78716C; padding:10px 16px; font:400 13px 'Prompt',sans-serif; cursor:pointer; transition:background .2s; }
        .paw-requests .filter-button.selected { background:#E29578; color:white; border-color:#E29578; box-shadow:0 4px 12px #E2957826; }
        .paw-requests .count { display:inline-flex; align-items:center; justify-content:center; min-width:23px; height:23px; border-radius:50px; padding:0 5px; background:#F5F5F4; color:#78716C; font-size:11px; }
        .paw-requests .selected .count { background:#ffffff40; color:white; }
        .paw-requests .result-count { margin:18px 2px 14px; color:#78716C; font-size:12px; }
        .paw-requests .request-list { display:grid; gap:20px; }
        .paw-requests .request-card { display:flex; align-items:center; gap:24px; padding:26px; border:1px solid #E7E5E4; border-radius:24px; background:white; box-shadow:0 2px 5px #44403C08; transition:box-shadow .2s,transform .2s; }
        .paw-requests .request-card:hover { box-shadow:0 8px 22px #44403C0d; transform:translateY(-2px); }
        .paw-requests .request-card.approved { background:#FAFFFC; border-color:#BBE2C9; }
        .paw-requests .request-photo { width:96px; height:96px; flex-shrink:0; border:2px solid #FDF0EB; border-radius:18px; overflow:hidden; background:#FDF0EB; display:flex; align-items:center; justify-content:center; font-size:32px; }
        .paw-requests .request-photo img { width:100%; height:100%; object-fit:cover; }
        .paw-requests .request-body { flex:1; min-width:0; }
        .paw-requests .name-row { display:flex; align-items:center; gap:12px; margin-bottom:7px; }
        .paw-requests h2 { font:400 27px/1.4 'Itim',cursive; margin:0; }
        .paw-requests .species { font-size:11px; color:#A07866; border-radius:50px; background:#FDF0EB; padding:3px 10px; }
        .paw-requests .metadata { display:flex; flex-wrap:wrap; gap:7px 18px; margin-bottom:14px; color:#78716C; font-size:12px; line-height:1.7; }
        .paw-requests .metadata i { margin-right:5px; color:#A8A29E; }
        .paw-requests .status-badge { display:inline-flex; align-items:center; gap:8px; margin:0; padding:7px 12px; border:1px solid; border-radius:50px; font-size:12px; line-height:1.6; }
        .paw-requests .status-badge.pending { background:#FFF7ED; color:#A85B16; border-color:#FED7AA; }
        .paw-requests .status-badge.approved { background:#F0FDF4; color:#287147; border-color:#BBE2C9; }
        .paw-requests .status-badge.rejected { background:#FEF2F2; color:#B94D50; border-color:#FECACA; }
        .paw-requests .next-step { font-size:12px; line-height:1.8; color:#578066; margin:12px 0 0; }
        .paw-requests .reason { margin:12px 0 0; padding:12px 14px; background:#FFF7F6; border:1px solid #FBE2DE; border-radius:12px; color:#A55C59; font-size:12px; line-height:1.9; }
        .paw-requests .cancel-button { background:transparent; border:0; color:#78716C; text-decoration:underline; text-underline-offset:4px; cursor:pointer; font:12px 'Prompt',sans-serif; padding:10px 0; flex-shrink:0; }
        .paw-requests .cancel-button:hover { color:#B94D50; }
        .paw-requests .bottom-note { margin-top:32px; padding-top:26px; border-top:1px solid #E7E5E4; text-align:center; }
        .paw-requests .bottom-note p { font-size:13px; color:#78716C; line-height:1.8; margin:0 0 12px; }
        .paw-requests .bottom-note a { display:inline-flex; align-items:center; gap:14px; color:#C07055; font:600 14px 'Mali',cursive; text-decoration:none; padding:12px 20px; border-radius:50px; background:#FDF0EB; }
        .paw-requests .empty-state { background:white; text-align:center; padding:42px 20px; border:1px dashed #E7D4C9; border-radius:24px; }
        .paw-requests .empty-state > span { display:block; font-size:36px; margin-bottom:12px; }
        .paw-requests .empty-state p { font-size:13px; color:#78716C; }
        .paw-requests .empty-state button { background:#E29578; color:white; border:0; border-radius:50px; padding:12px 20px; font:600 14px 'Mali',cursive; cursor:pointer; }
        .paw-requests .undo-message { display:flex; justify-content:space-between; gap:12px; margin-bottom:16px; padding:12px 16px; background:#FDF0EB; border-radius:12px; font-size:12px; line-height:1.8; }
        .paw-requests .undo-message button { color:#915E4C; background:none; border:0; text-decoration:underline; font:inherit; cursor:pointer; }
        .paw-requests button:focus-visible, .paw-requests a:focus-visible { outline:3px solid #C07055; outline-offset:4px; }
        @media(max-width:640px) {
          .paw-requests { padding:28px 18px 44px; }
          .paw-requests h1 { font-size:25px; }
          .paw-requests .filter-row { gap:8px; }
          .paw-requests .filter-button { font-size:12px; padding:8px 12px; }
          .paw-requests .request-card { flex-direction:column; gap:16px; padding:22px; text-align:center; }
          .paw-requests .request-body { width:100%; }
          .paw-requests .name-row, .paw-requests .metadata { justify-content:center; }
          .paw-requests .reason { text-align:left; }
          .paw-requests .cancel-button { padding:6px; }
        }
        @media(prefers-reduced-motion:reduce) { .paw-requests * { transition:none!important; transform:none!important; } }
      `}</style>
    </section>
  );
}
