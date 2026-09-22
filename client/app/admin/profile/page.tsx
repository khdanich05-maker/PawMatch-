"use client";

import Link from "next/link";

// เปิด ready เมื่อสร้างหน้าปลายทางแล้ว และปรับ href ให้ตรงกับโครงสร้างของทีม
const adminMenus = [
  { title: "แดชบอร์ดภาพรวม", description: "ดูภาพรวมสัตว์ที่อยู่ในการดูแล คำขอรับเลี้ยง และการแจ้งพบสัตว์", icon: "fa-chart-pie", href: "/admin/dashboard", ready: false },
  { title: "จัดการข้อมูลสัตว์", description: "เพิ่มและแก้ไขข้อมูลสัตว์ รูปภาพ สุขภาพ และสถานะการหาบ้าน", icon: "fa-dog", href: "/admin/animals", ready: true },
  { title: "ตรวจสอบแจ้งพบสัตว์", description: "ตรวจสอบรายละเอียดและสถานที่แจ้งพบสัตว์ พร้อมติดตามการช่วยเหลือ", icon: "fa-map-location-dot", href: "/admin/stray-reports", ready: false },
  { title: "ตรวจสอบคำขอรับเลี้ยง", description: "พิจารณาข้อมูลผู้สมัครและความพร้อม ก่อนอนุมัติคำขอรับเลี้ยง", icon: "fa-file-circle-check", href: "/admin/adoptions", ready: true },
  { title: "ติดตาม Care Log", description: "ติดตามบันทึกการดูแล สุขภาพ และรูปภาพของสัตว์หลังรับเลี้ยง", icon: "fa-heart-pulse", href: "/admin/care-logs", ready: false },
];

