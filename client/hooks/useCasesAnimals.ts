import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Animal } from "@/types/animal";


export function useCasesAnimals() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ค่าตัวกรอง
  const [filterSpecies, setFilterSpecies] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [filterAge, setFilterAge] = useState("all");
  const [filterProvince, setFilterProvince] = useState("all");
  const [filterColor, setFilterColor] = useState("all");

  const [currentUser, setCurrentUser] = useState<any>(null);

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
        console.error("Supabase Error:", error.message);
        setAnimals([]);
      } else {
        let result = (data as Animal[]) || [];
        // คัดกรองตัวที่ได้บ้านแล้วออก
        result = result.filter((item) => item.status !== "ได้บ้านแล้ว");

        if (filterProvince !== "all") {
          result = result.filter((item) => item.shelters?.province === filterProvince);
        }

        setAnimals(result);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setAnimals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, [filterSpecies, filterGender, filterAge, filterProvince, filterColor]);

  const handleResetFilter = () => {
    setFilterSpecies("all");
    setFilterGender("all");
    setFilterAge("all");
    setFilterProvince("all");
    setFilterColor("all");
  };



  const handleConfirmAdopt = async (targetAnimal: any) => {
    if (!targetAnimal || !currentUser) return;

    const currentUserId = currentUser.id || currentUser.userId;

    try {
      // 1. เพิ่มคำขอลงตาราง matches
      const { error: matchError } = await supabase.from("matches").insert([
        {
          animal_id: targetAnimal.animal_id,
          user_id: currentUserId,
          status: "รอการอนุมัติ",
        },
      ]);

      if (matchError) throw matchError;

      // 2. อัปเดตสถานะสัตว์ในตาราง animals
      const { error: animalError } = await supabase
        .from("animals")
        .update({ status: "รอการอนุมัติ" })
        .eq("animal_id", targetAnimal.animal_id);

      if (animalError) throw animalError;

      // 3. ปรับปรุง state ฝั่ง Client ทันที
      setAnimals((prev) =>
        prev.map((a) =>
          a.animal_id === targetAnimal.animal_id
            ? { ...a, status: "รอการอนุมัติ" }
            : a
        )
      );

      alert(`ยื่นคำขอรับเลี้ยง "${targetAnimal.name}" เรียบร้อยแล้ว`);
    } catch (err: any) {
      console.error("Error adopting animal:", err);
      alert("เกิดข้อผิดพลาด: " + (err.message || err));
    }
  };

  useEffect(() => {
    // ดึง session จากระบบหลังบ้านให้ตรงกับ Navbar
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Error fetching auth:", err);
        setCurrentUser(null);
      }
    }

    fetchSession();
  }, []);


  return {
    animals,
    loading,
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
    handleResetFilter,
    currentUser,
  };
}