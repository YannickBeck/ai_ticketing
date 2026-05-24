import { PackagePlus, ScanLine, ShoppingBasket } from "lucide-react";
import Link from "next/link";

const actions = [
  { href: "/staff/scan", label: "QR scannen", icon: ScanLine },
  { href: "/staff/orders", label: "Offene Orders", icon: ShoppingBasket },
  { href: "/staff/inventory", label: "Bestand ändern", icon: PackagePlus },
];

export function StaffHomeActions() {
  return (
    <section className="grid three">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link className="card stack" href={action.href} key={action.href}>
            <Icon size={24} aria-hidden="true" />
            <h3>{action.label}</h3>
          </Link>
        );
      })}
    </section>
  );
}
