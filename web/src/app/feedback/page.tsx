"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FeedbackReport } from "@/types";
import {
  Award,
  Download,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  FileEdit,
  Sparkles
} from "lucide-react";

export default function FeedbackListPage() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState<FeedbackReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"ALL" | "PENDING_ME" | "DRAFT" | "APPROVED">("ALL");
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch("/api/feedback");
      if (res.ok) {
        setReports(await res.json());
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

  const filtered = reports.filter((r) => {
    const matchesSearch =
      r.courseName.toLowerCase().includes(search.toLowerCase()) ||
      r.empName.toLowerCase().includes(search.toLowerCase()) ||
      r.dept.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (tab === "PENDING_ME") {
      if (currentUser?.role === "STAFF") return r.empId === currentUser.id && r.status === "DRAFT";
      if (currentUser?.role === "MANAGER") return r.status === "SUBMITTED";
      if (currentUser?.role === "DEPT_HEAD" || currentUser?.role === "ADMIN")
        return r.status === "MANAGER_REVIEWED";
      return false;
    }
    if (tab === "DRAFT") return r.status === "DRAFT";
    if (tab === "APPROVED") return r.status === "APPROVED";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">外訓心得報告</h1>
          <p className="text-sm text-slate-500 mt-1">
            外訓成果自評、工作落地行動計畫與兩級主管評核
          </p>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setTab("ALL")}
            className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition-colors ${tab === "ALL" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            全部心得報告 ({reports.length})
          </button>
          <button
            onClick={() => setTab("PENDING_ME")}
            className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${tab === "PENDING_ME"
                ? "bg-purple-600 text-white"
                : "text-purple-700 bg-purple-50 hover:bg-purple-100"
              }`}
          >
            <Clock className="w-4 h-4" />
            待我處理 (填寫/評核)
          </button>
          <button
            onClick={() => setTab("DRAFT")}
            className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition-colors ${tab === "DRAFT" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            待學員填寫 ({reports.filter((r) => r.status === "DRAFT").length})
          </button>
          <button
            onClick={() => setTab("APPROVED")}
            className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition-colors ${tab === "APPROVED" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            已核准結案 ({reports.filter((r) => r.status === "APPROVED").length})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋學員姓名、課程名稱..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-5 py-3.5 whitespace-nowrap">單號 / 填表日</th>
                <th className="px-5 py-3.5 whitespace-nowrap">受訓同仁 / 部門</th>
                <th className="px-5 py-3.5 min-w-[200px]">課程名稱</th>
                <th className="px-5 py-3.5 whitespace-nowrap">訓練機構 / 講師</th>
                <th className="px-5 py-3.5 whitespace-nowrap">受訓期間 (時數)</th>
                <th className="px-5 py-3.5 whitespace-nowrap text-center">評核狀態</th>
                <th className="px-5 py-3.5 whitespace-nowrap text-right">Word附件 / 操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                    目前無符合條件之外訓心得報告
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-mono text-xs font-bold text-slate-800">{r.id}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{r.reportDate}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 whitespace-nowrap">{r.empName}</div>
                      <div className="text-xs text-slate-400 whitespace-nowrap">
                        {r.dept} ({r.empId})
                      </div>
                    </td>
                    <td className="px-5 py-4 min-w-[200px]">
                      <div className="font-semibold text-slate-900">{r.courseName}</div>
                      <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {r.learningPoints || "尚未填寫學習重點"}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-slate-800 font-medium whitespace-nowrap">{r.orgName}</div>
                      <div className="text-xs text-slate-400 whitespace-nowrap">講師：{r.lecturerName}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-700 whitespace-nowrap">
                      <div className="whitespace-nowrap">
                        {r.startDate} ~ {r.endDate}
                      </div>
                      <div className="text-slate-400 mt-0.5 whitespace-nowrap">時數：{r.totalHours} 小時</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      {r.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold whitespace-nowrap">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          已核准結案
                        </span>
                      )}
                      {r.status === "MANAGER_REVIEWED" && (
                        <span className="inline-flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full font-bold whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          待最高主管核准
                        </span>
                      )}
                      {r.status === "SUBMITTED" && (
                        <span className="inline-flex items-center gap-1 text-xs text-purple-700 bg-purple-50 px-3 py-1 rounded-full font-bold whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          待單位主管評核
                        </span>
                      )}
                      {r.status === "DRAFT" && (
                        <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded-full font-bold whitespace-nowrap">
                          待學員填寫
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                      {r.wordDocUrl && (
                        <a
                          href={r.wordDocUrl}
                          download
                          className="inline-flex items-center gap-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap"
                          title="下載依 RE-SOP-003-06 標準自動填妥之 Word 檔"
                        >
                          <Download className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          Word
                        </a>
                      )}
                      <Link
                        href={`/feedback/${r.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                      >
                        {r.status === "DRAFT" && r.empId === currentUser?.id ? "填寫" : "檢視 / 評核"}{" "}
                        &rarr;
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
