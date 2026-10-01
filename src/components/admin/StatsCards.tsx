"use client";

import { Car, BadgeCheck, MessageSquare, CalendarClock, Eye, Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function StatsCards({
  stats,
}: {
  stats: { cars: number; sold: number; inquiries: number; newInquiries: number; bookings: number; views: number };
}) {
  const cards = [
    { icon: Car, label: "السيارات المعروضة", value: stats.cars - stats.sold, color: "text-gold-500" },
    { icon: BadgeCheck, label: "المباعة", value: stats.sold, color: "text-green-400" },
    { icon: MessageSquare, label: "إجمالي الاستفسارات", value: stats.inquiries, color: "text-ishtar-300" },
    { icon: Bell, label: "استفسارات جديدة", value: stats.newInquiries, color: "text-red-400" },
    { icon: CalendarClock, label: "حجوزات القيادة", value: stats.bookings, color: "text-purple-400" },
    { icon: Eye, label: "مشاهدات السيارات", value: stats.views, color: "text-sand" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass p-4"
        >
          <c.icon className={`h-5 w-5 ${c.color} mb-2`} />
          <p className="text-2xl font-black font-en">{c.value.toLocaleString("en-US")}</p>
          <p className="mt-0.5 text-[11px] opacity-60">{c.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
