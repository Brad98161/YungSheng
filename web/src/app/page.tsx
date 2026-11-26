"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { TrainingApplication, AttendanceRecord, FeedbackReport } from "@/types";
import {
  FileText,
  UserCheck,
  Award,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Download,
  AlertCircle,
  QrCode,
  Calendar,
  Check
} from "lucide-react";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [apps, setApps] = useState<TrainingApplication[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, attRes, fbRes] = await Promise.all([
          fetch("/api/applications"),
          fetch("/api/attendance"),
          fetch("/api/feedback")
        ]);
        if (aRes.ok) setApps(await aRes.json());
        if (attRes.ok) setAttendances(await attRes.json());
        if (fbRes.ok) setFeedbacks(await fbRes.json());
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter pending items for current user
  const myPendingReviewApps = apps.filter((a) => {
    if (currentUser?.role === "MANAGER") return a.status === "PENDING_UNIT_REVIEW";
    if (currentUser?.role === "HR_MANAGER" || currentUser?.role === "ADMIN") return a.status === "PENDING_HR_REVIEW";
    return false;
  });

  const myPendingFeedbackReports = feedbacks.filter((f) => {
    if (currentUser?.role === "STAFF") return f.empId === currentUser.id && f.status === "DRAFT";
    if (currentUser?.role === "MANAGER") return f.status === "SUBMITTED";
    if (currentUser?.role === "DEPT_HEAD" || currentUser?.role === "ADMIN") return f.status === "MANAGER_REVIEWED";
    return false;
  });

  const hasPendingItems = myPendingReviewApps.length > 0 || myPendingFeedbackReports.length > 0;

  const totalTrainingHours = apps
    .filter((a) => a.status === "APPROVED")
    .reduce((sum, a) => sum + Number(a.totalHours || 0), 0);

  return (
    <div className="space-y-8 w-full">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl xl:text-3xl font-extrabold text-slate-900 tracking-tight">
            您好，{currentUser?.name || "同仁"}
          </h1>
          <p className="text-sm xl:text-base text-slate-500 mt-1">
            {currentUser?.department} · {currentUser?.title}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/applications/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-sm transition-all hover:shadow flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            填寫教育訓練申請表
          </Link>
        </div>
      </div>

      {/* KPI Stats - 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">申請單總量</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {apps.length} <span className="text-base font-normal text-slate-400">件</span>
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            已核准成案 {apps.filter((a) => a.status === "APPROVED").length} 件
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">開課與考核班級</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {attendances.length} <span className="text-base font-normal text-slate-400">班</span>
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1.5 whitespace-nowrap">
            <QrCode className="w-3.5 h-3.5" />
            支援課堂投影 QR Code 掃碼
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">年度累計培訓總時數</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            {totalTrainingHours} <span className="text-base font-normal text-slate-400">小時</span>
          </div>
          <div className="text-xs text-slate-500 mt-2 whitespace-nowrap">
            已繳交外訓心得 {feedbacks.length} 份
          </div>
        </div>

        <div className={`p-5 rounded-2xl border transition-shadow ${hasPendingItems
            ? "bg-amber-50/70 border-amber-200 shadow-2xs"
            : "bg-white border-slate-200 shadow-2xs"
          }`}>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>待我處理事項</span>
            {hasPendingItems && (
              <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                {myPendingReviewApps.length + myPendingFeedbackReports.length} 件
              </span>
            )}
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {hasPendingItems ? (
              <span className="text-amber-700">
                {myPendingReviewApps.length + myPendingFeedbackReports.length} <span className="text-base font-normal text-amber-600">件待辦</span>
              </span>
            ) : (
              <span className="text-emerald-700 text-xl flex items-center gap-1.5">
                <Check className="w-5 h-5 text-emerald-600" />
                全部已審畢
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 mt-2 whitespace-nowrap">
            {hasPendingItems ? "請及時進行線上簽核或填寫" : "目前暫無待審或待繳事項"}
          </div>
        </div>
      </div>

      {/* Pending Items Alert Row (if any) */}
      {hasPendingItems && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>提醒：您有 {myPendingReviewApps.length + myPendingFeedbackReports.length} 件需要即時處理的項目：</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {myPendingReviewApps.map((a) => (
              <div
                key={a.id}
                className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px] whitespace-nowrap">
                    待審核申請
                  </span>
                  <div className="font-bold text-slate-900 truncate mt-1">{a.courseName}</div>
                  <div className="text-slate-500 text-[11px] truncate">
                    申請人：{a.applicantName} ({a.dept})
                  </div>
                </div>
                <Link
                  href={`/applications/${a.id}`}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shrink-0 whitespace-nowrap"
                >
                  簽核 &rarr;
                </Link>
              </div>
            ))}

            {myPendingFeedbackReports.map((f) => (
              <div
                key={f.id}
                className="bg-white p-3.5 rounded-xl border border-purple-200 shadow-2xs flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <span className="font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded text-[11px] whitespace-nowrap">
                    {f.status === "DRAFT" ? "待填寫心得" : "待主管評核"}
                  </span>
                  <div className="font-bold text-slate-900 truncate mt-1">{f.courseName}</div>
                  <div className="text-slate-500 text-[11px] truncate">學員：{f.empName}</div>
                </div>
                <Link
                  href={`/feedback/${f.id}`}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shrink-0 whitespace-nowrap"
                >
                  {f.status === "DRAFT" ? "填寫" : "評核"} &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Full-Width Table: Recent Applications */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden w-full">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-base">近期教育訓練申請</h2>
            <p className="text-xs text-slate-400 mt-0.5">送簽即時自動套印 Word 附件，支援線上簽審</p>
          </div>
          <Link
            href="/applications"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 whitespace-nowrap"
          >
            檢視全部申請 &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm table-auto">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100 text-xs">
              <tr>
                <th className="px-5 py-3.5 whitespace-nowrap min-w-[140px]">單號 / 申請日</th>
                <th className="px-4 py-3.5 whitespace-nowrap min-w-[80px] text-center">類別</th>
                <th className="px-5 py-3.5 min-w-[280px]">課程名稱與目標</th>
                <th className="px-5 py-3.5 whitespace-nowrap min-w-[140px]">申請人 / 部門</th>
                <th className="px-5 py-3.5 whitespace-nowrap min-w-[180px]">受訓期間 (時數)</th>
                <th className="px-5 py-3.5 whitespace-nowrap min-w-[140px] text-center">審核狀態</th>
                <th className="px-5 py-3.5 whitespace-nowrap min-w-[150px] text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {apps.slice(0, 8).map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-slate-600 font-medium whitespace-nowrap min-w-[140px]">
                    <div className="font-bold text-slate-800 whitespace-nowrap">{a.id}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">{a.applyDate}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center min-w-[80px]">
                    <span
                      className={`inline-block px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap tracking-wider leading-normal ${a.trainingType === "內訓"
                          ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        }`}
                    >
                      {a.trainingType}
                    </span>
                  </td>
                  <td className="px-5 py-4 min-w-[280px]">
                    <div className="font-bold text-slate-900 text-sm">
                      {a.courseName}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {a.courseObjective}
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap min-w-[140px]">
                    <div className="font-semibold text-slate-800 whitespace-nowrap">{a.applicantName}</div>
                    <div className="text-xs text-slate-400 whitespace-nowrap">{a.dept}</div>
                  </td>
                  <td className="px-5 py-4 text-xs whitespace-nowrap min-w-[180px]">
                    <div className="font-medium text-slate-800 whitespace-nowrap">
                      {a.startDate} ~ {a.endDate}
                    </div>
                    <div className="text-slate-400 mt-0.5 whitespace-nowrap">共 {a.totalHours} 小時</div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-center min-w-[140px]">
                    {a.status === "APPROVED" && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        已核准成案
                      </span>
                    )}
                    {a.status === "PENDING_UNIT_REVIEW" && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full font-bold whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        待單位主管審核
                      </span>
                    )}
                    {a.status === "PENDING_HR_REVIEW" && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full font-bold whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        待人資部核准
                      </span>
                    )}
                    {a.status === "REJECTED" && (
                      <span className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full font-bold whitespace-nowrap">
                        退回修正
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap min-w-[150px]">
                    {a.wordDocUrl && (
                      <a
                        href={a.wordDocUrl}
                        download
                        className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap"
                        title="下載依 RE-SOP-003-04 標準自動填妥之 Word 檔"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                        Word
                      </a>
                    )}
                    <Link
                      href={`/applications/${a.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                      詳情 &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
          快速功能捷徑
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <Link
            href="/applications/new"
            className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold transition-colors border border-slate-100"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-slate-900 font-bold">提出訓練申請</div>
                <div className="text-xs text-slate-400 font-normal mt-0.5">線上申請並自動生成 Word 附件</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/attendance"
            className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-semibold transition-colors border border-slate-100"
          >
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-slate-900 font-bold">課堂簽到與成績考核</div>
                <div className="text-xs text-slate-400 font-normal mt-0.5">點名、QR Code 掃碼、成績評核</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/feedback"
            className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-semibold transition-colors border border-slate-100"
          >
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-slate-900 font-bold">外訓心得與評核報告</div>
                <div className="text-xs text-slate-400 font-normal mt-0.5">訓後心得填報、行動計畫、兩級主管評核</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
