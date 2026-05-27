import { AlertTriangle, Bell, PackageCheck, ShoppingBasket } from "lucide-react";

import { getCurrentUser } from "@/server/auth/requireUser";
import { adminQueryService } from "@/server/services/AdminQueryService";

const fallbackMetrics = {
  reservationsToday: 0,
  openPickups: 0,
  criticalInventory: 0,
  failedNotifications: 0,
};

type MetricConfig = {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  /** Tailwind color classes applied when value is concerning */
  alertWhen: (v: number) => boolean;
  alertClasses: string;
  normalClasses: string;
};

export async function DashboardKpiGrid() {
  const user = await getCurrentUser();
  const result =
    user
      ? await adminQueryService
          .getDashboard(user)
          .then((metrics) => ({ metrics, failed: false }))
          .catch(() => ({ metrics: fallbackMetrics, failed: true }))
      : { metrics: fallbackMetrics, failed: true };

  const metrics: MetricConfig[] = [
    {
      label: "Reservierungen heute",
      value: result.metrics.reservationsToday,
      icon: ShoppingBasket,
      alertWhen: () => false,
      alertClasses: "",
      normalClasses: "text-green-600 dark:text-green-400",
    },
    {
      label: "Offene Abholungen",
      value: result.metrics.openPickups,
      icon: PackageCheck,
      alertWhen: (v) => v > 10,
      alertClasses: "text-amber-600 dark:text-amber-400",
      normalClasses: "text-sky-600 dark:text-sky-400",
    },
    {
      label: "Kritische Bestände",
      value: result.metrics.criticalInventory,
      icon: AlertTriangle,
      alertWhen: (v) => v > 0,
      alertClasses: "text-red-600 dark:text-red-400",
      normalClasses: "text-zinc-500 dark:text-zinc-400",
    },
    {
      label: "Notification-Fehler",
      value: result.metrics.failedNotifications,
      icon: Bell,
      alertWhen: (v) => v > 0,
      alertClasses: "text-red-600 dark:text-red-400",
      normalClasses: "text-zinc-500 dark:text-zinc-400",
    },
  ];

  return (
    <section
      className="grid four"
      aria-label={result.failed ? "Kennzahlen nicht geladen" : "Kennzahlen"}
    >
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const isAlert = metric.alertWhen(metric.value);
        const colorClass = isAlert ? metric.alertClasses : metric.normalClasses;

        return (
          <article className="card metric" key={metric.label}>
            <Icon
              size={22}
              aria-hidden="true"
              className={colorClass}
            />
            <span className={`metric-value ${colorClass}`}>{metric.value}</span>
            <span className="muted" style={{ fontSize: 13 }}>
              {metric.label}
            </span>
          </article>
        );
      })}
    </section>
  );
}
