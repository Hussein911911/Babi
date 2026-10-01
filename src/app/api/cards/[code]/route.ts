import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, getSession } from "@/lib/auth";

const schema = z.object({
  fullName: z.string().min(3).max(80),
  age: z.coerce.number().int().min(15).max(80),
  phone: z.string().regex(/^0?7[0-9]{9}$/),
  address: z.string().min(3).max(160),
  education: z.string().min(2).max(60),
  experience: z.string().max(600).optional().or(z.literal("")),
  jobId: z.string().min(1),
});

/** Submit the application form (public — via the card's QR) */
export async function PATCH(req: NextRequest, { params }: { params: { code: string } }) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (!rateLimit(`card:${ip}`, 10, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: "محاولات كثيرة — انتظر قليلاً" }, { status: 429 });
  }

  const card = await prisma.jobCard.findUnique({ where: { code: params.code } });
  if (!card) return NextResponse.json({ error: "البطاقة غير موجودة" }, { status: 404 });
  if (card.status === "COMPLETED") {
    return NextResponse.json({ error: "هذه البطاقة مكتملة مسبقاً" }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صالحة", details: parsed.error.flatten() }, { status: 400 });
  }

  const job = await prisma.job.findUnique({ where: { id: parsed.data.jobId } });
  if (!job || !job.active) {
    return NextResponse.json({ error: "الوظيفة المختارة لم تعد متاحة" }, { status: 400 });
  }

  const updated = await prisma.jobCard.update({
    where: { code: params.code },
    data: {
      ...parsed.data,
      experience: parsed.data.experience || "",
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, card: updated });
}

/** Reset a card so it can be filled again (admin only) */
export async function DELETE(_req: NextRequest, { params }: { params: { code: string } }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "متاح للمدير فقط" }, { status: 403 });
  }
  await prisma.jobCard.update({
    where: { code: params.code },
    data: {
      status: "NEW", fullName: "", age: 0, phone: "", address: "",
      education: "", experience: "", jobId: null, completedAt: null,
    },
  });
  return NextResponse.json({ ok: true });
}
