import { AlertTriangle, Bell, PackageCheck, ShoppingBasket } from "lucide-react";

const metrics = [
  { label: "Reservierungen heute", value: "12", icon: ShoppingBasket },
  { label: "Offene Abholungen", value: "7", icon: PackageCheck },
  { label: "Kritische Bestände", value: "3", icon: AlertTriangle },
  { label: "Notification Fehler", value: "0", icon: Bell },
];

export function DashboardKpiGrid() {
  return (
    <section className="grid four" aria-label="Kennzahlen">
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
