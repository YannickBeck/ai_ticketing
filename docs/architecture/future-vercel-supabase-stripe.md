# Future Step: Vercel, Supabase And Stripe

Status: Future Step / Not Current MVP Block

Diese Datei hält das spätere Zielsetup fest. Der aktuelle MVP-Block bleibt lokal lauffähig und DB-backed mit PostgreSQL, Prisma und Stripe-Testmodus. Vercel, Supabase und Stripe-Livebetrieb werden erst nach stabilem P0-E2E-Flow umgesetzt.

## Zielbild

| Baustein | Entscheidung |
| --- | --- |
| Hosting | Vercel für Next.js App Router, API Route Handlers und Preview Deployments |
| Auth | Supabase Auth als Identitätsprovider |
| Datenbank | Supabase Postgres als Cloud-Option, Prisma bleibt ORM |
| Payment | Stripe Connect mit Payment Element, Application Fee und Connected Accounts |
| Webhooks | Stripe Webhooks öffentlich über `/api/v1/webhooks/stripe` |

## Vercel

- Vercel ist das Zielhosting für die Next.js App Router Anwendung.
- Pull Requests bekommen Preview Deployments.
- Production Deployment erfolgt erst nach grünen Checks, erfolgreicher Staging-Abnahme und manueller Freigabe.
- Serverless-Laufzeiten müssen für Stripe Webhooks, Prisma-Verbindungen und geplante Jobs bewusst geprüft werden.
- Background-Jobs wie Reservierungsablauf und Pickup Reminder werden nicht implizit über Vercel Pages gelöst; dafür braucht es Vercel Cron oder einen separaten Worker.

## Supabase

- Supabase Auth liefert später die Identität und Session-Cookies.
- App-spezifische Rollen bleiben in der Prisma-`User`-Tabelle.
- Die lokale `User`-Zeile wird über ein eindeutiges Supabase Subject mit dem Auth-User verbunden.
- Supabase Postgres kann die Cloud-Datenbank stellen; Prisma Migrationen bleiben kontrollierter Release-Bestandteil.
- Lokale Entwicklung darf weiterhin ohne Supabase-Projekt möglich bleiben, solange `AUTH_DEMO_MODE=true` gesetzt ist.

## Stripe

- Stripe Connect bleibt die Payment-Zielarchitektur.
- Local und Staging nutzen Stripe Testmode.
- Production nutzt Live Keys erst nach erfolgreichem Staging-Test.
- Webhook Secrets sind pro Umgebung getrennt.
- Connected Accounts je Produzent werden später über Stripe Connect Onboarding gepflegt.
- Refunds und Service-Fee-Regeln müssen vor Livebetrieb fachlich und steuerlich freigegeben sein.

## Environment Mapping

| Variable | Local | Staging | Production |
| --- | --- | --- | --- |
| `DATABASE_URL` | Lokaler PostgreSQL | Supabase Postgres Staging | Supabase Postgres Production |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Vercel Preview/Staging URL | Production Domain |
| `NEXT_PUBLIC_SUPABASE_URL` | optional | Supabase Staging URL | Supabase Production URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | optional | Supabase Staging anon key | Supabase Production anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | nicht fuer Client | Secret in Vercel | Secret in Vercel |
| `STRIPE_SECRET_KEY` | Test Key | Test Key | Live Key |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI/Test Webhook | Staging Webhook | Production Webhook |
| `STRIPE_CONNECTED_ACCOUNT_ID` | Test Account | Test Connected Account | Echte Connected Accounts je Produzent |

## Nicht Jetzt

- Kein Vercel Deployment im aktuellen P0-Block.
- Kein Supabase-Projektzwang für lokale Entwicklung.
- Kein Stripe-Livebetrieb ohne Staging-Abnahme.
- Keine WhatsApp-Bestellung, kein WhatsApp-Chatbot und kein KI-Support.

## Voraussetzungen Vor Umsetzung

1. P0-E2E-Flow lokal stabil: Reservierung, Payment, QR und Pickup.
2. Prisma Migrationen sind committed und reproduzierbar.
3. Stripe Testmode Webhooks sind gegen Staging getestet.
4. Supabase Auth Mapping ist entschieden und dokumentiert.
5. Secrets je Umgebung sind getrennt und nicht im Repository.
6. Monitoring und Alerting für Payment Webhooks, QR-Scan-Fehler und DB-Verbindungen sind definiert.
