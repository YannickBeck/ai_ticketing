# Documentation

## Einstieg

| Dokument | Zweck |
| --- | --- |
| `README.md` | Produkt- und Entwicklungsüberblick |
| `Projektplan.md` | Vollständiger Projektplan und Scope |
| `PLANS.md` | Konsolidierte Source-of-Truth für diese Umsetzung |
| `GOALS.md` | Aktuelles Leitgoal und nächste Umsetzungsziele |
| `IMPLEMENTATION.md` | Technisches Setup und Projektstruktur |
| `BACKLOG.md` | Umsetzungsbacklog nach P0/P1/P2 |
| `AGENTS.md` | Kurze Agentenregeln für weitere Arbeit |

## Fachliche Pläne

Die bestehenden Dateien `docs/01-product-vision.md` bis `docs/22-open-questions.md` bleiben die ausführlichen Fachpläne.

## Neue technische Dokumentation

| Dokument | Inhalt |
| --- | --- |
| `docs/architecture/overview.md` | MVP-Zielarchitektur |
| `docs/architecture/adr-001-modular-nextjs-monolith.md` | ADR für modularen Next.js-Monolith |
| `docs/architecture/adr-002-whatsapp-as-p1-notification-channel.md` | ADR für WhatsApp als optionalen Kanal |
| `docs/architecture/future-vercel-supabase-stripe.md` | Zukunftsschritt für Vercel, Supabase und Stripe |
| `docs/api/customer-api.md` | Customer API |
| `docs/api/admin-api.md` | Admin API |
| `docs/api/staff-api.md` | Staff API |
| `docs/api/payment-and-webhooks.md` | Payment- und Webhook-APIs |
| `docs/api/whatsapp-api.md` | WhatsApp- und Notification-APIs |
| `docs/data-model/entities.md` | MVP-Entitäten |
| `docs/data-model/prisma-mapping.md` | Prisma-Mapping und Constraints |

## Dokumentationsregel

Wenn Scope, Statusmodelle, API-Endpunkte oder Datenmodellfelder geändert werden, müssen `PLANS.md`, `BACKLOG.md` und die passende Datei unter `docs/api`, `docs/data-model` oder `docs/architecture` mitgezogen werden.
