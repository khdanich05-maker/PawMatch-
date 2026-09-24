// app/(public)/change-password/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ToastState {
  type: "success" | "error" | "info";
  message: string;
}

export default function ChangePasswordPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    last4Digits: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      // กรองให้ช่อง last4Digits กรอกได้เฉพาะตัวเลขไม่เกิน 4 ตัว
      [name]: name === "last4Digits" ? value.replace(/\D/g, "").slice(0, 4) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.last4Digits.length !== 4) {
      showToast("error", "กรุณากรอกเลขท้ายเบอร์โทรศัพท์ให้ครบ 4 หลัก");
      return;
    }

    if (formData.password.length < 6) {
      showToast("error", "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast("error", "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.error || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
        setIsLoading(false);
        return;
      }

      showToast("success", "เปลี่ยนรหัสผ่านสำเร็จ! กำลังนำทางไปหน้าเข้าสู่ระบบ...");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      showToast("error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-center items-center p-6 bg-gradient-to-b from-[#FDF0EB]/30 via-[#FCFAF8] to-white relative min-h-[calc(100vh-80px)]">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none">
          <div
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg border-l-4 bg-white text-stone-800 font-prompt text-xs transition-all duration-300 ${
              toast.type === "success"
                ? "border-emerald-400"
                : toast.type === "error"
                ? "border-red-400"
                : "border-[#E29578]"
            }`}
          >
            <span className="text-base">
              {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "💡"}
            </span>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-sm border border-stone-200/80 p-8 md:p-10 relative overflow-hidden">
        {/* Paw Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-[#FDF0EB] rounded-2xl flex items-center justify-center text-3xl shadow-sm">
            🔑
          </div>
        </div>

        {/* Card Header */}
        <div className="text-center space-y-1 mb-8">
          <h1 className="text-2xl font-bold text-stone-800">รีเซ็ตรหัสผ่าน</h1>
          <p className="text-xs text-stone-500 font-prompt">
            ยืนยันตัวตนด้วยเลขท้ายเบอร์โทรศัพท์เพื่อตั้งรหัสผ่านใหม่
          </p>
        </div>

        {/* Change Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Email Field */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-prompt">
              ชื่อผู้ใช้ หรือ อีเมล
            </label>
            <input
              type="text"
              name="username"
              required
              placeholder="กรอกชื่อผู้ใช้หรืออีเมลที่ลงทะเบียนไว้"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-prompt focus:outline-none focus:border-[#E29578] focus:bg-white transition"
            />
          </div>

          {/* Last 4 Digits of Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-prompt">
              เลข 4 ตัวท้ายของเบอร์โทรศัพท์
            </label>
            <input
              type="text"
              name="last4Digits"
              required
              maxLength={4}
              placeholder="เช่น 5678"
              value={formData.last4Digits}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-prompt tracking-widest focus:outline-none focus:border-[#E29578] focus:bg-white transition"
            />
            <p className="text-[11px] text-stone-400 mt-1 font-prompt">
              * ใช้เลข 4 หลักสุดท้ายของเบอร์โทรศัพท์ที่เคยลงทะเบียน
            </p>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-prompt">
              รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-prompt focus:outline-none focus:border-[#E29578] focus:bg-white transition pr-14"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-stone-400 hover:text-stone-600 text-xs font-prompt px-1 select-none"
              >
                {showPassword ? "ซ่อน" : "แสดง"}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 font-prompt">
              ยืนยันรหัสผ่านใหม่อีกครั้ง
            </label>
            <div className="relative flex items-center">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                minLength={6}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-prompt focus:outline-none focus:border-[#E29578] focus:bg-white transition pr-14"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-stone-400 hover:text-stone-600 text-xs font-prompt px-1 select-none"
              >
                {showConfirmPassword ? "ซ่อน" : "แสดง"}
              </button>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#E29578] hover:bg-[#C07055] text-white py-3.5 rounded-2xl text-xs font-semibold shadow-sm mt-3 transition duration-200 disabled:opacity-50"
          >
            {isLoading ? "กำลังเปลี่ยนรหัสผ่าน..." : "ยืนยันการเปลี่ยนรหัสผ่าน"}
          </button>
        </form>

        {/* Footer Back to Login Link */}
        <div className="mt-8 pt-6 border-t border-stone-100 text-center font-prompt">
          <p className="text-xs text-stone-500">
            จำรหัสผ่านได้แล้ว?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#C07055] hover:underline inline-flex items-center gap-1 ml-1"
            >
              กลับสู่หน้าเข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}