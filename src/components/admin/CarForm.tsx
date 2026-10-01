"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UploadCloud, X, Save } from "lucide-react";
import { parseArr } from "@/lib/utils";
import type { CarDTO } from "@/lib/types";

const EMPTY: Partial<CarDTO> = {
  slug: "", brand: "", model: "", year: 2024, priceUSD: 25000, negotiable: false,
  mileage: 0, transmission: "أوتوماتيك 8 سرعات", fuel: "بنزين", bodyType: "سيدان",
  condition: "جديد", colorName: "أبيض لؤلؤي", colorHex: "#f4f4f4", engine: "",
  cylinders: 4, horsepower: 0, torque: 0, acceleration: 0, drivetrain: "دفع أمامي",
  seats: 5, doors: 4, fuelEconomy: "", lengthMm: 0, widthMm: 0, heightMm: 0, weightKg: 0,
  safety: "[]", comfort: "[]", exterior: "[]", images: "[]", description: "",
  vin: "", inspection: "", warranty: "", featured: false, sold: false,
};

export default function CarForm({ car }: { car?: CarDTO }) {
  const router = useRouter();
  const isEdit = !!car;
  const [form, setForm] = useState<Partial<CarDTO>>(car ?? EMPTY);
  const [images, setImages] = useState<string[]>(car ? parseArr(car.images) : []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const set = (k: keyof CarDTO, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(false);
    if (res.ok) {
      const { urls } = await res.json();
      setImages((imgs) => [...imgs, ...urls]);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      ...form,
      images: JSON.stringify(images),
      safety: normalizeList(form.safety),
      comfort: normalizeList(form.comfort),
      exterior: normalizeList(form.exterior),
      vin: form.vin || null,
    };

    const res = await fetch(isEdit ? `/api/cars/${car!.id}` : "/api/cars", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "فشل الحفظ — تأكد من الحقول");
      return;
    }
    router.push("/admin/cars");
    router.refresh();
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label className="block">
      <span className="mb-1.5 block text-xs font-black opacity-70">{label}</span>
      {children}
    </label>
  );

  return (
    <form onSubmit={submit} className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-black">{isEdit ? `تعديل: ${car!.brand} ${car!.model}` : "إضافة سيارة جديدة"}</h1>

      <div className="glass p-5">
        <p className="mb-4 font-black text-gold-500 text-sm">المعلومات الأساسية</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="الماركة *"><input required className="input" value={form.brand || ""} onChange={(e) => set("brand", e.target.value)} /></Field>
          <Field label="الموديل *"><input required className="input" value={form.model || ""} onChange={(e) => set("model", e.target.value)} /></Field>
          <Field label="السنة *"><input required type="number" min={1980} max={2030} className="input" value={form.year || ""} onChange={(e) => set("year", +e.target.value)} /></Field>
          <Field label="الرابط slug (أحرف إنجليزية وشرطات) *">
            <input required pattern="[a-z0-9-]+" className="input font-en" dir="ltr" value={form.slug || ""} onChange={(e) => set("slug", e.target.value)} placeholder="toyota-camry-2024" />
          </Field>
          <Field label="السعر بالدولار *"><input required type="number" min={500} className="input" value={form.priceUSD || ""} onChange={(e) => set("priceUSD", +e.target.value)} /></Field>
          <Field label="الممشى (كم)"><input type="number" min={0} className="input" value={form.mileage ?? 0} onChange={(e) => set("mileage", +e.target.value)} /></Field>
          <Field label="الحالة">
            <select className="input" value={form.condition} onChange={(e) => set("condition", e.target.value)}>
              {["جديد", "مستعمل", "وارد أمريكي", "وارد خليجي"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="نوع الهيكل">
            <select className="input" value={form.bodyType} onChange={(e) => set("bodyType", e.target.value)}>
              {["سيدان", "SUV", "بيك أب", "كوبيه", "هاتشباك"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="الوقود">
            <select className="input" value={form.fuel} onChange={(e) => set("fuel", e.target.value)}>
              {["بنزين", "ديزل", "هايبرد", "كهربائي"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="ناقل الحركة"><input className="input" value={form.transmission || ""} onChange={(e) => set("transmission", e.target.value)} /></Field>
          <Field label="اسم اللون"><input className="input" value={form.colorName || ""} onChange={(e) => set("colorName", e.target.value)} /></Field>
          <Field label="كود اللون (للمسرح 3D)">
            <input type="color" className="input !p-1 h-11" value={form.colorHex || "#f4f4f4"} onChange={(e) => set("colorHex", e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={!!form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-gold-500" /> سيارة مميزة ⭐
          </label>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={!!form.negotiable} onChange={(e) => set("negotiable", e.target.checked)} className="h-4 w-4 accent-gold-500" /> قابل للتفاوض
          </label>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={!!form.sold} onChange={(e) => set("sold", e.target.checked)} className="h-4 w-4 accent-gold-500" /> مباعة
          </label>
        </div>
      </div>

      <div className="glass p-5">
        <p className="mb-4 font-black text-gold-500 text-sm">المحرك والأداء</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="المحرك"><input className="input font-en" dir="ltr" placeholder="2.5L Turbo" value={form.engine || ""} onChange={(e) => set("engine", e.target.value)} /></Field>
          <Field label="الأسطوانات"><input type="number" min={0} max={16} className="input" value={form.cylinders ?? 4} onChange={(e) => set("cylinders", +e.target.value)} /></Field>
          <Field label="القوة (حصان)"><input type="number" min={0} className="input" value={form.horsepower ?? 0} onChange={(e) => set("horsepower", +e.target.value)} /></Field>
          <Field label="العزم (نيوتن.متر)"><input type="number" min={0} className="input" value={form.torque ?? 0} onChange={(e) => set("torque", +e.target.value)} /></Field>
          <Field label="تسارع 0-100 (ثانية)"><input type="number" step="0.1" min={0} className="input" value={form.acceleration ?? 0} onChange={(e) => set("acceleration", +e.target.value)} /></Field>
          <Field label="نظام الدفع">
            <select className="input" value={form.drivetrain} onChange={(e) => set("drivetrain", e.target.value)}>
              {["دفع أمامي", "دفع خلفي", "دفع رباعي"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="الاستهلاك"><input className="input" placeholder="13 كم/لتر" value={form.fuelEconomy || ""} onChange={(e) => set("fuelEconomy", e.target.value)} /></Field>
          <Field label="المقاعد"><input type="number" min={1} max={20} className="input" value={form.seats ?? 5} onChange={(e) => set("seats", +e.target.value)} /></Field>
        </div>
      </div>

      <div className="glass p-5">
        <p className="mb-4 font-black text-gold-500 text-sm">التجهيزات (افصل بينها بسطر جديد)</p>
        <div className="grid gap-4 lg:grid-cols-3">
          <Field label="الأمان"><textarea rows={4} className="input resize-none" value={listToText(form.safety)} onChange={(e) => set("safety", e.target.value)} /></Field>
          <Field label="الراحة والتقنية"><textarea rows={4} className="input resize-none" value={listToText(form.comfort)} onChange={(e) => set("comfort", e.target.value)} /></Field>
          <Field label="الخارجية"><textarea rows={4} className="input resize-none" value={listToText(form.exterior)} onChange={(e) => set("exterior", e.target.value)} /></Field>
        </div>
      </div>

      <div className="glass p-5">
        <p className="mb-4 font-black text-gold-500 text-sm">الوصف والتوثيق</p>
        <div className="space-y-4">
          <Field label="الوصف"><textarea rows={3} className="input resize-none" value={form.description || ""} onChange={(e) => set("description", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="رقم الشاصي VIN"><input className="input font-en" dir="ltr" value={form.vin || ""} onChange={(e) => set("vin", e.target.value)} /></Field>
            <Field label="تقرير الفحص"><input className="input" value={form.inspection || ""} onChange={(e) => set("inspection", e.target.value)} /></Field>
            <Field label="الضمان"><input className="input" value={form.warranty || ""} onChange={(e) => set("warranty", e.target.value)} /></Field>
          </div>
        </div>
      </div>

      <div className="glass p-5">
        <p className="mb-4 font-black text-gold-500 text-sm">الصور</p>
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={img + i} className="relative h-24 w-36 overflow-hidden rounded-xl2 border border-gold-500/30">
              <Image src={img} alt={`صورة ${i + 1}`} fill sizes="144px" className="object-cover" />
              <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/80 text-white hover:bg-red-500" aria-label="حذف">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="flex h-24 w-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl2 border border-dashed border-gold-500/40 text-xs opacity-70 hover:opacity-100 hover:bg-gold-500/5 transition">
            <UploadCloud className="h-6 w-6 text-gold-500" />
            {uploading ? "جارِ الرفع..." : "رفع صور"}
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => upload(e.target.files)} />
          </label>
        </div>
        <p className="mt-2 text-[11px] opacity-50">أو أدخل رابط صورة موجودة:</p>
        <div className="mt-1 flex gap-2 max-w-md">
          <input id="imgurl" className="input font-en" dir="ltr" placeholder="/cars/my-car.jpg" />
          <button
            type="button"
            className="btn-outline !py-2 !px-4 text-xs shrink-0"
            onClick={() => {
              const el = document.getElementById("imgurl") as HTMLInputElement;
              if (el.value) { setImages([...images, el.value]); el.value = ""; }
            }}
          >
            إضافة
          </button>
        </div>
      </div>

      {error && <p className="rounded-xl2 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button disabled={saving} className="btn-gold disabled:opacity-60">
          <Save className="h-4 w-4" /> {saving ? "جارِ الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة السيارة"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-outline">إلغاء</button>
      </div>
    </form>
  );
}

function listToText(v?: string) {
  if (!v) return "";
  try {
    const arr = JSON.parse(v);
    return Array.isArray(arr) ? arr.join("\n") : v;
  } catch {
    return v;
  }
}

function normalizeList(v?: string) {
  if (!v) return "[]";
  try {
    const arr = JSON.parse(v);
    if (Array.isArray(arr)) return v;
  } catch { /* text mode */ }
  return JSON.stringify(v.split("\n").map((s) => s.trim()).filter(Boolean));
}
