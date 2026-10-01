import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import AdminCards from "@/components/admin/AdminCards";

export const dynamic = "force-dynamic";

export default async function AdminCardsPage() {
  const [cards, session] = await Promise.all([
    prisma.jobCard.findMany({
      orderBy: { createdAt: "desc" },
      include: { job: { select: { title: true } } },
    }),
    getSession(),
  ]);

  return (
    <AdminCards
      cards={cards.map((c) => ({
        id: c.id,
        code: c.code,
        status: c.status,
        fullName: c.fullName,
        phone: c.phone,
        jobTitle: c.job?.title || null,
        createdAt: c.createdAt.toISOString(),
        completedAt: c.completedAt?.toISOString() || null,
      }))}
      isAdmin={session?.role === "ADMIN"}
    />
  );
}
