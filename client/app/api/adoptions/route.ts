import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  const { data, error } = await supabaseAdmin.from("matches").select(`match_id, animal_id, match_status, start_date, end_date, care_time, monthly_budget, family_members, adoption_reason, rejection_reason, reviewed_at, animals (animal_id, name, species, gender, image_url, shelters (shelter_name, province, contact_phone))`).eq("user_id", user.user_id).order("start_date", { ascending: false });
  if (error) return NextResponse.json({ error: "ไม่สามารถอ่านสถานะคำขอได้" }, { status: 500 });
  return NextResponse.json({ requests: data ?? [] });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนส่งคำขอ" }, { status: 401 });
  if (user.role !== "user") return NextResponse.json({ error: "เฉพาะบัญชีผู้ใช้งานทั่วไปเท่านั้นที่ส่งคำขอได้" }, { status: 403 });
  const body = await request.json();
  const required = ["animalId", "fullName", "phone", "dateOfBirth", "accommodation", "address", "province", "careTime", "budget"];
  if (required.some((key) => body[key] === undefined || body[key] === null || String(body[key]).trim() === "")) return NextResponse.json({ error: "กรุณากรอกข้อมูลที่จำเป็นให้ครบ" }, { status: 400 });

  const { data: animal, error: animalError } = await supabaseAdmin.from("animals").select("animal_id, status").eq("animal_id", body.animalId).maybeSingle();
  if (animalError || !animal || animal.status === "ได้บ้านแล้ว") return NextResponse.json({ error: "สัตว์ตัวนี้ไม่พร้อมรับคำขอแล้ว" }, { status: 409 });
  const { data: existing } = await supabaseAdmin.from("matches").select("match_id").eq("user_id", user.user_id).eq("animal_id", body.animalId).eq("match_status", "รออนุมัติ").maybeSingle();
  if (existing) return NextResponse.json({ error: "คุณส่งคำขอสำหรับน้องตัวนี้แล้ว" }, { status: 409 });

  const profile = { full_name: String(body.fullName).trim(), phone: String(body.phone).trim(), date_of_birth: body.dateOfBirth, accommodation_type: body.accommodation, animal_count: Number(body.animalCount || 0), address: String(body.address).trim(), province: String(body.province).trim(), pet_permission: body.petPermission === true, residence_note: String(body.residenceNote || "").trim() || null };
  const { error: profileError } = await supabaseAdmin.from("users").update(profile).eq("user_id", user.user_id);
  if (profileError) return NextResponse.json({ error: "อัปเดตโปรไฟล์ไม่สำเร็จ" }, { status: 500 });
  const { data, error } = await supabaseAdmin.from("matches").insert({ user_id: user.user_id, animal_id: body.animalId, match_status: "รออนุมัติ", care_time: body.careTime, monthly_budget: Number(body.budget), family_members: body.familyMembers === "" ? null : Number(body.familyMembers), adoption_reason: String(body.reason || "").trim() || null }).select("match_id").single();
  if (error) return NextResponse.json({ error: "ส่งคำขอไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });
  if (animal.status === "รอคนดูแล") await supabaseAdmin.from("animals").update({ status: "รอการอนุมัติ" }).eq("animal_id", body.animalId);
  return NextResponse.json({ request: data }, { status: 201 });
}
