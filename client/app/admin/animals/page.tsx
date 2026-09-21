"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Animal } from "@/types/animal";
import { THAI_PROVINCES } from "@/constants/provinces";

interface ShelterOption {
    shelter_id: string;
    shelter_name: string;
    province: string;
}

// รายการวัคซีนหลักสำหรับสุนัขและแมว
const VACCINE_OPTIONS = [
    "พิษสุนัขบ้า",
    "รวม 5 โรค (สุนัข)",
    "รวมไข้หัด-หวัดแมว (แมว)",
    "ลิวคีเมีย (แมว)",
];

export default function AdminAnimalsPage() {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [shelters, setShelters] = useState<ShelterOption[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // State สำหรับ Modal พรีวิวดูรายละเอียด
    const [viewingAnimal, setViewingAnimal] = useState<Animal | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

    // State สำหรับ Modal เพิ่ม/แก้ไข (CRUD)
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // State สำหรับบอกสถานะระหว่างกำลังอัปโหลด
    const [uploading, setUploading] = useState<boolean>(false);

    // ฟังก์ชันอัปโหลดรูปจากเครื่อง/มือถือ เข้า Supabase Storage
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadedUrls: string[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // ป้องกันชื่อไฟล์ซ้ำด้วย Timestamp และ Random String
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
                const filePath = `animals/${fileName}`;

                // 1. อัปโหลดเข้า Storage Bucket 'animal-images'
                const { error: uploadError } = await supabase.storage
                    .from('animal-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // 2. ดึง Public URL ของรูปที่เพิ่งอัปโหลด
                const { data } = supabase.storage
                    .from('animal-images')
                    .getPublicUrl(filePath);

                if (data?.publicUrl) {
                    uploadedUrls.push(data.publicUrl);
                }
            }

            // รวมรูปภาพใหม่เข้ากับลิสต์รูปเดิมที่มีอยู่ในฟอร์ม
            const currentImgs = Array.isArray(formData.image_urls) ? formData.image_urls : [];
            setFormData({
                ...formData,
                image_urls: [...currentImgs.filter(Boolean), ...uploadedUrls],
            });
        } catch (err: any) {
            alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: " + err.message);
        } finally {
            setUploading(false);
            // รีเซ็ต input value เพื่อให้เลือกไฟล์เดิมซ้ำได้หากต้องการ
            e.target.value = "";
        }
    };

    // ฟังก์ชันลบรูปภาพที่ไม่ต้องการออกจากลิสต์พรีวิว
    const handleRemoveImage = (indexToRemove: number) => {
        const currentImgs = Array.isArray(formData.image_urls) ? formData.image_urls : [];
        setFormData({
            ...formData,
            image_urls: currentImgs.filter((_, idx) => idx !== indexToRemove),
        });
    };



    // ฟิลด์ข้อมูลใน Form
    const [formData, setFormData] = useState({
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
        image_urls: [] as string[], // เก็บเป็น Array ของ URL
        shelter_id: "",
    });

    // ฟังก์ชันจัดการติ๊ก / ปลดติ๊กวัคซีน
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

    // State ตัวกรอง
    const [filterSpecies, setFilterSpecies] = useState("all");
    const [filterGender, setFilterGender] = useState("all");
    const [filterAge, setFilterAge] = useState("all");
    const [filterProvince, setFilterProvince] = useState("all");
    const [filterColor, setFilterColor] = useState("all");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // ฟังก์ชันเปลี่ยนค่า URL ของรูปภาพในแต่ละแถว
    const handleImageUrlChange = (index: number, value: string) => {
        const updated = [...formData.image_urls];
        updated[index] = value;
        setFormData({ ...formData, image_urls: updated });
    };

    // ฟังก์ชันกดปุ่ม "+ เพิ่มรูปภาพ"
    const handleAddImageField = () => {
        setFormData({
            ...formData,
            image_urls: [...formData.image_urls, ""],
        });
    };

    // ฟังก์ชันกดปุ่ม "ลบรูปภาพ"
    const handleRemoveImageField = (indexToRemove: number) => {
        const updated = formData.image_urls.filter((_, idx) => idx !== indexToRemove);
        setFormData({ ...formData, image_urls: updated });
    };

    // Helper ดึงรูปภาพ ป้องกันบั๊กวงเล็บปีกกาและรองรับหลายรูป
    const getAnimalImages = (imageUrl: any): string[] => {
        if (!imageUrl) return ["https://images.unsplash.com/photo-1543466835-00a7907e9de1"];
        if (Array.isArray(imageUrl)) {
            return imageUrl.filter((url) => typeof url === "string" && url.trim() !== "");
        }
        if (typeof imageUrl === "string") {
            try {
                if (imageUrl.startsWith("[") && imageUrl.endsWith("]")) {
                    const parsed = JSON.parse(imageUrl);
                    if (Array.isArray(parsed)) return parsed;
                }
            } catch (e) { }

            const cleanStr = imageUrl.replace(/^\{|\}$/g, "").replace(/["']/g, "");
            const list = cleanStr.split(",").map((url) => url.trim()).filter(Boolean);
            return list.length > 0 ? list : ["https://images.unsplash.com/photo-1543466835-00a7907e9de1"];
        }
        return ["https://images.unsplash.com/photo-1543466835-00a7907e9de1"];
    };

    // ดึงข้อมูลรายชื่อศูนย์พักพิงมาใส่ใน Dropdown ฟอร์ม
    const fetchShelters = async () => {
        const { data } = await supabase.from("shelters").select("shelter_id, shelter_name, province");
        if (data) {
            setShelters(data);
            if (data.length > 0 && !formData.shelter_id) {
                setFormData((prev) => ({ ...prev, shelter_id: data[0].shelter_id }));
            }
        }
    };

    // 1. READ: ดึงข้อมูลสัตว์ทั้งหมด (ไม่กรอง status ทิ้ง เพราะ Admin ต้องจัดการได้ทุกสถานะ)
    const fetchAnimals = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from("animals")
                .select(`
          *,
          shelters (
            shelter_name,
            province,
            address,
            contact_phone
          )
        `)
                .order("created_at", { ascending: false });

            if (filterSpecies !== "all") query = query.eq("species", filterSpecies);
            if (filterGender !== "all") query = query.eq("gender", filterGender);
            if (filterAge !== "all") query = query.eq("age", filterAge);
            if (filterColor !== "all") query = query.eq("color", filterColor);

            const { data, error } = await query;
            if (error) {
                console.error("Fetch Error:", error.message);
                setAnimals([]);
            } else {
                let result = (data as Animal[]) || [];
                if (filterProvince !== "all") {
                    result = result.filter((item) => item.shelters?.province === filterProvince);
                }
                setAnimals(result);
            }
        } catch (err) {
            console.error(err);
            setAnimals([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnimals();
        fetchShelters();
    }, [filterSpecies, filterGender, filterAge, filterProvince, filterColor]);

    // เปิดฟอร์มเพิ่มสัตว์ใหม่ (CREATE MODE)
    const handleOpenCreateModal = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({
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
            shelter_id: shelters[0]?.shelter_id || "",
        });
        setIsFormModalOpen(true);
    };



    // เปิดฟอร์มแก้ไข (UPDATE MODE)
    // เปิดฟอร์มแก้ไข (UPDATE MODE)
    const handleOpenEditModal = (animal: Animal) => {
        setIsEditing(true);
        setEditingId(animal.animal_id);

        // ✅ ดึง URL รูปภาพเดิมมาแปลงเป็น Array สะอาด
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
            // ถ้ามีรูปเดิมให้ใช้รูปเดิม ถ้าไม่มีให้เปิด 1 ช่องว่างไว้กรอก
            image_urls: initialImages.length > 0 ? initialImages : [""],
            shelter_id: animal.shelter_id || shelters[0]?.shelter_id || "",
            is_neutered: Boolean(animal.is_neutered), // ดึงค่า true/false จาก Supabase
        });
        setIsFormModalOpen(true);
    };

    // บันทึกข้อมูล Create / Update ไปยัง Supabase
    // บันทึกข้อมูล Create / Update ไปยัง Supabase
    const handleSaveAnimal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // ✅ 1. คัดเอาเฉพาะ URL ที่ไม่ว่างเปล่า และขึ้นต้นด้วย http หรือ https
            const validImages = formData.image_urls
                .map((url) => url.trim())
                .filter((url) => url.length > 0 && (url.startsWith("http://") || url.startsWith("https://")));

            // ✅ 2. ประกอบ Payload (บันทึกลงคอลัมน์ image_url เป็น Array)
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
                image_url: validImages, // ส่งเป็น string[] ขึ้น Supabase
                shelter_id: formData.shelter_id || null,
                is_neutered: Boolean(formData.is_neutered),
            };

            if (isEditing && editingId) {
                // UPDATE
                const { data, error } = await supabase
                    .from("animals")
                    .update(payload)
                    .eq("animal_id", editingId)
                    .select();

                if (error) throw error;
                alert("อัปเดตข้อมูลและรูปภาพสำเร็จ! 🐾");
            } else {
                // CREATE
                const { error } = await supabase.from("animals").insert([payload]);
                if (error) throw error;
                alert("เพิ่มข้อมูลสัตว์ใหม่สำเร็จ! 🐶🐱");
            }

            setIsFormModalOpen(false);
            fetchAnimals(); // โหลดข้อมูลใหม่เพื่ออัปเดตรูปบนการ์ดทันที
        } catch (err: any) {
            console.error("Save Error:", err);
            alert(`เกิดข้อผิดพลาด: ${err.message}`);
        }
    };

    // 3. DELETE: ลบข้อมูลสัตว์ออกจาก Supabase
    const handleDeleteAnimal = async (animalId: string, animalName: string) => {
        if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูล "${animalName}" ออกจากระบบ?`)) return;
        try {
            const { error } = await supabase.from("animals").delete().eq("animal_id", animalId);
            if (error) throw error;
            alert(`ลบข้อมูล "${animalName}" สำเร็จเรียบร้อย`);
            setAnimals((prev) => prev.filter((item) => item.animal_id !== animalId));
            if (viewingAnimal?.animal_id === animalId) setViewingAnimal(null);
        } catch (err: any) {
            alert(`ไม่สามารถลบข้อมูลได้: ${err.message}`);
        }
    };

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 min-h-screen">
            {/* ส่วนหัวหน้า Admin */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="font-mali font-semibold text-2xl sm:text-4xl text-textMain">จัดการทะเบียนสัตว์จรจัด 🐾</h1>
                        <span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full font-prompt font-semibold">
                            Admin Mode
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm">ระบบจัดการฐานข้อมูลสัตว์จรจัด (เพิ่ม / แก้ไข / ลบ ข้อมูลสัตว์)</p>
                </div>

                {/* ปุ่มเปิดฟอร์มเพิ่มสัตว์ (CREATE) */}
                <button
                    onClick={handleOpenCreateModal}
                    className="font-mali font-semibold bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-2xl transition duration-300 shadow-md flex items-center gap-2"
                >
                    <i className="fa-solid fa-circle-plus text-lg"></i> เพิ่มข้อมูลสัตว์ใหม่
                </button>
            </div>

            {/* กล่อง Filter */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <div
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center justify-between font-mali font-semibold text-primary text-base sm:text-lg cursor-pointer sm:cursor-default"
                >
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-filter"></i> ตัวกรองการค้นหา
                    </div>
                    <button type="button" className="sm:hidden text-xs bg-bgAccent px-3 py-1.5 rounded-full text-primary">
                        {isFilterOpen ? "ย่อตัวกรอง" : "เปิดตัวกรอง"}
                    </button>
                </div>

                <div className={`mt-4 ${isFilterOpen ? "block" : "hidden sm:block"}`}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">ประเภทสัตว์</label>
                            <select
                                value={filterSpecies}
                                onChange={(e) => setFilterSpecies(e.target.value)}
                                className="w-full bg-bgMain border border-gray-200 text-sm rounded-xl p-2.5 outline-none"
                            >
                                <option value="all">🐾 ทั้งหมด</option>
                                <option value="สุนัข">🐶 สุนัข</option>
                                <option value="แมว">🐱 แมว</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">เพศ</label>
                            <select
                                value={filterGender}
                                onChange={(e) => setFilterGender(e.target.value)}
                                className="w-full bg-bgMain border border-gray-200 text-sm rounded-xl p-2.5 outline-none"
                            >
                                <option value="all">⚥ ทั้งหมด</option>
                                <option value="ตัวผู้">♂ ตัวผู้</option>
                                <option value="ตัวเมีย">♀ ตัวเมีย</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">ช่วงอายุ</label>
                            <select
                                value={filterAge}
                                onChange={(e) => setFilterAge(e.target.value)}
                                className="w-full bg-bgMain border border-gray-200 text-sm rounded-xl p-2.5 outline-none"
                            >
                                <option value="all">⏳ ทุกช่วงวัย</option>
                                <option value="เด็ก (0-1 ปี)">เด็ก (0-1 ปี)</option>
                                <option value="โตเต็มวัย (1-7 ปี)">โตเต็มวัย (1-7 ปี)</option>
                                <option value="สูงอายุ (7 ปีขึ้นไป)">สูงอายุ (7 ปีขึ้นไป)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">สีหลัก</label>
                            <select
                                value={filterColor}
                                onChange={(e) => setFilterColor(e.target.value)}
                                className="w-full bg-bgMain border border-gray-200 text-sm rounded-xl p-2.5 outline-none"
                            >
                                <option value="all">🎨 ทุกสี</option>
                                <option value="ขาว">ขาว</option>
                                <option value="ดำ">ดำ</option>
                                <option value="น้ำตาล">น้ำตาล</option>
                                <option value="ส้ม">ส้ม</option>
                                <option value="เทา">เทา</option>
                                <option value="ครีม">ครีม</option>
                            </select>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs text-gray-500 mb-1">พื้นที่ / จังหวัด</label>
                            <select
                                value={filterProvince}
                                onChange={(e) => setFilterProvince(e.target.value)}
                                className="w-full bg-bgMain border border-gray-200 text-sm rounded-xl p-2.5 outline-none"
                            >
                                <option value="all">📍 ทั่วประเทศ</option>
                                {THAI_PROVINCES.map((prov) => (
                                    <option key={prov} value={prov}>{prov}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* รายการ Card แสดงผลสำหรับ Admin */}
            {loading ? (
                <div className="text-center py-20 text-gray-400 font-mali">
                    <i className="fa-solid fa-spinner fa-spin text-3xl text-primary mb-3 block"></i> กำลังโหลดข้อมูล...
                </div>
            ) : animals.length === 0 ? (
                <div className="text-center py-20 text-gray-400 font-mali bg-white rounded-2xl border border-gray-100">
                    ไม่พบข้อมูลสัตว์ที่ตรงกับเงื่อนไข
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {animals.map((animal) => (
                        <div
                            key={animal.animal_id}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col h-full group"
                        >
                            {/* คลิกดู Preview รายละเอียด */}
                            <div
                                onClick={() => {
                                    setViewingAnimal(animal);
                                    setCurrentImageIndex(0);
                                }}
                                className="h-56 bg-bgAccent flex items-center justify-center relative overflow-hidden cursor-pointer"
                            >
                                <img
                                    src={getAnimalImages(animal.image_url)[0]}
                                    alt={animal.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                                <span className="absolute top-3 left-3 bg-white/90 text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm flex items-center gap-1.5">
                                    <span
                                        className={`w-2 h-2 rounded-full ${animal.status === "รอคนดูแล"
                                            ? "bg-green-500 animate-pulse"
                                            : animal.status === "รอการอนุมัติ"
                                                ? "bg-orange-400"
                                                : "bg-gray-400"
                                            }`}
                                    ></span>
                                    {animal.status}
                                </span>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-itim text-2xl text-textMain">{animal.name}</h3>
                                    <span
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${animal.gender === "ตัวเมีย" ? "bg-pink-50 text-pink-500" : "bg-blue-50 text-blue-500"
                                            }`}
                                    >
                                        <i className={`fa-solid ${animal.gender === "ตัวเมีย" ? "fa-venus" : "fa-mars"}`}></i>
                                    </span>
                                </div>

                                <div className="text-xs text-gray-500 mb-4 space-y-1">
                                    <p><i className="fa-solid fa-paw text-primary mr-1.5"></i> {animal.species}</p>
                                    <p><i className="fa-solid fa-location-dot text-primary mr-1.5"></i> {animal.shelters?.shelter_name || "ไม่ระบุศูนย์"}</p>
                                </div>

                                {/* ปุ่มควบคุม CRUD บนการ์ด: แก้ไข & ลบ */}
                                <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-gray-50">
                                    <button
                                        onClick={() => handleOpenEditModal(animal)}
                                        className="font-mali font-semibold text-xs border border-primary text-primary hover:bg-bgAccent py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i> แก้ไข
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAnimal(animal.animal_id, animal.name)}
                                        className="font-mali font-semibold text-xs border border-red-200 text-red-500 hover:bg-red-50 py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                                    >
                                        <i className="fa-solid fa-trash-can"></i> ลบ
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ============================================================ */}
            {/* 2. MODAL FORM: สำหรับเพิ่มสัตว์ใหม่ (CREATE) และแก้ไข (UPDATE) */}
            {/* ============================================================ */}
            {isFormModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl">
                        <button
                            onClick={() => setIsFormModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>

                        <h2 className="font-mali font-semibold text-2xl mb-6 text-textMain flex items-center gap-2">
                            <i className={`fa-solid ${isEditing ? "fa-pen-to-square text-primary" : "fa-circle-plus text-primary"}`}></i>
                            {isEditing ? "แก้ไขข้อมูลสัตว์" : "เพิ่มข้อมูลสัตว์ใหม่เข้าสู่ระบบ"}
                        </h2>

                        <form onSubmit={handleSaveAnimal} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">ชื่อสัตว์ *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary"
                                        placeholder="เช่น ทองเอก"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        ศูนย์พักพิงที่สังกัด *
                                    </label>
                                    <select
                                        value={formData.shelter_id || ""}
                                        onChange={(e) => setFormData({ ...formData, shelter_id: e.target.value })}
                                        className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-xl p-2.5 outline-none focus:border-primary transition"
                                        required
                                    >
                                        <option value="">-- เลือกศูนย์พักพิง --</option>
                                        {shelters.map((s) => (
                                            <option key={s.shelter_id} value={s.shelter_id}>
                                                {s.shelter_name} {s.province ? `(${s.province})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">ประเภทสัตว์</label>
                                    <select
                                        value={formData.species}
                                        onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary"
                                    >
                                        <option value="สุนัข">สุนัข</option>
                                        <option value="แมว">แมว</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">เพศ</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary"
                                    >
                                        <option value="ตัวผู้">ตัวผู้</option>
                                        <option value="ตัวเมีย">ตัวเมีย</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">ช่วงอายุ</label>
                                    <select
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary"
                                    >
                                        <option value="เด็ก (0-1 ปี)">เด็ก (0-1 ปี)</option>
                                        <option value="โตเต็มวัย (1-7 ปี)">โตเต็มวัย (1-7 ปี)</option>
                                        <option value="สูงอายุ (7 ปีขึ้นไป)">สูงอายุ (7 ปีขึ้นไป)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">สีหลัก *</label>
                                    <select
                                        value={formData.color || "ขาว"}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-xl p-2.5 outline-none focus:border-primary"
                                        required
                                    >
                                        <option value="ขาว">ขาว</option>
                                        <option value="ดำ">ดำ</option>
                                        <option value="น้ำตาล">น้ำตาล</option>
                                        <option value="ส้ม">ส้ม</option>
                                        <option value="เทา">เทา</option>
                                        <option value="ครีม">ครีม</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">สถานะสุขภาพ</label>
                                    <select
                                        value={formData.health_status}
                                        onChange={(e) => setFormData({ ...formData, health_status: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary"
                                    >
                                        <option value="ปกติ">ปกติ</option>
                                        <option value="ป่วย">ป่วย</option>
                                        <option value="บาดเจ็บ">บาดเจ็บ</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">สถานะหาบ้าน</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary"
                                    >
                                        <option value="รอคนดูแล">รอคนดูแล</option>
                                        <option value="รอการอนุมัติ">รอการอนุมัติ</option>
                                        <option value="ได้บ้านแล้ว">ได้บ้านแล้ว</option>
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                                        ประวัติวัคซีน (เลือกได้หลายรายการ)
                                    </label>
                                    <div className="grid grid-cols-2 gap-2.5 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        {VACCINE_OPTIONS.map((vaccineName) => {
                                            const currentList = formData.vaccine
                                                ? formData.vaccine.split(",").map((v) => v.trim())
                                                : [];
                                            const isChecked = currentList.includes(vaccineName);

                                            return (
                                                <label
                                                    key={vaccineName}
                                                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs cursor-pointer border transition ${isChecked
                                                        ? "bg-primary/10 border-primary text-primary font-semibold"
                                                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-100"
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleVaccineToggle(vaccineName)}
                                                        className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                                                    />
                                                    <span>{vaccineName}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>

                            {/* ส่วนจัดการรูปภาพ: รองรับอัปโหลดจากเครื่องทั้งคอมฯ และมือถือ */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-semibold text-gray-700">
                                        รูปภาพสัตว์ (รูปแรกสุดจะเป็นรูปหน้าปก)
                                    </label>

                                    {/* ปุ่มอัปโหลดรูปภาพ */}
                                    <label className={`cursor-pointer text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${uploading
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-primary/10 text-primary hover:bg-primary/20"
                                        }`}>
                                        <i className={`fa-solid ${uploading ? "fa-spinner fa-spin" : "fa-cloud-arrow-up"}`}></i>
                                        <span>{uploading ? "กำลังอัปโหลด..." : "+ อัปโหลดรูปภาพ"}</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {/* ตาราง Preview รูปภาพทั้งหมด พร้อมปุ่มลบ */}
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 min-h-[96px] items-center">
                                    {formData.image_urls && formData.image_urls.length > 0 ? (
                                        formData.image_urls.map((url, idx) => (
                                            <div key={idx} className="relative group w-full aspect-square rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                                                <img
                                                    src={url}
                                                    alt={`preview-${idx}`}
                                                    className="w-full h-full object-cover"
                                                />

                                                {/* ป้ายหน้าปกรูปแรก */}
                                                {idx === 0 && (
                                                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                                                        หน้าปก
                                                    </span>
                                                )}

                                                {/* ปุ่มกากบาทลบรูป */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(idx)}
                                                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs transition shadow"
                                                    title="ลบรูปนี้"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center col-span-full py-4">
                                            {uploading ? "กำลังบันทึกรูปภาพขึ้นระบบ..." : "ยังไม่มีรูปภาพ กรุณากดปุ่ม + อัปโหลดรูปภาพ"}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-600 mb-1">รายละเอียดสุขภาพ / กายภาพเพิ่มเติม</label>
                                <input
                                    type="text"
                                    value={formData.health_description}
                                    onChange={(e) => setFormData({ ...formData, health_description: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary"
                                    placeholder="เช่น มีแผลเป็นที่ขาหลังซ้าย หายสนิทแล้ว"
                                />
                            </div>

                            {/* ช่องสถานะการทำหมัน (Checkbox) */}
                            <div className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                <input
                                    type="checkbox"
                                    id="is_neutered"
                                    checked={Boolean(formData.is_neutered)}
                                    onChange={(e) => setFormData({ ...formData, is_neutered: e.target.checked })}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary cursor-pointer"
                                />
                                <label htmlFor="is_neutered" className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
                                    ทำหมันแล้ว (ติ๊กถูกเมื่อสัตว์ได้รับการทำหมันแล้ว)
                                </label>
                            </div>


                            <div>
                                <label className="block text-xs text-gray-600 mb-1">เรื่องราวและลักษณะนิสัย</label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-primary"
                                    placeholder="เช่น ขี้เล่น ร่าเริง ชอบนอนหงายให้อ้อนพุง..."
                                />
                            </div>

                        
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsFormModalOpen(false)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-mali hover:bg-gray-50"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-mali font-semibold hover:bg-primaryHover shadow-sm"
                                >
                                    บันทึกข้อมูล
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* 3. MODAL VIEW: พรีวิวรายละเอียดสัตว์สำหรับ Admin */}
            {/* ============================================================ */}
            {viewingAnimal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row relative shadow-2xl">
                        <button
                            onClick={() => setViewingAnimal(null)}
                            className="absolute top-4 right-4 bg-white/80 backdrop-blur text-gray-500 hover:text-primary hover:bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm z-20 transition"
                        >
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>

                        {/* แกลเลอรีรูปภาพ */}
                        <div className="lg:w-1/2 bg-gray-50/50 p-6 flex flex-col justify-start gap-4 border-b lg:border-b-0 lg:border-r border-gray-100">
                            {(() => {
                                const images = getAnimalImages(viewingAnimal.image_url);
                                return (
                                    <>
                                        <div className="relative w-full flex-1 min-h-[300px] max-h-[420px] bg-gray-100 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center group">
                                            <img
                                                src={images[currentImageIndex] || images[0]}
                                                alt={viewingAnimal.name}
                                                className="w-full h-full object-cover select-none transition-all duration-300"
                                            />
                                            {images.length > 1 && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                                                        }}
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow"
                                                    >
                                                        <i className="fa-solid fa-chevron-left text-xs"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                                                        }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow"
                                                    >
                                                        <i className="fa-solid fa-chevron-right text-xs"></i>
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {images.length > 1 && (
                                            <div className="grid grid-cols-4 gap-2">
                                                {images.map((url, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => setCurrentImageIndex(idx)}
                                                        className={`h-16 rounded-xl overflow-hidden border-2 ${currentImageIndex === idx ? "border-primary" : "border-transparent opacity-60"
                                                            }`}
                                                    >
                                                        <img src={url} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        {/* รายละเอียด */}
                        <div className="lg:w-1/2 p-6 sm:p-8 flex flex-col overflow-y-auto">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                                    {viewingAnimal.status}
                                </span>
                                <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                                    สุขภาพ: {viewingAnimal.health_status}
                                </span>
                            </div>

                            <h2 className="font-itim text-4xl text-textMain mb-4">{viewingAnimal.name}</h2>

                            <p className="text-xs text-gray-500 mb-4 bg-gray-50 p-3 rounded-xl leading-relaxed">
                                {viewingAnimal.description || "ไม่มีคำบรรยาย"}
                            </p>

                            <div className="grid grid-cols-2 gap-3 text-xs mb-6">
                                <div><span className="text-gray-400">ประเภท:</span> <span className="font-semibold">{viewingAnimal.species}</span></div>
                                <div><span className="text-gray-400">เพศ:</span> <span className="font-semibold">{viewingAnimal.gender}</span></div>
                                <div><span className="text-gray-400">อายุ:</span> <span className="font-semibold">{viewingAnimal.age}</span></div>
                                <div><span className="text-gray-400">สี:</span> <span className="font-semibold">{viewingAnimal.color}</span></div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                                <button
                                    onClick={() => {
                                        const target = viewingAnimal;
                                        setViewingAnimal(null);
                                        handleOpenEditModal(target);
                                    }}
                                    className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-mali font-semibold hover:bg-primaryHover"
                                >
                                    แก้ไขข้อมูลสัตว์ตัวนี้
                                </button>
                                <button
                                    onClick={() => handleDeleteAnimal(viewingAnimal.animal_id, viewingAnimal.name)}
                                    className="px-4 py-2.5 bg-red-50 text-red-500 rounded-xl text-xs font-mali font-semibold hover:bg-red-100"
                                >
                                    ลบ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}