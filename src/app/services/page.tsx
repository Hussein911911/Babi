import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Car, RefreshCcw, Banknote, Ship, Wrench, FileCheck2, ShoppingCart } from "lucide-react";

export const metadata: Metadata = {
  title: "خدماتنا",
  description: "بيع، شراء، مقايضة، تمويل وتقسيط، استيراد وشحن، فحص فني، تسجيل ولوحات — خدمات معرض بابل للسيارات.",
};

const SERVICES = [
  {
    icon: Car, title: "بيع السيارات",
    desc: "تشكيلة واسعة من السيارات الجديدة والمستعملة والواردة، جميعها مفحوصة بالكامل مع تقرير حالة موثق وضمان على المحرك والجير.",
    points: ["فحص كامل قبل العرض", "تقرير حالة موثق", "ضمان محرك وجير", "تجربة قيادة مجانية"],
  },
  {
    icon: ShoppingCart, title: "شراء سيارتك",
    desc: "نشتري سيارتك نقداً وبسعر عادل خلال ساعة واحدة — فحص فوري وتقييم شفاف ودفع كاش أو تحويل حسب رغبتك.",
    points: ["تقييم مجاني فوري", "دفع نقدي خلال ساعة", "نتكفل بإجراءات نقل الملكية"],
  },
  {
    icon: RefreshCcw, title: "المقايضة (Trade-in)",
    desc: "بدّل سيارتك القديمة بأحدث موديل وادفع الفرق فقط — نقبل أغلب السيارات ونقدم أفضل سعر مقايضة في المحافظة.",
    points: ["تقييم عادل لسيارتك", "فرق سعر مدروس", "إمكانية تقسيط الفرق"],
  },
  {
    icon: Banknote, title: "التمويل والتقسيط",
    desc: "خطط تقسيط مرنة تصل إلى 36 شهراً بالتعاون مع مصارف ومكاتب تمويل معتمدة، بدفعة أولى تبدأ من 20٪.",
    points: ["دفعة أولى من 20٪", "أقساط حتى 36 شهراً", "موافقات سريعة خلال 48 ساعة"],
  },
  {
    icon: Ship, title: "الاستيراد والشحن",
    desc: "استيراد مباشر من مزادات أمريكا (Copart / IAA) ودول الخليج مع متابعة كاملة من المزاد حتى باب المعرض.",
    points: ["تقارير Carfax موثقة", "شحن بحري مؤمَّن", "تخليص جمركي كامل"],
  },
  {
    icon: Wrench, title: "الفحص الفني",
    desc: "مركز فحص بأجهزة ألمانية حديثة: فحص كمبيوتر، شاصي، صبغ، محرك، وتقرير مفصل معتمد يمكنك الاعتماد عليه.",
    points: ["فحص كمبيوتر شامل", "كشف الصبغ والحوادث", "تقرير PDF معتمد"],
  },
  {
    icon: FileCheck2, title: "التسجيل واللوحات",
    desc: "ننجز كل معاملات التسجيل والسنوية واللوحات ونقل الملكية نيابة عنك — وقتك أثمن من طوابير الدوائر.",
    points: ["نقل ملكية", "سنوية ولوحات", "توكيلات وعقود أصولية"],
  },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-10">
      <Reveal className="mb-12 text-center">
        <h1 className="text-3xl font-black md:text-5xl">خدماتنا <span className="gold-text">المتكاملة</span></h1>
        <p className="mt-4 opacity-75 max-w-xl mx-auto">من لحظة اختيار السيارة حتى استلام اللوحات — كل شيء ننجزه لك تحت سقف واحد</p>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-2">
        {SERVICES.map((s, i) => (
          <Reveal key={s.title} delay={(i % 2) * 0.1}>
            <div className="glass p-7 h-full">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl2 bg-gradient-to-br from-ishtar-600 to-ishtar-900 border border-gold-500/30">
                  <s.icon className="h-7 w-7 text-gold-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black mb-2">{s.title}</h2>
                  <p className="text-sm leading-7 opacity-80">{s.desc}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {s.points.map((p) => (
                      <li key={p} className="badge border border-gold-500/30 text-gold-500 bg-gold-500/5">{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-14 text-center">
        <Link href="/contact" className="btn-gold">استفسر عن أي خدمة الآن</Link>
      </Reveal>
    </div>
  );
}
