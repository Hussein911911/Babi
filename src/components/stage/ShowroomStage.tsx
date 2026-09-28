"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DoorOpen, DoorClosed, Palette, LifeBuoy, MousePointer2 } from "lucide-react";
import { useApp } from "@/components/Providers";
import { useUI, type StageCar } from "@/store/ui";
import { formatIQD, formatUSD, cn } from "@/lib/utils";
import type { RimStyle } from "./CarModel";

const Stage3D = dynamic(() => import("./Stage3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="h-14 w-14 mx-auto rounded-full border-2 border-gold-500 border-t-transparent animate-spin" />
        <p className="mt-3 text-sm font-bold text-gold-500">جارِ تحميل المسرح ثلاثي الأبعاد...</p>
      </div>
    </div>
  ),
});

const PAINTS = [
  { name: "أبيض لؤلؤي", hex: "#f2f0eb" },
  { name: "أسود فحمي", hex: "#101216" },
  { name: "أزرق عشتار", hex: "#1B4F8C" },
  { name: "ذهبي بابلي", hex: "#C9A227" },
  { name: "أحمر نبيذي", hex: "#6e1423" },
  { name: "رمادي تيتانيوم", hex: "#7a7f87" },
  { name: "أخضر ملكي", hex: "#12352a" },
];

export default function ShowroomStage({ initialCar }: { initialCar: StageCar }) {
  const { t } = useApp();
  const { stageCar, setStageCar } = useUI();
  const car = stageCar ?? initialCar;

  const [color, setColor] = useState(car.colorHex);
  const [rimStyle, setRimStyle] = useState<RimStyle>("sport");
  const [interior, setInterior] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => setColor(car.colorHex), [car.colorHex, car.slug]);

  // Only mount WebGL when scrolled into view (performance)
  useEffect(() => {
    const el = document.getElementById("showroom-stage");
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (initialCar && !stageCar) setStageCar(initialCar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="showroom-stage" className="relative">
      <div className="glass overflow-hidden">
        {/* Car info bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold-500/15 px-5 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={car.slug}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
            >
              <p className="text-lg md:text-xl font-black">
                {car.brand} <span className="text-gold-500">{car.model}</span>{" "}
                <span className="font-en text-sm opacity-70">{car.year}</span>
              </p>
              <p className="text-sm opacity-80">
                {formatUSD(car.priceUSD)} <span className="opacity-50 mx-1">•</span> {formatIQD(car.priceUSD)}
              </p>
            </motion.div>
          </AnimatePresence>
          <Link href={`/cars/${car.slug}`} className="btn-outline !py-2 !px-4 text-sm">
            {t.stage.viewDetails}
          </Link>
        </div>

        {/* 3D viewport */}
        <div className="relative h-[420px] md:h-[520px] bg-gradient-to-b from-transparent to-ishtar-950/40">
          {visible && (
            <Stage3D
              color={color}
              rimStyle={rimStyle}
              bodyType={car.bodyType}
              interior={interior}
              showHotspots
            />
          )}
          {/* Drag hint */}
          {!interior && (
            <div className="pointer-events-none absolute bottom-3 inset-x-0 flex justify-center">
              <span className="flex items-center gap-2 rounded-full bg-charcoal/60 px-4 py-1.5 text-[11px] text-sand/80 backdrop-blur">
                <MousePointer2 className="h-3.5 w-3.5" />
                {t.stage.drag}
              </span>
            </div>
          )}
          {/* Interior/exterior button */}
          <div className="absolute top-4 left-4">
            <button
              onClick={() => setInterior(!interior)}
              className={cn(
                "flex items-center gap-2 rounded-xl2 px-4 py-2.5 text-sm font-black shadow-glow transition",
                interior
                  ? "bg-charcoal/90 text-gold-500 border border-gold-500/50"
                  : "bg-gradient-to-l from-gold-500 to-gold-400 text-charcoal"
              )}
            >
              {interior ? <DoorClosed className="h-4 w-4" /> : <DoorOpen className="h-4 w-4" />}
              {interior ? t.stage.exit : t.stage.enter}
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-6 border-t border-gold-500/15 px-5 py-4">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-black opacity-70">
              <Palette className="h-3.5 w-3.5 text-gold-500" /> {t.stage.paint}
            </p>
            <div className="flex gap-2">
              {PAINTS.map((p) => (
                <button
                  key={p.hex}
                  title={p.name}
                  aria-label={p.name}
                  onClick={() => setColor(p.hex)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                    color === p.hex ? "border-gold-500 scale-110 shadow-glow" : "border-white/20"
                  )}
                  style={{ background: p.hex }}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-black opacity-70">
              <LifeBuoy className="h-3.5 w-3.5 text-gold-500" /> {t.stage.rims}
            </p>
            <div className="flex gap-2">
              {(["sport", "classic"] as RimStyle[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRimStyle(r)}
                  className={cn(
                    "rounded-xl2 border px-4 py-1.5 text-xs font-black transition",
                    rimStyle === r
                      ? "border-gold-500 bg-gold-500/15 text-gold-500"
                      : "border-white/15 opacity-70 hover:opacity-100"
                  )}
                >
                  {r === "sport" ? "رياضية 5" : "كلاسيك 8"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
