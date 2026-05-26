import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";

import { AppSidebar } from "@/components/shared/AppSidebar";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spargelstand-App",
  description: "MVP-Grundgeruest fuer garantierte Reservierung und QR-Abholung.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="de" className={GeistSans.variable} suppressHydrationWarning>
      <body>
        <Providers>
          <div className="app-layout">
            <AppSidebar />
            <div className="app-main">
              <div className="app-content">{children}</div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
