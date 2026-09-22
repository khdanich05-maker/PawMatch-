// lib/requireAuth.ts
import "server-only";

import { redirect } from "next/navigation";
import { getSession, Session } from "./session";

/**
 * Server-side Guard ตรวจสอบว่าผู้ใช้ล็อกอินอยู่หรือไม่
 * หากไม่ได้ล็อกอิน จะ redirect ไปหน้า /login ทันที
 * หากล็อกอินแล้ว จะคืนค่า Session ข้อมูลผู้ใช้
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}