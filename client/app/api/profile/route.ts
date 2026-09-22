import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const profileFields = "user_id, username, email, phone, role, full_name, date_of_birth, accommodation_type, animal_count, address, province, pet_permission, residence_note";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  const { data, error } = await supabaseAdmin.from("users").select(profileFields).eq("user_id", user.user_id).single();
  if (error) return NextResponse.json({ error: "ไม่สามารถอ่านข้อมูลโปรไฟล์ได้" }, { status: 500 });
  return NextResponse.json({ profile: data });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  const body = await request.json();
  const payload = {
    full_name: String(body.fullName || "").trim() || null,
    phone: String(body.phone || "").trim() || null,
    date_of_birth: body.dateOfBirth || null,
    accommodation_type: String(body.accommodation || "").trim() || null,
    animal_count: body.animalCount === "" || body.animalCount == null ? null : Number(body.animalCount),
    address: String(body.address || "").trim() || null,
    province: String(body.province || "").trim() || null,
    pet_permission: body.petPermission === true,
    residence_note: String(body.residenceNote || "").trim() || null,
  };
  const { data, error } = await supabaseAdmin.from("users").update(payload).eq("user_id", user.user_id).select(profileFields).single();
  if (error) return NextResponse.json({ error: "บันทึกโปรไฟล์ไม่สำเร็จ" }, { status: 500 });
  return NextResponse.json({ profile: data });
}
