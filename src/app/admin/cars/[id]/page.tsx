import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toCarDTO } from "@/lib/types";
import CarForm from "@/components/admin/CarForm";

export const dynamic = "force-dynamic";

export default async function EditCarPage({ params }: { params: { id: string } }) {
  const car = await prisma.car.findUnique({ where: { id: params.id } });
  if (!car) notFound();
  return <CarForm car={toCarDTO(car)} />;
}
