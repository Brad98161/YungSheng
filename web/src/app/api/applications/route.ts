import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { generateApplicationWord } from "@/lib/wordService";
import { TrainingApplication } from "@/types";

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.applications);
}

export async function POST(req: Request) {
  const db = getDb();
  const body = (await req.json()) as Partial<TrainingApplication>;

  const id = `TR-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(db.applications.length + 1).padStart(3, "0")}`;
  const now = new Date().toISOString();

  const newApp: TrainingApplication = {
    id,
    applyDate: body.applyDate || new Date().toISOString().slice(0, 10).replace(/-/g, "/"),
    applicantId: body.applicantId || "EMP001",
    applicantName: body.applicantName || "張大同",
    dept: body.dept || "技術工程部",
    trainingType: body.trainingType || "外訓",
    courseName: body.courseName || "",
    courseContent: body.courseContent || "",
    courseObjective: body.courseObjective || "",
    isAnnualPlan: body.isAnnualPlan !== undefined ? body.isAnnualPlan : true,
    startDate: body.startDate || "",
    endDate: body.endDate || "",
    totalDays: body.totalDays || 1,
    totalHours: body.totalHours || 7,
    notes: body.notes || "",
    targetAudience: body.targetAudience,
    expectedTrainees: body.expectedTrainees,
    internalCost: body.internalCost,
    lecturerType: body.lecturerType,
    lecturerName: body.lecturerName,
    lecturerOrg: body.lecturerOrg,
    lecturerTitle: body.lecturerTitle,
    trainees: body.trainees || [],
    returnDocs: body.returnDocs || ["外訓心得報告"],
    returnDocsOther: body.returnDocsOther || "",
    attachments: body.attachments || ["課程簡章"],
    attachmentsOther: body.attachmentsOther || "",
    transferInternal: body.transferType ? body.transferType === "TRANSFER" : (body.transferInternal || false),
    transferType: body.transferType || (body.transferInternal ? "TRANSFER" : "NO_TRANSFER"),
    transferWeeks: body.transferWeeks || "",
    transferLecturer: body.transferLecturer || "",
    transferOther: body.transferOther || "",
    quoteRows: body.quoteRows || [],
    status: body.status || "PENDING_UNIT_REVIEW",
    applicantSign: body.applicantSign || body.applicantName || "",
    createdAt: now,
    updatedAt: now
  };

  // Auto generate filled Word attachment immediately upon submission
  try {
    const docUrl = generateApplicationWord(newApp);
    newApp.wordDocUrl = docUrl;
  } catch (err) {
    console.error("Auto generate Word error:", err);
  }

  db.applications.unshift(newApp);
  saveDb(db);

  return NextResponse.json(newApp, { status: 201 });
}
