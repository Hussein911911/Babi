export const USD_TO_IQD = 1320;

export function formatUSD(usd: number) {
  return `$${usd.toLocaleString("en-US")}`;
}

export function formatIQD(usd: number) {
  const iqd = usd * USD_TO_IQD;
  if (iqd >= 1_000_000) {
    const millions = iqd / 1_000_000;
    return `${millions.toLocaleString("ar-IQ", { maximumFractionDigits: 1 })} مليون د.ع`;
  }
  return `${iqd.toLocaleString("ar-IQ")} د.ع`;
}

export function formatKm(km: number) {
  return km === 0 ? "صفر" : `${km.toLocaleString("en-US")} كم`;
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function parseArr(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export const CONTACT = {
  phone: process.env.NEXT_PUBLIC_PHONE || "+9647801234567",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "9647801234567",
  address: "الحلة، شارع 60، مقابل بوابة بابل الأثرية — محافظة بابل، العراق",
  addressEn: "Hilla, 60th Street, opposite Babylon Gate — Babil, Iraq",
  email: "info@babylon-motors.iq",
  hours: "السبت – الخميس: 9 صباحاً – 9 مساءً | الجمعة: 3 – 9 مساءً",
  mapUrl: "https://maps.google.com/?q=32.4637,44.4199",
  socials: {
    instagram: "https://instagram.com/babylonmotors",
    facebook: "https://facebook.com/babylonmotors",
    tiktok: "https://tiktok.com/@babylonmotors",
    telegram: "https://t.me/babylonmotors",
  },
};

export function waLink(message: string) {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
}
