import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(7).max(20),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().min(3).max(2000),
  type: z.string().max(30).optional(),
  carId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (!rateLimit(`inquiry:${ip}`, 10, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: "محاولات كثيرة" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  const { name, phone, email, message, type, carId } = parsed.data;
  const inquiry = await prisma.inquiry.create({
    data: {
      name, phone, message,
      email: email || null,
      type: type || "عام",
      carId: carId || null,
    },
  });

  return NextResponse.json({ ok: true, id: inquiry.id }, { status: 201 });
}
