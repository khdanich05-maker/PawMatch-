import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "กรุณาแนบไฟล์รูปภาพ" },
        { status: 400 }
      );
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `reports/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload using supabaseAdmin (bypasses RLS)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("stray-reports")
      .upload(filePath, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `ไม่สามารถอัปโหลดรูปภาพได้: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from("stray-reports")
      .getPublicUrl(filePath);

    return NextResponse.json({ imageUrl: urlData.publicUrl });
  } catch (err: any) {
    console.error("Upload API route error:", err);
    return NextResponse.json(
      { error: err.message || "เกิดข้อผิดพลาดของระบบในการอัปโหลดรูป" },
      { status: 500 }
    );
  }
}
