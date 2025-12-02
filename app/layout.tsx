import type { Metadata, Viewport } from "next"; // ✅ เพิ่ม Viewport
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ 1. ตั้งชื่อแอปให้เท่
export const metadata: Metadata = {
  title: "Star Catcher",
  description: "Make a wish and catch a star!",
};

// ✅ 2. ล็อคหน้าจอให้เหมือนแอปมือถือ (ห้ามซูม)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // สำคัญ: ป้องกันการจิ้มแล้วซูมเข้าออก
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`} // ✅ เพิ่ม bg-black กันหน้าขาวแว้บตอนโหลด
      >
        {children}
      </body>
    </html>
  );
}
