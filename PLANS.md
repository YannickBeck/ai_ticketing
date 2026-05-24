# Spargelstand-App Plans

## Source Of Truth

Diese Umsetzung basiert auf `Projektplan.md`, `README.md`, `docs/01-product-vision.md` bis `docs/22-open-questions.md`, `docs/features/whatsapp-notifications.md` und den Markdown-Exporten unter `docs/word/`.

## Ist-Zustand Vor Umsetzung

| Bereich | Zustand |
| --- | --- |
| Repository | Konzept-Repository ohne Git-Metadaten und ohne Codebasis |
| Dokumentation | Umfangreiche Produkt-, Architektur-, API-, Datenmodell-, Flow-, Test- und Roadmap-Dokumente vorhanden |
| Technischer Stack | In den Plänen empfohlen, aber noch nicht angelegt |
| Implementierung | Keine App, keine API, kein Prisma-Schema, keine Tests |
| WhatsApp | Fachlich spezifiziert als optionales P1-/Pilot-Feature |

## MVP-Ziel

Der MVP beweist den garantierten Reservierungsflow:

```text
Stand finden -> Verfügbarkeit sehen -> Menge und Abholfenster reservieren
-> digital bezahlen -> QR-Code erhalten -> am Stand abholen
-> Bestand und Order korrekt fortschreiben
```

## P0-Scope

| Modul | MVP-Verantwortung |
| --- | --- |
| Customer PWA | Standortsuche, Standdetails, Verfügbarkeit, Reservierung, Checkout, QR-Anzeige |
| Admin | Stände, Produkte, Bestand, Reservierungen, Nachfrage, einfache Lieferempfehlung |
| Staff | Offene Orders, QR-Scan, Fallback-Code, Pickup, Bestand, Out-of-Stock |
| Backend/API | REST Route Handler unter `/api/v1`, dünne Handler, Services als Domain-Layer |
| DB | PostgreSQL/Prisma mit User, Producer, Stand, Product, Inventory, Order, Payment, QRToken |
| Auth/RBAC | Rollen `customer`, `producer_admin`, `staff`, `platform_admin`; serverseitige Scope-Prüfung |
| Inventory | `available_quantity = stock_quantity - reserved_quantity - safety_buffer` |
| Payment | Stripe-Connect-Skeleton, Webhook-Signatur, Idempotenz, Statusmapping |
| QR | Signierte Tokens, Hash-Speicherung, Ablauf, One-Time-Use |

## P1/Pilot-Scope

| Modul | Pilot-Verantwortung |
| --- | --- |
| Notification Service | E-Mail/WhatsApp-Versandaufträge, Versandstatus, Fehlerlog |
| WhatsApp Opt-in | Freiwillige Einwilligung, Telefonnummer, Opt-out |
| WhatsApp Updates | Bestätigung, Abholerinnerung, sicherer QR-Link, Statusänderung |
| WhatsApp Webhooks | Delivery-Status idempotent verarbeiten, eingehende Nachrichten nur vorbereiten |
| Jobs | Abholerinnerung planen und fällige Notifications erzeugen |

## Nicht-Ziele

Keine vollständige WhatsApp-Bestellung, kein WhatsApp-Chatbot, keine KI-Beratung, keine POS-Integration, keine komplexe Buchhaltung, keine native Offline-App, keine produktionsreife Payment-Live-Schaltung.

## Pilot-Annahme

Für die erste Umsetzung gilt konservativ: 1 Pilotproduzent, 3-5 Stände, wenige Kernprodukte, manuelle Bestandspflege, Stripe-Testmodus, WhatsApp-Mock oder Sandbox.
