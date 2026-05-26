"use client";

import { cn } from "@/lib/utils";
import {
  Bell,
  Home,
  LayoutDashboard,
  LeafyGreen,
  MapPin,
  Menu,
  Moon,
  Package,
  ScanLine,
  ShoppingBasket,
  Sun,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  exact?: boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    label: "Entdecken",
    items: [
      { href: "/", label: "Start", icon: Home, exact: true },
      { href: "/stands", label: "Stände", icon: MapPin },
    ],
  },
  {
    label: "Bestellungen",
    items: [
      { href: "/orders", label: "Bestellungen", icon: ShoppingBasket },
      { href: "/account/notifications", label: "Benachrichtigungen", icon: Bell },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/orders", label: "Orders", icon: Package },
      { href: "/admin/stands", label: "Stände", icon: MapPin },
      { href: "/admin/revenue", label: "Umsatz", icon: Package },
    ],
  },
  {
    label: "Staff",
    items: [
      { href: "/staff", label: "Übersicht", icon: ScanLine, exact: true },
      { href: "/staff/scan", label: "QR Scan", icon: ScanLine },
      { href: "/staff/orders", label: "Aufträge", icon: Package },
      { href: "/staff/delivery", label: "Lieferung", icon: Truck },
    ],
  },
];

/** Returns true if this link should be highlighted as active */
function useIsActive(href: string, exact = false) {
  const pathname = usePathname();
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function SidebarLink({ href, label, icon: Icon, exact = false }: NavItem) {
  const isActive = useIsActive(href, exact);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-green-600/20 text-green-400"
          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200",
      )}
    >
      <Icon size={15} />
      <span>{label}</span>
    </Link>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Brand + optional close button */}
      <div className="flex items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center gap-2.5 group" onClick={onClose}>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-600 transition-opacity group-hover:opacity-90">
            <LeafyGreen size={16} className="text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">Spargelstand</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Menü schließen"
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:text-zinc-200"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-2">
        {navSections.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarLink key={item.href} {...item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer: dark-mode toggle */}
      <div className="flex-shrink-0 border-t border-zinc-800 px-3 py-3">
        {mounted && (
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 transition-all hover:bg-white/5 hover:text-zinc-200"
          >
            {resolvedTheme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            <span>{resolvedTheme === "dark" ? "Hell-Modus" : "Dunkel-Modus"}</span>
          </button>
        )}
      </div>
    </div>
  );
}

const AUTH_PATHS = new Set(["/login", "/signup"]);

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Never show sidebar on auth pages
  if (AUTH_PATHS.has(pathname)) return null;

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-[220px] flex-shrink-0 flex-col border-r border-zinc-800 bg-zinc-900">
        <SidebarContent />
      </aside>

      {/* ── Mobile: floating hamburger ───────────────────────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Menü öffnen"
        className="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-zinc-100 shadow-lg md:hidden"
      >
        <Menu size={17} />
      </button>

      {/* ── Mobile drawer ────────────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-zinc-800 bg-zinc-900 shadow-2xl md:hidden">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
}
