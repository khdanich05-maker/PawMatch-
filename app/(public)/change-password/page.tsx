// app/(public)/change-password/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusToast, { ToastType } from "@/components/ui/StatusToast";

interface ToastState {
    type: ToastType;
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

  const showToast = (type: ToastType, message: string) => {
        setToast({ type, message });
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
    <main
            className="
                relative flex min-h-[calc(100vh-80px)]
                flex-1 flex-col items-center justify-center
                bg-gradient-to-b from-bgAccent/30 via-bgMain to-white
                px-5 py-10 sm:px-6
            "
        >
            {/* Status Toast */}
            {toast && (
                <StatusToast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Main Card */}
            <div
                className="
                    relative w-full max-w-md overflow-hidden
                    rounded-[2rem] border border-stone-200/70
                    bg-white p-6 shadow-sm
                    sm:rounded-[2.5rem] sm:p-8
                    md:p-10
                "
            >
                {/* Decorative Accent */}
                <div
                    className="
                        pointer-events-none absolute -right-16 -top-16
                        h-32 w-32 rounded-full
                        bg-bgAccent/70
                    "
                />

                {/* Key Icon */}
                <div className="relative mb-5 flex justify-center">
                    <div
                        className="
                            flex h-14 w-14 items-center justify-center
                            rounded-2xl bg-bgAccent
                            text-2xl shadow-sm
                            ring-1 ring-primary/10
                        "
                        aria-hidden="true"
                    >
                        🔑
                    </div>
                </div>

                {/* Card Header */}
                <div className="relative mb-8 space-y-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-textMain">
                        รีเซ็ตรหัสผ่าน
                    </h1>

                    <p className="mx-auto max-w-sm text-xs leading-5 text-textMain/60">
                        ยืนยันตัวตนด้วยเลขท้ายเบอร์โทรศัพท์
                        <br className="sm:hidden" />
                        เพื่อกำหนดรหัสผ่านใหม่
                    </p>
                </div>

                {/* Change Password Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username / Email */}
                    <div>
                        <label
                            htmlFor="username"
                            className="
                                mb-1.5 block text-xs font-semibold
                                text-textMain
                            "
                        >
                            ชื่อผู้ใช้ หรือ อีเมล
                        </label>

                        <input
                            id="username"
                            type="text"
                            name="username"
                            required
                            placeholder="กรอกชื่อผู้ใช้หรืออีเมลที่ลงทะเบียนไว้"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={isLoading}
                            autoComplete="username"
                            className="
                                w-full rounded-xl border border-stone-200
                                bg-bgMain px-4 py-3
                                text-sm text-textMain
                                placeholder:text-textMain/35
                                transition-all duration-200
                                hover:border-stone-300
                                focus:border-primary
                                focus:bg-white
                                focus:outline-none
                                focus:ring-4 focus:ring-primary/10
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        />
                    </div>

                    {/* Last 4 Digits */}
                    <div>
                        <label
                            htmlFor="last4Digits"
                            className="
                                mb-1.5 block text-xs font-semibold
                                text-textMain
                            "
                        >
                            เลข 4 ตัวท้ายของเบอร์โทรศัพท์
                        </label>

                        <input
                            id="last4Digits"
                            type="text"
                            name="last4Digits"
                            required
                            maxLength={4}
                            inputMode="numeric"
                            autoComplete="tel"
                            placeholder="เช่น 5678"
                            value={formData.last4Digits}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="
                                w-full rounded-xl border border-stone-200
                                bg-bgMain px-4 py-3
                                text-sm tracking-[0.3em] text-textMain
                                placeholder:tracking-normal
                                placeholder:text-textMain/35
                                transition-all duration-200
                                hover:border-stone-300
                                focus:border-primary
                                focus:bg-white
                                focus:outline-none
                                focus:ring-4 focus:ring-primary/10
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        />

                        <p className="mt-1.5 text-[11px] leading-4 text-textMain/45">
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