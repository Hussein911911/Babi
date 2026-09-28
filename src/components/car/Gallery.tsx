"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Expand } from "lucide-react";

export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const list = images.length ? images : ["/cars/land-cruiser.jpg"];

  const next = () => setIdx((i) => (i + 1) % list.length);
  const prev = () => setIdx((i) => (i - 1 + list.length) % list.length);

  return (
    <div>
      <div className="glass relative aspect-[16/10] overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            <Image src={list[idx]} alt={`${alt} — صورة ${idx + 1}`} fill priority sizes="(max-width:1024px) 100vw, 60vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>
        <button
          onClick={() => setOpen(true)}
          aria-label="تكبير الصورة"
          className="absolute top-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-charcoal/60 text-white backdrop-blur opacity-0 group-hover:opacity-100 transition"
        >
          <Expand className="h-4 w-4" />
        </button>
        {list.length > 1 && (
          <>
            <button onClick={prev} aria-label="السابق" className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-charcoal/60 text-white backdrop-blur hover:bg-gold-500 hover:text-charcoal transition">
              <ChevronRight className="h-5 w-5" />
            </button>
            <button onClick={next} aria-label="التالي" className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-charcoal/60 text-white backdrop-blur hover:bg-gold-500 hover:text-charcoal transition">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setIdx(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl2 border-2 transition ${i === idx ? "border-gold-500" : "border-transparent opacity-60 hover:opacity-100"}`}
              aria-label={`صورة ${i + 1}`}
            >
              <Image src={img} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 p-4"
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal
          >
            <button className="absolute top-5 left-5 text-white/80 hover:text-white" aria-label="إغلاق">
              <X className="h-8 w-8" />
            </button>
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              className="relative h-[80vh] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={list[idx]} alt={alt} fill sizes="100vw" className="object-contain" />
              {list.length > 1 && (
                <>
                  <button onClick={prev} aria-label="السابق" className="absolute right-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-gold-500 hover:text-charcoal transition">
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <button onClick={next} aria-label="التالي" className="absolute left-2 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-gold-500 hover:text-charcoal transition">
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
