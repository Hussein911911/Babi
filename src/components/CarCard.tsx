"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Scale, Gauge, Fuel, Cog, Share2, Rotate3D } from "lucide-react";
import { useUI } from "@/store/ui";
import { useApp } from "@/components/Providers";
import { cn, formatIQD, formatUSD, formatKm, parseArr, waLink } from "@/lib/utils";
import type { CarDTO } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function CarCard({ car, index = 0 }: { car: CarDTO; index?: number }) {
  const { favorites, toggleFavorite, compare, toggleCompare, setStageCar } = useUI();
  const { t } = useApp();
  const router = useRouter();
  const img = parseArr(car.images)[0] || "/cars/land-cruiser.jpg";
  const fav = favorites.includes(car.slug);
  const comp = compare.includes(car.slug);

  const share = () => {
    const url = `${window.location.origin}/cars/${car.slug}`;
    if (navigator.share) {
      navigator.share({ title: `${car.brand} ${car.model} ${car.year}`, url }).catch(() => {});
    } else {
      window.open(waLink(`شاهد هذه السيارة: ${car.brand} ${car.model} ${car.year}\n${url}`), "_blank");
    }
  };

  const showInStage = () => {
    setStageCar({
      slug: car.slug,
      brand: car.brand,
      model: car.model,
      year: car.year,
      priceUSD: car.priceUSD,
      colorHex: car.colorHex,
      bodyType: car.bodyType,
    });
    router.push("/#showroom-stage");
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      className="group glass overflow-hidden transition-shadow hover:shadow-glow"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Link href={`/cars/${car.slug}`} aria-label={`${car.brand} ${car.model}`}>
          <Image
            src={img}
            alt={`${car.brand} ${car.model} ${car.year}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {car.sold && <span className="badge bg-red-600 text-white">{t.common.sold}</span>}
          {car.featured && !car.sold && (
            <span className="badge bg-gold-500 text-charcoal">★ {t.common.featured}</span>
          )}
          <span className="badge bg-ishtar-600/90 text-white">{car.condition}</span>
        </div>
        {/* Quick actions */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 opacity-0 translate-x-2 transition group-hover:opacity-100 group-hover:translate-x-0">
          <button
            onClick={() => toggleFavorite(car.slug)}
            aria-label={t.common.favorite}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition",
              fav ? "bg-red-500 text-white" : "bg-charcoal/60 text-white hover:bg-red-500"
            )}
          >
            <Heart className={cn("h-4 w-4", fav && "fill-current")} />
          </button>
          <button
            onClick={() => toggleCompare(car.slug)}
            aria-label={t.common.compare}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition",
              comp ? "bg-gold-500 text-charcoal" : "bg-charcoal/60 text-white hover:bg-gold-500 hover:text-charcoal"
            )}
          >
            <Scale className="h-4 w-4" />
          </button>
          <button
            onClick={share}
            aria-label={t.common.share}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal/60 text-white backdrop-blur transition hover:bg-ishtar-500"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
        {/* 3D stage button */}
        {!car.sold && (
          <button
            onClick={showInStage}
            className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-charcoal/70 px-3 py-1.5 text-[11px] font-black text-gold-500 backdrop-blur opacity-0 translate-y-2 transition group-hover:opacity-100 group-hover:translate-y-0 hover:bg-gold-500 hover:text-charcoal"
          >
            <Rotate3D className="h-3.5 w-3.5" /> عرض 3D
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/cars/${car.slug}`} className="hover:text-gold-500 transition">
            <h3 className="font-black leading-6">
              {car.brand} {car.model}
            </h3>
            <p className="text-xs opacity-60 font-en">{car.year} • {car.colorName}</p>
          </Link>
          <div className="text-left shrink-0">
            <p className="font-black text-gold-500 font-en">{formatUSD(car.priceUSD)}</p>
            <p className="text-[11px] opacity-70">{formatIQD(car.priceUSD)}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-gold-500/10 pt-3 text-[11px] opacity-80">
          <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5 text-gold-500" />{formatKm(car.mileage)}</span>
          <span className="flex items-center gap-1"><Cog className="h-3.5 w-3.5 text-gold-500" />{car.transmission.split(" ")[0]}</span>
          <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5 text-gold-500" />{car.fuel}</span>
        </div>
      </div>
    </motion.article>
  );
}
