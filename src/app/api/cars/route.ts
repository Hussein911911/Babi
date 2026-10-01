import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { carSchema } from "@/lib/validation";

export async function GET() {
  const cars = await prisma.car.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(cars);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = carSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صالحة", details: parsed.error.flatten() }, { status: 400 });
  }

  const exists = await prisma.car.findUnique({ where: { slug: parsed.data.slug } });
  if (exists) return NextResponse.json({ error: "الرابط (slug) مستخدم مسبقاً" }, { status: 409 });

  const car = await prisma.car.create({ data: parsed.data });
  await prisma.auditLog.create({
    data: { action: "CAR_CREATE", detail: `إضافة سيارة: ${car.brand} ${car.model}`, userId: session.id },
  }).catch(() => {});

  return NextResponse.json({ ok: true, car }, { status: 201 });
}
