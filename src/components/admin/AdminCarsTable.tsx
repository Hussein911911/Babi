"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search, Download } from "lucide-react";
import { formatUSD, parseArr, cn } from "@/lib/utils";
import type { CarDTO } from "@/lib/types";

export default function AdminCarsTable({ cars, isAdmin }: { cars: CarDTO[]; isAdmin: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = cars.filter((c) => `${c.brand} ${c.model} ${c.year}`.includes(q));

  const del = async (car: CarDTO) => {
    if (!confirm(`حذف ${car.brand} ${car.model} نهائياً؟`)) return;
    setBusy(car.id);
    const res = await fetch(`/api/cars/${car.id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) router.refresh();
    else alert((await res.json()).error || "فشل الحذف");
  };

  const toggleSold = async (car: CarDTO) => {
    setBusy(car.id);
    await fetch(`/api/cars/${car.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sold: !car.sold }),
    });
    setBusy(null);
    router.refresh();
  };

  const exportCSV = () => {
    const rows = [
      ["Brand", "Model", "Year", "Price USD", "Mileage", "Condition", "Sold"],
      ...cars.map((c) => [c.brand, c.model, c.year, c.priceUSD, c.mileage, c.condition, c.sold ? "Yes" : "No"]),
    ];
    const csv = "\uFEFF" + rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "babylon-motors-cars.csv";
    a.click();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black">إدارة السيارات ({cars.length})</h1>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-outline !py-2 !px-4 text-sm">
            <Download className="h-4 w-4" /> تصدير CSV
          </button>
          <Link href="/admin/cars/new" className="btn-gold !py-2 !px-4 text-sm">
            <Plus className="h-4 w-4" /> إضافة سيارة
          </Link>
        </div>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث..." className="input !pr-10" />
      </div>

      <div className="glass overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-gold-500/15 text-right text-xs opacity-60">
              <th className="p-4 font-bold">السيارة</th>
              <th className="p-4 font-bold">السعر</th>
              <th className="p-4 font-bold">الحالة</th>
              <th className="p-4 font-bold">مميزة</th>
              <th className="p-4 font-bold">البيع</th>
              <th className="p-4 font-bold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-gold-500/5 hover:bg-gold-500/[0.03]">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-lg">
                      <Image src={parseArr(c.images)[0] || "/cars/land-cruiser.jpg"} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                    <div>
                      <p className="font-black">{c.brand} {c.model}</p>
                      <p className="text-[11px] opacity-50 font-en">{c.year} • {c.mileage.toLocaleString()} km</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-black text-gold-500 font-en">{formatUSD(c.priceUSD)}</td>
                <td className="p-4"><span className="badge bg-ishtar-600/80 text-white text-[10px]">{c.condition}</span></td>
                <td className="p-4">{c.featured ? "⭐" : "—"}</td>
                <td className="p-4">
                  <button
                    onClick={() => toggleSold(c)}
                    disabled={busy === c.id}
                    className={cn(
                      "badge text-[10px] transition",
                      c.sold ? "bg-red-500/20 text-red-400 border border-red-500/40" : "bg-green-500/15 text-green-400 border border-green-500/40"
                    )}
                  >
                    {c.sold ? "مباعة" : "معروضة"}
                  </button>
                </td>
                <td className="p-4">
                  <div className="flex gap-1.5">
                    <Link href={`/admin/cars/${c.id}`} aria-label="تعديل" className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition">
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    {isAdmin && (
                      <button
                        onClick={() => del(c)}
                        disabled={busy === c.id}
                        aria-label="حذف"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-8 text-center text-sm opacity-60">لا توجد نتائج</p>}
      </div>
      {!isAdmin && (
        <p className="mt-3 text-xs opacity-50">ملاحظة: حذف السيارات متاح لحساب المدير فقط (RBAC).</p>
      )}
    </div>
  );
}
