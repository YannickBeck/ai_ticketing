# DevOps und Deployment

Der MVP soll reproduzierbar lokal entwickelbar, über CI/CD deploybar und im Pilotbetrieb beobachtbar sein. Bevorzugte Zielplattform ist Azure App Service mit Azure Database for PostgreSQL.

## Lokale Entwicklungsumgebung

Empfohlene lokale Voraussetzungen:

| Tool | Zweck |
| --- | --- |
| Node.js LTS | Next.js und API |
| npm | Paketverwaltung |
| Docker Compose | Optionaler lokaler PostgreSQL-Start |
| PostgreSQL | Lokale Datenbank, alternativ via Docker Compose |
| PostGIS | Geo-Suche, falls lokal verfügbar |
| Prisma CLI | Migrationen und Client-Generierung |
| Stripe CLI | Lokale Webhook-Tests |
| Git | Versionsverwaltung |

Typischer Start:

```bash
npm install
cp .env.example .env.local
npm run db:up
npm run prisma:migrate
npm run prisma:seed
npm run smoke:p0
npm run dev
stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe
```

`npm run db:up` startet PostgreSQL über `docker-compose.yml` mit Datenbank `spargelstand_app`. Ohne Docker muss ein kompatibles lokales PostgreSQL unter der `DATABASE_URL` laufen.

`npm run smoke:p0` validiert den lokalen DB-backed Kernfluss ohne Stripe-Livebetrieb: Reservierung, Inventory-Hold, simuliertes Stripe-Success-Event, QR-Erzeugung, Staff-Scan und Pickup. Der Smoke-Test ist fuer lokale Datenbanken gedacht und blockiert nicht-lokale `DATABASE_URL`s ohne explizites Override.

## Environment Variables

Beispielhafte Variablen:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/spargelstand"
NEXTAUTH_URL="http://localhost:3000"
AUTH_SECRET="local-dev-secret"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CONNECT_CLIENT_ID="ca_..."

QR_TOKEN_SIGNING_SECRET="local-qr-secret"
EMAIL_API_KEY="..."
EMAIL_FROM="Spargelstand <noreply@example.com>"

WHATSAPP_PROVIDER="twilio-or-cloud-api"
WHATSAPP_API_TOKEN="..."
WHATSAPP_WEBHOOK_SECRET="..."
WHATSAPP_SENDER_ID="..."

