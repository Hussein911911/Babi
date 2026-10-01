"use client";

import Image from "next/image";
import { useApp } from "@/components/Providers";
import { useUI, type StageCar } from "@/store/ui";
import { Reveal } from "@/components/Reveal";
import ShowroomStage from "@/components/stage/ShowroomStage";
import { cn, parseArr } from "@/lib/utils";
import type { CarDTO } from "@/lib/types";

export default function StageSection({ cars }: { cars: CarDTO[] }) {
  const { t } = useApp();
  const { stageCar, setStageCar } = useUI();

  const toStage = (c: CarDTO): StageCar => ({
    slug: c.slug,
    brand: c.brand,
    model: c.model,
    year: c.year,
    priceUSD: c.priceUSD,
    colorHex: c.colorHex,
    bodyType: c.bodyType,
  });

  const initial = toStage(cars[0]);
  const activeSlug = stageCar?.slug ?? initial.slug;

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20 scroll-mt-24" id="stage">
      <Reveal className="mb-10 text-center">
        <h2 className="text-3xl font-black md:text-4xl">
          <span className="gold-text">{t.stage.title}</span>
        </h2>
        <p className="mt-3 opacity-75">{t.stage.sub}</p>
      </Reveal>

      <Reveal delay={0.1}>
        <ShowroomStage initialCar={initial} />
      </Reveal>

      {/* Car selector strip */}
      <Reveal delay={0.15} className="mt-6">
        <div className="flex gap-3 overflow-x-auto pb-2" role="tablist" aria-label="اختر سيارة للمسرح">
          {cars.map((c) => {
            const img = parseArr(c.images)[0];
            const active = activeSlug === c.slug;
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={active}
                onClick={() => setStageCar(toStage(c))}
                className={cn(
                  "glass relative shrink-0 w-40 overflow-hidden text-right transition-all",
                  active ? "border-gold-500/70 shadow-glow" : "opacity-70 hover:opacity-100"
                )}
              >
                <div className="relative h-20 w-full">
                  {img && (
                    <Image src={img} alt={`${c.brand} ${c.model}`} fill sizes="160px" className="object-cover" />
                  )}
                </div>
                <div className="p-2">
                  <p className="text-[11px] font-black truncate">{c.brand} {c.model}</p>
                  <p className="text-[10px] opacity-60 font-en">{c.year}</p>
                </div>
                {active && <span className="absolute top-1.5 left-1.5 h-2.5 w-2.5 rounded-full bg-gold-500 shadow-glow" />}
              </button>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
