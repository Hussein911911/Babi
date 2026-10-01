import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChevronLeft } from "lucide-react";

export const revalidate = 300;
type Props = { params: { slug: string } };

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({ select: { slug: true } });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: Props) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });
  if (!post || !post.published) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 pt-28 pb-10">
      <nav className="mb-6 flex items-center gap-1.5 text-sm opacity-70">
        <Link href="/blog" className="hover:text-gold-500">المدونة</Link>
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="font-black opacity-100 line-clamp-1">{post.title}</span>
      </nav>

      <h1 className="text-3xl font-black leading-tight md:text-4xl">{post.title}</h1>
      <p className="mt-3 text-sm opacity-50 font-en">
        {new Date(post.createdAt).toLocaleDateString("ar-IQ", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      {post.cover && (
        <div className="relative mt-8 aspect-video overflow-hidden rounded-xl2">
          <Image src={post.cover} alt={post.title} fill priority sizes="768px" className="object-cover" />
        </div>
      )}

      <div className="mt-8 space-y-5 text-lg leading-9 opacity-90">
        {post.content.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <div className="divider-ishtar mt-12" />
      <div className="mt-8 text-center">
        <Link href="/cars" className="btn-gold">تصفح سياراتنا المعروضة</Link>
      </div>
    </article>
  );
}
