# Spargelstand-App Goal

## Leitgoal

Die Spargelstand-App muss den garantierten Reservierungsflow Ende-zu-Ende beweisen:

```text
Stand finden -> Verfuegbarkeit sehen -> verbindlich reservieren
-> digital bezahlen -> QR-Code erhalten -> am Stand abholen
-> Order, Payment, QR und Inventory konsistent fortschreiben
```

Dieses Goal hat Vorrang vor Komfortfunktionen. WhatsApp bleibt P1/Pilot und darf den Kernflow nicht blockieren.

## Current Execution Goal

Der aktuelle Block macht den P0-Flow lokal DB-backed und testbar:

| Ziel | Erfolgskriterium |
| --- | --- |
| Lokale DB-Basis | Prisma Migration und Seed laufen gegen erreichbaren PostgreSQL |
| Reservierung | `POST /api/v1/orders` schreibt Order, OrderItems und InventoryEvents transaktional |
| Inventory Garantie | Reservierungen blockieren Bestand, verhindern Ueberbuchung und respektieren Out-of-Stock |
| Payment | Stripe PaymentIntent und Webhooks schreiben Payment, PaymentEvent und Order-Status |
| QR | Nach erfolgreicher Zahlung existiert ein rekonstruierbarer QR-Link ohne gespeicherten Klartexttoken |
| Staff Pickup | Staff kann QR/Fallback-Code pruefen und Pickup transaktional abschliessen |
| Checks | Typecheck, Lint, Tests, Prisma Validate und Build bleiben gruen |

## Next Goals

| ID | Goal | Status |
| --- | --- | --- |
| G0 | Git/GitHub arbeitsfaehig machen | Blocked: lokaler Ordner ist kein Git-Repo |
| G1 | PostgreSQL lokal starten und Migration/Seed ausfuehren | Blocked: `localhost:5432` nicht erreichbar |
| G2 | Customer Reservierungs-UI an echte Order-API anbinden | Done: Product page posts to `/api/v1/orders` and redirects to Checkout |
| G3 | Staff UI an echte Order-/Pickup-APIs anbinden | Partial: Orders, Scan and Pickup use API/DB paths; camera scanner remains open |
| G4 | Stripe CLI Webhook-E2E gegen lokale DB pruefen | Blocked by G1 |
| G5 | Admin Inventory/Order Views und Inventory-Mutationspfade DB-backed machen | Partial: Inventory/Order Views und Inventory PATCH laufen ueber Prisma; Product/Stand CRUD offen |
| G6 | Supabase Auth vorbereiten | Nach lokal stabilem P0 |
| G7 | Future Deployment mit Vercel, Supabase und Stripe umsetzen | Future Step |

## Future Deployment Goal

Nach stabilem lokalen P0 wird die Cloud-Zielarchitektur umgesetzt:

- Vercel hostet Next.js App Router, API Route Handlers und Preview Deployments.
- Supabase liefert Auth und optional Supabase Postgres.
- Prisma bleibt Datenzugriff und Migrationsebene.
- Stripe Connect bleibt Payment-Zielarchitektur.
- Stripe Livebetrieb startet erst nach Staging-Abnahme.
- WhatsApp bleibt optionaler Benachrichtigungskanal und kein Bestellkanal.

Details stehen in `docs/architecture/future-vercel-supabase-stripe.md`.
