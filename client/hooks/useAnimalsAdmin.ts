import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Animal } from "@/types/animal";
import { ShelterOption } from "@/types/shelter";
import { getAnimalImages } from "@/lib/animalImageHelper";

export interface AnimalFormData {
  name: string;
  species: string;
  gender: string;
  age: string;
  color: string;
  health_status: string;
  health_description: string;
  description: string;
  status: string;
  is_neutered: boolean;
  vaccine: string;
  image_urls: string[];
  shelter_id: string;
}

const defaultFormData: AnimalFormData = {
  name: "",
  species: "สุนัข",
  gender: "ตัวผู้",
  age: "โตเต็มวัย (1-7 ปี)",
  color: "ขาว",
  health_status: "ปกติ",
  health_description: "",
  description: "",
  status: "รอคนดูแล",
  is_neutered: false,
  vaccine: "",
  image_urls: [""],
  shelter_id: "",
};

export function useAnimalsAdmin() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [shelters, setShelters] = useState<ShelterOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State สำหรับ Modal พรีวิว
  const [viewingAnimal, setViewingAnimal] = useState<Animal | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // State สำหรับ Modal Form (CRUD)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [formData, setFormData] = useState<AnimalFormData>(defaultFormData);

  // State ตัวกรอง
  const [filterSpecies, setFilterSpecies] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterAge, setFilterAge] = useState("all");
  const [filterProvince, setFilterProvince] = useState("all");
  const [filterColor, setFilterColor] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // State สำหรับกล่องยืนยัน
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "update" | "delete";
    title: string;
    animalName: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: "update",
    title: "",
    animalName: "",
    message: "",
    onConfirm: () => {},
  });

  // 🌟 State สำหรับ Toast แจ้งเตือน
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 3000); // แสดงค้าง 3 วินาทีแล้วจางหาย
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  // ดึงศูนย์พักพิง
  const fetchShelters = async () => {
    const { data } = await supabase.from("shelters").select("shelter_id, shelter_name, province");
    if (data) {
      setShelters(data);
      if (data.length > 0 && !formData.shelter_id) {
        setFormData((prev) => ({ ...prev, shelter_id: data[0].shelter_id }));
      }
    }
  };

  // ดึงข้อมูลสัตว์ทั้งหมด
  const fetchAnimals = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("animals")
        .select(`*, shelters (shelter_name, province, address, contact_phone)`)
        .order("created_at", { ascending: false });

      if (filterSpecies !== "all") query = query.eq("species", filterSpecies);
      if (filterGender !== "all") query = query.eq("gender", filterGender);
      if (filterAge !== "all") query = query.eq("age", filterAge);
      if (filterColor !== "all") query = query.eq("color", filterColor);

      const { data, error } = await query;
      if (error) {
        setAnimals([]);
      } else {
        let result = (data as Animal[]) || [];
        if (filterProvince !== "all") {
          result = result.filter((item) => item.shelters?.province === filterProvince);
        }
        setAnimals(result);
      }
    } catch {
      setAnimals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
    fetchShelters();
  }, [filterSpecies, filterGender, filterAge, filterProvince, filterColor]);

  // ฟังก์ชันอัปโหลดรูปภาพ
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `animals/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("animal-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("animal-images").getPublicUrl(filePath);
        if (data?.publicUrl) uploadedUrls.push(data.publicUrl);
      }

      const currentImgs = Array.isArray(formData.image_urls) ? formData.image_urls : [];
      setFormData({
        ...formData,
        image_urls: [...currentImgs.filter(Boolean), ...uploadedUrls],
      });
      showToast("อัปโหลดรูปภาพเรียบร้อยแล้ว");
    } catch (err: any) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const currentImgs = Array.isArray(formData.image_urls) ? formData.image_urls : [];
    setFormData({
      ...formData,
      image_urls: currentImgs.filter((_, idx) => idx !== indexToRemove),
    });
  };

  const handleVaccineToggle = (vaccineName: string) => {
    const currentVaccines = formData.vaccine
      ? formData.vaccine.split(",").map((v) => v.trim()).filter(Boolean)
      : [];

    let updatedVaccines: string[];
    if (currentVaccines.includes(vaccineName)) {
      updatedVaccines = currentVaccines.filter((v) => v !== vaccineName);
    } else {
      updatedVaccines = [...currentVaccines, vaccineName];
    }

    setFormData({
      ...formData,
      vaccine: updatedVaccines.join(", "),
    });
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      ...defaultFormData,
      shelter_id: shelters[0]?.shelter_id || "",
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (animal: Animal) => {
    setIsEditing(true);
    setEditingId(animal.animal_id);
    const initialImages = getAnimalImages(animal.image_url);

    setFormData({
      name: animal.name || "",
      species: animal.species || "สุนัข",
      gender: animal.gender || "ตัวผู้",
      age: animal.age || "โตเต็มวัย (1-7 ปี)",
      color: animal.color || "ขาว",
      health_status: animal.health_status || "ปกติ",
      health_description: animal.health_description || "",
      description: animal.description || "",
      status: animal.status || "รอคนดูแล",
      vaccine: animal.vaccine || "",
      image_urls: initialImages.length > 0 ? initialImages : [""],
      shelter_id: animal.shelter_id || shelters[0]?.shelter_id || "",
      is_neutered: Boolean(animal.is_neutered),
    });
    setIsFormModalOpen(true);
  };

  // การบันทึกจริงไปยังฐานข้อมูล + เรียก Toast Success
  const executeSave = async () => {
    try {
      const validImages = formData.image_urls
        .map((url) => (typeof url === "string" ? url.trim() : ""))
        .filter((url) => url.length > 0 && (url.startsWith("http://") || url.startsWith("https://")));

      const payload: any = {
        name: formData.name,
        species: formData.species,
        gender: formData.gender,
        age: formData.age,
        color: formData.color,
        health_status: formData.health_status,
        health_description: formData.health_description,
        description: formData.description,
        status: formData.status,
        vaccine: formData.vaccine,
        image_url: validImages,
        shelter_id: formData.shelter_id || null,
        is_neutered: Boolean(formData.is_neutered),
      };

      if (isEditing && editingId) {
        const { error } = await supabase.from("animals").update(payload).eq("animal_id", editingId);
        if (error) throw error;
        showToast("แก้ไขข้อมูลสัตว์สำเร็จแล้วเรียบร้อย! 🐾");
      } else {
        const { error } = await supabase.from("animals").insert([payload]);
        if (error) throw error;
        showToast("เพิ่มข้อมูลสัตว์ตัวใหม่สำเร็จแล้ว! 🐶🐱");
      }

      setIsFormModalOpen(false);
      fetchAnimals();
    } catch (err: any) {
      console.error(err);
    }
  };

  // ดักถามยืนยันก่อนบันทึก
  const handleSaveAnimal = (e: React.FormEvent) => {
    e.preventDefault();

    setConfirmModal({
      isOpen: true,
      type: "update",
      title: isEditing ? "ยืนยันการแก้ไขข้อมูลสัตว์" : "ยืนยันการเพิ่มข้อมูลสัตว์",
      animalName: formData.name,
      message: isEditing
        ? "ระบบจะทำการอัปเดตข้อมูลรายละเอียด ประวัติสุขภาพ และรูปภาพเข้าสู่ระบบส่วนกลาง โปรดยืนยันการดำเนินการ"
        : "ระบบจะทำการเพิ่มข้อมูลสัตว์ตัวใหม่เข้าสู่ระบบ โปรดยืนยันการดำเนินการ",
      onConfirm: () => {
        closeConfirmModal();
        executeSave();
      },
    });
  };

  // ดักถามยืนยันก่อนลบ + เรียก Toast Success
  const handleDeleteAnimal = (animalId: string, animalName: string) => {
    setConfirmModal({
      isOpen: true,
      type: "delete",
      title: "ยืนยันการลบข้อมูลสัตว์จรจัด",
      animalName: animalName,
      message: "ข้อมูลของสัตว์ตัวนี้และประวัติทั้งหมดจะถูกลบออกจากฐานข้อมูลอย่างถาวรและไม่สามารถกู้คืนได้",
      onConfirm: async () => {
        closeConfirmModal();
        try {
          const { error } = await supabase.from("animals").delete().eq("animal_id", animalId);
          if (error) throw error;
          showToast(`ลบข้อมูล "${animalName}" สำเร็จแล้วเรียบร้อย 🗑️`);
          setAnimals((prev) => prev.filter((item) => item.animal_id !== animalId));
          if (viewingAnimal?.animal_id === animalId) setViewingAnimal(null);
        } catch (err: any) {
          console.error(err);
        }
      },
    });
  };

  return {
    animals,
    shelters,
    loading,
    viewingAnimal,
    setViewingAnimal,
    currentImageIndex,
    setCurrentImageIndex,
    isFormModalOpen,
    setIsFormModalOpen,
    isEditing,
    uploading,
    formData,
    setFormData,
    filterSpecies,
    setFilterSpecies,
    filterGender,
    setFilterGender,
    filterAge,
    setFilterAge,
    filterProvince,
    setFilterProvince,
    filterColor,
    setFilterColor,
    isFilterOpen,
    setIsFilterOpen,
    confirmModal,
    closeConfirmModal,
    toast, // 👈 ส่ง toast state ออกไป
    handleFileUpload,
    handleRemoveImage,
    handleVaccineToggle,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSaveAnimal,
    handleDeleteAnimal,
  };
}