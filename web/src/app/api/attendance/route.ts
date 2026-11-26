import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { generateAttendanceWord } from "@/lib/wordService";
import { AttendanceRecord } from "@/types";

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.attendanceRecords);
}

export async function POST(req: Request) {
  const db = getDb();
  const body = (await req.json()) as Partial<AttendanceRecord>;

  const id = `ATT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(db.attendanceRecords.length + 1).padStart(3, "0")}`;
  const now = new Date().toISOString();

  const newRecord: AttendanceRecord = {
    id,
    applicationId: body.applicationId || "",
    courseName: body.courseName || "",
    lecturerType: body.lecturerType || "內部講師",
    lecturerName: body.lecturerName || "",
    lecturerOrg: body.lecturerOrg || "",
    location: body.location || "總部培訓教室",
    startDate: body.startDate || "",
    endDate: body.endDate || "",
    dailyTime: body.dailyTime || "09:00 ~ 17:00",
    totalHours: body.totalHours || 7,
    expectedCount: body.expectedCount || (body.attendees ? body.attendees.length : 10),
    actualCount: body.actualCount || 0,
    hasMaterial: body.hasMaterial !== undefined ? body.hasMaterial : true,
    evalMethods: body.evalMethods || ["筆試", "實作"],
    lecturerSign: body.lecturerSign || body.lecturerName || "",
    qrCodeToken: `QR_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    attendees: body.attendees || [],
    status: body.status || "OPEN",
    createdAt: now,
    updatedAt: now
  };

  try {
    newRecord.wordDocUrl = generateAttendanceWord(newRecord);
  } catch (err) {
    console.error("Attendance Word generation error:", err);
  }

  db.attendanceRecords.unshift(newRecord);
  saveDb(db);

  return NextResponse.json(newRecord, { status: 201 });
}
