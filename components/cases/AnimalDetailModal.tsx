"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Animal } from "@/types/animal";
import { getAnimalImages } from "@/lib/animalImageHelper";

interface Props {
  selectedAnimal: Animal | null;
  currentUser: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AnimalDetailModal({
  selectedAnimal,
  currentUser,
  onClose,
  onSuccess,
}: Props) {
  const router = useRouter();

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [hasUserRequested, setHasUserRequested] = useState<boolean>(false);
  const [isCheckingRequest, setIsCheckingRequest] = useState<boolean>(false);

  // ควบคุม Popup ยืนยันสีส้มพีช
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState<boolean>(false);

  // ตรวจสอบประวัติการขอน้องตัวนี้เฉพาะ User ปัจจุบัน
  useEffect(() => {
    setCurrentImageIndex(0);
    setHasUserRequested(false);
    setIsConfirmOpen(false);

    async function checkExistingRequest() {
      if (!selectedAnimal || !currentUser) return;
      const currentUserId = currentUser.id || currentUser.user_id || currentUser.userId;
      if (!currentUserId) return;

      setIsCheckingRequest(true);
      try {
        const { data, error } = await supabase
          .from("matches")
          .select("match_id, match_status, user_id")
          .eq("animal_id", selectedAnimal.animal_id)
          .eq("user_id", currentUserId);

        if (!error && data && data.length > 0) {
          const isSelfRequested = data.some(
            (m: any) =>
              m.user_id === currentUserId &&
              ["รออนุมัติ", "กำลังดูแล", "อนุมัติ"].includes(m.match_status)
          );
          setHasUserRequested(isSelfRequested);
        } else {
          setHasUserRequested(false);
        }
      } catch (err) {
        setHasUserRequested(false);
      } finally {
        setIsCheckingRequest(false);
      }
    }

    checkExistingRequest();
  }, [selectedAnimal, currentUser]);

  if (!selectedAnimal) return null;

  const images = getAnimalImages(selectedAnimal.image_url);

  const getDaysInShelter = (dateString?: string) => {
    if (!dateString) return 0;
    const diffTime = Math.abs(new Date().getTime() - new Date(dateString).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getHealthBadgeStyle = (health?: string) => {
    switch (health) {
      case "ปกติ":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "ป่วย":
        return "bg-amber-100 text-amber-700 border-amber-200"; // เหลืองส้ม
      case "บาดเจ็บ":
        return "bg-rose-100 text-rose-700 border-rose-200";     // แดง
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };



  // 🛡️ ตรวจสอบว่ากรอกข้อมูลส่วนตัวและความพร้อมในตาราง users ครบหรือยัง
  const handlePreAdoptCheck = async () => {
    const currentUserId = currentUser?.id || currentUser?.user_id || currentUser?.userId;
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    setIsCheckingProfile(true);
    try {
      const { data: profile, error } = await supabase
        .from("users")
        .select("phone, accommodation_type, address, province, full_name")
        .eq("user_id", currentUserId)
        .maybeSingle();

      if (error) throw error;

      // เงื่อนไข: ต้องมีเบอร์โทร, ประเภทที่พัก และที่อยู่/ชื่อ
      const isProfileComplete = Boolean(
        profile?.phone?.trim() &&
        profile?.accommodation_type?.trim() &&
        (profile?.address?.trim() || profile?.province?.trim() || profile?.full_name?.trim())
      );


      // กรอกข้อมูล
      // ถ้ายังไม่ครบ ให้แจ้งเตือนและพาไปหน้ากรอกข้อมูลโปรไฟล์ทันที
      if (!isProfileComplete) {
        //alert("กรุณากรอกข้อมูลส่วนตัวและความพร้อมในการเลี้ยงสัตว์ให้ครบถ้วนก่อนยื่นคำขอรับเลี้ยง");
        router.push("/user/edit");
        return;
      }

      // ถ้ากรอกข้อมูลครบแล้ว ให้เปิด Popup ยืนยันตามระบบเดิม
      setIsConfirmOpen(true);
    } catch (err: any) {
      alert("เกิดข้อผิดพลาดในการตรวจสอบโปรไฟล์: " + (err.message || err));
    } finally {
      setIsCheckingProfile(false);
    }
  };

  // ดำเนินการยื่นคำขอรับเลี้ยงหลังกดยืนยันใน Popup
  const handleExecuteAdopt = async () => {
    if (!selectedAnimal || !currentUser) return;
    setIsSubmitting(true);
    try {
      const currentUserId = currentUser.id || currentUser.user_id || currentUser.userId;
      if (!currentUserId) {
        alert("ไม่พบรหัสผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
        return;
      }

      // 1. บันทึกลงตาราง matches
      const { error: matchError } = await supabase.from("matches").insert([
        {
          animal_id: selectedAnimal.animal_id,
          user_id: currentUserId,
          match_status: "รออนุมัติ",
        },
      ]);
      if (matchError) throw matchError;

      // 2. ปรับสถานะสัตว์เป็น 'รอการอนุมัติ'
      await supabase
        .from("animals")
        .update({ status: "รอการอนุมัติ" })
        .eq("animal_id", selectedAnimal.animal_id);

      setHasUserRequested(true);
      setIsConfirmOpen(false);
      onSuccess();
    } catch (err: any) {
      console.error("Error adopting animal:", err);
      alert("เกิดข้อผิดพลาด: " + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* 🌟 1. อนุญาตให้จอมือถือเลื่อนทั้งกล่องด้วย overflow-y-auto ส่วนจอคอมคงเดิมด้วย lg:overflow-hidden */}
        <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row relative shadow-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/80 backdrop-blur text-gray-500 hover:text-primary hover:bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm z-20 transition cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>

          {/* 🌟 2. ฝั่งซ้าย (รูปภาพ) ใส่ shrink-0 เพื่อไม่ให้รูปโดนบีบเวลายืด-หด */}
          <div className="w-full lg:w-1/2 bg-gray-50/50 p-4 sm:p-6 flex flex-col justify-start gap-4 border-b lg:border-b-0 lg:border-r border-gray-100 shrink-0">
            <div className="relative w-full aspect-[4/3] sm:min-h-[320px] max-h-[400px] bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center group">
              <img
                src={images[currentImageIndex] || images[0]}
                alt={selectedAnimal.name}
                className="w-full h-full object-cover select-none transition-all duration-300"
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md cursor-pointer transition"
                  >
                    <i className="fa-solid fa-chevron-left text-sm"></i>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md cursor-pointer transition"
                  >
                    <i className="fa-solid fa-chevron-right text-sm"></i>
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 shrink-0">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer ${currentImageIndex === idx
                      ? "border-primary scale-95 shadow-sm"
                      : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                  >
                    <img src={imgUrl} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 🌟 3. ฝั่งขวา (ข้อความ) ตั้งค่าให้มือถือเลื่อนยาวต่อเนื่อง overflow-y-visible ส่วนคอมเลื่อนแยกฝั่ง lg:overflow-y-auto */}
          <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col overflow-y-visible lg:overflow-y-auto flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                สถานะ: {selectedAnimal.status}
              </span>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${getHealthBadgeStyle(
                  selectedAnimal.health_status
                )}`}
              >
                สุขภาพ: {selectedAnimal.health_status || "ปกติ"}
              </span>
              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                <i className="fa-regular fa-clock text-amber-600"></i> รอคอยบ้านมาแล้ว{" "}
                {getDaysInShelter(selectedAnimal.created_at)} วัน
              </span>
            </div>

            <h2 className="font-itim text-4xl sm:text-5xl text-textMain mb-4 flex items-center gap-4">
              {selectedAnimal.name}
              <i
                className={`fa-solid ${selectedAnimal.gender === "ตัวเมีย" ? "fa-venus text-pink-400" : "fa-mars text-blue-400"
                  } text-3xl`}
              ></i>
            </h2>

            {selectedAnimal.health_status !== "ปกติ" && selectedAnimal.health_description && (
              <div className="mb-4 p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                <i className="fa-solid fa-notes-medical mt-0.5 text-base text-amber-600 shrink-0"></i>
                <div className="leading-relaxed">
                  <span className="font-semibold text-amber-800">ข้อมูลสุขภาพ/กายภาพเพิ่มเติม: </span>
                  {selectedAnimal.health_description}
                </div>
              </div>
            )}

            <div className="mb-5 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
              <p className="text-xs text-gray-400 font-semibold mb-1 flex items-center gap-1.5">
                <i className="fa-solid fa-quote-left text-primary"></i> เรื่องราวและลักษณะนิสัย
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedAnimal.description ||
                  "น้องเป็นมิตร ร่าเริง สุขภาพพร้อมย้ายเข้าบ้านใหม่และต้องการความรักจากครอบครัวที่อบอุ่น"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-4 mb-6">
              <div>
                <p className="text-xs text-gray-400 mb-1">ประเภท</p>
                <p className="font-semibold text-textMain">{selectedAnimal.species}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">ช่วงอายุ</p>
                <p className="font-semibold text-textMain">{selectedAnimal.age}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">สีหลัก</p>
                <p className="font-semibold text-textMain">{selectedAnimal.color}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">การทำหมัน</p>
                <p className="font-semibold text-textMain">{selectedAnimal.is_neutered ? "ทำหมันแล้ว" : "ยังไม่ทำหมัน"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-1">ประวัติวัคซีน</p>
                <p className="font-semibold text-textMain">{selectedAnimal.vaccine || "ยังไม่ได้รับวัคซีน"}</p>
              </div>
            </div>

            <div className="mb-6 border-t border-gray-100 pt-4">
              <h4 className="font-mali font-semibold text-base mb-2">📍 ศูนย์ที่ดูแล</h4>
              <div className="bg-bgMain p-3 rounded-xl text-sm">
                <p className="font-semibold text-textMain">{selectedAnimal.shelters?.shelter_name}</p>
                <p className="text-gray-500">{selectedAnimal.shelters?.address}</p>
                <p className="text-gray-500">โทร: {selectedAnimal.shelters?.contact_phone}</p>
              </div>
            </div>

            {/* ปุ่มยื่นคำขอรับเลี้ยง */}
            <div className="mt-auto pt-2">
              {!currentUser ? (
                <Link
                  href="/login"
                  className="w-full font-mali font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl flex justify-center items-center gap-2 transition duration-200 text-center"
                >
                  <i className="fa-solid fa-lock"></i> เข้าสู่ระบบเพื่อขอรับเลี้ยง
                </Link>
              ) : isCheckingRequest || isCheckingProfile ? (
                <button
                  type="button"
                  disabled
                  className="w-full font-mali font-semibold bg-gray-100 text-gray-400 py-3 rounded-xl flex justify-center items-center gap-2 cursor-wait"
                >
                  <i className="fa-solid fa-spinner fa-spin"></i> กำลังตรวจสอบข้อมูล...
                </button>
              ) : hasUserRequested ? (
                <button
                  type="button"
                  disabled
                  className="w-full font-mali font-semibold bg-amber-50 text-amber-700 border border-amber-200 py-3 rounded-xl cursor-not-allowed flex justify-center items-center gap-2"
                >
                  <i className="fa-solid fa-clock"></i> คำขอรับเลี้ยงกำลังรอการอนุมัติ
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePreAdoptCheck}
                  className="w-full font-mali font-semibold bg-[#C07055] hover:bg-[#A85D45] text-white py-3 rounded-xl shadow-md flex justify-center items-center gap-2 transition duration-200 cursor-pointer"
                >
                  <i className="fa-solid fa-heart"></i> ยื่นคำขอรับเลี้ยงน้อง 🐾
                </button>
              )}
              {currentUser?.role === "user" && !isCheckingRequest && !isCheckingProfile && !hasUserRequested && (
                <Link
                  href={`/adoption-requests/new/${selectedAnimal.animal_id}`}
                  onClick={onClose}
                  className="mt-3 w-full font-mali font-semibold border border-[#C07055] text-[#C07055] hover:bg-[#FDF0EB] py-3 rounded-xl flex justify-center items-center gap-2 transition duration-200 text-center"
                >
                  กรอกแบบฟอร์มขอรับเลี้ยง
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* กล่อง Pop-up ยืนยันสไตล์โมเดิร์นสีส้มพีช */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl border border-gray-100">
            <div className="px-6 py-4 flex items-center gap-3 text-white bg-[#E29578]">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <i className="fa-solid fa-heart text-base"></i>
              </div>
              <h3 className="font-mali font-semibold text-lg">ยืนยันการยื่นคำขอรับเลี้ยง</h3>
            </div>

            <div className="p-6 font-prompt">
              <p className="text-xs text-gray-400 font-semibold mb-1">เป้าหมายที่ดำเนินการ:</p>
              <p className="text-base font-semibold text-stone-800 mb-3 flex items-center gap-2 font-mali">
                <i className="fa-solid fa-paw text-[#C07055] text-sm"></i>
                {selectedAnimal.name || "ไม่ระบุชื่อ"}
              </p>

              <div className="text-xs text-gray-600 leading-relaxed bg-[#FDF0EB]/60 p-4 rounded-xl border border-[#E29578]/20 mb-6">
                ระบบจะส่งคำขอรับเลี้ยงไปยังเจ้าหน้าที่ศูนย์พักพิงเพื่อพิจารณาความพร้อม คุณต้องการยืนยันการทำรายการหรือไม่?
              </div>

              <div className="flex justify-end items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsConfirmOpen(false)}
                  className="px-5 py-2.5 text-xs font-mali font-medium text-gray-500 hover:text-gray-800 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleExecuteAdopt}
                  className="px-6 py-2.5 rounded-xl text-xs font-mali font-semibold text-white bg-[#C07055] hover:bg-[#A85D45] shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> กำลังส่งคำขอ...
                    </>
                  ) : (
                    "ยืนยันการส่งคำขอ"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}