export default function AdminProfilePage() {
  return (
    <section className="admin-hub" aria-labelledby="admin-title">
      <header className="hub-header">
        <p className="eyebrow">พื้นที่สำหรับผู้ดูแลระบบ</p>
        <h1 id="admin-title">โปรไฟล์แอดมิน</h1>
        <p className="subtitle">จัดการการช่วยเหลือสัตว์ และดูแลทุกโอกาสของบ้านหลังใหม่</p>
      </header>

      <div className="profile-card">
        <div className="avatar" aria-hidden="true"><i className="fa-solid fa-user-shield" /></div>
        <div className="profile-details">
          <h2>ผู้ดูแลระบบ PawMatch</h2>
          <p>ศูนย์รวมเมนูสำหรับจัดการและติดตามงานของคุณ</p>
          <span className="role-badge"><i className="fa-solid fa-shield-halved" aria-hidden="true" /> ผู้ดูแลระบบ</span>
        </div>
        <div className="profile-decoration" aria-hidden="true"><i className="fa-solid fa-paw" /></div>
      </div>

      <div className="section-heading"><h2>เมนูจัดการของฉัน</h2><span>ดูแลทุกขั้นตอนในที่เดียว</span></div>
      <div className="menu-grid">
        {adminMenus.map((menu) => (
          <article key={menu.href} className="menu-card">
            <div className="menu-icon" aria-hidden="true"><i className={`fa-solid ${menu.icon}`} /></div>
            <h3>{menu.title}</h3>
            <p>{menu.description}</p>
            {menu.ready ? (
              <Link className="menu-action enabled" href={menu.href} aria-label={`เข้าสู่${menu.title}`}>เข้าสู่เมนู <span aria-hidden="true">→</span></Link>
            ) : (
              <button type="button" className="menu-action pending" disabled>เร็ว ๆ นี้</button>
            )}
          </article>
        ))}
      </div>
      <p className="hub-footer"><i className="fa-solid fa-paw" aria-hidden="true" /> ทุกการดูแล ช่วยให้น้องเข้าใกล้บ้านที่อบอุ่นอีกหนึ่งก้าว</p>

      <style jsx global>{`
        .admin-hub { max-width:1180px; margin:0 auto; padding:44px 28px 64px; color:#44403C; font-family:'Prompt',sans-serif; }
        .admin-hub * { box-sizing:border-box; }
        .admin-hub .eyebrow { color:#C07055; font-size:14px; margin:0 0 8px; }
        .admin-hub h1 { font:600 42px/1.4 'Mali',cursive; margin:0 0 12px; }
        .admin-hub .subtitle { margin:0; color:#78716C; font-size:15px; line-height:1.9; }
        .admin-hub .profile-card { position:relative; display:flex; align-items:center; gap:26px; overflow:hidden; border:1px solid #EED7CC; background:linear-gradient(110deg,#FFFFFF 45%,#FFF8F4); border-radius:28px; padding:36px 40px; margin:36px 0 34px; box-shadow:0 2px 4px #44403C0d; }
        .admin-hub .avatar { display:flex; align-items:center; justify-content:center; flex-shrink:0; width:100px; height:100px; border-radius:50%; background:#FDF0EB; color:#C07055; font-size:35px; }
        .admin-hub .profile-details { position:relative; z-index:1; }
        .admin-hub .profile-details h2 { margin:0 0 8px; font:600 26px/1.5 'Mali',cursive; }
        .admin-hub .profile-details p { margin:0 0 14px; color:#78716C; font-size:14px; line-height:1.8; }
        .admin-hub .role-badge { display:inline-flex; align-items:center; gap:7px; border-radius:50px; padding:5px 13px; color:#A96349; background:#FDF0EB; font-size:12px; }
        .admin-hub .profile-decoration { position:absolute; right:40px; bottom:20px; font-size:104px; transform:rotate(-18deg); color:#F6E6DE; }
        .admin-hub .section-heading { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:20px; }
        .admin-hub .section-heading h2 { font:600 24px/1.5 'Mali',cursive; margin:0; }
        .admin-hub .section-heading > span { color:#A8A29E; font-size:12px; }
        .admin-hub .menu-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px; }
        .admin-hub .menu-card { display:flex; flex-direction:column; padding:28px; border:1px solid #E7E5E4; border-radius:26px; background:#FFFFFF; box-shadow:0 2px 4px #44403C0a; transition:box-shadow .2s,border-color .2s; }
        .admin-hub .menu-card:hover { border-color:#E7C2AF; box-shadow:0 7px 22px #C070550c; }
        .admin-hub .menu-icon { display:flex; align-items:center; justify-content:center; width:58px; height:58px; background:#FDF0EB; color:#C07055; border-radius:18px; font-size:25px; margin-bottom:20px; }
        .admin-hub .menu-card h3 { font:600 25px/1.5 'Mali',cursive; margin:0 0 10px; }
        .admin-hub .menu-card p { color:#78716C; font-size:14px; line-height:1.9; margin:0 0 28px; }
        .admin-hub .menu-action { width:100%; display:flex; justify-content:center; align-items:center; gap:15px; margin-top:auto; padding:14px 18px; border-radius:15px; border:0; font:400 14px/1.5 'Prompt',sans-serif; text-decoration:none; }
        .admin-hub .enabled { background:#E29578; color:white; transition:background .2s; }
        .admin-hub .enabled:hover { background:#C07055; }
        .admin-hub .enabled:focus-visible { outline:3px solid #C07055; outline-offset:4px; }
        .admin-hub .pending { color:#78716C; background:#F5F5F4; cursor:not-allowed; }
        .admin-hub .hub-footer { display:flex; justify-content:center; gap:10px; margin:32px 0 0; color:#A8A29E; font-size:12px; line-height:1.9; text-align:center; }
        .admin-hub .hub-footer i { color:#E29578; margin-top:5px; }
        @media(max-width:640px) {
          .admin-hub { padding:28px 18px 44px; }
          .admin-hub h1 { font-size:32px; }
          .admin-hub .subtitle { font-size:13px; }
          .admin-hub .profile-card { padding:26px 22px; gap:18px; margin:26px 0; }
          .admin-hub .avatar { width:70px; height:70px; font-size:26px; }
          .admin-hub .profile-details h2 { font-size:20px; }
          .admin-hub .profile-details p { font-size:12px; }
          .admin-hub .profile-decoration { display:none; }
          .admin-hub .section-heading > span { display:none; }
          .admin-hub .section-heading h2 { font-size:22px; }
          .admin-hub .menu-grid { grid-template-columns:1fr; gap:18px; }
          .admin-hub .menu-card { padding:24px; }
          .admin-hub .menu-card h3 { font-size:23px; }
        }
        @media(prefers-reduced-motion:reduce) { .admin-hub * { transition:none!important; } }
      `}</style>
    </section>
  );
}
