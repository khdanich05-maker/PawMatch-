// hooks/useCareTracking.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CareLog, AdoptedPetMatch, CareLogFormData } from "@/types/careLog";

export function useCareTracking() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [adoptedPets, setAdoptedPets] = useState<AdoptedPetMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<AdoptedPetMatch | null>(null);
  const [careLogs, setCareLogs] = useState<CareLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialForm: CareLogFormData = {
    activity_type: "อัปเดตอาการถ่ายรูปทุกเดือน",
    log_date: new Date().toISOString().split("T")[0],
    description: "",
    image_file: null,
    image_preview: null,
  };
  const [formData, setFormData] = useState<CareLogFormData>(initialForm);

  // Toast State
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // 1. ตรวจสอบสถานะการเข้าสู่ระบบ
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        setCurrentUser(data.user);
      } catch (err) {
        console.error("Auth check failed:", err);
        router.replace("/login");
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  // 2. ดึงรายการสัตว์ที่ User คนนี้รับเลี้ยงอยู่
  const fetchAdoptedPets = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          match_id,
          user_id,
          animal_id,
          start_date,
          end_date,
          match_status,
          animal:animals (
            animal_id,
            name,
            species,
            gender,
            age,
            color,
            is_neutered,
            health_status,
            image_url,
            status
          )
        `)
        .eq("user_id", userId)
        .in("match_status", ["กำลังดูแล", "สิ้นสุดการดูแล"])// จากเดิม: .in("match_status", ["กำลังดูแล", "สิ้นสุดการดูแล"])
        .eq("match_status", "อนุมัติ").order
        ("start_date", { ascending: false });

      if (error) {
        console.error("Error fetching adopted pets:", error.message || error);
        return;
      }

      if (data && data.length > 0) {
        const formatted = data
          .filter((item: any) => item.animal !== null)
          .map((item: any) => ({
            ...item,
            animal: Array.isArray(item.animal) ? item.animal[0] : item.animal,
          })) as AdoptedPetMatch[];

        setAdoptedPets(formatted);
        // เลือกสัตว์ตัวแรกเป็นค่าเริ่มต้น
        setSelectedMatch(formatted[0]);
      } else {
        setAdoptedPets([]);
        setSelectedMatch(null);
      }
    } catch (err) {
      console.error("Error loading adopted pets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. ดึงประวัติ Care Logs ของสัตว์ตัวที่เลือก
  const fetchCareLogs = useCallback(async (matchId: string) => {
    setLogsLoading(true);
    try {
      const { data, error } = await supabase
        .from("care_logs")
        .select("*")
        .eq("match_id", matchId)
        .order("log_date", { ascending: false });

      if (error) {
        console.error("Error fetching care logs:", error);
        return;
      }

      setCareLogs(data || []);
    } catch (err) {
      console.error("Error loading care logs:", err);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  // โหลดรายการสัตว์เมื่อ User พร้อม
  useEffect(() => {
    if (currentUser?.id || currentUser?.user_id) {
      const uid = currentUser.id || currentUser.user_id;
      fetchAdoptedPets(uid);
    }
  }, [currentUser, fetchAdoptedPets]);

  // โหลด Care Logs เมื่อเปลี่ยนการเลือกสัตว์
  useEffect(() => {
    if (selectedMatch?.match_id) {
      fetchCareLogs(selectedMatch.match_id);
    } else {
      setCareLogs([]);
    }
  }, [selectedMatch, fetchCareLogs]);

  // 4. จัดการการเลือกรูปภาพ
  const handleImageChange = (file: File | null) => {
    if (!file) {
      setFormData((prev) => ({ ...prev, image_file: null, image_preview: null }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("ขนาดไฟล์ภาพต้องไม่เกิน 5MB", "error");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      image_file: file,
      image_preview: previewUrl,
    }));
  };

  // 5. บันทึกผลการดูแล
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMatch) {
      showToast("กรุณาเลือกสัตว์ที่ต้องการอัปเดต", "error");
      return;
    }

    if (!formData.description.trim()) {
      showToast("กรุณากรอกรายละเอียดความเป็นอยู่ของน้อง", "error");
      return;
    }

    setSubmitting(true);
    try {
      let uploadedImageUrl: string | null = null;

      // อัปโหลดรูปภาพถ้ามี
      if (formData.image_file) {
        const file = formData.image_file;
        const fileExt = file.name.split(".").pop();
        const fileName = `care-logs/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("animal-images")
          .upload(fileName, file);

        if (uploadError) {
          console.warn("Upload failed, trying to save without image:", uploadError);
        } else {
          const { data: publicData } = supabase.storage
            .from("animal-images")
            .getPublicUrl(fileName);
          uploadedImageUrl = publicData?.publicUrl || null;
        }
      }

      // บันทึกลงตาราง care_logs
      const { error: insertError } = await supabase.from("care_logs").insert([
        {
          match_id: selectedMatch.match_id,
          activity_type: formData.activity_type,
          log_date: formData.log_date || new Date().toISOString(),
          description: formData.description.trim(),
          image_url: uploadedImageUrl,
        },
      ]);

      if (insertError) throw insertError;

      showToast("บันทึกผลการดูแลเรียบร้อยแล้ว! 🐾", "success");

      // รีเซ็ตฟอร์ม
      setFormData({
        ...initialForm,
        activity_type: formData.activity_type,
      });

      // ดึงประวัติการอัปเดตใหม่
      fetchCareLogs(selectedMatch.match_id);
    } catch (err: any) {
      console.error("Submit care log error:", err);
      showToast("เกิดข้อผิดพลาดในการบันทึก: " + (err.message || "กรุณาลองใหม่อีกครั้ง"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    currentUser,
    checkingAuth,
    loading,
    logsLoading,
    submitting,
    adoptedPets,
    selectedMatch,
    setSelectedMatch,
    careLogs,
    formData,
    setFormData,
    handleImageChange,
    handleSubmit,
    toast,
  };
}
