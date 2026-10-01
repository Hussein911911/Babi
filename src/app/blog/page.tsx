import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "الأخبار والمدونة",
  description: "آخر أخبار معرض بابل للسيارات ومقالات ونصائح حول سوق السيارات في العراق.",
};
export const revalidate = 300;

export default async function BlogPage() {
  const posts = await prisma.post.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-10">
      <Reveal className="mb-10">
        <h1 className="text-3xl font-black md:text-4xl">الأخبار <span className="gold-text">والمدونة</span></h1>
        <p className="mt-2 opacity-75">نصائح ومقالات وأخبار من قلب سوق السيارات العراقي</p>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 0.08}>
            <Link href={`/blog/${p.slug}`} className="glass group block overflow-hidden h-full">
              <div className="relative aspect-video overflow-hidden">
                <Image src={p.cover || "/cars/lexus-lx600.jpg"} alt={p.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <p className="text-[11px] opacity-50 mb-2 font-en">
                  {new Date(p.createdAt).toLocaleDateString("ar-IQ", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                <h2 className="font-black leading-7 group-hover:text-gold-500 transition">{p.title}</h2>
                <p className="mt-2 text-sm leading-6 opacity-70 line-clamp-3">{p.excerpt}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
