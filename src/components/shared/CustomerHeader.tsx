"use client";

import { cn } from "@/lib/utils";
import {
  ChevronDown,
  LayoutDashboard,
  LeafyGreen,
  Menu,
  Moon,
  ScanLine,
  ShoppingBasket,
  Sun,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type NavUser = { id: string; role: string; email: string };

export function CustomerHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<NavUser | null | "loading">("loading");
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  // Fetch current user from lightweight endpoint
  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((r) => r.json())
      .then((data: NavUser | null) => setUser(data ?? null))
      .catch(() => setUser(null));
  }, [pathname]); // re-check on route change (e.g. after login redirect)

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  const loggedIn = user !== null && user !== "loading";
  const isAdmin =
    loggedIn && (user.role === "producer_admin" || user.role === "platform_admin");
  const isStaff = loggedIn && user.role === "staff";
  const isPlatformAdmin = loggedIn && user.role === "platform_admin";

  const navLinks = [
    { href: "/stands", label: "Stände entdecken" },
    ...(loggedIn
      ? [
          { href: "/orders", label: "Meine Bestellungen" },
          { href: "/account/notifications", label: "Benachrichtigungen" },
        ]
      : []),
  ];

  const initial = loggedIn ? user.email.slice(0, 1).toUpperCase() : "";

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfileOpen(false);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  }

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
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "customer-nav-link customer-nav-link--admin",
                pathname.startsWith("/admin") && "active",
              )}
            >
              <LayoutDashboard size={14} aria-hidden="true" />
              {isPlatformAdmin ? "Admin" : "Mein Stand"}
            </Link>
          )}
          {isStaff && (
            <Link
              href="/staff"
              className={cn(
                "customer-nav-link customer-nav-link--admin",
                pathname.startsWith("/staff") && "active",
              )}
            >
              <ScanLine size={14} aria-hidden="true" />
              Staff-Scan
            </Link>
          )}
        </nav>

        {/* Right side */}
        <div className="customer-header-cta">
          {/* Dark/light toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="customer-theme-toggle"
              aria-label={
                resolvedTheme === "dark" ? "Hell-Modus aktivieren" : "Dunkel-Modus aktivieren"
              }
            >
              {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          {/* Auth section */}
          {user === "loading" ? (
            /* Skeleton placeholder to prevent layout shift */
            <div className="user-avatar-skeleton" aria-hidden="true" />
          ) : loggedIn ? (
            /* Logged-in: avatar + dropdown */
            <div className="user-menu" ref={profileRef}>
              <button
                className="user-avatar-btn"
                onClick={() => setProfileOpen((v) => !v)}
                aria-label="Benutzerprofil öffnen"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <span className="user-avatar">{initial}</span>
                <ChevronDown
                  size={12}
                  className={cn("user-avatar-chevron", profileOpen && "open")}
                />
              </button>

              {profileOpen && (
                <div className="user-dropdown" role="menu">
                  <div className="user-dropdown-email">{user.email}</div>
                  <div className="user-dropdown-sep" />
                  <Link
                    href="/orders"
                    className="user-dropdown-item"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                  >
                    Meine Bestellungen
                  </Link>
                  <Link
                    href="/account/notifications"
                    className="user-dropdown-item"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                  >
                    Benachrichtigungen
                  </Link>
                  {isAdmin && (
                    <>
                      <div className="user-dropdown-sep" />
                      <Link
                        href="/admin"
                        className="user-dropdown-item user-dropdown-item--admin"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                      >
                        <LayoutDashboard size={14} aria-hidden="true" />
                        {isPlatformAdmin ? "Admin-Dashboard" : "Mein Stand"}
                      </Link>
                    </>
                  )}
                  {isStaff && (
                    <>
                      <div className="user-dropdown-sep" />
                      <Link
                        href="/staff"
                        className="user-dropdown-item user-dropdown-item--admin"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                      >
                        <ScanLine size={14} aria-hidden="true" />
                        Staff-Scan
                      </Link>
                    </>
                  )}
                  <div className="user-dropdown-sep" />
                  <button
                    className="user-dropdown-item user-dropdown-logout"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    Abmelden
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged-out: login + CTA */
            <>
              <Link href="/login" className="button secondary customer-login-btn">
                Anmelden
              </Link>
              <Link href="/stands" className="button primary customer-cta-btn">
                <ShoppingBasket size={15} aria-hidden="true" />
                Jetzt reservieren
              </Link>
            </>
          )}

          {/* Hamburger */}
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
          {isAdmin && (
            <Link href="/admin" className="customer-mobile-link" onClick={() => setMobileOpen(false)}>
              <LayoutDashboard size={14} aria-hidden="true" />
              {isPlatformAdmin ? "Admin-Dashboard" : "Mein Stand"}
            </Link>
          )}
          {isStaff && (
            <Link href="/staff" className="customer-mobile-link" onClick={() => setMobileOpen(false)}>
              <ScanLine size={14} aria-hidden="true" />
              Staff-Scan
            </Link>
          )}
          <div className="customer-mobile-cta">
            {loggedIn ? (
              <button className="button secondary" style={{ width: "100%" }} onClick={handleLogout}>
                Abmelden
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="button secondary"
                  style={{ width: "100%" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Anmelden
                </Link>
                <Link
                  href="/stands"
                  className="button primary"
                  style={{ width: "100%", marginTop: "8px" }}
                  onClick={() => setMobileOpen(false)}
                >
                  <ShoppingBasket size={15} aria-hidden="true" />
                  Jetzt reservieren
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
