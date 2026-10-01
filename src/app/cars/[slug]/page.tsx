import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toCarDTO } from "@/lib/types";
import { formatIQD, formatUSD, formatKm, parseArr } from "@/lib/utils";
import Gallery from "@/components/car/Gallery";
import SpecsTabs from "@/components/car/SpecsTabs";
import CarActions from "@/components/car/CarActions";
import InstallmentCalculator from "@/components/car/InstallmentCalculator";
import CarCard from "@/components/CarCard";
import { BadgeCheck, FileText, ShieldCheck, ChevronLeft } from "lucide-react";

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  const cars = await prisma.car.findMany({ select: { slug: true } });
  return cars.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const car = await prisma.car.findUnique({ where: { slug: params.slug } });
  if (!car) return {};
  const title = `${car.brand} ${car.model} ${car.year}`;
  return {
    title,
    description: car.description.slice(0, 160),
    openGraph: { title, description: car.description.slice(0, 160), images: parseArr(car.images) },
  };
}

export default async function CarDetailPage({ params }: Props) {
  const car = await prisma.car.findUnique({ where: { slug: params.slug } });
  if (!car) notFound();

  const similar = await prisma.car.findMany({
    where: { slug: { not: car.slug }, sold: false, OR: [{ brand: car.brand }, { bodyType: car.bodyType }] },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const dto = toCarDTO(car);
  const carName = `${car.brand} ${car.model} ${car.year}`;

  const vehicleLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: carName,
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    vehicleModelDate: String(car.year),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: car.mileage, unitCode: "KMT" },
    fuelType: car.fuel,
    vehicleTransmission: car.transmission,
    color: car.colorName,
    vehicleIdentificationNumber: car.vin || undefined,
    offers: {
      "@type": "Offer",
      price: car.priceUSD,
      priceCurrency: "USD",
      availability: car.sold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleLd) }} />

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm opacity-70" aria-label="breadcrumb">
        <Link href="/" className="hover:text-gold-500">الرئيسية</Link>
        <ChevronLeft className="h-3.5 w-3.5" />
        <Link href="/cars" className="hover:text-gold-500">السيارات</Link>
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="font-black opacity-100">{carName}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Gallery + specs */}
        <div className="lg:col-span-3 space-y-8">
          <Gallery images={parseArr(car.images)} alt={carName} />
          <SpecsTabs car={dto} />

          {/* Condition report */}
          <div className="glass p-5">
            <p className="mb-4 flex items-center gap-2 font-black">
              <FileText className="h-5 w-5 text-gold-500" /> تقرير الحالة والفحص
            </p>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="rounded-xl2 border border-gold-500/15 p-3.5">
                <p className="text-xs opacity-60 mb-1">تقرير الفحص</p>
                <p className="font-bold">{car.inspection || "—"}</p>
              </div>
              <div className="rounded-xl2 border border-gold-500/15 p-3.5">
                <p className="text-xs opacity-60 mb-1">الضمان</p>
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-gold-500" /> {car.warranty || "—"}
                </p>
              </div>
              {car.vin && (
                <div className="rounded-xl2 border border-gold-500/15 p-3.5 sm:col-span-2">
                  <p className="text-xs opacity-60 mb-1">رقم الشاصي (VIN)</p>
                  <p className="font-bold font-en tracking-wider" dir="ltr">{car.vin}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass p-5">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="badge bg-ishtar-600 text-white">{car.condition}</span>
              {car.featured && <span className="badge bg-gold-500 text-charcoal">★ مميزة</span>}
              {car.sold && <span className="badge bg-red-600 text-white">مباعة</span>}
            </div>
            <h1 className="text-2xl font-black md:text-3xl">{carName}</h1>
            <p className="mt-1 text-sm opacity-70">{car.colorName} • {formatKm(car.mileage)} • {car.bodyType}</p>

            <div className="mt-5 rounded-xl2 border border-gold-500/25 bg-gold-500/5 p-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-black text-gold-500 font-en">{formatUSD(car.priceUSD)}</p>
                  <p className="text-sm opacity-75 mt-1">{formatIQD(car.priceUSD)}</p>
                </div>
                {car.negotiable && (
                  <span className="badge border border-gold-500/40 text-gold-500">
                    <BadgeCheck className="h-3.5 w-3.5" /> قابل للتفاوض
                  </span>
                )}
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 opacity-85">{car.description}</p>

            <div className="mt-6">
              <CarActions car={dto} />
            </div>
          </div>

          <InstallmentCalculator priceUSD={car.priceUSD} />
        </div>
      </div>

      {/* Similar cars */}
      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-black">سيارات <span className="gold-text">مشابهة</span></h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((c, i) => <CarCard key={c.id} car={toCarDTO(c)} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
