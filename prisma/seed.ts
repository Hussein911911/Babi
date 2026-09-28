import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({
  url: `file:${path.join(__dirname, "dev.db")}`,
});
const prisma = new PrismaClient({ adapter });

const J = (a: string[]) => JSON.stringify(a);

const cars = [
  {
    slug: "toyota-land-cruiser-vxr-2024",
    brand: "تويوتا", model: "لاند كروزر VXR", year: 2024,
    priceUSD: 96000, negotiable: true, mileage: 0,
    transmission: "أوتوماتيك 10 سرعات", fuel: "بنزين", bodyType: "SUV",
    condition: "جديد", colorName: "أبيض لؤلؤي", colorHex: "#f2f0eb",
    engine: "3.5L V6 Twin-Turbo", cylinders: 6, horsepower: 409, torque: 650,
    acceleration: 6.7, drivetrain: "دفع رباعي", seats: 7, doors: 5,
    fuelEconomy: "8.9 كم/لتر", lengthMm: 4950, widthMm: 1980, heightMm: 1945, weightKg: 2560,
    safety: J(["10 أكياس هوائية", "نظام Toyota Safety Sense", "كاميرا 360°", "مستشعرات أمامية وخلفية", "مثبت سرعة تكيّفي", "تحذير مغادرة المسار"]),
    comfort: J(["مقاعد جلد مبردة ومدفأة", "شاشة 12.3 بوصة", "نظام صوتي JBL", "فتحة سقف", "تحكم مناخي 4 مناطق", "شحن لاسلكي"]),
    exterior: J(["جنوط 20 بوصة", "إضاءة LED كاملة", "سقف بانورامي", "عتبات كهربائية"]),
    images: J(["/cars/land-cruiser.jpg"]),
    description: "لاند كروزر VXR 2024 وارد وكالة، أعلى فئة، محرك تيربو مزدوج بقوة 409 حصان. سيارة العائلة والصحراء الأولى في العراق — فخامة وقوة لا تُضاهى.",
    vin: "JTMHY7AJ4R4123456", inspection: "فحص وكالة كامل — لا ملاحظات", warranty: "ضمان الوكالة 3 سنوات أو 100,000 كم",
    featured: true, sold: false, views: 812,
  },
  {
    slug: "mercedes-e200-amg-2023",
    brand: "مرسيدس", model: "E200 AMG Line", year: 2023,
    priceUSD: 68000, negotiable: true, mileage: 14500,
    transmission: "أوتوماتيك 9 سرعات", fuel: "بنزين", bodyType: "سيدان",
    condition: "وارد خليجي", colorName: "أسود أوبسيديان", colorHex: "#101216",
    engine: "2.0L Turbo", cylinders: 4, horsepower: 204, torque: 320,
    acceleration: 7.5, drivetrain: "دفع خلفي", seats: 5, doors: 4,
    fuelEconomy: "13.5 كم/لتر", lengthMm: 4949, widthMm: 1852, heightMm: 1460, weightKg: 1765,
    safety: J(["9 أكياس هوائية", "Active Brake Assist", "كاميرا 360°", "Attention Assist", "مثبت سرعة تكيّفي"]),
    comfort: J(["مقاعد جلد كهربائية بذاكرة", "شاشتين 12.3 بوصة", "إضاءة محيطية 64 لون", "نظام Burmester الصوتي", "فتحة سقف بانورامية"]),
    exterior: J(["حزمة AMG الخارجية", "جنوط AMG 19 بوصة", "إضاءة Multibeam LED"]),
    images: J(["/cars/mercedes-e200.jpg"]),
    description: "مرسيدس E200 حزمة AMG وارد خليجي بحالة الوكالة، ممشى قليل جداً، صبغ وكالة بالكامل، فحص كامل بالتقرير.",
    vin: "W1KZF8DB4PB123789", inspection: "تقرير فحص كامل — صبغ وكالة 100%", warranty: "ضمان محرك وجير سنة",
    featured: true, sold: false, views: 640,
  },
  {
    slug: "lexus-lx600-signature-2024",
    brand: "لكزس", model: "LX600 Signature", year: 2024,
    priceUSD: 128000, negotiable: false, mileage: 0,
    transmission: "أوتوماتيك 10 سرعات", fuel: "بنزين", bodyType: "SUV",
    condition: "جديد", colorName: "رمادي تيتانيوم", colorHex: "#7a7f87",
    engine: "3.5L V6 Twin-Turbo", cylinders: 6, horsepower: 415, torque: 650,
    acceleration: 7.0, drivetrain: "دفع رباعي", seats: 7, doors: 5,
    fuelEconomy: "8.3 كم/لتر", lengthMm: 5100, widthMm: 1990, heightMm: 1885, weightKg: 2680,
    safety: J(["10 أكياس هوائية", "Lexus Safety System+ 2.5", "كاميرا 360° بعرض شفاف", "رادار النقطة العمياء"]),
    comfort: J(["مقاعد شبه أنيليّة مدلكة", "شاشتان 12.3 و7 بوصة", "نظام Mark Levinson بـ25 سماعة", "برّاد داخلي", "ستائر كهربائية"]),
    exterior: J(["جنوط 22 بوصة مصقولة", "شبك Signature الأمامي", "إضاءة LED ثلاثية"]),
    images: J(["/cars/lexus-lx600.jpg"]),
    description: "لكزس LX600 سيغنتشر 2024 صفر، أفخم SUV ياباني — تحفة هندسية تجمع الفخامة اليابانية بقدرات الطرق الوعرة.",
    vin: "JTJGB7CX4R4001234", inspection: "وكالة — صفر كيلومتر", warranty: "ضمان الوكالة 4 سنوات",
    featured: true, sold: false, views: 1024,
  },
  {
    slug: "nissan-patrol-platinum-2023",
    brand: "نيسان", model: "باترول بلاتينيوم", year: 2023,
    priceUSD: 74000, negotiable: true, mileage: 22000,
    transmission: "أوتوماتيك 7 سرعات", fuel: "بنزين", bodyType: "SUV",
    condition: "وارد خليجي", colorName: "أبيض لؤلؤي", colorHex: "#f4f2ec",
    engine: "5.6L V8", cylinders: 8, horsepower: 400, torque: 560,
    acceleration: 6.6, drivetrain: "دفع رباعي", seats: 8, doors: 5,
    fuelEconomy: "7.1 كم/لتر", lengthMm: 5175, widthMm: 1995, heightMm: 1940, weightKg: 2735,
    safety: J(["8 أكياس هوائية", "كاميرا 360°", "تحذير اصطدام أمامي", "مستشعرات شاملة"]),
    comfort: J(["مقاعد جلد مبردة", "شاشات خلفية", "نظام Bose الصوتي", "فتحة سقف", "تحكم مناخي خلفي"]),
    exterior: J(["جنوط 20 بوصة", "إضاءة LED", "رفارف كروم"]),
    images: J(["/cars/nissan-patrol.jpg"]),
    description: "باترول بلاتينيوم V8 وارد خليجي، ملك الصحراء بحالة ممتازة، صيانة وكالة موثقة.",
    vin: "JN8AY2NY4PX654321", inspection: "فحص كامل — ضربة رفرف خلفي مصلحة", warranty: "—",
    featured: true, sold: false, views: 530,
  },
  {
    slug: "genesis-g80-royal-2024",
    brand: "جينيسيس", model: "G80 رويال", year: 2024,
    priceUSD: 62000, negotiable: false, mileage: 0,
    transmission: "أوتوماتيك 8 سرعات", fuel: "بنزين", bodyType: "سيدان",
    condition: "جديد", colorName: "أخضر ملكي غامق", colorHex: "#12352a",
    engine: "2.5L Turbo", cylinders: 4, horsepower: 304, torque: 422,
    acceleration: 6.0, drivetrain: "دفع رباعي", seats: 5, doors: 4,
    fuelEconomy: "11.2 كم/لتر", lengthMm: 4995, widthMm: 1925, heightMm: 1465, weightKg: 1950,
    safety: J(["10 أكياس هوائية", "قيادة شبه ذاتية HDA II", "كاميرا 360° ثلاثية الأبعاد", "فرملة طوارئ تلقائية"]),
    comfort: J(["مقاعد Nappa مهواة", "شاشة 14.5 بوصة", "نظام Lexicon بـ21 سماعة", "عزل صوتي فائق", "شاشة عدادات 3D"]),
    exterior: J(["جنوط 20 بوصة معمارية", "شبك Crest الماسي", "إضاءة خطّية مزدوجة"]),
    images: J(["/cars/genesis-g80.jpg"]),
    description: "جينيسيس G80 2024 صفر — الفخامة الكورية التي نافست الألمان، تجهيزات كاملة بسعر منافس.",
    vin: "KMTGB4SC4RU112233", inspection: "وكالة — صفر", warranty: "ضمان 5 سنوات أو 100,000 كم",
    featured: true, sold: false, views: 488,
  },
  {
    slug: "toyota-camry-grande-2023",
    brand: "تويوتا", model: "كامري غراندي", year: 2023,
    priceUSD: 33500, negotiable: true, mileage: 31000,
    transmission: "أوتوماتيك 8 سرعات", fuel: "بنزين", bodyType: "سيدان",
    condition: "وارد خليجي", colorName: "أحمر نبيذي", colorHex: "#6e1423",
    engine: "3.5L V6", cylinders: 6, horsepower: 301, torque: 362,
    acceleration: 6.8, drivetrain: "دفع أمامي", seats: 5, doors: 4,
    fuelEconomy: "12.4 كم/لتر", lengthMm: 4885, widthMm: 1840, heightMm: 1445, weightKg: 1590,
    safety: J(["9 أكياس هوائية", "Toyota Safety Sense 2.5", "رادار النقطة العمياء", "كاميرا خلفية"]),
    comfort: J(["مقاعد جلد مبردة", "شاشة 9 بوصة", "نظام JBL", "فتحة سقف", "شحن لاسلكي"]),
    exterior: J(["جنوط 18 بوصة", "إضاءة LED", "دبل إكزوز"]),
    images: J(["/cars/toyota-camry.jpg"]),
    description: "كامري غراندي V6 الفل كامل، وارد خليجي بحالة ممتازة — الأكثر طلباً في السوق العراقي.",
    vin: "4T1KZ1AK4PU445566", inspection: "فحص كامل — بدون صبغ", warranty: "—",
    featured: false, sold: false, views: 745,
  },
  {
    slug: "kia-sportage-gt-line-2024",
    brand: "كيا", model: "سبورتاج GT Line", year: 2024,
    priceUSD: 36000, negotiable: false, mileage: 0,
    transmission: "أوتوماتيك 8 سرعات", fuel: "بنزين", bodyType: "SUV",
    condition: "جديد", colorName: "أزرق لازوردي", colorHex: "#1B4F8C",
    engine: "2.5L GDI", cylinders: 4, horsepower: 191, torque: 246,
    acceleration: 9.0, drivetrain: "دفع رباعي", seats: 5, doors: 5,
    fuelEconomy: "13.1 كم/لتر", lengthMm: 4660, widthMm: 1865, heightMm: 1680, weightKg: 1620,
    safety: J(["7 أكياس هوائية", "فرملة طوارئ ذكية", "مثبت سرعة تكيّفي", "كاميرا 360°"]),
    comfort: J(["شاشتان منحنيتان 12.3 بوصة", "مقاعد مدفأة ومهواة", "نظام Harman Kardon", "فتحة سقف بانورامية", "بصمة تشغيل"]),
    exterior: J(["جنوط GT Line 19 بوصة", "إضاءة LED بوميرانغ", "سكك سقف"]),
    images: J(["/cars/kia-sportage.jpg"]),
    description: "سبورتاج GT Line 2024 صفر بأعلى المواصفات — تصميم مستقبلي وتجهيزات فئة أولى.",
    vin: "KNDPUCDG4R7778899", inspection: "وكالة — صفر", warranty: "ضمان 5 سنوات",
    featured: false, sold: false, views: 402,
  },
  {
    slug: "hyundai-sonata-limited-2023",
    brand: "هيونداي", model: "سوناتا Limited", year: 2023,
    priceUSD: 28500, negotiable: true, mileage: 18000,
    transmission: "أوتوماتيك 8 سرعات", fuel: "بنزين", bodyType: "سيدان",
    condition: "وارد أمريكي", colorName: "فضي معدني", colorHex: "#c8ccd2",
    engine: "1.6L Turbo", cylinders: 4, horsepower: 180, torque: 264,
    acceleration: 8.0, drivetrain: "دفع أمامي", seats: 5, doors: 4,
    fuelEconomy: "14.9 كم/لتر", lengthMm: 4900, widthMm: 1860, heightMm: 1445, weightKg: 1550,
    safety: J(["8 أكياس هوائية", "SmartSense كامل", "مساعد البقاء بالمسار", "كاميرا النقطة العمياء بالعدادات"]),
    comfort: J(["مقاعد جلد مدفأة ومهواة", "شاشة 10.25 بوصة", "نظام Bose", "فتحة سقف بانورامية", "ركن ذكي عن بعد"]),
    exterior: J(["جنوط 18 بوصة", "إضاءة LED خنجرية", "دبل إكزوز"]),
    images: J(["/cars/hyundai-sonata.jpg"]),
    description: "سوناتا Limited الفل وارد أمريكي، فحص كامل مرفق، اقتصادية وفخمة بسعر مناسب.",
    vin: "KMHL54JJ4PA334455", inspection: "Clean Title — فحص كامل", warranty: "—",
    featured: false, sold: false, views: 356,
  },
  {
    slug: "chevrolet-tahoe-z71-2023",
    brand: "شفروليه", model: "تاهو Z71", year: 2023,
    priceUSD: 71000, negotiable: true, mileage: 26000,
    transmission: "أوتوماتيك 10 سرعات", fuel: "بنزين", bodyType: "SUV",
    condition: "وارد أمريكي", colorName: "أسود ميدنايت", colorHex: "#15171b",
    engine: "5.3L V8", cylinders: 8, horsepower: 355, torque: 519,
    acceleration: 7.4, drivetrain: "دفع رباعي", seats: 8, doors: 5,
    fuelEconomy: "7.6 كم/لتر", lengthMm: 5352, widthMm: 2058, heightMm: 1927, weightKg: 2650,
    safety: J(["8 أكياس هوائية", "فرملة طوارئ أمامية", "كاميرا 360° HD", "تحذير مقاعد خلفية"]),
    comfort: J(["مقاعد جلد كابتن", "شاشة 10.2 بوصة", "نظام Bose", "فتحة سقف", "تعليق هوائي متكيف"]),
    exterior: J(["حزمة Z71 للطرق الوعرة", "جنوط 20 بوصة", "خطافات سحب حمراء"]),
    images: J(["/cars/chevrolet-tahoe.jpg"]),
    description: "تاهو Z71 وارد أمريكي بحالة نادرة — الأمريكي العملاق بتجهيزات الطرق الوعرة الكاملة.",
    vin: "1GNSKPKD4PR667788", inspection: "Clean Title — فحص كامل", warranty: "—",
    featured: false, sold: false, views: 289,
  },
  {
    slug: "kia-k5-gt-line-2024",
    brand: "كيا", model: "K5 GT Line", year: 2024,
    priceUSD: 27000, negotiable: false, mileage: 0,
    transmission: "أوتوماتيك 8 سرعات", fuel: "بنزين", bodyType: "سيدان",
    condition: "جديد", colorName: "أبيض ثلجي", colorHex: "#f7f7f5",
    engine: "1.6L Turbo", cylinders: 4, horsepower: 180, torque: 264,
    acceleration: 7.8, drivetrain: "دفع أمامي", seats: 5, doors: 4,
    fuelEconomy: "14.4 كم/لتر", lengthMm: 4905, widthMm: 1860, heightMm: 1445, weightKg: 1520,
    safety: J(["7 أكياس هوائية", "فرملة طوارئ تلقائية", "مثبت سرعة ذكي", "مراقبة النقطة العمياء"]),
    comfort: J(["شاشة 10.25 بوصة", "مقاعد مدفأة", "شحن لاسلكي", "فتحة سقف", "إضاءة محيطية"]),
    exterior: J(["جنوط GT Line 18 بوصة", "إضاءة نهارية DRL مميزة", "دبل إكزوز رياضي"]),
    images: J(["/cars/kia-k5.jpg"]),
    description: "كيا K5 GT Line 2024 صفر — تصميم رياضي جريء بسعر الشباب.",
    vin: "5XXG64J24RG998877", inspection: "وكالة — صفر", warranty: "ضمان 5 سنوات",
    featured: false, sold: false, views: 512,
  },
  {
    slug: "hyundai-tucson-ultimate-2024",
    brand: "هيونداي", model: "توسان Ultimate", year: 2024,
    priceUSD: 34000, negotiable: true, mileage: 0,
    transmission: "أوتوماتيك 8 سرعات", fuel: "هايبرد", bodyType: "SUV",
    condition: "جديد", colorName: "رمادي أسمنتي", colorHex: "#9aa0a6",
    engine: "1.6L Turbo Hybrid", cylinders: 4, horsepower: 231, torque: 367,
    acceleration: 8.0, drivetrain: "دفع رباعي", seats: 5, doors: 5,
    fuelEconomy: "18.3 كم/لتر", lengthMm: 4630, widthMm: 1865, heightMm: 1665, weightKg: 1680,
    safety: J(["7 أكياس هوائية", "SmartSense كامل", "كاميرا 360°", "مساعد تفادي الاصطدام"]),
    comfort: J(["شاشتان 10.25 بوصة", "مقاعد مدفأة ومهواة", "نظام Krell الصوتي", "فتحة سقف بانورامية", "باب خلفي كهربائي"]),
    exterior: J(["جنوط 19 بوصة", "شبك باراميترك مضيء", "سكك سقف"]),
    images: J(["/cars/hyundai-tucson.jpg"]),
    description: "توسان هايبرد 2024 صفر — اقتصاد الوقود المذهل مع أحدث التقنيات الكورية.",
    vin: "KM8JFCA14RU556677", inspection: "وكالة — صفر", warranty: "ضمان 5 سنوات",
    featured: false, sold: false, views: 377,
  },
  {
    slug: "mercedes-c300-amg-2022",
    brand: "مرسيدس", model: "C300 AMG", year: 2022,
    priceUSD: 52000, negotiable: true, mileage: 34000,
    transmission: "أوتوماتيك 9 سرعات", fuel: "بنزين", bodyType: "سيدان",
    condition: "مستعمل", colorName: "أزرق سبكترال", colorHex: "#28415e",
    engine: "2.0L Turbo + EQ Boost", cylinders: 4, horsepower: 258, torque: 400,
    acceleration: 6.0, drivetrain: "دفع خلفي", seats: 5, doors: 4,
    fuelEconomy: "13.0 كم/لتر", lengthMm: 4751, widthMm: 1820, heightMm: 1438, weightKg: 1675,
    safety: J(["8 أكياس هوائية", "Active Brake Assist", "كاميرا 360°", "مساعد ركن ذكي"]),
    comfort: J(["شاشة 11.9 بوصة عمودية", "مقاعد جلد رياضية", "إضاءة محيطية", "نظام Burmester", "فتحة سقف بانورامية"]),
    exterior: J(["حزمة AMG", "جنوط 19 بوصة AMG", "إضاءة Digital Light"]),
    images: J(["/cars/mercedes-c300.jpg"]),
    description: "C300 AMG موديل الشكل الجديد، مستعمل بحالة ممتازة داخل بغداد، صيانة وكالة منتظمة. مباعة — للعرض فقط.",
    vin: "W1KAF4HB4NR221100", inspection: "صبغ رفرفين — الباقي وكالة", warranty: "—",
    featured: false, sold: true, views: 921,
  },
];

