"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Car, MessageSquare, CalendarClock, LogOut, Menu, X, Home, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";

const LINKS = [
  { href: "/admin", label: "الإحصائيات", icon: LayoutDashboard },
  { href: "/admin/cars", label: "السيارات", icon: Car },
  { href: "/admin/inquiries", label: "الاستفسارات", icon: MessageSquare },
  { href: "/admin/bookings", label: "حجوزات القيادة", icon: CalendarClock },
];

export default function AdminShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-gold-500/15 p-5">
        <p className="font-black">لوحة التحكم</p>
        <p className="text-[10px] tracking-[0.25em] text-gold-500 font-en uppercase">Babylon Motors</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {LINKS.map((l) => {
          const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl2 px-4 py-3 text-sm font-bold transition",
                active ? "bg-gold-500/15 text-gold-500" : "opacity-70 hover:opacity-100 hover:bg-gold-500/5"
              )}
            >
              <l.icon className="h-4.5 w-4.5 h-5 w-5" />
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gold-500/15 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-ishtar-600 to-ishtar-900 border border-gold-500/40 font-black text-gold-500">
            {user.name[0]}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black">{user.name}</p>
            <p className="flex items-center gap-1 text-[11px] text-gold-500">
              <ShieldCheck className="h-3 w-3" />
              {user.role === "ADMIN" ? "مدير" : "موظف"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="btn-outline flex-1 !py-2 !px-2 text-xs">
            <Home className="h-3.5 w-3.5" /> الموقع
          </Link>
          <button onClick={logout} className="flex-1 rounded-xl2 border border-red-500/40 px-2 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 transition flex items-center justify-center gap-1.5">
            <LogOut className="h-3.5 w-3.5" /> خروج
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="glass sticky top-0 hidden h-screen w-64 shrink-0 !rounded-none border-l border-gold-500/15 lg:block">
        {Sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 h-full w-64 bg-night-900 border-l border-gold-500/20">
            <button onClick={() => setOpen(false)} className="absolute top-4 left-4" aria-label="إغلاق">
              <X className="h-5 w-5" />
            </button>
            {Sidebar}
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="glass sticky top-0 z-40 flex items-center justify-between !rounded-none border-b border-gold-500/15 px-5 py-3 lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="القائمة"><Menu className="h-5 w-5" /></button>
          <p className="font-black text-sm">لوحة التحكم</p>
          <span className="w-5" />
        </header>
        <div className="p-5 md:p-8">{children}</div>
      </div>
    </div>
  );
}
