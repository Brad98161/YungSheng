import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { generateApplicationWord, generateAttendanceWord } from "@/lib/wordService";
import { AttendanceRecord, AttendanceStudent } from "@/types";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = await req.json();
  const { action, reviewerId, reviewerSign, comment, quoteRows } = body;

  const appIdx = db.applications.findIndex((a) => a.id === id);
  if (appIdx === -1) {
    return NextResponse.json({ error: "找不到該申請單" }, { status: 404 });
  }

  const app = db.applications[appIdx];
  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  switch (action) {
    case "UNIT_REVIEW":
      // 單位主管審核通過
      app.status = "PENDING_HR_REVIEW";
      app.reviewerId = reviewerId;
      app.reviewerSign = reviewerSign || "單位主管";
      app.reviewerComment = comment || "符合部門培育目標，核准轉送人資。";
      app.reviewedAt = dateStr;
      break;

    case "HR_APPROVE":
      // 人資部主管核准成案
      app.status = "APPROVED";
      app.approverId = reviewerId;
      app.approverSign = reviewerSign || "人資主管";
      app.approverComment = comment || "預算與受訓資格已核可，准予辦理。";
      app.approvedAt = dateStr;

      // 自動產生訓中簽到考核表 (RE-SOP-003-03)
      const existingAtt = db.attendanceRecords.find((att) => att.applicationId === app.id);
      if (!existingAtt) {
        const attendees: AttendanceStudent[] = [];
        if (app.trainingType === "外訓" && app.trainees) {
          app.trainees.forEach((t) => {
            attendees.push({
              empId: t.empId,
              name: t.name,
              dept: t.dept,
              signed: false,
              passed: true,
              feedbackSubmitted: false
            });
          });
        }

        const newAttendance: AttendanceRecord = {
          id: `ATT-${app.id}`,
          applicationId: app.id,
          courseName: app.courseName,
          lecturerType: app.lecturerType === "外聘" || app.trainingType === "外訓" ? "外聘講師" : "內部講師",
          lecturerName: app.lecturerName || (app.trainingType === "外訓" ? "外聘專業講師" : "內部同仁"),
          lecturerOrg: app.lecturerOrg || (app.trainingType === "外訓" ? "專業培訓機構" : app.dept),
          location: "台北總部培訓教室 / 線上工作坊",
          startDate: app.startDate,
          endDate: app.endDate,
          dailyTime: "09:00 ~ 17:00",
          totalHours: app.totalHours,
          expectedCount: attendees.length || Number(app.expectedTrainees) || 10,
          actualCount: 0,
          hasMaterial: true,
          evalMethods: ["筆試", "實作", "心得報告"],
          lecturerSign: app.lecturerName || "講師",
          qrCodeToken: `QR_${app.id}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          attendees,
          status: "OPEN",
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        };

        try {
          newAttendance.wordDocUrl = generateAttendanceWord(newAttendance);
        } catch (e) {
          console.error("Generate Attendance Word Error:", e);
        }
        db.attendanceRecords.unshift(newAttendance);
      }
      break;

    case "HR_QUOTE":
      // 人資詢議價更新
      if (quoteRows && Array.isArray(quoteRows)) {
        app.quoteRows = quoteRows;
      }
      app.hrStaffId = reviewerId;
      app.hrStaffSign = reviewerSign || "人資專員";
      app.hrActionAt = dateStr;
      break;

    case "REJECT":
      // 退回
      app.status = "REJECTED";
      app.reviewerComment = comment || "退回修正";
      break;

    default:
      return NextResponse.json({ error: "無效的操作動作" }, { status: 400 });
  }

  app.updatedAt = now.toISOString();

  // 更新重新產生 Word
  try {
    app.wordDocUrl = generateApplicationWord(app);
  } catch (err) {
    console.error("Word re-generate error:", err);
  }

  saveDb(db);
  return NextResponse.json({ success: true, application: app });
}
