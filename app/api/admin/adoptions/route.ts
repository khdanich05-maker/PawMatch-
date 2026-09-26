import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function databaseError(step: string, error: { message: string; code?: string; details?: string; hint?: string }) {
  console.error("[Admin Adoption Review] " + step, error);
  const detail = [error.message, error.details, error.hint].filter(Boolean).join(" — ");
  return NextResponse.json({ error: step + ": " + detail, code: error.code }, { status: 500 });
}

// The connected database stores approval as "อนุมัติ"; keep the existing UI contract.
const toUiStatus = (status: string) => status === "อนุมัติ" ? "กำลังดูแล" : status;

const MATCH_COLUMNS = "match_id, animal_id, user_id, start_date, match_status, monthly_budget, family_members, care_time, adoption_reason, rejection_reason, reviewed_by, reviewed_at";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "เฉพาะแอดมินเท่านั้น" }, { status: 403 });
  const params = new URL(request.url).searchParams;
  const animalId = params.get("animalId")?.trim();
  const status = params.get("status") ?? (animalId ? "รออนุมัติ" : "ทั้งหมด");
  if (!["รออนุมัติ", "กำลังดูแล", "ปฏิเสธ", "ทั้งหมด"].includes(status)) {
    return NextResponse.json({ error: "สถานะคำขอไม่ถูกต้อง" }, { status: 400 });
  }
  let query = supabaseAdmin.from("matches").select(MATCH_COLUMNS).order("start_date", { ascending: false });
  if (animalId) query = query.eq("animal_id", animalId);
  if (status !== "ทั้งหมด") query = query.eq("match_status", status === "กำลังดูแล" ? "อนุมัติ" : status);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "ไม่สามารถโหลดคำขอรับเลี้ยงได้" }, { status: 500 });
  const matches = data ?? [];
  const userIds = [...new Set(matches.map((item) => item.user_id))];
  const animalIds = animalId ? [animalId] : [...new Set(matches.map((item) => item.animal_id))];
  const { data: users, error: userError } = userIds.length ? await supabaseAdmin.from("users").select("user_id, full_name, phone, date_of_birth, salary, animal_count, accommodation_type, address, province, pet_permission, residence_note").in("user_id", userIds) : { data: [], error: null };
  const { data: animals, error: animalError } = animalIds.length ? await supabaseAdmin.from("animals").select("animal_id, name, species, gender, image_url, status").in("animal_id", animalIds) : { data: [], error: null };
  if (userError || animalError) return NextResponse.json({ error: "ไม่สามารถโหลดรายละเอียดคำขอได้" }, { status: 500 });
  const userById = new Map((users ?? []).map((item) => [item.user_id, item]));
  const animalById = new Map((animals ?? []).map((item) => [item.animal_id, item]));
  return NextResponse.json({ animal: animalId ? animalById.get(animalId) ?? null : null, requests: matches.map((item) => ({ ...item, match_status: toUiStatus(item.match_status), users: userById.get(item.user_id) ?? null, animals: animalById.get(item.animal_id) ?? null })) });
}

export async function PATCH(request: Request) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "เฉพาะแอดมินเท่านั้น" }, { status: 403 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "รูปแบบ JSON ไม่ถูกต้อง" }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "ข้อมูลคำขอไม่ถูกต้อง" }, { status: 400 });
  const matchId = String(body.requestId ?? ""); const status = String(body.status ?? "");
  if (!matchId || !["กำลังดูแล", "ปฏิเสธ"].includes(status)) return NextResponse.json({ error: "ข้อมูลสถานะไม่ถูกต้อง" }, { status: 400 });
  const rejectionReason = typeof body.rejectionReason === "string" ? body.rejectionReason.trim() : "";
  const { data: match, error: matchError } = await supabaseAdmin.from("matches").select("match_id, animal_id, match_status").eq("match_id", matchId).maybeSingle();
  if (matchError) return databaseError("ตรวจสอบคำขอไม่สำเร็จ", matchError);
  if (!match || match.match_status !== "รออนุมัติ") return NextResponse.json({ error: "ไม่พบคำขอที่รอพิจารณา" }, { status: 404 });
  const now = new Date().toISOString();
  const { data: updated, error } = await supabaseAdmin.from("matches").update({ match_status: status === "กำลังดูแล" ? "อนุมัติ" : "ปฏิเสธ", rejection_reason: status === "ปฏิเสธ" ? rejectionReason || null : null, reviewed_by: admin.user_id, reviewed_at: now }).eq("match_id", matchId).eq("match_status", "รออนุมัติ").select("match_id");
  if (error) return databaseError("อัปเดตคำขอที่เลือกไม่สำเร็จ", error);
  if (!updated?.length) return NextResponse.json({ error: "คำขอนี้ได้รับการพิจารณาแล้ว กรุณาโหลดรายการใหม่" }, { status: 409 });
  let autoRejectedCount = 0;
  if (status === "กำลังดูแล") {
    const { data: updatedAnimals, error: animalError } = await supabaseAdmin.from("animals").update({ status: "ได้บ้านแล้ว" }).eq("animal_id", match.animal_id).select("animal_id");
    if (animalError) return databaseError("บันทึกคำขอแล้ว แต่อัปเดตสัตว์ไม่สำเร็จ", animalError);
    if (!updatedAnimals?.length) return databaseError("อัปเดตสัตว์ไม่สำเร็จ", { message: "ไม่พบสัตว์ที่ต้องการอัปเดต" });
    const { count, error: otherError } = await supabaseAdmin.from("matches").update({ match_status: "ปฏิเสธ", rejection_reason: "สัตว์ตัวนี้ได้รับการอนุมัติให้ผู้สมัครท่านอื่นแล้ว", reviewed_by: admin.user_id, reviewed_at: now }, { count: "exact" }).eq("animal_id", match.animal_id).eq("match_status", "รออนุมัติ").neq("match_id", matchId);
    if (otherError) return databaseError("บันทึกคำขอแล้ว แต่ปิดคำขออื่นไม่สำเร็จ", otherError);
    autoRejectedCount = count ?? 0;
  }
  return NextResponse.json({ ok: true, autoRejectedCount });
}
