// app/(public)/login/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface ToastState {
    type: "success" | "error" | "info";
    message: string;
}

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<ToastState | null>(null);

    const showToast = (type: "success" | "error" | "info", message: string) => {
        setToast({ type, message });
        window.setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        if (searchParams.get("registered") === "true") {
            const timeoutId = window.setTimeout(() => {
                showToast("success", "สร้างบัญชีผู้ใช้งานสำเร็จแล้ว กรุณาเข้าสู่ระบบ");
            }, 0);

            return () => window.clearTimeout(timeoutId);
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.username,
                    password: formData.password,
                    rememberMe,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                showToast("error", data.error || data.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
                setIsLoading(false);
                return;
            }

            showToast("success", "ยินดีต้อนรับเข้าสู่ระบบ GoHome!");

            // window.setTimeout(() => {
            //     if (data.user?.role === "admin" || data.user?.role === "shelter") {
            //         router.push("/admin/dashboard");
            //     } else {
            //         router.push(data.redirectTo || "/dashboard");
            //     }
            //     router.refresh();
            // }, 800);
            window.setTimeout(() => {
                // ส่งตรงไปยังหน้าแรก (Landing Page) ทันที
                router.push(data.redirectTo || "/");
                router.refresh();
            }, 800);


        } catch {
            showToast("error", "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-6 py-12">
            {toast && (
                <div className="fixed right-5 top-5 z-[100] flex flex-col gap-3 pointer-events-none">
                    <div
                        className={`pointer-events-auto flex items-center gap-3 rounded-2xl border-l-4 bg-white px-5 py-3.5 text-xs text-textMain shadow-lg transition-all duration-300 ${toast.type === "success"
                                ? "border-emerald-400"
                                : toast.type === "error"
                                    ? "border-red-400"
                                    : "border-primary"
                            }`}
                    >
                        <span className="text-base">
                            {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "💡"}
                        </span>
                        <span className="font-medium">{toast.message}</span>
                    </div>
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
                                GoHome
                            </p>
                            <h1 className="font-mali text-4xl leading-tight text-textMain">
                                เชื่อมต่อความรัก<br />ให้สัตว์จรได้บ้าน
                            </h1>
                        </div>

                        <div className="space-y-4 text-sm text-gray-600">
                            <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 shadow-sm">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bgAccent text-primary">✓</span>
                                <span>ติดตามเคสและโอกาสช่วยเหลือได้ทันที</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 shadow-sm">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bgAccent text-primary">❤</span>
                                <span>ร่วมดูแลสัตว์ที่รอการช่วยเหลือ</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="mb-8 text-center">
                            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-bgAccent text-3xl shadow-sm">
                                🐶
                            </div>
                            <h2 className="font-mali text-3xl text-textMain">เข้าสู่ระบบ</h2>
                            <p className="mt-2 text-sm text-gray-500">
                                เข้าดูเคสสัตว์จรและประกาศความช่วยเหลือได้ทันที
                            </p>
                        </div>

                        <div className="mb-6 flex rounded-2xl bg-gray-100 p-1 text-xs font-semibold">
                            <button
                                type="button"
                                className="flex-1 rounded-xl bg-white py-2.5 text-primary shadow-sm"
                            >
                                เข้าสู่ระบบ
                            </button>
                            <Link
                                href="/register"
                                className="flex-1 rounded-xl py-2.5 text-center text-gray-500 transition hover:text-textMain"
                            >
                                สมัครสมาชิก
                            </Link>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-textMain">
                                    ชื่อผู้ใช้หรืออีเมล
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    placeholder="กรอกชื่อผู้ใช้หรืออีเมล"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full rounded-2xl border border-gray-200 bg-stone-50 px-4 py-3 text-sm text-textMain placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none"
                                />
                            </div>

                            <div>
                                <div className="mb-1 flex items-center justify-between gap-3">
                                    <label className="text-xs font-semibold text-textMain">รหัสผ่าน</label>
                                    <Link href="/change-password" className="text-[11px] text-primary hover:text-primaryHover">
                                        ลืมรหัสผ่าน?
                                    </Link>
                                </div>
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

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="remember-me"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary accent-primary"
                                />
                                <label htmlFor="remember-me" className="cursor-pointer text-xs text-gray-500">
                                    จดจำการเข้าสู่ระบบไว้
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-2 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-primaryHover disabled:opacity-50"
                            >
                                {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[calc(100vh-120px)] items-center justify-center text-sm text-gray-400">
                    กำลังโหลด...
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}
