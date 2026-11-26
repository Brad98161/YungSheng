"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, Lock, User, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("123");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim()) {
      setError("請輸入員工編號或帳號");
      return;
    }

    setIsSubmitting(true);
    const res = await login(username, password);
    setIsSubmitting(false);

    if (res.success) {
      router.push("/");
    } else {
      setError(res.error || "登入失敗");
    }
  };

  const handleQuickSelect = (id: string) => {
    setUsername(id);
    setPassword("123");
    setError("");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">企業教育訓練管理系統</h1>
          <p className="text-xs text-slate-500">請輸入企業員工編號與密碼登入</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">員工工號 / 帳號</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="例如：EMP001、MGR001"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">登入密碼</label>
              <span className="text-[11px] text-slate-400 font-mono">預設: 123</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? "正在驗證中..." : "登入系統"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Fill Helper */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            快速測試帳號填入（點擊自動帶入）：
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickSelect("EMP001")}
              className="text-left px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-xs text-slate-700 border border-slate-200/80 transition-colors"
            >
              <span className="font-bold">張大同</span> <span className="text-[10px] text-slate-400 font-mono">(員工)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect("MGR001")}
              className="text-left px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-xs text-slate-700 border border-slate-200/80 transition-colors"
            >
              <span className="font-bold">李經理</span> <span className="text-[10px] text-blue-600 font-mono">(單位主管)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect("HR001")}
              className="text-left px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-xs text-slate-700 border border-slate-200/80 transition-colors"
            >
              <span className="font-bold">陳主任</span> <span className="text-[10px] text-purple-600 font-mono">(人資主管)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect("DIR001")}
              className="text-left px-2.5 py-1.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-xs text-slate-700 border border-slate-200/80 transition-colors"
            >
              <span className="font-bold">王總監</span> <span className="text-[10px] text-indigo-600 font-mono">(最高主管)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
