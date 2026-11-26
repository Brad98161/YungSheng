import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { generateAttendanceWord } from "@/lib/wordService";
import { AttendanceRecord } from "@/types";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const rec = db.attendanceRecords.find((r) => r.id === id);
  if (!rec) {
    return NextResponse.json({ error: "找不到該簽到考核表" }, { status: 404 });
  }
  return NextResponse.json(rec);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = (await req.json()) as Partial<AttendanceRecord>;

  const idx = db.attendanceRecords.findIndex((r) => r.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "找不到該簽到考核表" }, { status: 404 });
  }

  const updatedAttendees = body.attendees || db.attendanceRecords[idx].attendees;
  const actualCount = updatedAttendees.filter((a) => a.signed).length;

  db.attendanceRecords[idx] = {
    ...db.attendanceRecords[idx],
    ...body,
    attendees: updatedAttendees,
    actualCount,
    updatedAt: new Date().toISOString()
  };

  try {
    db.attendanceRecords[idx].wordDocUrl = generateAttendanceWord(db.attendanceRecords[idx]);
  } catch (err) {
    console.error("Attendance Word update error:", err);
  }

  saveDb(db);
  return NextResponse.json(db.attendanceRecords[idx]);
}
