# Roadmap

Die MVP-Umsetzung ist für 10-14 Wochen geplant. Der Plan nimmt ein kleines Team an: Product Owner, UX/UI, Fullstack/Backend, QA anteilig und einen Pilot-Produzenten als Feedbackgeber.

## Entwicklungsphasen

| Phase | Zeitraum | Ziel |
| --- | --- | --- |
| Phase 0 Discovery | Woche 1-2 | Problem, Prozesse, Pilotannahmen und Gebührenmodell validieren |
| Phase 1 UX & technisches Fundament | Woche 3-4 | Klickdummy, Architektur, Datenmodell, Auth und Projektsetup |
| Phase 2 MVP-Core | Woche 5-9 | Reservierung, Payment, QR-Abholung, Inventory, Admin und Staff |
| Phase 3 Pilotvorbereitung | Woche 10-11 | Testdaten, echte Stände, Schulung, Monitoring und Fehlerfälle |
| Phase 4 Pilotbetrieb | Woche 12-14 | Livebetrieb mit 1 Produzent und 3-10 Ständen |
| Phase 5 Skalierung | Nach Pilot | Phase-2-Erweiterungen und mehrere Produzenten |

## Phase 0 Discovery - Woche 1-2

| Aufgabe | Deliverable |
| --- | --- |
| Produzenteninterviews | Operative Anforderungen |
| Kundeninterviews | Zahlungsbereitschaft Service Fee |
| Standprozesse beobachten | Abhol- und Bestandsprozess |
| Produktkategorien definieren | MVP-Sortiment |
| Zahlungsmodell validieren | Pilotgebührenmodell |
| Datenschutz- und Payment-Anforderungen prüfen | Risikoliste |
| MVP-Scope finalisieren | Priorisierter Backlog |

Meilenstein:

| Meilenstein | Erfolgskriterium |
| --- | --- |
| M1 Scope final | Backlog priorisiert und Pilotproduzent bestätigt |

## Phase 1 UX & technisches Fundament - Woche 3-4

| Aufgabe | Deliverable |
| --- | --- |
| Klickdummy Kunde | Reservierungsflow testbar |
| Klickdummy Admin | Bestandspflege testbar |
| Klickdummy Staff | QR-Scan-Prozess testbar |
| Datenmodell finalisieren | Prisma-Schema-Entwurf |
| API-Konzept finalisieren | `/api/v1` Endpunktstruktur |
| Auth & Rollen aufsetzen | Login und RBAC-Grundlage |
| Projektsetup | Next.js, TypeScript, Prisma, CI |
| Payment-Konzept testen | Stripe-Testintegration |

Meilenstein:

| Meilenstein | Erfolgskriterium |
| --- | --- |
| M2 Prototyp validiert | Kunde, Admin und Mitarbeiter verstehen Kernflow |

## Phase 2 MVP-Core - Woche 5-9

| Modul | Inhalt |
| --- | --- |
| Kunden-App | Karte, Liste, Standdetails, Produktverfügbarkeit |
| Reservierung | Menge, PickupSlot, Statusmodell, Bestand blockieren |
| Payment | Stripe Checkout/Payment Intent, Webhooks, Refund-Basis |
| QR-Code | QRToken, QR-Anzeige, QR-Scan |
| Notification | Basis-Notification-Service und E-Mail-Bestätigung |
| Admin | Stände, Produkte, Bestand, Bestellungen |
| Staff | Offene Orders, Scan, Pickup, Bestand |
| Inventory Engine | Blockieren, Freigeben, Reduzieren, InventoryEvents |
| E-Mail | Bestellbestätigung |

Meilensteine:

| Meilenstein | Zieltermin | Erfolgskriterium |
| --- | --- | --- |
| M3 Core Reservierung fertig | Ende Woche 7 | Bestellung ohne Payment blockiert Bestand korrekt |
| M4 Payment + QR fertig | Ende Woche 9 | Bezahlte Bestellung ist per QR abholbar |

## Phase 3 Pilotvorbereitung - Woche 10-11

| Aufgabe | Deliverable |
| --- | --- |
| Reale Stände einrichten | Pilotdaten in Staging/Production |
| Mitarbeiter-Onboarding | Kurze Bedienanleitung und Testlauf |
| QR-Codes drucken | Stand-Aufsteller |
| Payment-Test | End-to-End im Stripe-Testmodus und Live-Konfiguration |
| Fehlerfälle testen | Storno, Expiry, Payment Failed, QR doppelt |
| Monitoring einrichten | Alerts für Payment, QR, DB |
| WhatsApp Pilot-Setup | Providerentscheidung, Templates, Opt-in-Texte und Testnummern |
| UX-Fixes | Bedienbarkeit am Stand |

Meilenstein:

| Meilenstein | Erfolgskriterium |
| --- | --- |
| M5 Pilot-ready | Echte Stände eingerichtet, Team geschult, Monitoring aktiv |

