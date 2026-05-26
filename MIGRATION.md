# SpargelApp – Migrationsplan

## 4.1 Ist-Zustand

### Was ist implementiert

Die Foundation des Projekts ist vollständig und lokal lauffähig:

| Bereich | Status | Details |
|---|---|---|
| Prisma-Schema | ✅ Fertig | 16 Entities, 20 Enums – produktionsreif |
| Services | ✅ Fertig | 10 Services (s.u.) |
| API-Routen | ✅ Fertig | 34 Routen (Customer, Admin, Staff, Webhooks) |
| Smoke-Test | ✅ Fertig | `npm run smoke:p0` validiert P0-Flow E2E |
| Auth | ⚠️ Stubs | `src/server/auth/` enthält nur RBAC-Stubs, kein echtes Login |
| UI-Forms | ⚠️ Offen | Admin-Formulare öffnen sich, senden noch nichts |
| QR-Scanner | ⚠️ Offen | Kamera-Integration für Staff-Scan fehlt |
| Cron-Jobs | ⚠️ Skeleton | Job-Skeletons vorhanden, aber nicht ausgeführt |
| Deployment | ❌ Fehlt | Keine `vercel.json`, kein Supabase-Projekt |

**Services (src/server/services/):**
- `ReservationService` – Order-Lifecycle, atomare Inventory-Locks (serializable isolation)
- `InventoryService` – Bestandsberechnung, `assertReservable()`, Reservation-Hold, Pickup-Finalisierung
- `InventoryMutationService` – DB-Operationen für Inventory (Transaktionen, Row-Level-Locks)
- `PaymentService` – Stripe PaymentIntent, Webhook-Handler, Idempotenz-Guards
- `QRCodeService` – HMAC-SHA256 signierte Tokens, `createOrderPickupToken()`, `verifySignedToken()`
- `NotificationService` – E-Mail + WhatsApp Dispatch-Planung
- `StandService` – Standsuche, Availability-Summary, Admin-CRUD
- `ProductService` – Produkt-CRUD
- `DeliveryPlanningService` – Nachschubempfehlungen
- `AdminQueryService` – Dashboard-Metriken, Order/Notification-Listings

### Mockdaten vs. echte Logik

| Bereich | Mockdaten | Echte Logik |
|---|---|---|
| Inventory-Berechnung | Nein | Ja – vollständige Formel: `stock - reserved - safety_buffer` |
| Reservierung | Nein | Ja – PostgreSQL-Transaktion mit serializable isolation |
| Payment | Nein | Ja – Stripe PaymentIntent + Webhook inkl. Idempotenz |
| QR-Tokens | Nein | Ja – HMAC-SHA256, signiert und verifiziert |
| Auth / Session | **Ja** | Stubs – kein echtes Login, keine Session-Prüfung |
| Notifications (WhatsApp) | Ja (Stub) | Provider-Adapter vorhanden, aber kein Versand |

### Existierende Routen (Übersicht)

```
/api/v1/stands                      Customer: Standsuche
/api/v1/stands/[standId]/products   Customer: Produktliste
/api/v1/orders                      Customer: Reservierung erstellen
/api/v1/orders/[orderId]/payment-intent  Stripe PaymentIntent
/api/v1/orders/[orderId]/qr         QR-Code abrufen
/api/v1/staff/scan                  Staff: QR scannen
/api/v1/staff/orders/[orderId]/pickup  Staff: Pickup bestätigen
/api/v1/admin/dashboard             Admin: Metriken
/api/v1/admin/orders                Admin: Orders (DB-backed)
/api/v1/admin/stands                Admin: Stands CRUD
/api/v1/webhooks/stripe             Stripe Webhook
/api/v1/webhooks/whatsapp           WhatsApp Webhook (P1)
```

---

## 4.2 Ziel-Architektur

```
GitHub (main branch)
    │
    ├── PR → Vercel Preview Deployment
    │           └── Supabase Preview Branch (optional)
    │
    └── Push main → Vercel Production
                        │
                        ▼
              Next.js App (Vercel)
                        │
          ┌─────────────┼─────────────┐
          │             │             │
   Supabase Auth    Prisma ORM    Stripe Connect
   (JWT Sessions)  (PostgreSQL)  (PaymentIntents)
          │             │             │
          └─────────────┼─────────────┘
                        │
              Supabase PostgreSQL
              (RLS Policies aktiv)
```

**Komponenten:**
- **Supabase PostgreSQL** – Produktions-DB; Prisma schreibt via Transaction Pooler (PgBouncer-kompatibel)
- **Supabase Auth** – JWT-basierte Sessions; `auth.uid()` als Basis für RLS
- **Row-Level Security** – Orders und Notifications: nur eigene Rows sichtbar; Inventory-Updates: nur STAFF/ADMIN
- **Prisma** – ORM bleibt; Connection String wechselt auf Supabase; `directUrl` für Migrations
- **Stripe Connect** – Destination Charges: Plattform hält Funds, zahlt Produzenten via Payout aus
- **Vercel** – Hosting; GitHub-Integration für Preview per PR, Production auf `main`

