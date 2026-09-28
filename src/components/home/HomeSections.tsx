"use client";

import Link from "next/link";
import Image from "next/image";
import { Reveal, Counter } from "@/components/Reveal";
import CarCard from "@/components/CarCard";
import { useApp } from "@/components/Providers";
import type { CarDTO } from "@/lib/types";
import {
  Car, RefreshCcw, Banknote, Ship, Wrench, FileCheck2, ArrowLeft, Quote,
} from "lucide-react";

export function StatsSection() {
  const stats = [
    { to: 1500, suffix: "+", label: "سيارة مباعة" },
    { to: 14, suffix: "", label: "سنة خبرة" },
    { to: 40, suffix: "+", label: "سيارة معروضة حالياً" },
    { to: 98, suffix: "%", label: "رضا العملاء" },
  ];
  return (
    <section className="border-y border-gold-500/15 bg-ishtar-950/30">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.08} className="text-center">
            <p className="text-4xl font-black text-gold-500 font-en md:text-5xl">
              <Counter to={s.to} suffix={s.suffix} />
            </p>
            <p className="mt-2 text-sm opacity-75">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function FeaturedSection({ cars }: { cars: CarDTO[] }) {
  const { t } = useApp();
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <Reveal className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black md:text-4xl">سيارات <span className="gold-text">مميزة</span></h2>
          <p className="mt-2 opacity-75">مختارات من أفخم سياراتنا المعروضة</p>
        </div>
        <Link href="/cars" className="btn-outline !py-2.5 !px-5 text-sm shrink-0">
          {t.common.viewAll} <ArrowLeft className="h-4 w-4" />
        </Link>
      </Reveal>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
      </div>
    </section>
  );
}

const SERVICES = [
  { icon: Car, title: "بيع وشراء", desc: "أفضل الأسعار للسيارات الجديدة والمستعملة مع فحص شامل." },
  { icon: RefreshCcw, title: "مقايضة", desc: "قايض سيارتك القديمة بأخرى أحدث وادفع الفرق فقط." },
  { icon: Banknote, title: "تمويل وتقسيط", desc: "خطط تقسيط مرنة تصل إلى 36 شهراً بدفعات مريحة." },
  { icon: Ship, title: "استيراد وشحن", desc: "استيراد من أمريكا والخليج مع متابعة كاملة حتى باب المعرض." },
  { icon: Wrench, title: "فحص فني", desc: "مركز فحص بأجهزة ألمانية حديثة وتقرير مفصل معتمد." },
  { icon: FileCheck2, title: "تسجيل ولوحات", desc: "ننجز معاملات التسجيل والسنوية واللوحات نيابة عنك." },
];

export function ServicesTeaser() {
  return (
    <section className="babylon-bg border-y border-gold-500/15 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal className="mb-12 text-center">
          <h2 className="text-3xl font-black md:text-4xl">خدماتنا <span className="gold-text">المتكاملة</span></h2>
          <p className="mt-3 opacity-75">كل ما تحتاجه في مكان واحد — من الاستيراد حتى التسجيل</p>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.07}>
              <Link href="/services" className="glass group block p-6 transition hover:shadow-glow h-full">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl2 bg-gradient-to-br from-ishtar-600 to-ishtar-900 border border-gold-500/30 transition group-hover:scale-110">
                  <s.icon className="h-6 w-6 text-gold-500" />
                </div>
                <h3 className="font-black mb-2">{s.title}</h3>
                <p className="text-sm leading-6 opacity-75">{s.desc}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  { name: "أبو علي — الحلة", text: "اشتريت لاند كروزر من المعرض، صدق بالتعامل وفحص حقيقي. أنصح أي واحد يريد سيارة نظيفة." },
  { name: "م. حيدر — بغداد", text: "قايضت سيارتي القديمة بجينيسيس G80 والفرق كان معقول جداً. خدمة راقية من الاستقبال للتسليم." },
  { name: "أم زهراء — كربلاء", text: "أخذنا سوناتا بالتقسيط، الإجراءات كانت سهلة وواضحة بدون تعقيد. شكراً بابل موتورز." },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <Reveal className="mb-12 text-center">
        <h2 className="text-3xl font-black md:text-4xl">ماذا يقول <span className="gold-text">عملاؤنا</span></h2>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((tm, i) => (
          <Reveal key={tm.name} delay={i * 0.1}>
            <figure className="glass p-6 h-full">
              <Quote className="h-7 w-7 text-gold-500/50 mb-3" />
              <blockquote className="text-sm leading-7 opacity-85">{tm.text}</blockquote>
              <figcaption className="mt-4 font-black text-gold-500 text-sm">{tm.name}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function BlogTeaser({ posts }: { posts: { slug: string; title: string; excerpt: string; cover: string }[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20">
      <Reveal className="mb-10 flex items-end justify-between">
        <h2 className="text-3xl font-black md:text-4xl">آخر <span className="gold-text">الأخبار</span></h2>
        <Link href="/blog" className="btn-outline !py-2.5 !px-5 text-sm">عرض الكل <ArrowLeft className="h-4 w-4" /></Link>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.08}>
            <Link href={`/blog/${p.slug}`} className="glass group block overflow-hidden h-full">
              <div className="relative aspect-video overflow-hidden">
                <Image src={p.cover || "/cars/lexus-lx600.jpg"} alt={p.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h3 className="font-black leading-7 group-hover:text-gold-500 transition">{p.title}</h3>
                <p className="mt-2 text-sm leading-6 opacity-70 line-clamp-2">{p.excerpt}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CTABanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20">
      <Reveal>
        <div className="glass babylon-bg relative overflow-hidden p-10 text-center md:p-16">
          <div className="absolute inset-0 bg-gradient-to-l from-ishtar-900/80 to-ishtar-950/90 -z-0" />
          <div className="relative">
            <h2 className="text-3xl font-black md:text-4xl text-sand">
              جاهز تركب سيارة أحلامك؟
            </h2>
            <p className="mx-auto mt-4 max-w-xl opacity-85 text-sand/90">
              زرنا في الحلة أو احجز تجربة قيادة مجانية — فريقنا بانتظارك بقهوة عراقية أصيلة ☕
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/cars" className="btn-gold">تصفح السيارات</Link>
              <Link href="/contact" className="btn-outline !text-sand !border-sand/40">اتصل بنا</Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
