export interface Animal {
  animal_id: string;
  name: string;
  species: string;
  gender: string;
  age: string;
  color: string;
  is_neutered: boolean;
  health_status: 'ปกติ' | 'ป่วย' | 'บาดเจ็บ';
  image_url: string | null;
  status: 'รอคนดูแล' | 'รอการอนุมัติ' | 'ได้บ้านแล้ว';
  vaccine?: string;
  shelter_id?: string | null;
  shelters?: {
    shelter_name: string;
    province: string;
    address: string;
    contact_phone: string;
  } | null;
}