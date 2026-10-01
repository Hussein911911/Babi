import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signSession, rateLimit, clearRateLimit } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  const rl = rateLimit(`login:${ip}`);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `محاولات كثيرة — حاول بعد ${Math.ceil((rl.retryAfter || 60) / 60)} دقيقة` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة" }, { status: 401 });
  }

  clearRateLimit(`login:${ip}`);

  const token = await signSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as "ADMIN" | "STAFF",
  });

  await prisma.auditLog.create({
    data: { action: "LOGIN", detail: `تسجيل دخول: ${user.email}`, userId: user.id },
  }).catch(() => {});

  const res = NextResponse.json({ ok: true, role: user.role, name: user.name });
  res.cookies.set("bm_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return res;
}
