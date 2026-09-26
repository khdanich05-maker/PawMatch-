// components/ui/StatusToast.tsx

"use client";

import React, { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

interface StatusToastProps {
    type: ToastType;
    message: string;
    duration?: number;
    onClose: () => void;
}

const toastConfig = {
    success: {
        title: "เข้าสู่ระบบสำเร็จ",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="h-5 w-5"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m5 12 4 4L19 6"
                />
            </svg>
        ),
        iconClass: "bg-emerald-50 text-emerald-500",
        borderClass: "border-emerald-400",
        progressClass: "bg-emerald-500",
    },

    error: {
        title: "เข้าสู่ระบบไม่สำเร็จ",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="h-5 w-5"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6l12 12M18 6 6 18"
                />
            </svg>
        ),
        iconClass: "bg-red-50 text-red-600",
        borderClass: "border-red-400",
        progressClass: "bg-red-500",
    },

    info: {
        title: "แจ้งเตือน",
        icon: (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="h-5 w-5"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16v-4m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
            </svg>
        ),
        iconClass: "bg-primary/10 text-primary",
        borderClass: "border-primary",
        progressClass: "bg-primary",
    },
} as const;

export default function StatusToast({
    type,
    message,
    duration = 3500,
    onClose,
}: StatusToastProps) {
    const config = toastConfig[type];

    useEffect(() => {
        const timer = window.setTimeout(() => {
            onClose();
        }, duration);

        return () => window.clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            role="status"
            aria-live="polite"
            className="pointer-events-none fixed right-5 top-5 z-[100] w-[calc(100%-2.5rem)] max-w-sm animate-[toast-in_0.35s_cubic-bezier(0.16,1,0.3,1)]"
        >
            <div
                className={`
                    pointer-events-auto relative overflow-hidden
                    rounded-2xl border-l-4 ${config.borderClass}
                    bg-white px-4 py-4
                    shadow-lg shadow-black/10
                    ring-1 ring-black/5
                `}
            >
                <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div
                        className={`
                            flex h-10 w-10 shrink-0 items-center justify-center
                            rounded-xl ${config.iconClass}
                        `}
                    >
                        {config.icon}
                    </div>

                    {/* Message */}
                    <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-sm font-semibold leading-5 text-textMain">
                            {config.title}
                        </p>

                        <p className="mt-1 text-sm leading-5 text-gray-500">
                            {message}
                        </p>
                    </div>

                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="ปิดการแจ้งเตือน"
                        className="
                            flex h-7 w-7 shrink-0 items-center justify-center
                            rounded-lg text-gray-400
                            transition-all duration-200
                            hover:bg-gray-100 hover:text-textMain
                            focus:outline-none focus:ring-2 focus:ring-primary/30
                        "
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-4 w-4"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 6l12 12M18 6 6 18"
                            />
                        </svg>
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-100">
                    <div
                        className={`
                            h-full origin-left ${config.progressClass}
                            animate-[toast-progress_var(--toast-duration)_linear_forwards]
                        `}
                        style={
                            {
                                "--toast-duration": `${duration}ms`,
                            } as React.CSSProperties
                        }
                    />
                </div>
            </div>
        </div>
    );
}