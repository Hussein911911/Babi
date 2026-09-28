import { prisma } from "@/lib/prisma";
import BookingsTable from "@/components/admin/BookingsTable";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { car: { select: { brand: true, model: true, year: true } } },
  });

  return (
    <BookingsTable
      bookings={bookings.map((b) => ({
        id: b.id,
        name: b.name,
        phone: b.phone,
        date: b.date,
        time: b.time,
        status: b.status,
        car: `${b.car.brand} ${b.car.model} ${b.car.year}`,
      }))}
    />
  );
}
