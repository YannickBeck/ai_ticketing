import { Bell, LayoutDashboard, MapPin, ScanLine, ShoppingBasket } from "lucide-react";
import Link from "next/link";

const links = [
  { href: "/stands", label: "Stände", icon: MapPin },
  { href: "/orders/order_demo_1", label: "Bestellung", icon: ShoppingBasket },
  { href: "/admin", label: "Admin", icon: LayoutDashboard },
  { href: "/staff", label: "Staff", icon: ScanLine },
  { href: "/account/notifications", label: "Benachrichtigung", icon: Bell },
];

export function AppNav() {
  return (
    <nav className="top-nav" aria-label="Hauptnavigation">
      <Link className="brand" href="/">
        <span className="brand-mark">
          <ShoppingBasket size={20} aria-hidden="true" />
        </span>
        <span>Spargelstand</span>
      </Link>
      <div className="nav-links">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link className="nav-link" href={link.href} key={link.href}>
              <Icon size={16} aria-hidden="true" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