const posts = [
  {
    slug: "import-usa-cars-guide-2025",
    title: "دليلك الكامل لاستيراد السيارات الأمريكية إلى العراق 2025",
    excerpt: "كل ما تحتاج معرفته عن الاستيراد من المزادات الأمريكية: التكاليف، الشحن، الجمارك، والفحص.",
    content: "الاستيراد من أمريكا أصبح الخيار الأول للعراقيين الباحثين عن الجودة والسعر المناسب.\n\nأولاً: اختيار السيارة من المزاد — ننصح بمزادات Copart وIAA مع فحص تقرير Carfax بدقة.\n\nثانياً: الشحن — يستغرق الشحن البحري من الموانئ الأمريكية إلى أم قصر بين 45 و60 يوماً.\n\nثالثاً: الجمارك والتسجيل — تختلف الرسوم حسب سعة المحرك وسنة الصنع. فريق بابل موتورز يتكفل بكل الإجراءات نيابة عنك.\n\nرابعاً: الفحص الفني — نفحص كل سيارة واردة فحصاً شاملاً بأجهزة حديثة قبل عرضها.",
    cover: "/cars/chevrolet-tahoe.jpg",
  },
  {
    slug: "hybrid-cars-iraq-worth-it",
    title: "السيارات الهايبرد في العراق: هل تستحق الشراء؟",
    excerpt: "مع ارتفاع أسعار الوقود، هل الهايبرد خيار عملي في مناخ العراق الحار؟ التفاصيل هنا.",
    content: "انتشرت السيارات الهايبرد في السوق العراقي مؤخراً بشكل كبير، وأبرزها تويوتا وهيونداي وكيا.\n\nالمزايا: استهلاك وقود أقل بنسبة تصل إلى 40%، صيانة أقل للفرامل، وقيادة أهدأ.\n\nالمخاوف الشائعة: عمر البطارية في الحر — الحقيقة أن بطاريات الجيل الجديد مصممة لتتحمل درجات حرارة تتجاوز 50 مئوية وتأتي بضمانات تصل إلى 8 سنوات.\n\nخلاصتنا في بابل موتورز: إذا كان استخدامك اليومي داخل المدينة، الهايبرد سيوفر عليك ملايين الدنانير سنوياً.",
    cover: "/cars/hyundai-tucson.jpg",
  },
  {
    slug: "babylon-motors-new-showroom",
    title: "افتتاح الصالة الجديدة لبابل موتورز على طريق بابل الحلة",
    excerpt: "صالة عرض بمساحة 2000 متر مربع بتصميم مستوحى من بوابة عشتار وتقنيات عرض حديثة.",
    content: "يسر إدارة معرض بابل للسيارات الإعلان عن افتتاح صالتها الجديدة على الطريق الرئيسي في الحلة.\n\nتضم الصالة الجديدة أكثر من 40 سيارة معروضة داخلياً، ومنصة عرض دوارة، وقسماً خاصاً للسيارات الفاخرة، بالإضافة إلى مركز فحص فني بأحدث الأجهزة الألمانية.\n\nالتصميم المعماري مستوحى من بوابة عشتار التاريخية — لأن بابل ليست مجرد موقع، بل هوية نعتز بها.",
    cover: "/cars/lexus-lx600.jpg",
  },
];

