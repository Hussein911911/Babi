import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { carSchema } from "@/lib/validation";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = carSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صالحة", details: parsed.error.flatten() }, { status: 400 });
  }

  const car = await prisma.car.update({ where: { id: params.id }, data: parsed.data });
  await prisma.auditLog.create({
    data: { action: "CAR_UPDATE", detail: `تعديل سيارة: ${car.brand} ${car.model}`, userId: session.id },
  }).catch(() => {});

  return NextResponse.json({ ok: true, car });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  // RBAC: only admins can delete
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "الحذف متاح للمدير فقط" }, { status: 403 });
  }

  const car = await prisma.car.delete({ where: { id: params.id } });
  await prisma.auditLog.create({
    data: { action: "CAR_DELETE", detail: `حذف سيارة: ${car.brand} ${car.model}`, userId: session.id },
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
