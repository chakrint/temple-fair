import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google"; // ✅ เปลี่ยนจาก Geist เป็น Inter
import "./globals.css";

// ✅ เรียกใช้ Inter
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Star Catcher",
  description: "Make a wish and catch a star!",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-black`}> {/* ✅ ใช้ Class ของ Inter */}
        {children}
      </body>
    </html>
  );
}
