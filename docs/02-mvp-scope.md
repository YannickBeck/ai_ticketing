# MVP-Scope

Das MVP konzentriert sich auf den Kernnutzen: Kunden reservieren Ware verbindlich und Produzenten können diese Reservierungen operativ erfüllen. Alles, was diesen Ablauf nicht direkt unterstützt, wird in Phase 2 verschoben.

## MVP-Funktionsumfang

| Bereich | Enthalten im MVP | Abgrenzung |
| --- | --- | --- |
| Standortsuche | Karte, Liste, Radiusfilter, Entfernung, Öffnungsstatus | Keine komplexe Routenplanung in der App |
| Standdetails | Adresse, Öffnungszeiten, Produkte, Status, Navigation-Link | Keine redaktionellen Profilseiten |
| Produktverfügbarkeit | Bestand, reservierte Menge, Sicherheitsbestand, Lieferhinweis | Keine Echtzeit-POS-Synchronisierung |
| Reservierung | Menge, Abholzeitfenster, Statusmodell, temporäre Blockierung | Kein Warenversand |
| Zahlung | Stripe Connect, Service Fee, Webhooks, Refund-Grundlogik | PayPal optional später |
| QR-Code-Abholung | Bestell-QR-Code, Scan, One-Time-Use, manueller Fallback-Code | Keine native Scanner-App |
| WhatsApp Order Updates | Opt-in, Telefonnummer, Bestellbestätigung, Abholerinnerung, sicherer Link zur Bestellung oder QR-Code-Seite | Kein WhatsApp-Bestellkanal und kein Chatbot |
| Admin-Dashboard | Stände, Produkte, Bestand, Reservierungen, Nachfrage, Umsätze, Lieferempfehlung | Kein Data Warehouse |
| Mitarbeiteransicht | Offene Bestellungen, QR-Scan, Abholung bestätigen, Bestand aktualisieren | Kein vollständiger Offline-Modus |
| Betrieb | Auth, RBAC, Logs, Monitoring, Backups, Staging/Production | Keine Enterprise-Mandantenarchitektur |

## P0 - Kritisch für MVP

| Feature | Beschreibung | Akzeptanzsignal |
| --- | --- | --- |
| Nutzerregistrierung und Login | Kunde, Spargelbauer/Admin, Stand-Mitarbeiter | Nutzer können rollenbasiert einloggen |
| Rollenrechte | Serverseitiges RBAC für alle geschützten Endpunkte | Fremde Stände und fremde Bestellungen sind nicht zugänglich |
| Standverwaltung | Standorte, Koordinaten, Öffnungszeiten, Status | Admin kann Stand anlegen und ändern |
| Produktverwaltung | Produkte, Einheiten, Preise, Sichtbarkeit | Admin kann Produktangebot pflegen |
| Standortsuche | Karte und Liste nach Entfernung | Kunde findet nahe geöffnete Stände |
| Verfügbarkeitsanzeige | Status je Produkt und Stand | Anzeige basiert auf verfügbarer Menge |
| Reservierung | Produkt, Menge, Stand, Abholzeitfenster | Bestellung wird als `pending_payment` erstellt |
| Bestandsblockierung | Reservierte Menge wird während Checkout blockiert | Parallele Kunden können Bestand nicht überbuchen |
| Payment | Digitale Zahlung per Stripe | Erfolgreicher Webhook bestätigt Bestellung |
| QR-Code-Bestellung | QRToken und QR-Code nach Zahlung | Kunde sieht abholbaren QR-Code |
| Mitarbeiteransicht | Offene Orders, Scan, Pickup | Mitarbeiter kann Abholung bestätigen |
| Admin-Dashboard | Stände, Produkte, Bestellungen, Bestände | Produzent sieht operative Übersicht |

## P1 - Wichtig für Pilot

| Feature | Beschreibung | Nutzen |
| --- | --- | --- |
| Lieferempfehlung | Regelbasierte Empfehlung nach Reservierungen, Bestand und Sicherheitsbestand | Produzent kann Nachlieferungen priorisieren |
| Nächste Lieferung | `next_delivery_at` je StandProduct | Kunden sehen Erwartung bei knapper Ware |
| Storno und Erstattung | Einfache Regeln für frühe Stornos, No-shows und Lieferprobleme | Reduziert Supportaufwand |
| E-Mail-Bestätigung | Bestell- und Zahlungsbestätigung | Kunde hat Backup neben QR-Code |
| WhatsApp-Benachrichtigungen | Opt-in im Checkout, Telefonnummer speichern, transaktionale Bestell-/Zahlungsbestätigung, Abholerinnerung und QR-Link | Erhöht Komfort, reduziert No-shows und Supportnachfragen |
| Notification Log | Versandstatus für E-Mail und WhatsApp speichern | Admins sehen fehlgeschlagene Benachrichtigungen |
| Umsatzübersicht | Umsatz, Service Fee und Payment-Status je Stand | Pilotmetriken werden messbar |
| Bestandsverlauf | Inventory Events für Updates, Reservierungen, Pickup und Storno | Nachvollziehbarkeit und Fehleranalyse |

