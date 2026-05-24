import { AlertTriangle, Bell, PackageCheck, ShoppingBasket } from "lucide-react";

import { demoUsers } from "@/server/auth/permissions";
import { adminQueryService } from "@/server/services/AdminQueryService";

const fallbackMetrics = {
  reservationsToday: 0,
  openPickups: 0,
  criticalInventory: 0,
  failedNotifications: 0,
};

export async function DashboardKpiGrid() {
  const result = await adminQueryService
    .getDashboard(demoUsers.producer_admin)
    .then((metrics) => ({ metrics, failed: false }))
    .catch(() => ({ metrics: fallbackMetrics, failed: true }));

  const metrics = [
    { label: "Reservierungen heute", value: result.metrics.reservationsToday, icon: ShoppingBasket },
    { label: "Offene Abholungen", value: result.metrics.openPickups, icon: PackageCheck },
    { label: "Kritische Bestände", value: result.metrics.criticalInventory, icon: AlertTriangle },
    { label: "Notification Fehler", value: result.metrics.failedNotifications, icon: Bell },
  ];

  return (
    <section className="grid four" aria-label={result.failed ? "Kennzahlen nicht geladen" : "Kennzahlen"}>
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <article className="card metric" key={metric.label}>
            <Icon size={20} aria-hidden="true" />
            <span className="metric-value">{metric.value}</span>
            <span className="muted">{metric.label}</span>
          </article>
        );
      })}
    </section>
  );
}
