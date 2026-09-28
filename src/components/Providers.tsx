"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { dict, type Locale, type Dict } from "@/lib/i18n";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dict;
  theme: "dark" | "light";
  toggleTheme: () => void;
};

const AppCtx = createContext<Ctx>({
  locale: "ar",
  setLocale: () => {},
  t: dict.ar,
  theme: "dark",
  toggleTheme: () => {},
});

export const useApp = () => useContext(AppCtx);

export function Providers({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const l = (localStorage.getItem("bm-locale") as Locale) || "ar";
    const th = (localStorage.getItem("bm-theme") as "dark" | "light") || "dark";
    setLocaleState(l);
    setTheme(th);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    localStorage.setItem("bm-locale", locale);
  }, [locale, mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("bm-theme", theme);
  }, [theme, mounted]);

  return (
    <AppCtx.Provider
      value={{
        locale,
        setLocale: setLocaleState,
        t: dict[locale],
        theme,
        toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}