## P2 - Phase 2

| Feature | Beschreibung | Grund für spätere Umsetzung |
| --- | --- | --- |
| Push-Benachrichtigungen | Wiederverfügbarkeit, Abholerinnerung | Nicht erforderlich für erste Reservierungsgarantie |
| POS-Integration | Automatische Bestandsupdates aus Kasse | Integrationsaufwand und Anbieterabhängigkeit |
| Analytics | Nachfrageprofile, Zeitreihen, Kohorten | Benötigt Pilotdaten |
| Digitale Quittungen | Download oder E-Mail mit steuerlichem Format | Kann nach Payment-Basis ergänzt werden |
| Buchhaltungs-Export | DATEV/CSV | Rechtlich und fachlich separat zu klären |
| Nachfrageprognose | Historisch, wetter- und eventbasiert | Ohne Daten nicht belastbar |
| Native Mitarbeiter-App | Offline-Modus, bessere Scanner-Performance | PWA reicht zum Pilot |
| Saisonale Produktwelten | Kürbis, Eier, Weihnachtsbäume | Nach Validierung des Grundmodells |
| Multi-Produzenten-Marktplatz | Offenes Onboarding vieler Betriebe | MVP kann mit wenigen Pilotproduzenten starten |
| Vollständige Bestellung per WhatsApp | Produktsuche, Warenkorb und Checkout im Chat | App/PWA bleibt im MVP der verbindliche Bestell- und Zahlungsort |
| Eingehende WhatsApp-Statusabfrage | Kunde fragt Bestellstatus per Nachricht ab | Nach stabiler Benachrichtigungsbasis sinnvoll |
| Conversational Commerce | Dialogbasierte Produktsuche, Wiederbestellung und Payment Link | Phase 2 nach validiertem Kernflow |

## Klare Abgrenzung von Phase 2

Phase 2 beginnt erst, wenn der End-to-End-MVP stabil funktioniert:

```text
Reservieren -> bezahlen -> QR erhalten -> am Stand abholen -> Bestand korrekt fortschreiben
```

Vorher werden keine komplexen Prognosen, POS-Integrationen, umfangreichen Exportformate, nativen Apps oder vollständigen WhatsApp-Bestellflows priorisiert. Diese Funktionen verbessern Skalierung und Komfort, ersetzen aber nicht den Nachweis der garantierten Reservierung.

## Akzeptanzkriterien für MVP-Abnahme

Das MVP ist abnahmefähig, wenn alle folgenden Punkte erfüllt sind:

1. Ein Kunde kann einen Stand in seiner Nähe finden.
2. Ein Kunde kann Produkte und Verfügbarkeit je Stand sehen.
3. Ein Kunde kann ein Produkt mit Menge und Abholfenster reservieren.
4. Der Bestand wird während der Zahlung blockiert.
5. Eine digitale Zahlung kann abgeschlossen werden.
6. Ein Payment Webhook setzt die Bestellung zuverlässig auf `confirmed`.
7. Nach Zahlung wird ein QRToken erzeugt und als QR-Code angezeigt.
8. Ein Stand-Mitarbeiter kann den QR-Code prüfen.
9. Eine Abholung kann bestätigt und auf `picked_up` gesetzt werden.
10. Der Bestand wird nach Abholung korrekt reduziert.
11. Fehlgeschlagene oder abgebrochene Zahlungen geben reservierte Mengen frei.
12. Abgelaufene Reservierungen werden automatisch auf `expired` gesetzt.
13. Der Spargelbauer/Admin kann Bestellungen, Bestände und Nachfrage je Stand sehen.
14. Eine einfache Lieferempfehlung wird angezeigt.
15. Stände, Produkte und Preise sind administrierbar.
16. Rollenrechte verhindern unberechtigte Zugriffe.
17. Payment Webhooks sind signiert und idempotent verarbeitet.
18. QRToken sind signiert, gehasht gespeichert, ablaufend und nur einmal verwendbar.
19. Ein Kunde kann WhatsApp-Benachrichtigungen aktivieren oder deaktivieren.
20. Die Telefonnummer wird validiert oder mindestens plausibilisiert.
21. Nach erfolgreicher Zahlung wird bei aktivem Opt-in eine WhatsApp-Bestätigung versendet.
22. Vor dem Abholfenster wird bei aktivem Opt-in eine WhatsApp-Erinnerung versendet.
23. WhatsApp-Nachrichten enthalten nur einen sicheren Link zur Bestellung oder QR-Code-Seite.
24. Versandstatus und Fehler werden im Notification Log gespeichert.
25. Fehlgeschlagene WhatsApp-Nachrichten sind für Admins sichtbar.
26. Bestellung, Zahlung und QR-Abholung funktionieren vollständig ohne WhatsApp.
