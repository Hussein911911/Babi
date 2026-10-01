import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function genCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no confusing chars
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `BM-${s}`;
}

/** Issue a new job card (staff/admin only) */
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  let code = genCode();
  // ensure uniqueness
  while (await prisma.jobCard.findUnique({ where: { code } })) code = genCode();

  const card = await prisma.jobCard.create({ data: { code } });
  await prisma.auditLog.create({
    data: { action: "CARD_CREATE", detail: `إصدار بطاقة توظيف: ${code}`, userId: session.id },
  }).catch(() => {});

  return NextResponse.json({ ok: true, card }, { status: 201 });
}
