// types/user.ts

// กำหนดเฉพาะ role ที่มีจริงในระบบ (ไม่มี shelter)
export type UserRole = 'user' | 'admin';

export interface User {
  user_id: string;
  role: UserRole;
  username: string;
  password_hash?: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  date_of_birth: string | null; // ISO Date YYYY-MM-DD
  salary: number | null;
  accommodation_type: string | null;
  pet_permission: boolean;
  address: string | null;
  province: string | null;
  address_details: AddressDetails;
  animal_count: number;
  residence_note: string | null;
}

// Payload สำหรับส่งอัปเดตโปรไฟล์จากหน้าเว็บ
export interface UpdateProfilePayload {
  full_name: string;
  date_of_birth: string;
  salary: number | null;
  accommodation_type: string;
  pet_permission?: boolean;
  address: string;
  province: string;
  address_details: AddressDetails;
  animal_count: number;
  residence_note: string;
}

export interface AddressDetails {
  house_no: string;
  village: string;
  moo: string;
  soi: string;
  road: string;
  province: string;
  district: string;
  subdistrict: string;
  zipcode: string;
}