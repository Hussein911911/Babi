"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, User, CalendarDays, Phone, MapPin, GraduationCap,
  Briefcase, Search, CheckCircle2, BadgeCheck, Clock3, Banknote, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type PublicJob = {
  id: string;
  title: string;
  category: string;
  location: string;
  salary: string;
  hours: string;
  description: string;
};

type FormData = {
  fullName: string;
  age: string;
  phone: string;
  address: string;
  education: string;
  experience: string;
  jobId: string;
};

const EDUCATION_OPTIONS = [
  "ابتدائية", "متوسطة", "إعدادية", "دبلوم", "بكالوريوس", "ماجستير فما فوق", "بدون شهادة",
];

export default function CardWizard({ code, jobs }: { code: string; jobs: PublicJob[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<FormData>({
    fullName: "", age: "", phone: "", address: "", education: "", experience: "", jobId: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Job picker filters
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [loc, setLoc] = useState("");

  const categories = useMemo(() => Array.from(new Set(jobs.map((j) => j.category))), [jobs]);
  const locations = useMemo(() => Array.from(new Set(jobs.map((j) => j.location))), [jobs]);
  const filteredJobs = useMemo(
    () =>
      jobs.filter((j) => {
        if (q && !`${j.title} ${j.category} ${j.location}`.includes(q)) return false;
        if (cat && j.category !== cat) return false;
        if (loc && j.location !== loc) return false;
        return true;
      }),
    [jobs, q, cat, loc]
  );

  const selectedJob = jobs.find((j) => j.id === data.jobId);

  const steps = [
    {
      id: "fullName", icon: User, title: "شنو اسمك الكامل؟", hint: "الاسم الثلاثي أو الرباعي",
      validate: () => (data.fullName.trim().length >= 3 ? "" : "اكتب اسمك الكامل (3 أحرف على الأقل)"),
      input: (
        <input
          autoFocus value={data.fullName}
          onChange={(e) => setData({ ...data, fullName: e.target.value })}
          placeholder="مثال: علي حسين محمد"
          className="input !text-lg !py-4 text-center"
          aria-label="الاسم الكامل"
        />
      ),
    },
    {
      id: "age", icon: CalendarDays, title: "كم عمرك؟", hint: "بالسنوات",
      validate: () => {
        const n = +data.age;
        return n >= 15 && n <= 80 ? "" : "العمر لازم يكون بين 15 و 80 سنة";
      },
      input: (
        <input
          autoFocus type="number" inputMode="numeric" min={15} max={80} value={data.age}
          onChange={(e) => setData({ ...data, age: e.target.value })}
          placeholder="مثال: 25"
          className="input !text-lg !py-4 text-center font-en"
          aria-label="العمر"
        />
      ),
    },
    {
      id: "phone", icon: Phone, title: "رقم هاتفك؟", hint: "رقم عراقي يبدأ بـ 07",
      validate: () => (/^0?7[0-9]{9}$/.test(data.phone) ? "" : "اكتب رقم هاتف عراقي صحيح (07xxxxxxxxx)"),
      input: (
        <input
          autoFocus dir="ltr" inputMode="tel" value={data.phone}
          onChange={(e) => setData({ ...data, phone: e.target.value.replace(/[^0-9]/g, "") })}
          placeholder="07xxxxxxxxx"
          className="input !text-lg !py-4 text-center font-en"
          aria-label="رقم الهاتف"
        />
      ),
    },
    {
      id: "address", icon: MapPin, title: "وين ساكن؟", hint: "المحافظة والمنطقة",
      validate: () => (data.address.trim().length >= 3 ? "" : "اكتب عنوان سكنك"),
      input: (
        <input
          autoFocus value={data.address}
          onChange={(e) => setData({ ...data, address: e.target.value })}
          placeholder="مثال: بابل — الحلة — حي الجمعية"
          className="input !text-lg !py-4 text-center"
          aria-label="العنوان"
        />
      ),
    },
    {
      id: "education", icon: GraduationCap, title: "شنو تحصيلك الدراسي؟", hint: "اختر من القائمة",
      validate: () => (data.education ? "" : "اختر تحصيلك الدراسي"),
      input: (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {EDUCATION_OPTIONS.map((opt) => (
            <button
              key={opt} type="button"
              onClick={() => setData({ ...data, education: opt })}
              className={cn(
                "rounded-xl2 border px-3 py-3.5 text-sm font-black transition",
                data.education === opt
                  ? "border-gold-500 bg-gold-500/15 text-gold-500"
                  : "border-white/15 opacity-75 hover:opacity-100 hover:border-gold-500/40"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      ),
    },
    {
      id: "experience", icon: Briefcase, title: "عندك خبرة سابقة؟", hint: "اختياري — اكتب مجال خبرتك وسنواتها، أو اضغط التالي",
      validate: () => "",
      input: (
        <textarea
          autoFocus rows={4} value={data.experience}
          onChange={(e) => setData({ ...data, experience: e.target.value })}
          placeholder="مثال: اشتغلت سائق 3 سنوات، وعندي خبرة بصيانة السيارات..."
          className="input !text-base resize-none"
          aria-label="الخبرة"
        />
      ),
    },
  ];

  const JOB_STEP = steps.length; // job picker
  const REVIEW_STEP = steps.length + 1; // review + إتمام
  const totalSteps = steps.length + 2;
  const progress = ((step + 1) / totalSteps) * 100;

  const next = () => {
    setError("");
    if (step < steps.length) {
      const err = steps[step].validate();
      if (err) return setError(err);
    }
    if (step === JOB_STEP && !data.jobId) return setError("اختر وظيفة حتى تكمل");
    setDir(1);
    setStep((s) => Math.min(s + 1, REVIEW_STEP));
  };

  const back = () => {
    setError("");
    setDir(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/cards/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, age: +data.age }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "حدث خطأ — حاول مجدداً");
      setSubmitting(false);
      return;
    }
    // Server page re-renders as the completed printable استمارة
    router.refresh();
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs font-black">
          <span className="text-gold-500">الخطوة {step + 1} من {totalSteps}</span>
          <span className="opacity-60 font-en">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-gold-500 to-gold-300"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && step < JOB_STEP && steps[step].id !== "experience") {
              e.preventDefault();
              next();
            }
          }}
        >
          {/* ── Info steps ── */}
          {step < JOB_STEP && (
            <div className="glass p-6 md:p-10 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-ishtar-600 to-ishtar-900 border border-gold-500/40">
                {(() => { const I = steps[step].icon; return <I className="h-7 w-7 text-gold-500" />; })()}
              </div>
              <h2 className="text-2xl font-black md:text-3xl">{steps[step].title}</h2>
              <p className="mt-2 text-sm opacity-60">{steps[step].hint}</p>
              <div className="mt-7">{steps[step].input}</div>
            </div>
          )}

          {/* ── Job picker ── */}
          {step === JOB_STEP && (
            <div className="glass p-5 md:p-7">
              <div className="mb-5 text-center">
                <h2 className="text-2xl font-black">اختر الوظيفة المناسبة</h2>
                <p className="mt-2 text-sm opacity-60 flex items-center justify-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-gold-500" />
                  معلومات صاحب العمل تظهر بالاستمارة بعد الضغط على إتمام
                </p>
              </div>

              {/* Filters */}
              <div className="mb-4 grid gap-2.5 sm:grid-cols-3">
                <div className="relative sm:col-span-1">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث..." className="input !pr-9 !py-2.5 text-sm" aria-label="بحث" />
                </div>
                <select value={cat} onChange={(e) => setCat(e.target.value)} className="input !py-2.5 text-sm" aria-label="الفئة">
                  <option value="">كل الفئات</option>
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
                <select value={loc} onChange={(e) => setLoc(e.target.value)} className="input !py-2.5 text-sm" aria-label="الموقع">
                  <option value="">كل المواقع</option>
                  {locations.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>

              {/* Jobs list */}
              <div className="max-h-[46vh] space-y-2.5 overflow-y-auto pl-1">
                {filteredJobs.map((j) => (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => setData({ ...data, jobId: j.id })}
                    className={cn(
                      "w-full rounded-xl2 border p-4 text-right transition",
                      data.jobId === j.id
                        ? "border-gold-500 bg-gold-500/10 shadow-glow"
                        : "border-white/10 hover:border-gold-500/40"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-black">{j.title}</p>
                      {data.jobId === j.id && <CheckCircle2 className="h-5 w-5 shrink-0 text-gold-500" />}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] opacity-75">
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3 text-gold-500" />{j.category}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-gold-500" />{j.location}</span>
                      {j.salary && <span className="flex items-center gap-1"><Banknote className="h-3 w-3 text-gold-500" />{j.salary}</span>}
                      {j.hours && <span className="flex items-center gap-1"><Clock3 className="h-3 w-3 text-gold-500" />{j.hours}</span>}
                    </div>
                    {j.description && <p className="mt-2 text-xs leading-6 opacity-60 line-clamp-2">{j.description}</p>}
                  </button>
                ))}
                {filteredJobs.length === 0 && (
                  <p className="py-10 text-center text-sm opacity-60">لا توجد وظائف مطابقة — جرّب تغيير الفلاتر</p>
                )}
              </div>
            </div>
          )}

          {/* ── Review ── */}
          {step === REVIEW_STEP && (
            <div className="glass p-6 md:p-8">
              <h2 className="mb-6 text-center text-2xl font-black">راجع معلوماتك قبل الإتمام</h2>
              <div className="space-y-2.5 text-sm">
                {[
                  ["الاسم الكامل", data.fullName],
                  ["العمر", `${data.age} سنة`],
                  ["رقم الهاتف", data.phone],
                  ["العنوان", data.address],
                  ["التحصيل الدراسي", data.education],
                  ["الخبرة", data.experience || "—"],
                  ["الوظيفة المختارة", selectedJob ? `${selectedJob.title} — ${selectedJob.location}` : "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-3 rounded-xl2 border border-gold-500/10 px-4 py-3">
                    <span className="opacity-60 shrink-0">{k}</span>
                    <span className="font-black text-left">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl2 border border-ishtar-400/30 bg-ishtar-500/10 p-4 text-xs leading-6 opacity-85">
                <BadgeCheck className="inline h-4 w-4 text-gold-500 ml-1" />
                بعد الضغط على <b>إتمام</b> تُقفل الاستمارة وتظهر معلومات صاحب العمل، وتكدر تطبعها أو تراجعها بأي وقت بنفس باركود البطاقة.
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <p className="mt-4 rounded-xl2 border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm font-bold text-red-400">
          {error}
        </p>
      )}

      {/* Nav buttons */}
      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <button onClick={back} className="btn-outline flex-1 !py-3.5" disabled={submitting}>
            <ArrowRight className="h-4 w-4" /> السابق
          </button>
        )}
        {step < REVIEW_STEP ? (
          <button onClick={next} className="btn-gold flex-[2] !py-3.5">
            التالي <ArrowLeft className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={submit} disabled={submitting} className="btn-gold flex-[2] !py-3.5 disabled:opacity-60">
            {submitting ? "جارِ الإتمام..." : "✓ إتمام"}
          </button>
        )}
      </div>
    </div>
  );
}
