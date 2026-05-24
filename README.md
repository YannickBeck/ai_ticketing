# Spargelstand-App

Die Spargelstand-App ist ein standortbasierter Preorder- und Pickup-Marktplatz für dezentrale landwirtschaftliche Verkaufsstände. Kunden finden Stände in ihrer Nähe, sehen Produktverfügbarkeiten, reservieren Ware verbindlich, bezahlen digital und holen die Bestellung per QR-Code ab. Optional erhalten Kunden transaktionale WhatsApp-Updates zu Bestellung, Zahlung und Abholung.

Der wichtigste Produktnutzen ist die Garantie: Eine bezahlte Reservierung muss bei Abholung tatsächlich verfügbar sein.

## MVP-Ziel

Das MVP soll beweisen, dass Kunden für eine garantierte Reservierung eine kleine Service Fee akzeptieren und dass Produzenten durch Reservierungsdaten bessere Bestands- und Lieferentscheidungen treffen können.

Der MVP-Kernflow ist:

```text
Kunde findet Stand
-> sieht Verfügbarkeit
-> reserviert Menge und Abholzeitfenster
-> bezahlt digital
-> erhält QR-Code
-> erhält optional WhatsApp-Statusupdates mit sicherem QR-Link
-> holt Ware am Stand ab
-> Produzent sieht Nachfrage und Bestandswirkung
```

## Hauptfunktionen

| Bereich | MVP-Funktion |
| --- | --- |
| Standortsuche | Karte und Liste mit Ständen in der Nähe, Entfernung, Öffnungsstatus und Navigation |
| Produktverfügbarkeit | Verfügbare Produkte je Stand auf Basis von Bestand, Reservierungen und Sicherheitsbestand |
| Reservierung | Verbindliche Reservierung mit Menge, Abholzeitfenster und temporärer Bestandsblockierung |
| Zahlung | Digitale Zahlung über Stripe Connect mit Service Fee |
| QR-Code-Abholung | Bestell-QR-Code zur schnellen Abholung und One-Time-Use-Validierung |
| WhatsApp Order Updates | Optionaler P1-Pilotkanal für Bestellbestätigung, Abholerinnerung, Statusänderungen und sicheren Link zur QR-Code-Seite |
| Admin-Dashboard | Stände, Produkte, Bestände, Reservierungen, Nachfrage und einfache Lieferempfehlungen |
| Mitarbeiteransicht | Mobile-first Ansicht für offene Bestellungen, QR-Scan, Bestandsupdates und Out-of-Stock |

## Rollen

| Rolle | Zweck |
| --- | --- |
| Kunde | Stände finden, Produkte reservieren, bezahlen und per QR-Code abholen |
| Spargelbauer/Admin | Betrieb, Stände, Produkte, Preise, Bestände, Reservierungen und Mitarbeiter verwalten |
| Stand-Mitarbeiter | Offene Bestellungen bearbeiten, QR-Codes scannen und Bestände am Stand aktualisieren |
| Plattformadmin | Produzenten, Gebühren, Supportfälle, Zahlungslogs und Plattformbetrieb verwalten |

## Empfohlener Tech-Stack

| Baustein | Empfehlung |
| --- | --- |
| Web-App/PWA | Next.js mit TypeScript für Kunde, Admin und Stand-Mitarbeiter |
| Backend | Next.js API Routes als modularer MVP-Backend-Layer, später optional NestJS |
| Datenbank | PostgreSQL mit Prisma ORM |
| Geo-Suche | PostGIS oder geobasierte Standortsuche über Latitude/Longitude und Radiusfilter |
| Auth | Auth.js, Supabase Auth oder vergleichbare Lösung mit serverseitigem RBAC |
| Payment | Stripe Connect als primärer Provider, PayPal optional später |
| QR-Code | Serverseitige Generierung signierter QRToken ohne sensible Daten |
| Notification | Notification Service für E-Mail und WhatsApp über WhatsApp Business Platform oder Provider wie Twilio, Bird/MessageBird oder 360dialog |
| Hosting | Azure App Service als bevorzugte Option, alternativ Vercel, Render oder Railway |
| Monitoring | Application Insights oder Sentry plus strukturiertes Logging |

## Dokumentation

