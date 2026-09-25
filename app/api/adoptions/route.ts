import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const MATCH_COLUMNS = "match_id, animal_id, user_id, start_date, match_status, monthly_budget, family_members, care_time, adoption_reason, rejection_reason, reviewed_at";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "user") return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าดูคำขอ" }, { status: 403 });
  const { data, error } = await supabaseAdmin.from("matches").select(MATCH_COLUMNS).eq("user_id", user.user_id).order("start_date", { ascending: false });
  if (error) return NextResponse.json({ error: "ไม่สามารถโหลดคำขอรับเลี้ยงได้" }, { status: 500 });
  const matches = data ?? [];
  const animalIds = [...new Set(matches.map((item) => item.animal_id))];
  const { data: animals, error: animalError } = animalIds.length ? await supabaseAdmin.from("animals").select("animal_id, name, species, gender, image_url, status").in("animal_id", animalIds) : { data: [], error: null };
  if (animalError) return NextResponse.json({ error: "ไม่สามารถโหลดข้อมูลสัตว์ได้" }, { status: 500 });
  const animalById = new Map((animals ?? []).map((item) => [item.animal_id, item]));
  return NextResponse.json({ requests: matches.map((item) => ({ ...item, animals: animalById.get(item.animal_id) ?? null })) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนส่งคำขอ" }, { status: 401 });
  if (user.role !== "user") return NextResponse.json({ error: "เฉพาะบัญชีผู้ใช้งานทั่วไปเท่านั้นที่ส่งคำขอรับเลี้ยงได้" }, { status: 403 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "รูปแบบ JSON ไม่ถูกต้อง" }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "ข้อมูลคำขอไม่ถูกต้อง" }, { status: 400 });
  const required = ["animalId", "fullName", "phone", "accommodation", "address", "province", "careTime", "budget"];
  if (required.some((field) => !String(body[field] ?? "").trim())) return NextResponse.json({ error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบ" }, { status: 400 });
  const budget = typeof body.budget === "number" || typeof body.budget === "string" ? Number(body.budget) : NaN;
  if (!Number.isFinite(budget) || budget <= 0) return NextResponse.json({ error: "กรุณากรอกงบดูแลเป็นตัวเลขมากกว่า 0" }, { status: 400 });
  if (typeof body.petPermission !== "boolean") return NextResponse.json({ error: "กรุณาเลือกว่าที่พักอนุญาตให้เลี้ยงสัตว์หรือไม่" }, { status: 400 });
  const optionalCount = (value: unknown): number | null => {
    if (value == null || (typeof value === "string" && !value.trim())) return null;
    return typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
  };
  const animalCount = optionalCount(body.animalCount);
  const familyMembers = optionalCount(body.familyMembers);
  if ([animalCount, familyMembers].some((value) => value !== null && (!Number.isSafeInteger(value) || value < 0))) {
    return NextResponse.json({ error: "จำนวนสัตว์เลี้ยงและสมาชิกในครอบครัวต้องเป็นจำนวนเต็มไม่ติดลบ" }, { status: 400 });
  }
  const { data: animal, error: animalError } = await supabaseAdmin.from("animals").select("animal_id, status").eq("animal_id", body.animalId).maybeSingle();
  if (animalError || !animal || animal.status !== "รอคนดูแล") return NextResponse.json({ error: "สัตว์ตัวนี้ไม่พร้อมรับคำขอแล้ว" }, { status: 409 });
  const { data: previousMatches, error: previousError } = await supabaseAdmin
    .from("matches")
    .select("match_id")
    .eq("animal_id", body.animalId)
    .eq("user_id", user.user_id)
    .eq("match_status", "รออนุมัติ")
    .limit(1);
  if (previousError) {
    console.error("ตรวจสอบคำขอเดิมไม่สำเร็จ:", previousError);
    return NextResponse.json(
      { error: `ตรวจสอบคำขอเดิมไม่สำเร็จ: ${previousError.message}` },
      { status: 500 }
    );
  }
  if (previousMatches?.length) {
    return NextResponse.json(
      { error: "คุณได้ยื่นคำขอรับเลี้ยงน้องตัวนี้แล้ว" },
      { status: 409 }
    );
  }
  const { error: profileError } = await supabaseAdmin.from("users").update({
    full_name: String(body.fullName).trim(), phone: String(body.phone).trim(), date_of_birth: body.dateOfBirth || null,
    accommodation_type: String(body.accommodation).trim(), address: String(body.address).trim(), province: String(body.province).trim(),
    animal_count: animalCount ?? 0, pet_permission: body.petPermission, residence_note: String(body.residenceNote ?? "").trim() || null,
  }).eq("user_id", user.user_id);
  if (profileError) return NextResponse.json({ error: "ไม่สามารถบันทึกข้อมูลโปรไฟล์ได้" }, { status: 500 });
  const { error } = await supabaseAdmin.from("matches").insert({
    animal_id: body.animalId, user_id: user.user_id, match_status: "รออนุมัติ", care_time: String(body.careTime).trim(),
    monthly_budget: budget, family_members: familyMembers, adoption_reason: String(body.reason ?? "").trim() || null,
  });
  if (error) return NextResponse.json({ error: "ส่งคำขอรับเลี้ยงไม่สำเร็จ" }, { status: 500 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "user") return NextResponse.json({ error: "ไม่มีสิทธิ์ยกเลิกคำขอ" }, { status: 403 });
  const matchId = new URL(request.url).searchParams.get("requestId");
  if (!matchId) return NextResponse.json({ error: "ไม่พบคำขอ" }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("matches").delete().eq("match_id", matchId).eq("user_id", user.user_id).eq("match_status", "รออนุมัติ").select("match_id");
  if (error || !data?.length) return NextResponse.json({ error: "ยกเลิกได้เฉพาะคำขอที่รอพิจารณา" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
