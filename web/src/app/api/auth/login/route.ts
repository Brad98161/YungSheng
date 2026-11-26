import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "請輸入工號與密碼" }, { status: 400 });
    }

    const db = getDb();
    const user = db.users.find(
      (u) =>
        u.id.toLowerCase() === username.trim().toLowerCase() ||
        u.email.toLowerCase() === username.trim().toLowerCase()
    );

    if (!user) {
      return NextResponse.json({ error: "查無此員工工號" }, { status: 401 });
    }

    const userPwd = user.password || "123";
    if (userPwd !== password.trim()) {
      return NextResponse.json({ error: "密碼錯誤 (預設為 123)" }, { status: 401 });
    }

    // Return safe user info (without password)
    const { password: _, ...safeUser } = user;
    return NextResponse.json({ success: true, user: safeUser });
  } catch (err) {
    return NextResponse.json({ error: "登入發生錯誤" }, { status: 500 });
  }
}
