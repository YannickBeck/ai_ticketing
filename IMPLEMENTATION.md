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
npm run prisma:generate
npm run dev
```

Falls npm lokal mit `UNABLE_TO_VERIFY_LEAF_SIGNATURE` abbricht:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
npm install
```

Für eine echte Datenbank:

```bash
npm run prisma:migrate
```

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
| Payment | Stripe PaymentIntent-Skeleton, `PaymentEvent`, Webhook-Statusguards, QR/Notification nach Success |
| WhatsApp | P1-Provider-Adapter und Webhook-Skeleton |
| Tests | Erste Tests für Inventory und Notification-Regeln |

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
