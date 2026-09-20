import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createSession } from "@/lib/session";

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

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (authError || !authData.user) {
      console.error("Authentication error:", authError);
      return NextResponse.json(
        { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, role, avatar_url")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile query error:", profileError);
      return NextResponse.json(
        { message: "ไม่พบข้อมูลโปรไฟล์ผู้ใช้งาน" },
        { status: 404 }
      );
    }

    await createSession({
      userId: profile.id,
      email: authData.user.email ?? email,
      role: profile.role,
      name: profile.full_name ?? "",
    });

    return NextResponse.json({
      message: "เข้าสู่ระบบสำเร็จ",
      role: profile.role,
      user: {
        id: profile.id,
        name: profile.full_name,
        email: authData.user.email ?? email,
        avatarUrl: profile.avatar_url,
      },
    });
  } catch (error) {
    console.error("Login route error:", error);

    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดของระบบเซิร์ฟเวอร์" },
      { status: 500 }
    );
  }
}
