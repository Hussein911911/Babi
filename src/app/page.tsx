import { prisma } from "@/lib/prisma";
import { toCarDTO } from "@/lib/types";
import Hero from "@/components/home/Hero";
import StageSection from "@/components/home/StageSection";
import {
  StatsSection,
  FeaturedSection,
  ServicesTeaser,
  Testimonials,
  BlogTeaser,
  CTABanner,
} from "@/components/home/HomeSections";

export const revalidate = 60;

export default async function HomePage() {
  const [cars, posts] = await Promise.all([
    prisma.car.findMany({ orderBy: [{ featured: "desc" }, { createdAt: "desc" }] }),
    prisma.post.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  const dtos = cars.map(toCarDTO);
  const featured = dtos.filter((c) => c.featured && !c.sold).slice(0, 6);
  const stageCars = dtos.filter((c) => !c.sold).slice(0, 8);

  return (
    <>
      <Hero />
      <div id="showroom-stage" className="scroll-mt-20">
        <StageSection cars={stageCars} />
      </div>
      <StatsSection />
      <FeaturedSection cars={featured.length ? featured : dtos.slice(0, 6)} />
      <ServicesTeaser />
      <Testimonials />
      <BlogTeaser
        posts={posts.map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt, cover: p.cover }))}
      />
      <CTABanner />
    </>
  );
}
