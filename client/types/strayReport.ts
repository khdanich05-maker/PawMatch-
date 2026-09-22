export interface StrayReport {
  report_id: string;
  user_id: string;
  shelter_id?: string | null;
  animal_id?: string | null;
  location: string;
  image_url: string;
  report_date: string;
  approval_status: 'รอตรวจสอบ' | 'อนุมัติแล้ว' | 'ปฏิเสธ';
  species: 'สุนัข' | 'แมว' | string;
  color?: string | null;
  status: string; // อาการ/สภาพร่างกาย เช่น ปกติ, บาดเจ็บ
  shelters?: {
    shelter_name: string;
    province: string;
    contact_phone: string;
  } | null;
  users?: {
    username: string;
    email: string;
    phone: string;
  } | null;
}
