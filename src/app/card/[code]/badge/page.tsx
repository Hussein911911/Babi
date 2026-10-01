import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { qrDataURL, requestOrigin } from "@/lib/qr";
import PrintButton from "@/components/jobcard/PrintButton";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "بطاقة التوظيف", robots: { index: false } };

export default async function BadgePage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code).toUpperCase();
  const card = await prisma.jobCard.findUnique({ where: { code } });
  if (!card) notFound();

  const origin = requestOrigin();
  const url = `${origin}/card/${card.code}`;
  const qr = await qrDataURL(url);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#e9e4d8] px-4 py-10 print:bg-white">
      <div className="print-hide mb-6 flex items-center gap-3">
        <Link href={`/card/${card.code}`} className="btn-outline !py-2.5 !px-4 text-sm !text-[#1B4F8C] !border-[#1B4F8C]/40">
          <ArrowRight className="h-4 w-4" /> الاستمارة
        </Link>
        <PrintButton label="طباعة البطاقة" />
      </div>

      {/* ══ The card (85.6 × 54 mm ratio) ══ */}
      <div className="print-area w-[340px]">
        {/* Front */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#122c4a] via-[#1B4F8C] to-[#0E1116] text-white shadow-card" style={{ aspectRatio: "85.6/54" }}>
          <div className="babylon-bg absolute inset-0 opacity-25" />
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-l from-[#C9A227] via-[#f2dd8e] to-[#C9A227]" />
          <div className="relative flex h-full items-center justify-between gap-3 p-4">
            <div className="flex h-full flex-col justify-between py-1">
              <div>
                <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-lg border border-[#C9A227]/60 bg-[#0E1116]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#C9A227]">
                    <path d="M3 20v-2h1V9l8-5 8 5v9h1v2H3zm4-2h2v-6h2v6h2v-6h2v6h2V9.9L12 6.4 7 9.9V18z" />
                  </svg>
                </div>
                <p className="text-[13px] font-black leading-4">معرض بابل للسيارات</p>
                <p className="text-[7px] tracking-[0.3em] text-[#C9A227] font-en uppercase">Babylon Motors</p>
              </div>
              <div>
                <p className="text-[9px] text-white/60">بطاقة التقديم على وظيفة</p>
                <p className="font-en text-base font-black tracking-widest text-[#C9A227]" dir="ltr">{card.code}</p>
              </div>
            </div>
            <div className="shrink-0 rounded-xl bg-white p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt={`QR ${card.code}`} className="h-[92px] w-[92px]" />
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="relative mt-4 overflow-hidden rounded-2xl bg-white text-gray-800 shadow-card border border-gray-200" style={{ aspectRatio: "85.6/54" }}>
          <div className="absolute inset-x-0 top-0 h-1.5 bg-[#1B4F8C]" />
          <div className="flex h-full flex-col justify-between p-4 text-[9px] leading-4">
            <div>
              <p className="mb-1 text-[10px] font-black text-[#1B4F8C]">طريقة الاستخدام:</p>
              <ol className="mr-3 list-decimal space-y-0.5 text-gray-600">
                <li>امسح الباركود بكاميرا هاتفك</li>
                <li>املأ معلوماتك خطوة بخطوة</li>
                <li>اختر الوظيفة المناسبة من القائمة</li>
                <li>اضغط إتمام — تظهر معلومات صاحب العمل وتطبع الاستمارة</li>
              </ol>
            </div>
            <p className="border-t border-gray-200 pt-1.5 text-center text-gray-400">
              الحلة — شارع 60 • نفس الباركود يعرض استمارتك المكتملة بأي وقت
            </p>
          </div>
        </div>
      </div>

      <p className="print-hide mt-6 max-w-xs text-center text-xs text-gray-600">
        اطبع الوجهين وقصّهما بحجم بطاقة — أو أرسل الرابط للزبون مباشرة
      </p>
    </div>
  );
}
