import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { toCarDTO } from "@/lib/types";
import CarsExplorer from "@/components/CarsExplorer";

export const metadata: Metadata = {
  title: "السيارات المعروضة",
  description: "تصفح جميع السيارات المتوفرة في معرض بابل للسيارات — فلترة حسب الماركة والسعر والحالة.",
};

export const revalidate = 60;

export default async function CarsPage() {
  const cars = await prisma.car.findMany({ orderBy: [{ sold: "asc" }, { createdAt: "desc" }] });

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black md:text-4xl">معرض <span className="gold-text">السيارات</span></h1>
        <p className="mt-2 opacity-75">اختر سيارتك من تشكيلتنا المميزة — فلترة وبحث لحظي</p>
      </div>
      <Suspense>
        <CarsExplorer cars={cars.map(toCarDTO)} />
      </Suspense>
    </div>
  );
}
