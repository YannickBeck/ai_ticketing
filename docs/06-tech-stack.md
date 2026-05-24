# Tech-Stack

Der MVP-Stack optimiert auf schnelle Umsetzung, klare Domainlogik und genug Stabilität für einen echten Pilotbetrieb mit Zahlungen und Abholprozessen. Die bevorzugte Umsetzung ist eine Next.js Web-App/PWA mit TypeScript, PostgreSQL, Prisma und Stripe Connect.

## Empfohlener MVP-Tech-Stack

| Ebene | Empfehlung | Begründung |
| --- | --- | --- |
| Web-App/PWA | Next.js | Eine Codebase für Kunde, Admin und Stand-Mitarbeiter, gute Serverfunktionen, PWA-fähig |
| Sprache | TypeScript | Typisierte Domainmodelle, weniger Fehler in Status- und API-Logik |
| Backend | Next.js API Routes/Route Handlers | Schnellster Weg für MVP, geringe Betriebs- und Integrationskomplexität |
| Alternative Backend-Option | NestJS | Sinnvoll bei wachsender API, mehreren Teams oder vielen Integrationen |
| Datenbank | PostgreSQL | Relationale Daten passen zu Orders, Payments, Inventar und Rollen |
| ORM | Prisma | Typisierte Queries, Migrationen, gute Entwicklergeschwindigkeit |
| Geo-Suche | PostGIS oder Latitude/Longitude-Radiusberechnung | PostGIS ist robust; einfache Geo-Suche reicht als Startfallback |
| Payment | Stripe Connect | Plattformgebühren, Produzentenauszahlung, Webhooks und Refunds |
| Optional Payment später | PayPal | Ergänzung für Kundenpräferenz, nicht MVP-kritisch |
| QR-Code | Serverseitige Generierung | Kontrolle über Tokens, Ablauf und One-Time-Use |
| Notification | Notification Service plus E-Mail- und WhatsApp-Provider | Transaktionale Bestellupdates ohne App/PWA-Kernflow zu ersetzen |
| WhatsApp | WhatsApp Business Platform / Cloud API oder Provider wie Twilio, Bird/MessageBird, 360dialog | Genehmigte Templates, Delivery Status und spätere Conversation-Erweiterung |
| Auth | Auth.js, Supabase Auth oder Auth0 | Schneller Start mit sicherer Session-Verwaltung |
| Hosting | Azure App Service bevorzugt | Solide Node.js-Bereitstellung, Azure PostgreSQL, Key Vault und Monitoring integrierbar |
| Alternative Hosting | Vercel, Render, Railway | Schnellere Deployments, weniger Infrastrukturarbeit |
| Monitoring | Azure Application Insights oder Sentry | Fehler, Performance und Webhook-Probleme sichtbar machen |
| E-Mail | Resend, SendGrid oder Mailgun | Bestell- und Zahlungsbestätigung |

### Notification und WhatsApp Provider

WhatsApp wird im MVP nicht als eigener Bestellkanal, sondern als optionaler Kommunikationskanal angebunden. Die technische Umsetzung sollte deshalb einfach bleiben: Ein Notification Service erzeugt Versandaufträge aus Order Events und delegiert an konkrete Provider.

| Entscheidung | Empfehlung |
| --- | --- |
| Providerstrategie | Adapter-Interface für E-Mail und WhatsApp, damit der Provider wechselbar bleibt |
| WhatsApp-Versand | Genehmigte Templates für Bestellbestätigung, Zahlungsbestätigung, Abholerinnerung, Statusänderung und Abholabschluss |
| Eingehende Nachrichten | Webhook technisch vorbereiten, im MVP nur loggen oder standardisiert beantworten |
| Kostenkontrolle | Maximal 2-3 WhatsApp-Nachrichten pro Bestellung im MVP einplanen |
| Datenschutz | Opt-in, Opt-out und minimale Speicherung der Telefonnummer |

## Stack-Entscheidungen

### Next.js als Web-App/PWA

Next.js ist für das MVP die pragmatischste Wahl, weil Kunden-App, Admin-Dashboard und Mitarbeiteransicht in einer Codebase entstehen können.

Konkrete Umsetzung:

| Bereich | Next.js-Nutzung |
| --- | --- |
| Customer | Öffentliche Routen für Karte, Standdetails und Reservierung |
| Admin | Geschützte Routen unter `/admin` |
| Staff | Mobile-first Routen unter `/staff` |
| API | Route Handlers unter `/api/v1` |
| Serverlogik | Domain Services unter `server/services` |

### TypeScript

TypeScript ist besonders wichtig für:

| Thema | Nutzen |
| --- | --- |
| Statuswerte | Verhindert falsche Order-, Payment-, Inventory- und Stand-Status |
| API-DTOs | Einheitliche Requests und Responses |
| Prisma | End-to-End-Typisierung von Datenbank bis Service |
| Rollenrechte | Klar modellierte Rollen und Scopes |

### Backend: Next.js API Routes oder NestJS

Empfehlung für MVP: Next.js API Routes/Route Handlers als modularer Monolith.

NestJS wird sinnvoll, wenn:

| Kriterium | Signal für NestJS |
| --- | --- |
| Teamgröße | Mehrere Backend-Entwickler arbeiten parallel |
| Integrationen | POS, Buchhaltung, Benachrichtigung und Analytics werden umfangreich |
| API-Oberfläche | Externe Partner-API wird wichtig |
| Hintergrundjobs | Viele Queues, Worker und Cron-Prozesse entstehen |

Für den ersten Pilot ist NestJS nicht zwingend. Die Servicegrenzen sollten aber so geschnitten sein, dass eine spätere Extraktion möglich bleibt.

