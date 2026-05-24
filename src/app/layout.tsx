import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppNav } from "@/components/shared/AppNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spargelstand-App",
  description: "MVP-Grundgeruest fuer garantierte Reservierung und QR-Abholung.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="de">
      <body>
        <main className="app-shell">
          <AppNav />
          {children}
        </main>
      </body>
    </html>
  );
}
