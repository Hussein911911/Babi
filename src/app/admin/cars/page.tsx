import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { toCarDTO } from "@/lib/types";
import AdminCarsTable from "@/components/admin/AdminCarsTable";

export const dynamic = "force-dynamic";

export default async function AdminCarsPage() {
  const [cars, session] = await Promise.all([
    prisma.car.findMany({ orderBy: { createdAt: "desc" } }),
    getSession(),
  ]);

  return (
    <AdminCarsTable
      cars={cars.map(toCarDTO)}
      isAdmin={session?.role === "ADMIN"}
    />
  );
}
