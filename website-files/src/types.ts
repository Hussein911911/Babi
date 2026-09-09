/* ================= الأنواع ================= */

export interface Medicine {
  id: string;
  name: string; // الاسم التجاري
  scientific: string; // الاسم العلمي
  category: string;
  form: string; // الشكل الصيدلاني
  strength: string; // التركيز
  batch: string; // رقم الباج
  prodDate: string; // تاريخ الإنتاج ISO
  expiry: string; // تاريخ الانتهاء ISO
  qty: number; // الكمية الحالية (بالأشرطة)
  minQty: number; // حد الطلب (بالأشرطة)
  buyPrice: number; // سعر شراء القطعة
  sellPrice: number; // سعر بيع القطعة
  company: string; // الشركة المنتجة
  stripsPerPiece: number; // عدد الأشرطة داخل القطعة
  piecesPerCarton: number; // عدد القطع داخل الكارتون
  createdAt: number;
}

export type SaleUnit = "piece" | "strip";

export interface InvoiceLine {
  qty: number;
  price: number;
  discountPct: number;
  total: number;
}

export interface InvoiceItem {
  medicineId: string;
  name: string;
  strength: string;
  unit: SaleUnit; // البيع بالقطعة أم بالشريط
  qty: number; // العدد بوحدة البيع (مجموع الأسطر عند الدمج)
  strips: number; // إجمالي الأشرطة (للخصم من المخزون)
  price: number; // سعر الوحدة (قبل الخصم)
  cost: number; // كلفة الوحدة (للربح)
  discountPct: number; // نسبة الخصم (متوسط موزون عند الدمج)
  total: number; // إجمالي السطر بعد الخصم
  lines?: InvoiceLine[]; // الأسطر الفردية عند دمج كميات/خصومات مختلفة
}

export interface Invoice {
  id: string;
  number: number;
  date: string; // ISO
  customerId: string;
  customer: string; // اسم الجهة (لقطة)
  payment: "نقدي" | "آجل";
  settled?: boolean; // للآجل: تم التحصيل؟
  approved?: boolean; // معتمدة (مخصومة من المخزون)؟
  prepTime?: string; // وقت التجهيز HH:MM
  saleTime?: string; // وقت البيع HH:MM
  listDate?: string; // تاريخ القائمة ISO
  preparedBy?: string; // اسم مصمم القائمة
  notes?: string; // ملاحظات (هدايا ترويجية: موبايل، شاشة...)
  items: InvoiceItem[];
  total: number;
}

export function nowTime(): string {
  return new Date().toTimeString().slice(0, 5);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function fmtTime(t?: string): string {
  if (!t) return "—";
  try {
    const [h, m] = t.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return t;
  }
}

export const isApproved = (inv: Invoice): boolean => inv.approved !== false;

export interface PurchaseItem {
  medicineId: string;
  name: string;
  strength: string;
  qty: number; // بالأشرطة
  cost: number; // كلفة الشريط
}

export interface Purchase {
  id: string;
  number: number;
  date: string; // ISO
  company: string;
  items: PurchaseItem[];
  total: number;
  received: boolean; // مستلمة أم معلّقة
}

export type CustomerKind = "pharmacy" | "warehouse";

export interface Customer {
  id: string;
  name: string;
  kind: CustomerKind;
  phone: string;
  city: string;
  createdAt: number;
}

export interface User {
  username: string;
  name: string;
  role: string;
}

export const ADMIN_ROLE = "مدير النظام";

export type Status = "ok" | "low" | "out" | "soon" | "expired";
export type Page = "dashboard" | "inventory" | "sales" | "purchases" | "reports" | "alerts" | "settings";

/* ================= ثوابت ================= */

export const CATEGORIES = [
  "مضاد حيوي",
  "مسكن ومضاد التهاب",
  "فيتامينات ومكملات",
  "قلب وضغط",
  "سكري",
  "جهاز هضمي",
  "جهاز تنفسي",
  "مضاد حساسية",
  "جلدية وموضعي",
  "هرمونات",
  "مطهرات ومحاليل",
  "أخرى",
];

export const FORMS = [
  "أقراص",
  "كبسولات",
  "شراب",
  "حقن",
  "مرهم موضعي",
  "قطرة",
  "بخاخ",
  "تحاميل",
  "محلول",
];

export const COMPANIES = ["بايونير", "دجلة", "أسوار", "الكندي"];

export const CUSTOMER_KIND_META: Record<CustomerKind, { label: string; badge: string; dot: string }> = {
  pharmacy: { label: "صيدلية", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  warehouse: { label: "مذخر", badge: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500" },
};

export const CHART_COLORS = ["#0891b2", "#059669", "#d97706", "#e11d48", "#0284c7", "#0d9488", "#ca8a04", "#475569"];

/* ================= منطق الحالة ================= */

const DAY = 86_400_000;

export function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(iso).getTime() - today.getTime()) / DAY);
}

export function getStatus(m: Medicine): Status {
  const d = daysUntil(m.expiry);
  if (d < 0) return "expired";
  if (m.qty === 0) return "out";
  if (m.qty <= m.minQty) return "low";
  if (d <= 90) return "soon";
  return "ok";
}

