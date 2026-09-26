"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAnimalImages } from "@/lib/animalImageHelper";
import { useAnimalsAdmin } from "@/hooks/useAnimalsAdmin";
import AnimalFilterBar from "@/components/admin/animals/AnimalFilterBar";
import AnimalFormModal from "@/components/admin/animals/AnimalFormModal";
import AnimalPreviewModal from "@/components/admin/animals/AnimalPreviewModal";
import ActionConfirmModal from "@/components/admin/animals/ActionConfirmModal";

export default function AdminAnimalsPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const {
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
    filterShelter,      // 👈 ดึงค่า Filter ศูนย์พักพิง
    setFilterShelter,   // 👈 ดึงฟังก์ชันอัปเดตศูนย์พักพิง
    handleResetFilter,  // 👈 ดึงฟังก์ชันล้างค่าตัวกรอง
    isFilterOpen,
    setIsFilterOpen,
    confirmModal,
    closeConfirmModal,
    toast,
    handleFileUpload,
    handleRemoveImage,
    handleVaccineToggle,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSaveAnimal,
    handleDeleteAnimal,
  } = useAnimalsAdmin();

  // 🛡️ ตรวจสอบสิทธิ์ Admin: สกัดกั้นผู้ใช้ role ทั่วไป
  useEffect(() => {
    async function verifyAdmin() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/login");
          return;
        }

        const data = await res.json();
        const role = data?.user?.role;

        // สกัดกั้นถ้าไม่ใช่ admin หรือ shelter
        if (role !== "admin" && role !== "shelter") {
          router.replace("/");
          return;
        }

        setCheckingAuth(false);
      } catch {
        router.replace("/");
      }
    }
    verifyAdmin();
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bgMain font-mali text-textMain">
        <i className="fa-solid fa-shield-cat text-4xl text-primary mb-3 animate-bounce"></i>
        <p className="text-base text-gray-500">กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-12 min-h-screen">    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center -mt-1 sm:-mt-2 mb-4 gap-3">  <div>
      <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-nowrap">
        <h1 className="font-mali font-semibold text-lg sm:text-4xl text-textMain whitespace-nowrap">
          จัดการทะเบียนสัตว์จรจัด 🐾
        </h1>
        <span className="bg-gray-800 text-white text-[10px] sm:text-xs px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full font-prompt font-semibold shrink-0">
          Admin Mode
        </span>
      </div>
      <p className="text-gray-500 text-sm">ระบบจัดการฐานข้อมูลสัตว์จรจัด (เพิ่ม / แก้ไข / ลบ ข้อมูลสัตว์)</p>
    </div>

      <button
        onClick={handleOpenCreateModal}
        className="font-mali font-semibold bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-2xl transition duration-300 shadow-md flex items-center gap-2"
      >
        <i className="fa-solid fa-circle-plus text-lg"></i> เพิ่มข้อมูลสัตว์ใหม่
      </button>
    </div>

      {/* กล่องตัวกรอง (ส่ง Props ตัวกรองศูนย์พักพิงเพิ่ม) */}
      <AnimalFilterBar
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        filterSpecies={filterSpecies}
        setFilterSpecies={setFilterSpecies}
        filterGender={filterGender}
        setFilterGender={setFilterGender}
        filterAge={filterAge}
        setFilterAge={setFilterAge}
        filterColor={filterColor}
        setFilterColor={setFilterColor}
        filterProvince={filterProvince}
        setFilterProvince={setFilterProvince}
        shelters={shelters}
        filterShelter={filterShelter}
        setFilterShelter={setFilterShelter}
        onResetFilter={handleResetFilter}
      />

      {/* รายการ Card แสดงผล */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 font-mali">
          <i className="fa-solid fa-spinner fa-spin text-3xl text-primary mb-3 block"></i> กำลังโหลดข้อมูล...
        </div>
      ) : animals.length === 0 ? (
        <div className="text-center py-20 text-gray-400 font-mali bg-white rounded-2xl border border-gray-100">
          ไม่พบข้อมูลสัตว์ที่ตรงกับเงื่อนไข
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {animals.map((animal) => (
            <div
              key={animal.animal_id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col h-full group"
            >
              <div
                onClick={() => {
                  setViewingAnimal(animal);
                  setCurrentImageIndex(0);
                }}
                className="relative w-full aspect-[4/3] bg-bgAccent flex items-center justify-center overflow-hidden cursor-pointer"
              >
                <img
                  src={getAnimalImages(animal.image_url)[0]}
                  alt={animal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/90 text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm flex items-center gap-1.5 z-10">
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

              <div className="p-3 sm:p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-itim text-lg sm:text-2xl text-textMain truncate pr-1">{animal.name}</h3>
                  <span
                    className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm ${animal.gender === "ตัวเมีย" ? "bg-pink-50 text-pink-500" : "bg-blue-50 text-blue-500"
                      }`}
                  >
                    <i className={`fa-solid ${animal.gender === "ตัวเมีย" ? "fa-venus" : "fa-mars"}`}></i>
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-4 space-y-1">
                  <p className="truncate"><i className="fa-solid fa-paw text-primary mr-1.5 shrink-0"></i> {animal.species}</p>
                  <p className="truncate"><i className="fa-solid fa-location-dot text-primary mr-1.5 shrink-0"></i> {animal.shelters?.shelter_name || "ไม่ระบุศูนย์"}</p>
                </div>

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

      {/* Modal เพิ่ม / แก้ไข */}
      <AnimalFormModal
        isOpen={isFormModalOpen}
        isEditing={isEditing}
        formData={formData}
        setFormData={setFormData}
        shelters={shelters}
        uploading={uploading}
        onFileUpload={handleFileUpload}
        onRemoveImage={handleRemoveImage}
        onVaccineToggle={handleVaccineToggle}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSaveAnimal}
      />

      {/* Modal พรีวิวรายละเอียด */}
      <AnimalPreviewModal
        viewingAnimal={viewingAnimal}
        currentImageIndex={currentImageIndex}
        setCurrentImageIndex={setCurrentImageIndex}
        onClose={() => setViewingAnimal(null)}
        onEdit={(animal) => handleOpenEditModal(animal)}
        onDelete={handleDeleteAnimal}
      />

      {/* Modal ยืนยันการแก้ไข/ลบข้อมูล */}
      <ActionConfirmModal
        isOpen={confirmModal?.isOpen || false}
        type={confirmModal?.type || "update"}
        title={confirmModal?.title || ""}
        animalName={confirmModal?.animalName || ""}
        message={confirmModal?.message || ""}
        onConfirm={confirmModal?.onConfirm || (() => { })}
        onCancel={closeConfirmModal}
      />

      {/* 🌟 Toast Success แสดงมุมล่างขวาพร้อมแอนิเมชัน */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[130] flex items-center gap-3 bg-white border border-emerald-100 shadow-xl px-5 py-3.5 rounded-2xl text-xs font-mali font-semibold text-textMain animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-check text-xs"></i>
          </div>
          <span>{toast.message}</span>
        </div>
      )}
    </main>
  );
}