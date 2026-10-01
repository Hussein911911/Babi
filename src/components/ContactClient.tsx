"use client";

import { useState } from "react";
import { PhoneCall } from "lucide-react";

export default function ContactClient() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [callback, setCallback] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("loading");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        phone: fd.get("phone"),
        email: fd.get("email") || "",
        message: callback
          ? `📞 طلب اتصال لاحق — الوقت المفضل: ${fd.get("calltime") || "أي وقت"}`
          : fd.get("message"),
        type: callback ? "اتصل بي" : "عام",
      }),
    });
    setState(res.ok ? "done" : "error");
  };

  if (state === "done") {
    return (
      <div className="glass flex flex-col items-center justify-center p-14 text-center">
        <p className="text-4xl mb-3">✅</p>
        <p className="font-black text-xl text-gold-500 mb-2">تم استلام رسالتك</p>
        <p className="text-sm opacity-75">سنتواصل معك في أقرب وقت — شكراً لثقتك بنا</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass p-6 md:p-8 h-fit">
      <div className="mb-5 flex rounded-xl2 border border-gold-500/20 p-1 text-sm font-black">
        <button
          type="button"
          onClick={() => setCallback(false)}
          className={`flex-1 rounded-xl2 py-2.5 transition ${!callback ? "bg-gold-500 text-charcoal" : "opacity-60"}`}
        >
          أرسل رسالة
        </button>
        <button
          type="button"
          onClick={() => setCallback(true)}
          className={`flex-1 rounded-xl2 py-2.5 transition ${callback ? "bg-gold-500 text-charcoal" : "opacity-60"}`}
        >
          <PhoneCall className="inline h-4 w-4 ml-1" /> اتصلوا بي لاحقاً
        </button>
      </div>

      <div className="space-y-4">
        <input name="name" required placeholder="الاسم الكامل *" className="input" aria-label="الاسم" />
        <input name="phone" required dir="ltr" placeholder="07xxxxxxxxx *" pattern="0?7[0-9]{9}" className="input text-right" aria-label="الهاتف" />
        {callback ? (
          <select name="calltime" className="input" aria-label="الوقت المفضل">
            <option value="">أي وقت خلال الدوام</option>
            <option>صباحاً (9 – 12)</option>
            <option>ظهراً (12 – 4)</option>
            <option>مساءً (4 – 9)</option>
          </select>
        ) : (
          <>
            <input name="email" type="email" placeholder="البريد الإلكتروني (اختياري)" className="input font-en" aria-label="البريد" />
            <textarea name="message" required rows={5} placeholder="اكتب رسالتك هنا... *" className="input resize-none" aria-label="الرسالة" />
          </>
        )}
      </div>

      {state === "error" && <p className="mt-3 text-sm text-red-400">حدث خطأ — حاول مجدداً</p>}
      <button disabled={state === "loading"} className="btn-gold mt-6 w-full disabled:opacity-60">
        {state === "loading" ? "جارِ الإرسال..." : callback ? "اطلب اتصالاً" : "إرسال الرسالة"}
      </button>
    </form>
  );
}
