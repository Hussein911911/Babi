/** Seed jobs + a demo job card. Run: npx tsx prisma/seed-jobs.ts */
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: `file:${path.join(__dirname, "dev.db")}` });
const prisma = new PrismaClient({ adapter });

const jobs = [
  {
    title: "سائق خصوصي", category: "سياقة", location: "الحلة — حي الجمعية", salary: "600 ألف د.ع شهرياً",
    hours: "8 ساعات — 6 أيام بالأسبوع",
    description: "مطلوب سائق خصوصي لعائلة، يشترط إجازة سوق سارية وخبرة لا تقل عن سنتين وحسن المظهر.",
    employerName: "حاج كريم الخفاجي", employerPhone: "07801112233", employerAddress: "الحلة — حي الجمعية — قرب الجامع الكبير",
  },
  {
    title: "ميكانيكي سيارات", category: "صيانة", location: "الحلة — الصناعية", salary: "حسب الخبرة + نسبة",
    hours: "9 صباحاً – 6 مساءً",
    description: "ورشة صيانة حديثة تطلب ميكانيكي محترف على السيارات الكورية واليابانية، يفضل من لديه خبرة بأجهزة الفحص.",
    employerName: "ورشة النجوم — أبو علي", employerPhone: "07709998811", employerAddress: "الحلة — المنطقة الصناعية — قطعة 14",
  },
  {
    title: "موظفة استقبال", category: "إدارة", location: "الحلة — شارع 60", salary: "500 ألف د.ع شهرياً",
    hours: "9 صباحاً – 5 مساءً",
    description: "شركة تجارية تطلب موظفة استقبال، يشترط شهادة إعدادية فما فوق وإجادة استخدام الحاسوب.",
    employerName: "شركة الفرات للتجارة", employerPhone: "07712345600", employerAddress: "الحلة — شارع 60 — عمارة الفرات ط2",
  },
  {
    title: "عامل مخزن", category: "عمال", location: "بابل — المحاويل", salary: "450 ألف د.ع شهرياً",
    hours: "8 ساعات مع ساعة استراحة",
    description: "مخازن مواد غذائية تطلب عامل ترتيب وتحميل، العمر بين 18 و40 سنة، لا يشترط التحصيل الدراسي.",
    employerName: "مخازن الرافدين", employerPhone: "07805556644", employerAddress: "المحاويل — الشارع العام — مجمع الرافدين",
  },
  {
    title: "محاسب", category: "إدارة", location: "الحلة — مركز المدينة", salary: "750 ألف د.ع شهرياً",
    hours: "9 صباحاً – 4 مساءً",
    description: "مكتب تجاري يطلب محاسب بشهادة بكالوريوس إدارة واقتصاد، خبرة لا تقل عن 3 سنوات ببرامج المحاسبة.",
    employerName: "مكتب الأمانة التجاري", employerPhone: "07901234588", employerAddress: "الحلة — شارع الإمام علي — قرب المصرف",
  },
  {
    title: "كهربائي سيارات", category: "صيانة", location: "الحلة — الصناعية", salary: "يومية 25 ألف + نسبة",
    hours: "9 صباحاً – 6 مساءً",
    description: "مطلوب كهربائي سيارات خبرة بالأنظمة الحديثة والهايبرد، العمل داخل ورشة مجهزة بالكامل.",
    employerName: "ورشة بابل الحديثة", employerPhone: "07708887755", employerAddress: "الحلة — الصناعية الجديدة — خلف معرض الزهراء",
  },
  {
    title: "حارس ليلي", category: "عمال", location: "الحلة — طريق بغداد", salary: "400 ألف د.ع شهرياً",
    hours: "8 مساءً – 6 صباحاً",
    description: "معمل مواد إنشائية يطلب حارس ليلي، يفضل من سكنة المنطقة، يشترط مخاطبة أمنية سليمة.",
    employerName: "معمل النهرين", employerPhone: "07812223344", employerAddress: "طريق بغداد — حلة — مقابل محطة الوقود",
  },
  {
    title: "مندوب مبيعات", category: "مبيعات", location: "بابل — عموم المحافظة", salary: "راتب + عمولة مجزية",
    hours: "مرن",
    description: "شركة مواد غذائية تطلب مندوب مبيعات يمتلك سيارة، خبرة بالسوق المحلي، راتب ثابت مع عمولة على المبيعات.",
    employerName: "شركة الحلة الذهبية", employerPhone: "07714567890", employerAddress: "الحلة — حي الأكرمين — مجمع الذهبية التجاري",
  },
];

async function main() {
  console.log("🌱 Seeding jobs...");
  for (const job of jobs) {
    const exists = await prisma.job.findFirst({ where: { title: job.title, employerName: job.employerName } });
    if (!exists) await prisma.job.create({ data: job });
  }

  // Demo card (code printed on physical cards)
  await prisma.jobCard.upsert({
    where: { code: "BM-DEMO01" },
    update: {},
    create: { code: "BM-DEMO01" },
  });

  console.log("✅ Jobs:", await prisma.job.count(), "| Cards:", await prisma.jobCard.count());
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
