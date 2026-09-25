// app/admin/care-monitoring/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatThaiDateBE } from "@/lib/dateHelper";

export default function AdminCareMonitoringPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [careLogs, setCareLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingMatchId, setUpdatingMatchId] = useState<string | null>(null);

  // ตรวจสอบสิทธิ์ Admin/Shelter
  useEffect(() => {
    async function verifyAdmin() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        const role = data?.user?.role;
        if (role !== "admin" && role !== "shelter") {
          router.replace("/");
          return;
        }
        setCheckingAuth(false);
      } catch {
        router.replace("/");
      }
    }
    verifyAdmin();
  }, [router]);

  // ดึงข้อมูล Care Logs ทั้งหมดพร้อมข้อมูล Match, สัตว์ และ User
  const fetchAllLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("care_logs")
        .select(`
          log_id,
          match_id,
          log_date,
          activity_type,
          description,
          image_url,
          matches (
            match_id,
            user_id,
            animal_id,
            match_status,
            start_date,
            end_date,
            users:users!matches_user_id_fkey (user_id, full_name, phone),
            animals (animal_id, name, species, image_url, status)
          )
        `)
        .order("log_date", { ascending: false });

      if (error) throw error;
      setCareLogs(data || []);
    } catch (err) {
      console.error("Fetch care logs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!checkingAuth) {
      fetchAllLogs();
    }
  }, [checkingAuth]);

  // ฟังก์ชัน "ปิดเคส / รับเลี้ยงสำเร็จ" ตาม Requirement F5
  const handleCloseCase = async (matchId: string, animalId?: string) => {
    if (!window.confirm("ยืนยันการปิดเคสและเปลี่ยนสถานะเป็น 'รับเลี้ยงสำเร็จ / ได้บ้านแล้ว' หรือไม่?")) {
      return;
    }

    setUpdatingMatchId(matchId);
    try {
      // 1. อัปเดต end_date ในตาราง matches เพื่อปิดเคสการดูแล
      const { error: matchError } = await supabase
        .from("matches")
        .update({
          end_date: new Date().toISOString(),
        })
        .eq("match_id", matchId);

      if (matchError) throw matchError;

      // 2. อัปเดตสถานะในตาราง animals เป็น 'ได้บ้านแล้ว'
      if (animalId) {
        await supabase
          .from("animals")
          .update({ status: "ได้บ้านแล้ว" })
          .eq("animal_id", animalId);
      }

      alert("ปิดเคสสำเร็จเรียบร้อยแล้ว! 🐾");
      fetchAllLogs();
    } catch (err: any) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการปิดเคส: " + (err.message || err));
    } finally {
      setUpdatingMatchId(null);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-prompt text-stone-500">
        <i className="fa-solid fa-spinner fa-spin text-3xl text-[#E29578] mb-3"></i>
        <p className="text-sm">กำลังตรวจสอบสิทธิ์ Admin...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 min-h-screen font-prompt">
      {/* ส่วนหัวหน้า */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-mali font-semibold text-2xl sm:text-3xl text-stone-800">
              ระบบตรวจสอบการดูแลสัตว์ (Care Monitoring) 🩺
            </h1>
            <span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full font-prompt font-semibold">
              Admin Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500">
            ตรวจสอบความคืบหน้ารายเดือน สุขภาพ และภาพถ่ายของสัตว์ที่ถูกรับเลี้ยงไปแล้ว
          </p>
        </div>
        <Link
          href="/admin/animals"
          className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2.5 rounded-full transition flex items-center gap-2"
        >
          <i className="fa-solid fa-arrow-left"></i> กลับหน้าจัดการสัตว์
        </Link>
      </div>

      {/* รายการบันทึกการดูแล */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-stone-400">
          <i className="fa-solid fa-spinner fa-spin text-3xl text-[#E29578] mb-3"></i>
          <p className="text-xs">กำลังโหลดบันทึกการดูแล...</p>
        </div>
      ) : careLogs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-stone-400 border border-stone-100">
          <i className="fa-solid fa-clipboard-list text-4xl text-stone-300 mb-3 block"></i>
          <p className="text-sm font-medium">ยังไม่มีบันทึกการดูแลในระบบ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {careLogs.map((log) => {
            const pet = log.matches?.animals;
            const adopter = log.matches?.users;
            const isClosed = Boolean(log.matches?.end_date);
            const matchStatus = isClosed ? "สิ้นสุดการดูแล" : "กำลังดูแล";

            return (
              <div
                key={log.log_id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 flex flex-col hover:shadow-md transition"
              >
                {/* ข้อมูลสัตว์เลี้ยง & ผู้รับเลี้ยง */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-[#FDF0EB] text-[#C07055] flex items-center justify-center font-bold text-sm shrink-0">
                    <i className="fa-solid fa-paw"></i>
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-sm text-stone-800 font-mali truncate">
                      น้อง {pet?.name || "ไม่มีชื่อ"} ({pet?.species || "สัตว์"})
                    </h3>
                    <p className="text-[11px] text-stone-400 truncate">
                      ผู้รับเลี้ยง: {adopter?.full_name || adopter?.username || "-"} {adopter?.phone ? `(${adopter.phone})` : ""}
                    </p>
                  </div>
                </div>

                {/* ประเภทกิจกรรม & วันที่ */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-[#C07055]">
                    {log.activity_type}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {formatThaiDateBE(log.log_date)}
                  </span>
                </div>

                {/* รายละเอียด */}
                <p className="text-xs text-stone-600 line-clamp-3 mb-3 flex-1 leading-relaxed">
                  {log.description}
                </p>

                {/* รูปภาพที่แนบ */}
                {log.image_url && (
                  <div className="h-40 rounded-2xl overflow-hidden mb-4 bg-stone-100 border border-stone-100">
                    <img
                      src={log.image_url}
                      alt="Care log"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* แถบด้านล่าง: สถานะ & ปุ่มปิดเคส */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                      isClosed
                        ? "bg-purple-50 text-purple-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    ● {matchStatus || "กำลังดูแล"}
                  </span>

                  {!isClosed && log.matches?.match_id && (
                    <button
                      type="button"
                      onClick={() =>
                        handleCloseCase(log.matches.match_id, pet?.animal_id)
                      }
                      disabled={updatingMatchId === log.matches.match_id}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-medium transition cursor-pointer disabled:opacity-50"
                    >
                      {updatingMatchId === log.matches.match_id ? (
                        <i className="fa-solid fa-spinner fa-spin"></i>
                      ) : (
                        <>
                          <i className="fa-solid fa-circle-check mr-1"></i> ปิดเคสสำเร็จ
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
