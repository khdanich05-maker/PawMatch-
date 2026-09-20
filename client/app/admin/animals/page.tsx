"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Animal } from "@/types/animal";
import { THAI_PROVINCES } from "@/constants/provinces";

export default function AdminAnimalsPage() {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [shelters, setShelters] = useState<{ shelter_id: string; shelter_name: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // State สำหรับควบคุม Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // ฟอร์มเพิ่มสัตว์ใหม่
    const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null); // ฟอร์มแก้ไขสัตว์ (Update)
    const [viewingAnimal, setViewingAnimal] = useState<Animal | null>(null); // ดูรูป/รายละเอียด

    // State ฟอร์มเพิ่มสัตว์ใหม่ (Create Form)
    const [formData, setFormData] = useState({
        name: "",
        species: "สุนัข",
        gender: "ตัวผู้",
        age: "เด็ก (0-1 ปี)",
        color: "ขาว",
        health_status: "ปกติ",
        shelter_id: "",
        image_url: "",
        vaccine: "",
        is_neutered: false,
    });

    // State ฟอร์มแก้ไขสัตว์ (Edit Form)
    const [editFormData, setEditFormData] = useState({
        name: "",
        species: "สุนัข",
        gender: "ตัวผู้",
        age: "เด็ก (0-1 ปี)",
        color: "ขาว",
        health_status: "ปกติ",
        status: "รอคนดูแล",
        shelter_id: "",
        image_url: "",
        vaccine: "",
        is_neutered: false,
    });

    // ตัวกรอง (Filters)
    const [filterSpecies, setFilterSpecies] = useState("all");
    const [filterGender, setFilterGender] = useState("all");
    const [filterAge, setFilterAge] = useState("all");
    const [filterProvince, setFilterProvince] = useState("all");
    const [filterColor, setFilterColor] = useState("all");

    // 1. ดึงรายชื่อศูนย์พักพิง
    const fetchShelters = async () => {
        const { data } = await supabase.from("shelters").select("shelter_id, shelter_name");
        if (data && data.length > 0) {
            setShelters(data);
            setFormData((prev) => ({ ...prev, shelter_id: data[0].shelter_id }));
        }
    };

    // 2. ดึงข้อมูลสัตว์ทั้งหมด (Read)
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
        `);

            if (filterSpecies !== "all") query = query.eq("species", filterSpecies);
            if (filterGender !== "all") query = query.eq("gender", filterGender);
            if (filterAge !== "all") query = query.eq("age", filterAge);
            if (filterColor !== "all") query = query.eq("color", filterColor);

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching animals:", error.message);
            } else {
                let result = data as Animal[];
                if (filterProvince !== "all") {
                    result = result.filter((item) => item.shelters?.province === filterProvince);
                }
                setAnimals(result || []);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShelters();
    }, []);

    useEffect(() => {
        fetchAnimals();
    }, [filterSpecies, filterGender, filterAge, filterProvince, filterColor]);

    // ==========================================
    // CREATE: เพิ่มข้อมูลสัตว์ใหม่ (Insert)
    // ==========================================
    const handleCreateAnimal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) {
            alert("กรุณากรอกชื่อสัตว์");
            return;
        }

        try {
            const { error } = await supabase.from("animals").insert([
                {
                    name: formData.name,
                    species: formData.species,
                    gender: formData.gender,
                    age: formData.age,
                    color: formData.color,
                    health_status: formData.health_status,
                    shelter_id: formData.shelter_id || null,
                    image_url: formData.image_url || "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
                    vaccine: formData.vaccine,
                    is_neutered: formData.is_neutered,
                    status: "รอคนดูแล",
                },
            ]);

            if (error) {
                alert("เกิดข้อผิดพลาดในการเพิ่มข้อมูล: " + error.message);
            } else {
                alert("เพิ่มข้อมูลสัตว์ใหม่สำเร็จ!");
                setIsAddModalOpen(false);
                setFormData({
                    name: "",
                    species: "สุนัข",
                    gender: "ตัวผู้",
                    age: "เด็ก (0-1 ปี)",
                    color: "ขาว",
                    health_status: "ปกติ",
                    shelter_id: shelters[0]?.shelter_id || "",
                    image_url: "",
                    vaccine: "",
                    is_neutered: false,
                });
                fetchAnimals();
            }
        } catch (err) {
            console.error("Insert error:", err);
        }
    };

    // ==========================================
    // UPDATE: เปิดหน้าต่างแก้ไข และ อัปเดตข้อมูลจริง
    // ==========================================
    const handleOpenEditModal = (animal: Animal) => {
        setEditingAnimal(animal);
        setEditFormData({
            name: animal.name || "",
            species: animal.species || "สุนัข",
            gender: animal.gender || "ตัวผู้",
            age: animal.age || "เด็ก (0-1 ปี)",
            color: animal.color || "ขาว",
            health_status: animal.health_status || "ปกติ",
            status: animal.status || "รอคนดูแล",
            shelter_id: animal.shelter_id || shelters[0]?.shelter_id || "",
            image_url: animal.image_url || "",
            vaccine: animal.vaccine || "",
            is_neutered: animal.is_neutered || false,
        });
    };

    const handleUpdateAnimal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAnimal) return;

        try {
            const { error } = await supabase
                .from("animals")
                .update({
                    name: editFormData.name,
                    species: editFormData.species,
                    gender: editFormData.gender,
                    age: editFormData.age,
                    color: editFormData.color,
                    health_status: editFormData.health_status,
                    status: editFormData.status,
                    shelter_id: editFormData.shelter_id || null,
                    image_url: editFormData.image_url,
                    vaccine: editFormData.vaccine,
                    is_neutered: editFormData.is_neutered,
                })
                .eq("animal_id", editingAnimal.animal_id);

            if (error) {
                alert("เกิดข้อผิดพลาดในการแก้ไขข้อมูล: " + error.message);
            } else {
                alert(`บันทึกการแก้ไข "${editFormData.name}" สำเร็จ!`);
                setEditingAnimal(null);
                fetchAnimals();
            }
        } catch (err) {
            console.error("Update error:", err);
        }
    };

    // ==========================================
    // DELETE: ลบข้อมูลสัตว์ออกจาก Supabase
    // ==========================================
    const handleDeleteAnimal = async (animalId: string, animalName: string) => {
        const confirmDelete = window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${animalName}" ออกจากระบบ?`);
        if (!confirmDelete) return;

        try {
            const { error } = await supabase.from("animals").delete().eq("animal_id", animalId);

            if (error) {
                alert(`ไม่สามารถลบได้: ${error.message}`);
            } else {
                alert(`ลบข้อมูล "${animalName}" เรียบร้อยแล้ว`);
                setAnimals((prev) => prev.filter((item) => item.animal_id !== animalId));
                if (viewingAnimal?.animal_id === animalId) setViewingAnimal(null);
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const handleResetFilter = () => {
        setFilterSpecies("all");
        setFilterGender("all");
        setFilterAge("all");
        setFilterProvince("all");
        setFilterColor("all");
    };

    return (
        <main className="max-w-7xl mx-auto px-6 py-12 min-h-screen">
            {/* ส่วนหัวหน้า Admin & ปุ่มเพิ่มข้อมูล */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="font-mali font-semibold text-4xl text-textMain">เพื่อนสี่ขาที่รอคอยบ้าน 🐾</h1>
                        <span className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full font-prompt font-semibold">
                            Admin Mode
                        </span>
                    </div>
                    <p className="text-gray-500">ระบบจัดการฐานข้อมูลสัตว์จรจัด (เพิ่ม/ลบ/แก้ไข)</p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="font-mali font-semibold bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-full transition duration-300 shadow-md flex items-center gap-2 transform hover:-translate-y-1 cursor-pointer"
                >
                    <i className="fa-solid fa-circle-plus text-lg"></i> เพิ่มข้อมูลสัตว์ใหม่
                </button>
            </div>

            {/* กล่องตัวกรอง (Filter) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10">
                <div className="flex items-center gap-2 font-mali font-semibold text-primary mb-4 text-lg">
                    <i className="fa-solid fa-filter"></i> ตัวกรองการค้นหา
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1 pl-1">ประเภทสัตว์</label>
                        <select
                            value={filterSpecies}
                            onChange={(e) => setFilterSpecies(e.target.value)}
                            className="w-full bg-bgMain border border-gray-200 text-textMain text-sm rounded-xl p-3 font-prompt outline-none"
                        >
                            <option value="all">🐾 ทั้งหมด</option>
                            <option value="สุนัข">🐶 สุนัข</option>
                            <option value="แมว">🐱 แมว</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1 pl-1">เพศ</label>
                        <select
                            value={filterGender}
                            onChange={(e) => setFilterGender(e.target.value)}
                            className="w-full bg-bgMain border border-gray-200 text-textMain text-sm rounded-xl p-3 font-prompt outline-none"
                        >
                            <option value="all">⚥ ทั้งหมด</option>
                            <option value="ตัวผู้">♂ ตัวผู้</option>
                            <option value="ตัวเมีย">♀ ตัวเมีย</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1 pl-1">ช่วงอายุ</label>
                        <select
                            value={filterAge}
                            onChange={(e) => setFilterAge(e.target.value)}
                            className="w-full bg-bgMain border border-gray-200 text-textMain text-sm rounded-xl p-3 font-prompt outline-none"
                        >
                            <option value="all">⏳ ทุกช่วงวัย</option>
                            <option value="เด็ก (0-1 ปี)">เด็ก (0-1 ปี)</option>
                            <option value="โตเต็มวัย (1-7 ปี)">โตเต็มวัย (1-7 ปี)</option>
                            <option value="สูงอายุ (7 ปีขึ้นไป)">สูงอายุ (7 ปีขึ้นไป)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1 pl-1">พื้นที่ / จังหวัด</label>
                        <select
                            value={filterProvince}
                            onChange={(e) => setFilterProvince(e.target.value)}
                            className="w-full bg-bgMain border border-gray-200 text-textMain text-sm rounded-xl p-3 font-prompt outline-none"
                        >
                            <option value="all">📍 ทุกพื้นที่ (ทั่วประเทศ)</option>
                            {THAI_PROVINCES.map((prov) => (
                                <option key={prov} value={prov}>
                                    {prov}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1 pl-1">สีหลัก</label>
                        <select
                            value={filterColor}
                            onChange={(e) => setFilterColor(e.target.value)}
                            className="w-full bg-bgMain border border-gray-200 text-textMain text-sm rounded-xl p-3 font-prompt outline-none"
                        >
                            <option value="all">🎨 ทุกสี</option>
                            <option value="ขาว">ขาว</option>
                            <option value="น้ำตาล / ส้ม">น้ำตาล / ส้ม</option>
                            <option value="สามสี / ลายสลิด">สามสี / ลายสลิด</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                    <button
                        onClick={handleResetFilter}
                        className="font-mali font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 px-6 py-2.5 rounded-xl transition duration-200 cursor-pointer"
                    >
                        <i className="fa-solid fa-rotate-left mr-2"></i> ล้างค่า
                    </button>
                </div>
            </div>

            {/* Grid Cards แสดงรายการสัตว์ */}
            {loading ? (
                <div className="text-center py-20 text-gray-400 font-mali text-lg">
                    <i className="fa-solid fa-spinner fa-spin text-3xl text-primary mb-3 block"></i>
                    กำลังโหลดข้อมูล...
                </div>
            ) : animals.length === 0 ? (
                <div className="text-center py-20 text-gray-400 font-mali text-lg bg-white rounded-2xl border border-gray-100">
                    <i className="fa-solid fa-box-open text-4xl mb-3 text-gray-300 block"></i>
                    ไม่มีข้อมูลสัตว์ในระบบ
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {animals.map((animal) => (
                        <div
                            key={animal.animal_id}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 border border-gray-100 flex flex-col h-full group"
                        >
                            {/* คลิกที่รูปเพื่อดูรายละเอียดเชิงลึก */}
                            <div
                                onClick={() => setViewingAnimal(animal)}
                                className="h-56 bg-bgAccent flex items-center justify-center text-primaryHover relative overflow-hidden cursor-pointer"
                            >
                                {animal.image_url ? (
                                    <img
                                        src={animal.image_url}
                                        alt={animal.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                    />
                                ) : (
                                    <i className={`fa-solid ${animal.species === "แมว" ? "fa-cat" : "fa-dog"} text-6xl`}></i>
                                )}

                                <span className="absolute top-3 left-3 bg-white/90 text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm flex items-center gap-1.5">
                                    <span
                                        className={`w-2.5 h-2.5 rounded-full ${animal.status === "รอคนดูแล" ? "bg-green-500 animate-pulse" : "bg-orange-400"
                                            }`}
                                    ></span>
                                    <span className={animal.status === "รอคนดูแล" ? "text-green-600" : "text-orange-500"}>
                                        {animal.status}
                                    </span>
                                </span>
                                <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center text-white font-mali font-semibold transition">
                                    ดูรายละเอียด
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-itim text-2xl text-textMain">{animal.name || "ไม่ระบุชื่อ"}</h3>
                                    <span
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${animal.gender === "ตัวเมีย" ? "bg-pink-50 text-pink-500" : "bg-blue-50 text-blue-500"
                                            }`}
                                    >
                                        <i className={`fa-solid ${animal.gender === "ตัวเมีย" ? "fa-venus" : "fa-mars"}`}></i>
                                    </span>
                                </div>

                                <div className="flex flex-col gap-2 text-sm text-gray-500 mb-6 flex-1">
                                    <p className="flex items-center gap-2">
                                        <i className="fa-solid fa-paw w-4 text-primary"></i> {animal.species}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <i className="fa-solid fa-location-dot w-4 text-primary"></i> {animal.shelters?.shelter_name || "ศูนย์พักพิง"}
                                    </p>
                                </div>

                                {/* ปุ่ม [แก้ไข] และ [ลบ] ประจำการ์ด */}
                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                    <button
                                        onClick={() => handleOpenEditModal(animal)}
                                        className="font-mali font-semibold border-2 border-primary text-primary hover:bg-bgAccent py-2 rounded-xl transition duration-300 flex justify-center items-center gap-2 text-sm cursor-pointer"
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i> แก้ไข
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAnimal(animal.animal_id, animal.name)}
                                        className="font-mali font-semibold border-2 border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400 py-2 rounded-xl transition duration-300 flex justify-center items-center gap-2 text-sm cursor-pointer"
                                    >
                                        <i className="fa-solid fa-trash-can"></i> ลบ
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ==================================================== */}
            {/* MODAL 1: เพิ่มข้อมูลสัตว์ใหม่ (CREATE) */}
            {/* ==================================================== */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-2xl p-6 md:p-8 relative shadow-2xl my-8">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-textMain text-xl"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>

                        <h2 className="font-mali font-semibold text-2xl text-textMain mb-6 flex items-center gap-2">
                            <i className="fa-solid fa-circle-plus text-primary"></i> เพิ่มข้อมูลสัตว์ตัวใหม่
                        </h2>

                        <form onSubmit={handleCreateAnimal} className="space-y-4 font-prompt text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-600 mb-1 font-semibold">ชื่อสัตว์ *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="เช่น น้องเต้าหู้"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-bgMain border border-gray-200 rounded-xl p-3 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-600 mb-1 font-semibold">ประเภทสัตว์</label>
                                    <select
                                        value={formData.species}
                                        onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                                        className="w-full bg-bgMain border border-gray-200 rounded-xl p-3 outline-none"
                                    >
                                        <option value="สุนัข">🐶 สุนัข</option>
                                        <option value="แมว">🐱 แมว</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-600 mb-1 font-semibold">เพศ</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full bg-bgMain border border-gray-200 rounded-xl p-3 outline-none"
                                    >
                                        <option value="ตัวผู้">♂ ตัวผู้</option>
                                        <option value="ตัวเมีย">♀ ตัวเมีย</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-600 mb-1 font-semibold">ช่วงอายุ</label>
                                    <select
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        className="w-full bg-bgMain border border-gray-200 rounded-xl p-3 outline-none"
                                    >
                                        <option value="เด็ก (0-1 ปี)">เด็ก (0-1 ปี)</option>
                                        <option value="โตเต็มวัย (1-7 ปี)">โตเต็มวัย (1-7 ปี)</option>
                                        <option value="สูงอายุ (7 ปีขึ้นไป)">สูงอายุ (7 ปีขึ้นไป)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-600 mb-1 font-semibold">สีหลัก</label>
                                    <select
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="w-full bg-bgMain border border-gray-200 rounded-xl p-3 outline-none"
                                    >
                                        <option value="ขาว">ขาว</option>
                                        <option value="ดำ">ดำ</option>
                                        <option value="น้ำตาล / ส้ม">น้ำตาล / ส้ม</option>
                                        <option value="สามสี / ลายสลิด">สามสี / ลายสลิด</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-600 mb-1 font-semibold">สังกัดศูนย์พักพิง</label>
                                    <select
                                        value={formData.shelter_id}
                                        onChange={(e) => setFormData({ ...formData, shelter_id: e.target.value })}
                                        className="w-full bg-bgMain border border-gray-200 rounded-xl p-3 outline-none"
                                    >
                                        {shelters.map((s) => (
                                            <option key={s.shelter_id} value={s.shelter_id}>
                                                {s.shelter_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-600 mb-1 font-semibold">URL ลิงก์รูปภาพ</label>
                                <input
                                    type="url"
                                    placeholder="https://images.unsplash.com/..."
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    className="w-full bg-bgMain border border-gray-200 rounded-xl p-3 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-600 mb-1 font-semibold">ประวัติวัคซีน</label>
                                <input
                                    type="text"
                                    placeholder="เช่น พิษสุนัขบ้า, รวม 5 โรค"
                                    value={formData.vaccine}
                                    onChange={(e) => setFormData({ ...formData, vaccine: e.target.value })}
                                    className="w-full bg-bgMain border border-gray-200 rounded-xl p-3 outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="neutered"
                                    checked={formData.is_neutered}
                                    onChange={(e) => setFormData({ ...formData, is_neutered: e.target.checked })}
                                    className="w-4 h-4 accent-primary"
                                />
                                <label htmlFor="neutered" className="text-gray-700 cursor-pointer">
                                    ทำหมันแล้ว
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white font-semibold shadow-md"
                                >
                                    บันทึกข้อมูล
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* MODAL 2: แก้ไขข้อมูลสัตว์ (UPDATE) */}
            {/* ==================================================== */}
            {editingAnimal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-2xl p-6 md:p-8 relative shadow-2xl my-8">
                        <button
                            onClick={() => setEditingAnimal(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-textMain text-xl"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>

                        <h2 className="font-mali font-semibold text-2xl text-textMain mb-6 flex items-center gap-2">
                            <i className="fa-solid fa-pen-to-square text-primary"></i> แก้ไขข้อมูลสัตว์ ({editingAnimal.name})
                        </h2>

                        <form onSubmit={handleUpdateAnimal} className="space-y-4 font-prompt text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-600 mb-1 font-semibold">ชื่อสัตว์ *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        className="w-full bg-bgMain border border-gray-200 rounded-xl p-3 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-600 mb-1 font-semibold">สถานะ</label>
                                    <select
                                        value={editFormData.status}
                                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                                        className="w-full bg-bgMain border border-gray-200 rounded-xl p-3 outline-none"
                                    >
                                        <option value="รอคนดูแล">รอคนดูแล</option>
                                        <option value="รอการอนุมัติ">รอการอนุมัติ</option>
                                        <option value="ได้บ้านแล้ว">ได้บ้านแล้ว</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-600 mb-1 font-semibold">ประเภทสัตว์</label>
                                    <select
                                        value={editFormData.species}
                                        onChange={(e) => setEditFormData({ ...editFormData, species: e.target.value })}
                                        className="w-full bg-bgMain border border-gray-200 rounded-xl p-3 outline-none"
                                    >
                                        <option value="สุนัข">🐶 สุนัข</option>
                                        <option value="แมว">🐱 แมว</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-600 mb-1 font-semibold">เพศ</label>
                                    <select
                                        value={editFormData.gender}
                                        onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                                        className="w-full bg-bgMain border border-gray-200 rounded-xl p-3 outline-none"
                                    >
                                        <option value="ตัวผู้">♂ ตัวผู้</option>
                                        <option value="ตัวเมีย">♀ ตัวเมีย</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-600 mb-1 font-semibold">ช่วงอายุ</label>
                                    <select
                                        value={editFormData.age}
                                        onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                                        className="w-full bg-bgMain border border-gray-200 rounded-xl p-3 outline-none"
                                    >
                                        <option value="เด็ก (0-1 ปี)">เด็ก (0-1 ปี)</option>
                                        <option value="โตเต็มวัย (1-7 ปี)">โตเต็มวัย (1-7 ปี)</option>
                                        <option value="สูงอายุ (7 ปีขึ้นไป)">สูงอายุ (7 ปีขึ้นไป)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-600 mb-1 font-semibold">สีหลัก</label>
                                    <select
                                        value={editFormData.color}
                                        onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                                        className="w-full bg-bgMain border border-gray-200 rounded-xl p-3 outline-none"
                                    >
                                        <option value="ขาว">ขาว</option>
                                        <option value="ดำ">ดำ</option>
                                        <option value="น้ำตาล / ส้ม">น้ำตาล / ส้ม</option>
                                        <option value="สามสี / ลายสลิด">สามสี / ลายสลิด</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-600 mb-1 font-semibold">สุขภาพ</label>
                                    <select
                                        value={editFormData.health_status}
                                        onChange={(e) => setEditFormData({ ...editFormData, health_status: e.target.value as any })}
                                        className="w-full bg-bgMain border border-gray-200 rounded-xl p-3 outline-none"
                                    >
                                        <option value="ปกติ">ปกติ</option>
                                        <option value="ป่วย">ป่วย</option>
                                        <option value="บาดเจ็บ">บาดเจ็บ</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-600 mb-1 font-semibold">สังกัดศูนย์พักพิง</label>
                                    <select
                                        value={editFormData.shelter_id}
                                        onChange={(e) => setEditFormData({ ...editFormData, shelter_id: e.target.value })}
                                        className="w-full bg-bgMain border border-gray-200 rounded-xl p-3 outline-none"
                                    >
                                        {shelters.map((s) => (
                                            <option key={s.shelter_id} value={s.shelter_id}>
                                                {s.shelter_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-600 mb-1 font-semibold">URL ลิงก์รูปภาพ</label>
                                <input
                                    type="url"
                                    value={editFormData.image_url}
                                    onChange={(e) => setEditFormData({ ...editFormData, image_url: e.target.value })}
                                    className="w-full bg-bgMain border border-gray-200 rounded-xl p-3 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-600 mb-1 font-semibold">ประวัติวัคซีน</label>
                                <input
                                    type="text"
                                    value={editFormData.vaccine}
                                    onChange={(e) => setEditFormData({ ...editFormData, vaccine: e.target.value })}
                                    className="w-full bg-bgMain border border-gray-200 rounded-xl p-3 outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="edit_neutered"
                                    checked={editFormData.is_neutered}
                                    onChange={(e) => setEditFormData({ ...editFormData, is_neutered: e.target.checked })}
                                    className="w-4 h-4 accent-primary"
                                />
                                <label htmlFor="edit_neutered" className="text-gray-700 cursor-pointer">
                                    ทำหมันแล้ว
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingAnimal(null)}
                                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 cursor-pointer"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-white font-semibold shadow-md cursor-pointer"
                                >
                                    อัปเดตข้อมูล
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* MODAL 3: รายละเอียดเชิงลึก (เมื่อคลิกที่รูปภาพการ์ด) */}
            {/* ==================================================== */}
            {viewingAnimal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row relative shadow-2xl">
                        <button
                            onClick={() => setViewingAnimal(null)}
                            className="absolute top-4 right-4 bg-white/80 text-gray-500 hover:text-primary w-10 h-10 rounded-full flex items-center justify-center shadow-sm z-20 cursor-pointer"
                        >
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>

                        <div className="lg:w-1/2 bg-bgMain p-6 flex flex-col justify-center items-center overflow-y-auto">
                            {viewingAnimal.image_url ? (
                                <img
                                    src={viewingAnimal.image_url}
                                    alt={viewingAnimal.name}
                                    className="w-full h-80 object-cover rounded-2xl shadow-inner"
                                />
                            ) : (
                                <i className={`fa-solid ${viewingAnimal.species === "แมว" ? "fa-cat" : "fa-dog"} text-9xl text-primaryHover`}></i>
                            )}
                        </div>

                        <div className="lg:w-1/2 p-8 flex flex-col overflow-y-auto border-l border-gray-100">
                            <h2 className="font-itim text-5xl text-textMain mb-4">{viewingAnimal.name}</h2>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                                <div>
                                    <p className="text-gray-400">ประเภท</p>
                                    <p className="font-semibold">{viewingAnimal.species}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">เพศ</p>
                                    <p className="font-semibold">{viewingAnimal.gender}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">ช่วงอายุ</p>
                                    <p className="font-semibold">{viewingAnimal.age}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">สถานะ</p>
                                    <p className="font-semibold">{viewingAnimal.status}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">สุขภาพ</p>
                                    <p className="font-semibold">{viewingAnimal.health_status}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">การทำหมัน</p>
                                    <p className="font-semibold">{viewingAnimal.is_neutered ? "ทำหมันแล้ว" : "ยังไม่ทำหมัน"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-400">ศูนย์ที่ดูแล</p>
                                    <p className="font-semibold">{viewingAnimal.shelters?.shelter_name || "ไม่ระบุ"}</p>
                                </div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-gray-100 flex gap-3">
                                <button
                                    onClick={() => {
                                        const target = viewingAnimal;
                                        setViewingAnimal(null);
                                        handleOpenEditModal(target);
                                    }}
                                    className="flex-1 font-mali font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl transition flex justify-center items-center gap-2 cursor-pointer"
                                >
                                    <i className="fa-solid fa-pen-to-square"></i> แก้ไขข้อมูล
                                </button>
                                <button
                                    onClick={() => handleDeleteAnimal(viewingAnimal.animal_id, viewingAnimal.name)}
                                    className="flex-1 font-mali font-semibold bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 py-3 rounded-xl transition flex justify-center items-center gap-2 cursor-pointer"
                                >
                                    <i className="fa-solid fa-trash-can"></i> ลบข้อมูล
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}