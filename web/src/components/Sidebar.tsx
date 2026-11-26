"use client";

import React, { useState, useEffect } from "react";
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
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, logout, pendingCounts } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Load collapsed state preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar_collapsed");
      if (saved === "true") setCollapsed(true);
    }
  }, []);

  const toggleCollapsed = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar_collapsed", String(nextState));
    }
  };

  // Hide sidebar on login or scan pages
  if (pathname === "/login" || pathname.startsWith("/attendance/scan")) {
    return null;
  }

  const navItems = [
    { label: "總覽儀表板", href: "/", icon: LayoutDashboard },
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
    ...(currentUser?.role === "ADMIN" || currentUser?.role === "HR_MANAGER"
      ? [{ label: "組織與人員設定", href: "/organization", icon: Users }]
      : [])
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "STAFF":
        return <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap">員工</span>;
      case "MANAGER":
        return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap">主管</span>;
      case "DEPT_HEAD":
        return <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap">最高主管</span>;
      case "HR_MANAGER":
        return <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap">人資主管</span>;
      case "HR_STAFF":
        return <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap">人資專員</span>;
      case "ADMIN":
        return <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap">管理員</span>;
      default:
        return null;
    }
  };

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-screen sticky top-0 h-screen select-none transition-all duration-300 z-30 ${collapsed ? "w-20" : "w-64 xl:w-72"
        }`}
    >
      {/* Brand Header & Collapse Toggle */}
      <div
        className={`border-b border-slate-100 ${collapsed
            ? "py-4 px-2 flex flex-col items-center gap-3"
            : "p-4 flex items-center justify-between"
          }`}
      >
        {!collapsed ? (
          <>
            <Link href="/" className="flex items-center gap-3 group overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="truncate">
                <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight whitespace-nowrap">
                  教育訓練系統
                </span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5 block whitespace-nowrap">
                  RE-SOP-003 合規系統
                </span>
              </div>
            </Link>
            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              title="收合側邊選單"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <Link
              href="/"
              title="教育訓練管理系統"
              className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 shrink-0"
            >
              <GraduationCap className="w-6 h-6" />
            </Link>
            <button
              onClick={toggleCollapsed}
              className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0"
              title="展開側邊選單"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {!collapsed && (
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 whitespace-nowrap">
            功能選單
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center rounded-xl text-sm font-semibold transition-all relative ${collapsed ? "justify-center p-3" : "justify-between px-3.5 py-3"
                } ${isActive
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
            >
              <div className="flex items-center gap-3 shrink-0">
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </div>

              {!collapsed ? (
                item.badge !== undefined ? (
                  <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <ChevronRight className="w-4 h-4 text-blue-400 shrink-0" />
                ) : null
              ) : item.badge !== undefined ? (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      {currentUser && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          {!collapsed ? (
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm shrink-0">
                    {currentUser.name.slice(0, 1)}
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {currentUser.department}
                    </div>
                  </div>
                </div>
                <div>{getRoleBadge(currentUser.role)}</div>
              </div>

              <div className="text-xs text-slate-400 truncate">
                職稱：{currentUser.title}
              </div>

              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 py-2 rounded-lg border border-slate-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>登出系統</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div
                title={`${currentUser.name} (${currentUser.department} · ${currentUser.title})`}
                className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm cursor-pointer shadow-xs"
              >
                {currentUser.name.slice(0, 1)}
              </div>
              <button
                onClick={logout}
                title="登出系統"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
