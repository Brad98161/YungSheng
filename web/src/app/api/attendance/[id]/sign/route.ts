import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { generateAttendanceWord } from "@/lib/wordService";
import { FeedbackReport } from "@/types";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = await req.json();
  const { empId, name, dept } = body;

  const idx = db.attendanceRecords.findIndex((r) => r.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "找不到該簽到考核記錄" }, { status: 404 });
  }

  const record = db.attendanceRecords[idx];
  const now = new Date();
  const timeStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  let student = record.attendees.find((a) => a.empId === empId);
  if (student) {
    student.signed = true;
    student.signedAt = timeStr;
  } else {
    // New attendee joining
    student = {
      empId,
      name: name || empId,
      dept: dept || "一般部門",
      signed: true,
      signedAt: timeStr,
      passed: true,
      feedbackSubmitted: false
    };
    record.attendees.push(student);
  }

  record.actualCount = record.attendees.filter((a) => a.signed).length;
  record.updatedAt = now.toISOString();

  // If this belongs to an external training application, auto ensure a pending FeedbackReport exists
  const app = db.applications.find((a) => a.id === record.applicationId);
  if (app && app.trainingType === "外訓") {
    const fbId = `FB-${app.id}-${empId}`;
    const existingFb = db.feedbackReports.find((f) => f.id === fbId);
    if (!existingFb) {
      const newFb: FeedbackReport = {
        id: fbId,
        applicationId: app.id,
        empId,
        empName: name || student.name,
        dept: dept || student.dept,
        courseName: app.courseName,
        startDate: app.startDate,
        endDate: app.endDate,
        totalHours: app.totalHours,
        orgName: app.quoteRows && app.quoteRows[0] ? app.quoteRows[0].orgOrLecturer : "外訓機構",
        lecturerName: app.lecturerName || "外聘講師",
        reportDate: new Date().toISOString().slice(0, 10).replace(/-/g, "/"),
        q1: "非常需要",
        q2: "非常佳",
        q3: "非常佳",
        q4: "非常佳",
        q5: "非常瞭解",
        learningPoints: "",
        actionPlan: "",
        status: "DRAFT",
        reporterSign: name || student.name,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };
      db.feedbackReports.unshift(newFb);
    }
  }

  try {
    record.wordDocUrl = generateAttendanceWord(record);
  } catch (err) {
    console.error("Attendance Word generation error:", err);
  }

  saveDb(db);
  return NextResponse.json({ success: true, student, actualCount: record.actualCount });
}
