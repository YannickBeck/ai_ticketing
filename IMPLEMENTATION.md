# Implementation

## Stack

| Ebene | Entscheidung |
| --- | --- |
| Frontend | Next.js App Router mit TypeScript |
| Backend | Next.js Route Handlers unter `/api/v1` |
| Domain | Services unter `src/server/services` |
| Datenbank | PostgreSQL mit Prisma |
| Validierung | Zod DTOs |
| Tests | Vitest für Domainlogik |
| Payment | Stripe SDK mit PaymentIntent, Connect Fee/Destination, Idempotenz und Webhook-Persistenz |
| WhatsApp | Provider-Adapter-Skeleton, Mock-fähig |

## Aktuelle Paketbasis

| Paket | Version |
| --- | --- |
| Next.js | 16.2.6 |
| React | 19.2.6 |
| Prisma | 7.8.0 |
| TypeScript | 6.0.3 |

Prisma 7 nutzt `prisma.config.ts` fuer CLI-Konfiguration und im Runtime-Pfad den PostgreSQL Driver Adapter `@prisma/adapter-pg`.

## Lokale Installation

```bash
npm install
cp .env.example .env.local
npm run db:check
npm run prisma:migrate
npm run prisma:seed
npm run prisma:generate
npm run smoke:p0
npm run dev
```

Falls npm lokal mit `UNABLE_TO_VERIFY_LEAF_SIGNATURE` abbricht:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
npm install
```

Für eine echte Datenbank:

```bash
npm run db:check
npm run prisma:migrate
npm run prisma:seed
npm run smoke:p0
```

Die lokale Datenbank wird nicht durch das Projekt gestartet. `db:check` prueft die erreichbare PostgreSQL-Instanz aus `DATABASE_URL`; PostgreSQL muss lokal oder als eigener Entwicklungsdienst bereitstehen.

## Checks

```bash
npm run prisma:validate
npm run typecheck
npm run lint
npm run test
npm run build
```

## Projektstruktur

```text
src/app                 Next.js Seiten und API Route Handlers
src/components          Customer-, Admin-, Staff- und Shared-Komponenten
src/server/auth         Auth/RBAC-Helfer
src/server/api          API-Response- und Handler-Helfer
src/server/db           Prisma Client und Mockdaten
src/server/domain       Enums, DTOs und Domain-Typen
src/server/services     MVP-Domainservices
src/server/providers    E-Mail- und WhatsApp-Provider-Adapter
src/server/jobs         Geplante Jobs als Skeletons
src/server/webhooks     Stripe- und WhatsApp-Webhook-Skeletons
prisma/schema.prisma    Datenmodell
docs/architecture       Architekturentscheidungen und Zielbild
docs/api                API-Dokumentation
docs/data-model         Datenmodell-Dokumentation
```

## Implementierungsstatus

| Bereich | Status |
| --- | --- |
| Projektsetup | Angelegt |
| App-Routen | Skeletons für Customer, Admin und Staff |
| API-Routen | Skeletons für Customer, Admin, Staff, Payment und WhatsApp |
| Prisma | MVP-Schema mit Kernentitäten |
| Domain Services | Skeletons mit ersten Kernfunktionen und PaymentRepository |
| Admin Stand/Product | API und Listen DB-backed; UI-Formular-Submit offen |
| Admin Orders/Notifications | Dashboard, Orders API und Notification-Log DB-backed mit Scope-Filter |
| Payment | Stripe PaymentIntent-Skeleton, `PaymentEvent`, Webhook-Statusguards, QR/Notification nach Success |
| WhatsApp | P1-Provider-Adapter und Webhook-Skeleton |
| Tests | Erste Tests für Inventory und Notification-Regeln |

## Lokaler P0-Smoke-Test

`npm run smoke:p0` legt eigene Smoke-Daten an und prueft den Kernfluss gegen die lokale Datenbank:

1. Smoke-Stand, Produkt, Staff- und Customer-User sicherstellen.
2. Customer-Reservierung mit Inventory-Locking erstellen.
3. Pending Payment anlegen und Stripe-Success-Event simulieren.
4. QRToken erzeugen, Staff-Scan pruefen und Pickup abschliessen.
5. Bestand und reservierte Menge nach Pickup validieren.

Der Smoke-Test verweigert nicht-lokale Datenbanken, solange `ALLOW_NON_LOCAL_SMOKE_DB=1` nicht explizit gesetzt ist.

## Payment-Implementierung

Der aktuelle Payment-Pfad nutzt `PaymentService` fuer Stripe SDK und Webhook-Signaturpruefung. `PaymentRepository` kapselt Prisma-Zugriffe: PaymentIntent-Start legt vor dem Provider-Call eine Pending-Zahlung an, Stripe-Calls nutzen einen deterministischen Idempotency-Key, Webhook-Events werden in `PaymentEvent` persistiert und Statusübergänge laufen transaktional.

Seed-Daten fuer lokale Tests liegen in `prisma/seed.ts` und erzeugen eine Demo-Order `order_demo_1` mit Pending Payment.

## Future Deployment Compatibility

Die lokale Umsetzung bleibt kompatibel mit dem späteren Zielsetup aus Vercel, Supabase und Stripe. Der aktuelle Block deployt nicht nach Vercel, erzwingt kein Supabase-Projekt und nutzt keinen Stripe-Livebetrieb. Der Future Step ist in `docs/architecture/future-vercel-supabase-stripe.md` dokumentiert.

## Verifizierte Checks

```bash
npm run prisma:validate
npm run prisma:generate
npm run typecheck
npm run lint
npm run test
npm run build
```

Zusätzlich läuft lokal ein Dev-Server unter `http://127.0.0.1:3000`.
