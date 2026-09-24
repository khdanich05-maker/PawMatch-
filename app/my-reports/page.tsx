"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { StrayReport } from "@/types/strayReport";

export default function MyReportsPage() {
  const [reports, setReports] = useState<StrayReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<StrayReport | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Fetch current session
      const res = await fetch("/api/auth/me");
      const authData = await res.json();
      const userId = authData.user?.id || "061710a1-673f-4d60-8e1d-285429a6b326";

      let query = supabase
        .from("stray_reports")
        .select(`
          *,
          shelters (
            shelter_name,
            province,
            contact_phone
          )
        `)
        .order("report_date", { ascending: false });

      // If specific user, filter by user_id
      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching reports:", error.message);
      } else {
        setReports(data || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter((item) => {
    if (filterStatus === "all") return true;
    return item.approval_status === filterStatus;
  });

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-mali font-semibold text-3xl md:text-4xl text-textMain mb-2">
            ประวัติการแจ้งพบสัตว์ 📋
          </h1>
          <p className="text-gray-500 font-prompt text-sm">
            ติดตามสถานะการตรวจสอบรายงานสัตว์จรจัดที่คุณได้แจ้งไว้
          </p>
        </div>
        <Link
          href="/report"
          className="self-start md:self-auto bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-full font-mali font-semibold shadow-sm transition flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i> แจ้งพบสัตว์เพิ่ม
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-4">
        {[
          { label: "ทั้งหมด", value: "all" },
          { label: "รอตรวจสอบ", value: "รอตรวจสอบ" },
          { label: "อนุมัติแล้ว", value: "อนุมัติแล้ว" },
          { label: "ปฏิเสธ", value: "ปฏิเสธ" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`px-5 py-2 rounded-full text-sm font-prompt transition ${
              filterStatus === tab.value
                ? "bg-primary text-white font-medium shadow-sm"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 font-prompt flex flex-col items-center gap-3">
          <i className="fa-solid fa-spinner fa-spin text-3xl text-primary"></i>
          <span>กำลังโหลดข้อมูลรายงาน...</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto my-12">
          <div className="w-16 h-16 bg-bgAccent text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <i className="fa-solid fa-clipboard-question"></i>
          </div>
          <h3 className="font-mali font-semibold text-xl text-textMain mb-2">
            ยังไม่มีรายการแจ้งพบสัตว์
          </h3>
          <p className="text-gray-400 font-prompt text-sm mb-6">
            หากคุณพบเห็นสัตว์จรจัดที่ต้องการความช่วยเหลือ สามารถกดปุ่มด้านล่างเพื่อแจ้งเหตุได้ทันที
          </p>
          <Link
            href="/report"
            className="inline-block bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-full font-mali font-semibold shadow-sm transition"
          >
            แจ้งพบสัตว์จรจัด
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => {
            const dateStr = new Date(report.report_date).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={report.report_id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 w-full bg-gray-100">
                  <img
                    src={report.image_url}
                    alt={report.species}
                    className="w-full h-full object-cover"
                  />
                  {/* Status Badge */}
                  <span
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-prompt font-semibold backdrop-blur-md shadow-sm ${
                      report.approval_status === "อนุมัติแล้ว"
                        ? "bg-emerald-500/90 text-white"
                        : report.approval_status === "ปฏิเสธ"
                        ? "bg-rose-500/90 text-white"
                        : "bg-amber-500/90 text-white"
                    }`}
                  >
                    {report.approval_status}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mali font-semibold text-lg text-textMain">
                        {report.species} ({report.color || "ไม่ระบุสี"})
                      </span>
                      <span className="text-xs text-gray-400 font-prompt">{dateStr}</span>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 font-prompt mb-4">
                      <p className="flex items-start gap-2">
                        <i className="fa-solid fa-heart-pulse text-primary mt-0.5"></i>
                        <span><strong>อาการ:</strong> {report.status}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <i className="fa-solid fa-location-dot text-primary mt-0.5"></i>
                        <span className="line-clamp-2"><strong>สถานที่:</strong> {report.location}</span>
                      </p>
                      {report.shelters && (
                        <p className="flex items-start gap-2 text-emerald-700 bg-emerald-50 p-2 rounded-xl">
                          <i className="fa-solid fa-house-medical mt-0.5"></i>
                          <span>
                            <strong>ศูนย์ที่ดูแล:</strong> {report.shelters.shelter_name} ({report.shelters.province})
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedReport(report)}
                    className="w-full py-2.5 rounded-xl border border-primary/30 text-primary hover:bg-bgAccent font-prompt text-xs font-semibold transition"
                  >
                    ดูรายละเอียดเต็ม
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="relative h-60 w-full bg-gray-100">
              <img
                src={selectedReport.image_url}
                alt={selectedReport.species}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedReport(null)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm transition"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mali font-semibold text-2xl text-textMain">
                  {selectedReport.species} ({selectedReport.color})
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-prompt font-semibold ${
                    selectedReport.approval_status === "อนุมัติแล้ว"
                      ? "bg-emerald-100 text-emerald-700"
                      : selectedReport.approval_status === "ปฏิเสธ"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {selectedReport.approval_status}
                </span>
              </div>

              <div className="space-y-3 text-sm font-prompt text-gray-700 bg-gray-50 p-4 rounded-2xl mb-6">
                <p>
                  <strong>อาการ / สภาพ:</strong> {selectedReport.status}
                </p>
                <p>
                  <strong>สถานที่พบ:</strong> {selectedReport.location}
                </p>
                <p>
                  <strong>วันที่แจ้ง:</strong>{" "}
                  {new Date(selectedReport.report_date).toLocaleString("th-TH")}
                </p>
                {selectedReport.shelters && (
                  <p>
                    <strong>ศูนย์พักพิงที่รับผิดชอบ:</strong>{" "}
                    {selectedReport.shelters.shelter_name} ({selectedReport.shelters.province}) - โทร:{" "}
                    {selectedReport.shelters.contact_phone}
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="w-full py-3 rounded-full bg-primary hover:bg-primaryHover text-white font-mali font-semibold transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}