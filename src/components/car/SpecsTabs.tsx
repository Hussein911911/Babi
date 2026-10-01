"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn, parseArr } from "@/lib/utils";
import type { CarDTO } from "@/lib/types";
import {
  Gauge, Ruler, Fuel, ShieldCheck, Armchair, Sparkles, Check,
} from "lucide-react";

export default function SpecsTabs({ car }: { car: CarDTO }) {
  const tabs = [
    { id: "engine", label: "المحرك والأداء", icon: Gauge },
    { id: "dims", label: "الأبعاد والوزن", icon: Ruler },
    { id: "fuel", label: "الاستهلاك", icon: Fuel },
    { id: "safety", label: "الأمان", icon: ShieldCheck },
    { id: "comfort", label: "الراحة والتقنية", icon: Armchair },
    { id: "exterior", label: "الخارجية", icon: Sparkles },
  ];
  const [tab, setTab] = useState("engine");

  const Row = ({ k, v }: { k: string; v: string | number }) => (
    <div className="flex items-center justify-between border-b border-gold-500/10 py-3 text-sm last:border-0">
      <span className="opacity-70">{k}</span>
      <span className="font-black">{v}</span>
    </div>
  );

  const List = ({ items }: { items: string[] }) => (
    <ul className="grid gap-2.5 sm:grid-cols-2 py-2">
      {items.length === 0 && <li className="text-sm opacity-60">—</li>}
      {items.map((f) => (
        <li key={f} className="flex items-center gap-2 text-sm">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500/15">
            <Check className="h-3 w-3 text-gold-500" />
          </span>
          {f}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="glass overflow-hidden">
      <div className="flex overflow-x-auto border-b border-gold-500/15" role="tablist">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            role="tab"
            aria-selected={tab === tb.id}
            onClick={() => setTab(tb.id)}
            className={cn(
              "relative flex shrink-0 items-center gap-2 px-5 py-4 text-sm font-black transition",
              tab === tb.id ? "text-gold-500" : "opacity-60 hover:opacity-100"
            )}
          >
            <tb.icon className="h-4 w-4" />
            {tb.label}
            {tab === tb.id && (
              <motion.span layoutId="spec-tab" className="absolute inset-x-3 bottom-0 h-0.5 bg-gold-500 rounded" />
            )}
          </button>
        ))}
      </div>

      <div className="p-5">
        {tab === "engine" && (
          <div>
            <Row k="المحرك" v={car.engine || "—"} />
            <Row k="عدد الأسطوانات" v={car.cylinders} />
            <Row k="القوة الحصانية" v={`${car.horsepower} حصان`} />
            <Row k="العزم" v={`${car.torque} نيوتن.متر`} />
            <Row k="التسارع 0-100 كم/س" v={`${car.acceleration} ثانية`} />
            <Row k="ناقل الحركة" v={car.transmission} />
            <Row k="نظام الدفع" v={car.drivetrain} />
          </div>
        )}
        {tab === "dims" && (
          <div>
            <Row k="الطول" v={car.lengthMm ? `${car.lengthMm} ملم` : "—"} />
            <Row k="العرض" v={car.widthMm ? `${car.widthMm} ملم` : "—"} />
            <Row k="الارتفاع" v={car.heightMm ? `${car.heightMm} ملم` : "—"} />
            <Row k="الوزن" v={car.weightKg ? `${car.weightKg} كغم` : "—"} />
            <Row k="عدد المقاعد" v={car.seats} />
            <Row k="عدد الأبواب" v={car.doors} />
          </div>
        )}
        {tab === "fuel" && (
          <div>
            <Row k="نوع الوقود" v={car.fuel} />
            <Row k="معدل الاستهلاك" v={car.fuelEconomy || "—"} />
            <Row k="الممشى" v={car.mileage === 0 ? "صفر (جديدة)" : `${car.mileage.toLocaleString("en-US")} كم`} />
          </div>
        )}
        {tab === "safety" && <List items={parseArr(car.safety)} />}
        {tab === "comfort" && <List items={parseArr(car.comfort)} />}
        {tab === "exterior" && <List items={parseArr(car.exterior)} />}
      </div>
    </div>
  );
}