async function main() {
  console.log("🌱 Seeding Babylon Motors database...");

  // Users
  const adminPass = await bcrypt.hash("Admin@123", 10);
  const staffPass = await bcrypt.hash("Staff@123", 10);

  await prisma.user.upsert({
    where: { email: "admin@babylon-motors.iq" },
    update: {},
    create: { name: "حسين المدير", email: "admin@babylon-motors.iq", passwordHash: adminPass, role: "ADMIN" },
  });
  await prisma.user.upsert({
    where: { email: "staff@babylon-motors.iq" },
    update: {},
    create: { name: "علي الموظف", email: "staff@babylon-motors.iq", passwordHash: staffPass, role: "STAFF" },
  });

  // Cars
  for (const car of cars) {
    await prisma.car.upsert({ where: { slug: car.slug }, update: car, create: car });
  }

  // Posts
  for (const post of posts) {
    await prisma.post.upsert({ where: { slug: post.slug }, update: post, create: post });
  }

  // Sample inquiries & bookings
  const lc = await prisma.car.findUnique({ where: { slug: "toyota-land-cruiser-vxr-2024" } });
  const count = await prisma.inquiry.count();
  if (count === 0 && lc) {
    await prisma.inquiry.createMany({
      data: [
        { name: "محمد الجبوري", phone: "07701112233", message: "شنو آخر سعر للاند كروزر؟", type: "عرض سعر", carId: lc.id, status: "NEW" },
        { name: "سارة العامري", phone: "07809998877", message: "عندي كامري 2020 أريد أقايضها", type: "مقايضة", status: "FOLLOWED" },
        { name: "أحمد الحلي", phone: "07712345678", message: "هل يتوفر تمويل بالتقسيط؟", type: "عام", status: "CLOSED" },
      ],
    });
    await prisma.booking.createMany({
      data: [
        { name: "كرار حسن", phone: "07801234567", date: "2026-10-02", time: "16:00", carId: lc.id, status: "PENDING" },
        { name: "زينب الموسوي", phone: "07709876543", date: "2026-10-04", time: "11:00", carId: lc.id, status: "CONFIRMED" },
      ],
    });
  }

  console.log("✅ Done. Cars:", await prisma.car.count(), "| Users:", await prisma.user.count());
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
