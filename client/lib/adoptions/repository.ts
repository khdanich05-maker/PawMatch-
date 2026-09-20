import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AdoptionFormData, AdoptionRequest, AdoptionStatus } from "./types";

const STORAGE_KEY = "pawmatch_adoption_requests";
const DEMO_USER_ID = "demo-user";

const seedRequests: AdoptionRequest[] = [
  {
    id: "demo-request-1",
    user_id: DEMO_USER_ID,
    animal_id: "tofu",
    animal_name: "เต้าหู้",
    animal_type: "สุนัข",
    applicant_name: "กมล ตัวอย่าง",
    phone: "081-234-5678",
    address: "อำเภอเมือง จังหวัดนครศรีธรรมราช",
    occupation: "นักศึกษา",
    housing_type: "บ้านเดี่ยว",
    has_fence: true,
    has_other_pets: false,
    experience: "เคยช่วยดูแลสุนัขของครอบครัว",
    reason: "ต้องการมอบบ้านที่ปลอดภัยและมีเวลาดูแลอย่างต่อเนื่อง",
    status: "pending",
    admin_note: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    reviewed_at: null,
  },
];

function readLocal() {
  if (typeof window === "undefined") return seedRequests;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedRequests));
    return seedRequests;
  }
  try {
    return JSON.parse(raw) as AdoptionRequest[];
  } catch {
    return seedRequests;
  }
}

function writeLocal(requests: AdoptionRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

async function currentUserId() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return DEMO_USER_ID;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("กรุณาเข้าสู่ระบบก่อนส่งคำขอรับเลี้ยง");
  return data.user.id;
}

export async function createAdoptionRequest(form: AdoptionFormData) {
  const supabase = getSupabaseBrowserClient();
  const userId = await currentUserId();
  if (supabase) {
    const { data, error } = await supabase
      .from("adoption_requests")
      .insert({ ...form, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data as AdoptionRequest;
  }

  const request: AdoptionRequest = {
    ...form,
    id: crypto.randomUUID(),
    user_id: userId,
    status: "pending",
    admin_note: null,
    created_at: new Date().toISOString(),
    reviewed_at: null,
  };
  writeLocal([request, ...readLocal()]);
  return request;
}

export async function getMyAdoptionRequests() {
  const supabase = getSupabaseBrowserClient();
  const userId = await currentUserId();
  if (!supabase) return readLocal().filter((item) => item.user_id === userId);
  const { data, error } = await supabase
    .from("adoption_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as AdoptionRequest[];
}

export async function getAllAdoptionRequests() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return readLocal();
  const { data, error } = await supabase
    .from("adoption_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as AdoptionRequest[];
}

export async function reviewAdoptionRequest(
  id: string,
  status: Exclude<AdoptionStatus, "pending">,
  adminNote: string,
) {
  const supabase = getSupabaseBrowserClient();
  const reviewedAt = new Date().toISOString();
  if (supabase) {
    const { data, error } = await supabase
      .from("adoption_requests")
      .update({ status, admin_note: adminNote || null, reviewed_at: reviewedAt })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as AdoptionRequest;
  }

  let updated: AdoptionRequest | undefined;
  const requests = readLocal().map((request) => {
    if (request.id !== id) return request;
    updated = { ...request, status, admin_note: adminNote || null, reviewed_at: reviewedAt };
    return updated;
  });
  writeLocal(requests);
  if (!updated) throw new Error("ไม่พบคำขอที่ต้องการตรวจสอบ");
  return updated;
}

