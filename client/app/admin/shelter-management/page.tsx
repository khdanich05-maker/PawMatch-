"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./ShelterManagement.module.css";

type Shelter = {
  shelter_id: string;
  user_id: string | null;
  shelter_name: string;
  province: string | null;
  contact_phone: string | null;
  email: string | null;
  address: string | null;
};
type Animal = {
  animal_id: string;
  shelter_id: string | null;
  name: string | null;
  species: string | null;
  gender: string | null;
  status: string | null;
};
type Draft = { shelter_name: string; province: string; contact_phone: string; email: string; address: string };
const emptyDraft: Draft = { shelter_name: "", province: "", contact_phone: "", email: "", address: "" };
const columns = "shelter_id,user_id,shelter_name,province,contact_phone,email,address";
function message(error: unknown) {
  if (typeof error === "object" && error && "message" in error) return String(error.message);
  return "เกิดข้อผิดพลาด กรุณาลองใหม่";
}

export default function ShelterManagementPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [animalError, setAnimalError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Shelter | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [selected, setSelected] = useState<Shelter | null>(null);
  const [deleting, setDeleting] = useState<Shelter | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [busyDelete, setBusyDelete] = useState(false);
  const editor = useRef<HTMLDialogElement>(null);
  const animalDialog = useRef<HTMLDialogElement>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);
  const requestId = useRef(0);

  // Use a stable key, never the shelter name, to associate animals with shelters.
  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError("");
    setAnimalError("");
    try {
      // Range through all rows so the default Supabase row limit does not truncate totals.
      const rows: Shelter[] = [];
      for (let offset = 0; ; offset += 500) {
        const result = await supabase.from("shelters").select(columns)
          .order("shelter_id").range(offset, offset + 499);
        if (result.error) throw result.error;
        rows.push(...(result.data ?? []));
        if ((result.data?.length ?? 0) < 500) break;
      }
      if (id !== requestId.current) return;
      setShelters(rows.sort((a, b) => a.shelter_name.localeCompare(b.shelter_name, "th")));
      try {
        const list: Animal[] = [];
        for (let offset = 0; ; offset += 500) {
          const result = await supabase.from("animals")
            .select("animal_id,shelter_id,name,species,gender,status")
            .order("animal_id").range(offset, offset + 499);
          if (result.error) throw result.error;
          list.push(...(result.data ?? []));
          if ((result.data?.length ?? 0) < 500) break;
        }
        if (id === requestId.current) setAnimals(list);
      } catch (err) {
        if (id === requestId.current) { setAnimals([]); setAnimalError(message(err)); }
      }
    } catch (err) {
      if (id === requestId.current) setError(message(err));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return () => { requestId.current += 1; };
  }, [load]);

  function openEditor(shelter: Shelter | null) {
    setEditing(shelter);
    setDraft(shelter ? {
      shelter_name: shelter.shelter_name,
      province: shelter.province ?? "",
      contact_phone: shelter.contact_phone ?? "",
      email: shelter.email ?? "",
      address: shelter.address ?? "",
    } : { ...emptyDraft });
    setFormError("");
    editor.current?.showModal();
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (!draft.shelter_name.trim()) { setFormError("กรุณากรอกชื่อศูนย์พักพิง"); return; }
    setSaving(true);
    setFormError("");
    const values = {
      shelter_name: draft.shelter_name.trim(),
      province: draft.province.trim() || null,
      contact_phone: draft.contact_phone.trim() || null,
      email: draft.email.trim() || null,
      address: draft.address.trim() || null,
    };
    try {
      // No invented user_id. Inserts use nullable default; updates preserve the existing manager.
      const result = editing
        ? await supabase.from("shelters").update(values).eq("shelter_id", editing.shelter_id).select(columns).single()
        : await supabase.from("shelters").insert(values).select(columns).single();
      if (result.error) throw result.error;
      setNotice(editing ? "บันทึกการแก้ไขแล้ว" : "เพิ่มศูนย์พักพิงแล้ว");
      editor.current?.close();
      await load();
    } catch (err) { setFormError(message(err)); }
    finally { setSaving(false); }
  }

  async function remove() {
    if (!deleting || busyDelete) return;
    setBusyDelete(true);
    setDeleteError("");
    try {
      // Conservatively block deletion while either dependent table is unavailable.
      // A database FK with ON DELETE RESTRICT is still needed to prevent concurrent races.
      for (const table of ["animals", "stray_reports"]) {
        const check = await supabase.from(table).select("shelter_id", { count: "exact", head: true })
          .eq("shelter_id", deleting.shelter_id);
        if (check.error) throw new Error("ตรวจสอบข้อมูลที่เชื่อมกับศูนย์ไม่ได้: " + check.error.message);
        if ((check.count ?? 0) > 0) throw new Error("ศูนย์นี้ยังมีสัตว์หรือรายงานเชื่อมอยู่ กรุณาจัดการข้อมูลที่เกี่ยวข้องก่อนลบ");
      }
      const result = await supabase.from("shelters").delete()
        .eq("shelter_id", deleting.shelter_id).select("shelter_id").single();
      if (result.error) throw result.error;
      deleteDialog.current?.close();
      setDeleting(null);
      setNotice("ลบศูนย์พักพิงแล้ว");
      await load();
    } catch (err) { setDeleteError(message(err)); }
    finally { setBusyDelete(false); }
  }

  const filtered = shelters.filter((s) => `${s.shelter_name} ${s.province ?? ""}`.toLowerCase().includes(search.trim().toLowerCase()));
  const selectedAnimals = animals.filter((a) => a.shelter_id === selected?.shelter_id);

  return (
    <section className={styles.page}>
      <header className={styles.heading}>
        <div><p className={styles.eyebrow}>PAWMATCH / SHELTER MANAGEMENT</p><h1>จัดการศูนย์พักพิง</h1><p className={styles.muted}>เครือข่ายแห่งการดูแล เพื่อให้ทุกชีวิตมีบ้าน</p></div>
        <button type="button" className={styles.secondary} disabled={loading} onClick={() => void load()}>↻ โหลดข้อมูลใหม่</button>
      </header>

      <div className={styles.stats}>
        <div className={styles.stat}><span>⌂</span><strong>{loading || error ? "—" : shelters.length}</strong><p>ศูนย์พักพิงในเครือข่าย</p></div>
        <div className={styles.stat}><span>♡</span><strong>{loading || error || animalError ? "—" : animals.filter(a => shelters.some(s => s.shelter_id === a.shelter_id)).length}</strong><p>สัตว์ที่สังกัดศูนย์ในเครือข่าย</p></div>
        <div className={styles.stat}><span>◎</span><strong>—</strong><p>รายงานแจ้งพบสัตว์</p><small>ยังไม่เชื่อมข้อมูล</small></div>
        <div className={styles.stat}><span>✧</span><strong>—</strong><p>การจับคู่และบันทึกการดูแล</p><small>ยังไม่เชื่อมข้อมูล</small></div>
      </div>

      <div className={styles.toolbar}><h2>เครือข่ายศูนย์พักพิง</h2><button type="button" className={styles.primary} onClick={() => openEditor(null)}>＋ เพิ่มศูนย์พักพิง</button></div>
      <label className={styles.search}>ค้นหาศูนย์หรือจังหวัด<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="พิมพ์ชื่อศูนย์พักพิงหรือจังหวัด..." /></label>
      {notice && <p className={styles.success} role="status">{notice}</p>}
      {loading && <p className={styles.empty} role="status">กำลังโหลดข้อมูล...</p>}
      {error && <p className={styles.error} role="alert">โหลดศูนย์พักพิงไม่สำเร็จ: {error}</p>}
      {animalError && <p className={styles.error} role="alert">โหลดข้อมูลสัตว์ไม่สำเร็จ: {animalError}</p>}
      {!loading && !error && filtered.length === 0 && <p className={styles.empty}>{search ? "ไม่พบศูนย์ที่ตรงกับคำค้นหา" : "ยังไม่มีศูนย์พักพิง"}</p>}
      {!loading && !error && <div className={styles.cards}>{filtered.map(shelter => (
        <details className={styles.card} key={shelter.shelter_id}>
          <summary><span className={styles.cardTitle}>{shelter.shelter_name}</span><span className={styles.badge}>{shelter.province || "ไม่ระบุจังหวัด"}</span></summary>
          <div className={styles.cardBody}>
            <div className={styles.details}>
              <dl><dt>ที่อยู่</dt><dd>{shelter.address || "ไม่ได้ระบุ"}</dd><dt>เบอร์โทรศัพท์</dt><dd>{shelter.contact_phone || "ไม่ได้ระบุ"}</dd><dt>อีเมล</dt><dd>{shelter.email || "ไม่ได้ระบุ"}</dd></dl>
              <div className={styles.countBox}><strong>{animalError ? "—" : animals.filter(a => a.shelter_id === shelter.shelter_id).length}</strong><p>สัตว์ที่สังกัดศูนย์</p><button type="button" className={styles.link} disabled={!!animalError} onClick={() => { setSelected(shelter); animalDialog.current?.showModal(); }}>ดูรายชื่อสัตว์ →</button></div>
            </div>
            <div className={styles.actions}><button type="button" className={styles.secondary} onClick={() => openEditor(shelter)}>แก้ไขข้อมูล</button><button type="button" className={styles.danger} onClick={() => { setDeleting(shelter); setDeleteError(""); deleteDialog.current?.showModal(); }}>ลบศูนย์</button></div>
          </div>
        </details>
      ))}</div>}

      <dialog ref={editor} className={styles.modal} onCancel={e => { if (saving) e.preventDefault(); }}>
        <form onSubmit={save}>
          <div className={styles.modalHeading}><h2>{editing ? "แก้ไขข้อมูลศูนย์พักพิง" : "เพิ่มศูนย์พักพิงใหม่"}</h2><button type="button" aria-label="ปิด" disabled={saving} onClick={() => editor.current?.close()}>×</button></div>
          <fieldset disabled={saving} className={styles.fields}>
            <label>ชื่อศูนย์พักพิง *<input autoFocus required maxLength={200} value={draft.shelter_name} onChange={e => setDraft({ ...draft, shelter_name: e.target.value })} /></label>
            <label>จังหวัด<input maxLength={100} value={draft.province} onChange={e => setDraft({ ...draft, province: e.target.value })} /></label>
            <label>เบอร์โทรศัพท์<input type="tel" maxLength={50} value={draft.contact_phone} onChange={e => setDraft({ ...draft, contact_phone: e.target.value })} /></label>
            <label>อีเมล<input type="email" maxLength={254} value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} /></label>
            <label className={styles.wide}>ที่อยู่<textarea rows={3} maxLength={2000} value={draft.address} onChange={e => setDraft({ ...draft, address: e.target.value })} /></label>
          </fieldset>
          {formError && <p className={styles.error} role="alert">{formError}</p>}
          <div className={styles.actions}><button type="button" className={styles.secondary} disabled={saving} onClick={() => editor.current?.close()}>ยกเลิก</button><button className={styles.primary} type="submit" disabled={saving}>{saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}</button></div>
        </form>
      </dialog>

      <dialog ref={animalDialog} className={styles.modal}>
        <div className={styles.modalHeading}><h2>สัตว์ใน {selected?.shelter_name}</h2><button type="button" aria-label="ปิด" onClick={() => animalDialog.current?.close()}>×</button></div>
        <p className={styles.muted}>ทั้งหมด {selectedAnimals.length} ตัว</p>
        {selectedAnimals.length === 0 ? <p className={styles.empty}>ยังไม่มีสัตว์ที่เชื่อมกับศูนย์นี้</p> : <ul className={styles.animalList}>{selectedAnimals.map(a => <li key={a.animal_id}><span className={styles.paw}>♡</span><div><strong>{a.name || "ยังไม่มีชื่อ"}</strong><p>{a.species || "ไม่ระบุประเภท"} · {a.gender || "ไม่ระบุเพศ"}</p><p>{a.status || "ไม่ระบุสถานะ"}</p></div></li>)}</ul>}
        <div className={styles.actions}><a className={styles.secondary} href="/admin/animals">ไปหน้าจัดการสัตว์</a><button type="button" className={styles.primary} onClick={() => animalDialog.current?.close()}>ปิด</button></div>
      </dialog>

      <dialog ref={deleteDialog} className={styles.modal} onCancel={e => { if (busyDelete) e.preventDefault(); }}>
        <h2>ลบศูนย์พักพิง</h2><p>ยืนยันลบ “{deleting?.shelter_name}” ออกจากฐานข้อมูลหรือไม่?</p>
        <p className={styles.muted}>ระบบจะตรวจสอบสัตว์และรายงานที่เชื่อมอยู่ก่อนลบ</p>
        {deleteError && <p className={styles.error} role="alert">{deleteError}</p>}
        <div className={styles.actions}><button type="button" className={styles.secondary} disabled={busyDelete} onClick={() => deleteDialog.current?.close()}>ยกเลิก</button><button type="button" className={styles.danger} disabled={busyDelete} onClick={() => void remove()}>{busyDelete ? "กำลังตรวจสอบและลบ..." : "ยืนยันลบ"}</button></div>
      </dialog>
    </section>
  );
}
