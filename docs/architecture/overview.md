# Architecture Overview

## Zielbild

Die Spargelstand-App startet als modularer Next.js-Monolith. Eine Codebase enthält Customer PWA, Admin-Dashboard, Staff-Ansicht und API Route Handlers. Die fachliche Logik liegt in serverseitigen Services und kann später in ein separates Backend extrahiert werden.

```mermaid
flowchart LR
    Customer["Customer PWA"] --> App["Next.js App"]
    Admin["Admin Dashboard"] --> App
    Staff["Staff Mobile UI"] --> App
    App --> API["/api/v1 Route Handlers"]
    API --> Auth["Auth/RBAC"]
    API --> Services["Domain Services"]
    Services --> DB[(PostgreSQL + Prisma)]
    Services --> Stripe["Stripe Connect"]
    Services --> Notify["Notification Service"]
    Notify --> Email["Email Provider"]
    Notify --> WA["WhatsApp Provider"]
    Stripe --> Webhooks["Payment Webhooks"]
    WA --> Webhooks
    Webhooks --> API
```

## Modulgrenzen

| Modul | Verantwortung |
| --- | --- |
| Auth/RBAC | Session, Rolle, Producer-Scope, Staff-Stand-Scope |
| Stand/Product | Standort-, Öffnungs- und Produktdaten |
| Inventory | Verfügbarkeit, Blockierung, Freigabe, Pickup, Events |
| Reservation | Order-Erstellung, Statusmodell, Storno, Ablauf |
| Payment | Stripe Checkout/Payment Intent, Webhooks, Refund-Skeleton |
| QR | Signierte Tokens, Hash, QR-Link, Scan-Validierung |
| Notification | E-Mail/WhatsApp-Versandaufträge, Status und Fehler |
| Delivery | Regelbasierte Lieferempfehlungen |

## Transaktionsgrenzen

Transaktionen sind Pflicht für Reservierung, Payment Success, Payment Failure/Expiry, Pickup und Storno. Externe Provider-Aufrufe werden durch persistente lokale Absichten oder Event-Logs flankiert; Notifications dürfen den Kernflow nicht blockieren.
