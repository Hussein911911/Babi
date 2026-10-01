import type { Metadata } from "next";
import SellForm from "@/components/SellForm";
import { Reveal } from "@/components/Reveal";
import { BadgeDollarSign, Clock3, FileCheck2 } from "lucide-react";

export const metadata: Metadata = {
  title: "بِع سيارتك",
  description: "بِع سيارتك لمعرض بابل للسيارات — تقييم مجاني ودفع نقدي خلال ساعة.",
};

export default function SellPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-10">
      <Reveal className="mb-10 text-center">
        <h1 className="text-3xl font-black md:text-5xl">بِع سيارتك <span className="gold-text">خلال ساعة</span></h1>
        <p className="mt-4 opacity-75 max-w-xl mx-auto">
          املأ النموذج وأرفق صور سيارتك — فريق التقييم سيتواصل معك بأفضل سعر خلال ساعات الدوام
        </p>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SellForm />
        </div>
        <div className="space-y-4">
          {[
            { icon: BadgeDollarSign, title: "سعر عادل", desc: "تقييم شفاف حسب سعر السوق الفعلي — بدون تنزيلات وهمية." },
            { icon: Clock3, title: "دفع فوري", desc: "بعد الاتفاق، تستلم المبلغ نقداً أو تحويلاً في نفس اليوم." },
            { icon: FileCheck2, title: "بدون عناء", desc: "نتكفل بكامل إجراءات نقل الملكية والأوراق نيابة عنك." },
          ].map((b, i) => (
            <Reveal key={b.title} delay={i * 0.08}>
              <div className="glass flex gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl2 bg-gold-500/10 border border-gold-500/30">
                  <b.icon className="h-6 w-6 text-gold-500" />
                </div>
                <div>
                  <p className="font-black">{b.title}</p>
                  <p className="text-sm opacity-75 leading-6 mt-1">{b.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
