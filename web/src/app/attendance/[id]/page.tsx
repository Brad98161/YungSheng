"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AttendanceRecord, AttendanceStudent } from "@/types";
import QRCodeLib from "qrcode";
import {
  UserCheck,
  ArrowLeft,
  Download,
  QrCode,
  CheckCircle2,
  XCircle,
  Plus,
  Save,
  Check,
  Sparkles,
  ExternalLink
} from "lucide-react";

export default function AttendanceDetailPage() {
  const { id } = useParams() as { id: string };
  const { currentUser, users } = useAuth();

  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // 講師簽名
  const [lecturerSign, setLecturerSign] = useState("");
  // 快速新增學員
  const [selectedUserId, setSelectedUserId] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch(`/api/attendance/${id}`);
      if (res.ok) {
        const data: AttendanceRecord = await res.json();
        setRecord(data);
        setLecturerSign(data.lecturerSign || currentUser?.name || "");

        // Generate QR code data url
        if (typeof window !== "undefined" && data.qrCodeToken) {
          const scanUrl = `${window.location.origin}/attendance/scan/${data.qrCodeToken}`;
          QRCodeLib.toDataURL(scanUrl, { width: 320, margin: 2 }, (err, url) => {
            if (!err) setQrDataUrl(url);
          });
        }
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

  const handleUpdateStudent = (index: number, field: keyof AttendanceStudent, value: any) => {
    if (!record) return;
    const updated = [...record.attendees];
    updated[index] = { ...updated[index], [field]: value };
    setRecord({ ...record, attendees: updated });
  };

  const handleToggleSign = (index: number) => {
    if (!record) return;
    const updated = [...record.attendees];
    const curr = updated[index].signed;
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    updated[index] = {
      ...updated[index],
      signed: !curr,
      signedAt: !curr ? timeStr : undefined
    };
    setRecord({ ...record, attendees: updated });
  };

  const handleAddStudent = () => {
    if (!record || !selectedUserId) return;
    const user = users.find((u) => u.id === selectedUserId);
    if (!user) return;
    if (record.attendees.some((a) => a.empId === user.id)) {
      alert("該學員已在名冊中");
      return;
    }

    const newStudent: AttendanceStudent = {
      empId: user.id,
      name: user.name,
      dept: user.department,
      signed: true,
      signedAt: "現場加入",
      score: 85,
      passed: true
    };

    setRecord({
      ...record,
      attendees: [...record.attendees, newStudent],
      expectedCount: record.attendees.length + 1
    });
    setSelectedUserId("");
  };

  const handleSaveChanges = async () => {
    if (!record) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/attendance/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendees: record.attendees,
          lecturerSign
        })
      });

      if (res.ok) {
        await loadData();
        alert("已成功更新學員考核成績，並重新套印 Word 簽到表！");
      }
    } catch (e) {
      console.error(e);
      alert("儲存失敗");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400">載入簽到考核資料中...</div>;
  }

  if (!record) {
    return <div className="text-center py-20 text-slate-500">找不到該簽到考核記錄</div>;
  }

  const actualSignedCount = record.attendees.filter((a) => a.signed).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/attendance"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回簽到考核清單
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQrModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <QrCode className="w-4 h-4" />
            顯示投影簽到 QR Code
          </button>
          {record.wordDocUrl && (
            <a
              href={record.wordDocUrl}
              download
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all hover:shadow"
            >
              <Download className="w-4 h-4" />
              下載簽到考核表 Word (03)
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
              <span className="text-xs font-mono font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">
                RE-SOP-003-03
              </span>
              <span className="text-xs text-slate-300 font-mono">考核單號：{record.id}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight mt-1">{record.courseName}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              講師：{record.lecturerName} ({record.lecturerType}) · 地點：{record.location}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
            <div className="text-right">
              <div className="text-xs text-slate-300">現場實到 / 應到人數</div>
              <div className="text-xl font-extrabold text-emerald-400">
                {actualSignedCount} / {record.attendees.length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              {Math.round((actualSignedCount / (record.attendees.length || 1)) * 100)}%
            </div>
          </div>
        </div>

        {/* Form Body - Replicating exact Word Table Format */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="text-center pb-2 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 tracking-wider">
              教 育 訓 練 簽 到 考 核 表
            </h2>
          </div>

          {/* Table Container */}
          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
            {/* Row 0: Course Name */}
            <div className="grid grid-cols-6 border-b border-slate-300">
              <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 flex items-center">
                課程名稱
              </div>
              <div className="col-span-5 p-3 text-slate-900 font-semibold">{record.courseName}</div>
            </div>

            {/* Row 1: Lecturer */}
            <div className="grid grid-cols-6 border-b border-slate-300">
              <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 flex items-center">
                講師資訊
              </div>
              <div className="col-span-5 p-3 text-slate-800">
                <span className="font-semibold text-slate-900">{record.lecturerName}</span>
                <span className="ml-2 text-slate-500">
                  ({record.lecturerType} · 服務機構: {record.lecturerOrg || "總部內部"})
                </span>
              </div>
            </div>

            {/* Row 2: Location & Time */}
            <div className="grid grid-cols-6 border-b border-slate-300">
              <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 flex items-center">
                訓練地點
              </div>
              <div className="col-span-2 p-3 border-r border-slate-300 text-slate-800">{record.location}</div>
              <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 flex items-center">
                訓練時間
              </div>
              <div className="col-span-2 p-3 text-slate-800">
                {record.startDate} ~ {record.endDate}；共 {record.totalHours} 小時
              </div>
            </div>

            {/* Row 3: Attendees & Material */}
            <div className="grid grid-cols-6 border-b border-slate-300 bg-slate-50/50">
              <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 flex items-center">
                應到人數
              </div>
              <div className="col-span-1 p-3 border-r border-slate-300 font-bold text-slate-800">
                {record.attendees.length} 人
              </div>
              <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 flex items-center">
                實到人數
              </div>
              <div className="col-span-1 p-3 border-r border-slate-300 font-bold text-emerald-700">
                {actualSignedCount} 人
              </div>
              <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 flex items-center">
                教材領取
              </div>
              <div className="col-span-1 p-3 text-slate-800 font-medium">
                {record.hasMaterial ? "■ 發放教材" : "■ 無教材"}
              </div>
            </div>

            {/* Row 4: Eval Method & Lecturer Signature */}
            <div className="grid grid-cols-6 border-b border-slate-300">
              <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 flex items-center">
                考核方式
              </div>
              <div className="col-span-3 p-3 border-r border-slate-300 flex flex-wrap gap-3 items-center">
                {["口試", "筆試", "實作", "心得報告", "問題與討論"].map((m) => (
                  <span key={m} className="text-xs">
                    {record.evalMethods?.includes(m) ? "■ " : "□ "}
                    {m}
                  </span>
                ))}
              </div>
              <div className="col-span-1 p-3 bg-slate-100 font-bold text-slate-700 border-r border-slate-300 flex items-center">
                講師簽名
              </div>
              <div className="col-span-1 p-3 flex items-center">
                <input
                  type="text"
                  placeholder="講師簽字"
                  value={lecturerSign}
                  onChange={(e) => setLecturerSign(e.target.value)}
                  className="w-full px-2 py-1 border border-slate-300 rounded text-center text-xs font-bold"
                />
              </div>
            </div>

            {/* Student Attendance List Header */}
            <div className="grid grid-cols-12 bg-slate-200/80 font-bold text-slate-800 border-b border-slate-300 text-center py-2.5">
              <div className="col-span-1">NO.</div>
              <div className="col-span-3 text-left pl-3">單位</div>
              <div className="col-span-2">員工編號</div>
              <div className="col-span-2">簽名 / 點名</div>
              <div className="col-span-2">考核分數</div>
              <div className="col-span-2">考核結果</div>
            </div>

            {/* Student Rows */}
            <div className="divide-y divide-slate-200">
              {record.attendees.map((student, idx) => (
                <div
                  key={student.empId}
                  className={`grid grid-cols-12 items-center text-center py-2.5 ${
                    student.signed ? "bg-white" : "bg-slate-50/50"
                  }`}
                >
                  <div className="col-span-1 font-mono text-slate-500 font-semibold">{idx + 1}</div>
                  <div className="col-span-3 text-left pl-3 font-medium text-slate-800">
                    {student.dept}
                  </div>
                  <div className="col-span-2 font-mono text-slate-700">
                    <span className="font-bold text-slate-900">{student.name}</span>
                    <span className="block text-[10px] text-slate-400">{student.empId}</span>
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => handleToggleSign(idx)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        student.signed
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      }`}
                      title="點擊手動切換簽到狀態"
                    >
                      {student.signed ? `✓ 已簽到` : `未簽到`}
                    </button>
                    {student.signedAt && (
                      <span className="block text-[10px] text-slate-400 mt-0.5">{student.signedAt}</span>
                    )}
                  </div>
                  <div className="col-span-2 px-3">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={student.score ?? ""}
                      onChange={(e) => handleUpdateStudent(idx, "score", e.target.value)}
                      placeholder="分數"
                      className="w-16 px-2 py-1 text-center font-bold text-xs border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateStudent(idx, "passed", true)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        student.passed
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      合格
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStudent(idx, "passed", false)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        !student.passed
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      不合格
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Add Attendee Bar */}
            <div className="p-3 bg-slate-50 border-t border-slate-300 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="">-- 手動增列學員名單 --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.department} · {u.title})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddStudent}
                  disabled={!selectedUserId}
                  className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-40"
                >
                  + 加入名單
                </button>
              </div>

              <button
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-lg text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "儲存更新中..." : "儲存評分並重新產生 Word"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Big Display Modal for Classroom Projector */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 text-center space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
            >
              ✕
            </button>

            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                課堂現場即時簽到 QR Code
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">{record.courseName}</h2>
              <p className="text-xs text-slate-500 mt-1">
                請受訓同仁使用手機相機掃描下方條碼，即可線上完成打卡出勤
              </p>
            </div>

            {/* QR Image */}
            <div className="flex justify-center py-2">
              <div className="p-4 bg-white rounded-2xl border-2 border-emerald-500 shadow-xl inline-block">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Sign In QR Code" className="w-64 h-64 mx-auto" />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-slate-400">
                    產生條碼中...
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-400 font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              簽到網址：
              <Link
                href={`/attendance/scan/${record.qrCodeToken}`}
                target="_blank"
                className="text-blue-600 hover:underline font-semibold ml-1 inline-flex items-center gap-1"
              >
                直接開啟手機簽到頁 &rarr;
              </Link>
            </div>

            <button
              onClick={() => setQrModalOpen(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs"
            >
              關閉投影畫面
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
