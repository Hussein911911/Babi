"use client";

import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { formatUSD, USD_TO_IQD } from "@/lib/utils";

export default function InstallmentCalculator({ priceUSD }: { priceUSD: number }) {
  const [down, setDown] = useState(Math.round(priceUSD * 0.3));
  const [months, setMonths] = useState(24);

  const monthly = useMemo(() => {
    const principal = Math.max(priceUSD - down, 0);
    const withMargin = principal * 1.08; // 8% flat margin
    return Math.ceil(withMargin / months);
  }, [priceUSD, down, months]);

  return (
    <div className="glass p-5">
      <p className="mb-4 flex items-center gap-2 font-black">
        <Calculator className="h-5 w-5 text-gold-500" /> حاسبة التقسيط
      </p>

      <label className="block mb-4">
        <span className="mb-1.5 flex justify-between text-xs font-bold opacity-75">
          <span>الدفعة الأولى</span>
          <span className="text-gold-500 font-en">{formatUSD(down)}</span>
        </span>
        <input
          type="range"
          min={Math.round(priceUSD * 0.2)}
          max={Math.round(priceUSD * 0.8)}
          step={500}
          value={down}
          onChange={(e) => setDown(+e.target.value)}
          className="w-full accent-gold-500"
          aria-label="الدفعة الأولى"
        />
      </label>

      <label className="block mb-5">
        <span className="mb-1.5 flex justify-between text-xs font-bold opacity-75">
          <span>عدد الأشهر</span>
          <span className="text-gold-500 font-en">{months} شهر</span>
        </span>
        <input
          type="range"
          min={6}
          max={36}
          step={6}
          value={months}
          onChange={(e) => setMonths(+e.target.value)}
          className="w-full accent-gold-500"
          aria-label="عدد الأشهر"
        />
      </label>

      <div className="rounded-xl2 border border-gold-500/30 bg-gold-500/10 p-4 text-center">
        <p className="text-xs opacity-75 mb-1">القسط الشهري التقريبي</p>
        <p className="text-2xl font-black text-gold-500 font-en">{formatUSD(monthly)}</p>
        <p className="text-xs opacity-70 mt-1">
          ≈ {(monthly * USD_TO_IQD).toLocaleString("ar-IQ")} د.ع شهرياً
        </p>
      </div>
      <p className="mt-3 text-[10px] leading-4 opacity-50">
        * الأرقام تقريبية لأغراض التوضيح وتشمل هامش إداري 8٪ — القسط النهائي يُحدد عند التعاقد.
      </p>
    </div>
  );
}
