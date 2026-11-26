import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { generateFeedbackWord } from "@/lib/wordService";
import { FeedbackReport } from "@/types";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const report = db.feedbackReports.find((r) => r.id === id);
  if (!report) {
    return NextResponse.json({ error: "找不到該外訓心得報告" }, { status: 404 });
  }
  return NextResponse.json(report);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = (await req.json()) as Partial<FeedbackReport>;

  const idx = db.feedbackReports.findIndex((r) => r.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "找不到該外訓心得報告" }, { status: 404 });
  }

  db.feedbackReports[idx] = {
    ...db.feedbackReports[idx],
    ...body,
    updatedAt: new Date().toISOString()
  };

  // If marked as SUBMITTED, update attendance student feedbackSubmitted
  if (body.status === "SUBMITTED") {
    const att = db.attendanceRecords.find((a) => a.applicationId === db.feedbackReports[idx].applicationId);
    if (att) {
      const student = att.attendees.find((s) => s.empId === db.feedbackReports[idx].empId);
      if (student) student.feedbackSubmitted = true;
    }
  }

  try {
    db.feedbackReports[idx].wordDocUrl = generateFeedbackWord(db.feedbackReports[idx]);
  } catch (err) {
    console.error("Feedback Word error:", err);
  }

  saveDb(db);
  return NextResponse.json(db.feedbackReports[idx]);
}
