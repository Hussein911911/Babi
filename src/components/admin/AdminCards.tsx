"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, CreditCard, FileText, RotateCcw, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CardRow = {
  id: string; code: string; status: string; fullName: string; phone: string;
  jobTitle: string | null; createdAt: string; completedAt: string | null;
};

export default function AdminCards({ cards, isAdmin }: { cards: CardRow[]; isAdmin: boolean }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const list = filter ? cards.filter((c) => c.status === filter) : cards;
  const completed = cards.filter((c) => c.status === "COMPLETED").length;

  const create = async () => {
    setCreating(true);
    const res = await fetch("/api/cards", { method: "POST" });
    setCreating(false);
    if (res.ok) {
      const { card } = await res.json();
      router.refresh();
      // Open the printable badge right away
      window.open(`/card/${card.code}/badge`, "_blank");
    }
  };

  const reset = async (code: string) => {
    if (!confirm(`إعادة تعيين البطاقة ${code}؟ ستُمسح معلومات المتقدم ويصير بالإمكان ملؤها من جديد.`)) return;
    await fetch(`/api/cards/${code}`, { method: "DELETE" });
    router.refresh();
  };

  const copy = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/card/${code}`).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">بطاقات التوظيف ({cards.length})</h1>
          <p className="mt-1 text-xs opacity-60">{completed} استمارة مكتملة • {cards.length - completed} بانتظار الملء</p>
        </div>
        <button onClick={create} disabled={creating} className="btn-gold !py-2 !px-4 text-sm disabled:opacity-60">
          <Plus className="h-4 w-4" /> {creating ? "جارِ الإصدار..." : "إصدار بطاقة جديدة"}
        </button>
      </div>

      <div className="mb-5 flex gap-1.5">
        {[["", "الكل"], ["NEW", "جديدة"], ["COMPLETED", "مكتملة"]].map(([v, label]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={cn(
              "rounded-xl2 border px-3.5 py-1.5 text-xs font-black transition",
              filter === v ? "border-gold-500 bg-gold-500/15 text-gold-500" : "border-white/10 opacity-60 hover:opacity-100"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="glass overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-gold-500/15 text-right text-xs opacity-60">
              <th className="p-4 font-bold">الرمز</th>
              <th className="p-4 font-bold">الحالة</th>
              <th className="p-4 font-bold">المتقدم</th>
              <th className="p-4 font-bold">الوظيفة</th>
              <th className="p-4 font-bold">التاريخ</th>
              <th className="p-4 font-bold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-b border-gold-500/5 hover:bg-gold-500/[0.03]">
                <td className="p-4 font-en font-black tracking-wider text-gold-500" dir="ltr">{c.code}</td>
                <td className="p-4">
                  <span className={cn("badge text-[10px]", c.status === "COMPLETED" ? "bg-green-500/15 text-green-400 border border-green-500/40" : "bg-gold-500 text-charcoal")}>
                    {c.status === "COMPLETED" ? "مكتملة" : "بانتظار الملء"}
                  </span>
                </td>
                <td className="p-4">
                  {c.fullName ? (
                    <div>
                      <p className="font-black">{c.fullName}</p>
                      <p className="text-[11px] opacity-50 font-en" dir="ltr">{c.phone}</p>
                    </div>
                  ) : <span className="opacity-40">—</span>}
                </td>
                <td className="p-4">{c.jobTitle || <span className="opacity-40">—</span>}</td>
                <td className="p-4 text-[11px] opacity-60 font-en">
                  {new Date(c.completedAt || c.createdAt).toLocaleDateString("ar-IQ")}
                </td>
                <td className="p-4">
                  <div className="flex gap-1.5">
                    <Link href={`/card/${c.code}/badge`} target="_blank" aria-label="طباعة البطاقة" title="طباعة البطاقة" className="flex h-8 w-8 items-center justify-center rounded-lg border border-ishtar-400/40 text-ishtar-300 hover:bg-ishtar-500/10 transition">
                      <CreditCard className="h-3.5 w-3.5" />
                    </Link>
                    <Link href={`/card/${c.code}`} target="_blank" aria-label="عرض الاستمارة" title="عرض الاستمارة" className="flex h-8 w-8 items-center justify-center rounded-lg border border-gold-500/30 text-gold-500 hover:bg-gold-500/10 transition">
                      <FileText className="h-3.5 w-3.5" />
                    </Link>
                    <button onClick={() => copy(c.code)} aria-label="نسخ الرابط" title="نسخ الرابط" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 opacity-70 hover:opacity-100 transition">
                      {copied === c.code ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    {isAdmin && c.status === "COMPLETED" && (
                      <button onClick={() => reset(c.code)} aria-label="إعادة تعيين" title="إعادة تعيين" className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-8 text-center text-sm opacity-60">لا توجد بطاقات</p>}
      </div>
      <p className="mt-3 text-xs opacity-50">
        💡 عند إصدار بطاقة جديدة تُفتح صفحة الطباعة تلقائياً — اطبعها وسلّمها للزبون، وبمسح الباركود يبدأ ملء الاستمارة.
      </p>
    </div>
  );
}
