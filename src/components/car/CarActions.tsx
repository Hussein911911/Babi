"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Phone, MessageCircle, CalendarClock, BadgeDollarSign, RefreshCcw, X, Heart, Scale, Rotate3D,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { CONTACT, waLink, cn } from "@/lib/utils";
import { useUI } from "@/store/ui";
import type { CarDTO } from "@/lib/types";

type ModalKind = "book" | "quote" | "tradein" | null;

export default function CarActions({ car }: { car: CarDTO }) {
  const [modal, setModal] = useState<ModalKind>(null);
  const { favorites, toggleFavorite, compare, toggleCompare, setStageCar } = useUI();
  const router = useRouter();
  const carName = `${car.brand} ${car.model} ${car.year}`;
  const fav = favorites.includes(car.slug);
  const comp = compare.includes(car.slug);

  const showInStage = () => {
    setStageCar({
      slug: car.slug, brand: car.brand, model: car.model, year: car.year,
      priceUSD: car.priceUSD, colorHex: car.colorHex, bodyType: car.bodyType,
    });
    router.push("/#showroom-stage");
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <a href={`tel:${CONTACT.phone}`} className="btn-gold !py-3 text-sm">
          <Phone className="h-4 w-4" /> اتصل الآن
        </a>
        <a
          href={waLink(`مرحباً، أرغب بالاستفسار عن ${carName} المعروضة لديكم 🚗`)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl2 bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition hover:brightness-110 active:scale-95"
        >
          <MessageCircle className="h-4 w-4" /> واتساب
        </a>
        <button onClick={() => setModal("book")} className="btn-outline !py-3 text-sm">
          <CalendarClock className="h-4 w-4" /> احجز تجربة قيادة
        </button>
        <button onClick={() => setModal("quote")} className="btn-outline !py-3 text-sm">
          <BadgeDollarSign className="h-4 w-4" /> اطلب عرض سعر
        </button>
        <button onClick={() => setModal("tradein")} className="btn-outline !py-3 text-sm col-span-2">
          <RefreshCcw className="h-4 w-4" /> قايض سيارتك (Trade-in)
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => toggleFavorite(car.slug)}
          className={cn("flex-1 rounded-xl2 border px-3 py-2.5 text-xs font-black transition flex items-center justify-center gap-1.5",
            fav ? "border-red-500 bg-red-500/10 text-red-500" : "border-white/15 hover:border-red-400")}
        >
          <Heart className={cn("h-3.5 w-3.5", fav && "fill-current")} /> {fav ? "في المفضلة" : "أضف للمفضلة"}
        </button>
        <button
          onClick={() => toggleCompare(car.slug)}
          className={cn("flex-1 rounded-xl2 border px-3 py-2.5 text-xs font-black transition flex items-center justify-center gap-1.5",
            comp ? "border-gold-500 bg-gold-500/10 text-gold-500" : "border-white/15 hover:border-gold-400")}
        >
          <Scale className="h-3.5 w-3.5" /> {comp ? "في المقارنة" : "أضف للمقارنة"}
        </button>
        <button
          onClick={showInStage}
          className="flex-1 rounded-xl2 border border-ishtar-400/40 px-3 py-2.5 text-xs font-black transition hover:bg-ishtar-500/10 flex items-center justify-center gap-1.5"
        >
          <Rotate3D className="h-3.5 w-3.5" /> عرض 3D
        </button>
      </div>

      <AnimatePresence>
        {modal && (
          <Modal onClose={() => setModal(null)}>
            {modal === "book" && <BookForm carId={car.id} carName={carName} onDone={() => setModal(null)} />}
            {modal === "quote" && (
              <InquiryModalForm
                carId={car.id}
                type="عرض سعر"
                title="اطلب عرض سعر"
                placeholder={`أرغب بالحصول على أفضل سعر لـ ${carName}`}
                onDone={() => setModal(null)}
              />
            )}
            {modal === "tradein" && (
              <InquiryModalForm
                carId={car.id}
                type="مقايضة"
                title="قايض سيارتك"
                placeholder={`أملك سيارة (اذكر النوع والموديل والممشى) وأرغب بمقايضتها بـ ${carName}`}
                onDone={() => setModal(null)}
              />
            )}
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        className="glass w-full max-w-md p-6 !bg-night-900/95"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 left-4 opacity-60 hover:opacity-100" aria-label="إغلاق">
          <X className="h-5 w-5" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

function BookForm({ carId, carName, onDone }: { carId: string; carName: string; onDone: () => void }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const today = new Date().toISOString().split("T")[0];

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("loading");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        carId,
        name: fd.get("name"),
        phone: fd.get("phone"),
        date: fd.get("date"),
        time: fd.get("time"),
      }),
    });
    setState(res.ok ? "done" : "error");
    if (res.ok) setTimeout(onDone, 1800);
  };

  if (state === "done")
    return <p className="py-8 text-center font-black text-gold-500">✓ تم حجز موعدك بنجاح — سنتصل بك للتأكيد</p>;

  return (
    <form onSubmit={submit}>
      <h3 className="mb-1 font-black text-lg">احجز تجربة قيادة</h3>
      <p className="mb-5 text-xs opacity-70">{carName}</p>
      <div className="space-y-3">
        <input name="name" required placeholder="الاسم الكامل" className="input" aria-label="الاسم" />
        <input name="phone" required dir="ltr" placeholder="07xxxxxxxxx" pattern="0?7[0-9]{9}" className="input text-right" aria-label="رقم الهاتف" />
        <div className="grid grid-cols-2 gap-3">
          <input name="date" type="date" required min={today} className="input" aria-label="التاريخ" />
          <select name="time" required className="input" aria-label="الوقت">
            {["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"].map((tm) => (
              <option key={tm} value={tm}>{tm}</option>
            ))}
          </select>
        </div>
      </div>
      {state === "error" && <p className="mt-2 text-xs text-red-400">حدث خطأ — حاول مجدداً</p>}
      <button disabled={state === "loading"} className="btn-gold mt-5 w-full disabled:opacity-60">
        {state === "loading" ? "جارِ الحجز..." : "تأكيد الحجز"}
      </button>
    </form>
  );
}

function InquiryModalForm({
  carId, type, title, placeholder, onDone,
}: { carId: string; type: string; title: string; placeholder: string; onDone: () => void }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("loading");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        carId, type,
        name: fd.get("name"),
        phone: fd.get("phone"),
        message: fd.get("message"),
      }),
    });
    setState(res.ok ? "done" : "error");
    if (res.ok) setTimeout(onDone, 1800);
  };

  if (state === "done")
    return <p className="py-8 text-center font-black text-gold-500">✓ استلمنا طلبك — سنتواصل معك قريباً</p>;

  return (
    <form onSubmit={submit}>
      <h3 className="mb-5 font-black text-lg">{title}</h3>
      <div className="space-y-3">
        <input name="name" required placeholder="الاسم الكامل" className="input" aria-label="الاسم" />
        <input name="phone" required dir="ltr" placeholder="07xxxxxxxxx" pattern="0?7[0-9]{9}" className="input text-right" aria-label="رقم الهاتف" />
        <textarea name="message" required rows={4} placeholder={placeholder} className="input resize-none" aria-label="الرسالة" />
      </div>
      {state === "error" && <p className="mt-2 text-xs text-red-400">حدث خطأ — حاول مجدداً</p>}
      <button disabled={state === "loading"} className="btn-gold mt-5 w-full disabled:opacity-60">
        {state === "loading" ? "جارِ الإرسال..." : "إرسال الطلب"}
      </button>
    </form>
  );
}
