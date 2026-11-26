"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FeedbackReport } from "@/types";
import {
  Award,
  ArrowLeft,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  Save,
  Check,
  Building2,
  Calendar
} from "lucide-react";

export default function FeedbackDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { currentUser, refreshPendingCounts } = useAuth();

  const [report, setReport] = useState<FeedbackReport | null>(null);
  const [loading, setLoading] = useState(true);

  // 學員自評問卷
  const [q1, setQ1] = useState("非常需要");
  const [q2, setQ2] = useState("非常佳");
  const [q3, setQ3] = useState("非常佳");
  const [q4, setQ4] = useState("非常佳");
  const [q5, setQ5] = useState("非常瞭解");
  const [learningPoints, setLearningPoints] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [reporterSign, setReporterSign] = useState("");

  // 審核主管評核
  const [mReview1, setMReview1] = useState("非常充實");
  const [mReview2, setMReview2] = useState("非常好");
  const [mReview3, setMReview3] = useState("非常好");
  const [mComment, setMComment] = useState("");
  const [reviewerSign, setReviewerSign] = useState("");

  // 部門最高主管評核
  const [topComment, setTopComment] = useState("");
  const [approverSign, setApproverSign] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch(`/api/feedback/${id}`);
      if (res.ok) {
        const data: FeedbackReport = await res.json();
        setReport(data);
        setQ1(data.q1 || "非常需要");
        setQ2(data.q2 || "非常佳");
        setQ3(data.q3 || "非常佳");
        setQ4(data.q4 || "非常佳");
        setQ5(data.q5 || "非常瞭解");
        setLearningPoints(data.learningPoints || "");
        setActionPlan(data.actionPlan || "");
        setReporterSign(data.reporterSign || data.empName || "");

        setMReview1(data.managerReview1 || "非常充實");
        setMReview2(data.managerReview2 || "非常好");
        setMReview3(data.managerReview3 || "非常好");
        setMComment(data.managerComment || "");
        setReviewerSign(data.reviewerSign || currentUser?.name || "");

        setTopComment(data.topManagerComment || "");
        setApproverSign(data.approverSign || currentUser?.name || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // 學員提交填寫
  const handleStudentSubmit = async () => {
    if (!learningPoints.trim() || !actionPlan.trim()) {
      alert("請填寫學習重點與具體工作行動計畫");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q1,
          q2,
          q3,
          q4,
          q5,
          learningPoints,
          actionPlan,
          reporterSign,
          status: "SUBMITTED"
        })
      });

      if (res.ok) {
        await loadData();
        await refreshPendingCounts();
        alert("心得報告填寫完成並已送交單位主管評核！Word 檔已同步產生。");
      }
    } catch (e) {
      console.error(e);
      alert("提交失敗");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 單位主管評核提交
  const handleManagerReviewSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/feedback/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "MANAGER_REVIEW",
          reviewerId: currentUser?.id,
          reviewerSign,
          managerReview1: mReview1,
          managerReview2: mReview2,
          managerReview3: mReview3,
          managerComment: mComment
        })
      });

      if (res.ok) {
        await loadData();
        await refreshPendingCounts();
        alert("單位主管評核已完成，已送交最高主管核定！");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 部門最高主管核定
  const handleTopManagerApproveSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/feedback/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TOP_MANAGER_APPROVE",
          reviewerId: currentUser?.id,
          reviewerSign: approverSign,
          topManagerComment: topComment
        })
      });

      if (res.ok) {
        await loadData();
        await refreshPendingCounts();
        alert("心得報告核准結案！");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400">載入外訓心得報告中...</div>;
  }

  if (!report) {
    return <div className="text-center py-20 text-slate-500">找不到該心得報告</div>;
  }

  const isAuthor = currentUser?.id === report.empId || currentUser?.role === "ADMIN";
  const canManagerReview =
    (currentUser?.role === "MANAGER" || currentUser?.role === "ADMIN") && report.status === "SUBMITTED";
  const canTopApprove =
    (currentUser?.role === "DEPT_HEAD" || currentUser?.role === "ADMIN") &&
    report.status === "MANAGER_REVIEWED";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/feedback"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回心得清單
        </Link>
        <div className="flex items-center gap-3">
          {report.wordDocUrl && (
            <a
              href={report.wordDocUrl}
              download
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all hover:shadow"
            >
              <Download className="w-4 h-4" />
              下載外訓心得報告 Word (06)
            </a>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-slate-900 px-6 py-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-purple-600 text-white px-2 py-0.5 rounded">
                RE-SOP-003-06
              </span>
              <span className="text-xs text-slate-300 font-mono">報告單號：{report.id}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight mt-1">{report.courseName}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              受訓同仁：{report.empName} ({report.dept}) · 機構：{report.orgName} · 講師：{report.lecturerName}
            </p>
          </div>

          <div>
            {report.status === "APPROVED" && (
              <span className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                兩級主管已核准結案
              </span>
            )}
            {report.status === "MANAGER_REVIEWED" && (
              <span className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
                <Clock className="w-4 h-4 text-indigo-400" />
                待最高主管核准
              </span>
            )}
            {report.status === "SUBMITTED" && (
              <span className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
                <Clock className="w-4 h-4 text-purple-400" />
                待單位主管評核
              </span>
            )}
            {report.status === "DRAFT" && (
              <span className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
                <Clock className="w-4 h-4 text-amber-400" />
                待學員線上填寫
              </span>
            )}
          </div>
        </div>

        {/* Action Panel: 單位主管審核 */}
        {canManagerReview && (
          <div className="p-5 bg-purple-50/80 border-b border-purple-200 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-purple-900">
              <Sparkles className="w-4 h-4 text-purple-600" />
              【主管評核操作】您為單位主管，請對該同仁之學習成效進行評核打分：
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">1. 心得內容充實度</label>
                <select
                  value={mReview1}
                  onChange={(e) => setMReview1(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-purple-200 rounded-lg bg-white"
                >
                  {["非常充實", "充實", "尚可", "不充實"].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">2. 行動計畫作法見解</label>
                <select
                  value={mReview2}
                  onChange={(e) => setMReview2(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-purple-200 rounded-lg bg-white"
                >
                  {["非常好", "好", "尚可", "差強人意"].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">3. 綜合評價</label>
                <select
                  value={mReview3}
                  onChange={(e) => setMReview3(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-purple-200 rounded-lg bg-white"
                >
                  {["非常好", "好", "尚可", "不佳"].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="主管評語（例如：內容具體切合部門目標，准予轉內訓）"
                  value={mComment}
                  onChange={(e) => setMComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-purple-200 bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="主管簽名"
                  value={reviewerSign}
                  onChange={(e) => setReviewerSign(e.target.value)}
                  className="w-28 px-2 py-2 text-xs font-semibold text-center rounded-lg border border-purple-200 bg-white"
                />
                <button
                  onClick={handleManagerReviewSubmit}
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex-1 shadow-xs"
                >
                  確認評核送最高主管
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Panel: 部門最高主管核定 */}
        {canTopApprove && (
          <div className="p-5 bg-indigo-50/80 border-b border-indigo-200 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              【部門最高主管核定】請檢閱受訓成效與評核意見並完成最終核可：
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="部門最高主管意見及評語（例如：核准，請列入下半年度專案改善實施）"
                  value={topComment}
                  onChange={(e) => setTopComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-indigo-200 bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="最高主管簽名"
                  value={approverSign}
                  onChange={(e) => setApproverSign(e.target.value)}
                  className="w-28 px-2 py-2 text-xs font-semibold text-center rounded-lg border border-indigo-200 bg-white"
                />
                <button
                  onClick={handleTopManagerApproveSubmit}
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex-1 shadow-xs"
                >
                  最終核准結案
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Body - Replicating exact Word Table Format */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center pb-2 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 tracking-wider">外 訓 心 得 報 告</h2>
          </div>

          {/* Form Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
            {/* Header info rows */}
            <div className="grid grid-cols-6 border-b border-slate-300">
              <div className="p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">
                單 位
              </div>
              <div className="p-3 border-r border-slate-300 text-slate-900 font-semibold">{report.dept}</div>
              <div className="p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">
                課程名稱
              </div>
              <div className="p-3 border-r border-slate-300 text-slate-900 font-semibold">{report.courseName}</div>
              <div className="p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">
                填表日期
              </div>
              <div className="p-3 text-slate-800 font-medium">{report.reportDate}</div>
            </div>

            <div className="grid grid-cols-6 border-b border-slate-300">
              <div className="p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">
                姓 名
              </div>
              <div className="p-3 border-r border-slate-300 text-slate-900 font-semibold">
                {report.empName} ({report.empId})
              </div>
              <div className="p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">
                日 期
              </div>
              <div className="p-3 border-r border-slate-300 text-slate-800">
                {report.startDate} ~ {report.endDate}
              </div>
              <div className="p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">
                時 數
              </div>
              <div className="p-3 text-slate-800 font-medium">{report.totalHours} 小時</div>
            </div>

            <div className="grid grid-cols-6 border-b border-slate-300">
              <div className="p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">
                訓練機構
              </div>
              <div className="col-span-2 p-3 border-r border-slate-300 text-slate-800">{report.orgName}</div>
              <div className="p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">
                講 師
              </div>
              <div className="col-span-2 p-3 text-slate-800">{report.lecturerName}</div>
            </div>

            {/* Questions Section */}
            <div className="border-b border-slate-300 bg-slate-50 p-2.5 font-bold text-slate-700">
              意見選擇 (請勾選)︰
            </div>

            {/* Q1 */}
            <div className="grid grid-cols-12 border-b border-slate-300 items-center">
              <div className="col-span-7 p-3 border-r border-slate-300 font-medium text-slate-800">
                1. 您認為本課程配合工作實際需要程度為何？
              </div>
              <div className="col-span-5 p-3 flex flex-wrap gap-3">
                {["非常需要", "需要", "尚可", "很少"].map((opt) => (
                  <label key={opt} className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="q1"
                      checked={q1 === opt}
                      disabled={report.status !== "DRAFT"}
                      onChange={() => setQ1(opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Q2 */}
            <div className="grid grid-cols-12 border-b border-slate-300 items-center">
              <div className="col-span-7 p-3 border-r border-slate-300 font-medium text-slate-800">
                2. 您認為本課程對您在工作上幫助程度如何？
              </div>
              <div className="col-span-5 p-3 flex flex-wrap gap-3">
                {["非常佳", "佳", "尚可", "很少"].map((opt) => (
                  <label key={opt} className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="q2"
                      checked={q2 === opt}
                      disabled={report.status !== "DRAFT"}
                      onChange={() => setQ2(opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Q3 */}
            <div className="grid grid-cols-12 border-b border-slate-300 items-center">
              <div className="col-span-7 p-3 border-r border-slate-300 font-medium text-slate-800">
                3. 您認為訓練機構所提供之服務如何？
              </div>
              <div className="col-span-5 p-3 flex flex-wrap gap-3">
                {["非常佳", "佳", "尚可", "不佳"].map((opt) => (
                  <label key={opt} className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="q3"
                      checked={q3 === opt}
                      disabled={report.status !== "DRAFT"}
                      onChange={() => setQ3(opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Q4 */}
            <div className="grid grid-cols-12 border-b border-slate-300 items-center">
              <div className="col-span-7 p-3 border-r border-slate-300 font-medium text-slate-800">
                4. 您對本課程的講師教授方式接受程度如何？
              </div>
              <div className="col-span-5 p-3 flex flex-wrap gap-3">
                {["非常佳", "佳", "尚可", "不能接受"].map((opt) => (
                  <label key={opt} className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="q4"
                      checked={q4 === opt}
                      disabled={report.status !== "DRAFT"}
                      onChange={() => setQ4(opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Q5 */}
            <div className="grid grid-cols-12 border-b border-slate-300 items-center">
              <div className="col-span-7 p-3 border-r border-slate-300 font-medium text-slate-800">
                5. 您對本課程內容瞭解程度？
              </div>
              <div className="col-span-5 p-3 flex flex-wrap gap-3">
                {["非常瞭解", "瞭解", "尚可", "不瞭解"].map((opt) => (
                  <label key={opt} className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="q5"
                      checked={q5 === opt}
                      disabled={report.status !== "DRAFT"}
                      onChange={() => setQ5(opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Learning Points */}
            <div className="border-b border-slate-300 p-4 space-y-2">
              <div className="font-bold text-slate-800">
                授課主要內容或學習到什麼(觀念、方法、技巧…等)? (至少3點) *
              </div>
              {report.status === "DRAFT" ? (
                <textarea
                  rows={4}
                  required
                  placeholder="請列出至少3點學習觀念、技術或技巧..."
                  value={learningPoints}
                  onChange={(e) => setLearningPoints(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {report.learningPoints || "(未填寫)"}
                </div>
              )}
            </div>

            {/* Action Plan */}
            <div className="border-b border-slate-300 p-4 space-y-2">
              <div className="font-bold text-slate-800">
                課程內容如何運用於工作︰提出具體改善及提昇才能的行動計畫、作法。 *
              </div>
              {report.status === "DRAFT" ? (
                <textarea
                  rows={4}
                  required
                  placeholder="請具體說明將如何將所學落實於日常工作或專案改善..."
                  value={actionPlan}
                  onChange={(e) => setActionPlan(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <div className="p-3 bg-slate-50 rounded-lg text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {report.actionPlan || "(未填寫)"}
                </div>
              )}
            </div>

            {/* Manager Evaluation View Section */}
            <div className="border-b border-slate-300 bg-purple-50/20 p-4 space-y-2">
              <div className="font-bold text-purple-950">
                審核主管評核 (請勾選)︰
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-800">
                <div>
                  <span className="font-medium text-slate-500 block">1. 心得內容：</span>
                  <span className="font-bold">{report.managerReview1 || "尚未評核"}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-500 block">2. 行動計畫作法：</span>
                  <span className="font-bold">{report.managerReview2 || "尚未評核"}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-500 block">3. 綜合評價：</span>
                  <span className="font-bold text-purple-700">{report.managerReview3 || "尚未評核"}</span>
                </div>
              </div>
              <div className="pt-2">
                <span className="font-medium text-slate-500 block">4. 其他意見及評語︰</span>
                <div className="p-2.5 bg-white border border-slate-200 rounded text-slate-800 italic">
                  {report.managerComment || "(主管尚無其他意見)"}
                </div>
              </div>
            </div>

            {/* Top Manager Evaluation View Section */}
            <div className="border-b border-slate-300 bg-indigo-50/20 p-4 space-y-2">
              <div className="font-bold text-indigo-950">
                部門最高主管評核 (填寫意見及評語)︰
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded text-slate-800 italic">
                {report.topManagerComment || "(部門最高主管尚無論述)"}
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 divide-x divide-slate-300 bg-slate-50 text-center font-medium">
              <div className="p-4 space-y-1">
                <div className="text-slate-400 text-[10px]">報 告 者</div>
                <div className="text-base font-bold text-slate-900">{report.reporterSign || report.empName}</div>
                <div className="text-[10px] text-slate-400">{report.reportDate}</div>
              </div>
              <div className="p-4 space-y-1">
                <div className="text-slate-400 text-[10px]">審 核 (單位主管)</div>
                <div className="text-base font-bold text-purple-700">
                  {report.reviewerSign || <span className="text-slate-400 font-normal">待評核</span>}
                </div>
                {report.reviewedAt && <div className="text-[10px] text-slate-400">{report.reviewedAt}</div>}
              </div>
              <div className="p-4 space-y-1">
                <div className="text-slate-400 text-[10px]">核 准 (最高主管)</div>
                <div className="text-base font-bold text-indigo-700">
                  {report.approverSign || <span className="text-slate-400 font-normal">待核准</span>}
                </div>
                {report.approvedAt && <div className="text-[10px] text-slate-400">{report.approvedAt}</div>}
              </div>
            </div>
          </div>

          {/* If DRAFT & Author: Submit Button */}
          {report.status === "DRAFT" && isAuthor && (
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-bold text-purple-900 block text-xs">心得填寫完畢數位簽名確認</span>
                <span className="text-[11px] text-purple-600">提交後自動產生 Word 報告並轉呈單位主管進行評核</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="學員簽名"
                  value={reporterSign}
                  onChange={(e) => setReporterSign(e.target.value)}
                  className="w-28 px-3 py-2 text-xs border border-purple-300 rounded-lg font-bold text-center bg-white"
                />
                <button
                  onClick={handleStudentSubmit}
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2 rounded-lg text-xs shadow-md transition-all"
                >
                  {isSubmitting ? "產生 Word 中..." : "提交心得報告"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
