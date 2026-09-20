export type AdoptionStatus = "pending" | "approved" | "rejected";

export type AdoptionRequest = {
  id: string;
  user_id: string;
  animal_id: string;
  animal_name: string;
  animal_type: string;
  applicant_name: string;
  phone: string;
  address: string;
  occupation: string;
  housing_type: string;
  has_fence: boolean;
  has_other_pets: boolean;
  experience: string;
  reason: string;
  status: AdoptionStatus;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type AdoptionFormData = Pick<
  AdoptionRequest,
  | "animal_id"
  | "animal_name"
  | "animal_type"
  | "applicant_name"
  | "phone"
  | "address"
  | "occupation"
  | "housing_type"
  | "has_fence"
  | "has_other_pets"
  | "experience"
  | "reason"
>;

export const statusLabels: Record<AdoptionStatus, string> = {
  pending: "รอพิจารณา",
  approved: "อนุมัติแล้ว",
  rejected: "ไม่อนุมัติ",
};

