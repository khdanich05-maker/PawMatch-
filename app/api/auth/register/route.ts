// app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const phone = String(body.phone ?? "").trim();
    const password = String(body.password ?? "");

    // 1. Validation เบื้องต้น
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อผู้ใช้ อีเมล และรหัสผ่านให้ครบถ้วน" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" },
        { status: 400 }
      );
    }

    // 2. เช็คว่ามี username หรือ email ซ้ำในระบบหรือไม่
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("user_id, email, username")
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json(
          { error: "อีเมลนี้มีผู้ใช้งานในระบบแล้ว" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "ชื่อผู้ใช้ (Username) นี้ถูกใช้งานแล้ว" },
        { status: 409 }
      );
    }

    // 3. Hash รหัสผ่านด้วย bcryptjs
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. บันทึกลงตาราง public.users
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        username,
        email,
        phone: phone || null,
        password_hash: passwordHash,
        role: "user",
      })
      .select("user_id, username, email, role")
      .single();

    if (insertError || !newUser) {
      console.error("Insert user error:", insertError);
      return NextResponse.json(
        { error: "ไม่สามารถสร้างบัญชีได้ กรุณาลองใหม่อีกครั้ง" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "ลงทะเบียนสมาชิกสำเร็จ",
      user: {
        id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Register route error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดของระบบเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}