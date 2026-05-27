"use client";

import { cn } from "@/lib/utils";
import { LeafyGreen, Menu, Moon, ShoppingBasket, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const navLinks = [
  { href: "/stands", label: "Stände entdecken" },
  { href: "/orders", label: "Meine Bestellungen" },
  { href: "/account/notifications", label: "Benachrichtigungen" },
];

export function CustomerHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header className="customer-header">
      <div className="customer-header-inner">
        {/* Brand */}
        <Link href="/" className="customer-brand">
          <div className="customer-brand-mark">
            <LeafyGreen size={18} />
          </div>
          <span>Spargelstand</span>
        </Link>

        {/* Desktop nav */}
        <nav className="customer-nav" aria-label="Hauptnavigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "customer-nav-link",
                (pathname === link.href || pathname.startsWith(link.href + "/")) && "active",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: theme toggle + CTA + hamburger */}
        <div className="customer-header-cta">
          {/* Dark/light toggle — always visible on desktop */}
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="customer-theme-toggle"
              aria-label={resolvedTheme === "dark" ? "Hell-Modus aktivieren" : "Dunkel-Modus aktivieren"}
            >
              {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          <Link href="/stands" className="button primary customer-cta-btn">
            <ShoppingBasket size={15} aria-hidden="true" />
            Jetzt reservieren
          </Link>

          <button
            className="customer-hamburger"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <nav className="customer-mobile-menu" aria-label="Mobile Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="customer-mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="customer-mobile-cta">
            <Link href="/stands" className="button primary" onClick={() => setMobileOpen(false)}>
              <ShoppingBasket size={15} aria-hidden="true" />
              Jetzt reservieren
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
