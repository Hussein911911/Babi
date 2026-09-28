import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import ContactClient from "@/components/ContactClient";
import { CONTACT } from "@/lib/utils";
import { MapPin, Phone, Mail, Clock, Navigation } from "lucide-react";

export const metadata: Metadata = {
  title: "اتصل بنا",
  description: "تواصل مع معرض بابل للسيارات في الحلة — هاتف، واتساب، خريطة الموقع وأوقات الدوام.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-10">
      <Reveal className="mb-10 text-center">
        <h1 className="text-3xl font-black md:text-5xl">تواصل <span className="gold-text">معنا</span></h1>
        <p className="mt-4 opacity-75">فريقنا جاهز للرد على استفساراتك طوال أيام الأسبوع</p>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="glass p-6">
            <ul className="space-y-5 text-sm">
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-gold-500 shrink-0" />
                <div>
                  <p className="font-black mb-0.5">العنوان</p>
                  <p className="opacity-75">{CONTACT.address}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Phone className="h-5 w-5 mt-0.5 text-gold-500 shrink-0" />
                <div>
                  <p className="font-black mb-0.5">الهاتف / واتساب</p>
                  <a dir="ltr" href={`tel:${CONTACT.phone}`} className="opacity-75 hover:text-gold-500 font-en">{CONTACT.phone}</a>
                </div>
              </li>
              <li className="flex gap-3">
                <Mail className="h-5 w-5 mt-0.5 text-gold-500 shrink-0" />
                <div>
                  <p className="font-black mb-0.5">البريد الإلكتروني</p>
                  <a href={`mailto:${CONTACT.email}`} className="opacity-75 hover:text-gold-500 font-en">{CONTACT.email}</a>
                </div>
              </li>
              <li className="flex gap-3">
                <Clock className="h-5 w-5 mt-0.5 text-gold-500 shrink-0" />
                <div>
                  <p className="font-black mb-0.5">أوقات الدوام</p>
                  <p className="opacity-75">{CONTACT.hours}</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Map */}
          <div className="glass overflow-hidden">
            <iframe
              title="موقع معرض بابل للسيارات على الخريطة"
              src="https://www.openstreetmap.org/export/embed.html?bbox=44.3899%2C32.4437%2C44.4499%2C32.4837&layer=mapnik&marker=32.4637%2C44.4199"
              className="h-72 w-full border-0"
              loading="lazy"
            />
            <a
              href={CONTACT.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-gold-500/10 py-3.5 text-sm font-black text-gold-500 hover:bg-gold-500/20 transition"
            >
              <Navigation className="h-4 w-4" /> الاتجاهات على Google Maps
            </a>
          </div>
        </div>

        <ContactClient />
      </div>
    </div>
  );
}
