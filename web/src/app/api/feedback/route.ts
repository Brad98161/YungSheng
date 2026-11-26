import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { generateFeedbackWord } from "@/lib/wordService";
import { FeedbackReport } from "@/types";

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.feedbackReports);
}

export async function POST(req: Request) {
  const db = getDb();
  const body = (await req.json()) as Partial<FeedbackReport>;

  const id = body.id || `FB-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(db.feedbackReports.length + 1).padStart(3, "0")}`;
  const now = new Date().toISOString();

  const newReport: FeedbackReport = {
    id,
    applicationId: body.applicationId || "",
    empId: body.empId || "EMP001",
    empName: body.empName || "張大同",
    dept: body.dept || "技術工程部",
    courseName: body.courseName || "",
    startDate: body.startDate || "",
    endDate: body.endDate || "",
    totalHours: body.totalHours || 7,
    orgName: body.orgName || "",
    lecturerName: body.lecturerName || "",
    reportDate: body.reportDate || new Date().toISOString().slice(0, 10).replace(/-/g, "/"),
    q1: body.q1 || "非常需要",
    q2: body.q2 || "非常佳",
    q3: body.q3 || "非常佳",
    q4: body.q4 || "非常佳",
    q5: body.q5 || "非常瞭解",
    learningPoints: body.learningPoints || "",
    actionPlan: body.actionPlan || "",
    status: body.status || "SUBMITTED",
    reporterSign: body.reporterSign || body.empName || "",
    createdAt: now,
    updatedAt: now
  };

  try {
    newReport.wordDocUrl = generateFeedbackWord(newReport);
  } catch (err) {
    console.error("Feedback Word error:", err);
  }

  // Update attendance record status if matching
  const att = db.attendanceRecords.find((a) => a.applicationId === newReport.applicationId);
  if (att) {
    const student = att.attendees.find((s) => s.empId === newReport.empId);
    if (student) {
      student.feedbackSubmitted = true;
    }
  }

  db.feedbackReports.unshift(newReport);
  saveDb(db);

  return NextResponse.json(newReport, { status: 201 });
}
