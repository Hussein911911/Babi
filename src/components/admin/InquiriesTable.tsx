"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = {
  id: string; name: string; phone: string; message: string; type: string;
  status: string; car: string | null; createdAt: string;
};

const STATUS: Record<string, { label: string; cls: string }> = {
  NEW: { label: "جديد", cls: "bg-gold-500 text-charcoal" },
  FOLLOWED: { label: "تمت المتابعة", cls: "bg-ishtar-600 text-white" },
  CLOSED: { label: "مغلق", cls: "bg-white/10 opacity-70" },
};

export default function InquiriesTable({ inquiries }: { inquiries: Row[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("");
  const list = filter ? inquiries.filter((i) => i.status === filter) : inquiries;

  const setStatus = async (id: string, status: string) => {
    await fetch(`/api/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black">الاستفسارات ({inquiries.length})</h1>
        <div className="flex gap-1.5">
          {["", "NEW", "FOLLOWED", "CLOSED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-xl2 border px-3.5 py-1.5 text-xs font-black transition",
                filter === s ? "border-gold-500 bg-gold-500/15 text-gold-500" : "border-white/10 opacity-60 hover:opacity-100"
              )}
            >
              {s === "" ? "الكل" : STATUS[s].label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {list.map((inq) => (
          <div key={inq.id} className="glass p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-black">{inq.name}</p>
                  <span className={`badge text-[10px] ${STATUS[inq.status]?.cls}`}>{STATUS[inq.status]?.label}</span>
                  <span className="badge border border-gold-500/30 text-gold-500 text-[10px]">{inq.type}</span>
                </div>
                {inq.car && <p className="mt-1 text-xs text-gold-500">🚗 {inq.car}</p>}
                <p className="mt-2 text-sm leading-7 opacity-85 whitespace-pre-line">{inq.message}</p>
                <p className="mt-2 text-[11px] opacity-40 font-en">{new Date(inq.createdAt).toLocaleString("ar-IQ")}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <div className="flex gap-1.5">
                  <a href={`tel:${inq.phone}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold-500/30 text-gold-500 hover:bg-gold-500/10" aria-label="اتصال">
                    <Phone className="h-4 w-4" />
                  </a>
                  <a href={`https://wa.me/964${inq.phone.replace(/^0/, "")}`} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-green-500/40 text-green-400 hover:bg-green-500/10" aria-label="واتساب">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </div>
                <select
                  value={inq.status}
                  onChange={(e) => setStatus(inq.id, e.target.value)}
                  className="input !py-1.5 !px-2 text-xs !w-auto"
                  aria-label="تغيير الحالة"
                >
                  <option value="NEW">جديد</option>
                  <option value="FOLLOWED">تمت المتابعة</option>
                  <option value="CLOSED">مغلق</option>
                </select>
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="glass p-10 text-center opacity-60">لا توجد استفسارات</div>
        )}
      </div>
    </div>
  );
}
