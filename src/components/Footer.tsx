"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Send } from "lucide-react";
import { useApp } from "./Providers";
import { CONTACT } from "@/lib/utils";

export default function Footer() {
  const { t } = useApp();
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (pathname?.startsWith("/admin") || pathname === "/login") return null;

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setDone(true);
  };

  return (
    <footer className="relative mt-24 border-t border-gold-500/20">
      <div className="divider-ishtar absolute -top-[10px] inset-x-0" />
      <div className="babylon-bg absolute inset-0 opacity-40 pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xl font-black mb-1">{t.brand}</p>
          <p className="text-xs tracking-[0.3em] text-gold-500 font-en uppercase mb-4">Babylon Motors</p>
          <p className="text-sm leading-7 opacity-80">{t.footer.about}</p>
          <div className="mt-4 flex gap-2">
            <a aria-label="Instagram" href={CONTACT.socials.instagram} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl2 border border-gold-500/30 hover:bg-gold-500/10 transition"><Instagram className="h-4 w-4" /></a>
            <a aria-label="Facebook" href={CONTACT.socials.facebook} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl2 border border-gold-500/30 hover:bg-gold-500/10 transition"><Facebook className="h-4 w-4" /></a>
            <a aria-label="Telegram" href={CONTACT.socials.telegram} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-xl2 border border-gold-500/30 hover:bg-gold-500/10 transition"><Send className="h-4 w-4" /></a>
          </div>
        </div>

        <div>
          <p className="font-black mb-4 text-gold-500">{t.footer.quick}</p>
          <ul className="space-y-2.5 text-sm">
            {[
              { href: "/cars", label: t.nav.cars },
              { href: "/services", label: t.nav.services },
              { href: "/sell", label: t.nav.sell },
              { href: "/about", label: t.nav.about },
              { href: "/faq", label: t.nav.faq },
              { href: "/privacy", label: "سياسة الخصوصية" },
              { href: "/login", label: t.nav.admin },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="opacity-80 hover:opacity-100 hover:text-gold-500 transition">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-black mb-4 text-gold-500">{t.footer.contact}</p>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2.5"><MapPin className="h-4 w-4 mt-1 text-gold-500 shrink-0" /><span className="opacity-80">{CONTACT.address}</span></li>
            <li className="flex gap-2.5"><Phone className="h-4 w-4 mt-1 text-gold-500 shrink-0" /><a dir="ltr" href={`tel:${CONTACT.phone}`} className="opacity-80 hover:text-gold-500 font-en">{CONTACT.phone}</a></li>
            <li className="flex gap-2.5"><Mail className="h-4 w-4 mt-1 text-gold-500 shrink-0" /><a href={`mailto:${CONTACT.email}`} className="opacity-80 hover:text-gold-500 font-en">{CONTACT.email}</a></li>
            <li className="flex gap-2.5"><Clock className="h-4 w-4 mt-1 text-gold-500 shrink-0" /><span className="opacity-80">{CONTACT.hours}</span></li>
          </ul>
        </div>

        <div>
          <p className="font-black mb-4 text-gold-500">{t.footer.newsletter}</p>
          <p className="text-sm opacity-80 mb-3">{t.footer.newsletterSub}</p>
          {done ? (
            <p className="text-sm text-gold-500 font-bold">✓ تم الاشتراك بنجاح</p>
          ) : (
            <form onSubmit={subscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.common.email}
                className="input font-en"
                aria-label={t.common.email}
              />
              <button className="btn-gold !px-4 !py-2 shrink-0" aria-label={t.footer.subscribe}>
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="relative border-t border-gold-500/15 py-5 text-center text-xs opacity-70">
        © {new Date().getFullYear()} {t.brand} — {t.footer.rights}
      </div>
    </footer>
  );
}
