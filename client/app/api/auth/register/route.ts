import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { fullName, email, phone, password } = await request.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // 1. Create User in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm สำหรับระบบ prototype
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { message: authError?.message || 'ไม่สามารถลงทะเบียนได้' },
        { status: 400 }
      );
    }

    // 2. Insert Profile Data
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name: fullName,
      phone: phone || null,
      role: 'adopter',
    });

    if (profileError) {
      // Rollback user creation if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { message: 'เกิดข้อผิดพลาดในการบันทึกโปรไฟล์' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'ลงทะเบียนสำเร็จเรียบร้อยแล้ว' },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดของระบบเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}