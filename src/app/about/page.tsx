import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, Counter } from "@/components/Reveal";
import { Landmark, HandshakeIcon, ShieldCheck, Gem } from "lucide-react";

export const metadata: Metadata = {
  title: "من نحن",
  description: "قصة معرض بابل للسيارات في الحلة — 14 عاماً من الثقة والفخامة في قلب محافظة بابل.",
};

const VALUES = [
  { icon: ShieldCheck, title: "الصدق والشفافية", desc: "كل سيارة تُعرض بتقرير فحص حقيقي وتاريخ واضح — لا مفاجآت بعد الشراء." },
  { icon: Gem, title: "الفخامة أسلوب حياة", desc: "نختار سياراتنا بعناية لتليق بذوق عملائنا، من الاقتصادية النظيفة إلى الفاخرة النادرة." },
  { icon: HandshakeIcon, title: "علاقة تدوم", desc: "علاقتنا بالعميل لا تنتهي بالبيع — خدمة ما بعد البيع والصيانة والاستشارة مستمرة." },
  { icon: Landmark, title: "فخر الانتماء لبابل", desc: "من أرض الحضارات الأولى نستمد هويتنا — بوابة عشتار وأسد بابل رمزان في شعارنا وروحنا." },
];

export default function AboutPage() {
  return (
    <div className="pt-28 pb-10">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal>
          <h1 className="text-3xl font-black md:text-5xl text-center">
            قصتنا بدأت من <span className="gold-text">أرض الحضارات</span>
          </h1>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-8 max-w-3xl text-center">
          <p className="leading-9 opacity-85 text-lg">
            في عام 2010، وعلى بُعد كيلومترات من أطلال بابل العظيمة وبوابة عشتار الخالدة، فتح
            <b> معرض بابل للسيارات </b>
            أبوابه في مدينة الحلة برؤية واحدة: أن يكون وجهة أهالي بابل والفرات الأوسط الأولى
            لاقتناء سيارات تجمع بين الجودة والفخامة والسعر العادل.
          </p>
          <p className="mt-5 leading-9 opacity-85 text-lg">
            بدأنا بصالة صغيرة وست سيارات، واليوم نمتلك صالة عرض بمساحة 2000 متر مربع، ومركز فحص فني
            بأجهزة ألمانية، وفريقاً من 20 موظفاً، وشبكة استيراد مباشرة من الولايات المتحدة ودول الخليج.
            أكثر من 1500 عائلة عراقية اختارت سيارتها من عندنا — وهذه أمانة نعتز بها كل يوم.
          </p>
        </Reveal>

        {/* Stats */}
        <div className="mt-14 grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { to: 2010, label: "سنة التأسيس", raw: true },
            { to: 1500, label: "سيارة مباعة", suffix: "+" },
            { to: 20, label: "موظفاً متخصصاً" },
            { to: 2000, label: "م² مساحة الصالة" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="glass p-6 text-center">
                <p className="text-3xl font-black text-gold-500 font-en">
                  {s.raw ? s.to : <Counter to={s.to} suffix={s.suffix || ""} />}
                </p>
                <p className="mt-1 text-sm opacity-70">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Values */}
        <Reveal className="mt-20 mb-10 text-center">
          <h2 className="text-3xl font-black">قيمنا <span className="gold-text">الراسخة</span></h2>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <div className="glass p-6 h-full text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-ishtar-600 to-ishtar-900 border border-gold-500/30">
                  <v.icon className="h-7 w-7 text-gold-500" />
                </div>
                <h3 className="font-black mb-2">{v.title}</h3>
                <p className="text-sm leading-6 opacity-75">{v.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 text-center">
          <Link href="/contact" className="btn-gold">زرنا في الحلة — نستناك بقهوة عراقية</Link>
        </Reveal>
      </div>
    </div>
  );
}
