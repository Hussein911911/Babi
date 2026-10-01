import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = z
    .object({ status: z.enum(["PENDING", "CONFIRMED", "DONE", "CANCELLED"]) })
    .safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });

  const booking = await prisma.booking.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ ok: true, booking });
}
