import { prisma } from "@/lib/prisma";
import InquiriesTable from "@/components/admin/InquiriesTable";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { car: { select: { brand: true, model: true, year: true } } },
  });

  return (
    <InquiriesTable
      inquiries={inquiries.map((i) => ({
        id: i.id,
        name: i.name,
        phone: i.phone,
        message: i.message,
        type: i.type,
        status: i.status,
        car: i.car ? `${i.car.brand} ${i.car.model} ${i.car.year}` : null,
        createdAt: i.createdAt.toISOString(),
      }))}
    />
  );
}
