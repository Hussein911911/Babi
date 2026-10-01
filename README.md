# 🏛️ معرض بابل للسيارات — Babylon Motors

موقع ويب كامل واحترافي لمعرض سيارات فاخر في **الحلة – محافظة بابل، العراق**، بهوية بصرية مستوحاة من **بوابة عشتار** (أزرق لازوردي `#1B4F8C` + ذهبي بابلي `#C9A227`).

![Stack](https://img.shields.io/badge/Next.js%2014-App%20Router-black) ![TS](https://img.shields.io/badge/TypeScript-strict-blue) ![3D](https://img.shields.io/badge/React%20Three%20Fiber-3D%20Stage-gold)

---

## ✨ الميزات

### 🎭 مسرح العرض ثلاثي الأبعاد (قلب الموقع)
- سيارة تفاعلية على منصة دائرية مضيئة بنقوش بابلية في منتصف الصفحة الرئيسية.
- **دوران 360°** تلقائي + سحب بالماوس/اللمس + زووم بالعجلة.
- **مبدّل لون الطلاء الحي** مع انتقال ناعم (lerp) + تبديل الجنوط (رياضية / كلاسيك).
- **وضع المقصورة الداخلية**: زر "ادخل إلى المقصورة" ينقل الكاميرا بحركة سينمائية إلى الداخل مع Hotspots (الشاشة، المقاعد، الصوت، فتحة السقف) و"العودة للخارج" بنفس النعومة.
- **Hotspots خارجية**: المحرك، الأضواء، العجلات، الصندوق.
- إضاءة استوديو + ContactShadows + كشف أداء تلقائي (`PerformanceMonitor`) يخفض الدقة على الأجهزة الضعيفة، وتحميل WebGL فقط عند ظهور القسم (IntersectionObserver).
- أي سيارة يختارها الزائر من البطاقات **تُحمَّل فوراً في المسرح** مع تمرير سلس إليه.

### 🚗 المعرض (Inventory)
- فلترة وبحث لحظي: ماركة، هيكل، حالة، وقود، ناقل حركة، سعر (Slider) + ترتيب + "عرض المزيد".
- **مقارنة حتى 3 سيارات** بجدول مفصل + **مفضلة** محفوظة محلياً + مشاركة واتساب/نظام المشاركة.
- صفحة تفاصيل كاملة: معرض صور مع Lightbox، تبويبات مواصفات (محرك/أبعاد/استهلاك/أمان/راحة/خارجية)، السعر بالدولار **والدينار**، **حاسبة تقسيط**، حجز تجربة قيادة، طلب عرض سعر، مقايضة، VIN وتقرير فحص وضمان، وسيارات مشابهة.

### 🎨 الهوية والأنميشن
- RTL عربي كامل + مبدّل لغة (عربي/English) + وضع ليلي/نهاري محفوظ في LocalStorage.
- Preloader بوابة عشتار تنفتح، Hero بارالاكس، عدادات متحركة، Framer Motion + Lenis للتمرير السلس، واحترام `prefers-reduced-motion`.
- زخارف SVG بابلية (أسوار عشتار + أسد بابل) بشفافية منخفضة.

### 🔐 لوحة التحكم (RBAC)
- تسجيل دخول آمن: bcrypt + JWT (jose) بجلسات **httpOnly** + **Rate limiting** لمحاولات الدخول + Middleware يحمي `/admin`.
- **مدير (ADMIN)**: كل الصلاحيات + حذف السيارات + سجل النشاطات (Audit Log).
- **موظف (STAFF)**: إضافة/تعديل السيارات ومتابعة الاستفسارات والحجوزات — بدون حذف.
- إحصائيات + رسم بياني للمبيعات (Recharts) + CRUD كامل للسيارات مع رفع صور + CRM مصغّر للاستفسارات (جديد/تمت المتابعة/مغلق) + إدارة حجوزات تجربة القيادة + تصدير CSV.

### 🪪 نظام التوظيف بالبطاقة والباركود (QR)
1. **الموظف يصدر بطاقة** من لوحة التحكم (`/admin/cards`) — تنفتح صفحة طباعة البطاقة تلقائياً (وجه أمامي بتصميم بابلي + QR + رمز فريد، ووجه خلفي بتعليمات الاستخدام).
2. **الزبون يمسح الباركود** → تفتح استمارة التقديم `/card/[code]` بأسلوب **خطوة-خطوة**: كل معلومة بشاشة مستقلة (الاسم، العمر، الهاتف، العنوان، التحصيل، الخبرة) مع زر "التالي" وشريط تقدم وتحقق لكل خطوة.
3. **اختيار الوظيفة**: قائمة الوظائف مع بحث وفلترة (الفئة / الموقع) — **معلومات صاحب العمل مخفية تماماً** في هذه المرحلة (حتى من الـ API).
4. **إتمام**: بعد المراجعة والضغط على "إتمام" تُقفل الاستمارة، و**تظهر معلومات صاحب العمل** (الاسم، الهاتف، العنوان) ضمن استمارة رسمية قابلة للطباعة (مع QR وتوقيعات).
5. **نفس باركود البطاقة** يعرض الاستمارة المكتملة بأي وقت — للمراجعة أو إعادة الطباعة.
- إدارة الوظائف من `/admin/jobs` (إضافة/تعديل/إيقاف — الحذف للمدير فقط)، وإدارة البطاقات من `/admin/cards` (إصدار، طباعة، نسخ الرابط، إعادة تعيين للمدير).
- بطاقة تجريبية جاهزة: **`/card/BM-DEMO01`**

### 🌐 SEO وجودة
- Metadata + OpenGraph + JSON-LD (`AutoDealer` + `Vehicle`) + `sitemap.xml` + `robots.txt`.
- SSG/ISR لصفحات السيارات والمدونة، صور `next/image`، تحقق Zod لكل API، حماية رؤوس HTTP.

---

## 🚀 التشغيل

```bash
# 1) التبعيات
npm install

# 2) قاعدة البيانات (إنشاء الجداول + البيانات التجريبية)
npm run db:setup

# 3) التطوير
npm run dev
# أو للإنتاج
npm run build && npm run start
```

> **ملاحظة للبيئات المعزولة**: إن فشل `prisma generate` بسبب حجب تنزيل المحركات، شغّله هكذا:
> `PRISMA_SCHEMA_ENGINE_BINARY=/bin/true npx prisma generate`
> (المشروع يستخدم Prisma 7 بعميل TypeScript بدون محركات native + libsql).

### متغيرات البيئة (`.env`)
| المتغير | الوصف |
|---|---|
| `DATABASE_URL` | `file:./dev.db` للتجربة — للإنتاج بدّل provider في `schema.prisma` إلى `postgresql` |
| `AUTH_SECRET` | سر توقيع JWT — **غيّره في الإنتاج** |
| `NEXT_PUBLIC_SITE_URL` | رابط الموقع (للـ SEO وsitemap) |
| `NEXT_PUBLIC_WHATSAPP` / `NEXT_PUBLIC_PHONE` | أرقام التواصل |

### 👤 الحسابات التجريبية
| الدور | البريد | كلمة المرور |
|---|---|---|
| 👑 مدير | `admin@babylon-motors.iq` | `Admin@123` |
| 👤 موظف | `staff@babylon-motors.iq` | `Staff@123` |

---

## 🗄️ قاعدة البيانات

- المخطط الكامل: [`prisma/schema.prisma`](prisma/schema.prisma) — جداول: `User`, `Car`, `Inquiry`, `Booking`, `Post`, `Subscriber`, `AuditLog`.
- البذر: [`prisma/seed.ts`](prisma/seed.ts) — **12 سيارة** (تويوتا، هيونداي، كيا، نيسان، شفروليه، مرسيدس، لكزس، جينيسيس) بأسعار واقعية + حسابين + 3 مقالات + استفسارات وحجوزات نموذجية، و[`prisma/seed-jobs.ts`](prisma/seed-jobs.ts) — **8 وظائف** + بطاقة تجريبية `BM-DEMO01`.
- `npm run db:push` يطبّق SQL في `prisma/migrations/` مباشرة عبر libsql (يعمل حتى بدون إنترنت). في البيئات العادية يمكنك استخدام `npx prisma db push`.

### التحويل إلى PostgreSQL (إنتاج)
1. في `prisma/schema.prisma`: غيّر `provider = "sqlite"` إلى `"postgresql"`.
2. في `prisma.config.ts`: ضع `url` اتصال Postgres، واستبدل adapter libsql بـ `@prisma/adapter-pg`.
3. `npx prisma migrate dev` ثم `npm run db:seed`.

---

## 🧊 إضافة موديلات 3D حقيقية (GLB/Draco)

السيارة الحالية **مبنية إجرائياً** من primitives (لا تحتاج أي ملفات خارجية). لاستبدالها بموديل GLTF حقيقي:

1. اضغط الموديل بـ Draco:
   ```bash
   npx gltf-pipeline -i car.glb -o car-draco.glb -d
   ```
2. ضعه في `public/models/my-car.glb`.
3. في `src/components/stage/CarModel.tsx` استبدل المحتوى بـ:
   ```tsx
   import { useGLTF } from "@react-three/drei";
   const { scene, materials } = useGLTF("/models/my-car.glb");
   // غيّر لون الطلاء: (materials.Paint as MeshPhysicalMaterial).color.lerp(target, dt*4)
   return <primitive object={scene} />;
   useGLTF.preload("/models/my-car.glb");
   ```
4. سمِّ خامة الطلاء في Blender باسم ثابت (مثل `Paint`) ليعمل مبدّل الألوان، وعدّل مواضع الـ Hotspots في `Stage3D.tsx`.
5. `Suspense` وشاشة التحميل بالنسبة المئوية (`useProgress`) موجودة وستعمل تلقائياً مع الموديلات الثقيلة.

---

## 📁 هيكل المشروع

```
├── prisma/
│   ├── schema.prisma          # مخطط قاعدة البيانات
│   ├── seed.ts                # بيانات البذر (12 سيارة + حسابات)
│   └── migrations/0001_init/  # SQL الجداول
├── scripts/apply-migrations.ts
├── src/
│   ├── app/                   # App Router: الرئيسية، cars/[slug]، compare،
│   │   │                      # about، services، sell، blog، faq، contact،
│   │   │                      # privacy، login، not-found، sitemap، robots
│   │   ├── admin/             # لوحة التحكم (dashboard/cars/inquiries/bookings)
│   │   └── api/               # auth, cars, inquiries, bookings, upload, subscribe
│   ├── components/
│   │   ├── stage/             # المسرح 3D: Stage3D, CarModel, ShowroomStage
│   │   ├── car/               # Gallery, SpecsTabs, CarActions, InstallmentCalculator
│   │   ├── admin/             # AdminShell, StatsCards, SalesChart, CarForm, ...
│   │   └── home/              # Hero, StageSection, HomeSections
│   ├── lib/                   # prisma, auth (JWT+RateLimit), i18n, utils, validation
│   ├── store/ui.ts            # Zustand: المسرح، المفضلة، المقارنة (persist)
│   └── middleware.ts          # حماية /admin
└── public/
    ├── cars/                  # صور السيارات
    └── patterns/              # زخارف SVG بابلية
```

---

## 🖼️ ملاحظات
- رفع الصور حالياً يحفظ في `public/uploads` (مناسب للتجربة) — للإنتاج استبدل `api/upload` بـ Cloudinary أو S3.
- صورتا "توسان" و"C300" حالياً نسختان مؤقتتان من صور مشابهة — استبدلهما بصور حقيقية عبر لوحة التحكم أو مجلد `public/cars`.
- الخطوط (`Tajawal` + `Inter`) تُحمَّل من Google Fonts في المتصفح.

صُنع بحب في بابل 🦁 — أرض الحضارات الأولى.
