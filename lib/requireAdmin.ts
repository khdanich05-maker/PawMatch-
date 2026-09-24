// lib/requireAdmin.ts
import "server-only";

import { redirect } from "next/navigation";
import { getSession, Session } from "./session";

export async function requireAdmin(): Promise<Session> {
    const session = await getSession();

    // ยังไม่ได้ Login
    if (!session) {
        redirect("/login");
    }

    // Login แล้ว แต่ไม่ใช่ Admin
    if (session.role !== "admin") {
        redirect("/dashboard");
    }

    return session;
}