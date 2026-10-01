"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Moon, Sun, Globe, Scale, Heart, Phone } from "lucide-react";
import { useApp } from "./Providers";
import { useUI } from "@/store/ui";
import { cn, CONTACT } from "@/lib/utils";

export default function Navbar() {
  const { t, locale, setLocale, theme, toggleTheme } = useApp();
  const { compare, favorites } = useUI();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/card") || pathname === "/login") return null;

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/cars", label: t.nav.cars },
    { href: "/services", label: t.nav.services },
    { href: "/sell", label: t.nav.sell },
    { href: "/about", label: t.nav.about },
    { href: "/blog", label: t.nav.blog },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "glass shadow-card py-2" : "bg-transparent py-4"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0" aria-label={t.brand}>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl2 bg-gradient-to-br from-ishtar-600 to-ishtar-900 border border-gold-500/40 shadow-glow">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-gold-500">
              <path d="M3 20v-2h1V9l8-5 8 5v9h1v2H3zm4-2h2v-6h2v6h2v-6h2v6h2V9.9L12 6.4 7 9.9V18z" />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="font-black text-base">{t.brand}</p>
            <p className="text-[10px] tracking-[0.3em] text-gold-500 font-en uppercase">
              {locale === "ar" ? "Babylon Motors" : "بابل موتورز"}
            </p>
          </div>
        </Link>

        {/* Desktop links */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "relative rounded-xl2 px-3.5 py-2 text-sm font-bold transition hover:text-gold-500",
                pathname === l.href ? "text-gold-500" : "opacity-85"
              )}
            >
              {l.label}
              {pathname === l.href && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded bg-gold-500"
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/compare"
            aria-label={t.nav.compare}
            className="relative hidden sm:flex h-10 w-10 items-center justify-center rounded-xl2 border border-transparent hover:border-gold-500/40 transition"
          >
            <Scale className="h-5 w-5" />
            {compare.length > 0 && (
              <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-black text-charcoal">
                {compare.length}
              </span>
            )}
          </Link>
          <Link
            href="/cars?fav=1"
            aria-label={t.common.favorite}
            className="relative hidden sm:flex h-10 w-10 items-center justify-center rounded-xl2 border border-transparent hover:border-gold-500/40 transition"
          >
            <Heart className="h-5 w-5" />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-ishtar-500 text-[10px] font-black text-white">
                {favorites.length}
              </span>
            )}
          </Link>
          <button
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            aria-label="Change language"
            className="flex h-10 items-center gap-1 rounded-xl2 border border-transparent px-2.5 text-sm font-black hover:border-gold-500/40 transition"
          >
            <Globe className="h-4.5 w-4.5 h-5 w-5" />
            <span className="font-en">{locale === "ar" ? "EN" : "ع"}</span>
          </button>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-10 w-10 items-center justify-center rounded-xl2 border border-transparent hover:border-gold-500/40 transition"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <a href={`tel:${CONTACT.phone}`} className="btn-gold !py-2 !px-4 hidden md:inline-flex text-sm">
            <Phone className="h-4 w-4" />
            {t.common.call}
          </a>
          <button
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl2 border border-gold-500/30"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden glass mx-3 mt-2 mb-2"
            aria-label="mobile"
          >
            <div className="flex flex-col p-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-xl2 px-4 py-3 font-bold transition hover:bg-gold-500/10",
                    pathname === l.href && "text-gold-500 bg-gold-500/10"
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <div className="flex gap-2 p-2">
                <Link href="/compare" className="btn-outline flex-1 !py-2 text-sm">
                  <Scale className="h-4 w-4" /> {t.nav.compare}
                </Link>
                <a href={`tel:${CONTACT.phone}`} className="btn-gold flex-1 !py-2 text-sm">
                  <Phone className="h-4 w-4" /> {t.common.call}
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
