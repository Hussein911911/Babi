import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { toCarDTO } from "@/lib/types";
import CompareClient from "@/components/CompareClient";

export const metadata: Metadata = { title: "مقارنة السيارات" };
export const revalidate = 60;

export default async function ComparePage() {
  const cars = await prisma.car.findMany();
  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-10">
      <h1 className="text-3xl font-black md:text-4xl mb-2">مقارنة <span className="gold-text">السيارات</span></h1>
      <p className="opacity-75 mb-8">قارن حتى 3 سيارات جنباً إلى جنب</p>
      <CompareClient cars={cars.map(toCarDTO)} />
    </div>
  );
}
