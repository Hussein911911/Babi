"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

const FAQS = [
  { q: "هل تتوفر خدمة التقسيط؟ وما هي الشروط؟", a: "نعم، نوفر تقسيطاً حتى 36 شهراً بالتعاون مع مصارف ومكاتب تمويل معتمدة. الشروط الأساسية: دفعة أولى من 20٪، تعهد كفيل أو راتب موظف، وبطاقة سكن في المحافظة. الموافقة عادةً خلال 48 ساعة." },
  { q: "هل السيارات المستوردة مفحوصة؟", a: "كل سيارة تدخل المعرض تمر بفحص شامل في مركزنا الفني بأجهزة ألمانية: كمبيوتر، شاصي، صبغ، محرك وجير. التقرير يُسلَّم لك موثقاً مع السيارة، ونعرض تقرير Carfax للسيارات الأمريكية." },
  { q: "هل يمكنني مقايضة سيارتي القديمة؟", a: "بالتأكيد. أحضر سيارتك للمعرض، يقيّمها فريقنا خلال 30 دقيقة، وتدفع فرق السعر فقط — نقداً أو حتى بالتقسيط." },
  { q: "هل تشترون السيارات نقداً؟", a: "نعم، نشتري السيارات النظيفة بأسعار السوق العادلة مع دفع فوري نقداً أو تحويلاً في نفس اليوم، ونتكفل بإجراءات نقل الملكية." },
  { q: "ما هو الضمان الذي تقدمونه؟", a: "السيارات الجديدة (صفر) تأتي بضمان الوكالة الكامل. السيارات المستعملة المختارة نمنحها ضمان محرك وجير لمدة سنة أو حسب الاتفاق، موثقاً بعقد رسمي." },
  { q: "هل يمكن حجز سيارة قبل الشراء؟", a: "نعم، يمكنك حجز أي سيارة بعربون رمزي يُحسم من السعر النهائي، ويُسترد كاملاً خلال 3 أيام إذا غيّرت رأيك بعد الفحص." },
  { q: "هل توفرون خدمة الاستيراد حسب الطلب؟", a: "نعم — تخبرنا بالمواصفات والميزانية، ونستورد لك السيارة من مزادات أمريكا أو سوق الخليج مع متابعة كاملة بالصور والتقارير حتى وصولها للمعرض." },
  { q: "أين يقع المعرض وما أوقات الدوام؟", a: "المعرض في الحلة — شارع 60 مقابل بوابة بابل الأثرية. الدوام: السبت إلى الخميس 9 صباحاً – 9 مساءً، والجمعة 3 – 9 مساءً." },
];

export default function FaqClient() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-10">
      <Reveal className="mb-10 text-center">
        <h1 className="text-3xl font-black md:text-4xl">الأسئلة <span className="gold-text">الشائعة</span></h1>
        <p className="mt-3 opacity-75">لم تجد سؤالك؟ تواصل معنا مباشرة عبر واتساب</p>
      </Reveal>

      <div className="space-y-3">
        {FAQS.map((f, i) => (
          <Reveal key={i} delay={i * 0.04}>
            <div className="glass overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-4 p-5 text-right font-black hover:text-gold-500 transition"
              >
                {f.q}
                <ChevronDown className={cn("h-5 w-5 shrink-0 text-gold-500 transition-transform", open === i && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="px-5 pb-5 text-sm leading-8 opacity-80">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
