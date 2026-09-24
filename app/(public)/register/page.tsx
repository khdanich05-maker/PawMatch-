// app/(public)/register/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
            setErrorMessage("กรุณายอมรับข้อกำหนดการใช้งานก่อนลงทะเบียน");
            return;
        }

        const cleanPhone = formData.phone.replace(/[^0-9]/g, "");
        if (cleanPhone && (cleanPhone.length < 9 || cleanPhone.length > 10)) {
            setErrorMessage("กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง (9-10 หลัก)");
            return;
        }

        if (formData.password.length < 6) {
            setErrorMessage("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
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
                setErrorMessage(data.error || "เกิดข้อผิดพลาดในการลงทะเบียน");
                setIsLoading(false);
                return;
            }

            setSuccessMessage("สร้างบัญชีสำเร็จ! กำลังพาท่านไปหน้าเข้าสู่ระบบ...");
            setTimeout(() => {
                router.push("/login?registered=true");
            }, 1500);
        } catch {
            setErrorMessage("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-6 py-12">
            {errorMessage && (
                <div className="fixed right-5 top-5 z-[100] flex items-center gap-3 rounded-2xl border-l-4 border-red-400 bg-white px-5 py-3.5 text-xs text-textMain shadow-lg">
                    <span className="text-base">❌</span>
                    <span className="font-medium">{errorMessage}</span>
                </div>
            )}

            {successMessage && (
                <div className="fixed right-5 top-5 z-[100] flex items-center gap-3 rounded-2xl border-l-4 border-emerald-400 bg-white px-5 py-3.5 text-xs text-textMain shadow-lg">
                    <span className="text-base">✅</span>
                    <span className="font-medium">{successMessage}</span>
                </div>
            )}

            <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm">
                <div className="grid md:grid-cols-[1.05fr_1.35fr]">
                    <div className="hidden md:flex flex-col justify-between bg-bgAccent p-10">
                        <div>
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                                🐾
                            </div>
                            <p className="mb-2 font-mali text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                                Join us
                            </p>
                            <h1 className="font-mali text-4xl leading-tight text-textMain">
                                สร้างบัญชี<br />เพื่อช่วยสัตว์จร
                            </h1>
                        </div>

                        <div className="space-y-4 text-sm text-gray-600">
                            <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 shadow-sm">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bgAccent text-primary">❤</span>
                                <span>เชื่อมต่อกับโอกาสช่วยเหลือสัตว์ที่ต้องการความรัก</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 shadow-sm">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bgAccent text-primary">✦</span>
                                <span>ร่วมเป็นส่วนหนึ่งของชุมชนดูแลสัตว์</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="mb-8 text-center">
                            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-bgAccent text-3xl shadow-sm">
                                🐶
                            </div>
                            <h2 className="font-mali text-3xl text-textMain">สมัครสมาชิก</h2>
                            <p className="mt-2 text-sm text-gray-500">
                                เริ่มต้นด้วยการสร้างบัญชีเพื่อเข้าร่วมเป็นอาสาสมัคร
                            </p>
                        </div>

                        <div className="mb-6 flex rounded-2xl bg-gray-100 p-1 text-xs font-semibold">
                            <Link
                                href="/login"
                                className="flex-1 rounded-xl py-2.5 text-center text-gray-500 transition hover:text-textMain"
                            >
                                เข้าสู่ระบบ
                            </Link>
                            <button
                                type="button"
                                className="flex-1 rounded-xl bg-white py-2.5 text-primary shadow-sm"
                            >
                                สมัครสมาชิก
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-textMain">
                                    ชื่อผู้ใช้หรือนามแฝง
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    placeholder="เช่น somchai_jai"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-gray-200 bg-stone-50 px-4 py-3 text-sm text-textMain placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-textMain">
                                    อีเมลของคุณ
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="example@mail.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-gray-200 bg-stone-50 px-4 py-3 text-sm text-textMain placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-textMain">
                                    เบอร์โทรศัพท์
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    maxLength={12}
                                    placeholder="เช่น 081-234-5678"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-gray-200 bg-stone-50 px-4 py-3 text-sm text-textMain placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-textMain">
                                    รหัสผ่าน
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
                                <label htmlFor="terms" className="cursor-pointer text-[11px] leading-tight text-gray-500">
                                    ฉันยอมรับ <span className="text-primary underline">ข้อกำหนดการใช้งาน</span> และนโยบายดูแลสวัสดิภาพสัตว์
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