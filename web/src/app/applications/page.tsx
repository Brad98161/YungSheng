"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { TrainingApplication } from "@/types";
import {
  FileText,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Eye,
  Check,
  AlertCircle
} from "lucide-react";

export default function ApplicationsPage() {
  const { currentUser } = useAuth();
  const [apps, setApps] = useState<TrainingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"ALL" | "PENDING_ME" | "INTERNAL" | "EXTERNAL" | "APPROVED">("ALL");
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch("/api/applications");
      if (res.ok) {
        setApps(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredApps = apps.filter((a) => {
    // Search
    const matchesSearch =
      a.courseName.toLowerCase().includes(search.toLowerCase()) ||
      a.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      a.dept.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    // Tab filter
    if (tab === "PENDING_ME") {
      if (currentUser?.role === "MANAGER") return a.status === "PENDING_UNIT_REVIEW";
      if (currentUser?.role === "HR_MANAGER" || currentUser?.role === "ADMIN") return a.status === "PENDING_HR_REVIEW";
      return false;
    }
    if (tab === "INTERNAL") return a.trainingType === "內訓";
    if (tab === "EXTERNAL") return a.trainingType === "外訓";
    if (tab === "APPROVED") return a.status === "APPROVED";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">教育訓練申請管理</h1>
          <p className="text-sm text-slate-500 mt-1">
            填寫內訓 / 外訓申請表，送審自動套印 Word 附件供主管簽核查閱
          </p>
        </div>
        <Link
          href="/applications/new"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          填寫教育訓練申請表
        </Link>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setTab("ALL")}
            className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition-colors ${tab === "ALL" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            全部申請 ({apps.length})
          </button>
          <button
            onClick={() => setTab("PENDING_ME")}
            className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${tab === "PENDING_ME"
                ? "bg-amber-600 text-white"
                : "text-amber-700 bg-amber-50 hover:bg-amber-100"
              }`}
          >
            <Clock className="w-4 h-4" />
            待我簽核
          </button>
          <button
            onClick={() => setTab("INTERNAL")}
            className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition-colors ${tab === "INTERNAL" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            內訓課程 ({apps.filter((a) => a.trainingType === "內訓").length})
          </button>
          <button
            onClick={() => setTab("EXTERNAL")}
            className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition-colors ${tab === "EXTERNAL" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            外訓申請 ({apps.filter((a) => a.trainingType === "外訓").length})
          </button>
          <button
            onClick={() => setTab("APPROVED")}
            className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition-colors ${tab === "APPROVED" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            已核准成案 ({apps.filter((a) => a.status === "APPROVED").length})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋課程名稱、申請人、部門..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs xl:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-5 py-3.5 whitespace-nowrap">單號 / 申請日</th>
                <th className="px-5 py-3.5 whitespace-nowrap text-center">類別</th>
                <th className="px-5 py-3.5 min-w-[220px]">課程名稱與目標</th>
                <th className="px-5 py-3.5 whitespace-nowrap">申請人 / 部門</th>
                <th className="px-5 py-3.5 whitespace-nowrap">時程 / 總時數</th>
                <th className="px-5 py-3.5 whitespace-nowrap text-center">簽核狀態</th>
                <th className="px-5 py-3.5 whitespace-nowrap text-right">Word附件 / 操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                    目前無符合條件之申請單
                  </td>
                </tr>
              ) : (
                filteredApps.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap font-mono text-xs">
                      <div className="font-bold text-slate-800">{a.id}</div>
                      <div className="text-slate-400 mt-0.5">{a.applyDate}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-block text-xs px-2.5 py-1 rounded-md font-bold whitespace-nowrap ${
                          a.trainingType === "內訓"
                            ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                            : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        }`}
                      >
                        {a.trainingType}
                      </span>
                    </td>
                    <td className="px-5 py-4 min-w-[220px]">
                      <div className="font-semibold text-slate-900">{a.courseName}</div>
                      <div className="text-xs text-slate-500 mt-1 line-clamp-1">{a.courseObjective}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800 whitespace-nowrap">{a.applicantName}</div>
                      <div className="text-xs text-slate-400 whitespace-nowrap">{a.dept}</div>
                    </td>
                    <td className="px-5 py-4 text-xs whitespace-nowrap">
                      <div className="font-medium text-slate-700 whitespace-nowrap">
                        {a.startDate} ~ {a.endDate}
                      </div>
                      <div className="text-slate-400 mt-0.5 whitespace-nowrap">
                        共 {a.totalDays} 天 ({a.totalHours} 小時)
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      {a.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold whitespace-nowrap">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          已核准成案
                        </span>
                      )}
                      {a.status === "PENDING_UNIT_REVIEW" && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full font-bold whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          待單位主管審核
                        </span>
                      )}
                      {a.status === "PENDING_HR_REVIEW" && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full font-bold whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          待人資部核准
                        </span>
                      )}
                      {a.status === "REJECTED" && (
                        <span className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full font-bold whitespace-nowrap">
                          退回修正
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                      {a.wordDocUrl ? (
                        <a
                          href={a.wordDocUrl}
                          download
                          className="inline-flex items-center gap-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap"
                          title="下載依 RE-SOP-003-04 標準自動填妥之 Word 檔"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          Word 附件
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">處理中</span>
                      )}
                      <Link
                        href={`/applications/${a.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        檢視 / 簽核 &rarr;
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