---

## 4.3 Migrationsphasen

### Phase 1 – Fundament (Supabase + Prisma)

**Ziel:** Die App verbindet sich gegen Supabase PostgreSQL statt lokaler DB.

**Schritte:**
1. Supabase-Projekt anlegen (Dashboard: app.supabase.com)
2. Connection Strings aus Supabase Settings kopieren:
   - `DATABASE_URL` → Transaction Pooler URL (`?pgbouncer=true`)
   - `DIRECT_URL` → Direct Connection URL (für `prisma migrate`)
3. `prisma/schema.prisma` anpassen:
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```
4. Schema-Review: `cuid()` → `uuid()` für alle ID-Felder (Supabase RLS erwartet UUIDs)
5. `npx prisma migrate dev --name init-supabase` ausführen (gegen `DIRECT_URL`)
6. `npm run db:check` → Verbindung prüfen
7. `.env.example` um neue Keys erweitern (s. Abschnitt 4.4 / Env-Vars)

**Env-Vars (neu):**
```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

### Phase 2 – Auth (Supabase Auth)

**Entscheidung: Supabase Auth** (statt Auth.js)
- Begründung: RLS-Policies nutzen `auth.uid()` nativ – kein Mapping-Layer nötig
- Paket: `@supabase/ssr` für Server Components und API Routes

**Schritte:**
1. Paket installieren: `npm install @supabase/ssr @supabase/supabase-js`
2. Supabase-Client-Helpers erstellen:
   - `src/lib/supabase/server.ts` – `createServerClient()` für Route Handlers
   - `src/lib/supabase/client.ts` – `createBrowserClient()` für Client Components
3. Middleware implementieren (`src/middleware.ts`):
   - Session-Refresh via Supabase SSR
   - Route-Schutz: `/admin/**` → PRODUCER_ADMIN, `/staff/**` → STAFF
4. Auth-Pages: `/login`, `/signup` (Customer), `/admin/login` (Admin/Staff)
5. `src/server/auth/` Stubs durch echte Supabase-Session-Checks ersetzen:
   ```ts
   // Vorher (Stub):
   export function getCurrentUser() { return mockUser }
   // Nachher:
   export async function getCurrentUser(request: Request) {
     const supabase = createServerClient(...)
     const { data: { user } } = await supabase.auth.getUser()
     return user
   }
   ```
6. User-Rollen: Supabase `user_metadata.role` beim Signup setzen; in Middleware prüfen
7. RLS-Policies in Supabase SQL Editor anlegen:
   ```sql
   -- Orders: nur eigene sichtbar
   CREATE POLICY "orders_select_own" ON orders
     FOR SELECT USING (auth.uid()::text = user_id);
   -- Inventory: Admin + Staff können updaten
   CREATE POLICY "inventory_update_staff" ON inventory
     FOR UPDATE USING (auth.jwt()->'user_metadata'->>'role' IN ('STAFF', 'PRODUCER_ADMIN'));
   ```

---

### Phase 3 – Core P0 Backend verbinden

**Ziel:** Alle API-Route-Handler laufen gegen Supabase-DB, Auth-Guards aktiv.

**Schritte:**
1. Auth-Guards in allen Route-Handlern aktivieren (aktuell auskommentiert/gemockt):
   - `src/app/api/v1/orders/route.ts` – User aus Session lesen
   - `src/app/api/v1/admin/**` – PRODUCER_ADMIN-Check
   - `src/app/api/v1/staff/**` – STAFF-Check
2. `Prisma.$transaction()` prüfen: PgBouncer (Transaction Pooler) erfordert `interactiveTransactions`-Flag
3. `npm run smoke:p0` gegen Supabase-DB ausführen – alle P0-Steps müssen grün sein
4. `npm run typecheck` – keine Fehler

**Hinweis zu Prisma + PgBouncer:**
```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}
```
Interaktive Transaktionen funktionieren mit Transaction Pooler nur wenn `pgbouncer=true` im Connection String gesetzt ist.

---

### Phase 4 – Stripe Integration

**Ziel:** Echte Stripe-Zahlungen lokal testbar; Webhook-Handler verifiziert.

