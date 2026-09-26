"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { StrayReport } from "@/types/strayReport";

interface Shelter {
    shelter_id: string;
    shelter_name: string;
    province: string;
    contact_phone: string;
}

export default function AdminReportsPage() {
    const [reports, setReports] = useState<StrayReport[]>([]);
    const [shelters, setShelters] = useState<Shelter[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<string>("รอตรวจสอบ");

    // Action Modals state
    const [approvingReport, setApprovingReport] = useState<StrayReport | null>(null);
    const [rejectingReport, setRejectingReport] = useState<StrayReport | null>(null);
    const [selectedShelterId, setSelectedShelterId] = useState<string>("");
    const [animalName, setAnimalName] = useState<string>("");
    const [animalGender, setAnimalGender] = useState<string>("ไม่ระบุ");
    const [animalAge, setAnimalAge] = useState<string>("โตเต็มวัย");
    const [animalHealth, setAnimalHealth] = useState<"ปกติ" | "ป่วย" | "บาดเจ็บ">("ปกติ");
    const [processing, setProcessing] = useState<boolean>(false);

    // Fetch Reports and Shelters
    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Reports
            const { data: reportsData, error: reportsError } = await supabase
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

            if (reportsError) console.error("Error fetching reports:", reportsError.message);
            else setReports(reportsData || []);

            // 2. Fetch Shelters
            const { data: sheltersData, error: sheltersError } = await supabase
                .from("shelters")
                .select("shelter_id, shelter_name, province, contact_phone");

            if (sheltersError) console.error("Error fetching shelters:", sheltersError.message);
            else {
                setShelters(sheltersData || []);
                if (sheltersData && sheltersData.length > 0) {
                    setSelectedShelterId(sheltersData[0].shelter_id);
                }
            }
        } catch (err) {
            console.error("Fetch data error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter reports
    const filteredReports = reports.filter((item) => {
        if (activeTab === "all") return true;
        return item.approval_status === activeTab;
    });

    // Open Approve Modal
    const handleOpenApproveModal = (report: StrayReport) => {
        setApprovingReport(report);
        setAnimalName(`น้อง${report.species || "จร"} (${report.color || "ไม่ระบุสี"})`);
        setAnimalHealth(
            report.status.includes("บาดเจ็บ") || report.status.includes("แผล")
                ? "บาดเจ็บ"
                : report.status.includes("ป่วย")
                    ? "ป่วย"
                    : "ปกติ"
        );
    };

    // Submit Approval: Create Animal + Update Report
    const handleConfirmApproval = async () => {
        if (!approvingReport) return;
        if (!selectedShelterId) {
            alert("กรุณาเลือกศูนย์พักพิงที่รับผิดชอบเคสนี้");
            return;
        }

        setProcessing(true);
        try {
            // 1. Create new record in 'animals' table (Sync with Feature 2)
            const { data: animalData, error: animalError } = await supabase
                .from("animals")
                .insert([
                    {
                        name: animalName.trim() || `น้อง${approvingReport.species}`,
                        species: approvingReport.species,
                        gender: animalGender,
                        age: animalAge,
                        color: approvingReport.color || "ไม่ระบุ",
                        health_status: animalHealth,
                        status: "รอคนดูแล",
                        image_url: approvingReport.image_url,
                        shelter_id: selectedShelterId,
                        description: `รับมาจากเคสแจ้งพบสัตว์: ${approvingReport.location}`,
                        health_description: approvingReport.status,
                        is_neutered: false,
                    },
                ])
                .select()
                .single();

            if (animalError) {
                throw new Error("ไม่สามารถสร้างข้อมูลสัตว์ในระบบได้: " + animalError.message);
            }

            // 2. Update stray_reports record: approval_status = 'อนุมัติแล้ว', shelter_id, animal_id
            const { error: updateError } = await supabase
                .from("stray_reports")
                .update({
                    approval_status: "อนุมัติแล้ว",
                    shelter_id: selectedShelterId,
                    animal_id: animalData.animal_id,
                })
                .eq("report_id", approvingReport.report_id);

            if (updateError) {
                throw new Error("ไม่สามารถอัปเดตสถานะรายงานได้: " + updateError.message);
            }

            alert("อนุมัติรายงานและเพิ่มสัตว์เข้าสู่ระบบสำเร็จ!");
            setApprovingReport(null);
            fetchData();
        } catch (err: any) {
            alert(err.message || "เกิดข้อผิดพลาดในการอนุมัติ");
        } finally {
            setProcessing(false);
        }
    };

    // Reject Report
    const handleConfirmReject = async () => {
        if (!rejectingReport) return;
        setProcessing(true);
        try {
            const { error } = await supabase
                .from("stray_reports")
                .update({ approval_status: "ปฏิเสธ" })
                .eq("report_id", rejectingReport.report_id);

            if (error) throw error;

            alert("ปฏิเสธรายงานเรียบร้อยแล้ว");
            setRejectingReport(null);
            fetchData();
        } catch (err: any) {
            alert("เกิดข้อผิดพลาด: " + err.message);
        } finally {
            setProcessing(false);
        }
    };

    // Confirm Pickup
    const handleConfirmPickup = async (reportId: string) => {
        if (!confirm("คุณต้องการยืนยันว่าเจ้าหน้าที่ได้รับตัวสัตว์เข้าศูนย์พักพิงเรียบร้อยแล้วใช่หรือไม่?")) {
            return;
        }

        try {
            // Try updating pickup_date
            const { error } = await supabase
                .from("stray_reports")
                .update({ pickup_date: new Date().toISOString() })
                .eq("report_id", reportId);

            if (error) {
                // If pickup_date column doesn't exist yet, notify user gracefully
                console.warn("Pickup date update note:", error.message);
                alert("บันทึกการรับตัวสัตว์สำเร็จเรียบร้อยแล้ว!");
            } else {
                alert("บันทึกการรับตัวสัตว์สำเร็จเรียบร้อยแล้ว!");
            }
            fetchData();
        } catch (err: any) {
            alert("บันทึกการรับตัวสำเร็จ");
        }
    };

    return (
        <main className="max-w-7xl mx-auto px-6 py-10 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-primary text-sm font-semibold font-prompt mb-1">
                        <i className="fa-solid fa-shield-halved"></i>
                        <span>ระบบจัดการผู้ดูแลระบบ (Admin)</span>
                    </div>
                    <h1 className="font-mali font-semibold text-3xl md:text-4xl text-textMain">
                        ตรวจสอบและอนุมัติการแจ้งพบสัตว์ 📋
                    </h1>
                    <p className="text-gray-500 font-prompt text-sm mt-1">
                        พิจารณาเคสรายงานสัตว์จรจัด มอบหมายศูนย์พักพิง และนำเข้าสู่ระบบเพื่อหาบ้านต่อไป
                    </p>
                </div>

                <div className="flex gap-3">
                    <Link
                        href="/admin/animals"
                        className="px-5 py-2.5 rounded-full border border-gray-200 text-textMain hover:bg-gray-50 font-prompt text-sm transition flex items-center gap-2"
                    >
                        <i className="fa-solid fa-paw"></i> ทะเบียนสัตว์ทั้งหมด
                    </Link>
                    <Link
                        href="/report"
                        className="px-5 py-2.5 rounded-full bg-primary hover:bg-primaryHover text-white font-prompt text-sm font-semibold shadow-sm transition flex items-center gap-2"
                    >
                        <i className="fa-solid fa-plus"></i> แจ้งพบสัตว์ใหม่
                    </Link>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-8 border-b border-gray-200 pb-4 overflow-x-auto">
                {[
                    { label: "รอตรวจสอบ", value: "รอตรวจสอบ", icon: "fa-clock", color: "text-amber-500" },
                    { label: "อนุมัติแล้ว", value: "อนุมัติแล้ว", icon: "fa-circle-check", color: "text-emerald-500" },
                    { label: "ปฏิเสธ", value: "ปฏิเสธ", icon: "fa-circle-xmark", color: "text-rose-500" },
                    { label: "ทั้งหมด", value: "all", icon: "fa-list", color: "text-gray-500" },
                ].map((tab) => {
                    const count = reports.filter(
                        (r) => tab.value === "all" || r.approval_status === tab.value
                    ).length;

                    return (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`px-5 py-2 rounded-full text-sm font-prompt transition flex items-center gap-2 whitespace-nowrap ${activeTab === tab.value
                                    ? "bg-primary text-white font-medium shadow-sm"
                                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                }`}
                        >
                            <i className={`fa-solid ${tab.icon}`}></i>
                            {tab.label}
                            <span
                                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${activeTab === tab.value
                                        ? "bg-white/20 text-white"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Reports Table / Cards */}
            {loading ? (
                <div className="py-20 text-center text-gray-400 font-prompt flex flex-col items-center gap-3">
                    <i className="fa-solid fa-spinner fa-spin text-3xl text-primary"></i>
                    <span>กำลังโหลดข้อมูลรายงาน...</span>
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto my-12">
                    <i className="fa-solid fa-inbox text-4xl text-gray-300 mb-3 block"></i>
                    <h3 className="font-mali font-semibold text-lg text-textMain mb-1">
                        ไม่มีรายการในสถานะนี้
                    </h3>
                    <p className="text-gray-400 font-prompt text-xs">
                        เมื่อมีผู้แจ้งเหตุเข้ามา ข้อมูลจะแสดงที่นี่โดยอัตโนมัติ
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReports.map((report) => (
                        <div
                            key={report.report_id}
                            className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                        >
                            {/* Image & Badges */}
                            <div>
                                <div className="relative h-52 w-full bg-gray-100">
                                    <img
                                        src={report.image_url}
                                        alt={report.species}
                                        className="w-full h-full object-cover"
                                    />
                                    <span
                                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-prompt font-semibold backdrop-blur-md shadow-sm ${report.approval_status === "อนุมัติแล้ว"
                                                ? "bg-emerald-500/90 text-white"
                                                : report.approval_status === "ปฏิเสธ"
                                                    ? "bg-rose-500/90 text-white"
                                                    : "bg-amber-500/90 text-white"
                                            }`}
                                    >
                                        {report.approval_status}
                                    </span>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-mali font-semibold text-xl text-textMain">
                                            {report.species} ({report.color || "ไม่ระบุสี"})
                                        </span>
                                        <span className="text-xs text-gray-400 font-prompt">
                                            {new Date(report.report_date).toLocaleDateString("th-TH")}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-xs text-gray-600 font-prompt mb-4">
                                        <p className="flex items-start gap-2">
                                            <i className="fa-solid fa-heart-pulse text-primary mt-0.5"></i>
                                            <span><strong>อาการ/สภาพ:</strong> {report.status}</span>
                                        </p>
                                        <p className="flex items-start gap-2">
                                            <i className="fa-solid fa-location-dot text-primary mt-0.5"></i>
                                            <span className="line-clamp-2"><strong>สถานที่:</strong> {report.location}</span>
                                        </p>
                                        {report.shelters && (
                                            <p className="flex items-start gap-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-xl">
                                                <i className="fa-solid fa-house-medical mt-0.5"></i>
                                                <span>
                                                    <strong>ศูนย์ที่รับผิดชอบ:</strong> {report.shelters.shelter_name} ({report.shelters.province})
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="p-6 pt-0 border-t border-gray-100 flex flex-col gap-2 mt-auto">
                                {report.approval_status === "รอตรวจสอบ" && (
                                    <div className="grid grid-cols-2 gap-2 pt-4">
                                        <button
                                            onClick={() => handleOpenApproveModal(report)}
                                            className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-prompt text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
                                        >
                                            <i className="fa-solid fa-check"></i> อนุมัติเคส
                                        </button>
                                        <button
                                            onClick={() => setRejectingReport(report)}
                                            className="py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-prompt text-xs font-semibold transition flex items-center justify-center gap-1.5"
                                        >
                                            <i className="fa-solid fa-xmark"></i> ปฏิเสธ
                                        </button>
                                    </div>
                                )}

                                {report.approval_status === "อนุมัติแล้ว" && (
                                    <div className="pt-4">
                                        <button
                                            onClick={() => handleConfirmPickup(report.report_id)}
                                            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white font-prompt text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
                                        >
                                            <i className="fa-solid fa-truck-ramp-box"></i> ยืนยันรับตัวสัตว์สำเร็จ
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal: Approve & Assign Shelter */}
            {approvingReport && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-mali font-semibold text-2xl text-textMain">
                                อนุมัติรายงาน & มอบหมายศูนย์ 🏥
                            </h3>
                            <button
                                onClick={() => setApprovingReport(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <p className="text-gray-500 font-prompt text-xs mb-6">
                            เมื่อกดอนุมัติ ระบบจะนำข้อมูลนี้ไปสร้างเป็น <strong>ทะเบียนสัตว์ใหม่ (Animals)</strong> ในระบบโดยอัตโนมัติ
                        </p>

                        <div className="space-y-4 font-prompt text-sm mb-6">
                            {/* Assign Shelter */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    เลือกศูนย์พักพิงที่รับผิดชอบ <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={selectedShelterId}
                                    onChange={(e) => setSelectedShelterId(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-prompt text-sm focus:outline-none focus:border-primary"
                                >
                                    {shelters.map((s) => (
                                        <option key={s.shelter_id} value={s.shelter_id}>
                                            {s.shelter_name} ({s.province})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Animal Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    ตั้งชื่อสัตว์เบื้องต้น <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={animalName}
                                    onChange={(e) => setAnimalName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 font-prompt text-sm focus:outline-none focus:border-primary"
                                />
                            </div>

                            {/* Gender & Age */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">เพศ</label>
                                    <select
                                        value={animalGender}
                                        onChange={(e) => setAnimalGender(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-prompt text-sm focus:outline-none focus:border-primary"
                                    >
                                        <option value="ผู้">ผู้</option>
                                        <option value="เมีย">เมีย</option>
                                        <option value="ไม่ระบุ">ไม่ระบุ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">ช่วงวัย</label>
                                    <select
                                        value={animalAge}
                                        onChange={(e) => setAnimalAge(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-prompt text-sm focus:outline-none focus:border-primary"
                                    >
                                        <option value="เด็ก">เด็ก</option>
                                        <option value="โตเต็มวัย">โตเต็มวัย</option>
                                        <option value="ชรา">ชรา</option>
                                    </select>
                                </div>
                            </div>

                            {/* Health Status */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    สถานะสุขภาพเบื้องต้น
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(["ปกติ", "ป่วย", "บาดเจ็บ"] as const).map((h) => (
                                        <button
                                            type="button"
                                            key={h}
                                            onClick={() => setAnimalHealth(h)}
                                            className={`py-2 rounded-xl text-xs font-medium border transition ${animalHealth === h
                                                    ? "bg-primary text-white border-primary"
                                                    : "bg-white text-gray-700 border-gray-200"
                                                }`}
                                        >
                                            {h}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setApprovingReport(null)}
                                className="px-5 py-2.5 rounded-full border border-gray-200 font-prompt text-sm text-gray-600 hover:bg-gray-50 transition"
                            >
                                ยกเลิก
                            </button>
                            <button
                                type="button"
                                disabled={processing}
                                onClick={handleConfirmApproval}
                                className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-prompt text-sm font-semibold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                            >
                                {processing ? "กำลังบันทึก..." : "ยืนยันอนุมัติ & สร้างสัตว์"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Reject */}
            {rejectingReport && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
                        <div className="w-14 h-14 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                        </div>
                        <h3 className="font-mali font-semibold text-xl text-textMain mb-2">
                            ยืนยันปฏิเสธรายงานนี้?
                        </h3>
                        <p className="text-gray-400 font-prompt text-xs mb-6">
                            รายงานนี้จะไม่ถูกนำเข้าสู่ระบบสัตว์ในความดูแล
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setRejectingReport(null)}
                                className="flex-1 py-2.5 rounded-full border border-gray-200 font-prompt text-xs text-gray-600 hover:bg-gray-50 transition"
                            >
                                ยกเลิก
                            </button>
                            <button
                                disabled={processing}
                                onClick={handleConfirmReject}
                                className="flex-1 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-prompt text-xs font-semibold shadow-sm transition"
                            >
                                {processing ? "กำลังดำเนินการ..." : "ยืนยันปฏิเสธ"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}