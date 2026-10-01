import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import AdminJobs from "@/components/admin/AdminJobs";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
  const [jobs, session] = await Promise.all([
    prisma.job.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { cards: true } } },
    }),
    getSession(),
  ]);

  return (
    <AdminJobs
      jobs={jobs.map((j) => ({
        id: j.id, title: j.title, category: j.category, location: j.location,
        salary: j.salary, hours: j.hours, description: j.description,
        employerName: j.employerName, employerPhone: j.employerPhone,
        employerAddress: j.employerAddress, active: j.active,
        applicants: j._count.cards,
      }))}
      isAdmin={session?.role === "ADMIN"}
    />
  );
}
