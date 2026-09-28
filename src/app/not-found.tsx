import Link from "next/link";

export default function NotFound() {
  return (
    <div className="babylon-bg flex min-h-[85vh] flex-col items-center justify-center px-4 pt-24 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-gold-500/50 shadow-glow">
        <svg viewBox="0 0 24 24" className="h-12 w-12 fill-gold-500">
          <path d="M3 20v-2h1V9l8-5 8 5v9h1v2H3zm4-2h2v-6h2v6h2v-6h2v6h2V9.9L12 6.4 7 9.9V18z" />
        </svg>
      </div>
      <p className="font-en text-7xl font-black gold-text">404</p>
      <h1 className="mt-4 text-2xl font-black md:text-3xl">يبدو أنك ضللت الطريق إلى بوابة عشتار</h1>
      <p className="mt-3 max-w-md opacity-75 leading-7">
        الصفحة التي تبحث عنها غير موجودة — لكن كنوز بابل من السيارات الفاخرة بانتظارك في المعرض.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-gold">العودة للرئيسية</Link>
        <Link href="/cars" className="btn-outline">تصفح السيارات</Link>
      </div>
    </div>
  );
}
