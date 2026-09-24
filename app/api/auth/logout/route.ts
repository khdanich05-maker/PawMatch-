// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

export async function POST() {
  try {
    await deleteSession();
    return NextResponse.json({ message: "ออกจากระบบเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการออกจากระบบ" },
      { status: 500 }
    );
  }
}