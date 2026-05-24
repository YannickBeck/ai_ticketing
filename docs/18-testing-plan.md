# Testplan

Die Teststrategie priorisiert den garantierten Reservierungsflow, Payment-Webhooks, QR-Code-Abholung und Bestandskonsistenz. Fehler in diesen Bereichen würden direkt den USP beschädigen.

## Teststrategie

| Testebene | Ziel |
| --- | --- |
| Unit Tests | Domainlogik isoliert prüfen |
| Integration Tests | Services mit Datenbank und Transaktionen prüfen |
| E2E Tests | Kritische Nutzerflows im Browser prüfen |
| Webhook Tests | Payment-Ereignisse idempotent und sicher verarbeiten |
| Concurrency Tests | Überbuchungen verhindern |
| Manuelle Pilot-Tests | Reale Standprozesse validieren |

## Unit Tests

| Modul | Testfälle |
| --- | --- |
| InventoryService | `available_quantity`, Statusberechnung, Sicherheitsbestand |
| ReservationService | Statusübergänge, Storno, Ablauf |
| PaymentService | Service-Fee-Berechnung, Payment-Statusmapping |
| QRCodeService | Token-Signatur, Hashing, Ablauf, One-Time-Use |
| NotificationService | Kanalpräferenzen, WhatsApp Opt-in, Template-Auswahl, Statuswechsel |
| DeliveryPlanningService | Lieferempfehlungsformel |
| Auth/RBAC | Rollen- und Scope-Prüfungen |

Beispiel Unit-Test-Fälle:

| Fall | Erwartung |
| --- | --- |
| Bestand 30, reserviert 8, Puffer 3 | Verfügbar 19 |
| Verfügbar 0 | Status `out_of_stock` |
| Verfügbar kleiner Schwelle | Status `low_stock` |
| Payment `succeeded` für `pending_payment` | Order wird `confirmed` |
| QRToken `used` | Zweite Nutzung wird abgelehnt |
| WhatsApp Opt-in deaktiviert | Keine WhatsApp-Notification wird erzeugt |
| Pickup Reminder fällig | Notification `pickup_reminder` wird geplant |

## Integration Tests

Integration Tests sollten gegen eine Test-PostgreSQL-Datenbank laufen.

| Test | Erwartung |
| --- | --- |
| Order erstellen | Inventory wird blockiert und OrderItems werden gespeichert |
| Payment Webhook Success | Payment `succeeded`, Order `confirmed`, QRToken erstellt |
| Payment Webhook Failed | Payment `failed`, Order beendet, Bestand freigegeben |
| Pickup bestätigen | Order `picked_up`, QRToken `used`, Bestand reduziert |
| Payment Success mit WhatsApp Opt-in | Notification `order_confirmed` wird erzeugt und Versandstatus gespeichert |
| Pickup Reminder Job | Fällige Reminder werden erzeugt, doppelte Reminder verhindert |
| WhatsApp Status Webhook | Notification wird idempotent auf `delivered` oder `failed` gesetzt |
| Admin Bestand ändern | InventoryEvent wird gespeichert |
| Staff Zugriff fremder Stand | `403 FORBIDDEN` |

## E2E Tests

Empfohlene E2E-Flows:

| Flow | Schritte |
| --- | --- |
| Kunde reserviert erfolgreich | Stand suchen, Produkt wählen, Menge, Slot, Zahlung simulieren, QR sehen |
| Payment schlägt fehl | Order erstellen, Payment Fail simulieren, Bestand freigegeben |
| Mitarbeiter holt ab | Staff Login, QR scannen, Bestellung prüfen, Pickup bestätigen |
| Kunde aktiviert WhatsApp | Checkout mit Telefonnummer, Opt-in, Payment, WhatsApp-Bestätigung und QR-Link prüfen |
| Admin pflegt Bestand | Admin Login, Bestand ändern, Kundensicht zeigt neue Verfügbarkeit |
| Ausverkauft | Staff setzt Produkt out-of-stock, Kunde kann nicht reservieren |

Für Payment sollte im E2E-Kontext Stripe-Testmodus oder ein Provider-Mock genutzt werden. Fachliche Webhook-Verarbeitung wird zusätzlich separat getestet.

## Payment Webhook Tests

| Testfall | Erwartung |
| --- | --- |
| Gültige Signatur | Event wird verarbeitet |
| Ungültige Signatur | Request wird abgelehnt |
| Doppelte Event ID | Zweite Verarbeitung ist no-op |
| Payment succeeded | Payment `succeeded`, Order `confirmed`, QRToken erstellt |
| Payment failed | Blockierung wird freigegeben |
| Refund succeeded | Payment `refunded`, Order `refunded` |
| Webhook nach Expiry | Statusübergang wird kontrolliert behandelt |

## WhatsApp- und Notification-Tests

