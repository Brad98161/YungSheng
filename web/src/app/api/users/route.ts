import { NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/db";
import { User } from "@/types";

export async function GET() {
  const db = getDb();
  return NextResponse.json(db.users);
}

export async function POST(req: Request) {
  const db = getDb();
  const body = (await req.json()) as User;

  if (!body.id || !body.name || !body.department) {
    return NextResponse.json({ error: "工號、姓名與部門為必填" }, { status: 400 });
  }

  const existing = db.users.find((u) => u.id === body.id);
  if (existing) {
    return NextResponse.json({ error: "員工編號已存在" }, { status: 400 });
  }

  const newUser: User = {
    ...body,
    managerId: body.managerId || null
  };

  db.users.push(newUser);
  saveDb(db);

  return NextResponse.json(newUser, { status: 201 });
}

export async function PUT(req: Request) {
  const db = getDb();
  const body = (await req.json()) as User;

  const idx = db.users.findIndex((u) => u.id === body.id);
  if (idx === -1) {
    return NextResponse.json({ error: "找不到該員工" }, { status: 404 });
  }

  db.users[idx] = {
    ...db.users[idx],
    ...body,
    managerId: body.managerId || null
  };
  saveDb(db);

  return NextResponse.json(db.users[idx]);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少工號" }, { status: 400 });
  }

  const db = getDb();
  db.users = db.users.filter((u) => u.id !== id);
  // Also clear managerId for subordinates if deleted
  db.users.forEach((u) => {
    if (u.managerId === id) u.managerId = null;
  });
  saveDb(db);

  return NextResponse.json({ success: true });
}
