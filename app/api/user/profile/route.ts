// app/api/user/profile/route.ts

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { AddressDetails, UpdateProfilePayload, } from "@/types/user";

const PROFILE_COLUMNS = `
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
  address_details,
  animal_count,
  residence_note
` as const;

// GET: ดึงข้อมูลโปรไฟล์ของผู้ใช้ปัจจุบัน
export async function GET() {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return NextResponse.json({ message: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select(PROFILE_COLUMNS)
      .eq("user_id", authUser.user_id)
      .single<UpdateProfilePayload>();

    if (error || !user) {
      console.error("Get profile error:", error);
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

    const body = (await request.json()) as UpdateProfilePayload;

    // Validation
    if (!body.full_name?.trim()) {
      return NextResponse.json({ message: "กรุณาระบุชื่อ-นามสกุล" }, { status: 400 });
    }

    if (body.animal_count !== null && body.animal_count !== undefined && Number(body.animal_count) < 0) {
      return NextResponse.json({ message: "จำนวนสัตว์เลี้ยงต้องไม่ติดลบ" }, { status: 400 });
    }

    // Prepare Address Details
    const addressDetails: AddressDetails = {
      house_no: body.address_details?.house_no?.trim() ?? "",
      village: body.address_details?.village?.trim() ?? "",
      moo: body.address_details?.moo?.trim() ?? "",
      soi: body.address_details?.soi?.trim() ?? "",
      road: body.address_details?.road?.trim() ?? "",
      province: body.address_details?.province?.trim() ?? "",
      district: body.address_details?.district?.trim() ?? "",
      subdistrict: body.address_details?.subdistrict?.trim() ?? "",
      zipcode: body.address_details?.zipcode?.trim() ?? "",
    };

    // Prepare Update Data
    const updateData = {
      full_name: body.full_name.trim(),
      date_of_birth: body.date_of_birth || null,
      salary: body.salary !== null && body.salary !== undefined && !isNaN(Number(body.salary))  ? Number(body.salary)  : null,
      accommodation_type: body.accommodation_type?.trim() || null,
      pet_permission: body.pet_permission ?? true,
      address: body.address?.trim() || null,
      province: body.province?.trim() || null,
      address_details: addressDetails,
      animal_count: Number(body.animal_count) || 0,
      residence_note: body.residence_note?.trim() || null,
    };

    // Update Supabase
    const { data: updatedUser, error } = await supabaseAdmin
      .from("users")
      .update(updateData)
      .eq("user_id", authUser.user_id)
      .select(PROFILE_COLUMNS)
      .single<UpdateProfilePayload>();

    if (error) {
      console.error("Update profile error:", error);
      return NextResponse.json(
        { message: `อัปเดตข้อมูลไม่สำเร็จ: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดภายในระบบ" }, { status: 500 });
  }
}