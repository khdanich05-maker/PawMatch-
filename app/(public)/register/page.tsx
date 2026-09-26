// app/(public)/register/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusToast, { ToastType } from "@/components/ui/StatusToast";


interface ToastState {
    type: ToastType;
    message: string;
}

export default function RegisterPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const showToast = (type: ToastType, message: string) => {
        setErrorMessage("");
        setSuccessMessage("");

        if (type === "success") {
            setSuccessMessage(message);
        } else {
            setErrorMessage(message);
        }
    };


    // ฟอร์แมตเบอร์โทรศัพท์อัตโนมัติ (เช่น 081-234-5678)
    const formatPhoneNumber = (value: string) => {
        const clean = value.replace(/\D/g, "");
        if (clean.length <= 3) return clean;
        if (clean.length <= 6) return `${clean.slice(0, 3)}-${clean.slice(3)}`;
        return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6, 10)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "phone" ? formatPhoneNumber(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!acceptedTerms) {
            showToast("error", "กรุณายอมรับข้อกำหนดการใช้งานก่อนลงทะเบียน");
            return;
        }

        const cleanPhone = formData.phone.replace(/[^0-9]/g, "");
        if (cleanPhone && (cleanPhone.length < 9 || cleanPhone.length > 10)) {
            showToast("error", "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (9-10 หลัก)");
            return;
        }

        if (formData.password.length < 6) {
            showToast("error", "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            showToast("error", "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    phone: cleanPhone,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                showToast("error", data.message || "เกิดข้อผิดพลาดในการสร้างบัญชี");
                return;
            }

            showToast("success", "สร้างบัญชีสำเร็จ! กำลังพาท่านไปหน้าเข้าสู่ระบบ...");
            setTimeout(() => {
                router.push("/login?registered=true");
            }, 1500);
        } catch {
            showToast("error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
            setIsLoading(false);
        }
    };

    const toast =
        errorMessage
            ? { type: "error" as const, message: errorMessage } : successMessage
                ? { type: "success" as const, message: successMessage } : null;

    return (
        <main
            className="flex min-h-[calc(100vh-120px)]items-center justify-center bg-gradient-to-b from-bgAccent/30 via-bgMain to-white px-5 py-10 sm:px-6"
>
            {/* Status Toast */}
            {toast && (
                <StatusToast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => {
                        setErrorMessage("");
                        setSuccessMessage("");
                    }}
                />
            )}

            {/* Main Card */}
            <div
                className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-stone-200/70 bg-white shadow-sm md:rounded-[2.5rem]">
                <div className="grid md:grid-cols-[1.05fr_1.35fr]">
                    {/* Left Panel */}
                    <div
                        className="hidden flex-col justify-between bg-bgAccent p-10 md:flex">
                        <div>
                            <div
                                className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">🐾
                            </div>

                            <p
                                className="mb-2 font-mali text-sm font-semibold uppercase tracking-[0.2em] text-primary">Join us
                            </p>

                            <h1
                                className="font-mali text-4xl leading-tight text-textMain"> สร้างบัญชี <br />เพื่อช่วยสัตว์จร
                            </h1>
                        </div>

                        <div className="space-y-4 text-sm text-textMain/70">
                            <div
                                className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 shadow-sm">
                                <span
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bgAccent text-primary"> ♥
                                </span>

                                <span>
                                    เชื่อมต่อกับโอกาสช่วยเหลือสัตว์ที่ต้องการความรัก
                                </span>
                            </div>

                            <div
                                className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 shadow-sm">
                                <span
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bgAccent text-primary"> ✦
                                </span>

                                <span>
                                    ร่วมเป็นส่วนหนึ่งของชุมชนดูแลสัตว์
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right / Form Panel */}
                    <div className="p-6 sm:p-8 md:p-12">
                        {/* Header */}
                        <div className="mb-8 text-center">
                            <div
                                className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-bgAccent text-3xl shadow-sm ring-1 ring-primary/10 "aria-hidden="true"> 🐶
                            </div>

                            <h2
                                className="font-mali text-3xl text-textMain"> สมัครสมาชิก
                            </h2>

                            <p className="mt-2 text-sm leading-5 text-textMain/60"> เริ่มต้นด้วยการสร้างบัญชีเพื่อเข้าร่วมเป็นอาสาสมัคร
                            </p>
                        </div>

                        {/* Login / Register Tabs */}
                        <div
                            className="mb-6 flex rounded-2xl bg-bgMain p-1 text-xs font-semibold"
                        >
                            <Link
                                href="/login"
                                className="flex-1 rounded-xl py-2.5 text-center text-textMain/50 transition-all duration-200 hover:bg-white/60 hover:text-textMain"> เข้าสู่ระบบ
                            </Link>

                            <button
                                type="button"
                                className="flex-1 rounded-xl bg-white py-2.5 text-primary shadow-sm"> สมัครสมาชิก
                            </button>
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Username */}
                            <div>
                                <label
                                    htmlFor="username"
                                    className="mb-1.5 block text-xs font-semibold text-textMain"> ชื่อผู้ใช้หรือนามแฝง
                                </label>

                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    required
                                    placeholder="เช่น somchai_jai"
                                    value={formData.username}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    autoComplete="username"
                                    className="w-full rounded-xl border border-stone-200 bg-bgMain px-4 py-3 text-sm text-textMain placeholder:text-textMain/35 transition-all duration-200 hover:border-stone-300 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"/>
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-1.5 block text-xs font-semibold text-textMain"> อีเมลของคุณ
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="example@mail.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    autoComplete="email"
                                    className="w-full rounded-xl border border-stone-200 bg-bgMain px-4 py-3 text-sm text-textMain placeholder:text-textMain/35 transition-all duration-200 hover:border-stone-300 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"/>
                            </div>

                            {/* Phone */}
                            <div>
                                <label
                                    htmlFor="phone"
                                    className="mb-1.5 block text-xs font-semibold text-textMain"> เบอร์โทรศัพท์
                                </label>

                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    maxLength={12}
                                    inputMode="numeric"
                                    placeholder="เช่น 081-234-5678"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    autoComplete="tel"
                                    className="w-full rounded-xl border border-stone-200 bg-bgMain px-4 py-3 text-sm text-textMain placeholder:text-textMain/35 transition-all duration-200 hover:border-stone-300 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60" />

                                <p className="mt-1.5 text-[11px] text-textMain/45"> สามารถกรอกเบอร์โทรศัพท์พร้อมขีดได้
                                </p>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-textMain"> รหัสผ่าน
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-gray-200 bg-stone-50 px-4 py-3 pr-12 text-sm text-textMain placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-500 hover:text-textMain"
                                    >
                                        {showPassword ? "ซ่อน" : "แสดง"}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-textMain">
                                    ยืนยันรหัสผ่าน
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        required
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-gray-200 bg-stone-50 px-4 py-3 pr-12 text-sm text-textMain placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-500 hover:text-textMain"
                                    >
                                        {showConfirmPassword ? "ซ่อน" : "แสดง"}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={acceptedTerms}
                                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary accent-primary"
                                />
                                <label htmlFor="terms" className="cursor-pointer text-[11px] leading-tight text-gray-500"> ฉันยอมรับ 
                                    <span className="text-primary underline">ข้อกำหนดการใช้งาน
                                        </span> และนโยบายดูแลสวัสดิภาพสัตว์
                                </label>
                            </div>  

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-2 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-primaryHover disabled:opacity-50"
                            >
                                {isLoading ? "กำลังสร้างบัญชีผู้ใช้งาน..." : "สร้างบัญชีสมาชิกใหม่"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}