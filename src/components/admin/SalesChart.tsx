"use client";

import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export default function SalesChart({
  data,
}: {
  data: { month: string; sales: number; revenue: number }[];
}) {
  return (
    <div className="h-72 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.1)" />
          <XAxis dataKey="month" tick={{ fill: "#9aa3b2", fontSize: 12, fontFamily: "Tajawal" }} />
          <YAxis tick={{ fill: "#9aa3b2", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "#141a23",
              border: "1px solid rgba(201,162,39,0.3)",
              borderRadius: 12,
              fontFamily: "Tajawal",
            }}
            labelStyle={{ color: "#C9A227", fontWeight: 700 }}
            formatter={(value: number, name: string) =>
              name === "sales" ? [`${value} سيارة`, "المبيعات"] : [`$${value}K`, "الإيراد"]
            }
          />
          <Bar dataKey="sales" fill="#1B4F8C" radius={[6, 6, 0, 0]} maxBarSize={38} />
          <Line type="monotone" dataKey="revenue" stroke="#C9A227" strokeWidth={2.5} dot={{ fill: "#C9A227", r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
