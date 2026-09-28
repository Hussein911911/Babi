import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import fs from "node:fs/promises";
import path from "node:path";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

/**
 * Demo upload handler — saves to /public/uploads.
 * In production, swap this for Cloudinary/S3 (see README).
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });

  // Public sell-form uploads are allowed but capped at 2 files; staff can upload more
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  const cap = session ? 10 : 2;
  const urls: string[] = [];

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });

  for (const file of files.slice(0, cap)) {
    if (!ALLOWED.includes(file.type) || file.size > MAX_SIZE) continue;
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, name), buf);
    urls.push(`/uploads/${name}`);
  }

  return NextResponse.json({ ok: true, urls });
}