export const STATUS_META: Record<
  Status,
  { label: string; badge: string; dot: string; rank: number }
> = {
  expired: { label: "منتهي الصلاحية", badge: "bg-rose-100 text-rose-800 ring-rose-200", dot: "bg-rose-600", rank: 0 },
  out: { label: "نافد", badge: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500", rank: 1 },
  low: { label: "منخفض", badge: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500", rank: 2 },
  soon: { label: "قرب الانتهاء", badge: "bg-orange-50 text-orange-800 ring-orange-200", dot: "bg-orange-500", rank: 3 },
  ok: { label: "متوفر", badge: "bg-emerald-50 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500", rank: 4 },
};

export const STATUS_FILTERS: { key: Status | "all"; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "ok", label: "متوفر" },
  { key: "low", label: "منخفض" },
  { key: "out", label: "نافد" },
  { key: "soon", label: "قرب الانتهاء" },
  { key: "expired", label: "منتهي" },
];

/* ================= التغليف والتجهيز ================= */

export function packBreakdown(totalStrips: number, stripsPerPiece: number, piecesPerCarton: number) {
  const spp = Math.max(1, stripsPerPiece);
  const spc = spp * Math.max(1, piecesPerCarton);
  const t = Math.max(0, Math.floor(totalStrips));
  const cartons = Math.floor(t / spc);
  const rem = t % spc;
  const pieces = Math.floor(rem / spp);
  const strips = rem % spp;
  return { cartons, pieces, strips };
}

export function fmtBreakdown(totalStrips: number, stripsPerPiece: number, piecesPerCarton: number): string {
  const { cartons, pieces, strips } = packBreakdown(totalStrips, stripsPerPiece, piecesPerCarton);
  const parts: string[] = [];
  if (cartons > 0) parts.push(`${fmtNum(cartons)} كارتون`);
  if (pieces > 0) parts.push(`${fmtNum(pieces)} قطعة`);
  if (strips > 0 || parts.length === 0) parts.push(`${fmtNum(strips)} شريط`);
  return parts.join(" و ");
}

export function medBreakdown(m: Medicine, totalStrips: number): string {
  return fmtBreakdown(totalStrips, m.stripsPerPiece, m.piecesPerCarton);
}

export function stripPriceOf(m: Medicine): number {
  return Math.round(m.sellPrice / Math.max(1, m.stripsPerPiece));
}

export function stripCostOf(m: Medicine): number {
  return Math.round(m.buyPrice / Math.max(1, m.stripsPerPiece));
}

export function unitPriceOf(m: Medicine, unit: SaleUnit): number {
  return unit === "piece" ? m.sellPrice : stripPriceOf(m);
}

export function unitCostOf(m: Medicine, unit: SaleUnit): number {
  return unit === "piece" ? m.buyPrice : stripCostOf(m);
}

export function unitLabel(unit: SaleUnit): string {
  return unit === "piece" ? "قطعة" : "شريط";
}

export function rowTotal(qty: number, price: number, discountPct: number): number {
  return Math.round(qty * price * (1 - Math.min(100, Math.max(0, discountPct)) / 100));
}

/* ---------- سلة المبيعات المشتركة ---------- */

export function cartStripsOf(list: InvoiceItem[], medId: string): number {
  return list.filter((i) => i.medicineId === medId).reduce((s, i) => s + i.strips, 0);
}

export function mergeIntoCart(list: InvoiceItem[], item: InvoiceItem): { list: InvoiceItem[]; merged: boolean } {
  const idx = list.findIndex((x) => x.medicineId === item.medicineId && x.unit === item.unit);
  if (idx < 0) return { list: [...list, item], merged: false };
  const next = list.map((x, i) => {
    if (i !== idx) return x;
    const qty = x.qty + item.qty;
    const strips = x.strips + item.strips;
    const subtotal = x.qty * x.price + item.qty * item.price;
    const total = x.total + item.total;
    const price = qty > 0 ? Math.round(subtotal / qty) : item.price;
    const discountPct = subtotal > 0 ? Math.round((1 - total / subtotal) * 1000) / 10 : 0;
    return { ...x, qty, strips, price, discountPct, total };
  });
  return { list: next, merged: true };
}

/* ================= تنسيق ================= */

const nf = new Intl.NumberFormat("en-US");

export function fmtNum(n: number): string {
  return nf.format(n);
}

export function fmtMoney(n: number): string {
  return `${nf.format(n)} د.ع`;
}

export function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ar", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export function fmtDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString("ar", { day: "numeric", month: "short" })} · ${d.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return iso;
  }
}

export function expiryLabel(iso: string): string {
  const d = daysUntil(iso);
  if (d < 0) return `منتهي منذ ${fmtNum(Math.abs(d))} يوم`;
  if (d === 0) return "ينتهي اليوم";
  return `متبقٍ ${fmtNum(d)} يوم`;
}

export function shelfLife(prod: string, expiry: string): string {
  const months = Math.round((new Date(expiry).getTime() - new Date(prod).getTime()) / (DAY * 30));
  if (months >= 12) {
    const y = Math.floor(months / 12);
    const r = months % 12;
    return r > 0 ? `${y} سنة و ${r} شهر` : `${y} سنة`;
  }
  return `${months} شهر`;
}


