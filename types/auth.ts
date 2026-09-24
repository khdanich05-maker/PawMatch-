// types/auth.ts
import { UserRole } from "./user";

/**
 * โครงสร้างข้อมูลผู้ใช้ที่ผ่านการยืนยันตัวตนแล้ว (Authenticated User)
 */
export interface AuthUser {
  user_id: string;
  username: string;
  email: string | null;
  phone: string | null;
  role: UserRole; // 'user' | 'shelter' | 'admin'
  shelter_id?: string | null;
}

/**
 * โครงสร้างข้อมูลที่ถูกบรรจุลงใน Session Cookie (pawmatch_session)
 */
export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  expiresAt: string;
}

/**
 * การตอบกลับจาก Auth API (/api/auth/*)
 */
export interface AuthApiResponse {
  message?: string;
  error?: string;
  redirectTo?: string;
  user?: {
    id: string;
    username: string;
    email: string | null;
    role: UserRole;
  };
}