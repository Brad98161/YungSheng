"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AttendanceRecord } from "@/types";
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Calendar,
  UserCheck
} from "lucide-react";

export default function MobileScanPage() {
  const { token } = useParams() as { token: string };
  const { currentUser, users } = useAuth();

  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmpId, setSelectedEmpId] = useState(currentUser?.id || "EMP001");
  const [signedSuccess, setSignedSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const res = await fetch("/api/attendance");
        if (res.ok) {
          const list: AttendanceRecord[] = await res.json();
          const found = list.find((r) => r.qrCodeToken === token);
          if (found) {
            setRecord(found);
            // Check if already signed
            const student = found.attendees.find((a) => a.empId === selectedEmpId);
            if (student && student.signed) {
              setSignedSuccess(true);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [token, selectedEmpId]);

  const handleSignIn = async () => {
    if (!record) return;
    const user = users.find((u) => u.id === selectedEmpId);
    if (!user) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/attendance/${record.id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empId: user.id,
          name: user.name,
          dept: user.department
        })
      });

      if (res.ok) {
        setSignedSuccess(true);
      } else {
        alert("簽到失敗，請重試");
      }
    } catch (e) {
      console.error(e);
      alert("網路連線錯誤");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-slate-400">正在核驗簽到課程資訊...</div>;
  }

  if (!record) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          ✕
        </div>
        <h2 className="text-lg font-bold text-slate-900">無效或已過期的簽到條碼</h2>
        <p className="text-xs text-slate-500 mt-2">請向現場講師或主辦人員索取最新簽到 QR Code。</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-6 px-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-tr from-blue-600 to-indigo-700 p-6 text-white text-center relative">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-[11px] font-mono uppercase bg-white/20 px-2.5 py-0.5 rounded-full text-blue-100">
            課堂出勤打卡
          </span>
          <h1 className="text-xl font-bold mt-2">{record.courseName}</h1>
          <div className="flex items-center justify-center gap-4 text-xs text-blue-100 mt-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {record.startDate}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {record.location}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {signedSuccess ? (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">您已成功簽到！</h2>
                <p className="text-xs text-slate-500 mt-1">
                  出勤紀錄已即時登記於 RE-SOP-003-03 考核名冊中
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">受訓同仁：</span>
                  <span className="font-bold text-slate-800">
                    {users.find((u) => u.id === selectedEmpId)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">員工編號：</span>
                  <span className="font-mono text-slate-800">{selectedEmpId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">簽到時間：</span>
                  <span className="text-emerald-700 font-bold">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <Link
                href="/"
                className="block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs"
              >
                返回系統首頁
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  請確認受訓學員身分
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:ring-2 focus:ring-blue-500"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.department} · {u.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 text-xs text-blue-800 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  出勤點名說明
                </div>
                <div>點擊確認簽到後，您的出勤狀態將自動更新至講師考核系統。</div>
              </div>

              <button
                onClick={handleSignIn}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                {isSubmitting ? "簽到登記中..." : "立即確認出勤簽到"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
