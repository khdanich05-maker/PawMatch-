// types/careLog.ts
import { Animal } from "./animal";

export type ActivityType =
  | "อัปเดตอาการถ่ายรูปทุกเดือน"
  | "พาไปหาหมอ (วัคซีน)"
  | "พาไปหาหมอ (ตรวจสุขภาพ/รักษา)"
  | "การปรับตัวและพฤติกรรม"
  | "อื่นๆ";

export interface CareLog {
  log_id: string;
  match_id: string;
  log_date: string;
  activity_type: string;
  description: string;
  image_url?: string | null;
  created_at?: string;
}

export interface AdoptedPetMatch {
  match_id: string;
  user_id: string;
  animal_id: string;
  start_date: string;
  end_date?: string | null;
  match_status: string;
  animal: Animal;
}

export interface CareLogFormData {
  activity_type: string;
  log_date: string;
  description: string;
  image_file: File | null;
  image_preview: string | null;
}
