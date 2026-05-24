# Backlog

## P0 MVP Foundation

| ID | Task | Status |
| --- | --- | --- |
| P0-01 | Next.js/TypeScript/npm-Projektstruktur anlegen | Done |
| P0-02 | Prisma/PostgreSQL-Schema für Kernentitäten anlegen | Done |
| P0-03 | Auth/RBAC-Helper für Rollen und Ressourcenbesitz vorbereiten | Done |
| P0-04 | Customer-, Admin- und Staff-Routenstruktur anlegen | Done |
| P0-05 | API-Skeleton unter `/api/v1` anlegen | Done |
| P0-06 | InventoryService mit Verfügbarkeits- und Statuslogik starten | Done |
| P0-07 | ReservationService für Order-Skeleton und Statusregeln starten | Done |
| P0-08 | PaymentService mit Stripe SDK, PaymentIntent-Parametern und Webhook-Signaturpruefung starten | Done |
| P0-09 | QRCodeService mit Signatur-/Hash-Konzept starten | Done |
| P0-10 | Staff-Pickup- und QR-Scan-Skeleton anlegen | Done |
| P0-11 | Admin-Basisbereiche für Stände, Produkte, Bestand und Orders anlegen | Done |

## P1 Pilot Features

| ID | Task | Status |
| --- | --- | --- |
| P1-01 | NotificationService als eigener Domain-Service vorbereiten | Done |
| P1-02 | WhatsAppProvider-Adapter mit ENV-Konfiguration anlegen | Done |
| P1-03 | NotificationPreference und WhatsApp Opt-in im Datenmodell abbilden | Done |
| P1-04 | WhatsApp Delivery-Status-Webhook als Skeleton anlegen | Done |
| P1-05 | Pickup-Reminder-Job als Skeleton anlegen | Done |
| P1-06 | WhatsApp-Templates und Opt-in-Texte finalisieren | Open |
| P1-07 | Providerentscheidung treffen: Cloud API, Twilio, Bird oder 360dialog | Open |
| P1-08 | E-Mail-Provider und Fallback-Regeln konkretisieren | Open |

## P0 Next Implementation Tasks

| ID | Task | Notes |
| --- | --- | --- |
| N-00 | Zentrales Goal fuer P0/P1/Future Deployment festhalten | Done: `GOALS.md` |
| N-01 | Auth-Provider final auswählen und Sessions anbinden | Auth.js oder Supabase Auth |
| N-02 | Repositories auf echte Prisma-Queries umstellen | Payment/Order/Staff-Pickup gestartet; Admin und weitere Staff-Aktionen folgen |
| N-03 | Order-Erstellung transaktional mit Inventory-Locking implementieren | Done: ReservationService schreibt DB-backed Order, Items und InventoryEvents |
| N-04 | Stripe PaymentIntent im Testmodus integrieren | SDK, Signatur, Idempotenz und Persistenz-Skeleton vorhanden; Stripe CLI/E2E offen |
| N-05 | QR-Code-Rendering für Kundenansicht ergänzen | Done: gespeicherter Hash + Nonce, kein Klartexttoken |
| N-06 | Staff-Scanner mit Browser-QR-Library ergänzen | API/Transaktion vorhanden; Browser-Kamera noch offen |
| N-07 | Admin-Formulare mit serverseitiger Validierung implementieren | Inventory PATCH DB-backed; Stand/Product CRUD offen |
| N-08 | Cron-Infrastruktur für Expiry und Reminder festlegen | Jobs implementiert; Scheduler/Worker-Ausfuehrung offen |
| N-09 | Customer Reservierungsformular an Order-API anbinden | Done: Produktseite erstellt Order und leitet zum Checkout |
| N-10 | Staff Scan/Pickup UI an API anbinden | Partial: Token-Scan und Fallback-Pickup angebunden; Browser-Kamera offen |
| N-11 | Staff Bestand/Lieferung an Inventory-API anbinden | Done: Staff Inventory und Delivery schreiben InventoryEvents |
| N-12 | Admin Inventory/Orders von Mockdaten loesen | Partial: Tabellen lesen Prisma; Product/Stand Listen noch mockbasiert |
| N-13 | Lokales PostgreSQL-Setup und P0-Smoke-Runner stabilisieren | Done: Docker Compose, npm-Scripts und `smoke:p0` angelegt |

## Payment Follow-up

| ID | Task | Notes |
| --- | --- | --- |
| PAY-01 | PaymentIntent-Erstellung gegen echte Prisma-Order persistieren | Done: customer-only, Pending Payment vor Provider-Call |
| PAY-02 | `providerEventId` unique speichern und Webhook idempotent machen | Done: `PaymentEvent.providerEventId` unique |
| PAY-03 | Payment Success Transaktion implementieren | Done: Payment `succeeded`, Order `confirmed`, QRToken und Notification |
| PAY-04 | Payment Failure/Cancel Transaktion implementieren | Done: Bestand freigeben, Order stornieren, Statusguards |
| PAY-05 | Stripe Test CLI in E2E/Integration einbinden | `stripe listen --forward-to ...` |
| PAY-06 | Mehrere Payment Attempts modellieren | Aktuell ein deterministischer Intent je Order |
| PAY-07 | Stripe Connect Onboarding und Account-Status-Sync bauen | Produzenten-Account noch ENV/Seed |
| PAY-08 | Refund-API mit Rollen, Service-Fee-Regeln und Audit-Trail ergänzen | Webhook-Mapping vorhanden, Admin-Flow offen |

## Deployment Future

| ID | Task | Notes |
| --- | --- | --- |
| DEPLOY-01 | Vercel/Supabase/Stripe Zielsetup vorbereiten | Future Step dokumentiert; erst nach lokal stabilem P0-E2E umsetzen |
| DEPLOY-02 | Supabase Auth und Supabase Postgres Staging einrichten | App-Rollen bleiben in Prisma |
| DEPLOY-03 | Vercel Preview/Staging/Production Pipeline einrichten | Production nur nach Staging-Abnahme |
| DEPLOY-04 | Stripe Livebetrieb vorbereiten | Live Keys und echte Connected Accounts erst nach Freigabe |

## Offene Entscheidungen

| Thema | Entscheidung nötig |
| --- | --- |
| Rechtlicher Verkäufer | Produzent oder Plattform |
| Service Fee | Steuerliche Behandlung und Refund-Regel |
| Pilotgröße | Verbindlich 1 Produzent und 3-5 Stände empfohlen |
| Geo | PostGIS sofort oder Lat/Lng-Fallback |
| Karte | Google Maps, Mapbox oder Leaflet/OSM |
| WhatsApp | Provider, Templates, Opt-in-Text und Verifikation |
