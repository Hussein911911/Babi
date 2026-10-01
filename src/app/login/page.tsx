"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "فشل تسجيل الدخول");
      return;
    }
    router.push(params.get("next") || "/admin");
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass w-full max-w-md p-8"
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold-500/60 shadow-glow">
          <Lock className="h-7 w-7 text-gold-500" />
        </div>
        <h1 className="text-2xl font-black">لوحة التحكم</h1>
        <p className="mt-1 text-sm opacity-60">معرض بابل للسيارات — دخول الموظفين</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          <input name="email" type="email" required placeholder="البريد الإلكتروني" className="input !pr-10 font-en" autoComplete="username" />
        </div>
        <div className="relative">
          <Lock className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          <input
            name="password"
            type={show ? "text" : "password"}
            required
            placeholder="كلمة المرور"
            className="input !pr-10 !pl-10 font-en"
            autoComplete="current-password"
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100" aria-label="إظهار كلمة المرور">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error && <p className="rounded-xl2 bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-sm text-red-400">{error}</p>}

        <button disabled={loading} className="btn-gold w-full disabled:opacity-60">
          {loading ? "جارِ الدخول..." : "تسجيل الدخول"}
          <ArrowRight className="h-4 w-4 rotate-180" />
        </button>
      </form>

      <div className="mt-6 rounded-xl2 border border-ishtar-500/30 bg-ishtar-500/5 p-4 text-xs leading-6 opacity-80">
        <p className="font-black text-ishtar-300 mb-1">حسابات تجريبية:</p>
        <p className="font-en" dir="ltr">👑 admin@babylon-motors.iq / Admin@123</p>
        <p className="font-en" dir="ltr">👤 staff@babylon-motors.iq / Staff@123</p>
      </div>

      <p className="mt-6 text-center text-sm">
        <Link href="/" className="opacity-60 hover:opacity-100 hover:text-gold-500 transition">← العودة للموقع</Link>
      </p>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="hero-gradient babylon-bg flex min-h-screen items-center justify-center px-4 py-20">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
