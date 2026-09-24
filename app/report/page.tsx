"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Dynamically load MapPicker on client-side only (avoid Leaflet SSR errors)
const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-2 border border-gray-200">
      <i className="fa-solid fa-spinner fa-spin text-2xl text-primary"></i>
      <span className="text-sm font-prompt">กำลังโหลดแผนที่...</span>
    </div>
  ),
});

export default function ReportPage() {
  const router = useRouter();

  // User state
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Form states
  const [species, setSpecies] = useState<string>("สุนัข");
  const [color, setColor] = useState<string>("");
  const [healthStatus, setHealthStatus] = useState<string>("ปกติ");
  const [customStatus, setCustomStatus] = useState<string>("");
  const [locationText, setLocationText] = useState<string>("");
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 8.6408,
    lng: 99.8953,
  });

  // Image upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Submission states
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check login session
  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.warn("Check auth error:", err);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkUser();
  }, []);

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("ขนาดไฟล์ต้องไม่เกิน 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setCoords({ lat, lng });
  };

  // Submit report to Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentUser) {
      setErrorMessage("กรุณาเข้าสู่ระบบก่อนส่งรายงาน");
      return;
    }

    if (!imageFile) {
      setErrorMessage("กรุณาแนบรูปภาพสัตว์ที่พบ");
      return;
    }

    if (!locationText.trim()) {
      setErrorMessage("กรุณาระบุรายละเอียดสถานที่ที่พบ");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload image via Next.js Server API (bypasses Supabase Storage RLS)
      const formData = new FormData();
      formData.append("file", imageFile);

      const uploadRes = await fetch("/api/reports/upload", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await uploadRes.json();
      if (!uploadRes.ok || uploadResult.error) {
        throw new Error(uploadResult.error || "อัปโหลดรูปภาพไม่สำเร็จ");
      }

      const imageUrl = uploadResult.imageUrl;

      // 2. Prepare user_id from logged in user
      const finalUserId = currentUser.id;

      const finalStatus =
        healthStatus === "อื่นๆ" && customStatus.trim()
          ? customStatus.trim()
          : healthStatus;

      const formattedLocation = `${locationText.trim()} (พิกัด: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`;

      // 3. Insert report into stray_reports table
      const { data: insertData, error: insertError } = await supabase
        .from("stray_reports")
        .insert([
          {
            user_id: finalUserId,
            species: species,
            color: color.trim() || "ไม่ระบุ",
            status: finalStatus,
            location: formattedLocation,
            image_url: imageUrl,
            report_date: new Date().toISOString(),
            approval_status: "รอตรวจสอบ",
          },
        ])
        .select();

      if (insertError) {
        console.error("Insert report error:", insertError);
        throw new Error("ไม่สามารถบันทึกข้อมูลรายงานได้: " + insertError.message);
      }

      setShowSuccessModal(true);
    } catch (err: any) {
      setErrorMessage(err.message || "เกิดข้อผิดพลาดในการส่งรายงาน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Loading state while checking authentication
  if (checkingAuth) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-24 min-h-screen flex flex-col items-center justify-center text-center font-prompt text-gray-500">
        <i className="fa-solid fa-spinner fa-spin text-4xl text-primary mb-4"></i>
        <p className="text-base">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
      </main>
    );
  }

  // 2. Not logged in state: Show login required card
  if (!currentUser) {
    return (
      <main className="max-w-md mx-auto px-6 py-20 min-h-[calc(100vh-120px)] flex flex-col items-center justify-center font-prompt">
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-stone-200/80 text-center w-full">
          <div className="w-16 h-16 bg-bgAccent text-primary rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl shadow-sm">
            <i className="fa-solid fa-lock"></i>
          </div>
          <h2 className="font-mali font-bold text-2xl text-textMain mb-2">
            กรุณาเข้าสู่ระบบก่อนแจ้งเหตุ 🐾
          </h2>
          <p className="text-stone-500 text-xs md:text-sm mb-8 leading-relaxed">
            เพื่อความถูกต้องของข้อมูลและการประสานงานอย่างมีประสิทธิภาพ ระบบจำเป็นต้องให้คุณเข้าสู่ระบบก่อนทำการแจ้งพบสัตว์จรจัด
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full py-3.5 rounded-full bg-primary hover:bg-primaryHover text-white font-mali font-semibold shadow-sm transition duration-200 text-center"
            >
              เข้าสู่ระบบ (Login)
            </Link>
            <Link
              href="/register"
              className="w-full py-3.5 rounded-full border-2 border-primary text-primary hover:bg-bgAccent font-mali font-semibold transition duration-200 text-center"
            >
              สมัครสมาชิกใหม่ (Register)
            </Link>
            <Link
              href="/"
              className="text-stone-400 hover:text-stone-600 text-xs font-prompt pt-2"
            >
              ← กลับสู่หน้าหลัก
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 min-h-screen">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="bg-bgAccent text-primary px-4 py-1.5 rounded-full text-sm font-semibold font-prompt inline-block">
            <i className="fa-solid fa-heart mr-1.5"></i> ร่วมด้วยช่วยกันเพื่อเพื่อนสี่ขา
          </span>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-prompt inline-flex items-center gap-1.5">
            <i className="fa-solid fa-circle-check text-emerald-500"></i>
            ผู้แจ้ง: <strong>{currentUser.name || "ผู้ใช้งาน"}</strong>
          </span>
        </div>
        <h1 className="font-mali font-semibold text-3xl md:text-4xl text-textMain mb-3">
          แจ้งพบเจอสัตว์จรจัด 🐾
        </h1>
        <p className="text-gray-500 font-prompt text-sm md:text-base max-w-lg mx-auto">
          กรอกข้อมูลและปักหมุดตำแหน่งที่พบสัตว์จร เพื่อให้ศูนย์พักพิงและอาสาสมัครเข้าตรวจสอบและให้ความช่วยเหลือได้อย่างรวดเร็ว
        </p>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Upload Image */}
          <div>
            <label className="block font-mali font-semibold text-lg text-textMain mb-2">
              1. รูปภาพสัตว์ที่พบ <span className="text-rose-500">*</span>
            </label>
            <p className="text-xs text-gray-400 font-prompt mb-4">
              ควรถ่ายให้เห็นลักษณะ รูปร่าง และอาการบาดเจ็บ (ถ้ามี) อย่างชัดเจน
            </p>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Drop / Click Box */}
              <label className="w-full md:w-1/2 h-56 border-2 border-dashed border-primary/40 bg-bgAccent/40 hover:bg-bgAccent/70 hover:border-primary rounded-2xl flex flex-col items-center justify-center cursor-pointer transition p-6 text-center">
                <i className="fa-solid fa-camera-retro text-3xl text-primary mb-3"></i>
                <span className="font-prompt text-sm text-textMain font-medium mb-1">
                  คลิกเพื่อถ่ายภาพ หรือ อัปโหลดรูป
                </span>
                <span className="text-xs text-gray-400 font-prompt">
                  รองรับ JPG, PNG, WEBP (สูงสุด 5MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* Preview Box */}
              <div className="w-full md:w-1/2 h-56 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center relative">
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-2 rounded-full text-xs transition"
                      title="ลบรูปภาพ"
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 text-xs font-prompt p-4">
                    <i className="fa-solid fa-image text-2xl mb-2 text-gray-300 block"></i>
                    ตัวอย่างรูปภาพจะแสดงที่นี่
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 2: Animal Details */}
          <div>
            <label className="block font-mali font-semibold text-lg text-textMain mb-4">
              2. ข้อมูลสัตว์เบื้องต้น
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Species */}
              <div>
                <label className="block text-sm font-prompt text-textMain font-medium mb-2">
                  ประเภทสัตว์ <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["สุนัข", "แมว", "อื่นๆ"].map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setSpecies(item)}
                      className={`py-2.5 rounded-xl font-prompt text-sm font-medium border transition flex items-center justify-center gap-2 ${
                        species === item
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white text-textMain border-gray-200 hover:border-primary/50"
                      }`}
                    >
                      {item === "สุนัข" && <i className="fa-solid fa-dog"></i>}
                      {item === "แมว" && <i className="fa-solid fa-cat"></i>}
                      {item === "อื่นๆ" && <i className="fa-solid fa-paw"></i>}
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-prompt text-textMain font-medium mb-2">
                  สี / ลายขน
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="เช่น สีน้ำตาล, ลายสลิด, ขาว-ดำ"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-prompt text-sm focus:outline-none focus:border-primary transition"
                />
              </div>

              {/* Health Status */}
              <div className="md:col-span-2">
                <label className="block text-sm font-prompt text-textMain font-medium mb-2">
                  อาการ / สภาพร่างกายเบื้องต้น <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    "ปกติ",
                    "มีบาดแผล/บาดเจ็บ",
                    "ป่วย/เซื่องซึม",
                    "ผอมโซ/ขาดอาหาร",
                    "ขาหัก/เดินกะเผลก",
                    "อื่นๆ",
                  ].map((statusOption) => (
                    <button
                      type="button"
                      key={statusOption}
                      onClick={() => setHealthStatus(statusOption)}
                      className={`px-4 py-2 rounded-full font-prompt text-xs md:text-sm font-medium border transition ${
                        healthStatus === statusOption
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-textMain border-gray-200 hover:border-primary/40"
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>

                {healthStatus === "อื่นๆ" && (
                  <input
                    type="text"
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value)}
                    placeholder="ระบุอาการเพิ่มเติม..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-prompt text-sm focus:outline-none focus:border-primary transition"
                  />
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Section 3: Location & Leaflet Map */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-mali font-semibold text-lg text-textMain">
                3. พิกัดและสถานที่พบ <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-gray-400 font-prompt">
                พิกัด: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
              </span>
            </div>

            <p className="text-xs text-gray-400 font-prompt mb-4">
              ระบุสถานที่และคลิกปักหมุดบนแผนที่ให้ตรงกับตำแหน่งจริงที่พบสัตว์
            </p>

            <div className="mb-4">
              <input
                type="text"
                required
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="เช่น บริเวณหน้าอาคารไทยบุรี ม.วลัยลักษณ์, หน้าหอพักลักษณานิเวศน์ 1, ศูนย์อาหารพฤกษานนท์"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 font-prompt text-sm focus:outline-none focus:border-primary transition"
              />
            </div>

            {/* Leaflet Map Picker Component */}
            <MapPicker
              initialLat={coords.lat}
              initialLng={coords.lng}
              onLocationSelect={handleLocationSelect}
            />
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl font-prompt text-sm flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-base"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-end">
            <Link
              href="/"
              className="px-6 py-3 rounded-full border border-gray-300 font-mali font-semibold text-gray-600 hover:bg-gray-50 transition text-center"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-full bg-primary hover:bg-primaryHover text-white font-mali font-semibold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  กำลังส่งรายงาน...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i>
                  ส่งรายงานแจ้งพบสัตว์
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              <i className="fa-solid fa-check"></i>
            </div>
            <h3 className="font-mali font-semibold text-2xl text-textMain mb-2">
              ส่งรายงานสำเร็จแล้ว! 🎉
            </h3>
            <p className="text-gray-500 font-prompt text-sm mb-6">
              ขอบคุณสำหรับความช่วยเหลือ ข้อมูลรายงานของคุณถูกส่งไปยังเจ้าหน้าที่และศูนย์พักพิงเรียบร้อยแล้ว
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/my-reports"
                className="w-full py-3 rounded-full bg-primary hover:bg-primaryHover text-white font-mali font-semibold transition"
              >
                ดูประวัติการแจ้งของฉัน
              </Link>
              <Link
                href="/"
                className="w-full py-3 rounded-full border border-gray-200 text-textMain font-mali font-semibold hover:bg-gray-50 transition"
              >
                กลับสู่หน้าหลัก
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}