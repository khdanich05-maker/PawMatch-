// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createSession } from "@/lib/session";
import { User } from "@/types/user";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { message: "กรุณากรอกอีเมลและรหัสผ่าน" },
        { status: 400 }
      );
    }

    // 1. ค้นหาผู้ใช้จากตาราง public.users (ใช้ ilike เพื่อให้ค้นหาได้ทั้ง Ball และ ball)
    const identifier = String(body.username ?? body.email ?? "").trim();

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("user_id, role, username, password_hash, email, phone")
      .or(`email.ilike.${identifier},username.ilike.${identifier}`)
      .maybeSingle<User>();

    if (userError || !user || !user.password_hash) {
      return NextResponse.json(
        { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // 2. ตรวจสอบรหัสผ่านด้วย bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // 3. สร้าง Session Cookie (pawmatch_session)
    await createSession({
      userId: user.user_id,
      email: user.email ?? email,
      role: user.role,
      name: user.username,
    });

    // 4. กำหนดเส้นทาง Redirect ตาม Role ของผู้ใช้งาน
    // const redirectTo =
    //   user.role === "admin" || user.role === "shelter"
    //     ? "/admin/dashboard"
    //     : "/dashboard";
    // 4. กำหนดเส้นทาง Redirect ไปยังหน้าแรก (Landing Page)
    const redirectTo = "/";

    return NextResponse.json({
      message: "เข้าสู่ระบบสำเร็จ",
      redirectTo,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดของระบบเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}