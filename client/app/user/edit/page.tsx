"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { THAI_PROVINCES } from "@/constants/provinces";
import type { User, UpdateProfilePayload } from "@/types/user";

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // User Profile Form State
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [salary, setSalary] = useState<number | "">("");
  const [housing, setHousing] = useState("บ้านเดี่ยว (มีรั้วรอบขอบชิด)");
  const [petPermission, setPetPermission] = useState(true);
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [animalCount, setAnimalCount] = useState<number>(0);
  const [residenceNote, setResidenceNote] = useState("");

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // ดึงข้อมูลโปรไฟล์เริ่มต้น
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        const json = await res.json();

        if (!res.ok) {
          showToast(json.message || "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้", "error");
          return;
        }

        const data: User = json.user;
        setUser(data);
        setFullName(data.full_name || "");
        setEmail(data.email || "");
        setBirthdate(data.date_of_birth ? data.date_of_birth.substring(0, 10) : "");
        setSalary(data.salary !== null ? data.salary : "");
        setHousing(data.accommodation_type || "บ้านเดี่ยว (มีรั้วรอบขอบชิด)");
        setPetPermission(data.pet_permission ?? true);
        setAddress(data.address || "");
        setProvince(data.province || "");
        setAnimalCount(data.animal_count || 0);
        setResidenceNote(data.residence_note || "");
      } catch {
        showToast("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", "error");
      } finally {
        setLoading(false);
      }
    }

    void fetchProfile();
  }, []);

  // บันทึกข้อมูล
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    if (!fullName.trim()) {
      showToast("กรุณากรอกชื่อ-นามสกุล", "error");
      return;
    }

    setSaving(true);

    const payload: UpdateProfilePayload = {
      full_name: fullName.trim(),
      date_of_birth: birthdate,
      salary: salary !== "" ? Number(salary) : null,
      accommodation_type: housing,
      pet_permission: petPermission,
      address: address.trim(),
      province: province.trim(),
      animal_count: Number(animalCount) || 0,
      residence_note: residenceNote.trim(),
    };

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "บันทึกข้อมูลไม่สำเร็จ");
      }

      setUser(json.user);
      showToast("บันทึกข้อมูลส่วนตัวและคุณสมบัติเรียบร้อยแล้ว!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึก";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  // รีเซ็ตค่าฟอร์มกลับเป็นค่าว่าง
  function handleReset() {
    setBirthdate("");
    setSalary("");
    setAddress("");
    setProvince("");
    setAnimalCount(0);
    setResidenceNote("");
    showToast("ล้างข้อมูลบางส่วนเรียบร้อยแล้ว", "info");
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-mali text-stone-500">กำลังโหลดข้อมูลโปรไฟล์...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF8] text-[#44403C] py-10 px-4 sm:px-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] pointer-events-auto">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg border-l-4 bg-white text-stone-800 font-prompt text-xs transition-all ${
              toast.type === "success"
                ? "border-emerald-500"
                : toast.type === "error"
                ? "border-rose-500"
                : "border-primary"
            }`}
          >
            <span>{toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "💡"}</span>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto w-full">
        {/* Title & Readiness Banner */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-stone-800 font-mali">ข้อมูลส่วนตัวและคุณสมบัติผู้รับเลี้ยง</h2>
          <p className="text-sm text-stone-500 font-prompt mt-1">
            กรอกข้อมูลเหล่านี้ไว้เพื่อความสะดวก ระบบจะดึงข้อมูลชุดนี้ไปใส่ใน <strong>แบบฟอร์มขอรับเลี้ยงสัตว์</strong> อัตโนมัติ
          </p>
          <div className="mt-4 p-4 rounded-2xl bg-bgAccent border border-primary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs font-prompt text-primaryHover">
              <span className="text-lg">💡</span>
              <span>
                กรอกข้อมูลให้ครบถ้วนเพื่อเพิ่มโอกาสในการอนุมัติรับเลี้ยงน้องหมา-แมว
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="text-xs font-prompt font-semibold text-primary hover:text-stone-800 underline self-start sm:self-auto cursor-pointer"
            >
              ดูตัวอย่างฟอร์มขอรับเลี้ยง ➔
            </button>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: ข้อมูลทั่วไป */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-stone-800 border-b border-stone-100 pb-3 flex items-center gap-2 font-mali">
              <span>👤</span> ข้อมูลทั่วไปของผู้ใช้งาน
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-prompt text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1.5">ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1.5">อีเมล (ตามบัญชีผู้ใช้)</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-4 py-3 bg-stone-100 border border-stone-200 text-stone-400 rounded-xl cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1.5">วัน/เดือน/ปีเกิด</label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1.5">รายได้เฉลี่ยต่อเดือน (บาท)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="เช่น 35000"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary focus:bg-white outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: ข้อมูลที่พักอาศัย */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-stone-800 border-b border-stone-100 pb-3 flex items-center gap-2 font-mali">
              <span>🏡</span> ข้อมูลที่พักอาศัย (Residential)
            </h3>

            <div className="space-y-4 font-prompt text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-stone-700 mb-1.5">ลักษณะที่พักอาศัย</label>
                  <select
                    value={housing}
                    onChange={(e) => setHousing(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary focus:bg-white outline-none transition"
                  >
                    <option value="บ้านเดี่ยว (มีรั้วรอบขอบชิด)">บ้านเดี่ยว (มีรั้วรอบขอบชิด)</option>
                    <option value="ทาวน์โฮม / ทาวน์เฮาส์">ทาวน์โฮม / ทาวน์เฮาส์</option>
                    <option value="คอนโดมิเนียม (Pet-Friendly)">คอนโดมิเนียม (Pet-Friendly)</option>
                    <option value="อพาร์ตเมนต์ / หอพัก">อพาร์ตเมนต์ / หอพัก</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1.5">จังหวัด</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary focus:bg-white outline-none transition"
                  >
                    <option value="">-- เลือกจังหวัด --</option>
                    {THAI_PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1.5">ที่อยู่โดยละเอียด (บ้านเลขที่, ถนน, ตำบล, อำเภอ, รหัสไปรษณีย์)</label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="เช่น 88/12 หมู่บ้านแสนสุข ซอยพหลโยธิน 32 แขวงจันทรเกษม เขตจตุจักร 10900"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary focus:bg-white outline-none transition leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="permission-check"
                  checked={petPermission}
                  onChange={(e) => setPetPermission(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-stone-300 focus:ring-primary accent-primary cursor-pointer"
                />
                <label htmlFor="permission-check" className="text-stone-700 font-medium cursor-pointer">
                  สถานที่พักอาศัยนี้อนุญาตให้เลี้ยงสัตว์เลี้ยงได้อย่างถูกต้อง
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: ครัวเรือนและสัตว์เลี้ยงเดิม */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200/80 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-stone-800 border-b border-stone-100 pb-3 flex items-center gap-2 font-mali">
              <span>🐾</span> สมาชิกในบ้านและสัตว์เลี้ยงปัจจุบัน
            </h3>

            <div className="space-y-4 font-prompt text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1.5">จำนวนสัตว์เลี้ยงเดิมที่มีอยู่ในบ้าน (ตัว)</label>
                <input
                  type="number"
                  min="0"
                  value={animalCount}
                  onChange={(e) => setAnimalCount(Number(e.target.value))}
                  className="w-full sm:w-1/3 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary focus:bg-white outline-none transition"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1.5">
                  บริบทสมาชิกในบ้าน / รายละเอียดสัตว์เดิม (ถ้ามี)
                </label>
                <textarea
                  rows={3}
                  value={residenceNote}
                  onChange={(e) => setResidenceNote(e.target.value)}
                  placeholder="เช่น อาศัยอยู่คนเดียว ไม่มีเด็กเล็ก / มีแมวไทย 1 ตัว ทำหมันและฉีดวัคซีนแล้ว"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-primary focus:bg-white outline-none transition leading-relaxed"
                />
                <span className="text-[11px] text-stone-400 mt-1 block">
                  * ข้อมูลนี้ใช้ประกอบการพิจารณาความพร้อมของสถานที่และความเข้ากันได้กับสัตว์เลี้ยง
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 rounded-2xl border border-stone-200 text-stone-500 font-prompt text-xs font-semibold hover:bg-stone-50 transition cursor-pointer"
            >
              ล้างค่าเดิม
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-2xl text-xs font-semibold font-prompt shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? "กำลังบันทึก..." : "บันทึกข้อมูลส่วนตัว"}
            </button>
          </div>
        </form>
      </main>

      {/* Modal: Adoption Application Form Preview */}
      {previewOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 shadow-xl border border-stone-100 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setPreviewOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center font-bold text-xs cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">📋</span>
              <div>
                <h3 className="text-lg font-bold text-stone-800 font-mali">ฟอร์มขอรับเลี้ยงสัตว์ (ตัวอย่าง Auto-Fill)</h3>
                <p className="text-xs text-stone-500 font-prompt">
                  ข้อมูลชุดนี้จะถูกส่งต่อไปยังแบบฟอร์มยื่นขอรับเลี้ยงสัตว์อัตโนมัติ
                </p>
              </div>
            </div>

            {/* Mock Pet Card */}
            <div className="flex items-center gap-3 bg-bgAccent/70 p-3 rounded-2xl mb-5 border border-primary/20">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-xl">
                🐶
              </div>
              <div>
                <p className="font-itim text-base text-stone-800">เคสตัวอย่าง: น้องหมูปิ้ง (หาบ้าน)</p>
                <p className="text-[11px] font-prompt text-primaryHover">พิกัดศูนย์พักพิงในระบบ</p>
              </div>
            </div>

            {/* Auto-populated Fields */}
            <div className="space-y-3 font-prompt text-xs border border-stone-200/80 rounded-2xl p-5 bg-stone-50/50">
              <div className="flex justify-between border-b border-stone-200/60 pb-2">
                <span className="text-stone-400">ผู้ยื่นคำขอ:</span>
                <span className="font-semibold text-stone-800">{fullName || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200/60 pb-2">
                <span className="text-stone-400">อีเมลติดต่อ:</span>
                <span className="text-stone-700">{email || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200/60 pb-2">
                <span className="text-stone-400">วันเดือนปีเกิด:</span>
                <span className="text-stone-700">{birthdate || "-"}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200/60 pb-2">
                <span className="text-stone-400">ระดับรายได้ต่อเดือน:</span>
                <span className="text-stone-700">{salary ? `${Number(salary).toLocaleString()} บาท` : "-"}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200/60 pb-2">
                <span className="text-stone-400">ลักษณะที่อยู่อาศัย:</span>
                <span className="text-stone-700">{housing}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200/60 pb-2">
                <span className="text-stone-400">อนุญาตให้เลี้ยงสัตว์:</span>
                <span className="text-stone-700">{petPermission ? "ใช่ (อนุญาต)" : "ไม่อนุญาต"}</span>
              </div>
              <div className="border-b border-stone-200/60 pb-2">
                <span className="text-stone-400 block mb-1">ที่อยู่ฉบับเต็ม:</span>
                <span className="text-stone-700 leading-relaxed block font-medium">
                  {address ? `${address} ${province ? `จ.${province}` : ""}` : "ยังไม่ได้ระบุที่อยู่"}
                </span>
              </div>
              <div className="border-b border-stone-200/60 pb-2">
                <span className="text-stone-400 block mb-1">จำนวนสัตว์เลี้ยงเดิม:</span>
                <span className="text-stone-700">{animalCount} ตัว</span>
              </div>
              <div>
                <span className="text-stone-400 block mb-1">สมาชิกในบ้านและบริบทที่พัก:</span>
                <span className="text-stone-700">{residenceNote || "-"}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 font-prompt">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-xl text-xs cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}