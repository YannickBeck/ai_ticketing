# Backlog

Der Backlog ist nach Epics strukturiert und auf einen ersten MVP-Pilot ausgerichtet. Prioritäten nutzen P0, P1 und P2. Komplexität wird grob als S, M oder L geschätzt.

## Definition of Done

Eine Aufgabe ist fertig, wenn:

1. Code implementiert und typisiert ist.
2. Serverseitige Validierung vorhanden ist.
3. RBAC geprüft ist, falls der Endpunkt geschützt ist.
4. Relevante Tests existieren.
5. Fehlerfälle behandelt werden.
6. UI-Zustände für Loading, Error und Empty State vorhanden sind.
7. Logs keine sensiblen Daten enthalten.
8. Funktion in Staging geprüft wurde.
9. Dokumentation oder API-Beispiele bei Bedarf aktualisiert wurden.

## Epic 1: Kunden-Discovery

| Task | Priorität | Komplexität | Abhängigkeiten |
| --- | --- | --- | --- |
| Standortfreigabe und manuelle Standortsuche | P0 | M | Projektsetup |
| Standliste nach Entfernung | P0 | M | StandService, Datenmodell |
| Kartenansicht mit Stand-Markern | P0 | M | Standdaten, Kartenanbieter |
| Filter nach Produkt und geöffneten Ständen | P0 | S | ProductService |
| Standdetailseite | P0 | M | StandService |
| Navigation-Link zu Karten-App | P1 | S | Stand-Koordinaten |

## Epic 2: Inventory Visibility

| Task | Priorität | Komplexität | Abhängigkeiten |
| --- | --- | --- | --- |
| Inventory-Datenmodell und Migration | P0 | M | Prisma Setup |
| Verfügbarkeitsberechnung | P0 | M | InventoryService |
| Produktliste je Stand | P0 | M | ProductService, InventoryService |
| Statuswerte anzeigen | P0 | S | UI-Komponenten |
| Sicherheitsbestand pflegen | P0 | S | Admin Inventory |
| Nächste Lieferung anzeigen | P1 | S | `next_delivery_at` |
| InventoryEvents speichern | P1 | M | InventoryService |

## Epic 3: Reservation Core

| Task | Priorität | Komplexität | Abhängigkeiten |
| --- | --- | --- | --- |
| Order- und OrderItem-Modell | P0 | M | Prisma |
| PickupSlot-Modell | P0 | S | Stand-Modell |
| Menge und Slot im Frontend wählen | P0 | M | Customer UI |
| Bestand transaktional prüfen | P0 | L | InventoryService |
| Menge temporär blockieren | P0 | L | InventoryService |
| Order Statusmodell | P0 | M | ReservationService |
| Reservierung ablaufen lassen | P0 | M | Cronjob |
| Storno-Basislogik | P1 | M | PaymentService |

## Epic 4: Payment

| Task | Priorität | Komplexität | Abhängigkeiten |
| --- | --- | --- | --- |
| Payment-Modell | P0 | S | Prisma |
| Stripe Checkout/Payment Intent erstellen | P0 | L | Stripe Setup |
| Service Fee berechnen | P0 | S | Geschäftsmodell |
| Stripe Webhook signiert verarbeiten | P0 | L | PaymentService |
| Payment Success bestätigt Order | P0 | M | ReservationService |
| Payment Failed gibt Bestand frei | P0 | M | InventoryService |
| Refund-Basis | P1 | M | PaymentService |
| Payment-Testmodus in Staging | P1 | S | DevOps |

## Epic 5: QR Pickup

| Task | Priorität | Komplexität | Abhängigkeiten |
| --- | --- | --- | --- |
| QRToken-Modell | P0 | S | Prisma |
| Signierte Token erzeugen | P0 | M | QRCodeService |
| Token gehasht speichern | P0 | S | QRCodeService |
| QR-Code nach Zahlung anzeigen | P0 | M | Payment Success |
| Staff QR-Scan UI | P0 | M | Staff UI |
| Token validieren | P0 | M | QRCodeService |
| Pickup bestätigen | P0 | L | InventoryService, ReservationService |
| Fallback-Codeeingabe | P1 | S | Order Number |

## Epic 6: Admin Dashboard

| Task | Priorität | Komplexität | Abhängigkeiten |
| --- | --- | --- | --- |
| Admin Layout und Guard | P0 | M | Auth |
| Standverwaltung | P0 | M | StandService |
| Produktverwaltung | P0 | M | ProductService |
| Bestandsverwaltung | P0 | L | InventoryService |
| Reservierungsliste | P0 | M | ReservationService |
| Dashboard-KPIs | P1 | M | Orders, Inventory |
| Lieferempfehlungen | P1 | M | DeliveryPlanningService |
| Umsatzübersicht | P1 | M | PaymentService |
| Mitarbeiterverwaltung | P1 | M | Auth/RBAC |

## Epic 7: Staff Interface

| Task | Priorität | Komplexität | Abhängigkeiten |
| --- | --- | --- | --- |
| Staff Layout und Guard | P0 | M | Auth, Staff-Zuordnung |
| Offene Bestellungen | P0 | M | ReservationService |
| QR-Scan-Seite | P0 | M | QRCodeService |
| Abholung bestätigen | P0 | L | Pickup Backend |
| Bestand aktualisieren | P0 | M | InventoryService |
| Out-of-Stock Button | P0 | S | InventoryService |
| Lieferung eingetroffen | P1 | S | InventoryEvent |

## Epic 8: Betrieb & Qualität

