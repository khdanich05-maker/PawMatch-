"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

type Draft = {
  shelter_name: string;
  province: string;
  contact_phone: string;
  email: string;
  address: string;
};

const emptyDraft: Draft = {
  shelter_name: "",
  province: "",
  contact_phone: "",
  email: "",
  address: "",
};

const columns =
  "shelter_id,user_id,shelter_name,province,contact_phone,email,address";

function message(error: unknown) {
  if (typeof error === "object" && error && "message" in error) {
    return String(error.message);
  }

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

  const load = useCallback(async () => {
    const id = ++requestId.current;

    setLoading(true);
    setError("");
    setAnimalError("");

    try {
      const rows: Shelter[] = [];

      for (let offset = 0; ; offset += 500) {
        const result = await supabase
          .from("shelters")
          .select(columns)
          .order("shelter_id")
          .range(offset, offset + 499);

        if (result.error) throw result.error;

        rows.push(...(result.data ?? []));

        if ((result.data?.length ?? 0) < 500) break;
      }

      if (id !== requestId.current) return;

      setShelters(
        rows.sort((a, b) =>
          a.shelter_name.localeCompare(b.shelter_name, "th")
        )
      );

      try {
        const list: Animal[] = [];

        for (let offset = 0; ; offset += 500) {
          const result = await supabase
            .from("animals")
            .select("animal_id,shelter_id,name,species,gender,status")
            .order("animal_id")
            .range(offset, offset + 499);

          if (result.error) throw result.error;

          list.push(...(result.data ?? []));

          if ((result.data?.length ?? 0) < 500) break;
        }

        if (id === requestId.current) {
          setAnimals(list);
        }
      } catch (err) {
        if (id === requestId.current) {
          setAnimals([]);
          setAnimalError(message(err));
        }
      }
    } catch (err) {
      if (id === requestId.current) {
        setError(message(err));
      }
    } finally {
      if (id === requestId.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void load();

    return () => {
      requestId.current += 1;
    };
  }, [load]);

  function openEditor(shelter: Shelter | null) {
    setEditing(shelter);

    setDraft(
      shelter
        ? {
          shelter_name: shelter.shelter_name,
          province: shelter.province ?? "",
          contact_phone: shelter.contact_phone ?? "",
          email: shelter.email ?? "",
          address: shelter.address ?? "",
        }
        : { ...emptyDraft }
    );

    setFormError("");
    editor.current?.showModal();
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    if (!draft.shelter_name.trim()) {
      setFormError("กรุณากรอกชื่อศูนย์พักพิง");
      return;
    }

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
      const result = editing
        ? await supabase
          .from("shelters")
          .update(values)
          .eq("shelter_id", editing.shelter_id)
          .select(columns)
          .single()
        : await supabase
          .from("shelters")
          .insert(values)
          .select(columns)
          .single();

      if (result.error) throw result.error;

      setNotice(editing ? "บันทึกการแก้ไขแล้ว" : "เพิ่มศูนย์พักพิงแล้ว");

      editor.current?.close();
      await load();
    } catch (err) {
      setFormError(message(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleting || busyDelete) return;

    setBusyDelete(true);
    setDeleteError("");

    try {
      for (const table of ["animals", "stray_reports"]) {
        const check = await supabase
          .from(table)
          .select("shelter_id", { count: "exact", head: true })
          .eq("shelter_id", deleting.shelter_id);

        if (check.error) {
          throw new Error(
            "ตรวจสอบข้อมูลที่เชื่อมกับศูนย์ไม่ได้: " + check.error.message
          );
        }

        if ((check.count ?? 0) > 0) {
          throw new Error(
            "ศูนย์นี้ยังมีสัตว์หรือรายงานเชื่อมอยู่ กรุณาจัดการข้อมูลที่เกี่ยวข้องก่อนลบ"
          );
        }
      }

      const result = await supabase
        .from("shelters")
        .delete()
        .eq("shelter_id", deleting.shelter_id)
        .select("shelter_id")
        .single();

      if (result.error) throw result.error;

      deleteDialog.current?.close();
      setDeleting(null);
      setNotice("ลบศูนย์พักพิงแล้ว");

      await load();
    } catch (err) {
      setDeleteError(message(err));
    } finally {
      setBusyDelete(false);
    }
  }

  const filtered = shelters.filter((s) =>
    `${s.shelter_name} ${s.province ?? ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  const selectedAnimals = animals.filter(
    (a) => a.shelter_id === selected?.shelter_id
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-[75vh] font-prompt text-textMain">
      {/* ส่วนหัว */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <p className="text-xs tracking-widest text-[#98654f] font-semibold uppercase mb-1">
            GOHOME / SHELTER MANAGEMENT
          </p>

          <h1 className="font-mali font-semibold text-2xl text-textMain">
            จัดการศูนย์พักพิง 🏠
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            เครือข่ายแห่งการดูแล เพื่อให้ทุกชีวิตมีบ้าน
          </p>
        </div>
      </header>

      {/* หัวข้อและปุ่มเพิ่มศูนย์ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="font-mali font-semibold text-xl sm:text-1xl text-textMain">
          เครือข่ายศูนย์พักพิง
        </h2>

        <button
          type="button"
          onClick={() => openEditor(null)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-5 py-2.5 rounded-xl font-mali font-semibold text-sm transition shadow-sm"
        >
          <i className="fa-solid fa-plus"></i>
          เพิ่มศูนย์พักพิง
        </button>
      </div>

      {/* ค้นหา */}
      <div className="max-w-md mb-6">
        <label className="block text-xs text-gray-500 mb-1.5 font-medium">
          ค้นหาศูนย์หรือจังหวัด
        </label>

        <div className="relative">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="พิมพ์ชื่อศูนย์พักพิงหรือจังหวัด..."
            className="w-full bg-white border border-gray-200 text-sm rounded-xl px-4 py-2.5 pl-10 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
          />

          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-gray-400 text-xs"></i>
        </div>
      </div>

      {/* สถานะ */}
      {notice && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-xs sm:text-sm mb-4">
          <i className="fa-solid fa-circle-check mr-2"></i>
          {notice}
        </div>
      )}

      {loading && (
        <p className="text-center py-16 text-gray-400 font-mali">
          กำลังโหลดข้อมูล...
        </p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs sm:text-sm mb-4">
          โหลดศูนย์พักพิงไม่สำเร็จ: {error}
        </div>
      )}

      {animalError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs sm:text-sm mb-4">
          โหลดข้อมูลสัตว์ไม่สำเร็จ: {animalError}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
          {search ? "ไม่พบศูนย์ที่ตรงกับคำค้นหา" : "ยังไม่มีศูนย์พักพิง"}
        </div>
      )}

      {/* รายชื่อศูนย์พักพิง */}
      {!loading && !error && (
        <div className="grid gap-4">
          {filtered.map((shelter) => (
            <details
              key={shelter.shelter_id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm transition group"
            >
              <summary className="cursor-pointer bg-bgAccent/70 hover:bg-bgAccent px-5 sm:px-6 py-4 flex items-center justify-between transition list-none">
                <span className="font-mali font-semibold text-base sm:text-lg text-textMain flex items-center gap-2">
                  <i className="fa-solid fa-house-chimney text-primary text-sm"></i>
                  {shelter.shelter_name}
                </span>

                <span className="text-xs bg-white text-gray-600 px-3 py-1 rounded-full border border-gray-100 font-medium">
                  {shelter.province || "ไม่ระบุจังหวัด"}
                </span>
              </summary>

              <div className="p-5 sm:p-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="md:col-span-2 space-y-3 text-sm text-gray-600">
                    <p>
                      <span className="font-semibold text-textMain inline-block w-24">
                        📍 ที่อยู่:
                      </span>
                      {shelter.address || "ไม่ได้ระบุ"}
                    </p>

                    <p>
                      <span className="font-semibold text-textMain inline-block w-24">
                        📞 เบอร์โทร:
                      </span>
                      {shelter.contact_phone || "ไม่ได้ระบุ"}
                    </p>

                    <p>
                      <span className="font-semibold text-textMain inline-block w-24">
                        ✉️ อีเมล:
                      </span>
                      {shelter.email || "ไม่ได้ระบุ"}
                    </p>
                  </div>

                  <div className="bg-[#FCFAF8] border border-gray-100 rounded-xl p-4 text-center">
                    <strong className="font-mali text-3xl text-primary font-bold block">
                      {animalError
                        ? "—"
                        : animals.filter(
                          (a) => a.shelter_id === shelter.shelter_id
                        ).length}
                    </strong>

                    <p className="text-xs text-gray-500 mb-2">
                      สัตว์ที่สังกัดศูนย์นี้
                    </p>

                    <button
                      type="button"
                      disabled={!!animalError}
                      onClick={() => {
                        setSelected(shelter);
                        animalDialog.current?.showModal();
                      }}
                      className="text-xs text-[#925338] hover:underline font-medium disabled:opacity-50"
                    >
                      ดูรายชื่อสัตว์ →
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => openEditor(shelter)}
                    className="px-4 py-2 border border-gray-200 hover:bg-[#FAF7F5] rounded-xl text-xs font-semibold text-textMain transition inline-flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                    แก้ไขข้อมูล
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDeleting(shelter);
                      setDeleteError("");
                      deleteDialog.current?.showModal();
                    }}
                    className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                    ลบศูนย์
                  </button>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}

      {/* เพิ่ม / แก้ไขศูนย์พักพิง */}
      <dialog
        ref={editor}
        className="rounded-3xl p-6 sm:p-8 max-w-lg w-[92%] backdrop:bg-black/40 shadow-2xl open:animate-in open:fade-in open:zoom-in-95"
        onCancel={(e) => {
          if (saving) e.preventDefault();
        }}
      >
        <form onSubmit={save}>
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
            <h2 className="font-mali font-semibold text-xl text-textMain">
              {editing ? "แก้ไขข้อมูลศูนย์พักพิง" : "เพิ่มศูนย์พักพิงใหม่"}
            </h2>

            <button
              type="button"
              disabled={saving}
              onClick={() => editor.current?.close()}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>

          <fieldset disabled={saving} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                ชื่อศูนย์พักพิง *
              </label>
              <input
                autoFocus
                required
                maxLength={200}
                value={draft.shelter_name}
                onChange={(e) =>
                  setDraft({ ...draft, shelter_name: e.target.value })
                }
                className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 mb-1 font-medium">
                  จังหวัด
                </label>
                <input
                  maxLength={100}
                  value={draft.province}
                  onChange={(e) =>
                    setDraft({ ...draft, province: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-600 mb-1 font-medium">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  maxLength={50}
                  value={draft.contact_phone}
                  onChange={(e) =>
                    setDraft({ ...draft, contact_phone: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                อีเมล
              </label>
              <input
                type="email"
                maxLength={254}
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1 font-medium">
                ที่อยู่
              </label>
              <textarea
                rows={3}
                maxLength={2000}
                value={draft.address}
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                className="w-full border border-gray-200 rounded-xl p-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-y"
              />
            </div>
          </fieldset>

          {formError && (
            <p className="text-red-500 text-xs mt-3 bg-red-50 p-2.5 rounded-lg">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={saving}
              onClick={() => editor.current?.close()}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-primary hover:bg-primaryHover text-white rounded-xl text-xs font-semibold transition disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      </dialog>

      {/* รายชื่อสัตว์ในศูนย์ */}
      <dialog
        ref={animalDialog}
        className="rounded-3xl p-6 sm:p-8 max-w-lg w-[92%] backdrop:bg-black/40 shadow-2xl open:animate-in open:fade-in open:zoom-in-95"
      >
        <div className="flex justify-between items-center pb-3 mb-2 border-b border-gray-100">
          <h2 className="font-mali font-semibold text-lg sm:text-xl text-textMain">
            สัตว์ใน {selected?.shelter_name}
          </h2>

          <button
            type="button"
            onClick={() => animalDialog.current?.close()}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-4">
          ทั้งหมด {selectedAnimals.length} ตัว
        </p>

        {selectedAnimals.length === 0 ? (
          <p className="text-center py-10 text-xs text-gray-400 border border-dashed rounded-xl">
            ยังไม่มีสัตว์ที่เชื่อมกับศูนย์นี้
          </p>
        ) : (
          <ul className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1 text-sm">
            {selectedAnimals.map((a) => (
              <li
                key={a.animal_id}
                className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50"
              >
                <span className="w-9 h-9 rounded-full bg-bgAccent text-[#a65f44] flex items-center justify-center text-sm">
                  🐾
                </span>

                <div>
                  <strong className="font-mali text-textMain block">
                    {a.name || "ยังไม่มีชื่อ"}
                  </strong>
                  <p className="text-xs text-gray-500">
                    {a.species || "ไม่ระบุประเภท"} ·{" "}
                    {a.gender || "ไม่ระบุเพศ"} ·{" "}
                    {a.status || "ไม่ระบุสถานะ"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-gray-100">
          <Link
            href="/admin/animals"
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            ไปหน้าจัดการสัตว์
          </Link>

          <button
            type="button"
            onClick={() => animalDialog.current?.close()}
            className="px-5 py-2 bg-primary hover:bg-primaryHover text-white rounded-xl text-xs font-semibold transition"
          >
            ปิด
          </button>
        </div>
      </dialog>

      {/* ยืนยันการลบศูนย์ */}
      <dialog
        ref={deleteDialog}
        className="rounded-3xl p-6 sm:p-8 max-w-sm w-[92%] backdrop:bg-black/40 shadow-2xl text-center open:animate-in open:fade-in open:zoom-in-95"
        onCancel={(e) => {
          if (busyDelete) e.preventDefault();
        }}
      >
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3 text-xl">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>

        <h2 className="font-mali font-bold text-lg text-textMain mb-1">
          ลบศูนย์พักพิง
        </h2>

        <p className="text-xs sm:text-sm text-gray-600 mb-2">
          ยืนยันลบ “{deleting?.shelter_name}” หรือไม่?
        </p>

        <p className="text-[11px] text-gray-400 mb-4">
          ระบบจะตรวจสอบสัตว์และรายงานที่เชื่อมอยู่ก่อนลบ
        </p>

        {deleteError && (
          <p className="text-red-600 text-xs mb-4 bg-red-50 p-2.5 rounded-xl text-left">
            {deleteError}
          </p>
        )}

        <div className="flex justify-center gap-2.5 pt-2">
          <button
            type="button"
            disabled={busyDelete}
            onClick={() => deleteDialog.current?.close()}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            ยกเลิก
          </button>

          <button
            type="button"
            disabled={busyDelete}
            onClick={() => void remove()}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50"
          >
            {busyDelete ? "กำลังลบ..." : "ยืนยันลบ"}
          </button>
        </div>
      </dialog>
    </main>
  );
}