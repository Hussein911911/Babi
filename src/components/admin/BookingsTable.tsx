"use client";

import { useRouter } from "next/navigation";
import { Phone, CalendarClock } from "lucide-react";

type Row = {
  id: string; name: string; phone: string; date: string; time: string;
  status: string; car: string;
};

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "بانتظار التأكيد", cls: "bg-gold-500 text-charcoal" },
  CONFIRMED: { label: "مؤكد", cls: "bg-green-600 text-white" },
  DONE: { label: "تمت التجربة", cls: "bg-ishtar-600 text-white" },
  CANCELLED: { label: "ملغي", cls: "bg-red-600/80 text-white" },
};

export default function BookingsTable({ bookings }: { bookings: Row[] }) {
  const router = useRouter();

  const setStatus = async (id: string, status: string) => {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">حجوزات تجربة القيادة ({bookings.length})</h1>
      <div className="glass overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-gold-500/15 text-right text-xs opacity-60">
              <th className="p-4 font-bold">العميل</th>
              <th className="p-4 font-bold">السيارة</th>
              <th className="p-4 font-bold">الموعد</th>
              <th className="p-4 font-bold">الحالة</th>
              <th className="p-4 font-bold">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-gold-500/5 hover:bg-gold-500/[0.03]">
                <td className="p-4">
                  <p className="font-black">{b.name}</p>
                  <a href={`tel:${b.phone}`} dir="ltr" className="text-xs opacity-60 hover:text-gold-500 font-en flex items-center gap-1 justify-end">
                    {b.phone} <Phone className="h-3 w-3" />
                  </a>
                </td>
                <td className="p-4 text-gold-500 font-bold">{b.car}</td>
                <td className="p-4">
                  <span className="flex items-center gap-1.5 font-en">
                    <CalendarClock className="h-4 w-4 text-gold-500" /> {b.date} — {b.time}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`badge text-[10px] ${STATUS[b.status]?.cls}`}>{STATUS[b.status]?.label}</span>
                </td>
                <td className="p-4">
                  <select
                    value={b.status}
                    onChange={(e) => setStatus(b.id, e.target.value)}
                    className="input !py-1.5 !px-2 text-xs !w-auto"
                    aria-label="تغيير حالة الحجز"
                  >
                    <option value="PENDING">بانتظار التأكيد</option>
                    <option value="CONFIRMED">مؤكد</option>
                    <option value="DONE">تمت التجربة</option>
                    <option value="CANCELLED">ملغي</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && <p className="p-8 text-center text-sm opacity-60">لا توجد حجوزات</p>}
      </div>
    </div>
  );
}
