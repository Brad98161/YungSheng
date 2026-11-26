"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  GraduationCap,
  FileText,
  UserCheck,
  Award,
  Users,
  LayoutDashboard,
  LogOut
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, logout, pendingCounts } = useAuth();

  // If on login page, render clean minimal header
  if (pathname === "/login" || pathname.startsWith("/attendance/scan")) {
    return (
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-800 text-sm tracking-tight">企業教育訓練管理系統</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">RE-SOP-003</span>
        </div>
      </header>
    );
  }

  const navItems = [
    { label: "儀表板", href: "/", icon: LayoutDashboard },
    {
      label: "教育訓練申請",
      href: "/applications",
      icon: FileText,
      badge: pendingCounts.reviewApp > 0 ? pendingCounts.reviewApp : undefined
    },
    { label: "簽到考核表", href: "/attendance", icon: UserCheck },
    {
      label: "外訓心得報告",
      href: "/feedback",
      icon: Award,
      badge:
        pendingCounts.reviewFeedback > 0 || pendingCounts.fillFeedback > 0
          ? pendingCounts.reviewFeedback + pendingCounts.fillFeedback
          : undefined
    },
    // Only ADMIN or HR_MANAGER can see organization settings
    ...(currentUser?.role === "ADMIN" || currentUser?.role === "HR_MANAGER"
      ? [{ label: "組織與人員設定", href: "/organization", icon: Users }]
      : [])
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "STAFF":
        return <span className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded font-medium">員工</span>;
      case "MANAGER":
        return <span className="bg-blue-100 text-blue-700 text-[11px] px-2 py-0.5 rounded font-medium">單位主管</span>;
      case "DEPT_HEAD":
        return <span className="bg-indigo-100 text-indigo-700 text-[11px] px-2 py-0.5 rounded font-medium">最高主管</span>;
      case "HR_MANAGER":
        return <span className="bg-purple-100 text-purple-700 text-[11px] px-2 py-0.5 rounded font-medium">人資主管</span>;
      case "HR_STAFF":
        return <span className="bg-emerald-100 text-emerald-700 text-[11px] px-2 py-0.5 rounded font-medium">人資專員</span>;
      case "ADMIN":
        return <span className="bg-amber-100 text-amber-700 text-[11px] px-2 py-0.5 rounded font-medium">管理員</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 tracking-tight block leading-tight">
                教育訓練管理系統
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout Button */}
          {currentUser && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 justify-end">
                  {currentUser.name}
                  {getRoleBadge(currentUser.role)}
                </div>
                <div className="text-[11px] text-slate-400">
                  {currentUser.department} · {currentUser.title}
                </div>
              </div>

              <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

              <button
                onClick={logout}
                className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
                title="登出系統"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>登出</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
