import { KpiCard } from "../../components/KpiCard";
import { EntityPanel } from "../../components/EntityPanel";
import { useAppStore } from "../../store/appStore";

export function DashboardView() {
  const dashboard = useAppStore((state) => state.dashboard);

  if (!dashboard) {
    return <div className="rounded-[28px] bg-white p-6 shadow-card">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Upcoming Exams" value={dashboard.stats.upcomingExams} accent="#0f766e" />
        <KpiCard label="Pending Applications" value={dashboard.stats.pendingApplications} accent="#ea580c" />
        <KpiCard label="Tasks Due Soon" value={dashboard.stats.tasksDueSoon} accent="#2563eb" />
        <KpiCard label="Expiring Certificates" value={dashboard.stats.expiringCertificates} accent="#7c3aed" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <EntityPanel
          title="Upcoming Exams"
          items={dashboard.upcomingExams}
          primary={(item) => item.examName}
          secondary={(item) => item.organization}
          date={(item) => item.examDate}
        />
        <EntityPanel
          title="Tasks Due Soon"
          items={dashboard.tasksDueSoon}
          primary={(item) => item.title}
          secondary={(item) => item.status}
          date={(item) => item.deadline}
        />
      </section>
    </div>
  );
}
