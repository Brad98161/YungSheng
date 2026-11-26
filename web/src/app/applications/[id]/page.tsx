"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { TrainingApplication, QuoteItem } from "@/types";
import {
  FileText,
  ArrowLeft,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Check,
  X,
  Sparkles,
  Building2,
  Calendar,
  DollarSign
} from "lucide-react";

export default function ApplicationDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { currentUser, refreshPendingCounts } = useAuth();

  const [app, setApp] = useState<TrainingApplication | null>(null);
  const [loading, setLoading] = useState(true);

  // 審核簽核輸入
  const [signName, setSignName] = useState(currentUser?.name || "");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // HR 詢價輸入
  const [quoteOrg, setQuoteOrg] = useState("");
  const [quoteCost, setQuoteCost] = useState("");
  const [quoteLocation, setQuoteLocation] = useState("");
  const [quoteComment, setQuoteComment] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch(`/api/applications/${id}`);
      if (res.ok) {
        const data = await res.json();
        setApp(data);
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

  useEffect(() => {
    if (currentUser) {
      setSignName(currentUser.name);
    }
  }, [currentUser]);

  const handleAction = async (action: string) => {
    if (!signName.trim()) {
      alert("請輸入簽名人姓名");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reviewerId: currentUser?.id,
          reviewerSign: signName,
          comment
        })
      });

      if (res.ok) {
        await loadData();
        await refreshPendingCounts();
        setComment("");
        alert("簽核成功！Word 附件已自動同步回寫最新簽核資訊。");
      } else {
        alert("簽核失敗，請確認權限或重試");
      }
    } catch (err) {
      console.error(err);
      alert("網路連線錯誤");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddQuote = async () => {
    if (!quoteOrg.trim() || !quoteCost.trim()) {
      alert("請填寫機構名稱與課程費用");
      return;
    }
    setIsSubmitting(true);
    try {
      const newQuotes: QuoteItem[] = [
        ...(app?.quoteRows || []),
        {
          orgOrLecturer: quoteOrg,
          cost: quoteCost,
          location: quoteLocation || "台北培訓中心",
          comment: quoteComment || "課程內容合規，建議採用",
          hrSign: signName || "林專員"
        }
      ];

      const res = await fetch(`/api/applications/${id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "HR_QUOTE",
          reviewerId: currentUser?.id,
          reviewerSign: signName,
          quoteRows: newQuotes
        })
      });

      if (res.ok) {
        await loadData();
        setQuoteOrg("");
        setQuoteCost("");
        setQuoteLocation("");
        setQuoteComment("");
        alert("詢議價說明已更新並同步至 Word 附件！");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400">載入中...</div>;
  }

  if (!app) {
    return <div className="text-center py-20 text-slate-500">找不到該申請單</div>;
  }

  // 權限判斷
  const canUnitReview =
    currentUser?.role === "MANAGER" || currentUser?.role === "ADMIN";
  const canHrApprove =
    currentUser?.role === "HR_MANAGER" || currentUser?.role === "ADMIN";
  const canHrStaffAction =
    currentUser?.role === "HR_STAFF" || currentUser?.role === "HR_MANAGER" || currentUser?.role === "ADMIN";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回申請列表
        </Link>
        <div className="flex items-center gap-3">
          {app.wordDocUrl && (
            <a
              href={app.wordDocUrl}
              download
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all hover:shadow"
            >
              <Download className="w-4 h-4" />
              下載主管簽核 Word 附件 (RE-SOP-003-04)
            </a>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner with Status */}
        <div className="bg-slate-900 px-6 py-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-blue-600 text-white px-2 py-0.5 rounded">
                RE-SOP-003-04
              </span>
              <span className="text-xs text-slate-300 font-mono">單號：{app.id}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight mt-1">{app.courseName}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              申請人：{app.applicantName} ({app.dept}) · 申請日：{app.applyDate} · {app.trainingType}
            </p>
          </div>

          <div>
            {app.status === "APPROVED" && (
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                已核准成案
              </div>
            )}
            {app.status === "PENDING_UNIT_REVIEW" && (
              <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
                <Clock className="w-4 h-4 text-blue-400" />
                待單位主管審核
              </div>
            )}
            {app.status === "PENDING_HR_REVIEW" && (
              <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
                <Clock className="w-4 h-4 text-purple-400" />
                待人資主管核准
              </div>
            )}
            {app.status === "REJECTED" && (
              <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                退回修正
              </div>
            )}
          </div>
        </div>

        {/* Action Panel for Current Role */}
        {app.status === "PENDING_UNIT_REVIEW" && canUnitReview && (
          <div className="p-5 bg-blue-50/80 border-b border-blue-200">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-900 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              【主管線上簽核】您為單位主管，請審核本項教育訓練申請：
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="填寫審核意見（例如：符合部門下半年技能培育重點，同意送件）"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="主管簽名"
                  value={signName}
                  onChange={(e) => setSignName(e.target.value)}
                  className="w-28 px-2 py-2 text-xs font-semibold text-center rounded-lg border border-blue-200 bg-white"
                />
                <button
                  onClick={() => handleAction("UNIT_REVIEW")}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-xs transition-colors flex-1"
                >
                  審核通過送人資
                </button>
                <button
                  onClick={() => handleAction("REJECT")}
                  disabled={isSubmitting}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-2 rounded-lg text-xs border border-rose-200 transition-colors"
                >
                  退回
                </button>
              </div>
            </div>
          </div>
        )}

        {app.status === "PENDING_HR_REVIEW" && canHrApprove && (
          <div className="p-5 bg-purple-50/80 border-b border-purple-200">
            <div className="flex items-center gap-2 text-sm font-bold text-purple-900 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              【人資主管核准】請確認預算與訓練計畫合規性：
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="填寫核准意見（例如：預算已核可，准予報名辦理）"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-purple-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="人資主管簽名"
                  value={signName}
                  onChange={(e) => setSignName(e.target.value)}
                  className="w-28 px-2 py-2 text-xs font-semibold text-center rounded-lg border border-purple-200 bg-white"
                />
                <button
                  onClick={() => handleAction("HR_APPROVE")}
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-xs transition-colors flex-1"
                >
                  最終核准成案
                </button>
                <button
                  onClick={() => handleAction("REJECT")}
                  disabled={isSubmitting}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-2 rounded-lg text-xs border border-rose-200 transition-colors"
                >
                  退回
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Body - Replicating exact Word Table Format */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center pb-2 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 tracking-wider">教 育 訓 練 申 請 表</h2>
            <div className="text-[11px] text-slate-400 mt-1">
              標準流程：申請人填寫 $\rightarrow$ 單位主管審核 $\rightarrow$ 人資部主管核准 $\rightarrow$ 人資承辦人員
            </div>
          </div>

          {/* Table Container */}
          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
            {/* Row 0 */}
            <div className="grid grid-cols-2 border-b border-slate-300 bg-slate-50 font-medium">
              <div className="p-3 border-r border-slate-300">
                申請日期： <span className="font-bold text-slate-800">{app.applyDate}</span>
              </div>
              <div className="p-3 flex items-center gap-4">
                <span>{app.trainingType === "內訓" ? "■" : "□"} 內訓</span>
                <span>{app.trainingType === "外訓" ? "■" : "□"} 外訓</span>
              </div>
            </div>

            {/* Row 1: Course Name */}
            <div className="grid grid-cols-6 border-b border-slate-300">
              <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 flex items-center">
                課程名稱
              </div>
              <div className="col-span-5 p-3 text-slate-900 font-semibold">{app.courseName}</div>
            </div>

            {/* Row 2: Course Content */}
            <div className="grid grid-cols-6 border-b border-slate-300">
              <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 flex items-center">
                受訓內容
              </div>
              <div className="col-span-5 p-3 text-slate-800 whitespace-pre-wrap">{app.courseContent}</div>
            </div>

            {/* Row 3: Course Objective */}
            <div className="grid grid-cols-6 border-b border-slate-300">
              <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 flex items-center">
                課程目標
              </div>
              <div className="col-span-5 p-3 text-slate-800 whitespace-pre-wrap">{app.courseObjective}</div>
            </div>

            {/* 內訓專屬區塊 */}
            {app.trainingType === "內訓" && (
              <>
                <div className="grid grid-cols-6 border-b border-slate-300 bg-cyan-50/20">
                  <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">
                    內訓 · 受訓對象
                  </div>
                  <div className="col-span-2 p-3 border-r border-slate-300 font-medium">{app.targetAudience}</div>
                  <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">
                    預計人數 / 費用
                  </div>
                  <div className="col-span-2 p-3 font-medium">
                    {app.expectedTrainees} 人 / NT$ {app.internalCost || 0}
                  </div>
                </div>

                <div className="grid grid-cols-6 border-b border-slate-300 bg-cyan-50/20">
                  <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">
                    講師資料
                  </div>
                  <div className="col-span-5 p-3">
                    <span className="font-semibold text-slate-800">{app.lecturerType}講師：</span>
                    <span className="ml-2 font-bold text-slate-900">{app.lecturerName}</span>
                    <span className="ml-2 text-slate-500">
                      ({app.lecturerOrg} · {app.lecturerTitle})
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* 外訓專屬區塊 */}
            {app.trainingType === "外訓" && (
              <>
                <div className="grid grid-cols-6 border-b border-slate-300 bg-indigo-50/20">
                  <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 flex items-center">
                    外訓 · 受訓人員
                  </div>
                  <div className="col-span-5 p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {app.trainees &&
                        app.trainees.map((t, idx) => (
                          <div key={t.empId} className="bg-white p-2 rounded border border-slate-200">
                            <span className="font-bold text-slate-800">
                              {idx + 1}. {t.name}
                            </span>{" "}
                            <span className="text-slate-400 font-mono">({t.empId})</span>
                            <div className="text-[11px] text-slate-500">
                              {t.dept} · {t.title}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-6 border-b border-slate-300">
                  <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">
                    訓後繳交 / 附件
                  </div>
                  <div className="col-span-5 p-3 space-y-1.5">
                    <div>
                      <span className="font-semibold text-slate-700">應繳資料：</span>
                      {["外訓心得報告", "課程教材", "證書或證照", "其他", "無"].map((opt) => (
                        <span key={opt} className="mr-3">
                          {app.returnDocs?.includes(opt) ? "■ " : "□ "}
                          {opt}
                          {opt === "其他" && app.returnDocs?.includes("其他") && app.returnDocsOther && (
                            <span className="text-indigo-700 font-bold ml-1 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                              （{app.returnDocsOther}）
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">檢附附件：</span>
                      {["課程簡章", "報名表", "匯款資訊", "其他", "無"].map((opt) => (
                        <span key={opt} className="mr-3">
                          {app.attachments?.includes(opt) ? "■ " : "□ "}
                          {opt}
                          {opt === "其他" && app.attachments?.includes("其他") && app.attachmentsOther && (
                            <span className="text-indigo-700 font-bold ml-1 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                              （{app.attachmentsOther}）
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-6 border-b border-slate-300 bg-indigo-50/10">
                  <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">
                    主管要求重點
                  </div>
                  <div className="col-span-5 p-3">
                    {app.transferType === "TRANSFER" || app.transferInternal ? (
                      <span className="text-indigo-800 font-medium">
                        ■ 轉訓，建議轉內訓時限： <u>{app.transferWeeks}</u> 週內，講師：{" "}
                        <u>{app.transferLecturer}</u>
                      </span>
                    ) : app.transferType === "OTHER" || app.transferOther ? (
                      <span className="text-indigo-800 font-medium">
                        ■ 其他主管要求：{" "}
                        <span className="font-bold underline text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
                          {app.transferOther}
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-600">■ 不轉訓</span>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 人資詢議價說明 */}
            <div className="border-b border-slate-300 bg-amber-50/30">
              <div className="p-2.5 bg-amber-100/60 font-bold text-amber-900 border-b border-slate-300 flex items-center justify-between">
                <span>外訓機構、外聘內訓講師詢議價說明 (人資人員填寫)</span>
                {canHrStaffAction && (
                  <span className="text-[11px] font-normal text-amber-700">可登錄比價與採用說明</span>
                )}
              </div>

              {app.quoteRows && app.quoteRows.length > 0 ? (
                <div className="p-3 divide-y divide-slate-200">
                  {app.quoteRows.map((q, qIdx) => (
                    <div key={qIdx} className="py-2 grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[10px]">機構 / 講師</span>
                        <span className="font-bold text-slate-800">{q.orgOrLecturer}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">課程費用</span>
                        <span className="font-bold text-blue-700">NT$ {q.cost}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">地點</span>
                        <span className="text-slate-700">{q.location}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">建議採用說明 / 人資簽核</span>
                        <span className="text-slate-700">{q.comment} ({q.hrSign})</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-slate-400 text-center">尚無詢議價登錄資料</div>
              )}

              {/* HR Staff Input Row */}
              {canHrStaffAction && (
                <div className="p-3 bg-white border-t border-slate-200">
                  <div className="text-xs font-bold text-slate-700 mb-2">+ 登錄 / 補充詢議價說明：</div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="培訓機構或講師名稱"
                      value={quoteOrg}
                      onChange={(e) => setQuoteOrg(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                    <input
                      type="number"
                      placeholder="費用 (新台幣)"
                      value={quoteCost}
                      onChange={(e) => setQuoteCost(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="培訓地點"
                      value={quoteLocation}
                      onChange={(e) => setQuoteLocation(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded text-xs"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="採用原因說明"
                        value={quoteComment}
                        onChange={(e) => setQuoteComment(e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-300 rounded text-xs flex-1"
                      />
                      <button
                        onClick={handleAddQuote}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded text-xs"
                      >
                        新增
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Time & Plan */}
            <div className="p-3 border-b border-slate-300">
              受訓時間︰ <u>{app.startDate}</u> 起至 <u>{app.endDate}</u> 止，共 <u>{app.totalDays}</u> 天(總時數{" "}
              <u>{app.totalHours}</u> 小時) &nbsp;&nbsp;
              <span>{app.isAnnualPlan ? "■" : "□"} 年度計畫內課程</span> &nbsp;&nbsp;
              <span>{!app.isAnnualPlan ? "■" : "□"} 非年度計畫內課程</span>
            </div>

            {/* Notes */}
            <div className="grid grid-cols-6 border-b border-slate-300">
              <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">
                備 註
              </div>
              <div className="col-span-5 p-3 text-slate-700">{app.notes || "(無備註)"}</div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 divide-x divide-slate-300 bg-slate-50 text-center font-medium">
              <div className="p-4 space-y-1">
                <div className="text-slate-400 text-[10px]">申 請 人</div>
                <div className="text-base font-bold text-slate-900">{app.applicantSign || app.applicantName}</div>
                <div className="text-[10px] text-slate-400">{app.applyDate}</div>
              </div>
              <div className="p-4 space-y-1">
                <div className="text-slate-400 text-[10px]">單 位 主 管 (審核)</div>
                <div className="text-base font-bold text-blue-700">
                  {app.reviewerSign || <span className="text-slate-400 font-normal">待審核</span>}
                </div>
                {app.reviewerComment && (
                  <div className="text-[11px] text-slate-500 italic mt-1">「{app.reviewerComment}」</div>
                )}
                {app.reviewedAt && <div className="text-[10px] text-slate-400">{app.reviewedAt}</div>}
              </div>
              <div className="p-4 space-y-1">
                <div className="text-slate-400 text-[10px]">人 資 部 主 管 (核准)</div>
                <div className="text-base font-bold text-purple-700">
                  {app.approverSign || <span className="text-slate-400 font-normal">待核准</span>}
                </div>
                {app.approverComment && (
                  <div className="text-[11px] text-slate-500 italic mt-1">「{app.approverComment}」</div>
                )}
                {app.approvedAt && <div className="text-[10px] text-slate-400">{app.approvedAt}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
