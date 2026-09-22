// lib/auth.ts
import "server-only";

import { redirect } from "next/navigation";
import { getSession } from "./session";
import { supabaseAdmin } from "./supabaseAdmin";
import { AuthUser } from "@/types/auth";
import { UserRole } from "@/types/user";

/**
 * ดึงข้อมูลผู้ใช้งานปัจจุบันจาก Session Cookie ร่วมกับฐานข้อมูล
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();

  if (!session?.userId) {
    return null;
  }

  // ดึงข้อมูลผู้ใช้จากตาราง public.users ตาม Schema จริง
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("user_id, username, email, phone, role")
    .eq("user_id", session.userId)
    .maybeSingle();

  if (error || !user) {
    return null;
  }

  // ถ้าเป็นเจ้าหน้าที่ศูนย์พักพิง ให้ดึง shelter_id พ่วงไปด้วย
  let shelterId: string | null = null;
  if (user.role === "shelter") {
    const { data: shelter } = await supabaseAdmin
      .from("shelters")
      .select("shelter_id")
      .eq("user_id", user.user_id)
      .maybeSingle();
    shelterId = shelter?.shelter_id ?? null;
  }

  return {
    user_id: user.user_id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role as UserRole,
    shelter_id: shelterId,
  };
}

/**
 * Guard ตรวจสอบสิทธิ์สำหรับ Server Components / Actions
 */
export async function requireAuth(allowedRoles?: UserRole[]): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }

  return user;
}