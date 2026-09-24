// app/api/user/profile/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { UpdateProfilePayload } from "@/types/user";

// GET: ดึงข้อมูลโปรไฟล์ของผู้ใช้ปัจจุบัน
export async function GET() {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ message: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select(`
        user_id,
        role,
        username,
        email,
        phone,
        full_name,
        date_of_birth,
        salary,
        accommodation_type,
        pet_permission,
        address,
        province,
        animal_count,
        residence_note
      `)
      .eq("user_id", authUser.user_id)
      .single();

    if (error || !user) {
      return NextResponse.json({ message: "ไม่พบข้อมูลผู้ใช้ในระบบ" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 });
  }
}

// PUT: อัปเดตข้อมูลโปรไฟล์ของผู้ใช้
export async function PUT(request: Request) {
  try {
    const authUser = await getCurrentUser();
    if (!authUser) {
      return NextResponse.json({ message: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
    }

    const body: UpdateProfilePayload = await request.json();

    // Data Validation เบื้องต้น
    if (!body.full_name?.trim()) {
      return NextResponse.json({ message: "กรุณาระบุชื่อ-นามสกุล" }, { status: 400 });
    }

    // เตรียมข้อมูลสำหรับอัปเดตลงตาราง public.users
    const updateData = {
      full_name: body.full_name.trim(),
      date_of_birth: body.date_of_birth || null,
      salary: body.salary !== null && body.salary !== undefined ? Number(body.salary) : null,
      accommodation_type: body.accommodation_type?.trim() || null,
      pet_permission: body.pet_permission ?? true,
      address: body.address?.trim() || null,
      province: body.province?.trim() || null,
      animal_count: Number(body.animal_count) || 0,
      residence_note: body.residence_note?.trim() || null,
    };

    const { data: updatedUser, error } = await supabaseAdmin
      .from("users")
      .update(updateData)
      .eq("user_id", authUser.user_id)
      .select(`
        user_id,
        role,
        username,
        email,
        phone,
        full_name,
        date_of_birth,
        salary,
        accommodation_type,
        pet_permission,
        address,
        province,
        animal_count,
        residence_note
      `)
      .single();

    if (error) {
      console.error("Update profile error:", error);
      return NextResponse.json({ message: "อัปเดตข้อมูลไม่สำเร็จ: " + error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: "บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว",
      user: updatedUser,
    }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 });
  }
}