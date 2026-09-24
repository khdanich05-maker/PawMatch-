import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoHome - จับคู่ใจ เพื่อสัตว์จร",
  description: "ระบบจับคู่อาสาสมัครกับสัตว์จรจัดที่ต้องการความช่วยเหลือ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Itim&family=Mali:wght@400;600&family=Prompt:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}