APP_BASE_URL="http://localhost:3000"
```

Produktive Secrets dürfen nicht im Repository liegen. In Azure sollten sie über App Service Configuration und bevorzugt Azure Key Vault verwaltet werden.

## Datenbankmigrationen

| Umgebung | Vorgehen |
| --- | --- |
| Lokal | `npx prisma migrate dev` |
| CI | Migrationen prüfen und Prisma Client generieren |
| Staging | `npx prisma migrate deploy` gegen Staging-DB |
| Production | `npx prisma migrate deploy` nach Backup und Release-Freigabe |

Regeln:

1. Migrationen werden committet.
2. Keine manuellen Schemaänderungen in Production.
3. Vor produktiver Migration Backup erstellen oder Point-in-Time-Recovery aktiv haben.
4. Seed-Daten nur für lokale und Staging-Umgebungen nutzen.

Nach lokalen Migrationen sollte `npm run prisma:seed` und danach `npm run smoke:p0` laufen, damit die P0-E2E-Basis gegen echte Prisma-Queries geprueft ist.

## CI/CD

Empfohlene Pipeline:

| Schritt | Aufgabe |
| --- | --- |
| Install | Dependencies installieren |
| Lint | ESLint und Formatprüfung |
| Typecheck | TypeScript prüfen |
| Unit Tests | Domainlogik testen |
| Integration Tests | Services gegen Test-DB |
| Build | Next.js Build |
| Migration Check | Prisma Migrationen prüfen |
| Deploy Staging | Automatisch bei Merge in `main` oder `develop` |
| Deploy Production | Manuelle Freigabe für Pilotbetrieb |

## Staging und Production

| Umgebung | Zweck |
| --- | --- |
| Local | Entwicklung |
| Staging | Abnahmetests mit Testdaten und Stripe-Testmodus |
| Production | Pilotbetrieb mit echten Ständen und Zahlungen |

Trennung:

| Bereich | Regel |
| --- | --- |
| Datenbank | Separate DB je Umgebung |
| Stripe | Testmodus in Local/Staging, Live-Modus nur Production |
| WhatsApp | Sandbox/Testnummern in Local/Staging, produktive Sender nur Production |
| Secrets | Separate Secrets je Umgebung |
| E-Mail | Staging mit Testempfängern oder Sandbox |
| Monitoring | Eigene Environment-Tags |

## Deployment auf Azure App Service

Bevorzugtes Zielbild:

| Baustein | Azure-Dienst |
| --- | --- |
| Next.js Web/API | Azure App Service Linux, Node.js |
| Datenbank | Azure Database for PostgreSQL Flexible Server |
| Secrets | Azure Key Vault oder App Service Configuration |
| Monitoring | Application Insights |
| Storage | Azure Blob Storage für spätere Assets/Exports |
| Scheduler | Azure WebJobs, Azure Functions Timer oder Container Job |
| CI/CD | GitHub Actions |

Deployment-Schritte:

1. App Service erstellen.
2. PostgreSQL Flexible Server erstellen.
3. Netzwerkzugriff und SSL konfigurieren.
4. Environment Variables setzen.
5. Build- und Startkommando definieren.
6. Migrationen gegen Staging ausführen.
7. Smoke Tests ausführen.
8. Production Deployment manuell freigeben.

## Alternative Deployment-Optionen

| Option | Vorteil | Einschränkung |
| --- | --- | --- |
| Vercel | Sehr gute Next.js-Integration | DB-Connections und Webhook/Job-Modell bewusst planen |
| Render | Einfaches Fullstack-Hosting | Weniger Azure-native Integration |
| Railway | Sehr schneller MVP-Start | Production Governance prüfen |
| Azure Static Web Apps + Functions | Gute Azure-Integration | Next.js-SSR/API-Anforderungen prüfen |

## Future Target: Vercel + Supabase + Stripe

Der spätere Zielschritt ist separat in `docs/architecture/future-vercel-supabase-stripe.md` festgehalten. Vercel ist das Zielhosting für Next.js, Supabase liefert Auth und optional Postgres, Stripe Connect bleibt Payment-Zielarchitektur. Dieser Schritt ist ausdrücklich nicht Teil des aktuellen lokalen P0-Blocks und darf erst nach stabilem Staging-Test in Richtung Production gehen.

## Monitoring

| Signal | Zweck |
| --- | --- |
| API-Fehlerrate | Systemstabilität |
| API-Latenz | Bedienbarkeit |
| Payment Webhook Errors | Zahlungsrisiko |
| Checkout-Abbrüche | Conversion-Risiko |
| QR-Scan-Fehler | Standbetrieb |
| Inventory-Konflikte | Überbuchungsrisiko |
| Notification-Fehler | Nicht zugestellte E-Mail- oder WhatsApp-Nachrichten |
| WhatsApp Provider Errors | Provider-Konfiguration, Template- oder Zustellprobleme |
| Cronjob-Läufe | Ablauf blockierter Reservierungen |
| DB-Verbindungen | Skalierungsrisiko |

Alerts für den Pilot:

| Alert | Schwelle |
| --- | --- |
| Webhook-Verarbeitung schlägt fehl | Sofort |
| QR-Scan-Fehlerrate steigt stark | Innerhalb Öffnungszeiten |
| Datenbank nicht erreichbar | Sofort |
| Cronjob läuft nicht | Nach zwei verpassten Intervallen |
| Payment `pending` ungewöhnlich lange | Mehr als 15 Minuten |
| WhatsApp-Fehlerrate steigt | Mehrere fehlgeschlagene Nachrichten innerhalb kurzer Zeit |
| Pickup Reminder Job läuft nicht | Nach zwei verpassten Intervallen |

## Error Tracking

Empfohlen ist Application Insights oder Sentry.

Zu erfassen:

| Kontext | Beispiel |
| --- | --- |
| Request ID | Korrelation über API, Service und Logs |
| User Scope | Rolle und IDs nur datensparsam |
| Order ID | Bei Order- und Payment-Problemen |
| Provider Event ID | Bei Webhooks |
| Provider Message ID | Bei WhatsApp- und E-Mail-Versand |
| Stand ID | Bei Staff- und Inventory-Problemen |

Nicht erfassen:

| Nicht loggen | Grund |
| --- | --- |
| QRToken Klartext | Missbrauchsrisiko |
| Vollständige Telefonnummern | Datenschutz und Missbrauchsrisiko |
| Zahlungsdaten | Payment Compliance |
| Vollständige Webhook-Payloads mit sensiblen Daten | Datenschutz |
| Passwörter oder Auth Secrets | Sicherheitsrisiko |

## Backup-Konzept

| Daten | Backup |
| --- | --- |
| PostgreSQL | Tägliche Backups plus Point-in-Time-Recovery, wenn verfügbar |
| Prisma Migrationen | Git |
| Environment-Konfiguration | Dokumentiert, Secrets im Secret Store |
| QR-Codes | Reproduzierbar aus Stand-/Order-Daten, Bestelltoken nicht im Klartext |
| Logs | Aufbewahrung nach Datenschutzkonzept |

Restore-Test:

1. Staging-DB aus Backup wiederherstellen.
2. Migrationen prüfen.
3. Beispiel-Reservierung laden.
4. Admin- und Staff-Login prüfen.
5. QRToken-Status kontrollieren.

## Release-Checkliste

Vor Production Release:

1. Typecheck und Tests erfolgreich.
2. Migrationen in Staging erfolgreich.
3. Stripe Webhook in Staging getestet.
4. QR-Scan auf echtem Smartphone getestet.
5. Admin- und Staff-RBAC geprüft.
6. Backup oder PITR aktiv.
7. Monitoring und Alerts aktiv.
8. Rollback-Plan dokumentiert.
9. Pilotstände und Produkte eingerichtet.
10. Supportkontakt für Stand-Mitarbeiter verfügbar.
11. WhatsApp Provider in Staging getestet oder für Pilot bewusst deaktiviert.
12. WhatsApp-Templates, Opt-in-Texte und Opt-out-Prozess freigegeben.
