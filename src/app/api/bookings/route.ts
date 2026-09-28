import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(7).max(20),
  date: z.string().min(8).max(12),
  time: z.string().min(4).max(8),
  carId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (!rateLimit(`booking:${ip}`, 8, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: "محاولات كثيرة" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  const booking = await prisma.booking.create({ data: parsed.data });
  return NextResponse.json({ ok: true, id: booking.id }, { status: 201 });
}
