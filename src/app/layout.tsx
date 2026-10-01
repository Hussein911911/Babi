import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Preloader from "@/components/Preloader";
import SmoothScroll from "@/components/SmoothScroll";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "معرض بابل للسيارات — Babylon Motors | الحلة، بابل",
    template: "%s | معرض بابل للسيارات",
  },
  description:
    "أرقى معرض سيارات في محافظة بابل — الحلة. سيارات جديدة ومستوردة (تويوتا، لكزس، مرسيدس، جينيسيس) بضمان وفحص كامل، بيع وشراء ومقايضة وتقسيط.",
  keywords: ["معرض سيارات", "بابل", "الحلة", "سيارات للبيع", "العراق", "Babylon Motors"],
  openGraph: {
    type: "website",
    locale: "ar_IQ",
    siteName: "معرض بابل للسيارات — Babylon Motors",
    title: "معرض بابل للسيارات — Babylon Motors",
    description: "فخامة تليق بحضارة بابل — سيارات جديدة ومستوردة بضمان وفحص كامل في الحلة، بابل.",
    images: ["/cars/lexus-lx600.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0E1116",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: "معرض بابل للسيارات — Babylon Motors",
  url: siteUrl,
  telephone: "+9647801234567",
  address: {
    "@type": "PostalAddress",
    streetAddress: "شارع 60",
    addressLocality: "الحلة",
    addressRegion: "بابل",
    addressCountry: "IQ",
  },
  geo: { "@type": "GeoCoordinates", latitude: 32.4637, longitude: 44.4199 },
  openingHours: "Sa-Th 09:00-21:00",
  priceRange: "$$$",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Inter:wght@400;600;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>
          <Preloader />
          <SmoothScroll />
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <WhatsAppFloat />
        </Providers>
      </body>
    </html>
  );
}
