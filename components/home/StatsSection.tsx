"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function StatsSection() {
  const [stats, setStats] = useState({
    totalAnimals: 0,
    volunteers: 0,
    shelters: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [animalsRes, usersRes, sheltersRes] = await Promise.all([
          supabase.from("animals").select("*", { count: "exact", head: true }),
          supabase.from("users").select("*", { count: "exact", head: true }),
          supabase.from("shelters").select("*", { count: "exact", head: true }),
        ]);

        setStats({
          totalAnimals: animalsRes.count || 0,
          volunteers: usersRes.count || 0,
          shelters: sheltersRes.count || 0,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <section className="w-full max-w-[1440px] mx-auto px-2 sm:px-4 mb-6 sm:mb-8 mt-2 sm:mt-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 py-6 px-3 sm:p-8 grid grid-cols-3 divide-x divide-gray-100 items-center">
        <div className="text-center px-1 sm:px-4">
          <div className="font-mali font-semibold text-2xl sm:text-4xl text-primary mb-1 min-h-[32px] sm:min-h-[44px] flex items-center justify-center">
            {loadingStats ? (
              <i className="fa-solid fa-spinner fa-spin text-lg sm:text-2xl text-primary/60"></i>
            ) : (
              stats.totalAnimals.toLocaleString()
            )}
          </div>
          <div className="text-[11px] sm:text-sm text-gray-600 font-prompt leading-tight">
            สัตว์ที่ได้รับการช่วยเหลือ
          </div>
        </div>

        <div className="text-center px-1 sm:px-4">
          <div className="font-mali font-semibold text-2xl sm:text-4xl text-primary mb-1 min-h-[32px] sm:min-h-[44px] flex items-center justify-center">
            {loadingStats ? (
              <i className="fa-solid fa-spinner fa-spin text-lg sm:text-2xl text-primary/60"></i>
            ) : (
              stats.volunteers.toLocaleString()
            )}
          </div>
          <div className="text-[11px] sm:text-sm text-gray-600 font-prompt leading-tight">
            อาสาสมัครในระบบ
          </div>
        </div>

        <div className="text-center px-1 sm:px-4">
          <div className="font-mali font-semibold text-2xl sm:text-4xl text-primary mb-1 min-h-[32px] sm:min-h-[44px] flex items-center justify-center">
            {loadingStats ? (
              <i className="fa-solid fa-spinner fa-spin text-lg sm:text-2xl text-primary/60"></i>
            ) : (
              stats.shelters.toLocaleString()
            )}
          </div>
          <div className="text-[11px] sm:text-sm text-gray-600 font-prompt leading-tight">
            จำนวนศูนย์พักพิง
          </div>
        </div>
      </div>
    </section>
  );
}