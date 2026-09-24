export interface Animal {
  animal_id: string;
  name: string;
  species: string;
  gender: string;
  age: string;
  color: string;
  is_neutered: boolean;
  health_status: 'ปกติ' | 'ป่วย' | 'บาดเจ็บ';
  image_url: string | string[] | null;
  status: 'รอคนดูแล' | 'รอการอนุมัติ' | 'ได้บ้านแล้ว';
  vaccine?: string;
  shelter_id?: string | null;
  shelters?: {
    shelter_name: string;
    province: string;
    address: string;
    contact_phone: string;
  } | null;

  // 👇 ของใหม่ที่เพิ่มเข้าไปเพื่อรองรับฟีเจอร์เพิ่มเติม
  created_at?: string;            // ใช้นับระยะเวลาที่รอคอยบ้าน (Days in Shelter)
  description?: string;           // คำบรรยายลักษณะนิสัย / เรื่องราวความเป็นมา
  health_description?: string;    // รายละเอียดสุขภาพ (ระบุอาการเจ็บป่วย/บาดแผล)
}