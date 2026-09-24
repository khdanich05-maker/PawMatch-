// lib/requireAdmin.ts
import "server-only";

import { redirect } from "next/navigation";
import { getSession, Session } from "./session";

/**
 * Server-side Guard ตรวจสอบสิทธิ์ระดับแอดมินหรือเจ้าหน้าที่ศูนย์พักพิง
 * - ถ้ายังไม่ล็อกอิน -> ส่งไป /login
 * - ถ้าล็อกอินแล้วแต่ Role ไม่ใช่ 'admin' หรือ 'shelter' -> ส่งกลับไป /dashboard
 * - ถ้าผ่านเงื่อนไข -> ส่งข้อมูล Session กลับไปใช้งาน
 */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin" && session.role !== "shelter") {
    redirect("/dashboard");
  }

  return session;
}