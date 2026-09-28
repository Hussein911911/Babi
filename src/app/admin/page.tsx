import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import StatsCards from "@/components/admin/StatsCards";
import SalesChart from "@/components/admin/SalesChart";
import Link from "next/link";
import { MessageSquare, ScrollText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getSession();
  const [carsCount, soldCount, inquiriesCount, newInquiries, bookingsCount, totalViews, latestInquiries, logs] =
    await Promise.all([
      prisma.car.count(),
      prisma.car.count({ where: { sold: true } }),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: "NEW" } }),
      prisma.booking.count(),
      prisma.car.aggregate({ _sum: { views: true } }),
      prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { car: true } }),
      session?.role === "ADMIN"
        ? prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { user: true } })
        : Promise.resolve([]),
    ]);

  const monthly = [
    { month: "نيسان", sales: 9, revenue: 310 },
    { month: "أيار", sales: 12, revenue: 415 },
    { month: "حزيران", sales: 8, revenue: 290 },
    { month: "تموز", sales: 15, revenue: 540 },
    { month: "آب", sales: 11, revenue: 380 },
    { month: "أيلول", sales: 14, revenue: 505 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black md:text-3xl">أهلاً {session?.name} 👋</h1>
        <p className="mt-1 text-sm opacity-60">هذه نظرة سريعة على أداء المعرض</p>
      </div>

      <StatsCards
        stats={{
          cars: carsCount,
          sold: soldCount,
          inquiries: inquiriesCount,
          newInquiries,
          bookings: bookingsCount,
          views: totalViews._sum.views || 0,
        }}
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="glass p-5 lg:col-span-3">
          <p className="mb-4 font-black">المبيعات الشهرية (آخر 6 أشهر)</p>
          <SalesChart data={monthly} />
        </div>

        <div className="glass p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-black flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gold-500" /> آخر الاستفسارات
            </p>
            <Link href="/admin/inquiries" className="text-xs text-gold-500 font-bold hover:underline">عرض الكل</Link>
          </div>
          <ul className="space-y-3">
            {latestInquiries.map((inq) => (
              <li key={inq.id} className="rounded-xl2 border border-gold-500/10 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-black">{inq.name}</p>
                  <span className={`badge text-[10px] ${inq.status === "NEW" ? "bg-gold-500 text-charcoal" : inq.status === "FOLLOWED" ? "bg-ishtar-600 text-white" : "bg-white/10"}`}>
                    {inq.status === "NEW" ? "جديد" : inq.status === "FOLLOWED" ? "تمت المتابعة" : "مغلق"}
                  </span>
                </div>
                <p className="mt-1 text-xs opacity-70 line-clamp-1">{inq.message}</p>
                {inq.car && <p className="mt-1 text-[11px] text-gold-500">{inq.car.brand} {inq.car.model}</p>}
              </li>
            ))}
            {latestInquiries.length === 0 && <p className="text-sm opacity-60">لا توجد استفسارات بعد</p>}
          </ul>
        </div>
      </div>

      {session?.role === "ADMIN" && logs.length > 0 && (
        <div className="glass p-5">
          <p className="mb-4 font-black flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-gold-500" /> سجل النشاطات (Audit Log)
          </p>
          <ul className="divide-y divide-gold-500/10 text-sm">
            {logs.map((log) => (
              <li key={log.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="opacity-85">{log.detail}</span>
                <span className="shrink-0 text-[11px] opacity-50 font-en">
                  {new Date(log.createdAt).toLocaleString("ar-IQ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