### PostgreSQL und Prisma

PostgreSQL ist die beste MVP-Basis, weil Orders, OrderItems, Payments, QRToken, InventoryEvents und Rollen stark relational sind. Prisma reduziert Implementierungsaufwand und hält Migrationen nachvollziehbar.

Wichtige Datenbankanforderungen:

| Anforderung | Umsetzung |
| --- | --- |
| Reservierungs-Concurrency | Transaktionen und Locking auf Inventory-Zeilen |
| Geo-Suche | PostGIS-Indizes oder Radiusberechnung |
| Auditierbarkeit | InventoryEvent und PaymentEvent Tabellen |
| Idempotenz | Unique Constraint auf Provider Event IDs |
| Mandantentrennung | Indizes und Filter auf `producer_id` |

### PostGIS oder geobasierte Standortsuche

PostGIS ist bevorzugt, wenn die Zielumgebung es unterstützt. Für einen einfachen MVP kann auch mit `latitude`, `longitude` und Radiusberechnung gestartet werden.

Entscheidungskriterien:

| Option | Vorteile | Nachteile |
| --- | --- | --- |
| PostGIS | Saubere Geo-Queries, Indizes, Distanzsortierung | Setup etwas aufwändiger |
| Latitude/Longitude ohne PostGIS | Schnell, überall lauffähig | Weniger effizient und weniger exakt bei Wachstum |
| Externer Location-Service | Schneller Komfort | Anbieterabhängigkeit und laufende Kosten |

### Stripe Connect

Stripe Connect ist primär, weil das Geschäftsmodell Plattformgebühren und Produzentenauszahlungen benötigt. Die Plattformmarge entsteht über die Service Fee, nicht über Produktaufschläge.

MVP-Entscheidung:

| Punkt | Entscheidung |
| --- | --- |
| Zahlungsart | Stripe Checkout oder Payment Element |
| Plattformgebühr | Application Fee / Service Fee |
| Produzentenauszahlung | Connected Account |
| Refunds | Über PaymentService und dokumentierte Regeln |
| Webhooks | Signiert, idempotent, testbar mit Stripe CLI |

### Auth.js, Supabase Auth oder Auth0

Alle drei Optionen sind möglich. Die Entscheidung hängt stärker vom gewünschten Betrieb ab als vom MVP-Featureumfang.

| Option | Gut wenn | Einschränkung |
| --- | --- | --- |
| Auth.js | Next.js-first, volle Kontrolle, geringe externe Abhängigkeit | Mehr Eigenverantwortung bei E-Mail und Security-Details |
| Supabase Auth | Schneller Start, gute Postgres-Nähe | Plattformabhängigkeit |
| Auth0 | Reife Enterprise-Funktionen | Mehr Kosten und Konfiguration |

Empfehlung: Auth.js oder Supabase Auth für MVP. Auth0 nur, wenn Enterprise-Anforderungen früh relevant sind.

## Hosting

### Bevorzugt: Azure App Service

Azure App Service ist bevorzugt, wenn Azure als Zielplattform gesetzt ist oder Azure-Komponenten für Datenbank, Monitoring und Secrets genutzt werden sollen.

Azure-Zielbild:

| Baustein | Azure-Dienst |
| --- | --- |
| Web/API | Azure App Service Node.js |
| Datenbank | Azure Database for PostgreSQL |
| Secrets | Azure Key Vault |
| Storage | Azure Blob Storage |
| Monitoring | Application Insights |
| CI/CD | GitHub Actions oder Azure DevOps |

### Alternativen

| Hosting | Gut wenn | Einschränkung |
| --- | --- | --- |
| Vercel | Schnellste Next.js-Deployments | Backend-Laufzeit und DB-Connections bewusst planen |
| Render | Einfacher Fullstack-Betrieb | Weniger Azure-Integration |
| Railway | Sehr schnelle MVP-Umgebung | Produktionsbetrieb und Compliance prüfen |

## Entscheidungskriterien

| Entscheidung | Standardwahl | Wechselkriterium |
| --- | --- | --- |
| Frontend | Next.js PWA | Native App erst bei echtem Offline-/Scannerbedarf |
| Backend | Next.js modularer Monolith | NestJS bei wachsender Komplexität |
| DB | PostgreSQL | Kein Wechsel für MVP empfohlen |
| Geo | PostGIS | Fallback auf einfache Radiusberechnung bei Setup-Blocker |
| Payment | Stripe Connect | PayPal als Ergänzung bei Kundennachfrage |
| WhatsApp | Provider-Adapter | Direkte Cloud API oder externer Provider nach Kosten, Datenschutz und Betriebsaufwand wählen |
| Hosting | Azure App Service | Vercel bei maximaler Next.js-Geschwindigkeit |

## Nicht empfohlene MVP-Komplexität

| Ansatz | Warum nicht MVP |
| --- | --- |
| Microservices | Zu hoher Betriebsaufwand für Pilot |
| Event Sourcing für alle Domänen | InventoryEvent reicht für Nachvollziehbarkeit |
| Native Apps für alle Rollen | PWA genügt und ist schneller iterierbar |
| Vollständiger WhatsApp-Chatbot | Benachrichtigungen reichen für den Pilot; Bestellung bleibt in App/PWA |
| Conversational Commerce | Erst nach validiertem Reservierungs- und Payment-Flow sinnvoll |
| Data Warehouse | Erst nach Pilotdaten sinnvoll |
| Vollständige Offline-first Architektur | Technisch teuer, zunächst mit Fallback-Code abfedern |
