"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ label = "طباعة الاستمارة" }: { label?: string }) {
  return (
    <button onClick={() => window.print()} className="btn-gold print-hide">
      <Printer className="h-4 w-4" /> {label}
    </button>
  );
}
