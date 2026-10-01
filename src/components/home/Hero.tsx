"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ChevronDown, Star } from "lucide-react";
import { useApp } from "@/components/Providers";

export default function Hero() {
  const { t } = useApp();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, 150]);
  const y2 = useTransform(scrollY, [0, 600], [0, -80]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="hero-gradient relative flex min-h-[92vh] items-center overflow-hidden pt-24">
      {/* Babylon pattern layer (parallax) */}
      <motion.div style={reduce ? {} : { y: y1 }} className="babylon-bg absolute inset-0 opacity-60" aria-hidden />
      {/* Lion watermark */}
      <motion.div
        style={reduce ? {} : { y: y2 }}
        className="pointer-events-none absolute -left-10 bottom-10 hidden lg:block opacity-[0.07]"
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/patterns/lion.svg" alt="" width={520} height={310} />
      </motion.div>

      <motion.div style={reduce ? {} : { opacity }} className="relative mx-auto max-w-7xl px-4 text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="badge mx-auto mb-6 border border-gold-500/40 bg-gold-500/10 text-gold-500 !px-4 !py-1.5"
        >
          <Star className="h-3.5 w-3.5 fill-gold-500" /> {t.hero.badge}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-4xl font-black leading-tight md:text-6xl lg:text-7xl"
        >
          {t.hero.title1}
          <br />
          <span className="gold-text gold-shimmer">{t.hero.title2}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-8 opacity-85 md:text-lg"
        >
          {t.hero.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-9 flex flex-wrap justify-center gap-4"
        >
          <Link href="/cars" className="btn-gold text-base">
            {t.hero.cta1}
          </Link>
          <Link href="/contact" className="btn-outline text-base">
            {t.hero.cta2}
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.a
        href="#showroom-stage"
        aria-label={t.hero.scroll}
        animate={reduce ? {} : { y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gold-500"
      >
        <ChevronDown className="h-7 w-7" />
      </motion.a>

      {/* Bottom ishtar divider */}
      <div className="divider-ishtar absolute bottom-0 inset-x-0" />
    </section>
  );
}
