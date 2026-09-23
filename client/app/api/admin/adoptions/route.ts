import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function requireReviewer() {
  const user = await getCurrentUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบ", status: 401 as const };
  if (user.role !== "admin" && user.role !== "shelter") return { error: "ไม่มีสิทธิ์เข้าถึง", status: 403 as const };
  return { user };
}
function one<T>(value: T | T[] | null | undefined): T | null { return Array.isArray(value) ? value[0] ?? null : value ?? null; }

export async function GET() {
  const guard = await requireReviewer();
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const { data: matches, error } = await supabaseAdmin.from("matches")
    .select("match_id, user_id, animal_id, match_status, start_date, care_time, monthly_budget, family_members, adoption_reason, animals (animal_id, name, species, gender, image_url, shelter_id)")
    .order("start_date", { ascending: true });
  if (error) return NextResponse.json({ error: `ไม่สามารถอ่านคำขอได้: ${error.message}` }, { status: 500 });

  const visible = (matches ?? []).filter((match) => guard.user.role !== "shelter" || one(match.animals as unknown as { shelter_id?: string }[])?.shelter_id === guard.user.shelter_id);
  const userIds = [...new Set(visible.map((match) => match.user_id).filter(Boolean))];
  const { data: users, error: usersError } = userIds.length
    ? await supabaseAdmin.from("users").select("user_id, full_name, username, phone, accommodation_type, animal_count, address, province, pet_permission, residence_note").in("user_id", userIds)
    : { data: [], error: null };
  if (usersError) return NextResponse.json({ error: `ไม่สามารถอ่านข้อมูลผู้สมัครได้: ${usersError.message}` }, { status: 500 });
  const usersById = new Map((users ?? []).map((user) => [user.user_id, user]));

  // เหตุผลอาจยังไม่มีคอลัมน์ในฐานข้อมูล จึงอ่านแยกและไม่ให้หน้ารายการใช้งานไม่ได้
  const { data: reasons } = await supabaseAdmin.from("matches").select("match_id, rejection_reason");
  const reasonByMatch = new Map((reasons ?? []).map((item) => [item.match_id, item.rejection_reason]));
  return NextResponse.json({ requests: visible.map((match) => ({ ...match, users: usersById.get(match.user_id) ?? null, rejection_reason: reasonByMatch.get(match.match_id) ?? null })) });
}

export async function PATCH(request: Request) {
  const guard = await requireReviewer();
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const body = await request.json();
  if (!body.matchId || !["approve", "reject"].includes(body.action)) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });

  const { data: match, error: matchError } = await supabaseAdmin.from("matches").select("match_id, animal_id, match_status, animals (shelter_id)").eq("match_id", body.matchId).maybeSingle();
  if (matchError || !match) return NextResponse.json({ error: "ไม่พบคำขอ" }, { status: 404 });
  const animal = one(match.animals as unknown as { shelter_id?: string }[]);
  if (guard.user.role === "shelter" && animal?.shelter_id !== guard.user.shelter_id) return NextResponse.json({ error: "ไม่มีสิทธิ์จัดการคำขอนี้" }, { status: 403 });
  if (match.match_status !== "รออนุมัติ") return NextResponse.json({ error: "คำขอนี้ถูกพิจารณาแล้ว" }, { status: 409 });
  if (body.action === "reject" && !String(body.reason || "").trim()) return NextResponse.json({ error: "กรุณาระบุเหตุผลที่ไม่อนุมัติ" }, { status: 400 });

  const newStatus = body.action === "approve" ? "อนุมัติ" : "ปฏิเสธ";
  const { error: updateError } = await supabaseAdmin.from("matches").update({ match_status: newStatus }).eq("match_id", match.match_id).eq("match_status", "รออนุมัติ");
  if (updateError) return NextResponse.json({ error: `บันทึกผลไม่สำเร็จ: ${updateError.message}` }, { status: 500 });
  if (body.action === "reject") await supabaseAdmin.from("matches").update({ rejection_reason: String(body.reason).trim() }).eq("match_id", match.match_id);

  if (body.action === "approve") {
    await supabaseAdmin.from("animals").update({ status: "ได้บ้านแล้ว" }).eq("animal_id", match.animal_id);
    const { data: otherPending } = await supabaseAdmin.from("matches").select("match_id").eq("animal_id", match.animal_id).eq("match_status", "รออนุมัติ");
    await supabaseAdmin.from("matches").update({ match_status: "ปฏิเสธ" }).eq("animal_id", match.animal_id).eq("match_status", "รออนุมัติ");
    const otherIds = (otherPending ?? []).map((item) => item.match_id);
    if (otherIds.length) await supabaseAdmin.from("matches").update({ rejection_reason: "สัตว์ตัวนี้ได้รับการอนุมัติให้ผู้สมัครรายอื่นแล้ว" }).in("match_id", otherIds);
  }
  return NextResponse.json({ ok: true, status: newStatus });
}
