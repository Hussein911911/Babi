"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus, Pencil, Trash2, X, MapPin, Banknote, Clock3, Users, EyeOff, Eye, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type JobRow = {
  id: string; title: string; category: string; location: string;
  salary: string; hours: string; description: string;
  employerName: string; employerPhone: string; employerAddress: string;
  active: boolean; applicants: number;
};

const EMPTY: Omit<JobRow, "id" | "applicants"> = {
  title: "", category: "عام", location: "الحلة", salary: "", hours: "",
  description: "", employerName: "", employerPhone: "", employerAddress: "", active: true,
};

export default function AdminJobs({ jobs, isAdmin }: { jobs: JobRow[]; isAdmin: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<JobRow | "new" | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const del = async (job: JobRow) => {
    if (!confirm(`حذف وظيفة "${job.title}" نهائياً؟`)) return;
    setBusy(job.id);
    const res = await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) router.refresh();
    else alert((await res.json()).error || "فشل الحذف");
  };

  const toggleActive = async (job: JobRow) => {
    setBusy(job.id);
    await fetch(`/api/jobs/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !job.active }),
    });
    setBusy(null);
    router.refresh();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black">الوظائف ({jobs.length})</h1>
        <button onClick={() => setEditing("new")} className="btn-gold !py-2 !px-4 text-sm">
          <Plus className="h-4 w-4" /> إضافة وظيفة
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {jobs.map((j) => (
          <div key={j.id} className={cn("glass p-5", !j.active && "opacity-50")}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-black">{j.title}</p>
                <p className="text-xs text-gold-500 mt-0.5">{j.category}</p>
              </div>
              <span className={cn("badge text-[10px]", j.active ? "bg-green-500/15 text-green-400 border border-green-500/40" : "bg-white/10")}>
                {j.active ? "فعالة" : "موقوفة"}
              </span>
            </div>

            <div className="mt-3 space-y-1.5 text-xs opacity-80">
              <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gold-500" />{j.location}</p>
              {j.salary && <p className="flex items-center gap-1.5"><Banknote className="h-3.5 w-3.5 text-gold-500" />{j.salary}</p>}
              {j.hours && <p className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-gold-500" />{j.hours}</p>}
              <p className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-gold-500" />{j.applicants} متقدم</p>
            </div>

            <div className="mt-3 rounded-xl2 border border-gold-500/20 bg-gold-500/5 p-3 text-xs">
              <p className="mb-1 flex items-center gap-1 font-black text-gold-500">
                <Lock className="h-3 w-3" /> صاحب العمل (مخفي عن المتقدمين)
              </p>
              <p className="opacity-85">{j.employerName} — <span dir="ltr" className="font-en">{j.employerPhone}</span></p>
              {j.employerAddress && <p className="opacity-60 mt-0.5">{j.employerAddress}</p>}
            </div>

            <div className="mt-4 flex gap-1.5">
              <button onClick={() => setEditing(j)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition" aria-label="تعديل">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => toggleActive(j)} disabled={busy === j.id} className="flex h-8 w-8 items-center justify-center rounded-lg border border-ishtar-400/40 text-ishtar-300 hover:bg-ishtar-500/10 transition" aria-label={j.active ? "إيقاف" : "تفعيل"}>
                {j.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              {isAdmin && (
                <button onClick={() => del(j)} disabled={busy === j.id} className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition disabled:opacity-40" aria-label="حذف">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="glass p-10 text-center opacity-60 md:col-span-2 xl:col-span-3">لا توجد وظائف — أضف أول وظيفة</div>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <JobModal
            job={editing === "new" ? null : editing}
            onClose={() => setEditing(null)}
            onSaved={() => { setEditing(null); router.refresh(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function JobModal({
  job, onClose, onSaved,
}: { job: JobRow | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState(job ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof EMPTY, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(job ? `/api/jobs/${job.id}` : "/api/jobs", {
      method: job ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error || "فشل الحفظ");
      return;
    }
    onSaved();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto"
      onClick={onClose} role="dialog" aria-modal
    >
      <motion.form
        initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 16 }}
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="glass relative my-8 w-full max-w-lg !bg-night-900/95 p-6"
      >
        <button type="button" onClick={onClose} className="absolute top-4 left-4 opacity-60 hover:opacity-100" aria-label="إغلاق">
          <X className="h-5 w-5" />
        </button>
        <h3 className="mb-5 text-lg font-black">{job ? `تعديل: ${job.title}` : "إضافة وظيفة جديدة"}</h3>

        <div className="grid gap-3 sm:grid-cols-2">
          <input required placeholder="العنوان الوظيفي *" className="input sm:col-span-2" value={form.title} onChange={(e) => set("title", e.target.value)} />
          <input required placeholder="الفئة (سياقة، صيانة...) *" className="input" value={form.category} onChange={(e) => set("category", e.target.value)} />
          <input required placeholder="الموقع *" className="input" value={form.location} onChange={(e) => set("location", e.target.value)} />
          <input placeholder="الراتب" className="input" value={form.salary} onChange={(e) => set("salary", e.target.value)} />
          <input placeholder="ساعات الدوام" className="input" value={form.hours} onChange={(e) => set("hours", e.target.value)} />
          <textarea rows={3} placeholder="وصف الوظيفة وشروطها" className="input resize-none sm:col-span-2" value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        <p className="mt-4 mb-2 flex items-center gap-1.5 text-xs font-black text-gold-500">
          <Lock className="h-3.5 w-3.5" /> معلومات صاحب العمل — تظهر للمتقدم فقط بعد الإتمام
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input required placeholder="اسم صاحب العمل *" className="input" value={form.employerName} onChange={(e) => set("employerName", e.target.value)} />
          <input required dir="ltr" placeholder="07xxxxxxxxx *" className="input text-right font-en" value={form.employerPhone} onChange={(e) => set("employerPhone", e.target.value)} />
          <input placeholder="عنوان صاحب العمل" className="input sm:col-span-2" value={form.employerAddress} onChange={(e) => set("employerAddress", e.target.value)} />
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="h-4 w-4 accent-gold-500" />
          الوظيفة فعالة (تظهر للمتقدمين)
        </label>

        {error && <p className="mt-3 rounded-xl2 border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}

        <button disabled={saving} className="btn-gold mt-5 w-full disabled:opacity-60">
          {saving ? "جارِ الحفظ..." : job ? "حفظ التعديلات" : "إضافة الوظيفة"}
        </button>
      </motion.form>
    </motion.div>
  );
}
