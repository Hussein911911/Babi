"use client";

import { useState } from "react";
import { UploadCloud, X } from "lucide-react";
import Image from "next/image";

export default function SellForm() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files).slice(0, 2 - previews.length);
    setPreviews((p) => [
      ...p,
      ...list.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("loading");
    const fd = new FormData(e.currentTarget);

    // Upload photos first (optional)
    let photoUrls: string[] = [];
    if (previews.length) {
      const up = new FormData();
      previews.forEach((p) => up.append("files", p.file));
      const r = await fetch("/api/upload", { method: "POST", body: up }).catch(() => null);
      if (r?.ok) photoUrls = (await r.json()).urls || [];
    }

    const message = [
      `🚗 عرض بيع سيارة:`,
      `النوع: ${fd.get("brand")} ${fd.get("model")}`,
      `الموديل: ${fd.get("year")}`,
      `الممشى: ${fd.get("mileage")} كم`,
      `السعر المطلوب: ${fd.get("price")} $`,
      `ملاحظات: ${fd.get("notes") || "—"}`,
      photoUrls.length ? `الصور: ${photoUrls.join(" , ")}` : "",
    ].filter(Boolean).join("\n");

    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        phone: fd.get("phone"),
        message,
        type: "بيع سيارة",
      }),
    });
    setState(res.ok ? "done" : "error");
  };

  if (state === "done") {
    return (
      <div className="glass p-14 text-center">
        <p className="text-4xl mb-3">✅</p>
        <p className="font-black text-xl mb-2 text-gold-500">استلمنا تفاصيل سيارتك!</p>
        <p className="text-sm opacity-75">سيتواصل معك فريق التقييم خلال ساعات الدوام الرسمية</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass p-6 md:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="الاسم الكامل *" className="input" aria-label="الاسم" />
        <input name="phone" required dir="ltr" placeholder="07xxxxxxxxx *" pattern="0?7[0-9]{9}" className="input text-right" aria-label="الهاتف" />
        <input name="brand" required placeholder="الماركة (تويوتا، كيا...) *" className="input" aria-label="الماركة" />
        <input name="model" required placeholder="الموديل (كامري، سبورتاج...) *" className="input" aria-label="الموديل" />
        <input name="year" required type="number" min={1990} max={2026} placeholder="سنة الصنع *" className="input" aria-label="السنة" />
        <input name="mileage" required type="number" min={0} placeholder="الممشى (كم) *" className="input" aria-label="الممشى" />
        <input name="price" type="number" min={0} placeholder="السعر المطلوب بالدولار (اختياري)" className="input sm:col-span-2" aria-label="السعر" />
        <textarea name="notes" rows={3} placeholder="ملاحظات إضافية: الحالة، الصبغ، الحوادث..." className="input resize-none sm:col-span-2" aria-label="ملاحظات" />
      </div>

      {/* Photo upload */}
      <div className="mt-5">
        <p className="mb-2 text-xs font-black opacity-70">صور السيارة (حتى صورتين)</p>
        <div className="flex flex-wrap gap-3">
          {previews.map((p, i) => (
            <div key={p.url} className="relative h-24 w-32 overflow-hidden rounded-xl2 border border-gold-500/30">
              <Image src={p.url} alt={`صورة ${i + 1}`} fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => setPreviews((prev) => prev.filter((_, j) => j !== i))}
                className="absolute top-1 left-1 flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/80 text-white"
                aria-label="حذف الصورة"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {previews.length < 2 && (
            <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl2 border border-dashed border-gold-500/40 text-xs opacity-70 hover:opacity-100 hover:bg-gold-500/5 transition">
              <UploadCloud className="h-6 w-6 text-gold-500" />
              اختر صورة
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onFiles(e.target.files)} multiple />
            </label>
          )}
        </div>
      </div>

      {state === "error" && <p className="mt-3 text-sm text-red-400">حدث خطأ — تأكد من البيانات وحاول مجدداً</p>}
      <button disabled={state === "loading"} className="btn-gold mt-6 w-full disabled:opacity-60">
        {state === "loading" ? "جارِ الإرسال..." : "أرسل تفاصيل سيارتك"}
      </button>
    </form>
  );
}
