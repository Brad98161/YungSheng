import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "企業教育訓練管理系統 | RE-SOP-003",
  description: "訓前申請、訓中簽到考核、訓後心得與行動計畫全流程管理系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 min-h-screen text-slate-800`}>
        <AuthProvider>
          <div className="flex min-h-screen">
            <Suspense fallback={<div className="w-64 bg-white border-r border-slate-200"></div>}>
              <Sidebar />
            </Suspense>
            <div className="flex-1 flex flex-col min-w-0">
              <main className="flex-1 p-6 md:p-8 xl:p-10 w-full min-w-0">
                <Suspense fallback={<div className="py-20 text-center text-slate-400">載入中...</div>}>
                  {children}
                </Suspense>
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
