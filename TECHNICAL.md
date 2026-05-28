# SpargelApp – Technische Dokumentation

> **Version:** 0.1.0  
> **Stand:** Mai 2026  
> **Live-URL:** https://spargel-app.vercel.app

---

## Inhaltsverzeichnis

1. [Projektübersicht](#1-projektübersicht)
2. [Tech-Stack](#2-tech-stack)
3. [Architektur](#3-architektur)
4. [Rollen & Berechtigungen](#4-rollen--berechtigungen)
5. [Datenbankschema](#5-datenbankschema)
6. [Authentifizierung](#6-authentifizierung)
7. [Bestellfluss (Happy Path)](#7-bestellfluss-happy-path)
8. [QR-Code-System](#8-qr-code-system)
9. [Payment-Integration (Stripe)](#9-payment-integration-stripe)
10. [Benachrichtigungen](#10-benachrichtigungen)
11. [API-Referenz](#11-api-referenz)
12. [Server-Services](#12-server-services)
13. [Hintergrund-Jobs (Cron)](#13-hintergrund-jobs-cron)
14. [Projektstruktur](#14-projektstruktur)
15. [Umgebungsvariablen](#15-umgebungsvariablen)
16. [Lokale Entwicklung](#16-lokale-entwicklung)
17. [Deployment](#17-deployment)
18. [Sicherheit](#18-sicherheit)
19. [Bekannte Einschränkungen](#19-bekannte-einschränkungen)

---

## 1. Projektübersicht

**SpargelApp** ist eine Web-Plattform für Spargelstand-Reservierungen. Kunden können frischen Spargel vorab online reservieren, per Stripe bezahlen und mit einem einmalig verwendbaren QR-Code an ihrem Wunschstand abholen. Wartezeiten entfallen; Händler erhalten planbare Bestellmengen.

### Zielgruppen

| Nutzergruppe | Beschreibung |
|---|---|
| **Kunden** | Endverbraucher, die Spargel reservieren und abholen |
| **Händler (Producer Admin)** | Spargelstand-Betreiber mit Admin-Dashboard (Inventar, Bestellungen, Lieferplanung) |
| **Mitarbeiter (Staff)** | Standbetreiber-Personal — scannt QR-Codes bei der Abholung |
| **Platform Admin** | Vollzugriff auf alle Stände, Nutzer und Systemkonfiguration |

---

## 2. Tech-Stack

### Frontend

| Technologie | Version | Verwendung |
|---|---|---|
| **Next.js** | 16.2.6 | App Router, Server Components, API Routes |
| **React** | 19.2.6 | UI-Bibliothek |
| **TypeScript** | 6.0.3 | Statische Typisierung |
| **Geist** | 1.7.1 | Schriftart (via `next/font`) |
| **Lucide React** | 1.16.0 | Icon-Set |
| **next-themes** | 0.4.6 | Dark/Light-Mode |
| **Tailwind CSS** | 4.3.0 | Utility-CSS (minimal eingesetzt) |
| **clsx + tailwind-merge** | – | Bedingte CSS-Klassen |
| **Custom CSS** | – | Hauptstyling in `globals.css` |

### Backend

| Technologie | Version | Verwendung |
|---|---|---|
| **Next.js API Routes** | 16.2.6 | REST-Endpunkte (Route Handlers) |
| **Prisma ORM** | 7.8.0 | Datenbankzugriff mit `@prisma/adapter-pg` |
| **Zod** | 4.4.3 | Schema-Validierung für Eingaben |
| **pg** | 8.21.0 | PostgreSQL-Treiber |

### Infrastruktur & Services

| Service | Verwendung |
|---|---|
| **Supabase** | PostgreSQL-Datenbank + Auth (JWT, Cookies) |
| **Vercel** | Hosting, CI/CD, Cron Jobs |
| **Stripe** | Payment-Verarbeitung (PaymentIntents, Webhooks) |
| **Resend** | Transaktionale E-Mails |

### Libraries & Tools

| Bibliothek | Verwendung |
|---|---|
| **qrcode** | Server-seitige QR-Code-Generierung (PNG/SVG) |
| **jsqr** | Client-seitiger QR-Scanner (Kamera, für Staff) |
| **@supabase/ssr** | Supabase-Session-Handling in Server Components |
| **@stripe/react-stripe-js** | Stripe PaymentElement (React-Komponente) |
| **vitest** | Unit-Tests |
| **tsx** | Skript-Runner (Seed, Smoke-Tests) |

---

## 3. Architektur

### Überblick

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser                                 │
│    Customer Pages  │  Admin Pages  │  Staff Pages               │
└──────────┬──────────────────────────────────────────────────────┘
           │  HTTPS
┌──────────▼──────────────────────────────────────────────────────┐
│                    Vercel (Next.js App)                          │
│                                                                  │
│  ┌────────────────────┐   ┌──────────────────────────────────┐  │
│  │  Server Components │   │       API Routes /api/v1/*       │  │
│  │  (SSR, RSC)        │   │  ┌──────────────────────────┐    │  │
│  └────────────────────┘   │  │  Auth-Guard (requireUser) │    │  │
│                           │  └──────────┬───────────────┘    │  │
│  ┌────────────────────┐   │             │                     │  │
│  │  Client Components │   │  ┌──────────▼───────────────┐    │  │
│  │  ("use client")    │   │  │  Services / Handlers      │    │  │
│  └────────────────────┘   │  └──────────┬───────────────┘    │  │
│                           │             │                     │  │
│  ┌────────────────────┐   │  ┌──────────▼───────────────┐    │  │
│  │  Middleware         │   │  │  Prisma ORM              │    │  │
│  │  (Session-Refresh, │   │  └──────────┬───────────────┘    │  │
│  │  Route-Protection) │   └─────────────┼───────────────────┘  │
│  └────────────────────┘                 │                        │
└─────────────────────────────────────────┼───────────────────────┘
                                          │
           ┌──────────────────────────────┼────────────────────┐
           │                              │                     │
┌──────────▼──────────┐  ┌───────────────▼────┐  ┌────────────▼────┐
│  Supabase           │  │  Stripe            │  │  Resend         │
│  ─────────────────  │  │  ────────────────  │  │  ─────────────  │
│  PostgreSQL         │  │  PaymentIntents    │  │  E-Mail-Versand │
│  Auth (JWT/Cookie)  │  │  Webhooks          │  │                 │
│  Row-Level Security │  │                    │  │                 │
└─────────────────────┘  └────────────────────┘  └─────────────────┘
```

### Request-Lifecycle

1. **Browser** → Vercel Edge (Middleware prüft Session, schützt Routen)
2. **Server Component** rendert mit echten Daten (kein Client-Fetch nötig)
3. **Client Component** kann direkt `/api/v1/*` aufrufen
4. **API Route Handler** → `requireUser()` → Service-Klasse → Prisma → Supabase PostgreSQL
5. **Stripe Webhook** trifft `/api/v1/webhooks/stripe` ein → Event-Verarbeitung mit Idempotenz-Guard

### Layout-System

| Bereich | Layout-Komponente | Navigationsart |
|---|---|---|
| Auth-Seiten (`/login`, `/signup`) | Kein Chrome | – |
| Kundenseiten (`/`, `/stands/*`, `/orders/*`) | `CustomerHeader` (Top-Nav) | Sticky Header |
| Admin/Staff (`/admin/*`, `/staff/*`) | `AppSidebar` (Dark Sidebar) | Sidebar, 220 px |

---

## 4. Rollen & Berechtigungen

### Rollen-Definition

```
UserRole (Prisma Enum)
├── CUSTOMER        → "customer"
├── PRODUCER_ADMIN  → "producer_admin"
├── STAFF           → "staff"
└── PLATFORM_ADMIN  → "platform_admin"
```

### Zugangsmatrix

| Route/Feature | CUSTOMER | PRODUCER_ADMIN | STAFF | PLATFORM_ADMIN |
|---|:---:|:---:|:---:|:---:|
| `/` `/stands/*` `/orders/*` | ✅ | ✅ | ✅ | ✅ |
| `/checkout/*` | ✅ | ✅ | ✅ | ✅ |
| `/account/*` | ✅ | ✅ | ✅ | ✅ |
| `/admin/*` | ❌ | ✅ (eigener Producer) | ❌ | ✅ (alle) |
| `/staff/*` | ❌ | ❌ | ✅ (eigene Stände) | ✅ |
| Alle Stände sehen | ❌ | ❌ | ❌ | ✅ |

### Middleware-Schutz (`src/middleware.ts`)

- **Unauthentifiziert** + `/admin/*` oder `/staff/*` → Redirect zu `/login?redirect=<path>`
- **Authentifiziert** + `/login` oder `/signup` → Redirect zu `/`
- Session-Cookie wird bei jedem Request automatisch erneuert

### Händler-Registrierung

Neue Händler registrieren sich unter `/signup/vendor`. Die API (`POST /api/v1/vendor/register`) erstellt:
1. Supabase Auth-User (auto-confirmed via Service Role Key)
2. `Producer`-Record
3. `Stand`-Record (Status: `CLOSED` — muss von Platform Admin aktiviert werden)
4. `User`-Record mit Rolle `PRODUCER_ADMIN`

---

## 5. Datenbankschema

### Entity-Relationship (vereinfacht)

```
Producer ──────┬── Stand ──────┬── Inventory ── Product
               │               │
               └── Product     └── PickupSlot
               │               │
               └── User        └── Order ────── OrderItem
               │                        │
               └── Order                └── Payment
                                        │
                                        └── Notification
```

### Kernmodelle

#### User
```
id            UUID (PK, = Supabase auth.users.id)
name          String
email         String (unique)
phoneNumber   String?
role          UserRole (CUSTOMER | PRODUCER_ADMIN | STAFF | PLATFORM_ADMIN)
producerId    UUID? → Producer
active        Boolean
```

#### Producer
```
id               UUID (PK)
name             String         // Firmenname
legalName        String?
billingEmail     String?
paymentAccountId String?        // Stripe Connect Account ID (future)
status           ProducerStatus (ACTIVE | PAUSED | DISABLED)
serviceFeeConfig JSON           // { flatFeeCents: 99 }
```

#### Stand
```
id           UUID (PK)
producerId   UUID → Producer
name         String
addressLine  String
postalCode   String
city         String
latitude     Decimal(10,7)
longitude    Decimal(10,7)
openingHours JSON             // { Mo: "08:00-18:00", ... }
status       StandStatus (OPEN | CLOSED | SEASONAL_PAUSE)
publicNote   String?
```

#### Order
```
id                UUID (PK)
orderNumber       String (unique, human-readable: "ORD-XXXX")
customerId        UUID → User
producerId        UUID → Producer
standId           UUID → Stand
pickupSlotStart   DateTime
pickupSlotEnd     DateTime
status            OrderStatus
productTotalCents Int
serviceFeeCents   Int
totalAmountCents  Int          // = productTotal + serviceFee
expiresAt         DateTime?
```

#### OrderStatus-Lifecycle
```
DRAFT → PENDING_PAYMENT → CONFIRMED → READY_FOR_PICKUP → PICKED_UP
                       ↘ CANCELLED / EXPIRED / REFUNDED
```

#### QRToken
```
id          UUID (PK)
type        QRTokenType (ORDER | STAND | STAND_PRODUCT | STAFF)
referenceId String      // orderId o.ä.
tokenHash   String (unique)  // HMAC-SHA256
status      QRTokenStatus (ACTIVE | USED | EXPIRED | REVOKED)
expiresAt   DateTime?
usedAt      DateTime?
```

### Row-Level Security (RLS)

Supabase RLS ist aktiviert auf:

| Tabelle | Policy |
|---|---|
| `Order` | Kunde sieht nur eigene Orders (`auth.uid() = customerId`) |
| `Notification` | User sieht nur eigene Benachrichtigungen |

Prisma verwendet den Service-Role-Key und bypassed RLS automatisch.

### Datenbank-Trigger

```sql
-- Erstellt automatisch einen User-Record bei Supabase Auth-Registrierung
TRIGGER on_auth_user_created
  ON auth.users AFTER INSERT
  EXECUTE FUNCTION handle_new_auth_user()
  -- Legt User mit role='customer' an (ON CONFLICT DO NOTHING)
```

---

## 6. Authentifizierung

### Stack

- **Supabase Auth** mit `@supabase/ssr` für Server-seitiges Session-Handling
- **JWT-basierte Sessions** gespeichert in `httpOnly`-Cookies
- **PKCE-Flow** für E-Mail-Bestätigungslinks

### Clients

| Client | Datei | Verwendung |
|---|---|---|
| Server Client | `src/lib/supabase/server.ts` | Server Components, Route Handlers |
| Browser Client | `src/lib/supabase/client.ts` | Client Components (Logout, Signup) |
| Admin Client | `src/lib/supabase/admin.ts` | Service-Role-Operationen (Händler-Registrierung) |

### Session-Zugriff (Server)

```typescript
// In Server Components / Route Handlers
const user = await getCurrentUser(); // null wenn nicht eingeloggt
const user = await requireUser();    // wirft ApiError 401 wenn nicht eingeloggt
```

### Logout

Der Logout erfolgt client-seitig via Supabase Browser-Client:
```typescript
await createSupabaseBrowserClient().auth.signOut();
router.push("/");
router.refresh();
```

### Passwort-Reset

Route: `/forgot-password` → Supabase sendet Reset-E-Mail → `/auth/reset-password`

---

## 7. Bestellfluss (Happy Path)

```
Kunde                    Server                        Stripe
  │                        │                              │
  │  GET /stands           │                              │
  │◄───────────────────────│                              │
  │                        │                              │
  │  Produkt + Slot wählen │                              │
  │                        │                              │
  │  POST /api/v1/orders   │                              │
  │───────────────────────►│                              │
  │                        │ Inventory-Hold (reserved++)  │
  │                        │ Order: PENDING_PAYMENT       │
  │◄───────────────────────│ { orderId }                  │
  │                        │                              │
  │  GET /checkout/[id]    │                              │
  │───────────────────────►│                              │
  │                        │ GET payment-intent           │
  │                        │──────────────────────────────►
  │                        │◄─────────────────────────────
  │◄───────────────────────│ clientSecret                 │
  │                        │                              │
  │  Kartendaten eingeben  │                              │
  │  [Stripe PaymentElement]                              │
  │───────────────────────────────────────────────────────►
  │                        │                              │ payment_intent.succeeded
  │                        │◄──────────────────────────────
  │                        │ POST /api/v1/webhooks/stripe │
  │                        │ Order: CONFIRMED             │
  │                        │ Inventory commitiert         │
  │                        │                              │
  │  GET /orders/[id]      │                              │
  │◄───────────────────────│ Order-Details + QR-Button    │
  │                        │                              │
  │  GET /orders/[id]/qr   │                              │
  │◄───────────────────────│ QR-Code (HMAC-signiert)      │
  │                        │                              │
  │  [Staff scannt QR]     │                              │
  │  POST /api/v1/staff/scan                              │
  │───────────────────────►│                              │
  │                        │ Token prüfen + USED markieren│
  │                        │ Order: PICKED_UP             │
  │◄───────────────────────│ { success: true }            │
```

### Reservierungsablauf im Detail

1. `POST /api/v1/orders` → `ReservationService.createOrder()`
   - Inventory-Hold: `reservedQuantity += menge`
   - Order-Status: `PENDING_PAYMENT`
   - `expiresAt` = jetzt + 30 Minuten (ablaufende Reservierungen per Cron bereinigt)

2. `GET /api/v1/orders/[id]/payment-intent` → Stripe PaymentIntent erstellen/abrufen

3. Stripe Webhook `payment_intent.succeeded` → `PaymentService.handleStripeWebhook()`
   - Idempotenz-Check via `providerEventId`
   - Order-Status: `CONFIRMED`
   - QR-Token generieren (HMAC-SHA256)
   - Bestätigungsmail via Resend

---

## 8. QR-Code-System

### Funktionsweise

```
1. Nach Zahlung: QRCodeService.generateOrderToken(orderId)
   └─ Zufälliges Nonce generieren
   └─ Hash = HMAC-SHA256(nonce + orderId, QR_TOKEN_SECRET + QR_TOKEN_PEPPER)
   └─ Hash in DB speichern (QRToken.tokenHash)
   └─ QR-Code-URL = {APP_URL}/pickup/scan?token={nonce}:{orderId}

2. Kunde zeigt QR-Code (PNG via `qrcode`-Bibliothek)

3. Staff scannt → POST /api/v1/staff/scan { token, standId }
   └─ Token parsen: nonce + orderId extrahieren
   └─ Hash neu berechnen
   └─ Mit gespeichertem Hash vergleichen (constant-time)
   └─ Status prüfen: ACTIVE?
   └─ Token markieren: USED, usedAt = NOW()
   └─ Order-Status: PICKED_UP
```

### Sicherheitsmerkmale

- **One-Time-Use:** Jeder Token kann nur einmalig eingelöst werden
- **HMAC-SHA256:** Tokens können nicht gefälscht werden
- **Pepper:** Zweites Secret verhindert Angriffe bei DB-Leak
- **Ablaufzeit:** Tokens können optional ein `expiresAt` haben (Cron räumt ab)
- **Revoke:** Tokens können einzeln widerrufen werden (`status = REVOKED`)

### Umgebungsvariablen

```env
QR_TOKEN_SECRET=<32-Byte-Hex>   # HMAC-Schlüssel
QR_TOKEN_PEPPER=<32-Byte-Hex>   # Zusätzliches Secret
```

---

## 9. Payment-Integration (Stripe)

### Flow

- **PaymentIntents API** (kein Stripe Checkout)
- **Stripe PaymentElement** im Browser (React-Komponente)
- **Webhook** für async Bestätigung

### Stripe-Konfiguration

```env
STRIPE_SECRET_KEY=sk_live_...         # oder sk_test_... für Entwicklung
STRIPE_WEBHOOK_SECRET=whsec_...       # Webhook-Signatur-Verifikation
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Service Fee

Konfiguriert per Producer in `Producer.serviceFeeConfig`:
```json
{ "flatFeeCents": 99 }
```

Für jede Bestellung: `totalAmountCents = productTotalCents + serviceFeeCents`

### Webhook-Idempotenz

Jedes Stripe-Event wird mit seiner `providerEventId` in der `PaymentEvent`-Tabelle gespeichert. Bei Duplikaten wird der Handler übersprungen (`handled = true`).

### Test-Karte (Entwicklung)

```
Nummer:  4242 4242 4242 4242
Ablauf:  12/28  CVC: 424
```

---

## 10. Benachrichtigungen

### Kanäle

| Kanal | Status |
|---|---|
| E-Mail (Resend) | ✅ Produktiv |
| WhatsApp (Meta Business API) | 🚧 Stub vorhanden — Business-Setup nötig |
| Push | 📋 Geplant |

### E-Mail-Setup (Resend)

```env
EMAIL_PROVIDER=resend           # "mock" für lokale Entwicklung
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@domain.de
```

### Benachrichtigungstypen

| Typ | Auslöser | Kanal |
|---|---|---|
| `ORDER_CONFIRMED` | Zahlung erfolgreich | E-Mail |
| `PAYMENT_CONFIRMED` | Webhook | E-Mail |
| `PICKUP_REMINDER` | Cron 07:00 | E-Mail / WhatsApp |
| `ORDER_READY` | Manuell durch Staff | E-Mail |
| `PICKED_UP` | QR-Scan | E-Mail |
| `ORDER_CANCELLED` | Stornierung | E-Mail |

### WhatsApp (Vorbereitung)

Das Interface `WhatsAppProvider` ist vollständig implementiert. Aktivierung:
1. Meta Business Manager: Verifizierte Nummer + Templates einreichen (7–10 Tage)
2. `WHATSAPP_ACCESS_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` setzen
3. `WHATSAPP_PROVIDER=real` → echte Sends aktiv

---

## 11. API-Referenz

Alle Endpunkte unter `/api/v1/`. Auth-Endpunkte erfordern gültige Supabase-Session.

### Kundenseitige Endpunkte

| Methode | Pfad | Beschreibung | Auth |
|---|---|---|---|
| `GET` | `/api/v1/stands` | Alle offenen Stände | – |
| `GET` | `/api/v1/stands/[standId]` | Stand-Details | – |
| `GET` | `/api/v1/stands/[standId]/products` | Produkte + Verfügbarkeit | – |
| `POST` | `/api/v1/orders` | Bestellung anlegen | ✅ |
| `GET` | `/api/v1/orders/[orderId]` | Bestelldetails | ✅ |
| `GET` | `/api/v1/orders/[orderId]/payment-intent` | Stripe ClientSecret | ✅ |
| `GET` | `/api/v1/orders/[orderId]/qr` | QR-Token-Link | ✅ |
| `POST` | `/api/v1/orders/[orderId]/cancel` | Bestellung stornieren | ✅ |
| `GET` | `/api/v1/me/notification-preferences` | Benachrichtigungseinstellungen | ✅ |
| `POST` | `/api/v1/me/notification-preferences` | Einstellungen speichern | ✅ |
| `POST` | `/api/v1/me/phone/verify/start` | Telefon-Verifikation starten | ✅ |
| `POST` | `/api/v1/me/phone/verify/confirm` | Verifikations-Code bestätigen | ✅ |

### Admin-Endpunkte (PRODUCER_ADMIN / PLATFORM_ADMIN)

| Methode | Pfad | Beschreibung |
|---|---|---|
| `GET` | `/api/v1/admin/dashboard` | KPI-Übersicht |
| `GET/POST` | `/api/v1/admin/stands` | Stände auflisten / anlegen |
| `GET/PATCH` | `/api/v1/admin/stands/[standId]` | Stand-Details / bearbeiten |
| `GET/POST` | `/api/v1/admin/products` | Produkte auflisten / anlegen |
| `GET/PATCH/DELETE` | `/api/v1/admin/products/[productId]` | Produkt-CRUD |
| `PATCH` | `/api/v1/admin/inventory/[standId]/[productId]` | Inventar aktualisieren |
| `GET` | `/api/v1/admin/orders` | Bestellübersicht |
| `GET` | `/api/v1/admin/notifications` | Benachrichtigungslog |
| `GET` | `/api/v1/admin/notifications/failed` | Fehlgeschlagene Notifications |
| `POST` | `/api/v1/admin/orders/[orderId]/notify` | Manuelle Notification |
| `GET` | `/api/v1/admin/analytics/demand` | Nachfrage-Analyse |
| `GET` | `/api/v1/admin/delivery-suggestions` | KI-Lieferempfehlungen |
| `GET/POST` | `/api/v1/admin/staff` | Staff-Verwaltung |

### Staff-Endpunkte

| Methode | Pfad | Beschreibung |
|---|---|---|
| `POST` | `/api/v1/staff/scan` | QR-Token einlösen |
| `GET` | `/api/v1/staff/orders` | Bestellliste für Stand |
| `POST` | `/api/v1/staff/orders/[orderId]/pickup` | Abholung bestätigen |
| `GET` | `/api/v1/staff/inventory` | Inventar anzeigen |
| `POST` | `/api/v1/staff/products/[productId]/out-of-stock` | Produkt ausverkauft melden |
| `GET` | `/api/v1/staff/deliveries` | Lieferplanung |

### Auth & System

| Methode | Pfad | Beschreibung |
|---|---|---|
| `POST` | `/api/v1/auth/logout` | Session beenden |
| `GET` | `/api/v1/auth/me` | Aktueller Nutzer (id, role, email) |
| `POST` | `/api/v1/vendor/register` | Händler-Registrierung |
| `POST` | `/api/v1/webhooks/stripe` | Stripe-Webhook |
| `POST` | `/api/v1/webhooks/whatsapp` | WhatsApp-Webhook |
| `GET` | `/api/v1/cron/expire-reservations` | Abgelaufene Reservierungen bereinigen |
| `GET` | `/api/v1/cron/expire-qr-tokens` | Abgelaufene QR-Tokens bereinigen |
| `GET` | `/api/v1/cron/pickup-reminders` | Abholung-Erinnerungen versenden |

---

## 12. Server-Services

Alle Services liegen in `src/server/services/` und kapseln die Geschäftslogik.

| Service | Verantwortung |
|---|---|
| `ReservationService` | Bestellungen anlegen, Details abrufen, QR-Link generieren |
| `InventoryService` | Verfügbarkeit berechnen, Bestände lesen |
| `InventoryMutationService` | Lagerbestand schreiben (Hold, Release, Commit) |
| `PaymentService` | Stripe PaymentIntent erstellen, Webhook verarbeiten |
| `QRCodeService` | HMAC-Token generieren, verifizieren, einlösen |
| `NotificationService` | Benachrichtigungen in DB schreiben und versenden |
| `StandService` | Stände suchen, Admin-CRUD |
| `ProductService` | Produkte verwalten |
| `AdminQueryService` | Dashboard-KPIs, Bestelllisten für Admin |
| `DeliveryPlanningService` | Lieferempfehlungen, Lieferpläne |

### Service-Pattern

```typescript
// Singleton-Instanz (tree-shakeable)
export const reservationService = new ReservationService(prisma, ...);

// Aufruf in Route Handler
const order = await reservationService.getOrder(orderId);
```

---

## 13. Hintergrund-Jobs (Cron)

Vercel Cron Jobs (Hobby Plan: einmal täglich).

| Job | Cron-Ausdruck | Uhrzeit | Funktion |
|---|---|---|---|
| `expire-reservations` | `0 0 * * *` | 00:00 UTC | Orders mit `expiresAt < now` → `EXPIRED`, Inventory-Hold freigeben |
| `expire-qr-tokens` | `0 2 * * *` | 02:00 UTC | QR-Tokens mit `expiresAt < now` → `EXPIRED` |
| `pickup-reminders` | `0 7 * * *` | 07:00 UTC | E-Mail/WhatsApp-Erinnerungen für Abholungen desselben Tages |

### Cron-Absicherung

Alle Cron-Endpunkte prüfen:
```
Authorization: Bearer <CRON_SECRET>
```

Bei fehlendem oder falschem Token → HTTP 401.

### Häufigere Cron-Jobs (Sub-Daily)

Vercel Hobby Plan erlaubt nur tägliche Jobs. Für häufigeres Ausführen:
→ Externer Dienst (z. B. [cron-job.org](https://cron-job.org)) der den Endpunkt aufruft.

---

## 14. Projektstruktur

```
spargelstand-app/
│
├── prisma/
│   ├── schema.prisma          # Datenbankschema (16 Modelle, 20 Enums)
│   ├── prisma.config.ts       # Prisma-Konfiguration
│   └── seed.ts                # Seed-Skript für Entwicklung
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root-Layout (Geist-Font, Providers, AppShell)
│   │   ├── globals.css        # Globales CSS (Custom Properties, Komponenten)
│   │   ├── providers.tsx      # ThemeProvider
│   │   │
│   │   ├── (pages)/
│   │   │   ├── page.tsx       # Startseite (Hero + Stand-Grid)
│   │   │   ├── stands/        # Stand-Listing + Detail + Produkt-Reservierung
│   │   │   ├── orders/        # Bestellhistorie + Detail + QR-Code
│   │   │   ├── checkout/      # Stripe-Zahlung
│   │   │   ├── admin/         # Admin-Dashboard (Orders, Inventory, Staff, ...)
│   │   │   ├── staff/         # Staff-Interface (Scan, Orders, Inventory)
│   │   │   ├── account/       # Nutzereinstellungen (Benachrichtigungen)
│   │   │   ├── signup/        # Kunden-Registrierung
│   │   │   │   └── vendor/    # Händler-Registrierung (2-Step)
│   │   │   ├── login/         # Anmelden
│   │   │   ├── forgot-password/
│   │   │   └── auth/
│   │   │       ├── callback/  # Supabase E-Mail-Bestätigungs-Callback
│   │   │       └── reset-password/
│   │   │
│   │   └── api/v1/            # REST-API
│   │       ├── auth/          # logout, me
│   │       ├── vendor/        # register
│   │       ├── stands/        # Kundenseitige Stand-API
│   │       ├── orders/        # Bestellungen (Customer)
│   │       ├── me/            # Nutzerpräferenzen, Telefon
│   │       ├── admin/         # Admin-API (Auth-geschützt)
│   │       ├── staff/         # Staff-API (Auth-geschützt)
│   │       ├── webhooks/      # Stripe, WhatsApp
│   │       └── cron/          # Hintergrund-Jobs
│   │
│   ├── components/
│   │   ├── shared/            # AppShell, CustomerHeader, AppSidebar, StatusBadge, Money
│   │   ├── customer/          # StandCard, ProductCard, QRCodeDisplay, ReservationForm
│   │   ├── admin/             # OrdersTable, InventoryTable, KPI-Grid, ...
│   │   ├── staff/             # StaffScanForm, CameraScanner
│   │   └── ui/                # shadcn/ui Badge (minimaler Einsatz)
│   │
│   ├── server/
│   │   ├── services/          # Business-Logik (10 Services)
│   │   ├── repositories/      # Datenzugriff auf niedrigem Level (PaymentRepository)
│   │   ├── api/               # HTTP-Utilities (withApiErrors, jsonOk, requireRole)
│   │   ├── auth/              # requireUser, getCurrentUser, permissions
│   │   ├── domain/            # TypeScript-Typen, Zod-Schemas, Enums
│   │   ├── jobs/              # Cron-Job-Logik (expireReservations, etc.)
│   │   └── db/
│   │       └── prisma.ts      # Prisma-Client-Singleton
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts      # Browser-Client (für Client Components)
│   │   │   ├── server.ts      # Server-Client (für Server Components/API)
│   │   │   └── admin.ts       # Admin-Client (Service Role Key)
│   │   └── utils.ts           # cn() helper (clsx + tailwind-merge)
│   │
│   └── middleware.ts          # Session-Refresh + Route-Protection
│
├── scripts/
│   ├── db-check.ts            # Datenbankverbindung prüfen
│   └── p0-smoke.ts            # P0-Smoke-Test (API-Flow)
│
├── vercel.json                # Cron-Jobs, Build-Command
├── package.json
├── tsconfig.json
└── .env.local                 # Lokale Umgebungsvariablen (nicht versioniert)
```

---

## 15. Umgebungsvariablen

### Vollständige Liste

```env
# ── Datenbank ──────────────────────────────────────────────────────
DATABASE_URL=postgresql://...            # Supabase Transaction Pooler
DIRECT_URL=postgresql://...             # Direkte Verbindung (für Prisma Migrate)

# ── Supabase Auth ───────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # Anon-Key (öffentlich)
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # Service-Role-Key (geheim, nur Server)

# ── App ─────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://spargel-app.vercel.app

# ── Stripe ──────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# ── QR-Code Signing ─────────────────────────────────────────────────
QR_TOKEN_SECRET=<32-Byte-Hex>          # HMAC-Schlüssel
QR_TOKEN_PEPPER=<32-Byte-Hex>          # Zusätzlicher Pepper

# ── Cron ────────────────────────────────────────────────────────────
CRON_SECRET=<zufälliger-String>        # Bearer-Token für Cron-Endpunkte

# ── E-Mail ──────────────────────────────────────────────────────────
EMAIL_PROVIDER=resend                  # "mock" für lokale Entwicklung
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.de

# ── WhatsApp (optional, Stub) ───────────────────────────────────────
WHATSAPP_PROVIDER=mock                 # "real" wenn Meta-Setup abgeschlossen
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
```

### Sicherheitshinweise

- `.env.local` und `.env` sind in `.gitignore` und werden **nie** committed
- `SUPABASE_SERVICE_ROLE_KEY` darf **nie** dem Browser exponiert werden (kein `NEXT_PUBLIC_`-Prefix)
- `QR_TOKEN_SECRET` und `QR_TOKEN_PEPPER` regelmäßig rotieren; danach aktive QR-Tokens ungültig → alle `QRToken`-Einträge auf `REVOKED` setzen

---

## 16. Lokale Entwicklung

### Voraussetzungen

- Node.js ≥ 20
- npm ≥ 10
- Supabase-Projekt (für Datenbank + Auth)
- Stripe-Account (Test-Mode)

### Setup

```bash
# 1. Repository klonen
git clone <repo-url>
cd spargelstand-app

# 2. Abhängigkeiten installieren
npm install

# 3. Umgebungsvariablen setzen
cp .env.example .env.local
# .env.local ausfüllen (Supabase, Stripe, QR-Secrets, etc.)

# 4. Prisma-Client generieren
npx prisma generate

# 5. Datenbank-Schema anwenden
npx prisma migrate deploy

# 6. (Optional) Seed-Daten einspielen
npm run prisma:seed

# 7. Entwicklungsserver starten
npm run dev
```

App läuft auf `http://localhost:3000`.

### Stripe Webhook lokal

```bash
# Stripe CLI installieren, dann:
stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe
```

### Nützliche Befehle

```bash
npm run typecheck          # TypeScript-Fehler prüfen
npm run lint               # ESLint
npm run test               # Vitest Unit-Tests
npm run smoke:p0           # P0-Smoke-Test gegen lokale DB
npm run db:check           # Datenbankverbindung prüfen
npx prisma studio          # Prisma Studio (Daten-Browser)
```

---

## 17. Deployment

### Infrastruktur

```
GitHub (main branch)
    └── Push → Vercel CI/CD
         ├── Build: npx prisma generate && next build
         └── Deploy → https://spargel-app.vercel.app
```

### Manuelles Deployment (Vercel CLI)

```bash
npx vercel deploy --prod
```

### Build-Konfiguration (`vercel.json`)

```json
{
  "framework": "nextjs",
  "buildCommand": "npx prisma generate && next build",
  "installCommand": "npm install",
  "crons": [
    { "path": "/api/v1/cron/expire-reservations", "schedule": "0 0 * * *" },
    { "path": "/api/v1/cron/expire-qr-tokens",    "schedule": "0 2 * * *" },
    { "path": "/api/v1/cron/pickup-reminders",    "schedule": "0 7 * * *" }
  ]
}
```

### Umgebungsvariablen in Vercel

Alle Variablen aus Abschnitt 15 müssen in den Vercel-Projekteinstellungen unter
**Settings → Environment Variables** hinterlegt sein.

### Supabase-Datenbank-Migration

```bash
# Neue Migration erstellen (lokal)
npx prisma migrate dev --name <beschreibung>

# Migration auf Produktion anwenden
npx prisma migrate deploy
```

---

## 18. Sicherheit

### Authentifizierung & Autorisierung

- Jede API-Route prüft die Session via `requireUser()` (Server-seitig, kein JWT-Spoofing möglich)
- Rollenseparation: `requireRole(user, ["producer_admin"])` vor sensiblen Operationen
- Service-Role-Key wird ausschließlich server-seitig verwendet

### QR-Code-Sicherheit

- HMAC-SHA256 mit zwei unabhängigen Secrets (Secret + Pepper)
- One-Time-Use: Token wird nach Einlösung als `USED` markiert
- Constant-Time-Vergleich verhindert Timing-Attacken

### Stripe Webhook

- Signatur-Verifikation via `stripe.webhooks.constructEvent(body, sig, secret)`
- Idempotenz-Guard verhindert doppelte Verarbeitung

### Row-Level Security

- RLS auf `Order` und `Notification` — Kunden sehen nur eigene Daten
- Prisma (Service Role) bypassed RLS für Server-seitige Operationen

### Input-Validierung

- Alle API-Eingaben werden mit **Zod** validiert, bevor sie die Geschäftslogik erreichen
- Fehler-Responses geben keine internen Details preis

### HTTP-Sicherheits-Header

Next.js setzt standardmäßig:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Bekannte Offene Punkte

- Geocoding für Stände: lat/lng werden bei Händler-Registrierung auf `0.0` gesetzt (Admin muss aktualisieren)
- Rate-Limiting auf API-Routen: noch nicht implementiert
- CSRF-Schutz: Supabase-Cookies sind `httpOnly` + `SameSite=Lax` (ausreichend für Cookie-basierte Flows)

---

## 19. Bekannte Einschränkungen

| Einschränkung | Ursache | Workaround |
|---|---|---|
| Cron-Jobs nur täglich | Vercel Hobby Plan | Externer Cron-Dienst (cron-job.org) |
| WhatsApp-Benachrichtigungen | Meta Business-Setup fehlt | E-Mail als Fallback |
| Kein Geocoding | Kein Geocoding-Service integriert | Admin setzt Koordinaten manuell |
| Keine Sub-Daily Reservierungsablösung | Cron nur täglich | Ablaufzeit bei Checkout verlängern |
| Stripe Connect | Direkte Charges, kein Connect-Modell | Plattform-Fee manuell verwaltet |

---

*Dokumentation generiert für SpargelApp v0.1.0 — Mai 2026*