| Task | Priorität | Komplexität | Abhängigkeiten |
| --- | --- | --- | --- |
| Projektsetup Next.js/TypeScript | P0 | M | Keine |
| Prisma und PostgreSQL Setup | P0 | M | Keine |
| Auth Setup | P0 | M | Providerentscheidung |
| RBAC Middleware/Helper | P0 | M | Auth |
| CI Pipeline | P0 | M | Projektsetup |
| Staging Deployment | P0 | M | Hostingentscheidung |
| Monitoring und Error Tracking | P1 | M | Deployment |
| Backup-Konzept | P1 | S | Datenbank |
| E2E-Testbasis | P1 | M | Kernflows |
| Datenschutzseiten | P1 | S | Rechtliche Prüfung |

## Epic 9: WhatsApp Notifications

WhatsApp Notifications sind P1 für den Pilot. Der Epic ergänzt den bestehenden App/PWA-Flow, ersetzt ihn aber nicht.

| Task | Priorität | Komplexität | Abhängigkeiten |
| --- | --- | --- | --- |
| WhatsApp Opt-in im Checkout ergänzen | P1 | S | Customer Checkout, Datenschutztexte |
| Telefonnummer validieren und speichern | P1 | M | User-Modell, Validierung |
| Notification-Service vorbereiten | P1 | M | Backend Services, Order Events |
| WhatsApp Provider konfigurieren | P1 | M | Providerentscheidung, Secrets |
| Message Templates definieren | P1 | S | Produkttexte, Provider-Freigabe |
| Bestellbestätigung per WhatsApp versenden | P1 | M | Payment Success, NotificationService |
| Abholerinnerung per WhatsApp versenden | P1 | M | PickupSlot, Reminder Job |
| QR-Code-Link per WhatsApp versenden | P1 | M | QR-Code-Seite, sicherer Link |
| Notification-Logs speichern | P1 | M | Datenmodell, NotificationRepository |
| Fehlerstatus für nicht zugestellte Nachrichten erfassen | P1 | M | WhatsApp Webhook |
| WhatsApp-Abmeldung bzw. Deaktivierung ermöglichen | P1 | S | NotificationPreferences |
| Eingehende WhatsApp-Nachrichten vorbereiten | P2 | M | Webhook, Provider |
| Statusabfrage per WhatsApp | P2 | M | Order Lookup, Conversation-Regeln |
| Storno-Link per WhatsApp | P2 | M | Storno-Flow, sichere Links |
| Wiederbestellung per Link | P2 | M | Customer Reorder Flow |
| Conversational Commerce / vollständige Bestellung per WhatsApp | P3 | L | Bot-Konzept, Payment Links, Support-Prozess |

## Sprint 1 Planung

Ziel: Technisches Fundament und erste sichtbare Stand-/Produktdaten.

| Task | Epic | Priorität | Komplexität |
| --- | --- | --- | --- |
| Next.js/TypeScript Projektsetup | Betrieb & Qualität | P0 | M |
| Prisma und PostgreSQL einrichten | Betrieb & Qualität | P0 | M |
| Basisdatenmodell für User, Producer, Stand, Product, Inventory | Inventory Visibility | P0 | M |
| Auth-Grundlage und Rollenmodell | Betrieb & Qualität | P0 | M |
| StandService und Public Stand API | Kunden-Discovery | P0 | M |
| Produktliste je Stand API | Inventory Visibility | P0 | M |
| Customer Standliste UI | Kunden-Discovery | P0 | M |
| Admin Guard und Basislayout | Admin Dashboard | P0 | M |

Sprint-1-Ergebnis:

```text
Ein Admin kann Basisdaten vorbereiten,
ein Kunde kann Stände und Produkte sehen,
und die technische Grundlage für Reservierungen steht.
```

## Sprint 2 Planung

Ziel: Reservierungs- und Bestandskern ohne vollständigen Payment-Abschluss.

| Task | Epic | Priorität | Komplexität |
| --- | --- | --- | --- |
| Order, OrderItem und PickupSlot Modell | Reservation Core | P0 | M |
| InventoryService mit available_quantity | Inventory Visibility | P0 | M |
| Transaktionale Reservierungsprüfung | Reservation Core | P0 | L |
| Temporäre Bestandsblockierung | Reservation Core | P0 | L |
| Customer Reservierungsformular | Reservation Core | P0 | M |
| Order Detail für Kunde | Reservation Core | P0 | S |
| Admin Bestandsverwaltung | Admin Dashboard | P0 | L |
| Cronjob für abgelaufene Reservierungen | Reservation Core | P0 | M |

Sprint-2-Ergebnis:

```text
Ein Kunde kann Ware mit Menge und Zeitfenster reservieren,
das System blockiert Bestand korrekt,
und abgelaufene Reservierungen geben Bestand wieder frei.
```

## Abhängigkeiten

| Abhängigkeit | Blockiert |
| --- | --- |
| Auth-Entscheidung | Admin, Staff, Customer Orders |
| Datenmodell | Alle Services |
| InventoryService | Reservierung, Admin Bestand, Staff Bestand |
| PaymentService | QRToken-Erstellung nach Zahlung |
| QRCodeService | Staff Pickup |
| NotificationService | WhatsApp-Bestätigung, Abholerinnerung, Notification Logs |
| WhatsApp Providerentscheidung | Opt-in-Texte, Templates, Webhooks, Kostenmodell |
| Datenschutzfreigabe | Telefonnummer, WhatsApp Opt-in, Datenschutzhinweise |
| Hostingentscheidung | CI/CD, Staging, Monitoring |
| Gebührenmodell | Payment-Beträge und Dashboard-Umsatz |
