"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AttendanceRecord } from "@/types";
import {
  UserCheck,
  Download,
  QrCode,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Users
} from "lucide-react";

export default function AttendanceListPage() {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch("/api/attendance");
      if (res.ok) {
        setRecords(await res.json());
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

  const filtered = records.filter(
    (r) =>
      r.courseName.toLowerCase().includes(search.toLowerCase()) ||
      r.lecturerName.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">教育訓練簽到考核表</h1>
          <p className="text-sm text-slate-500 mt-1">
            課堂現場 QR Code 投影掃碼出勤、即時統計與學員考核評分
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋課程名稱、講師姓名、單號..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          />
        </div>
        <div className="text-sm text-slate-500 font-medium">共 {records.length} 個班級課程</div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-5 py-3.5 whitespace-nowrap">考核單號 / 關聯申請</th>
                <th className="px-5 py-3.5 min-w-[200px]">課程名稱</th>
                <th className="px-5 py-3.5 whitespace-nowrap">講師 / 地點</th>
                <th className="px-5 py-3.5 whitespace-nowrap">訓練時間</th>
                <th className="px-5 py-3.5 whitespace-nowrap">實到 / 應到 (簽到率)</th>
                <th className="px-5 py-3.5 whitespace-nowrap text-center">狀態</th>
                <th className="px-5 py-3.5 whitespace-nowrap text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                    目前尚無開班簽到考核紀錄
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const actual = r.actualCount || r.attendees.filter((a) => a.signed).length;
                  const total = r.expectedCount || r.attendees.length || 1;
                  const rate = Math.round((actual / total) * 100);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-mono text-xs font-bold text-slate-800">{r.id}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {r.applicationId || "直接開課"}
                        </div>
                      </td>
                      <td className="px-5 py-4 min-w-[200px]">
                        <div className="font-semibold text-slate-900">{r.courseName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          考核方式：{r.evalMethods?.join("、")}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{r.lecturerName}</div>
                        <div className="text-xs text-slate-400">
                          {r.lecturerType} · {r.location}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs whitespace-nowrap">
                        <div className="font-medium text-slate-700">
                          {r.startDate} ~ {r.endDate}
                        </div>
                        <div className="text-slate-400 mt-0.5">時數：{r.totalHours} 小時</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-800">
                            {actual} / {total}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-semibold ${
                              rate === 100
                                ? "bg-emerald-100 text-emerald-800"
                                : rate > 0
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {rate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        {r.status === "OPEN" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            點名進行中
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                            已結訓封存
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                        {r.wordDocUrl && (
                          <a
                            href={r.wordDocUrl}
                            download
                            className="inline-flex items-center gap-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap"
                            title="下載 RE-SOP-003-03 簽到考核表 Word"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            Word
                          </a>
                        )}
                        <Link
                          href={`/attendance/${r.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <QrCode className="w-3.5 h-3.5 shrink-0" />
                          點名 / 評分 &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
