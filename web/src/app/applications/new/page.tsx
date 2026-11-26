"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  FileText,
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { TraineeItem } from "@/types";

export default function NewApplicationPage() {
  const router = useRouter();
  const { currentUser, users } = useAuth();

  const [trainingType, setTrainingType] = useState<"內訓" | "外訓">("外訓");
  const [courseName, setCourseName] = useState("");
  const [courseContent, setCourseContent] = useState("");
  const [courseObjective, setCourseObjective] = useState("");
  const [isAnnualPlan, setIsAnnualPlan] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalDays, setTotalDays] = useState("1");
  const [totalHours, setTotalHours] = useState("7");
  const [notes, setNotes] = useState("");

  // 內訓欄位
  const [targetAudience, setTargetAudience] = useState("");
  const [expectedTrainees, setExpectedTrainees] = useState("15");
  const [internalCost, setInternalCost] = useState("0");
  const [lecturerType, setLecturerType] = useState<"內聘" | "外聘">("內聘");
  const [lecturerName, setLecturerName] = useState("");
  const [lecturerOrg, setLecturerOrg] = useState("");
  const [lecturerTitle, setLecturerTitle] = useState("");

  // 外訓欄位
  const [trainees, setTrainees] = useState<TraineeItem[]>([
    {
      empId: currentUser?.id || "EMP001",
      name: currentUser?.name || "張大同",
      dept: currentUser?.department || "技術工程部",
      title: currentUser?.title || "資深軟體工程師"
    }
  ]);
  const [returnDocs, setReturnDocs] = useState<string[]>(["外訓心得報告", "課程教材"]);
  const [returnDocsOther, setReturnDocsOther] = useState("");
  const [attachments, setAttachments] = useState<string[]>(["課程簡章", "報名表"]);
  const [attachmentsOther, setAttachmentsOther] = useState("");
  const [transferType, setTransferType] = useState<"TRANSFER" | "NO_TRANSFER" | "OTHER">("TRANSFER");
  const [transferInternal, setTransferInternal] = useState(true);
  const [transferWeeks, setTransferWeeks] = useState("3");
  const [transferLecturer, setTransferLecturer] = useState(currentUser?.name || "");
  const [transferOther, setTransferOther] = useState("");

  // 申請人簽章
  const [applicantSign, setApplicantSign] = useState(currentUser?.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTrainee = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    if (trainees.some((t) => t.empId === user.id)) return;
    setTrainees([
      ...trainees,
      {
        empId: user.id,
        name: user.name,
        dept: user.department,
        title: user.title
      }
    ]);
  };

  const handleRemoveTrainee = (empId: string) => {
    setTrainees(trainees.filter((t) => t.empId !== empId));
  };

  const toggleCheckbox = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) {
      alert("請輸入課程名稱");
      return;
    }
    if (!applicantSign.trim()) {
      alert("請於申請人欄位完成線上簽名");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        applicantId: currentUser?.id,
        applicantName: currentUser?.name,
        dept: currentUser?.department,
        trainingType,
        courseName,
        courseContent,
        courseObjective,
        isAnnualPlan,
        startDate,
        endDate,
        totalDays,
        totalHours,
        notes,
        targetAudience,
        expectedTrainees,
        internalCost,
        lecturerType,
        lecturerName,
        lecturerOrg,
        lecturerTitle,
        trainees,
        returnDocs,
        returnDocsOther,
        attachments,
        attachmentsOther,
        transferInternal: transferType === "TRANSFER",
        transferType,
        transferWeeks,
        transferLecturer,
        transferOther,
        applicantSign,
        status: "PENDING_UNIT_REVIEW"
      };

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        router.push(`/applications/${created.id}`);
      } else {
        alert("提交失敗，請重試");
      }
    } catch (err) {
      console.error(err);
      alert("系統連線錯誤");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top back */}
      <div className="flex items-center justify-between">
        <Link
          href="/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回申請列表
        </Link>
        <div className="text-xs text-slate-400 font-mono">RE-SOP-003-04 標準版</div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Title Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-blue-200 bg-blue-900/60 px-2 py-0.5 rounded">
              訓前作業表單
            </span>
            <h1 className="text-xl font-bold tracking-tight mt-1">填寫教育訓練申請表</h1>
            <p className="text-xs text-blue-100 mt-0.5">送簽後系統將自動將所有資料填入原始 Word 附件供主管下載與審核</p>
          </div>
          <FileText className="w-8 h-8 opacity-40" />
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          {/* Section 1: 基本與類別 */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              1. 申請人與訓練性質
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <label className="text-xs text-slate-500 block">申請人</label>
                <div className="text-sm font-semibold text-slate-800 mt-1">
                  {currentUser?.name} <span className="text-xs text-slate-400">({currentUser?.id})</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 block">服務單位 / 職稱</label>
                <div className="text-sm font-semibold text-slate-800 mt-1">
                  {currentUser?.department} / {currentUser?.title}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 block">申請日期</label>
                <div className="text-sm font-semibold text-slate-800 mt-1">
                  {new Date().toISOString().slice(0, 10).replace(/-/g, " / ")}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">訓練性質（請選擇）*</label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  type="button"
                  onClick={() => setTrainingType("外訓")}
                  className={`p-3 rounded-xl border text-center text-sm font-bold transition-all ${
                    trainingType === "外訓"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  外訓（派員至外部受訓）
                </button>
                <button
                  type="button"
                  onClick={() => setTrainingType("內訓")}
                  className={`p-3 rounded-xl border text-center text-sm font-bold transition-all ${
                    trainingType === "內訓"
                      ? "bg-cyan-50 border-cyan-500 text-cyan-700 shadow-xs"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  內訓（公司內部開班）
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: 課程內容與目標 */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              2. 課程資訊與目標
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">課程名稱 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：企業級生成式 AI 實務應用工作坊"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">受訓內容 *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="請簡述課程核心綱要與技術要點"
                  value={courseContent}
                  onChange={(e) => setCourseContent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">課程目標 *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="請具體說明此課程預期達成的效益或欲解決之工作痛點"
                  value={courseObjective}
                  onChange={(e) => setCourseObjective(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: 依類別動態切換欄位 */}
          {trainingType === "內訓" ? (
            <div className="space-y-4 bg-cyan-50/50 p-5 rounded-2xl border border-cyan-100">
              <h2 className="text-sm font-bold text-cyan-900 border-l-4 border-cyan-600 pl-3">
                3. 內訓專屬開課與講師資訊
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">受訓對象</label>
                  <input
                    type="text"
                    placeholder="例如：全體研發工程師"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">預計受訓人數</label>
                  <input
                    type="number"
                    value={expectedTrainees}
                    onChange={(e) => setExpectedTrainees(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">課程費用 (新台幣)</label>
                  <input
                    type="number"
                    value={internalCost}
                    onChange={(e) => setInternalCost(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-cyan-200/60">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-xs font-semibold text-slate-700">講師性質：</span>
                  <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="lecturerType"
                      checked={lecturerType === "內聘"}
                      onChange={() => setLecturerType("內聘")}
                    />
                    內聘講師
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="lecturerType"
                      checked={lecturerType === "外聘"}
                      onChange={() => setLecturerType("外聘")}
                    />
                    外聘講師
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">講師姓名</label>
                    <input
                      type="text"
                      placeholder="姓名"
                      value={lecturerName}
                      onChange={(e) => setLecturerName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">服務單位(機構)</label>
                    <input
                      type="text"
                      placeholder="公司或機構名稱"
                      value={lecturerOrg}
                      onChange={(e) => setLecturerOrg(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">職稱</label>
                    <input
                      type="text"
                      placeholder="講師職稱"
                      value={lecturerTitle}
                      onChange={(e) => setLecturerTitle(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100">
              <h2 className="text-sm font-bold text-indigo-900 border-l-4 border-indigo-600 pl-3">
                3. 外訓專屬受訓人員與訓後要求
              </h2>

              {/* Trainee Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-800">
                    受訓人員名冊 (最多 6 名同仁合填)
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddTrainee(e.target.value);
                          e.target.value = "";
                        }
                      }}
                      className="text-xs border border-slate-300 rounded-lg px-2 py-1 bg-white"
                    >
                      <option value="">+ 從員工名冊加入同仁</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.department} · {u.title})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                  {trainees.map((t, idx) => (
                    <div key={t.empId} className="px-4 py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800">{t.name}</span>
                        <span className="text-slate-400 font-mono">({t.empId})</span>
                        <span className="text-slate-500">
                          {t.dept} · {t.title}
                        </span>
                      </div>
                      {trainees.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTrainee(t.empId)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Return docs & attachments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
                  <label className="text-xs font-semibold text-slate-700 block mb-2">
                    訓後應繳交資料 (勾選)
                  </label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {["外訓心得報告", "課程教材", "證書或證照", "其他", "無"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleCheckbox(returnDocs, setReturnDocs, opt)}
                        className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                          returnDocs.includes(opt)
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-white"
                        }`}
                      >
                        {returnDocs.includes(opt) ? "■ " : "□ "}
                        {opt}
                      </button>
                    ))}
                  </div>
                  {returnDocs.includes("其他") && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold mb-1">
                        <span>請說明其他訓後應繳交資料：</span>
                      </div>
                      <input
                        type="text"
                        placeholder="例如：課程錄音檔、大會投影片、原廠技術手冊等"
                        value={returnDocsOther}
                        onChange={(e) => setReturnDocsOther(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 text-xs bg-indigo-50/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
                  <label className="text-xs font-semibold text-slate-700 block mb-2">
                    檢附附件 (勾選)
                  </label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {["課程簡章", "報名表", "匯款資訊", "其他", "無"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleCheckbox(attachments, setAttachments, opt)}
                        className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                          attachments.includes(opt)
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-white"
                        }`}
                      >
                        {attachments.includes(opt) ? "■ " : "□ "}
                        {opt}
                      </button>
                    ))}
                  </div>
                  {attachments.includes("其他") && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold mb-1">
                        <span>請說明其他檢附附件：</span>
                      </div>
                      <input
                        type="text"
                        placeholder="例如：研討會邀請函、原廠培訓公文、早鳥繳費證明等"
                        value={attachmentsOther}
                        onChange={(e) => setAttachmentsOther(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 text-xs bg-indigo-50/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Transfer request */}
              <div className="pt-3 border-t border-indigo-100 space-y-2.5 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold text-slate-700">主管要求學習重點：</span>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="transfer"
                      checked={transferType === "TRANSFER"}
                      onChange={() => setTransferType("TRANSFER")}
                    />
                    轉訓
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer ml-2">
                    <input
                      type="radio"
                      name="transfer"
                      checked={transferType === "NO_TRANSFER"}
                      onChange={() => setTransferType("NO_TRANSFER")}
                    />
                    不轉訓
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer ml-2">
                    <input
                      type="radio"
                      name="transfer"
                      checked={transferType === "OTHER"}
                      onChange={() => setTransferType("OTHER")}
                    />
                    其他
                  </label>
                </div>

                {transferType === "TRANSFER" && (
                  <div className="p-2.5 bg-white rounded-lg border border-indigo-100 flex flex-wrap items-center gap-2">
                    <span className="text-slate-600">建議轉內訓時限：</span>
                    <input
                      type="text"
                      className="w-12 px-2 py-1 border border-slate-300 rounded text-center bg-white text-xs"
                      value={transferWeeks}
                      onChange={(e) => setTransferWeeks(e.target.value)}
                    />
                    <span className="text-slate-600">週內，指定講師：</span>
                    <input
                      type="text"
                      className="w-28 px-2 py-1 border border-slate-300 rounded text-center bg-white text-xs"
                      value={transferLecturer}
                      onChange={(e) => setTransferLecturer(e.target.value)}
                      placeholder="姓名"
                    />
                  </div>
                )}

                {transferType === "OTHER" && (
                  <div className="p-2.5 bg-white rounded-lg border border-indigo-100 flex items-center gap-2">
                    <span className="text-slate-600 shrink-0">其他學習要求說明：</span>
                    <input
                      type="text"
                      className="flex-1 px-3 py-1 border border-indigo-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={transferOther}
                      onChange={(e) => setTransferOther(e.target.value)}
                      placeholder="例如：受訓後於部門週會分享技術導入可行性報告"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 4: 受訓時間與計畫類別 */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              4. 受訓時程與計畫性質
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-slate-600 block mb-1">開始日期</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">結束日期</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">共計天數</label>
                <input
                  type="number"
                  required
                  value={totalDays}
                  onChange={(e) => setTotalDays(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">總時數 (小時)</label>
                <input
                  type="number"
                  required
                  value={totalHours}
                  onChange={(e) => setTotalHours(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs pt-1">
              <span className="font-semibold text-slate-700">訓練計畫性質：</span>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="annualPlan"
                  checked={isAnnualPlan}
                  onChange={() => setIsAnnualPlan(true)}
                />
                年度計畫內課程
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="annualPlan"
                  checked={!isAnnualPlan}
                  onChange={() => setIsAnnualPlan(false)}
                />
                非年度計畫內課程 (參訓原因請填寫於備註)
              </label>
            </div>

            <div>
              <label className="text-xs text-slate-600 block mb-1">備註說明</label>
              <input
                type="text"
                placeholder="例如：參訓原因、公出假單單號或特殊報名事項"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Section 5: 申請人線上簽章與送簽 */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="text-xs font-bold text-slate-800 block">申請人數位簽署 *</label>
              <p className="text-[11px] text-slate-500 mt-0.5">
                送簽即自動產生 SOP-003-04 官方 Word 附件並流轉至單位主管審核
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                required
                placeholder="輸入姓名確認簽章"
                value={applicantSign}
                onChange={(e) => setApplicantSign(e.target.value)}
                className="w-36 px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-center bg-white"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg text-sm shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? "生成 Word 中..." : "送出申請單"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
