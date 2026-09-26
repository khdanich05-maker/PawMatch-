// components/care-tracking/ThaiDatePicker.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatThaiDateBE } from "@/lib/dateHelper";

interface Props {
  value: string; // ISO date string: YYYY-MM-DD
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

const THAI_MONTHS_FULL = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const THAI_DAYS_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

export default function ThaiDatePicker({
  value,
  onChange,
  disabled = false,
  required = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // คำนวณวันที่เริ่มต้น
  const parseDate = (val: string) => {
    if (!val) {
      const now = new Date();
      return {
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
      };
    }
    const [y, m, d] = val.split("-").map(Number);
    if (!y || !m || !d) {
      const now = new Date();
      return {
        year: now.getFullYear(),
        month: now.getMonth(),
        day: now.getDate(),
      };
    }
    return { year: y, month: m - 1, day: d };
  };

  const selected = parseDate(value);

  // สถานะเดือน/ปี ที่กำลังเปิดดูในปฏิทิน
  const [viewYear, setViewYear] = useState<number>(selected.year);
  const [viewMonth, setViewMonth] = useState<number>(selected.month);

  // ซิงค์เดือน/ปีเมื่อ value เปลี่ยน
  useEffect(() => {
    const parsed = parseDate(value);
    setViewYear(parsed.year);
    setViewMonth(parsed.month);
  }, [value]);

  // ปิดปฏิทินเมื่อคลิกด้านนอก
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // เปลี่ยนเดือนก่อนหน้า / ถัดไป
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // เลือกวัน
  const handleSelectDay = (day: number) => {
    const yStr = String(viewYear);
    const mStr = String(viewMonth + 1).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    onChange(`${yStr}-${mStr}-${dStr}`);
    setIsOpen(false);
  };

  // เลือกวันนี้
  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const yStr = String(today.getFullYear());
    const mStr = String(today.getMonth() + 1).padStart(2, "0");
    const dStr = String(today.getDate()).padStart(2, "0");
    onChange(`${yStr}-${mStr}-${dStr}`);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  // คำนวณวันในเดือน
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun, 1 = Mon ...
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  // สร้างอาร์เรย์วัน
  const days = [];
  // วันของเดือนก่อนหน้า (สีจาง)
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, isCurrentMonth: false });
  }
  // วันของเดือนปัจจุบัน
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }
  // วันของเดือนถัดไปเพื่อให้เต็มตาราง 35 หรือ 42 ช่อง
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, isCurrentMonth: false });
  }

  // รูปแบบวันที่แสดงในกล่อง Input (เช่น 25/09/2569)
  const displayFormatted = () => {
    if (!value) return "เลือกวันที่ (พ.ศ.)";
    const [y, m, d] = value.split("-");
    if (!y || !m || !d) return "เลือกวันที่ (พ.ศ.)";
    const thaiYear = Number(y) + 543;
    return `${d}/${m}/${thaiYear}`;
  };

  // รายการปี พ.ศ. สำหรับ Dropdown (ย้อนหลัง 5 ปี - ล่วงหน้า 5 ปี)
  const currentCEYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentCEYear - 5; y <= currentCEYear + 5; y++) {
    yearOptions.push(y);
  }

  const today = new Date();
  const isTodayDate = (d: number) =>
    today.getDate() === d &&
    today.getMonth() === viewMonth &&
    today.getFullYear() === viewYear;

  const isSelectedDate = (d: number) =>
    selected.day === d &&
    selected.month === viewMonth &&
    selected.year === viewYear &&
    Boolean(value);

  return (
    <div ref={containerRef} className="relative w-full font-prompt select-none">
      {/* กล่องแสดงวันที่และปุ่มกดเปิดปฏิทิน */}
      <div
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className={`w-full min-h-[48px] h-12 text-sm sm:text-base px-4 py-2.5 rounded-2xl border transition flex items-center justify-between shadow-2xs ${
          disabled
            ? "bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed"
            : isOpen
            ? "bg-white border-[#E29578] ring-2 ring-[#E29578]/20 cursor-pointer"
            : "bg-stone-50 hover:bg-stone-100/70 border-stone-200 text-stone-800 cursor-pointer"
        }`}
      >
        <span
          className={`font-medium ${
            value ? "text-stone-800" : "text-stone-400"
          }`}
        >
          {displayFormatted()}
        </span>
        <div className="flex items-center gap-2 text-[#E29578]">
          <i className="fa-regular fa-calendar-days text-base"></i>
        </div>
      </div>

      {/* Hidden input สำหรับ form validation */}
      <input
        type="hidden"
        name="log_date"
        value={value}
        required={required}
      />

      {/* ปฏิทินแสดงผลแบบ พ.ศ. (Thai Buddhist Calendar Popup) */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto right-0 sm:right-auto top-full mt-2 z-50 w-full sm:w-[320px] bg-white rounded-3xl p-4 shadow-xl border border-stone-200/90 animate-fadeIn">
          {/* แถบด้านบน: เลือกเดือนและปี พ.ศ. */}
          <div className="flex items-center justify-between gap-1 pb-3 border-b border-stone-100">
            {/* ปุ่มเดือนก่อนหน้า */}
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-600 flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="เดือนก่อนหน้า"
            >
              <i className="fa-solid fa-chevron-left text-xs"></i>
            </button>

            {/* Dropdown เดือน & ปี พ.ศ. */}
            <div className="flex items-center gap-1.5 font-mali font-semibold text-stone-800 text-sm">
              {/* เลือกเดือน */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 font-prompt text-xs sm:text-sm px-2 py-1 rounded-lg focus:outline-none focus:border-[#E29578] cursor-pointer"
              >
                {THAI_MONTHS_FULL.map((mName, idx) => (
                  <option key={idx} value={idx}>
                    {mName}
                  </option>
                ))}
              </select>

              {/* เลือกปี พ.ศ. */}
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 font-prompt text-xs sm:text-sm px-2 py-1 rounded-lg focus:outline-none focus:border-[#E29578] cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    พ.ศ. {y + 543}
                  </option>
                ))}
              </select>
            </div>

            {/* ปุ่มเดือนถัดไป */}
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-600 flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="เดือนถัดไป"
            >
              <i className="fa-solid fa-chevron-right text-xs"></i>
            </button>
          </div>

          {/* หัวตารางวันในสัปดาห์ (อา. - ส.) */}
          <div className="grid grid-cols-7 gap-1 text-center py-2 text-[11px] font-semibold text-stone-400">
            {THAI_DAYS_SHORT.map((dName, idx) => (
              <div
                key={idx}
                className={idx === 0 ? "text-red-400" : "text-stone-500"}
              >
                {dName}
              </div>
            ))}
          </div>

          {/* ตารางวันที่ในเดือน */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((item, idx) => {
              if (!item.isCurrentMonth) {
                return (
                  <div
                    key={idx}
                    className="h-9 w-9 mx-auto flex items-center justify-center text-xs text-stone-300 pointer-events-none"
                  >
                    {item.day}
                  </div>
                );
              }

              const selected = isSelectedDate(item.day);
              const todayMark = isTodayDate(item.day);

              return (
                <button
                  type="button"
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectDay(item.day);
                  }}
                  className={`h-9 w-9 mx-auto rounded-xl text-xs font-medium flex items-center justify-center transition active:scale-90 cursor-pointer ${
                    selected
                      ? "bg-[#E29578] text-white font-bold shadow-xs"
                      : todayMark
                      ? "bg-[#FDF0EB] text-[#C07055] font-bold border border-[#E29578]"
                      : "hover:bg-stone-100 text-stone-700"
                  }`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>

          {/* แถบด้านล่าง: ปุ่มลัด "วันนี้" และ "ปิด" */}
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-[#C07055] hover:text-[#A8583E] font-medium flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-[#FDF0EB]/60 transition cursor-pointer"
            >
              <i className="fa-solid fa-clock-rotate-left text-[11px]"></i>
              <span>วันนี้ ({new Date().getFullYear() + 543})</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-stone-400 hover:text-stone-600 font-medium py-1 px-2.5 rounded-lg hover:bg-stone-100 transition cursor-pointer"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
