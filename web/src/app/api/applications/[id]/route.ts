import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { generateApplicationWord } from "@/lib/wordService";
import { TrainingApplication } from "@/types";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const app = db.applications.find((a) => a.id === id);
  if (!app) {
    return NextResponse.json({ error: "找不到該申請單" }, { status: 404 });
  }
  return NextResponse.json(app);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = (await req.json()) as Partial<TrainingApplication>;

  const idx = db.applications.findIndex((a) => a.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "找不到該申請單" }, { status: 404 });
  }

  db.applications[idx] = {
    ...db.applications[idx],
    ...body,
    updatedAt: new Date().toISOString()
  };

  // Re-generate Word doc if updated
  try {
    const docUrl = generateApplicationWord(db.applications[idx]);
    db.applications[idx].wordDocUrl = docUrl;
  } catch (err) {
    console.error("Regenerate Word error:", err);
  }

  saveDb(db);
  return NextResponse.json(db.applications[idx]);
}