**Schritte:**
1. Stripe-Keys in `.env.local` eintragen (Stripe Dashboard → Test-Modus):
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...  (von Stripe CLI)
   ```
2. Stripe CLI lokal starten:
   ```bash
   stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe
   ```
3. Testeinkauf mit Karte `4242 4242 4242 4242`:
   - Order erstellen → PaymentIntent → Zahlung → Webhook `payment_intent.succeeded`
   - Order-Status muss auf `CONFIRMED` wechseln
4. Stripe Connect (Destination Charges):
   - Connected Account für Producer anlegen (Stripe Dashboard)
   - `STRIPE_CONNECTED_ACCOUNT_ID` in `.env.local` eintragen
   - `PaymentService.createPaymentIntentForOrder()` um `transfer_data` erweitern
5. Service-Fee-Logik: `application_fee_amount` im PaymentIntent setzen

---

### Phase 5 – Vercel Deployment

**Ziel:** App läuft auf Vercel; GitHub-CI/CD aktiv; Production Stripe Webhook konfiguriert.

**Schritte:**
1. `vercel.json` erstellen (minimal):
   ```json
   {
     "framework": "nextjs",
     "buildCommand": "npm run build",
     "devCommand": "npm run dev"
   }
   ```
2. Vercel-Projekt anlegen: `vercel link` oder im Dashboard
3. GitHub → Vercel verknüpfen: automatisch Preview pro PR, Production auf `main`
4. Env-Vars in Vercel setzen (Settings → Environment Variables):
   - `DATABASE_URL`, `DIRECT_URL` (Supabase)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET` (Production: eigener Secret aus Stripe Dashboard)
   - `QR_TOKEN_SECRET`, `QR_TOKEN_PEPPER`
   - `NEXT_PUBLIC_APP_URL` (Vercel Production URL)
5. Stripe Webhook für Production anlegen (Stripe Dashboard):
   - URL: `https://[dein-domain].vercel.app/api/v1/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
6. Production Smoke-Test: manuell Reservierung → Zahlung → QR → Staff-Pickup durchspielen

---

## 4.4 Offene Entscheidungen

| # | Entscheidung | Optionen | Empfehlung | Status |
|---|---|---|---|---|
| 1 | **Auth-Provider** | Supabase Auth vs. Auth.js | Supabase Auth (RLS-native) | ⏳ offen |
| 2 | **Stripe Connect-Modell** | Direct Charges vs. Destination Charges | Destination Charges | ⏳ offen |
| 3 | **RLS-Scope** | Vollständig (alle Tabellen) vs. selektiv | Selektiv: Orders + Notifications | ⏳ offen |
| 4 | **Prisma Connection** | Transaction Pooler vs. Session Pooler | Transaction Pooler (Serverless) | ⏳ offen |
| 5 | **Supabase Branching** | Ja (Preview DBs per PR) vs. Nein (geteilte DB) | Ja – sofern Free-Tier erlaubt | ⏳ offen |
| 6 | **Geo-Ansatz** | PostGIS vs. einfaches lat/lng + Haversine | lat/lng für MVP (kein PostGIS overhead) | ⏳ offen |
| 7 | **WhatsApp-Provider** | Cloud API (Meta) vs. Twilio vs. Bird vs. 360dialog | Noch nicht entschieden (P1) | ⏳ P1 |

---

## 4.5 Reihenfolge der nächsten Schritte

1. **Auth-Entscheidung** treffen: Supabase Auth bestätigen oder Auth.js wählen
2. **Supabase-Projekt anlegen**: Org + Projekt im Dashboard (app.supabase.com) → Connection Strings kopieren
3. **`.env.local`** mit Supabase-Keys befüllen
4. **`prisma/schema.prisma`** anpassen (directUrl, ggf. cuid → uuid)
5. **`prisma migrate dev`** ausführen gegen Supabase `DIRECT_URL`
6. **`npm run db:check`** → Verbindung prüfen
7. **`npm run smoke:p0`** gegen Supabase-DB → P0-Flow grün
8. **`@supabase/ssr`** installieren + Auth-Infrastruktur aufbauen (Middleware, Login-Pages)
9. **Auth-Guards** in API-Routes aktivieren
10. **Stripe CLI** lokal starten + Webhook testen
11. **`vercel.json`** erstellen + Vercel-Projekt anlegen
12. **GitHub → Vercel** verknüpfen, Env-Vars in Vercel setzen
13. **Stripe Production Webhook** auf Vercel-URL registrieren
14. **Production Smoke-Test** durchführen

---

## Env-Vars Referenz (vollständig)

```env
# Datenbank (Supabase)
DATABASE_URL=postgresql://...?pgbouncer=true   # Transaction Pooler
DIRECT_URL=postgresql://...                     # Direct Connection (für Migrations)

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App
NEXT_PUBLIC_APP_URL=https://[dein-domain].vercel.app

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...
STRIPE_CONNECTED_ACCOUNT_ID=acct_...
STRIPE_PAYMENT_SUCCESS_URL=${NEXT_PUBLIC_APP_URL}/orders/{orderId}
STRIPE_PAYMENT_CANCEL_URL=${NEXT_PUBLIC_APP_URL}/checkout/{orderId}

# QR-Codes
QR_TOKEN_SECRET=<min-32-Zeichen-random>
QR_TOKEN_PEPPER=<min-32-Zeichen-random>

# Notifications (P1)
EMAIL_PROVIDER=
EMAIL_FROM=
WHATSAPP_PROVIDER=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_WEBHOOK_SECRET=
WHATSAPP_TEMPLATE_ORDER_CONFIRMED=
WHATSAPP_TEMPLATE_PICKUP_REMINDER=
WHATSAPP_TEMPLATE_ORDER_CHANGED=
```
