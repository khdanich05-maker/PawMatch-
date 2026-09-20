"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/adoptions/StatusBadge";
import { getMyAdoptionRequests } from "@/lib/adoptions/repository";
import type { AdoptionRequest } from "@/lib/adoptions/types";

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyAdoptionRequests().then(setRequests).catch((cause) => setError(cause instanceof Error ? cause.message : "โหลดข้อมูลไม่สำเร็จ")).finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-primary">MY REQUESTS</p><h1 className="font-mali text-4xl font-semibold">สถานะคำขอรับเลี้ยง</h1><p className="mt-2 text-gray-500">ติดตามผลการพิจารณาคำขอของคุณได้ที่นี่</p></div>
        <Link href="/cases" className="rounded-full bg-primary px-5 py-3 text-center font-mali font-semibold text-white hover:bg-primaryHover">ค้นหาสัตว์ที่รอบ้าน</Link>
      </div>
      {loading && <p className="rounded-2xl bg-white p-8 text-center text-gray-500">กำลังโหลดคำขอ...</p>}
      {error && <p role="alert" className="rounded-2xl bg-rose-50 p-5 text-rose-700">{error}</p>}
      {!loading && !error && requests.length === 0 && <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center"><p className="font-mali text-2xl">ยังไม่มีคำขอรับเลี้ยง</p><p className="mt-2 text-gray-500">เมื่อส่งคำขอแล้ว สถานะจะปรากฏในหน้านี้</p></div>}
      <div className="space-y-4">
        {requests.map((request) => (
          <article key={request.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div><p className="text-xs text-gray-400">คำขอ #{request.id.slice(0, 8)}</p><h2 className="mt-1 font-itim text-3xl">{request.animal_name}</h2><p className="text-sm text-gray-500">{request.animal_type} · ส่งเมื่อ {new Date(request.created_at).toLocaleDateString("th-TH", { dateStyle: "medium" })}</p></div>
              <StatusBadge status={request.status} />
            </div>
            <div className="mt-5 grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2"><p><span className="text-gray-400">ผู้ขอ:</span> {request.applicant_name}</p><p><span className="text-gray-400">เบอร์โทร:</span> {request.phone}</p></div>
            {request.admin_note && <div className="mt-4 rounded-xl bg-bgAccent p-4 text-sm"><span className="font-semibold text-primary">ข้อความจากเจ้าหน้าที่:</span> {request.admin_note}</div>}
          </article>
        ))}
      </div>
    </main>
  );
}

