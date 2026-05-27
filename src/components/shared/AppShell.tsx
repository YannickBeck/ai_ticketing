"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar";
import { CustomerHeader } from "./CustomerHeader";

/** Routes that belong to internal tooling — get the dark sidebar */
function isInternalRoute(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/staff");
}

/** Routes without any nav (login, signup, QR display pages) */
function isAuthRoute(pathname: string) {
  return pathname === "/login" || pathname === "/signup";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  /* Auth pages: no chrome, full viewport */
  if (isAuthRoute(pathname)) {
    return <>{children}</>;
  }

  /* Admin / Staff: dark sidebar layout */
  if (isInternalRoute(pathname)) {
    return (
      <div className="app-layout">
        <AppSidebar />
        <div className="app-main">
          <div className="app-content">{children}</div>
        </div>
      </div>
    );
  }

  /* Customer pages: friendly top-header layout */
  return (
    <div className="customer-layout">
      <CustomerHeader />
      <main className="customer-main">
        <div className="customer-content">{children}</div>
      </main>
    </div>
  );
}