## Phase 4 Pilotbetrieb - Woche 12-14

| Aufgabe | Deliverable |
| --- | --- |
| Livebetrieb mit 1 Produzent | Echte Transaktionen |
| 3-10 Stände testen | Standortvergleich |
| Tägliches Feedback sammeln | Priorisierte Verbesserungen |
| Reservierungsquote messen | Produkt-Market-Signal |
| Fehlbestände tracken | Garantiequalität |
| Lieferempfehlungen prüfen | Produzentennutzen |
| Supportfälle dokumentieren | Betriebsrisiken |
| WhatsApp Order Updates auswerten | Opt-in-Rate, Zustellfehler, No-show-Effekt |

Meilenstein:

| Meilenstein | Erfolgskriterium |
| --- | --- |
| M6 Pilot abgeschlossen | Live-Daten ausgewertet und Skalierungsentscheidung vorbereitet |

## Phase 5 Skalierung

Phase 5 startet nach einem erfolgreichen Pilot. Ziel ist nicht mehr nur Validierung, sondern wiederholbarer Betrieb mit mehreren Produzenten.

| Erweiterung | Nutzen |
| --- | --- |
| Push-Benachrichtigungen | Wiederverfügbarkeit und Abholerinnerungen |
| POS-Integration | Automatische Bestandsupdates |
| Analytics | Standort-, Produkt- und Uhrzeit-Auswertung |
| Digitale Quittungen | Besserer Kunden- und Supportprozess |
| Buchhaltungs-Export | DATEV/CSV für Produzenten |
| Nachfrageprognose | Bessere Liefermengenplanung |
| Native Mitarbeiter-App | Offline-Modus und stabilerer Scanner |
| Saisonale Produkte | Erdbeeren, Kürbis, Eier, Weihnachtsbäume |
| Multi-Produzenten-Onboarding | Skalierbarer Marktplatz |

## WhatsApp-Roadmap

WhatsApp wird stufenweise eingeführt, damit der P0-Kern aus Standortsuche, Verfügbarkeit, Reservierung, Payment, QR-Abholung und Inventory Engine nicht gefährdet wird.

### Phase MVP / Pilot P1

| Erweiterung | Ziel |
| --- | --- |
| WhatsApp Opt-in | Freiwillige Einwilligung im Checkout oder Konto |
| Telefonnummer speichern | Normalisiert und datensparsam |
| Bestellbestätigung | Transaktionale Nachricht nach bestätigter Zahlung |
| Abholerinnerung | Reminder vor dem Abholfenster |
| QR-Link | Sicherer Link zur Bestellung oder QR-Code-Seite |
| Notification Logs | Versandstatus und Fehler nachvollziehen |

### Phase 1.5

| Erweiterung | Ziel |
| --- | --- |
| Statusabfrage per WhatsApp | Kunde kann einfache Statusinformation anfordern |
| Storno-Link per WhatsApp | Link führt in App/PWA zu abgesichertem Storno-Flow |
| Wiederbestellen-Link | Schneller Einstieg in App/PWA für erneute Bestellung |
| Lieferverzögerung aktiv kommunizieren | Admin kann betroffene Kunden über Template informieren |

### Phase 2

| Erweiterung | Ziel |
| --- | --- |
| WhatsApp Bot für Produktsuche | Dialogbasierte Suche nach Stand und Produkt |
| Conversational Ordering | Bestellung im Chat vorbereiten |
| Zahlung per Payment Link aus WhatsApp | Checkout bleibt über Payment Provider abgesichert |
| Wiederverfügbarkeitsbenachrichtigung | Kunden bei neuer Ware informieren |
| KI-gestützte Antwortlogik | Support und Beratung nach Datenbasis |
| CRM- oder Support-Integration | Gespräche und Supportfälle zentral bearbeiten |

## Zeitplan 10-14 Wochen

```text
Woche 1-2   Discovery, Pilotannahmen, Scope
Woche 3-4   UX, Datenmodell, API, Auth, Projektsetup
Woche 5-7   Customer Discovery, Inventory, Reservation Core
Woche 8-9   Payment, QR, Admin, Staff
Woche 10-11 Pilotvorbereitung, Tests, Monitoring, Schulung
Woche 12-14 Pilotbetrieb und Auswertung
```

## Erfolgskriterien für Skalierungsentscheidung

| KPI | Ziel |
| --- | --- |
| Erfolgreiche Reservierungen | Mehr als 100 im Pilot |
| Pickup-Erfolgsquote | Mehr als 95 % |
| Beschwerden wegen Nichtverfügbarkeit | Nahe 0 |
| Service-Fee-Akzeptanz | Durch echte Zahlungen validiert |
| Mitarbeiterakzeptanz | Positives Feedback im Standbetrieb |
| Produzentennutzen | Lieferentscheidungen durch Reservierungsdaten verbessert |
| Technische Stabilität | Payment und QR ohne kritische Ausfälle |
