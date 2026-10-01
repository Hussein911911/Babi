"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, X, Scale } from "lucide-react";
import CarCard from "./CarCard";
import { useUI } from "@/store/ui";
import { useApp } from "@/components/Providers";
import { cn, formatUSD } from "@/lib/utils";
import type { CarDTO } from "@/lib/types";

const PAGE_SIZE = 9;

export default function CarsExplorer({ cars }: { cars: CarDTO[] }) {
  const { t } = useApp();
  const params = useSearchParams();
  const { favorites, compare, clearCompare } = useUI();

  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");
  const [body, setBody] = useState("");
  const [condition, setCondition] = useState("");
  const [fuel, setFuel] = useState("");
  const [transmission, setTransmission] = useState("");
  const [maxPrice, setMaxPrice] = useState(150000);
  const [sort, setSort] = useState<"new" | "cheap" | "expensive">("new");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const favOnly = params.get("fav") === "1";

  const brands = useMemo(() => Array.from(new Set(cars.map((c) => c.brand))), [cars]);
  const bodies = useMemo(() => Array.from(new Set(cars.map((c) => c.bodyType))), [cars]);
  const conditions = useMemo(() => Array.from(new Set(cars.map((c) => c.condition))), [cars]);
  const fuels = useMemo(() => Array.from(new Set(cars.map((c) => c.fuel))), [cars]);

  const filtered = useMemo(() => {
    let list = cars.filter((c) => {
      if (favOnly && !favorites.includes(c.slug)) return false;
      if (q && !`${c.brand} ${c.model} ${c.year}`.includes(q)) return false;
      if (brand && c.brand !== brand) return false;
      if (body && c.bodyType !== body) return false;
      if (condition && c.condition !== condition) return false;
      if (fuel && c.fuel !== fuel) return false;
      if (transmission && !c.transmission.includes(transmission)) return false;
      if (c.priceUSD > maxPrice) return false;
      return true;
    });
    if (sort === "cheap") list = [...list].sort((a, b) => a.priceUSD - b.priceUSD);
    else if (sort === "expensive") list = [...list].sort((a, b) => b.priceUSD - a.priceUSD);
    else list = [...list].sort((a, b) => b.year - a.year);
    return list;
  }, [cars, q, brand, body, condition, fuel, transmission, maxPrice, sort, favOnly, favorites]);

  const paged = filtered.slice(0, page * PAGE_SIZE);
  const activeFilters = [brand, body, condition, fuel, transmission].filter(Boolean).length;

  const reset = () => {
    setQ(""); setBrand(""); setBody(""); setCondition(""); setFuel("");
    setTransmission(""); setMaxPrice(150000); setPage(1);
  };

  const Select = ({
    value, onChange, label, options,
  }: { value: string; onChange: (v: string) => void; label: string; options: string[] }) => (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black opacity-70">{label}</span>
      <select value={value} onChange={(e) => { onChange(e.target.value); setPage(1); }} className="input">
        <option value="">الكل</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );

  return (
    <div>
      {/* Search + sort bar */}
      <div className="glass mb-6 flex flex-wrap items-center gap-3 p-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder={t.common.search}
            className="input !pr-10"
            aria-label={t.common.search}
          />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="input !w-auto" aria-label="ترتيب">
          <option value="new">الأحدث</option>
          <option value="cheap">الأرخص أولاً</option>
          <option value="expensive">الأغلى أولاً</option>
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn("btn-outline !py-2.5 !px-4 text-sm relative", showFilters && "bg-gold-500/10")}
        >
          <SlidersHorizontal className="h-4 w-4" /> الفلاتر
          {activeFilters > 0 && (
            <span className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-black text-charcoal">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="glass mb-6 p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Select value={brand} onChange={setBrand} label="الماركة" options={brands} />
            <Select value={body} onChange={setBody} label="نوع الهيكل" options={bodies} />
            <Select value={condition} onChange={setCondition} label="الحالة" options={conditions} />
            <Select value={fuel} onChange={setFuel} label="الوقود" options={fuels} />
            <label className="block">
              <span className="mb-1.5 block text-xs font-black opacity-70">ناقل الحركة</span>
              <select value={transmission} onChange={(e) => { setTransmission(e.target.value); setPage(1); }} className="input">
                <option value="">الكل</option>
                <option value="أوتوماتيك">أوتوماتيك</option>
                <option value="عادي">عادي</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <label className="flex-1 min-w-[240px]">
              <span className="mb-1.5 flex justify-between text-xs font-black opacity-70">
                <span>السعر الأقصى</span>
                <span className="text-gold-500 font-en">{formatUSD(maxPrice)}</span>
              </span>
              <input
                type="range"
                min={20000}
                max={150000}
                step={5000}
                value={maxPrice}
                onChange={(e) => { setMaxPrice(+e.target.value); setPage(1); }}
                className="w-full accent-gold-500"
                aria-label="السعر الأقصى"
              />
            </label>
            <button onClick={reset} className="btn-outline !py-2 !px-4 text-xs">
              <X className="h-3.5 w-3.5" /> مسح الفلاتر
            </button>
          </div>
        </div>
      )}

      {/* Compare bar */}
      {compare.length > 0 && (
        <div className="glass mb-6 flex flex-wrap items-center justify-between gap-3 border-gold-500/40 p-4">
          <p className="text-sm font-black">
            <Scale className="inline h-4 w-4 text-gold-500 ml-1" />
            {compare.length} سيارات للمقارنة (حتى 3)
          </p>
          <div className="flex gap-2">
            <Link href="/compare" className="btn-gold !py-2 !px-5 text-sm">عرض المقارنة</Link>
            <button onClick={clearCompare} className="btn-outline !py-2 !px-4 text-sm">مسح</button>
          </div>
        </div>
      )}

      {/* Results */}
      <p className="mb-4 text-sm opacity-70">{filtered.length} سيارة {favOnly && "في المفضلة"}</p>
      {filtered.length === 0 ? (
        <div className="glass p-14 text-center">
          <p className="text-4xl mb-3">🏛️</p>
          <p className="font-black text-lg mb-1">لا توجد نتائج</p>
          <p className="text-sm opacity-70">جرّب تعديل الفلاتر أو البحث بكلمات أخرى</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
        </div>
      )}

      {paged.length < filtered.length && (
        <div className="mt-10 text-center">
          <button onClick={() => setPage(page + 1)} className="btn-outline">
            عرض المزيد ({filtered.length - paged.length})
          </button>
        </div>
      )}
    </div>
  );
}
