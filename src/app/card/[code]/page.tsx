import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { qrDataURL, requestOrigin } from "@/lib/qr";
import CardWizard from "@/components/jobcard/CardWizard";
import PrintButton from "@/components/jobcard/PrintButton";
import {
  BadgeCheck, Phone, MapPin, User, GraduationCap, Briefcase, CalendarDays, Building2, CreditCard,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "استمارة التقديم على وظيفة",
  robots: { index: false },
};

export default async function CardPage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code).toUpperCase();
  const card = await prisma.jobCard.findUnique({
    where: { code },
    include: { job: true },
  });

  /* ── Card not found ───────────────────────────── */
  if (!card) {
    return (
      <div className="hero-gradient babylon-bg flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="text-6xl mb-4">🪪</p>
        <h1 className="text-2xl font-black mb-2">البطاقة غير موجودة</h1>
        <p className="max-w-sm text-sm opacity-70 leading-7">
          الرمز <b className="font-en text-gold-500">{code}</b> غير مسجل لدينا.
          تأكد من مسح الباركود الصحيح أو راجع المعرض لإصدار بطاقة جديدة.
        </p>
        <Link href="/" className="btn-outline mt-8">العودة للموقع</Link>
      </div>
    );
  }

  /* ── Card still NEW → the step-by-step wizard ─── */
  if (card.status !== "COMPLETED") {
    const jobs = await prisma.job.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, category: true, location: true,
        salary: true, hours: true, description: true,
      },
    });

    return (
      <div className="hero-gradient babylon-bg min-h-screen px-4 py-10 md:py-16">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl2 bg-gradient-to-br from-ishtar-600 to-ishtar-900 border border-gold-500/40 shadow-glow">
            <svg viewBox="0 0 24 24" className="h-7 w-7 fill-gold-500">
              <path d="M3 20v-2h1V9l8-5 8 5v9h1v2H3zm4-2h2v-6h2v6h2v-6h2v6h2V9.9L12 6.4 7 9.9V18z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black md:text-3xl">استمارة التقديم على وظيفة</h1>
          <p className="mt-2 text-sm opacity-70">
            معرض بابل للسيارات — قسم التوظيف •
            <span className="font-en text-gold-500 mr-1">{card.code}</span>
          </p>
        </div>
        <CardWizard code={card.code} jobs={jobs} />
      </div>
    );
  }

  /* ── COMPLETED → printable استمارة with employer info ── */
  const origin = requestOrigin();
  const qr = await qrDataURL(`${origin}/card/${card.code}`);
  const d = card.completedAt ? new Date(card.completedAt) : new Date(card.createdAt);
  const dateStr = d.toLocaleDateString("ar-IQ", { year: "numeric", month: "long", day: "numeric" });

  const Row = ({ icon: Icon, k, v }: { icon: React.ElementType; k: string; v: string }) => (
    <div className="flex items-center gap-3 border-b border-dashed border-gray-300 py-3 last:border-0">
      <Icon className="h-4 w-4 shrink-0 text-[#1B4F8C]" />
      <span className="w-32 shrink-0 text-xs text-gray-500">{k}</span>
      <span className="font-black text-sm text-gray-900">{v}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#e9e4d8] px-4 py-10 print:bg-white print:p-0">
      {/* Actions (hidden on print) */}
      <div className="print-hide mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full bg-green-600/15 border border-green-600/40 px-4 py-2 text-sm font-black text-green-700">
          <BadgeCheck className="h-4 w-4" /> الاستمارة مكتملة — جاهزة للطباعة والتقديم
        </div>
        <div className="flex gap-2">
          <Link href={`/card/${card.code}/badge`} className="btn-outline !py-2.5 !px-4 text-sm !text-[#1B4F8C] !border-[#1B4F8C]/40">
            <CreditCard className="h-4 w-4" /> عرض البطاقة
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* ══ The printable document ══ */}
      <div className="print-area mx-auto max-w-3xl overflow-hidden rounded-xl2 bg-white text-gray-900 shadow-card print:rounded-none print:shadow-none">
        {/* Header */}
        <div className="relative bg-[#1B4F8C] px-6 py-5 text-white">
          <div className="babylon-bg absolute inset-0 opacity-20" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl2 border border-[#C9A227]/70 bg-[#0E1116]">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#C9A227]">
                  <path d="M3 20v-2h1V9l8-5 8 5v9h1v2H3zm4-2h2v-6h2v6h2v-6h2v6h2V9.9L12 6.4 7 9.9V18z" />
                </svg>
              </div>
              <div>
                <p className="font-black">معرض بابل للسيارات — قسم التوظيف</p>
                <p className="text-[10px] tracking-[0.25em] text-[#C9A227] font-en uppercase">Babylon Motors Recruitment</p>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt={`QR ${card.code}`} className="h-20 w-20 rounded-lg bg-white p-1" />
          </div>
        </div>
        <div className="h-2 bg-gradient-to-l from-[#C9A227] via-[#f2dd8e] to-[#C9A227]" />

        <div className="p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-black">استمارة التقديم على وظيفة</h1>
            <div className="text-left text-xs text-gray-500">
              <p>رقم البطاقة: <b className="font-en text-[#1B4F8C]">{card.code}</b></p>
              <p>تاريخ الإتمام: <b>{dateStr}</b></p>
            </div>
          </div>

          {/* Applicant */}
          <section className="mb-6 rounded-xl2 border border-gray-200 p-5">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-[#1B4F8C]">
              <User className="h-4 w-4" /> معلومات المتقدم
            </h2>
            <Row icon={User} k="الاسم الكامل" v={card.fullName} />
            <Row icon={CalendarDays} k="العمر" v={`${card.age} سنة`} />
            <Row icon={Phone} k="رقم الهاتف" v={card.phone} />
            <Row icon={MapPin} k="العنوان" v={card.address} />
            <Row icon={GraduationCap} k="التحصيل الدراسي" v={card.education} />
            <Row icon={Briefcase} k="الخبرة" v={card.experience || "لا توجد"} />
          </section>

          {/* Job */}
          {card.job && (
            <section className="mb-6 rounded-xl2 border border-gray-200 p-5">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-[#1B4F8C]">
                <Briefcase className="h-4 w-4" /> الوظيفة المتقدَّم إليها
              </h2>
              <Row icon={Briefcase} k="العنوان الوظيفي" v={card.job.title} />
              <Row icon={Briefcase} k="الفئة" v={card.job.category} />
              <Row icon={MapPin} k="موقع العمل" v={card.job.location} />
              {card.job.salary && <Row icon={Briefcase} k="الراتب" v={card.job.salary} />}
              {card.job.hours && <Row icon={Briefcase} k="ساعات الدوام" v={card.job.hours} />}
            </section>
          )}

          {/* Employer — revealed after completion */}
          {card.job && (
            <section className="mb-6 rounded-xl2 border-2 border-[#C9A227] bg-[#C9A227]/10 p-5">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-black text-[#8a6d12]">
                <Building2 className="h-4 w-4" /> معلومات صاحب العمل
              </h2>
              <Row icon={User} k="الاسم" v={card.job.employerName} />
              <Row icon={Phone} k="رقم الهاتف" v={card.job.employerPhone} />
              {card.job.employerAddress && <Row icon={MapPin} k="العنوان" v={card.job.employerAddress} />}
            </section>
          )}

          {/* Signatures */}
          <div className="mt-10 grid grid-cols-2 gap-10 text-center text-xs text-gray-500">
            <div>
              <div className="mb-2 border-b border-gray-400 pb-8" />
              توقيع المتقدم
            </div>
            <div>
              <div className="mb-2 border-b border-gray-400 pb-8" />
              ختم وتوقيع المعرض
            </div>
          </div>

          <p className="mt-8 border-t border-gray-200 pt-4 text-center text-[10px] leading-5 text-gray-400">
            هذه الاستمارة صادرة من معرض بابل للسيارات — الحلة، بابل • يمكن التحقق منها بأي وقت عبر مسح الباركود أعلاه
            <br />
            <span className="font-en" dir="ltr">{origin}/card/{card.code}</span>
          </p>
        </div>
      </div>

      <div className="print-hide mx-auto mt-6 max-w-3xl text-center text-xs opacity-60 text-gray-700">
        امسح نفس باركود البطاقة بأي وقت لعرض هذه الاستمارة مجدداً
      </div>
    </div>
  );
}
