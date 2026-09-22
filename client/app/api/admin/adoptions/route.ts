import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function admin() {
  const user = await getCurrentUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบ", status: 401 as const };
  if (user.role !== "admin" && user.role !== "shelter") return { error: "ไม่มีสิทธิ์เข้าถึง", status: 403 as const };
  return { user };
}
export async function GET() {
  const guard = await admin(); if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  let query = supabaseAdmin.from("matches").select("match_id, animal_id, match_status, start_date, care_time, monthly_budget, family_members, adoption_reason, rejection_reason, users (user_id, full_name, username, phone, accommodation_type, animal_count, address, province, pet_permission, residence_note), animals (animal_id, name, species, gender, image_url, shelter_id)");
  if (guard.user.role === "shelter") query = query.eq("animals.shelter_id", guard.user.shelter_id || "");
  const { data, error } = await query.order("start_date", { ascending: true });
  if (error) return NextResponse.json({ error: `ไม่สามารถอ่านคำขอได้: ${error.message}` }, { status: 500 });
  return NextResponse.json({ requests: data || [] });
}
export async function PATCH(request: Request) {
  const guard = await admin(); if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const body = await request.json(); const approved = body.action === "approve";
  if (!body.matchId || !["approve","reject"].includes(body.action)) return NextResponse.json({ error:"ข้อมูลไม่ถูกต้อง" },{status:400});
  const { data: match } = await supabaseAdmin.from("matches").select("match_id, animal_id, animals (shelter_id)").eq("match_id",body.matchId).maybeSingle();
  if (!match) return NextResponse.json({ error:"ไม่พบคำขอ" },{status:404});
  const animal = Array.isArray(match.animals) ? match.animals[0] : match.animals;
  if (guard.user.role === "shelter" && animal?.shelter_id !== guard.user.shelter_id) return NextResponse.json({ error:"ไม่มีสิทธิ์จัดการคำขอนี้" },{status:403});
  const { error } = await supabaseAdmin.from("matches").update({ match_status: approved ? "อนุมัติ" : "ปฏิเสธ", rejection_reason: approved ? null : String(body.reason || "ไม่ผ่านเกณฑ์การพิจารณา"), reviewed_at:new Date().toISOString(), reviewed_by:guard.user.user_id }).eq("match_id",body.matchId).eq("match_status","รออนุมัติ");
  if (error) return NextResponse.json({error:"บันทึกผลไม่สำเร็จ"},{status:500});
  if (approved) { await supabaseAdmin.from("animals").update({status:"ได้บ้านแล้ว"}).eq("animal_id",match.animal_id); await supabaseAdmin.from("matches").update({match_status:"ปฏิเสธ",rejection_reason:"สัตว์ตัวนี้ได้รับการอนุมัติให้ผู้สมัครรายอื่นแล้ว",reviewed_at:new Date().toISOString(),reviewed_by:guard.user.user_id}).eq("animal_id",match.animal_id).eq("match_status","รออนุมัติ"); }
  return NextResponse.json({ ok:true });
}