| Testfall | Erwartung |
| --- | --- |
| Opt-in aktiv | WhatsApp-Notification wird für relevante Order Events erzeugt |
| Opt-in nicht aktiv | Kein WhatsApp-Versand, Bestellung funktioniert weiter |
| Telefonnummer unplausibel | Validierungsfehler oder Verifikationsanforderung |
| Provider sendet Erfolg | Notification wird `sent` |
| Provider meldet Zustellung | Notification wird `delivered` |
| Provider meldet Fehler | Notification wird `failed` und Admin sieht Fehler |
| Doppelte Provider Message ID | Zweite Verarbeitung ist no-op |
| QR-Link in WhatsApp | Link ist signiert/kurzlebig und enthält keinen QRToken-Klartext |
| Opt-out nach Bestellung | Keine weiteren WhatsApp-Nachrichten außer rechtlich erforderlicher Fallback-Kommunikation |

## QR-Code-Tests

| Testfall | Erwartung |
| --- | --- |
| Gültiger QRToken | Bestellung wird angezeigt |
| Abgelaufener QRToken | Fehler `RESERVATION_EXPIRED` oder QR-spezifischer Ablauf |
| Bereits verwendeter QRToken | Fehler `QR_TOKEN_ALREADY_USED` |
| Manipulierter Token | Fehler `FORBIDDEN` oder `VALIDATION_ERROR` |
| Token für falschen Stand | Fehler `FORBIDDEN` |
| Order nicht bezahlt | Fehler `PAYMENT_NOT_CONFIRMED` |
| Fallback-Code gültig | Bestellung im Staff-Kontext auffindbar |

## Inventory-Concurrency-Tests

Diese Tests sind kritisch für die Reservierungsgarantie.

| Szenario | Erwartung |
| --- | --- |
| Zwei parallele Reservierungen für letzte Menge | Nur eine Reservierung gewinnt |
| Checkout Timeout und Webhook gleichzeitig | Kein negativer Bestand, eindeutiger finaler Status |
| Doppelte Pickup-Bestätigung | Nur erste Bestätigung wirkt |
| Admin reduziert Bestand unter reservierte Menge | System warnt oder verhindert riskante Änderung |
| Staff setzt ausverkauft bei offenen Orders | Neue Reservierungen stoppen, offene Orders bleiben sichtbar |

## Rollenrechte-Tests

| Rolle | Test |
| --- | --- |
| Kunde | Kann fremde Order nicht lesen |
| Kunde | Kann Admin-Endpunkt nicht aufrufen |
| Spargelbauer/Admin | Kann fremden Produzenten nicht lesen oder ändern |
| Stand-Mitarbeiter | Kann fremde Stand-Orders nicht sehen |
| Stand-Mitarbeiter | Kann Preise nicht ändern |
| Plattformadmin | Kann Supportdaten sehen, Aktion wird auditiert |
| Webhook | Braucht keine Session, aber gültige Signatur |

## Manuelle Testfälle für Pilot

Vor Pilotstart sollten reale Geräte am Stand getestet werden.

| Testfall | Durchführung |
| --- | --- |
| QR-Scan bei Tageslicht | Smartphone am Stand nutzen |
| QR-Scan bei schlechter Verbindung | Netz drosseln oder schwaches Mobilnetz testen |
| Fallback-Code | QR-Code verdecken und Code eingeben |
| Bestandsupdate durch Mitarbeiter | Lieferung erfassen und Kundensicht prüfen |
| No-show | Abholfenster überschreiten und Prozess testen |
| Refund bei Lieferproblem | Supportfall simulieren |
| WhatsApp-Abholerinnerung | Reminder vor Abholfenster auf Testnummer prüfen |
| WhatsApp Opt-out | Deaktivierung testen und erneuten Versand verhindern |
| Stände mit unterschiedlichen Öffnungszeiten | Suche und Reservierbarkeit prüfen |
| Mehrere Kunden gleichzeitig | Parallele Reservierung testen |

## Abnahmetest-Checkliste

Das MVP ist testseitig abnahmebereit, wenn:

1. Reservierung, Zahlung und QR-Abholung als E2E-Flow funktionieren.
2. Bestände bei parallelen Reservierungen nicht überbucht werden.
3. Payment Webhooks signiert und idempotent verarbeitet werden.
4. QRToken nicht mehrfach genutzt werden können.
5. Rollenrechte für Kunde, Spargelbauer/Admin, Stand-Mitarbeiter und Plattformadmin getestet sind.
6. Cronjob für abgelaufene Reservierungen Bestand freigibt.
7. Admin kann Bestände pflegen und InventoryEvents sehen.
8. Staff kann QR-Code und Fallback-Code nutzen.
9. Refund- und Storno-Grundfälle funktionieren.
10. Monitoring zeigt API-, Payment- und Webhook-Fehler.
11. WhatsApp Opt-in/Opt-out funktioniert.
12. WhatsApp-Bestätigung und Abholerinnerung werden nur bei aktivem Opt-in versendet.
13. Notification Logs zeigen Versandstatus und Fehler.
14. Der komplette Bestellflow funktioniert ohne WhatsApp.

## Empfohlene Tools

| Zweck | Tool |
| --- | --- |
| Unit/Integration | Vitest oder Jest |
| API Tests | Supertest oder direkte Route-Handler-Tests |
| E2E | Playwright |
| Datenbank | Test-PostgreSQL per Docker oder CI-Service |
| Payment | Stripe CLI und Stripe Testmodus |
| WhatsApp | Provider-Sandbox oder Mock-Adapter für Template- und Webhook-Tests |
| Coverage | In CI erfassen, aber kritische Pfade priorisieren |
