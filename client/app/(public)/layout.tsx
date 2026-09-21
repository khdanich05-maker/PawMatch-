// app/(public)/layout.tsx
import React from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FCFAF8]">
      {children}
    </div>
  );
}