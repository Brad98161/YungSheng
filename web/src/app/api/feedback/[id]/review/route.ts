import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { generateFeedbackWord } from "@/lib/wordService";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = await req.json();
  const {
    action, // "MANAGER_REVIEW" | "TOP_MANAGER_APPROVE"
    reviewerId,
    reviewerSign,
    managerReview1,
    managerReview2,
    managerReview3,
    managerComment,
    topManagerComment
  } = body;

  const idx = db.feedbackReports.findIndex((r) => r.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "找不到該心得報告" }, { status: 404 });
  }

  const report = db.feedbackReports[idx];
  const now = new Date();
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  if (action === "MANAGER_REVIEW") {
    report.managerReview1 = managerReview1 || "非常充實";
    report.managerReview2 = managerReview2 || "非常好";
    report.managerReview3 = managerReview3 || "非常好";
    report.managerComment = managerComment || "內容扎實，行動計畫可行。";
    report.reviewerId = reviewerId;
    report.reviewerSign = reviewerSign || "單位主管";
    report.reviewedAt = dateStr;
    report.status = "MANAGER_REVIEWED";
  } else if (action === "TOP_MANAGER_APPROVE") {
    report.topManagerComment = topManagerComment || "核准，同意轉訓或列入年度績效紀錄。";
    report.approverId = reviewerId;
    report.approverSign = reviewerSign || "部門最高主管";
    report.approvedAt = dateStr;
    report.status = "APPROVED";
  }

  report.updatedAt = now.toISOString();

  try {
    report.wordDocUrl = generateFeedbackWord(report);
  } catch (err) {
    console.error("Feedback Word error:", err);
  }

  saveDb(db);
  return NextResponse.json({ success: true, report });
}
