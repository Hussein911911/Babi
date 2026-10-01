import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jobSchema } from "@/lib/validation";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = jobSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  const job = await prisma.job.update({ where: { id: params.id }, data: parsed.data });
  await prisma.auditLog.create({
    data: { action: "JOB_UPDATE", detail: `تعديل وظيفة: ${job.title}`, userId: session.id },
  }).catch(() => {});
  return NextResponse.json({ ok: true, job });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "الحذف متاح للمدير فقط" }, { status: 403 });
  }

  const job = await prisma.job.delete({ where: { id: params.id } });
  await prisma.auditLog.create({
    data: { action: "JOB_DELETE", detail: `حذف وظيفة: ${job.title}`, userId: session.id },
  }).catch(() => {});
  return NextResponse.json({ ok: true });
}
