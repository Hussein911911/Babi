"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Plus } from "lucide-react";
import { useUI } from "@/store/ui";
import { formatIQD, formatUSD, formatKm, parseArr } from "@/lib/utils";
import type { CarDTO } from "@/lib/types";

export default function CompareClient({ cars }: { cars: CarDTO[] }) {
  const { compare, toggleCompare } = useUI();
  const selected = compare
    .map((slug) => cars.find((c) => c.slug === slug))
    .filter(Boolean) as CarDTO[];

  if (selected.length === 0) {
    return (
      <div className="glass p-14 text-center">
        <p className="text-4xl mb-3">⚖️</p>
        <p className="font-black text-lg mb-2">لم تختر أي سيارة للمقارنة بعد</p>
        <p className="text-sm opacity-70 mb-6">اذهب إلى المعرض واضغط زر المقارنة على السيارات التي تريدها (حتى 3)</p>
        <Link href="/cars" className="btn-gold">تصفح السيارات</Link>
      </div>
    );
  }

  const rows: { label: string; get: (c: CarDTO) => string }[] = [
    { label: "السعر بالدولار", get: (c) => formatUSD(c.priceUSD) },
    { label: "السعر بالدينار", get: (c) => formatIQD(c.priceUSD) },
    { label: "السنة", get: (c) => String(c.year) },
    { label: "الحالة", get: (c) => c.condition },
    { label: "الممشى", get: (c) => formatKm(c.mileage) },
    { label: "المحرك", get: (c) => c.engine || "—" },
    { label: "القوة", get: (c) => `${c.horsepower} حصان` },
    { label: "العزم", get: (c) => `${c.torque} نيوتن.متر` },
    { label: "التسارع 0-100", get: (c) => `${c.acceleration} ث` },
    { label: "ناقل الحركة", get: (c) => c.transmission },
    { label: "الدفع", get: (c) => c.drivetrain },
    { label: "الوقود", get: (c) => c.fuel },
    { label: "الاستهلاك", get: (c) => c.fuelEconomy || "—" },
    { label: "نوع الهيكل", get: (c) => c.bodyType },
    { label: "المقاعد", get: (c) => String(c.seats) },
    { label: "الضمان", get: (c) => c.warranty || "—" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th className="w-40 p-3 text-right opacity-60 font-bold align-bottom">المواصفات</th>
            {selected.map((c) => (
              <th key={c.id} className="p-3">
                <div className="glass relative overflow-hidden">
                  <button
                    onClick={() => toggleCompare(c.slug)}
                    aria-label="إزالة"
                    className="absolute top-2 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-charcoal/70 text-white hover:bg-red-500 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="relative h-32">
                    <Image src={parseArr(c.images)[0] || ""} alt={`${c.brand} ${c.model}`} fill sizes="300px" className="object-cover" />
                  </div>
                  <div className="p-3">
                    <Link href={`/cars/${c.slug}`} className="font-black hover:text-gold-500 transition">
                      {c.brand} {c.model}
                    </Link>
                  </div>
                </div>
              </th>
            ))}
            {selected.length < 3 && (
              <th className="p-3">
                <Link href="/cars" className="glass flex h-full min-h-[180px] flex-col items-center justify-center gap-2 opacity-60 hover:opacity-100 transition">
                  <Plus className="h-8 w-8 text-gold-500" />
                  <span className="text-xs font-bold">أضف سيارة</span>
                </Link>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row.label} className={ri % 2 === 0 ? "bg-gold-500/[0.04]" : ""}>
              <td className="p-3.5 font-black opacity-80 border-b border-gold-500/10">{row.label}</td>
              {selected.map((c) => (
                <td key={c.id} className="p-3.5 text-center border-b border-gold-500/10 font-bold">
                  {row.get(c)}
                </td>
              ))}
              {selected.length < 3 && <td className="border-b border-gold-500/10" />}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