| Dokument | Inhalt |
| --- | --- |
| [Produktvision](docs/01-product-vision.md) | Problem, Lösung, Zielgruppen, USP und Nicht-Ziele |
| [MVP-Scope](docs/02-mvp-scope.md) | P0/P1/P2, Phase-2-Abgrenzung und Abnahmekriterien |
| [Rollen und Rechte](docs/03-user-roles-and-permissions.md) | Zugriffsmatrix und Sicherheitsregeln |
| [User Stories](docs/04-user-stories.md) | Stories, Prioritäten und Akzeptanzkriterien |
| [Technische Architektur](docs/05-technical-architecture.md) | Zielarchitektur, Mermaid-Diagramm und Kernmodule |
| [Tech-Stack](docs/06-tech-stack.md) | Stack-Entscheidungen, Alternativen und Kriterien |
| [Datenmodell](docs/07-data-model.md) | Entitäten, Beziehungen und ER-Diagramm |
| [API-Design](docs/08-api-design.md) | REST-Endpunkte, Beispiele, Fehlercodes und RBAC |
| [Reservierung, Zahlung, Abholung](docs/09-reservation-payment-pickup-flow.md) | End-to-End-Prozess, Sequenzdiagramm und Edge Cases |
| [Inventory Engine](docs/10-inventory-engine.md) | Bestandslogik, Blockierung, Events und Sicherheitsbestand |
| [QR-Code-Konzept](docs/11-qr-code-concept.md) | QR-Typen, Token-Sicherheit und Scan-Prozess |
| [Payment und Geschäftsmodell](docs/12-payment-and-business-model.md) | Service Fee, Stripe Connect, Refunds und Modellvarianten |
| [Admin-Dashboard](docs/13-admin-dashboard.md) | Seitenstruktur, Tabellen, Kennzahlen und Lieferempfehlungen |
| [Mitarbeiteransicht](docs/14-staff-interface.md) | Mobile-first Bedienung am Stand |
| [Frontend-Plan](docs/15-frontend-plan.md) | Next.js-Routen, Komponenten, State und PWA |
| [Backend-Plan](docs/16-backend-plan.md) | Services, Domainlogik, Transaktionen, Webhooks und Cronjobs |
| [Security und Compliance](docs/17-security-and-compliance.md) | DSGVO, RBAC, QR-Sicherheit, Webhooks und Secrets |
| [Testing-Plan](docs/18-testing-plan.md) | Unit, Integration, E2E, Payment, QR und Concurrency |
| [DevOps und Deployment](docs/19-devops-and-deployment.md) | Lokale Umgebung, CI/CD, Azure App Service, Monitoring und Backup |
| [Roadmap](docs/20-roadmap.md) | 10-14-Wochen-Plan, Meilensteine und Phase-2-Erweiterungen |
| [Backlog](docs/21-backlog.md) | Epics, Tasks, Prioritäten, Komplexität und Sprintplanung |
| [Offene Fragen](docs/22-open-questions.md) | Produkt-, Technik-, Rechtsfragen, Annahmen und Risiken |
| [WhatsApp Notifications](docs/features/whatsapp-notifications.md) | Feature-Spezifikation für WhatsApp Order Updates als optionaler Bestellbegleiter |

## Lokale Entwicklungsübersicht

Empfohlene lokale Struktur für die Umsetzung:

```text
spargelstand-app/
  app/                  Next.js App Router
  components/           UI-Komponenten
  server/               Domain Services und serverseitige Logik
  prisma/               Prisma Schema und Migrationen
  docs/                 Technische und produktbezogene Dokumentation
```

Erwarteter Entwicklungsablauf:

```bash
npm install
cp .env.example .env.local
npm run db:check
npm run prisma:migrate
npm run prisma:seed
npm run smoke:p0
npm run dev
```

Die lokale Entwicklung nutzt bewusst keinen Docker-Pfad. PostgreSQL muss lokal installiert oder als eigener Dienst erreichbar sein. Die Standardwerte aus `.env.example` erwarten Datenbank `spargelstand_app`, User `postgres`, Passwort `postgres` auf `localhost:5432`.

`npm run db:check` prüft nur die Verbindung zur `DATABASE_URL`; der Befehl startet keine Datenbank.

`npm run smoke:p0` prüft den DB-backed Kernfluss lokal: Reservierung, Inventory-Hold, Payment-Success-Simulation, QR-Erzeugung, Staff-Scan und Pickup. Der Smoke-Test gibt keine QR-Klartexte, Payment-Payloads oder vollständigen Telefonnummern aus.

Für echte Stripe Webhooks im MVP sollte zusätzlich die Stripe CLI genutzt werden:

```bash
stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe
```
