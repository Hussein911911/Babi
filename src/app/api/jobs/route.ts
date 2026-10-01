import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { jobSchema } from "@/lib/validation";

/** Public: active jobs WITHOUT employer details (hidden until completion) */
export async function GET() {
  const jobs = await prisma.job.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, category: true, location: true,
      salary: true, hours: true, description: true,
    },
  });
  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = jobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صالحة", details: parsed.error.flatten() }, { status: 400 });
  }

  const job = await prisma.job.create({ data: parsed.data });
  await prisma.auditLog.create({
    data: { action: "JOB_CREATE", detail: `إضافة وظيفة: ${job.title}`, userId: session.id },
  }).catch(() => {});

  return NextResponse.json({ ok: true, job }, { status: 201 });
}
