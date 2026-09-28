import type { Metadata } from "next";
import FaqClient from "@/components/FaqClient";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة",
  description: "إجابات عن أكثر الأسئلة شيوعاً حول الشراء والتقسيط والمقايضة والاستيراد في معرض بابل للسيارات.",
};

export default function FaqPage() {
  return <FaqClient />;
}
